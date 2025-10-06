// ============================================
// FILE: api/media/upload-attachments.js
// Upload multiple attachments at once (batch)
// ============================================

// ⭐ FIX: Change 'cloudflare' to 'claudflare'
import { uploadMultipleToR2 } from '../lib/cloudflare/r2.js';
import { validateAttachment } from '../lib/cloudflare/validator.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Batch upload request received');
    
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files array is required' });
    }

    console.log(`Uploading ${files.length} files...`);

    // Validate all files first
    files.forEach((file, index) => {
      try {
        validateAttachment(file, {
          maxSize: 50 * 1024 * 1024, // 50MB per file
        });
      } catch (error) {
        throw new Error(`File ${index + 1} validation failed: ${error.message}`);
      }
    });

    // Upload all files
    const results = await uploadMultipleToR2(files, 'question-attachments');

    console.log(`Successfully uploaded ${results.length} files`);

    return res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload attachments',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}