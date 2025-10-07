// client/src/lib/cloudflare.js
// Frontend helpers for Cloudflare R2 and Stream

const ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;

/**
 * Upload image to Cloudflare R2 via backend API
 * @param {File} file - The image file
 * @param {string} folder - Folder path (e.g., 'profiles', 'documents')
 * @returns {Promise<Object>} - { url, key }
 */
export async function uploadImage(file, folder = 'images') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Upload profile picture
 * @param {File} file - The image file
 * @param {string} userId - User ID for organizing
 * @returns {Promise<Object>} - Returns { url, key }
 */
export async function uploadProfilePicture(file, userId) {
  return uploadImage(file, `profiles/${userId}`);
}

/**
 * Upload document to Cloudflare R2
 * @param {File} file - The document file
 * @param {string} folder - Folder path
 * @returns {Promise<Object>} - { url, key, filename }
 */
export async function uploadDocument(file, folder = 'documents') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload/document', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Upload video/audio to Cloudflare Stream
 * @param {Blob} blob - The recorded media blob
 * @param {Object} metadata - Metadata (title, userId, etc.)
 * @returns {Promise<Object>} - { uid, thumbnail, playback, preview }
 */
export async function uploadToStream(blob, metadata = {}) {
  try {
    // 1. Get a unique, one-time upload URL from your backend.
    // This endpoint securely communicates with Cloudflare to generate the URL.
    const urlResponse = await fetch('/api/media/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata }) // Send any metadata needed
    });

    if (!urlResponse.ok) {
      throw new Error('Could not get an upload URL.');
    }

    const { uploadURL } = await urlResponse.json();

    // 2. Upload the file DIRECTLY to the Cloudflare URL.
    // Do NOT send this to your /api/ endpoint.
    // Use the Blob directly as the body.
    const uploadResponse = await fetch(uploadURL, {
      method: 'POST',
      body: blob,
      headers: {
        // Cloudflare's TUS protocol might require this
        'Content-Type': 'application/offset+octet-stream'
      }
    });

    if (!uploadResponse.ok) {
      throw new Error('Direct upload to Cloudflare failed.');
    }
    
    // 3. (Optional but Recommended) You can now get the video UID from the
    // 'stream-media-id' header of the uploadResponse and notify your backend
    // that the upload is complete, linking the video ID to your user.

    const videoId = uploadResponse.headers.get('stream-media-id');
    console.log('Successfully uploaded video with ID:', videoId);

    // Return the result or handle it as needed
    return { success: true, uid: videoId };

  } catch (error) {
    console.error('Stream upload process failed:', error);
    throw error;
  }
}

/**
 * Get Cloudflare Stream embed URL
 * @param {string} videoId - The Stream video UID
 * @returns {string} - Stream iframe URL
 */
export function getStreamEmbedUrl(videoId) {
  return `https://customer-${ACCOUNT_ID.substring(0, 32)}.cloudflarestream.com/${videoId}/iframe`;
}

/**
 * Get Cloudflare Stream video element src
 * @param {string} videoId - The Stream video UID
 * @returns {string} - Stream video src URL
 */
export function getStreamVideoUrl(videoId) {
  return `https://customer-${ACCOUNT_ID.substring(0, 32)}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
}