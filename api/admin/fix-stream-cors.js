// api/admin/fix-stream-cors.js
import axios from 'axios';

export default async function handler(req, res) {
  const adminSecret = req.query.secret;
  
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get pagination parameters
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  const allowedOrigins = [
    'https://mindpick.me',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  try {
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

    const allVideos = listResponse.data.result;
    
    // Process only a batch
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const videosToProcess = allVideos.slice(startIdx, endIdx);

    const results = [];

    for (const video of videosToProcess) {
      try {
        await axios.post(
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

        results.push({ uid: video.uid, success: true });
      } catch (error) {
        results.push({ uid: video.uid, success: false, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      page: page,
      limit: limit,
      processed: videosToProcess.length,
      totalVideos: allVideos.length,
      hasMore: endIdx < allVideos.length,
      nextPage: endIdx < allVideos.length ? page + 1 : null,
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
}