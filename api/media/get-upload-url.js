export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
      return res.status(500).json({ error: 'Cloudflare credentials not configured' });
    }

    // Just return the endpoint - let frontend upload with FormData
    const uploadEndpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;

    return res.status(200).json({
      success: true,
      data: {
        uploadEndpoint,
        token: CLOUDFLARE_STREAM_API_TOKEN,
        accountId: CLOUDFLARE_ACCOUNT_ID,
      },
    });

  } catch (error) {
    console.error('Get upload URL error:', error.message);
    return res.status(500).json({
      error: 'Failed to get upload endpoint',
      details: error.message,
    });
  }
}