import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const segmentIndex = req.headers['x-segment-index'];
    const mode = req.headers['x-mode'];
    const duration = req.headers['x-duration'];

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const videoBuffer = Buffer.concat(chunks);
    
    console.log('Received video buffer:', videoBuffer.length, 'bytes');
    
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      },
    });

    const fileName = `recordings/segment-${Date.now()}-${segmentIndex}.webm`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: videoBuffer,
      ContentType: 'video/webm',
      Metadata: {
        segmentIndex: String(segmentIndex),
        mode: mode || 'video',
        duration: String(duration || 0),
      },
    }));

    console.log('✅ Uploaded to R2:', fileName);

    // Use public URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
    console.log('Public URL:', publicUrl);

    // Trigger Stream to pull from public R2 URL
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    
    const streamResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/copy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: publicUrl,
          meta: {
            name: `Segment ${segmentIndex}`,
            segmentIndex: String(segmentIndex),
            mode: mode,
          },
        }),
      }
    );

    const streamResult = await streamResponse.json();
    
    console.log('Stream response status:', streamResponse.status);
    console.log('Stream result:', JSON.stringify(streamResult, null, 2));
    
    if (!streamResponse.ok || !streamResult.success) {
      throw new Error(streamResult.errors?.[0]?.message || 'Stream copy failed');
    }

    const video = streamResult.result;
    
    return res.status(200).json({
      success: true,
      data: {
        uid: video.uid,
        playbackUrl: video.playback?.hls,
        thumbnail: video.thumbnail,
        duration: duration || 0,
        mode: mode,
        status: video.status,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}