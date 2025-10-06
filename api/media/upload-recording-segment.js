// ============================================
// FILE: api/media/upload-recording-segment.js
// Upload individual recording segment to Cloudflare Stream
// ============================================
import { uploadToStream } from '../lib/cloudflare/stream.js';
import { decodeBase64, getMimeTypeFromMode } from '../lib/utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordingBlob, recordingMode, segmentIndex } = req.body;

    if (!recordingBlob) {
      return res.status(400).json({ error: 'recordingBlob is required' });
    }

    if (!recordingMode || !['video', 'audio', 'screen', 'screen-camera'].includes(recordingMode)) {
      return res.status(400).json({ error: 'Invalid recordingMode' });
    }

    // Decode and upload
    const buffer = decodeBase64(recordingBlob);
    const mimeType = getMimeTypeFromMode(recordingMode);
    const timestamp = Date.now();
    const filename = `segment-${segmentIndex || 0}-${timestamp}.webm`;

    const result = await uploadToStream(buffer, filename, mimeType);

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
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload recording segment',
    });
  }
}