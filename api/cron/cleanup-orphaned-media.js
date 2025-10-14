// api/cron/cleanup-orphaned-media.js
// Runs daily to clean up orphaned media:
// 1. Media assets not associated with any question or answer
// 2. Profile pictures not referenced in any expert_profile

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
    // PART 1: Clean up orphaned media_assets
    // ============================================================
    console.log('📦 PART 1: Cleaning up orphaned media assets...');

    // Calculate cutoff time (48 hours ago)
    const cutoffDate = new Date(Date.now() - (48 * 60 * 60 * 1000));

    // Get all media_assets from Xano via internal endpoint
    // Note: Uses Public API group endpoint that accepts internal API key
    const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
    const internalEndpoint = `${XANO_PUBLIC_API_URL}/internal/media`;

    console.log('📡 Fetching media assets from:', internalEndpoint);
    console.log('📡 Using API Key:', XANO_INTERNAL_API_KEY ? 'Present' : 'Missing');

    const mediaResponse = await fetch(`${internalEndpoint}?x_api_key=${XANO_INTERNAL_API_KEY}&type=assets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Xano response status:', mediaResponse.status);

    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      console.error('❌ Xano error response:', errorText);
      throw new Error(`Failed to fetch media assets from Xano: ${mediaResponse.status} - ${errorText}`);
    }

    const allMedia = await mediaResponse.json();
    let mediaDeletedCount = 0;
    let mediaErrorCount = 0;

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

    console.log('Part 1 complete:', { deleted: mediaDeletedCount, errors: mediaErrorCount });
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
      // Step 2: Get all avatar URLs from Xano
      console.log('📡 Fetching avatar URLs from Xano...');

      const avatarsResponse = await fetch(`${internalEndpoint}?x_api_key=${XANO_INTERNAL_API_KEY}&type=avatars`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!avatarsResponse.ok) {
        const errorText = await avatarsResponse.text();
        console.error('❌ Failed to fetch avatar URLs:', errorText);
        throw new Error(`Failed to fetch avatar URLs from Xano: ${avatarsResponse.status}`);
      }

      const avatarRecords = await avatarsResponse.json();
      console.log(`Found ${avatarRecords.length} avatar URLs in Xano`);

      // Step 3: Build set of active files
      const activeFiles = new Set();

      for (const record of avatarRecords) {
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

      // Step 4: Compare and delete orphaned profile pictures
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
    // Summary and notifications
    // ============================================================
    const totalDeleted = mediaDeletedCount + profileDeletedCount;
    const totalErrors = mediaErrorCount + profileErrorCount;

    console.log('🎉 All cleanup complete:', {
      mediaAssets: { deleted: mediaDeletedCount, errors: mediaErrorCount },
      profilePictures: { deleted: profileDeletedCount, errors: profileErrorCount },
      totals: { deleted: totalDeleted, errors: totalErrors }
    });

    // Send warning email if there were significant errors
    if (totalErrors > 0 && totalErrors >= totalDeleted * 0.5) {
      // More than 50% error rate is concerning
      await sendFailureNotification(
        new Error(`High error rate during cleanup: ${totalErrors} errors, ${totalDeleted} deleted`),
        {
          mediaAssets: { deleted: mediaDeletedCount, errors: mediaErrorCount },
          profilePictures: { deleted: profileDeletedCount, errors: profileErrorCount },
          totals: { deleted: totalDeleted, errors: totalErrors },
          errorRate: `${Math.round((totalErrors / (totalDeleted + totalErrors)) * 100)}%`,
        }
      );
    }

    return res.status(200).json({
      success: true,
      mediaAssets: {
        deleted: mediaDeletedCount,
        errors: mediaErrorCount,
      },
      profilePictures: {
        deleted: profileDeletedCount,
        errors: profileErrorCount,
      },
      totals: {
        deleted: totalDeleted,
        errors: totalErrors,
      },
      message: `Cleaned up ${totalDeleted} orphaned items (${mediaDeletedCount} media assets, ${profileDeletedCount} profile pictures)`,
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