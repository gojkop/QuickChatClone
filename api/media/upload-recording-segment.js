import FormData from 'form-data';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordingBlob, recordingMode, segmentIndex, duration } = req.body;

    // Debug logging
    console.log('Recording mode:', recordingMode);
    console.log('Base64 prefix:', recordingBlob?.substring(0, 50));
    console.log('Base64 length:', recordingBlob?.length);

    if (!recordingBlob) {
      return res.status(400).json({ error: 'No recording provided' });
    }

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    // Extract base64 data
    const base64Data = recordingBlob.includes(',') 
      ? recordingBlob.split(',')[1] 
      : recordingBlob;
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log('Buffer size:', buffer.length, 'bytes');

    // Verify it's a valid WebM file by checking magic bytes
    const magicBytes = buffer.slice(0, 4).toString('hex');
    console.log('File magic bytes:', magicBytes);
    // WebM files should start with 1A 45 DF A3
    
    if (buffer.length < 1000) {
      return res.status(400).json({ 
        error: 'Video file too small - likely corrupted',
        size: buffer.length 
      });
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `segment-${segmentIndex}-${Date.now()}.webm`,
      contentType: 'video/webm',
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
      return res.status(500).json({ 
        error: 'Upload to Cloudflare failed',
        details: uploadResponse.data 
      });
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