// api/utils/enable-all-downloads.js
// Utility script to retroactively enable downloads for all Cloudflare Stream videos
// Usage: node api/utils/enable-all-downloads.js

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
  console.error('❌ Missing Cloudflare credentials in environment variables');
  process.exit(1);
}

async function getAllStreamVideos() {
  console.log('📋 Fetching all videos from Cloudflare Stream...');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
    {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.status}`);
  }

  const data = await response.json();
  return data.result || [];
}

async function checkIfDownloadsEnabled(videoId) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
    {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    return { enabled: false, status: 'error' };
  }

  const data = await response.json();
  const video = data.result;

  // Check if video has downloadURL or meta.downloadedFrom
  const hasDownloads = video.downloadUrl || video.meta?.downloadedFrom;

  return {
    enabled: Boolean(hasDownloads),
    status: video.status?.state || 'unknown',
    uid: video.uid,
  };
}

async function enableDownloadsForVideo(videoId) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}/downloads`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    return {
      success: false,
      error: result.errors?.[0]?.message || 'Unknown error',
    };
  }

  return {
    success: true,
    downloadUrl: result.result?.default?.url || null,
  };
}

async function main() {
  console.log('🚀 Starting bulk download enablement for Cloudflare Stream videos\n');

  try {
    // Get all videos
    const videos = await getAllStreamVideos();
    console.log(`✅ Found ${videos.length} videos\n`);

    if (videos.length === 0) {
      console.log('No videos found');
      return;
    }

    const results = {
      total: videos.length,
      alreadyEnabled: 0,
      newlyEnabled: 0,
      failed: 0,
      notReady: 0,
    };

    // Process each video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoId = video.uid;
      const progress = `[${i + 1}/${videos.length}]`;

      console.log(`${progress} Checking video: ${videoId}`);

      // Check current status
      const status = await checkIfDownloadsEnabled(videoId);

      if (status.enabled) {
        console.log(`  ✅ Downloads already enabled`);
        results.alreadyEnabled++;
        continue;
      }

      if (status.status !== 'ready') {
        console.log(`  ⏳ Video not ready (status: ${status.status}), skipping`);
        results.notReady++;
        continue;
      }

      // Enable downloads
      console.log(`  🔓 Enabling downloads...`);
      const result = await enableDownloadsForVideo(videoId);

      if (result.success) {
        console.log(`  ✅ Downloads enabled successfully`);
        results.newlyEnabled++;
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        results.failed++;
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total videos:          ${results.total}`);
    console.log(`Already enabled:       ${results.alreadyEnabled} ✅`);
    console.log(`Newly enabled:         ${results.newlyEnabled} 🎉`);
    console.log(`Not ready (skipped):   ${results.notReady} ⏳`);
    console.log(`Failed:                ${results.failed} ❌`);
    console.log('='.repeat(60));

    if (results.newlyEnabled > 0) {
      console.log(`\n✅ Successfully enabled downloads for ${results.newlyEnabled} videos!`);
    }

    if (results.notReady > 0) {
      console.log(`\n⏳ ${results.notReady} videos are still processing. Run this script again later.`);
    }

    if (results.failed > 0) {
      console.log(`\n❌ ${results.failed} videos failed. Check the logs above for details.`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
