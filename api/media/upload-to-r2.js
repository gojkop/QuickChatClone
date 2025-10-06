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

    console.log('=== UPLOAD TO R2 ===');
    console.log('Segment index:', segmentIndex);
    console.log('Mode:', mode);
    console.log('Duration:', duration);

    // Collect video data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const videoBuffer = Buffer.concat(chunks);
    
    console.log('Video buffer size:', videoBuffer.length, 'bytes');

    // Verify it's a valid WebM file
    const magicBytes = videoBuffer.slice(0, 4).toString('hex');
    console.log('Magic bytes:', magicBytes);
    
    if (magicBytes !== '1a45dfa3') {
      return res.status(400).json({ 
        error: 'Invalid video format',
        details: `Expected WebM magic bytes 1a45dfa3, got ${magicBytes}`
      });
    }
    
    // Upload to R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      },
    });

    const fileName = `recordings/segment-${Date.now()}-${segmentIndex}.webm`;
    
    console.log('Uploading to R2 bucket:', process.env.CLOUDFLARE_R2_BUCKET);
    console.log('File name:', fileName);

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

    // Build public URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
    console.log('Public URL:', publicUrl);

    // Test if URL is accessible
    console.log('Testing URL accessibility...');
    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      console.log('URL test status:', testResponse.status, testResponse.statusText);
      
      if (!testResponse.ok) {
        console.error('⚠️ URL is not publicly accessible!');
        return res.status(500).json({ 
          error: 'R2 file uploaded but not publicly accessible',
          url: publicUrl,
          status: testResponse.status,
          hint: 'Check that your R2 bucket has Public Access enabled'
        });
      }
      console.log('✅ URL is accessible');
    } catch (fetchError) {
      console.error('URL test failed:', fetchError.message);
      return res.status(500).json({
        error: 'Could not verify R2 URL accessibility',
        url: publicUrl,
        details: fetchError.message
      });
    }

    // Trigger Cloudflare Stream to pull the video
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    
    console.log('Triggering Cloudflare Stream...');
    console.log('Account ID:', accountId);
    console.log('Using Stream copy endpoint');

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
    
    console.log('Stream API response status:', streamResponse.status);
    console.log('Stream API result:', JSON.stringify(streamResult, null, 2));
    
    if (!streamResponse.ok || !streamResult.success) {
      console.error('❌ Stream API error:', {
        status: streamResponse.status,
        success: streamResult.success,
        errors: streamResult.errors,
        messages: streamResult.messages,
      });
      
      const errorMessage = streamResult.errors?.[0]?.message || 
                          streamResult.messages?.[0] ||
                          'Stream copy failed';
      
      return res.status(500).json({
        error: errorMessage,
        cloudflareResponse: streamResult,
        publicUrl: publicUrl
      });
    }

    const video = streamResult.result;
    console.log('✅ Video uploaded to Stream:', video.uid);
    
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
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}