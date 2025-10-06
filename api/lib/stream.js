import FormData from 'form-data';
import axios from 'axios';

/**
 * Upload video/audio to Cloudflare Stream
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type (video/webm, audio/webm, etc.)
 * @returns {Promise<{uid: string, playbackUrl: string, duration: number}>}
 */
export async function uploadToStream(buffer, filename, mimeType) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (!accountId || !token) {
    throw new Error('Cloudflare Stream credentials not configured');
  }

  const streamUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
  
  const formData = new FormData();
  formData.append('file', buffer, {
    filename,
    contentType: mimeType,
  });

  try {
    const response = await axios.post(streamUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const videoData = response.data.result;
    return {
      uid: videoData.uid,
      playbackUrl: `https://customer-${accountId}.cloudflarestream.com/${videoData.uid}/manifest/video.m3u8`,
      duration: videoData.duration || 0,
    };
  } catch (error) {
    console.error('Cloudflare Stream upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload to Cloudflare Stream: ${error.message}`);
  }
}