// api/upload/profile-picture.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function bufferToStream(buffer) {
  return Readable.from(buffer);
}

export default async function handler(req, res) {
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
    console.log('Starting upload process...');
    
    // Get raw body
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Parse multipart manually (simplified)
    const boundary = contentType.split('boundary=')[1];
    const chunks = [];
    
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    
    // Find file content between boundaries
    const parts = [];
    let start = 0;
    
    while (true) {
      const index = buffer.indexOf(boundaryBuffer, start);
      if (index === -1) break;
      if (start !== 0) parts.push(buffer.slice(start, index));
      start = index + boundaryBuffer.length;
    }
    
    // Find the part with the actual image data
    let fileBuffer = null;
    let contentTypeMatch = null;
    
    for (const part of parts) {
      const partStr = part.toString('binary', 0, 500); // Check first 500 bytes
      const contentTypeIdx = partStr.indexOf('Content-Type: image/');
      
      if (contentTypeIdx !== -1) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          fileBuffer = part.slice(headerEnd + 4, part.length - 2); // Remove trailing \r\n
          const ctEnd = partStr.indexOf('\r\n', contentTypeIdx);
          contentTypeMatch = partStr.substring(contentTypeIdx + 14, ctEnd).trim();
          break;
        }
      }
    }
    
    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file found in request' });
    }

    console.log('File extracted, size:', fileBuffer.length);

    // Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = contentTypeMatch ? contentTypeMatch.split('/')[1] : 'png';
    const fileName = `profiles/${timestamp}-${random}.${extension}`;

    console.log('Uploading to R2:', fileName);

    // Upload to R2
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentTypeMatch || 'image/png',
    }));

    const url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
    
    console.log('Upload successful:', url);

    return res.status(200).json({ url, message: 'Upload successful' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}