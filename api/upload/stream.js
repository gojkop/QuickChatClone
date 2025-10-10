// api/upload/stream.js
const formidable = require('formidable');
const fs = require('fs').promises;
const FormData = require('form-data');
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ 
    maxFileSize: 200 * 1024 * 1024,
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
      const formData = new FormData();
      const fileStream = await fs.readFile(file.filepath);
      
      formData.append('file', fileStream, {
        filename: file.originalFilename || 'recording',
        contentType: file.mimetype,
      });

      const metadata = {
        name: fields.title || 'QuickChat Recording',
      };
      
      if (fields.userId) {
        metadata.userId = fields.userId;
      }

      formData.append('meta', JSON.stringify(metadata));

      // ✅ Add allowed origins - NO PROTOCOL!
      formData.append('allowedOrigins', JSON.stringify([
        'mindpick.me',
        'localhost:3000',
        'localhost:5173',
        '*.vercel.app'
      ]));

      formData.append('requireSignedURLs', 'false');

      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      await fs.unlink(file.filepath);

      if (!response.data.success) {
        throw new Error('Stream upload failed');
      }

      const video = response.data.result;

      res.status(200).json({
        success: true,
        uid: video.uid,
        playback: video.playback,
        thumbnail: video.thumbnail,
        preview: video.preview,
        status: video.status,
      });
    } catch (error) {
      console.error('Stream upload error:', error);
      res.status(500).json({ 
        message: 'Stream upload failed', 
        error: error.response?.data || error.message 
      });
    }
  });
};