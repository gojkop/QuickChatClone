// api/media/download-attachment.js
// Proxies attachment file downloads from R2 to avoid CORS issues

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
    console.log('📥 Fetching attachment from:', url);

    // Forward range header for video streaming support
    const fetchHeaders = {};
    if (req.headers.range) {
      fetchHeaders['Range'] = req.headers.range;
      console.log('📹 Video streaming - Range request:', req.headers.range);
    }

    // Fetch the attachment file from R2
    const response = await fetch(url, { headers: fetchHeaders });

    if (!response.ok && response.status !== 206) {
      console.error(`Failed to fetch attachment: ${response.status}`);
      throw new Error(`Failed to fetch attachment: ${response.status}`);
    }

    // Get the content type from the R2 response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // For video streaming, set proper headers
    if (contentType.startsWith('video/')) {
      res.setHeader('Accept-Ranges', acceptRanges || 'bytes');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
        res.status(206); // Partial Content
      }
    } else {
      // For other files, force download
      res.setHeader('Content-Disposition', 'attachment');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
    }

    // Stream the R2 response to the client
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

    console.log('✅ Attachment streamed successfully');

  } catch (error) {
    console.error('Error proxying attachment:', error);
    res.status(500).json({ error: 'Failed to stream attachment file', details: error.message });
  }
}
