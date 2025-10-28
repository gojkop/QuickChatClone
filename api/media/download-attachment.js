// api/media/download-attachment.js
// Proxies attachment file downloads from R2 to avoid CORS issues

export default async function handler(req, res) {
  // Set CORS headers to allow video element to load the content
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    console.log('========================================');
    console.log('📥 DOWNLOAD-ATTACHMENT PROXY REQUEST');
    console.log('========================================');
    console.log('Full URL:', url);

    // Forward range header for video streaming support
    const fetchHeaders = {};
    if (req.headers.range) {
      fetchHeaders['Range'] = req.headers.range;
      console.log('📹 Video streaming - Range request:', req.headers.range);
    }

    // Fetch the attachment file from R2
    const response = await fetch(url, { headers: fetchHeaders });

    if (!response.ok && response.status !== 206) {
      console.error(`❌ Failed to fetch attachment: ${response.status}`);
      throw new Error(`Failed to fetch attachment: ${response.status}`);
    }

    // Get the content type from the R2 response
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    console.log('📦 R2 Response Headers:');
    console.log('  - Content-Type:', contentType);
    console.log('  - Content-Length:', contentLength);
    console.log('  - Accept-Ranges:', acceptRanges);
    console.log('  - Content-Range:', contentRange);

    // Extract file extension from URL to detect video files
    const urlPath = new URL(url).pathname;
    const extension = urlPath.split('.').pop().toLowerCase();
    console.log('🔍 Detected file extension:', extension);

    // Map common video extensions to MIME types
    const videoExtensions = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'webm': 'video/webm',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'm4v': 'video/x-m4v'
    };

    // Check if this is a video file (by content-type OR extension)
    const isVideoByContentType = contentType.startsWith('video/');
    const isVideoByExtension = videoExtensions.hasOwnProperty(extension);
    const isVideo = isVideoByContentType || isVideoByExtension;

    console.log('🎬 Video Detection:');
    console.log('  - Is video by content-type?', isVideoByContentType);
    console.log('  - Is video by extension?', isVideoByExtension);
    console.log('  - Final isVideo:', isVideo);

    // Override content-type if R2 returned wrong type for known video extensions
    if (isVideo && videoExtensions[extension] && contentType === 'application/octet-stream') {
      const oldContentType = contentType;
      contentType = videoExtensions[extension];
      console.log(`🔧 Fixed content-type: ${oldContentType} → ${contentType}`);
    }

    // Set response status first (before headers in some cases)
    const statusCode = contentRange ? 206 : 200;

    console.log('📤 Response Headers Being Set:');
    console.log('  - Status Code:', statusCode);
    console.log('  - Content-Type:', contentType);
    console.log('  - Cache-Control: public, max-age=31536000');

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // For video streaming, set proper headers (NO download header)
    if (isVideo) {
      console.log('  - Accept-Ranges:', acceptRanges || 'bytes');
      res.setHeader('Accept-Ranges', acceptRanges || 'bytes');
      if (contentLength) {
        console.log('  - Content-Length:', contentLength);
        res.setHeader('Content-Length', contentLength);
      }
      if (contentRange) {
        console.log('  - Content-Range:', contentRange);
        res.setHeader('Content-Range', contentRange);
      }
      console.log('  - Content-Disposition: NOT SET (inline playback)');
      console.log('✅ VIDEO MODE - Serving for inline playback');
    } else {
      console.log('  - Content-Disposition: attachment (force download)');
      res.setHeader('Content-Disposition', 'attachment');
      if (contentLength) {
        console.log('  - Content-Length:', contentLength);
        res.setHeader('Content-Length', contentLength);
      }
      console.log('📄 NON-VIDEO MODE - Forcing download');
    }
    console.log('========================================');

    // Stream the R2 response to the client
    const buffer = await response.arrayBuffer();
    res.status(statusCode).send(Buffer.from(buffer));

    console.log('✅ Attachment streamed successfully');

  } catch (error) {
    console.error('Error proxying attachment:', error);
    res.status(500).json({ error: 'Failed to stream attachment file', details: error.message });
  }
}
