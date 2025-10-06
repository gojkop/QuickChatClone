// ============================================
// FILE: api/media/upload-recording-segment.js
// Upload individual recording segment to Cloudflare Stream
// ============================================

// ⭐ FIX: Change 'cloudflare' to 'claudflare' to match your actual directory name
import { uploadToStream } from '../lib/cloudflare/stream.js';
import { decodeBase64 } from '../lib/cloudflare/utils.js';

// Helper function - define locally to avoid import issues
function getMimeTypeFromMode(mode) {
  const mimeTypes = {
    'video': 'video/webm',
    'audio': 'audio/webm',
    'screen': 'video/webm',
    'screen-camera': 'video/webm'
  };
  return mimeTypes[mode] || 'video/webm';
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Upload segment request received');
    
    const { recordingBlob, recordingMode, segmentIndex, duration } = req.body;

    // Validation
    if (!recordingBlob) {
      console.error('Missing recordingBlob');
      return res.status(400).json({ error: 'recordingBlob is required' });
    }

    if (!recordingMode) {
      console.error('Missing recordingMode');
      return res.status(400).json({ error: 'recordingMode is required' });
    }

    const validModes = ['video', 'audio', 'screen', 'screen-camera'];
    if (!validModes.includes(recordingMode)) {
      console.error('Invalid recordingMode:', recordingMode);
      return res.status(400).json({ 
        error: `Invalid recordingMode. Must be one of: ${validModes.join(', ')}` 
      });
    }

    console.log('Decoding base64...');
    // Decode and upload
    const buffer = decodeBase64(recordingBlob);
    
    console.log('Buffer size:', buffer.length);
    
    const mimeType = getMimeTypeFromMode(recordingMode);
    const timestamp = Date.now();
    const filename = `segment-${segmentIndex || 0}-${timestamp}.webm`;

    console.log('Uploading to Stream:', { filename, mimeType, size: buffer.length });

    const result = await uploadToStream(buffer, filename, mimeType);

    console.log('Upload successful:', result.uid);

    return res.status(200).json({
      success: true,
      data: {
        uid: result.uid,
        playbackUrl: result.playbackUrl,
        duration: result.duration,
        mode: recordingMode,
        size: buffer.length,
        segmentIndex: segmentIndex || 0,
      },
    });

  } catch (error) {
    console.error('Recording segment upload error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload recording segment',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}