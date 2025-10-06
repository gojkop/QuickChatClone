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

    // Convert base64 to buffer
    const base64Data = videoBase64.includes(',') 
      ? videoBase64.split(',')[1] 
      : videoBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    // Create form data
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `segment-${segmentIndex}.webm`,
      contentType: mode === 'video' ? 'video/webm' : 'audio/webm',
    });

    // Upload directly to Cloudflare Stream API
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
      return res.status(500).json({ error: 'Upload failed' });
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