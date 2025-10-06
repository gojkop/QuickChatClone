// ============================================
// FILE: api/media/upload-recording.js
// Upload video/audio recording to Cloudflare Stream
// ============================================
import { uploadToStream } from '../lib/cloudflare/stream.js';
import { decodeBase64, getMimeTypeFromMode, getRecordingFilename } from '../lib/utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordingBlob, recordingMode } = req.body;

    // Validation
    if (!recordingBlob) {
      return res.status(400).json({ error: 'recordingBlob is required' });
    }

    if (!recordingMode || !['video', 'audio'].includes(recordingMode)) {
      return res.status(400).json({ error: 'recordingMode must be "video" or "audio"' });
    }

    // Decode and upload
    const buffer = decodeBase64(recordingBlob);
    const mimeType = getMimeTypeFromMode(recordingMode);
    const filename = getRecordingFilename(recordingMode);

    const result = await uploadToStream(buffer, filename, mimeType);

    return res.status(200).json({
      success: true,
      data: {
        uid: result.uid,
        playbackUrl: result.playbackUrl,
        duration: result.duration,
        mode: recordingMode,
        size: buffer.length,
      },
    });

  } catch (error) {
    console.error('Recording upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload recording',
    });
  }
}