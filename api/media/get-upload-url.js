// ============================================================================
// FILE 1: api/media/get-upload-url.js
// ============================================================================
// CREATE THIS NEW FILE
// Purpose: Generates TUS upload URLs from Cloudflare Stream

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

    console.log('Requesting Direct Creator Upload URL...', {
      accountId: CLOUDFLARE_ACCOUNT_ID.substring(0, 8) + '...',
      maxDuration: maxDurationSeconds
    });

    // Request a Direct Creator Upload URL from Cloudflare
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
          // ⭐ YOUR DOMAINS - already configured!
          allowedOrigins: [
            'http://localhost:3000',
            'http://localhost:3001', 
            'https://quickchat-deploy.vercel.app',
            'https://quickchat-deploy-*.vercel.app', // Preview deployments
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudflare API error:', errorData);
      throw new Error(errorData.errors?.[0]?.message || 'Failed to get upload URL');
    }

    const data = await response.json();
    
    console.log('✅ Upload URL generated successfully:', {
      uid: data.result.uid,
      uploadURL: data.result.uploadURL.substring(0, 50) + '...',
    });

    return res.status(200).json({
      success: true,
      data: {
        uploadURL: data.result.uploadURL, // TUS endpoint URL
        uid: data.result.uid, // Video UID for later reference
      },
    });

  } catch (error) {
    console.error('❌ Get upload URL error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to get upload URL',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}