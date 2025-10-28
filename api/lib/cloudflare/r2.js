import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} buffer - File buffer
 * @param {string} key - Storage key/path
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL
 */
export async function uploadToR2(buffer, key, contentType) {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL; // ⭐ USE CONFIGURED URL

  if (!accessKeyId || !secretAccessKey || !bucket || !accountId) {
    throw new Error('Cloudflare R2 credentials not configured');
  }

  if (!publicUrl) {
    throw new Error('CLOUDFLARE_R2_PUBLIC_URL environment variable not configured');
  }

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // ⭐ USE CONFIGURED PUBLIC URL
    const fullUrl = publicUrl.endsWith('/') 
      ? `${publicUrl}${key}` 
      : `${publicUrl}/${key}`;
    
    console.log('✅ R2 upload successful:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('❌ R2 upload error:', error);
    throw new Error(`Failed to upload to R2: ${error.message}`);
  }
}

/**
 * Upload multiple files to R2
 * @param {Array<{name: string, data: string, type: string}>} files
 * @param {string} prefix - Storage prefix (e.g., 'question-attachments')
 * @returns {Promise<Array<{name: string, url: string, type: string, size: number}>>}
 */
export async function uploadMultipleToR2(files, prefix = 'attachments') {
  const uploadPromises = files.map(async (file) => {
    const buffer = Buffer.from(file.data, 'base64');
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${prefix}/${timestamp}-${sanitizedName}`;
    
    const url = await uploadToR2(buffer, key, file.type);
    
    return {
      name: file.name,
      url,
      type: file.type,
      size: buffer.length,
    };
  });

  return Promise.all(uploadPromises);
}

/**
 * Generate presigned URL for direct upload to R2
 * @param {string} key - Storage key/path
 * @param {string} contentType - MIME type
 * @param {number} expiresIn - URL expiration in seconds (default 3600 = 1 hour)
 * @returns {Promise<{uploadUrl: string, publicUrl: string, key: string}>}
 */
export async function getPresignedUploadUrl(key, contentType, expiresIn = 3600) {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!accessKeyId || !secretAccessKey || !bucket || !accountId) {
    throw new Error('Cloudflare R2 credentials not configured');
  }

  if (!publicUrl) {
    throw new Error('CLOUDFLARE_R2_PUBLIC_URL environment variable not configured');
  }

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });

    const finalPublicUrl = publicUrl.endsWith('/')
      ? `${publicUrl}${key}`
      : `${publicUrl}/${key}`;

    console.log('✅ Generated presigned URL for:', key);

    return {
      uploadUrl,
      publicUrl: finalPublicUrl,
      key,
    };
  } catch (error) {
    console.error('❌ Failed to generate presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}