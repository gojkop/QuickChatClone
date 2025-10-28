// api/utils/enable-all-downloads-endpoint.js
// API endpoint to trigger bulk enable-downloads for all Cloudflare Stream videos
// Usage: curl -X POST https://your-domain.com/api/utils/enable-all-downloads-endpoint

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;
const INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY; // For security

async function getAllStreamVideos() {
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

export default async function handler(req, res) {
  // Security check - require API key
  const apiKey = req.headers['x-api-key'] || req.query.x_api_key;

  if (apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
    return res.status(500).json({ error: 'Missing Cloudflare credentials' });
  }

  console.log('🚀 Starting bulk download enablement via API endpoint');

  try {
    // Get all videos
    const videos = await getAllStreamVideos();
    console.log(`✅ Found ${videos.length} videos`);

    if (videos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No videos found',
        results: {
          total: 0,
          alreadyEnabled: 0,
          newlyEnabled: 0,
          failed: 0,
          notReady: 0,
        },
      });
    }

    const results = {
      total: videos.length,
      alreadyEnabled: 0,
      newlyEnabled: 0,
      failed: 0,
      notReady: 0,
      details: [],
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
        results.details.push({ videoId, status: 'already_enabled' });
        continue;
      }

      if (status.status !== 'ready') {
        console.log(`  ⏳ Video not ready (status: ${status.status}), skipping`);
        results.notReady++;
        results.details.push({ videoId, status: 'not_ready', videoStatus: status.status });
        continue;
      }

      // Enable downloads
      console.log(`  🔓 Enabling downloads...`);
      const result = await enableDownloadsForVideo(videoId);

      if (result.success) {
        console.log(`  ✅ Downloads enabled successfully`);
        results.newlyEnabled++;
        results.details.push({ videoId, status: 'newly_enabled' });
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        results.failed++;
        results.details.push({ videoId, status: 'failed', error: result.error });
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Return summary
    console.log('✅ Bulk enable-downloads completed');

    return res.status(200).json({
      success: true,
      message: `Processed ${results.total} videos. Newly enabled: ${results.newlyEnabled}`,
      results: {
        total: results.total,
        alreadyEnabled: results.alreadyEnabled,
        newlyEnabled: results.newlyEnabled,
        notReady: results.notReady,
        failed: results.failed,
      },
      details: results.details,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
