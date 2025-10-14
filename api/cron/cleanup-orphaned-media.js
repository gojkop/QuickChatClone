// api/cron/cleanup-orphaned-media.js
// Runs daily to clean up orphaned media:
// 1. Media assets not associated with any question or answer
// 2. Profile pictures not referenced in any expert_profile
// 3. Attachments not referenced in any answer

import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { sendEmail } from '../lib/zeptomail.js';
import { getCronFailureTemplate } from '../lib/email-templates/cron-failure.js';

/**
 * Send failure notification email to admin
 */
async function sendFailureNotification(error, context = {}) {
  try {
    const { subject, htmlBody, textBody } = getCronFailureTemplate({
      jobName: 'Cleanup Orphaned Media',
      errorMessage: error.message || String(error),
      timestamp: new Date().toISOString(),
      details: context,
    });

    await sendEmail({
      to: 'gojkop@gmail.com',
      toName: 'Admin',
      subject,
      htmlBody,
      textBody,
    });

    console.log('✅ Failure notification email sent to gojkop@gmail.com');
  } catch (emailError) {
    console.error('❌ Failed to send failure notification email:', emailError);
    // Don't throw - we don't want email failures to mask the original error
  }
}

export default async function handler(req, res) {
  // Verify cron job authentication
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const XANO_BASE_URL = process.env.XANO_BASE_URL;
  const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  const CLOUDFLARE_R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY;
  const CLOUDFLARE_R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY;
  const CLOUDFLARE_R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET;
  const CLOUDFLARE_R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  try {
    console.log('🧹 Starting comprehensive orphaned media cleanup...');
    console.log('');

    // Initialize R2 client for deletions
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET_KEY,
      },
    });

    // ============================================================
    // Fetch all media data from Xano (one call for everything)
    // ============================================================
    const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
    const internalEndpoint = `${XANO_PUBLIC_API_URL}/internal/media`;

    console.log('📡 Fetching all media data from:', internalEndpoint);
    console.log('📡 Using API Key:', XANO_INTERNAL_API_KEY ? 'Present' : 'Missing');

    const mediaResponse = await fetch(`${internalEndpoint}?x_api_key=${XANO_INTERNAL_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Xano response status:', mediaResponse.status);

    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      console.error('❌ Xano error response:', errorText);
      throw new Error(`Failed to fetch media data from Xano: ${mediaResponse.status} - ${errorText}`);
    }

    const mediaData = await mediaResponse.json();
    const allMedia = mediaData.media || [];
    const allAvatars = mediaData.avatars || [];
    const allQuestionAttachments = mediaData.question_attachments || [];
    const allAnswerAttachments = mediaData.answer_attachments || [];

    console.log(`Found ${allMedia.length} media assets, ${allAvatars.length} avatar URLs, ${allQuestionAttachments.length} question attachments, and ${allAnswerAttachments.length} answer attachments`);
    console.log('');

    // ============================================================
    // PART 1: Clean up orphaned media_assets
    // ============================================================
    console.log('📦 PART 1: Cleaning up orphaned media assets...');
    console.log('This runs in two directions:');
    console.log('  1A. Check DB → Cloudflare: Validate DB records and delete orphaned ones');
    console.log('  1B. Check Cloudflare → DB: Find files not in DB and delete them');
    console.log('');

    let mediaDeletedCount = 0;
    let mediaErrorCount = 0;

    // ============================================================
    // PART 1A: Database → Cloudflare (validate DB records)
    // ============================================================
    console.log('📋 Part 1A: Checking database records for orphaned media...');

    // Calculate cutoff time (48 hours ago)
    const cutoffDate = new Date(Date.now() - (48 * 60 * 60 * 1000));

    // Filter for orphaned media (older than 48 hours, not associated with questions/answers)
    for (const media of allMedia) {
      const createdAt = new Date(media.created_at);

      // Check if older than cutoff
      if (createdAt > cutoffDate) {
        continue; // Skip recent uploads
      }

      // Check if media is orphaned
      let isOrphaned = false;

      if (!media.owner_type || !media.owner_id) {
        // No owner association at all
        isOrphaned = true;
      } else if (media.owner_type === 'question') {
        // Verify question still exists
        const questionResponse = await fetch(`${XANO_BASE_URL}/question/${media.owner_id}`, {
          headers: { 'X-API-Key': XANO_INTERNAL_API_KEY },
        });
        if (!questionResponse.ok) {
          isOrphaned = true; // Question doesn't exist
        }
      } else if (media.owner_type === 'answer') {
        // Verify answer still exists
        const answerResponse = await fetch(`${XANO_BASE_URL}/answer/${media.owner_id}`, {
          headers: { 'X-API-Key': XANO_INTERNAL_API_KEY },
        });
        if (!answerResponse.ok) {
          isOrphaned = true; // Answer doesn't exist
        }
      }

      // Skip if not orphaned
      if (!isOrphaned) {
        continue;
      }

      // This media is orphaned - delete it
      console.log(`Deleting orphaned media: ${media.id} (asset: ${media.asset_id}, provider: ${media.provider})`);

      try {
        // 1. Delete from Cloudflare (Stream or R2)
        if (media.provider === 'cloudflare_stream' && media.asset_id) {
          // Delete from Cloudflare Stream (videos)
          const streamDeleteUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${media.asset_id}`;

          const streamResponse = await fetch(streamDeleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
            },
          });

          if (streamResponse.ok) {
            console.log(`✅ Deleted from Cloudflare Stream: ${media.asset_id}`);
          } else {
            console.warn(`⚠️  Failed to delete from Stream: ${media.asset_id}`, await streamResponse.text());
          }
        } else if (media.provider === 'cloudflare_r2' && media.asset_id) {
          // Delete from Cloudflare R2 (audio/attachments)
          // asset_id in R2 is the key/path in the bucket
          try {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: CLOUDFLARE_R2_BUCKET,
                Key: media.asset_id,
              })
            );
            console.log(`✅ Deleted from Cloudflare R2: ${media.asset_id}`);
          } catch (r2Error) {
            console.warn(`⚠️  Failed to delete from R2: ${media.asset_id}`, r2Error.message);
          }
        }

        // 2. Delete from Xano database via internal endpoint
        const xanoDeleteEndpoint = `${XANO_PUBLIC_API_URL}/internal/media_asset`;
        const xanoDeleteResponse = await fetch(`${xanoDeleteEndpoint}?x_api_key=${XANO_INTERNAL_API_KEY}&media_asset_id=${media.id}`, {
          method: 'DELETE',
        });

        if (xanoDeleteResponse.ok) {
          mediaDeletedCount++;
          console.log(`✅ Deleted from Xano database: ${media.id}`);
        } else {
          console.warn(`⚠️  Failed to delete from Xano: ${media.id}`);
          mediaErrorCount++;
        }

      } catch (deleteError) {
        console.error(`❌ Error deleting media ${media.id}:`, deleteError);
        mediaErrorCount++;
      }
    }

    console.log('Part 1A complete:', { deleted: mediaDeletedCount, errors: mediaErrorCount });
    console.log('');

    // ============================================================
    // PART 1B: Cloudflare → Database (find files not in DB)
    // ============================================================
    console.log('☁️  Part 1B: TEMPORARILY DISABLED for safety');
    console.log('⚠️  This check has been disabled after deleting valid files');
    console.log('⚠️  Needs investigation before re-enabling');

    let cloudflareOrphanedCount = 0;

    // TEMPORARILY DISABLED - DO NOT RUN
    if (false) {

    // Build sets of known asset_ids from database
    const knownStreamAssets = new Set();
    const knownR2AudioAssets = new Set();

    for (const media of allMedia) {
      if (media.asset_id) {
        if (media.provider === 'cloudflare_stream') {
          knownStreamAssets.add(media.asset_id);
        } else if (media.provider === 'cloudflare_r2') {
          knownR2AudioAssets.add(media.asset_id);
        }
      }
    }

    console.log(`Database has ${knownStreamAssets.size} Stream videos and ${knownR2AudioAssets.size} R2 audio files`);

    // SAFETY CHECK: If database is empty or suspiciously small, skip Part 1B
    if (allMedia.length === 0) {
      console.error('⚠️  SAFETY CHECK FAILED: No media assets in database!');
      console.error('⚠️  Skipping Part 1B to prevent accidental deletion of all Cloudflare files');
      console.error('⚠️  This could indicate a problem with the database query or endpoint');
      mediaErrorCount++;
    } else if (knownStreamAssets.size === 0 && knownR2AudioAssets.size === 0) {
      console.warn('⚠️  WARNING: Database has media records but no asset_ids found');
      console.warn('⚠️  Skipping Part 1B to be safe');
    } else {

    // Check Cloudflare Stream for orphaned videos
    console.log('📡 Listing all videos in Cloudflare Stream...');
    try {
      const streamListUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?per_page=1000`;

      const streamListResponse = await fetch(streamListUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        },
      });

      if (streamListResponse.ok) {
        const streamData = await streamListResponse.json();
        const streamVideos = streamData.result || [];

        console.log(`Found ${streamVideos.length} videos in Cloudflare Stream`);

        for (const video of streamVideos) {
          const videoUid = video.uid;

          // Skip if this video exists in database
          if (knownStreamAssets.has(videoUid)) {
            continue;
          }

          // This video is not in database - delete it
          console.log(`Deleting orphaned Stream video not in DB: ${videoUid}`);

          try {
            const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}`;
            const deleteResponse = await fetch(deleteUrl, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
              },
            });

            if (deleteResponse.ok) {
              cloudflareOrphanedCount++;
              console.log(`✅ Deleted orphaned Stream video: ${videoUid}`);
            } else {
              console.warn(`⚠️  Failed to delete Stream video ${videoUid}:`, await deleteResponse.text());
              mediaErrorCount++;
            }
          } catch (deleteError) {
            console.error(`❌ Error deleting Stream video ${videoUid}:`, deleteError.message);
            mediaErrorCount++;
          }
        }
      } else {
        console.warn('⚠️  Failed to list Stream videos:', await streamListResponse.text());
      }
    } catch (streamError) {
      console.error('❌ Error listing Stream videos:', streamError.message);
      mediaErrorCount++;
    }

    // Check R2 for orphaned audio files
    console.log('📡 Listing all audio files in R2...');
    try {
      const audioListCommand = new ListObjectsV2Command({
        Bucket: CLOUDFLARE_R2_BUCKET,
        Prefix: 'audio/',
      });

      const audioR2Response = await r2Client.send(audioListCommand);
      const audioFiles = audioR2Response.Contents || [];

      console.log(`Found ${audioFiles.length} audio files in R2`);

      for (const file of audioFiles) {
        const key = file.Key;

        // Skip the audio/ folder itself
        if (key === 'audio/' || key === 'audio') {
          continue;
        }

        // Extract the key as the asset_id (it's stored as the full path in media_assets)
        const assetId = key;

        // Skip if this file exists in database
        if (knownR2AudioAssets.has(assetId)) {
          continue;
        }

        // This audio file is not in database - delete it
        console.log(`Deleting orphaned R2 audio not in DB: ${key}`);

        try {
          await r2Client.send(
            new DeleteObjectCommand({
              Bucket: CLOUDFLARE_R2_BUCKET,
              Key: key,
            })
          );
          cloudflareOrphanedCount++;
          console.log(`✅ Deleted orphaned R2 audio: ${key}`);
        } catch (deleteError) {
          console.error(`❌ Error deleting R2 audio ${key}:`, deleteError.message);
          mediaErrorCount++;
        }
      }
    } catch (r2Error) {
      console.error('❌ Error listing R2 audio files:', r2Error.message);
      mediaErrorCount++;
    }

      console.log('Part 1B complete:', { deletedFromCloudflare: cloudflareOrphanedCount });
    } // End of safety check else block
    } // End of TEMPORARILY DISABLED block

    console.log('');
    console.log('Part 1 TOTAL:', {
      deletedFromDB: mediaDeletedCount,
      deletedFromCloudflare: cloudflareOrphanedCount,
      total: mediaDeletedCount + cloudflareOrphanedCount,
      errors: mediaErrorCount
    });
    console.log('');

    // ============================================================
    // PART 2: Clean up orphaned profile pictures
    // ============================================================
    console.log('🖼️  PART 2: Cleaning up orphaned profile pictures...');

    let profileDeletedCount = 0;
    let profileErrorCount = 0;
    let profileSkippedCount = 0;

    // Step 1: List all profile pictures in R2
    console.log('📡 Listing profile pictures in R2...');

    const listCommand = new ListObjectsV2Command({
      Bucket: CLOUDFLARE_R2_BUCKET,
      Prefix: 'profiles/',
    });

    const r2Response = await r2Client.send(listCommand);
    const r2Files = r2Response.Contents || [];

    console.log(`Found ${r2Files.length} profile pictures in R2`);

    if (r2Files.length > 0) {
      // Step 2: Build set of active files from avatar URLs (already fetched)
      console.log(`Processing ${allAvatars.length} avatar URLs from Xano...`);

      const activeFiles = new Set();

      for (const record of allAvatars) {
        if (record.avatar_url && record.avatar_url.includes('/profiles/')) {
          // Extract the path after the domain
          // URL: https://pub-xxx.r2.dev/profiles/123456-abc.webp
          // Want: profiles/123456-abc.webp
          const urlParts = record.avatar_url.split('/profiles/');
          if (urlParts.length === 2) {
            const fileName = `profiles/${urlParts[1]}`;
            activeFiles.add(fileName);
          }
        }
      }

      console.log(`Extracted ${activeFiles.size} active profile picture paths`);

      // Step 3: Compare and delete orphaned profile pictures
      for (const file of r2Files) {
        const key = file.Key;

        // Skip if this file is referenced in Xano
        if (activeFiles.has(key)) {
          profileSkippedCount++;
          continue;
        }

        // Skip the profiles/ folder itself
        if (key === 'profiles/' || key === 'profiles') {
          profileSkippedCount++;
          continue;
        }

        // This file is orphaned - delete it
        console.log(`Deleting orphaned profile picture: ${key}`);

        try {
          await r2Client.send(
            new DeleteObjectCommand({
              Bucket: CLOUDFLARE_R2_BUCKET,
              Key: key,
            })
          );
          profileDeletedCount++;
          console.log(`✅ Deleted: ${key}`);
        } catch (deleteError) {
          console.error(`❌ Error deleting ${key}:`, deleteError.message);
          profileErrorCount++;
        }
      }
    }

    console.log('Part 2 complete:', {
      total: r2Files.length,
      deleted: profileDeletedCount,
      skipped: profileSkippedCount,
      errors: profileErrorCount
    });
    console.log('');

    // ============================================================
    // PART 3: Clean up orphaned attachments
    // ============================================================
    console.log('📎 PART 3: Cleaning up orphaned attachments...');

    let attachmentDeletedCount = 0;
    let attachmentErrorCount = 0;
    let attachmentSkippedCount = 0;

    // Step 1: List all attachments in R2
    console.log('📡 Listing attachments in R2...');

    const attachmentListCommand = new ListObjectsV2Command({
      Bucket: CLOUDFLARE_R2_BUCKET,
      Prefix: 'question-attachments/',
    });

    const attachmentR2Response = await r2Client.send(attachmentListCommand);
    const attachmentR2Files = attachmentR2Response.Contents || [];

    console.log(`Found ${attachmentR2Files.length} attachment files in R2`);

    if (attachmentR2Files.length > 0) {
      // Step 2: Build set of active attachment files from question and answer records
      console.log(`Processing ${allQuestionAttachments.length} question attachments and ${allAnswerAttachments.length} answer attachments from Xano...`);

      const activeAttachmentFiles = new Set();

      // Process question attachments
      for (const record of allQuestionAttachments) {
        if (record.attachments) {
          try {
            // Parse the JSON string to get attachment array
            const attachmentsArray = typeof record.attachments === 'string'
              ? JSON.parse(record.attachments)
              : record.attachments;

            if (Array.isArray(attachmentsArray)) {
              for (const attachment of attachmentsArray) {
                if (attachment.url && attachment.url.includes('/question-attachments/')) {
                  // Extract the path after the domain
                  // URL: https://pub-xxx.r2.dev/question-attachments/123-file.pdf
                  // Want: question-attachments/123-file.pdf
                  const urlParts = attachment.url.split('/question-attachments/');
                  if (urlParts.length === 2) {
                    const fileName = `question-attachments/${urlParts[1]}`;
                    activeAttachmentFiles.add(fileName);
                  }
                }
              }
            }
          } catch (parseError) {
            console.warn(`⚠️  Failed to parse question attachments JSON:`, parseError.message);
          }
        }
      }

      // Process answer attachments
      for (const record of allAnswerAttachments) {
        if (record.attachments) {
          try {
            // Parse the JSON string to get attachment array
            const attachmentsArray = typeof record.attachments === 'string'
              ? JSON.parse(record.attachments)
              : record.attachments;

            if (Array.isArray(attachmentsArray)) {
              for (const attachment of attachmentsArray) {
                if (attachment.url && attachment.url.includes('/question-attachments/')) {
                  // Extract the path after the domain
                  // URL: https://pub-xxx.r2.dev/question-attachments/123-file.pdf
                  // Want: question-attachments/123-file.pdf
                  const urlParts = attachment.url.split('/question-attachments/');
                  if (urlParts.length === 2) {
                    const fileName = `question-attachments/${urlParts[1]}`;
                    activeAttachmentFiles.add(fileName);
                  }
                }
              }
            }
          } catch (parseError) {
            console.warn(`⚠️  Failed to parse answer attachments JSON:`, parseError.message);
          }
        }
      }

      console.log(`Extracted ${activeAttachmentFiles.size} active attachment paths (from both questions and answers)`);

      // Step 3: Compare and delete orphaned attachment files
      for (const file of attachmentR2Files) {
        const key = file.Key;

        // Skip if this file is referenced in Xano
        if (activeAttachmentFiles.has(key)) {
          attachmentSkippedCount++;
          continue;
        }

        // Skip the question-attachments/ folder itself
        if (key === 'question-attachments/' || key === 'question-attachments') {
          attachmentSkippedCount++;
          continue;
        }

        // This file is orphaned - delete it
        console.log(`Deleting orphaned attachment: ${key}`);

        try {
          await r2Client.send(
            new DeleteObjectCommand({
              Bucket: CLOUDFLARE_R2_BUCKET,
              Key: key,
            })
          );
          attachmentDeletedCount++;
          console.log(`✅ Deleted: ${key}`);
        } catch (deleteError) {
          console.error(`❌ Error deleting ${key}:`, deleteError.message);
          attachmentErrorCount++;
        }
      }
    }

    console.log('Part 3 complete:', {
      total: attachmentR2Files.length,
      deleted: attachmentDeletedCount,
      skipped: attachmentSkippedCount,
      errors: attachmentErrorCount
    });
    console.log('');

    // ============================================================
    // Summary and notifications
    // ============================================================
    const totalMediaDeleted = mediaDeletedCount + cloudflareOrphanedCount;
    const totalDeleted = totalMediaDeleted + profileDeletedCount + attachmentDeletedCount;
    const totalErrors = mediaErrorCount + profileErrorCount + attachmentErrorCount;

    console.log('🎉 All cleanup complete:', {
      mediaAssets: {
        deletedFromDB: mediaDeletedCount,
        deletedFromCloudflare: cloudflareOrphanedCount,
        total: totalMediaDeleted,
        errors: mediaErrorCount
      },
      profilePictures: { deleted: profileDeletedCount, errors: profileErrorCount },
      attachments: { deleted: attachmentDeletedCount, errors: attachmentErrorCount },
      totals: { deleted: totalDeleted, errors: totalErrors }
    });

    // Send warning email if there were significant errors
    if (totalErrors > 0 && totalErrors >= totalDeleted * 0.5) {
      // More than 50% error rate is concerning
      await sendFailureNotification(
        new Error(`High error rate during cleanup: ${totalErrors} errors, ${totalDeleted} deleted`),
        {
          mediaAssets: {
            deletedFromDB: mediaDeletedCount,
            deletedFromCloudflare: cloudflareOrphanedCount,
            total: totalMediaDeleted,
            errors: mediaErrorCount
          },
          profilePictures: { deleted: profileDeletedCount, errors: profileErrorCount },
          attachments: { deleted: attachmentDeletedCount, errors: attachmentErrorCount },
          totals: { deleted: totalDeleted, errors: totalErrors },
          errorRate: `${Math.round((totalErrors / (totalDeleted + totalErrors)) * 100)}%`,
        }
      );
    }

    return res.status(200).json({
      success: true,
      mediaAssets: {
        deletedFromDB: mediaDeletedCount,
        deletedFromCloudflare: cloudflareOrphanedCount,
        total: totalMediaDeleted,
        errors: mediaErrorCount,
      },
      profilePictures: {
        deleted: profileDeletedCount,
        errors: profileErrorCount,
      },
      attachments: {
        deleted: attachmentDeletedCount,
        errors: attachmentErrorCount,
      },
      totals: {
        deleted: totalDeleted,
        errors: totalErrors,
      },
      message: `Cleaned up ${totalDeleted} orphaned items (${totalMediaDeleted} media assets: ${mediaDeletedCount} from DB + ${cloudflareOrphanedCount} from Cloudflare, ${profileDeletedCount} profile pictures, ${attachmentDeletedCount} attachments)`,
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);

    // Send failure notification email
    await sendFailureNotification(error, {
      timestamp: new Date().toISOString(),
      errorStack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}