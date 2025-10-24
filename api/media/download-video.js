// api/media/download-video.js
// Proxies video file downloads from Cloudflare Stream to avoid CORS issues

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, video_id } = req.query;

  // Handle both url and video_id parameters
  let downloadUrl = url;

  if (!downloadUrl && video_id) {
    // For Cloudflare Stream videos, get the default download link
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    try {
      // Get video details from Cloudflare Stream API
      const videoInfoResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${video_id}`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          },
        }
      );

      if (!videoInfoResponse.ok) {
        console.error('Failed to fetch video info from Cloudflare:', await videoInfoResponse.text());
        return res.status(424).json({ error: 'Failed to get video info from Cloudflare Stream' });
      }

      const videoInfo = await videoInfoResponse.json();

      // Check if download is available
      if (!videoInfo.result?.meta?.downloadedFrom) {
        // Try to get the download URL - Cloudflare provides the original uploaded file
        // Use the dash manifest URL as fallback
        downloadUrl = `https://customer-${accountId}.cloudflarestream.com/${video_id}/downloads/default.mp4`;
      } else {
        downloadUrl = videoInfo.result.meta.downloadedFrom;
      }
    } catch (error) {
      console.error('Error fetching Cloudflare Stream video info:', error);
      return res.status(424).json({ error: 'Failed to retrieve video download URL' });
    }
  }

  if (!downloadUrl) {
    return res.status(400).json({ error: 'Missing url or video_id parameter' });
  }

  // Validate that this is actually a Cloudflare URL to prevent abuse
  if (!downloadUrl.includes('cloudflare')) {
    return res.status(400).json({ error: 'Invalid URL - must be Cloudflare URL' });
  }

  try {
    console.log('📥 Downloading video from:', downloadUrl);

    // Fetch the video file
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      console.error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch video: ${response.status}`);
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'video/mp4';

    // Stream the video file to the client with proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment'); // Force download
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Pipe the response to the client
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

    console.log('✅ Video download completed');

  } catch (error) {
    console.error('Error proxying video download:', error);
    res.status(500).json({ error: 'Failed to download video file', details: error.message });
  }
}
