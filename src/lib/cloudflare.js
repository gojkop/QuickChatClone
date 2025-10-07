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
  const formData = new FormData();
  formData.append('file', blob, 'recording.webm');
  
  if (metadata.title) formData.append('title', metadata.title);
  if (metadata.userId) formData.append('userId', metadata.userId);

  const response = await fetch('/api/upload/stream', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Stream upload failed');
  }

  return response.json();
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