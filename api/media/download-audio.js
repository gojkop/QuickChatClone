// api/media/download-audio.js
// Proxies audio file downloads from R2 to avoid CORS issues

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Validate that this is actually an R2 URL to prevent abuse
  if (!url.includes('r2.dev') && !url.includes('r2.cloudflarestorage.com')) {
    return res.status(400).json({ error: 'Invalid URL - must be R2 storage URL' });
  }

  try {
    // Fetch the audio file from R2
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    // Get the content type from the R2 response
    const contentType = response.headers.get('content-type') || 'audio/webm';

    // Stream the audio file to the client with proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment'); // Force download
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Pipe the R2 response to the client
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Error proxying audio download:', error);
    res.status(500).json({ error: 'Failed to download audio file' });
  }
}
