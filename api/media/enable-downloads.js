// api/media/enable-downloads.js
// Enable downloads for Cloudflare Stream videos after TUS upload completes

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

    // Call Cloudflare API to enable downloads
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
