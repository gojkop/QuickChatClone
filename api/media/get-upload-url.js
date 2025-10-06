import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { maxDurationSeconds } = req.body;

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
      return res.status(500).json({ error: 'Cloudflare credentials not configured' });
    }

    // Request a direct upload URL from Cloudflare
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        maxDurationSeconds: maxDurationSeconds || 3600,
        requireSignedURLs: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.success) {
      console.error('Cloudflare error:', response.data);
      return res.status(500).json({ error: 'Failed to get upload URL' });
    }

    const { uid, uploadURL } = response.data.result;

    return res.status(200).json({
      success: true,
      data: {
        uid,
        uploadURL,
      },
    });

  } catch (error) {
    console.error('Get upload URL error:', error.message);
    return res.status(500).json({
      error: 'Failed to get upload URL',
      details: error.message,
    });
  }
}