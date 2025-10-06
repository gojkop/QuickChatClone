import FormData from 'form-data';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoData, mode, segmentIndex, duration } = req.body;

    if (!videoData) {
      return res.status(400).json({ error: 'No video data provided' });
    }

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    // Extract base64 data
    const base64Data = videoData.includes(',') ? videoData.split(',')[1] : videoData;
    const buffer = Buffer.from(base64Data, 'base64');

    // Check size - Cloudflare has limits
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (buffer.length > maxSize) {
      return res.status(413).json({ error: 'Video too large' });
    }

    // Upload directly to Cloudflare
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `segment-${segmentIndex}.webm`,
      contentType: mode === 'video' ? 'video/webm' : 'audio/webm',
    });

    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!response.data.success) {
      console.error('Cloudflare error:', response.data);
      return res.status(500).json({ error: 'Upload to Cloudflare failed' });
    }

    const uid = response.data.result.uid;
    const playbackUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`;

    return res.status(200).json({
      success: true,
      data: {
        uid,
        playbackUrl,
        duration: duration || response.data.result.duration || 0,
        mode,
        size: buffer.length,
        segmentIndex: segmentIndex || 0,
      },
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
}