// api/media/upload-audio.js
// Uploads audio files to Cloudflare R2 (object storage)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false, // Required for binary uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎤 Starting audio upload to R2...');

    // Collect audio data from request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    console.log('Audio buffer size:', audioBuffer.length, 'bytes');

    if (audioBuffer.length === 0) {
      throw new Error('No audio data received');
    }

    // Verify it's a valid WebM audio file (magic bytes: 1a 45 df a3)
    const magicBytes = audioBuffer.slice(0, 4).toString('hex');
    if (magicBytes !== '1a45dfa3') {
      console.warn('⚠️ Unexpected magic bytes for WebM:', magicBytes);
      // Don't fail - some audio might have different encoding
    }

    // Verify R2 credentials
    const {
      CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_R2_ACCESS_KEY,
      CLOUDFLARE_R2_SECRET_KEY,
      CLOUDFLARE_R2_BUCKET,
      CLOUDFLARE_R2_PUBLIC_URL
    } = process.env;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY || 
        !CLOUDFLARE_R2_SECRET_KEY || !CLOUDFLARE_R2_BUCKET) {
      throw new Error('R2 credentials not configured. Please set environment variables.');
    }

    // Generate unique filename
    const uid = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const fileName = `audio/${timestamp}-${uid}.webm`;

    // Initialize S3 client (R2 is S3-compatible)
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET_KEY,
      },
    });

    console.log('Uploading to R2 bucket:', CLOUDFLARE_R2_BUCKET);
    console.log('File name:', fileName);

    // Upload to R2
    await s3Client.send(new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: audioBuffer,
      ContentType: 'audio/webm',
      ContentLength: audioBuffer.length,
    }));

    console.log('✅ Audio uploaded to R2');

    // Build public URL
    const publicUrl = CLOUDFLARE_R2_PUBLIC_URL 
      ? `${CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`
      : `https://pub-${CLOUDFLARE_ACCOUNT_ID}.r2.dev/${fileName}`;

    console.log('Public URL:', publicUrl);

    // Return response matching video upload structure
    return res.status(200).json({
      success: true,
      data: {
        uid,
        playbackUrl: publicUrl, // Direct URL to audio file
        duration: 0, // Will be set by frontend
        mode: 'audio',
        size: audioBuffer.length,
        fileName,
      },
    });

  } catch (error) {
    console.error('❌ Audio upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Audio upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}