export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, segmentIndex, mode, duration } = req.body;
    
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const bucket = process.env.CLOUDFLARE_R2_BUCKET;

    // Tell Stream to pull from R2
    const r2Url = `https://${bucket}.r2.cloudflarestorage.com/${fileName}`;
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/copy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: r2Url,
          meta: {
            name: `Segment ${segmentIndex}`,
            segmentIndex: String(segmentIndex),
            mode: mode,
          },
        }),
      }
    );

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.errors?.[0]?.message || 'Stream copy failed');
    }

    const video = result.result;
    
    return res.status(200).json({
      success: true,
      data: {
        uid: video.uid,
        playbackUrl: video.playback?.hls || `https://customer-${accountId.substring(0, 8)}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
        thumbnail: video.thumbnail,
        duration: duration || 0,
        mode: mode,
        status: video.status,
      },
    });

  } catch (error) {
    console.error('Stream trigger error:', error);
    return res.status(500).json({ error: error.message });
  }
}