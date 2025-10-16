// api/admin/enable-downloads-migration.js
/**
 * Vercel serverless function to enable downloads for all existing Cloudflare Stream videos
 *
 * SECURITY: Protected by CRON_SECRET environment variable
 *
 * Usage: POST https://your-domain.vercel.app/api/admin/enable-downloads-migration
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */

import axios from 'axios';
import { enableDownloads } from '../lib/cloudflare/stream.js';

export default async function handler(req, res) {
  // Security check
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const expectedToken = process.env.CRON_SECRET;

  if (!token || token !== expectedToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authorization token'
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
  const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;

  if (!XANO_PUBLIC_API_URL || !XANO_INTERNAL_API_KEY) {
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Missing Xano credentials'
    });
  }

  try {
    console.log('🚀 Starting downloads enablement migration');

    // Fetch all media assets from Xano
    console.log('📡 Fetching all media assets from Xano...');
    const response = await axios.get(`${XANO_PUBLIC_API_URL}/internal/media`, {
      params: { x_api_key: XANO_INTERNAL_API_KEY }
    });

    const mediaAssets = response.data.media || [];

    // Filter for Cloudflare Stream videos only
    const streamVideos = mediaAssets.filter(asset =>
      asset.provider === 'cloudflare_stream' &&
      asset.asset_id &&
      asset.url?.includes('cloudflarestream.com')
    );

    console.log(`✅ Found ${mediaAssets.length} total media assets`);
    console.log(`🎥 Found ${streamVideos.length} Cloudflare Stream videos`);

    if (streamVideos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No videos found to process',
        stats: {
          totalAssets: mediaAssets.length,
          streamVideos: 0,
          processed: 0,
          succeeded: 0,
          failed: 0
        }
      });
    }

    // Process each video
    console.log(`📋 Processing ${streamVideos.length} videos...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const processedVideos = [];

    for (let i = 0; i < streamVideos.length; i++) {
      const video = streamVideos[i];
      const videoId = video.asset_id;
      const progress = `[${i + 1}/${streamVideos.length}]`;

      try {
        console.log(`${progress} Enabling downloads for video: ${videoId}`);
        await enableDownloads(videoId);
        successCount++;
        processedVideos.push({
          videoId,
          mediaAssetId: video.id,
          status: 'success'
        });

        // Small delay to avoid rate limiting
        if (i < streamVideos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        errorCount++;
        const errorMsg = error.message || 'Unknown error';
        errors.push({
          videoId,
          mediaAssetId: video.id,
          error: errorMsg
        });
        processedVideos.push({
          videoId,
          mediaAssetId: video.id,
          status: 'failed',
          error: errorMsg
        });
        console.error(`${progress} ❌ Failed for video ${videoId}: ${errorMsg}`);
      }
    }

    // Return detailed results
    const result = {
      success: true,
      message: `Migration complete: ${successCount} succeeded, ${errorCount} failed`,
      stats: {
        totalAssets: mediaAssets.length,
        streamVideos: streamVideos.length,
        processed: processedVideos.length,
        succeeded: successCount,
        failed: errorCount,
        successRate: streamVideos.length > 0
          ? Math.round((successCount / streamVideos.length) * 100)
          : 0
      },
      videos: processedVideos,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('✅ Migration complete');
    console.log(`   Succeeded: ${successCount}/${streamVideos.length}`);
    console.log(`   Failed: ${errorCount}/${streamVideos.length}`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Configure for long-running migration (max 5 minutes on Vercel Pro)
export const config = {
  maxDuration: 300, // 5 minutes
};
