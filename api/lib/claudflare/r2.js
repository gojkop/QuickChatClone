import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

  if (!accessKeyId || !secretAccessKey || !bucket || !accountId) {
    throw new Error('Cloudflare R2 credentials not configured');
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

    return `https://pub-${accountId}.r2.dev/${key}`;
  } catch (error) {
    console.error('R2 upload error:', error);
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