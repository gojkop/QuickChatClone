// api/admin/fix-stream-cors.js
const axios = require('axios');

export default async function handler(req, res) {
  // ✅ Security: Check for admin secret
  const adminSecret = req.headers['x-admin-secret'] || req.query.secret;
  
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  const allowedOrigins = [
    'https://mindpick.me',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  try {
    console.log('Fetching all videos...');
    
    // Get all videos
    const listResponse = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        }
      }
    );

    if (!listResponse.data.success) {
      throw new Error('Failed to fetch videos');
    }

    const videos = listResponse.data.result;
    const results = [];

    // Update each video
    for (const video of videos) {
      console.log(`Updating video: ${video.uid}`);
      
      try {
        const updateResponse = await axios.post(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${video.uid}`,
          {
            allowedOrigins: allowedOrigins,
            requireSignedURLs: false
          },
          {
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        results.push({
          uid: video.uid,
          success: updateResponse.data.success,
          status: 'updated'
        });
      } catch (error) {
        results.push({
          uid: video.uid,
          success: false,
          error: error.message
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return res.status(200).json({
      success: true,
      message: `Updated ${videos.length} videos`,
      results: results
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
}