// ============================================
// FILE: api/media/upload-attachments.js
// Upload multiple attachments at once (batch)
// ============================================
import { uploadMultipleToR2 } from '../lib/cloudflare/r2.js';
import { validateAttachment } from '../lib/validators.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files array is required' });
    }

    // Validate all files first
    files.forEach(file => {
      validateAttachment(file, {
        maxSize: 50 * 1024 * 1024, // 50MB per file
      });
    });

    // Upload all files
    const results = await uploadMultipleToR2(files, 'question-attachments');

    return res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload attachments',
    });
  }
}