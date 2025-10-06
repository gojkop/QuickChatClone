// api/cron/cleanup-orphaned-media.js
// Runs daily to clean up uploads not associated with any question

export default async function handler(req, res) {
  // Verify cron job authentication
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const XANO_BASE_URL = process.env.XANO_BASE_URL;
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  try {
    console.log('Starting orphaned media cleanup...');
    
    // Calculate cutoff time (48 hours ago)
    const cutoffDate = new Date(Date.now() - (48 * 60 * 60 * 1000));
    
    // Get all media_assets from Xano older than 48 hours
    const mediaResponse = await fetch(`${XANO_BASE_URL}/media_asset`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch media assets from Xano');
    }

    const allMedia = await mediaResponse.json();
    let deletedCount = 0;
    let errorCount = 0;

    // Filter for orphaned media (older than 48 hours, not associated with questions)
    for (const media of allMedia) {
      const createdAt = new Date(media.created_at);
      
      // Check if older than cutoff
      if (createdAt > cutoffDate) {
        continue; // Skip recent uploads
      }

      // Check if associated with a question
      if (media.owner_type === 'question' && media.owner_id) {
        // Verify question still exists
        const questionResponse = await fetch(`${XANO_BASE_URL}/question/${media.owner_id}`);
        if (questionResponse.ok) {
          continue; // Question exists, keep the media
        }
      }

      // This media is orphaned - delete it
      console.log(`Deleting orphaned media: ${media.id} (asset: ${media.asset_id})`);

      try {
        // 1. Delete from Cloudflare Stream
        if (media.provider === 'cloudflare_stream' && media.asset_id) {
          const streamDeleteUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${media.asset_id}`;
          
          await fetch(streamDeleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
            },
          });
          
          console.log(`Deleted from Cloudflare Stream: ${media.asset_id}`);
        }

        // 2. Delete from Xano
        const xanoDeleteResponse = await fetch(`${XANO_BASE_URL}/media_asset/${media.id}`, {
          method: 'DELETE',
        });

        if (xanoDeleteResponse.ok) {
          deletedCount++;
          console.log(`Deleted from Xano: ${media.id}`);
        }

      } catch (deleteError) {
        console.error(`Error deleting media ${media.id}:`, deleteError);
        errorCount++;
      }
    }

    console.log('Cleanup complete:', { deletedCount, errorCount });

    return res.status(200).json({
      success: true,
      deleted: deletedCount,
      errors: errorCount,
      message: `Cleaned up ${deletedCount} orphaned media assets`,
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}