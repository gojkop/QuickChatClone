import FormData from 'form-data';
import axios from 'axios';

// In api/media/upload-video.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoBase64, recordingMode, segmentIndex, duration } = req.body;

    console.log('=== BACKEND: Upload Video ===');
    console.log('videoBase64 exists:', !!videoBase64);
    console.log('videoBase64 length:', videoBase64 ? videoBase64.length : 0);
    console.log('videoBase64 type:', typeof videoBase64);
    console.log('videoBase64 first 100 chars:', videoBase64 ? videoBase64.substring(0, 100) : 'null');
    console.log('Recording mode:', recordingMode);
    console.log('Segment index:', segmentIndex);
    console.log('Duration:', duration);

    if (!videoBase64) {
      return res.status(400).json({ error: 'No video data provided' });
    }

    // ⭐ FIX: Check if videoBase64 starts with "data:" (shouldn't!)
    if (videoBase64.startsWith('data:')) {
      console.error('ERROR: videoBase64 still contains data URL prefix!');
      return res.status(400).json({ 
        error: 'Invalid format: videoBase64 should not contain data URL prefix',
        received: videoBase64.substring(0, 50)
      });
    }

    // Convert base64 to buffer
    console.log('Converting base64 to buffer...');
    let videoBuffer;
    try {
      videoBuffer = Buffer.from(videoBase64, 'base64');
      console.log('Buffer created successfully');
      console.log('Buffer size:', videoBuffer.length);
    } catch (error) {
      console.error('Buffer creation failed:', error);
      return res.status(400).json({ 
        error: 'Failed to decode base64',
        details: error.message
      });
    }

    // Check magic bytes
    const magicBytes = videoBuffer.slice(0, 4).toString('hex');
    console.log('Magic bytes:', magicBytes);
    console.log('Expected WebM magic bytes: 1a45dfa3');
    
    if (magicBytes !== '1a45dfa3') {
      console.error('Invalid magic bytes!');
      return res.status(400).json({ 
        error: 'Invalid video format',
        details: `Expected WebM magic bytes 1a45dfa3, got ${magicBytes}`,
        bufferSize: videoBuffer.length,
        base64Length: videoBase64.length
      });
    }

    console.log('Magic bytes check passed! Video format is valid WebM.');

    // Now upload to Cloudflare Stream
    // TODO: Add your Cloudflare upload logic here
    
    // For now, return success
    return res.status(200).json({
      success: true,
      data: {
        uid: 'test-' + Date.now(),
        playbackUrl: 'https://test.cloudflare.com/video.mp4',
        duration: duration || 0,
        mode: recordingMode,
        size: videoBuffer.length
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}