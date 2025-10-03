// api/upload/document.js
// Upload documents to Cloudflare R2

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const formidable = require('formidable');
const fs = require('fs').promises;
const path = require('path');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ 
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true 
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ message: 'Failed to parse upload' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    try {
      // Read file
      const fileBuffer = await fs.readFile(file.filepath);
      
      // Generate unique key
      const folder = fields.folder || 'documents';
      const timestamp = Date.now();
      const originalName = file.originalFilename || 'file';
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${folder}/${timestamp}-${sanitizedName}`;

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream',
      });

      await s3Client.send(command);

      // Clean up temp file
      await fs.unlink(file.filepath);

      // Return public URL
      const url = `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;

      res.status(200).json({
        success: true,
        url,
        key,
        filename: file.originalFilename,
        size: file.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });
};