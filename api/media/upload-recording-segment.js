import FormData from 'form-data';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordingBlob, recordingMode, segmentIndex, duration } = req.body;

    if (!recordingBlob) {
      return res.status(400).json({ error: 'No recording provided' });
    }

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    // Extract base64 data (remove data URL prefix)
    const base64Data = recordingBlob.split(',')[1];
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create form data
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `segment-${segmentIndex}-${Date.now()}.webm`,
      contentType: recordingMode === 'video' ? 'video/webm' : 'audio/webm',
    });

    // Upload to Cloudflare Stream
    const streamUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
    
    const uploadResponse = await axios.post(streamUrl, formData, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!uploadResponse.data.success) {
      console.error('Cloudflare upload error:', uploadResponse.data);
      return res.status(500).json({ error: 'Upload to Cloudflare failed' });
    }

    const videoId = uploadResponse.data.result.uid;
    const playbackUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;

    return res.status(200).json({
      success: true,
      data: {
        uid: videoId,
        playbackUrl: playbackUrl,
        duration: duration || uploadResponse.data.result.duration || 0,
        mode: recordingMode,
        size: buffer.length,
        segmentIndex: segmentIndex || 0,
      },
    });

  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
}