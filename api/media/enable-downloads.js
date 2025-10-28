// api/media/enable-downloads.js
// Enable downloads for Cloudflare Stream videos after TUS upload completes

async function waitForVideoReady(accountId, apiToken, videoId, maxAttempts = 10) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔍 Checking video status (attempt ${attempt}/${maxAttempts}):`, videoId);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Failed to check video status: ${response.status}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      continue;
    }

    const data = await response.json();
    const status = data.result?.status?.state;

    console.log(`📹 Video status: ${status}`);

    if (status === 'ready') {
      console.log('✅ Video is ready for download enablement');
      return true;
    }

    if (status === 'error' || status === 'failed') {
      console.error('❌ Video processing failed');
      return false;
    }

    // Wait before next attempt (exponential backoff)
    const waitTime = Math.min(1000 * Math.pow(1.5, attempt), 10000); // Max 10 seconds
    console.log(`⏳ Waiting ${waitTime}ms before next check...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  console.warn('⚠️ Video not ready after maximum attempts');
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Missing videoId parameter' });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return res.status(500).json({ error: 'Cloudflare credentials not configured' });
    }

    console.log(`🔓 Enabling downloads for video: ${videoId}`);

    // Step 1: Wait for video to be ready (with timeout)
    const isReady = await waitForVideoReady(accountId, apiToken, videoId, 10);

    if (!isReady) {
      console.warn(`⚠️ Video ${videoId} not ready, downloads cannot be enabled yet`);
      return res.status(200).json({
        success: true,
        downloadsEnabled: false,
        warning: 'Video is still processing. Downloads will need to be enabled later.',
      });
    }

    // Step 2: Enable downloads
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/downloads`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('Cloudflare downloads API error:', result);
      // Don't fail the request - video is still uploaded successfully
      console.warn(`⚠️ Could not enable downloads for video ${videoId}, but video is uploaded`);
      return res.status(200).json({
        success: true,
        downloadsEnabled: false,
        warning: 'Video uploaded successfully but downloads could not be enabled',
        error: result.errors?.[0]?.message || 'Unknown error',
      });
    }

    console.log(`✅ Downloads enabled for video: ${videoId}`);

    return res.status(200).json({
      success: true,
      downloadsEnabled: true,
      downloadUrl: result.result?.default?.url || null,
    });

  } catch (error) {
    console.error('Enable downloads error:', error);
    // Return success anyway - video upload should not fail if downloads can't be enabled
    return res.status(200).json({
      success: true,
      downloadsEnabled: false,
      warning: 'Video uploaded successfully but downloads could not be enabled',
      error: error.message,
    });
  }
}
