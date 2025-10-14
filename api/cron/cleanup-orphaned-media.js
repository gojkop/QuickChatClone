// api/cron/cleanup-orphaned-media.js
// Runs daily to clean up uploads not associated with any question or answer

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

  try {
    console.log('Starting orphaned media cleanup...');

    // Calculate cutoff time (48 hours ago)
    const cutoffDate = new Date(Date.now() - (48 * 60 * 60 * 1000));

    // Get all media_assets from Xano via internal endpoint
    // Note: Uses Public API group endpoint that accepts internal API key
    const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
    const internalEndpoint = `${XANO_PUBLIC_API_URL}/internal/media_assets`;

    console.log('📡 Fetching media assets from:', internalEndpoint);
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
      throw new Error(`Failed to fetch media assets from Xano: ${mediaResponse.status} - ${errorText}`);
    }

    const allMedia = await mediaResponse.json();
    let deletedCount = 0;
    let errorCount = 0;

    // Initialize R2 client for deletions
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET_KEY,
      },
    });

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
          deletedCount++;
          console.log(`✅ Deleted from Xano database: ${media.id}`);
        } else {
          console.warn(`⚠️  Failed to delete from Xano: ${media.id}`);
          errorCount++;
        }

      } catch (deleteError) {
        console.error(`❌ Error deleting media ${media.id}:`, deleteError);
        errorCount++;
      }
    }

    console.log('Cleanup complete:', { deletedCount, errorCount });

    // Send warning email if there were significant errors
    if (errorCount > 0 && errorCount >= deletedCount * 0.5) {
      // More than 50% error rate is concerning
      await sendFailureNotification(
        new Error(`High error rate during cleanup: ${errorCount} errors, ${deletedCount} deleted`),
        {
          deletedCount,
          errorCount,
          errorRate: `${Math.round((errorCount / (deletedCount + errorCount)) * 100)}%`,
        }
      );
    }

    return res.status(200).json({
      success: true,
      deleted: deletedCount,
      errors: errorCount,
      message: `Cleaned up ${deletedCount} orphaned media assets`,
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