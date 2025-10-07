// ============================================
// FILE: api/media/upload-attachment.js
// Upload single attachment to Cloudflare R2
// ============================================
import { uploadToR2 } from '../lib/cloudflare/r2.js';

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

    // Validation - check each property separately
    if (!file) {
      console.error('Missing file object');
      return res.status(400).json({ error: 'file object is required' });
    }

    if (!file.name) {
      console.error('Missing file.name');
      return res.status(400).json({ error: 'file.name is required' });
    }

    if (!file.data) {
      console.error('Missing file.data');
      return res.status(400).json({ error: 'file.data is required' });
    }

    // Use fallback for missing type
    const fileType = file.type || 'application/octet-stream';

    console.log('Processing file:', {
      name: file.name,
      type: fileType,
      dataLength: file.data.length
    });

    // Convert base64 to buffer
    const buffer = Buffer.from(file.data, 'base64');
    
    console.log('Buffer created:', {
      size: buffer.length,
      sizeInMB: (buffer.length / 1024 / 1024).toFixed(2)
    });

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxSize) {
      console.error('File too large:', buffer.length);
      return res.status(400).json({ 
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` 
      });
    }

    // Validate file size isn't zero
    if (buffer.length === 0) {
      console.error('File is empty');
      return res.status(400).json({ error: 'File is empty' });
    }

    // Create unique key for R2
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `question-attachments/${timestamp}-${sanitizedName}`;

    console.log('Uploading to R2:', { 
      key, 
      size: buffer.length,
      contentType: fileType 
    });

    // Upload to R2
    const url = await uploadToR2(buffer, key, fileType);

    console.log('Upload successful:', url);

    return res.status(200).json({
      success: true,
      data: {
        name: file.name,
        url,
        type: fileType,
        size: buffer.length,
      },
    });

  } catch (error) {
    console.error('Attachment upload error:', error);
    console.error('Error stack:', error.stack);
    
    // More detailed error for R2 issues
    if (error.message?.includes('R2')) {
      console.error('R2 Configuration Error - Check environment variables:');
      console.error('- CLOUDFLARE_ACCOUNT_ID:', !!process.env.CLOUDFLARE_ACCOUNT_ID);
      console.error('- CLOUDFLARE_R2_ACCESS_KEY:', !!process.env.CLOUDFLARE_R2_ACCESS_KEY);
      console.error('- CLOUDFLARE_R2_SECRET_KEY:', !!process.env.CLOUDFLARE_R2_SECRET_KEY);
      console.error('- CLOUDFLARE_R2_BUCKET:', !!process.env.CLOUDFLARE_R2_BUCKET);
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload attachment',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}