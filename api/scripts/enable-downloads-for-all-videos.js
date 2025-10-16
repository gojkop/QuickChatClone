// api/scripts/enable-downloads-for-all-videos.js
/**
 * One-time migration script to enable downloads for all existing Cloudflare Stream videos
 *
 * Usage: node api/scripts/enable-downloads-for-all-videos.js
 *
 * This script:
 * 1. Fetches all media_assets from Xano that use Cloudflare Stream
 * 2. For each video, calls the Cloudflare API to enable downloads
 * 3. Logs results for review
 */

import axios from 'axios';
import { enableDownloads } from '../lib/cloudflare/stream.js';

const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;

async function getAllStreamVideos() {
  console.log('📡 Fetching all media assets from Xano...');

  const response = await axios.get(`${XANO_PUBLIC_API_URL}/internal/media`, {
    params: {
      x_api_key: XANO_INTERNAL_API_KEY
    }
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

  return streamVideos;
}

async function main() {
  console.log('🚀 Starting downloads enablement migration\n');
  console.log('='.repeat(60));

  try {
    const videos = await getAllStreamVideos();

    if (videos.length === 0) {
      console.log('\n✅ No videos found - nothing to do!');
      return;
    }

    console.log(`\n📋 Processing ${videos.length} videos...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoId = video.asset_id;
      const progress = `[${i + 1}/${videos.length}]`;

      try {
        console.log(`${progress} Enabling downloads for video: ${videoId}`);
        await enableDownloads(videoId);
        successCount++;

        // Small delay to avoid rate limiting
        if (i < videos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        errorCount++;
        const errorMsg = error.message || 'Unknown error';
        errors.push({ videoId, error: errorMsg, mediaAssetId: video.id });
        console.error(`${progress} ❌ Failed for video ${videoId}: ${errorMsg}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully enabled: ${successCount}/${videos.length}`);
    console.log(`❌ Failed: ${errorCount}/${videos.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ videoId, error, mediaAssetId }) => {
        console.log(`   - Video ${videoId} (Media Asset #${mediaAssetId}): ${error}`);
      });
    }

    console.log('\n✅ Migration complete!');

    if (errorCount > 0) {
      console.log('\n⚠️  Some videos failed - you may need to enable downloads manually for these.');
      console.log('   Use: curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_id}/downloads" \\');
      console.log('        -H "Authorization: Bearer {token}" \\');
      console.log('        -H "Content-Type: application/json"');
    }

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the migration
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
