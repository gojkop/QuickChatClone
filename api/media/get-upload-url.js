// api/media/get-upload-url.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { maxDurationSeconds = 90 } = req.body;

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
      console.error('Missing Cloudflare credentials');
      throw new Error('Cloudflare credentials not configured');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds,
          requireSignedURLs: false,
          // Note: Downloads must be enabled separately via /api/media/enable-downloads
          // after the TUS upload completes (Cloudflare API limitation)
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudflare API error:', errorData);
      throw new Error(errorData.errors?.[0]?.message || 'Failed to get upload URL');
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      data: {
        uploadURL: data.result.uploadURL,
        uid: data.result.uid,
      },
    });

  } catch (error) {
    console.error('Get upload URL error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to get upload URL',
    });
  }
}