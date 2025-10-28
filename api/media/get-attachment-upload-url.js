// api/media/get-attachment-upload-url.js
// Generate presigned URL for direct R2 upload (bypasses 4.5MB Vercel limit)

import { getPresignedUploadUrl } from '../lib/cloudflare/r2.js';

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
    const { filename, contentType, size } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'filename is required' });
    }

    if (!contentType) {
      return res.status(400).json({ error: 'contentType is required' });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (size && size > maxSize) {
      return res.status(400).json({
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      });
    }

    // Create unique key for R2
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `question-attachments/${timestamp}-${sanitizedName}`;

    console.log('Generating presigned URL:', {
      filename,
      contentType,
      size,
      key,
    });

    // Generate presigned URL (valid for 1 hour)
    const result = await getPresignedUploadUrl(key, contentType, 3600);

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
        key: result.key,
        filename: filename,
      },
    });

  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate upload URL',
    });
  }
}
