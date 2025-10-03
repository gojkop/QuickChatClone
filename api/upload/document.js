// api/upload/document.js
// Serverless function for document uploads to Vercel Blob

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get file from multipart form data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Must be multipart/form-data' });
    }

    // For serverless, you'll need to use a library like 'formidable' or 'busboy'
    // to parse multipart data. Here's a simple example:
    
    // Install: npm install formidable
    const formidable = require('formidable');
    const fs = require('fs').promises;
    
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to parse form data' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Read file buffer
      const fileBuffer = await fs.readFile(file.filepath);
      
      // Upload to Vercel Blob
      const folder = fields.folder || 'documents';
      const filename = `${folder}/${Date.now()}-${file.originalFilename}`;
      
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      // Clean up temp file
      await fs.unlink(file.filepath);

      return res.status(200).json({
        success: true,
        url: blob.url,
        filename: file.originalFilename,
        size: file.size,
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
