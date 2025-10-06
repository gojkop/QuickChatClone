// ============================================
// FILE: api/lib/utils.js
// ============================================

/**
 * Decode base64 string to buffer
 * @param {string} base64String
 * @returns {Buffer}
 */
export function decodeBase64(base64String) {
  // Remove data URL prefix if present (e.g., "data:video/webm;base64,...")
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  return Buffer.from(base64Data, 'base64');
}

/**
 * Get MIME type from recording mode
 * @param {string} mode - 'video' or 'audio'
 * @returns {string}
 */
export function getMimeTypeFromMode(mode) {
  return mode === 'video' ? 'video/webm' : 'audio/webm';
}

/**
 * Get filename from recording mode
 * @param {string} mode - 'video' or 'audio'
 * @param {number} timestamp
 * @returns {string}
 */
export function getRecordingFilename(mode, timestamp = Date.now()) {
  const extension = mode === 'video' ? 'webm' : 'webm';
  return `recording-${timestamp}.${extension}`;
}

/**
 * Sanitize filename for safe storage
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}