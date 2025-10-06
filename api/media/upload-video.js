import FormData from 'form-data';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoBase64, mode, segmentIndex, duration } = req.body;

    if (!videoBase64) {
      return res.status(400).json({ error: 'No video data provided' });
    }

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    // Extract base64 data
    const base64Data = videoBase64.includes(',') 
      ? videoBase64.split(',')[1] 
      : videoBase64;
    
    const buffer = Buffer.from(base64Data, 'base64');

    console.log('Buffer size:', buffer.length);
    console.log('First 20 bytes (hex):', buffer.slice(0, 20).toString('hex'));
    console.log('Mode:', mode);

    // Check if it's a valid WebM file (should start with 1A45DFA3)
    const magicBytes = buffer.slice(0, 4).toString('hex');
    console.log('Magic bytes:', magicBytes);
    
    if (!magicBytes.startsWith('1a45dfa')) {
      console.error('Invalid WebM file - wrong magic bytes');
      return res.status(400).json({ 
        error: 'Invalid video file format',
        magicBytes: magicBytes 
      });
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `segment-${segmentIndex}.webm`,
      contentType: 'video/webm',
    });

    // Upload to Cloudflare
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (!response.data.success) {
      console.error('Cloudflare error:', response.data);
      return res.status(500).json({ error: 'Upload failed', details: response.data });
    }

    const videoId = response.data.result.uid;
    const playbackUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;

    return res.status(200).json({
      success: true,
      data: {
        uid: videoId,
        playbackUrl: playbackUrl,
        duration: duration || response.data.result.duration || 0,
        mode: mode,
        size: buffer.length,
        segmentIndex: segmentIndex,
      },
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    if (error.response) {
      console.error('Cloudflare response:', error.response.data);
    }
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
}