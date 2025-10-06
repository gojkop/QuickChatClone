import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { segmentIndex, mode, duration } = req.body;
    
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      },
    });

    const fileName = `recordings/segment-${Date.now()}-${segmentIndex}.webm`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      ContentType: 'video/webm',
      Metadata: {
        segmentIndex: String(segmentIndex),
        mode: mode || 'video',
        duration: String(duration || 0),
      },
    });

    // Generate presigned URL (valid for 10 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        fileName,
      },
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: error.message });
  }
}