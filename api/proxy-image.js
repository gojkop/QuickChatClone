// api/proxy-image.js
// Vercel API Route to proxy R2 images (bypasses CORS)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get image URL from query parameter
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Verify it's from your R2 bucket (security)
  if (!url.startsWith('https://pub-c4bb23acd078455db6344cac14ddee88.r2.dev/')) {
    return res.status(403).json({ error: 'Invalid image URL' });
  }

  try {
    // Fetch image from R2
    const imageResponse = await fetch(url);

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json({ 
        error: 'Failed to fetch image' 
      });
    }

    // Get image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // Get content type from original response
    const contentType = imageResponse.headers.get('content-type') || 'image/webp';

    // Set CORS headers (allow your domain)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Send image
    return res.status(200).send(imageData);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy image',
      message: error.message 
    });
  }
}