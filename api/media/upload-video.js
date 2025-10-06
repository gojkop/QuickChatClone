import FormData from 'form-data';
import axios from 'axios';

// In api/media/upload-video.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoBase64, recordingMode, segmentIndex, duration } = req.body;

    if (!videoBase64) {
      return res.status(400).json({ error: 'No video data provided' });
    }

    console.log('Received video data length:', videoBase64.length);
    console.log('Recording mode:', recordingMode);
    console.log('Segment index:', segmentIndex);
    console.log('Duration:', duration);

    // Convert base64 to buffer
    const videoBuffer = Buffer.from(videoBase64, 'base64');
    console.log('Buffer size:', videoBuffer.length);

    // Check magic bytes
    const magicBytes = videoBuffer.slice(0, 4).toString('hex');
    console.log('Magic bytes:', magicBytes);
    
    if (magicBytes !== '1a45dfa3') {
      return res.status(400).json({ 
        error: 'Invalid video format',
        details: `Expected WebM magic bytes 1a45dfa3, got ${magicBytes}`
      });
    }

    // Upload to Cloudflare Stream
    // ... rest of your upload logic
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}