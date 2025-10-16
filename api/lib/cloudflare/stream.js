import FormData from 'form-data';
import axios from 'axios';

/**
 * Enable downloads for a Cloudflare Stream video
 * @param {string} videoId - Cloudflare Stream video UID
 * @returns {Promise<void>}
 */
export async function enableDownloads(videoId) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (!accountId || !token) {
    throw new Error('Cloudflare Stream credentials not configured');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/downloads`;

  try {
    const response = await axios.post(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.errors?.[0]?.message || 'Failed to enable downloads');
    }

    console.log(`✅ Downloads enabled for video: ${videoId}`);
  } catch (error) {
    console.error('Enable downloads error:', error.response?.data || error.message);
    // Don't throw - we don't want to fail the upload if downloads can't be enabled
    console.warn(`⚠️ Could not enable downloads for video ${videoId}, continuing anyway`);
  }
}

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
    const result = {
      uid: videoData.uid,
      playbackUrl: `https://customer-${accountId}.cloudflarestream.com/${videoData.uid}/manifest/video.m3u8`,
      duration: videoData.duration || 0,
    };

    // Enable downloads for this video
    await enableDownloads(videoData.uid);

    return result;
  } catch (error) {
    console.error('Cloudflare Stream upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload to Cloudflare Stream: ${error.message}`);
  }
}