// ============================================
// FILE: api/lib/validators.js
// ============================================

/**
 * Validate question submission payload
 * @param {Object} payload
 * @throws {Error} If validation fails
 */
export function validateQuestionSubmission(payload) {
  const errors = [];

  if (!payload.expertHandle) {
    errors.push('expertHandle is required');
  }

  if (!payload.title || payload.title.trim().length === 0) {
    errors.push('title is required');
  }

  if (payload.title && payload.title.length > 200) {
    errors.push('title must be 200 characters or less');
  }

  if (payload.text && payload.text.length > 5000) {
    errors.push('text must be 5000 characters or less');
  }

  if (!payload.payerEmail || !isValidEmail(payload.payerEmail)) {
    errors.push('valid payerEmail is required');
  }

  if (payload.recordingBlob && !payload.recordingMode) {
    errors.push('recordingMode is required when recordingBlob is provided');
  }

  if (payload.recordingMode && !['video', 'audio'].includes(payload.recordingMode)) {
    errors.push('recordingMode must be "video" or "audio"');
  }

  if (payload.attachments && !Array.isArray(payload.attachments)) {
    errors.push('attachments must be an array');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate file attachment
 * @param {Object} file
 * @param {Object} options
 */
export function validateAttachment(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = null, // null = allow all
  } = options;

  if (!file.name || !file.data || !file.type) {
    throw new Error('Invalid file object: missing name, data, or type');
  }

  const buffer = Buffer.from(file.data, 'base64');
  
  if (buffer.length > maxSize) {
    throw new Error(`File "${file.name}" exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`File type "${file.type}" not allowed`);
  }
}