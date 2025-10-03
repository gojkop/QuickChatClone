// api/upload/profile-picture.js
// Specific endpoint for profile pictures

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formidable = require('formidable');
    const fs = require('fs').promises;
    
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 });
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to parse form data' });
      }

      const file = files.file;
      const userId = fields.userId;

      if (!file || !userId) {
        return res.status(400).json({ error: 'File and userId are required' });
      }

      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      // Read file
      const fileBuffer = await fs.readFile(file.filepath);
      
      // Upload to Cloudinary with face detection
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `quickchat/profiles/${userId}`,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
            overwrite: true,
            invalidate: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(fileBuffer);
      });

      // Clean up temp file
      await fs.unlink(file.filepath);

      return res.status(200).json({
        success: true,
        url: result.secure_url,
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture' });
  }
}