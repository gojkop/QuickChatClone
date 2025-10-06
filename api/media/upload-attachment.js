// ============================================
// FILE: api/media/upload-attachment.js
// Upload single file attachment to Cloudflare R2
// ============================================
import { uploadToR2 } from '../lib/cloudflare/r2.js';
import { validateAttachment } from '../lib/validators.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file } = req.body;

    // Validation
    if (!file || !file.name || !file.data || !file.type) {
      return res.status(400).json({ 
        error: 'Invalid file object. Required: name, data, type' 
      });
    }

    // Validate file size and type
    validateAttachment(file, {
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: null, // Allow all types for now
    });

    // Upload to R2
    const buffer = Buffer.from(file.data, 'base64');
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `question-attachments/${timestamp}-${sanitizedName}`;

    const url = await uploadToR2(buffer, key, file.type);

    return res.status(200).json({
      success: true,
      data: {
        name: file.name,
        url,
        type: file.type,
        size: buffer.length,
      },
    });

  } catch (error) {
    console.error('Attachment upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload attachment',
    });
  }
}