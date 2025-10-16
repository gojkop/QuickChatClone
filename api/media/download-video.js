// api/media/download-video.js
// Proxies video file downloads from Cloudflare Stream to avoid CORS issues

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Validate that this is actually a Cloudflare Stream URL to prevent abuse
  if (!url.includes('cloudflarestream.com')) {
    return res.status(400).json({ error: 'Invalid URL - must be Cloudflare Stream URL' });
  }

  try {
    // Fetch the video file from Cloudflare Stream
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }

    // Get the content type from the Cloudflare response
    const contentType = response.headers.get('content-type') || 'video/mp4';

    // Stream the video file to the client with proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment'); // Force download
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Pipe the Cloudflare response to the client
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Error proxying video download:', error);
    res.status(500).json({ error: 'Failed to download video file' });
  }
}
