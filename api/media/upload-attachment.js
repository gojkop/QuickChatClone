// ============================================
// FILE: api/media/upload-attachment.js
// Upload single attachment to Cloudflare R2
// ============================================

// ⭐ FIX: Change 'cloudflare' to 'claudflare'
import { uploadToR2 } from '../lib/claudflare/r2.js';

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
    console.log('Upload attachment request received');
    
    const { file } = req.body;

    // Validation
    if (!file) {
      console.error('Missing file');
      return res.status(400).json({ error: 'file is required' });
    }

    if (!file.name || !file.type || !file.data) {
      console.error('Invalid file object:', { 
        hasName: !!file.name, 
        hasType: !!file.type, 
        hasData: !!file.data 
      });
      return res.status(400).json({ 
        error: 'file must have name, type, and data properties' 
      });
    }

    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.data.length
    });

    // Convert base64 to buffer
    const buffer = Buffer.from(file.data, 'base64');
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxSize) {
      return res.status(400).json({ 
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` 
      });
    }

    // Create unique key for R2
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `question-attachments/${timestamp}-${sanitizedName}`;

    console.log('Uploading to R2:', { key, size: buffer.length });

    // Upload to R2
    const url = await uploadToR2(buffer, key, file.type);

    console.log('Upload successful:', url);

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
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload attachment',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}