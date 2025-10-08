// api/media/create-asset.js
// Creates a media_asset record in Xano after media is uploaded to Cloudflare
// Handles both single media files AND multi-segment recordings

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const {
      // Single media fields
      asset_id,      // Cloudflare UID (for single file)
      url,
      duration,      // In seconds
      type,          // 'video' or 'audio'
      size,
      mime_type,
      storage,       // 'stream' or 'r2'
      
      // Multi-segment fields
      segments,      // Array of segment objects
      mode,          // 'multi-segment' for segments
      totalDuration, // Total duration for segments
      
      // Common fields
      owner_type,    // 'answer' (will always be 'answer' for this flow)
      owner_id,      // answer.id (may be null initially, updated later)
    } = req.body;

    // ✅ Handle multi-segment recording
    if (segments && Array.isArray(segments) && segments.length > 0) {
      console.log('Creating media_asset for multi-segment recording:', segments.length, 'segments');
      
      // Create a parent media_asset record that represents the full recording
      const xanoResponse = await fetch(
        `${process.env.XANO_BASE_URL}/media_asset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XANO_API_KEY}`,
          },
          body: JSON.stringify({
            owner_type: owner_type || 'answer',
            owner_id: owner_id || null,
            provider: 'cloudflare_stream', // Assuming video segments
            asset_id: segments[0].uid, // Use first segment's UID as reference
            duration_sec: Math.round(totalDuration || 0),
            status: 'ready',
            url: segments[0].playback_url || segments[0].playbackUrl, // First segment URL
            metadata: {
              type: mode || 'multi-segment',
              mime_type: 'video/webm',
              segments: segments.map(seg => ({
                uid: seg.uid,
                playback_url: seg.playback_url || seg.playbackUrl,
                duration: seg.duration,
                mode: seg.mode,
              })),
              segment_count: segments.length,
            },
            segment_index: null, // Parent record has no segment index
          }),
        }
      );

      if (!xanoResponse.ok) {
        const errorData = await xanoResponse.json();
        console.error('Xano error:', errorData);
        throw new Error(errorData.message || 'Failed to create media_asset record');
      }

      const mediaAsset = await xanoResponse.json();
      console.log('✅ Multi-segment media asset created:', mediaAsset.id);

      return res.status(201).json({
        success: true,
        data: {
          id: mediaAsset.id,
          media_asset_id: mediaAsset.id,
          asset_id: mediaAsset.asset_id,
          url: mediaAsset.url,
          duration_sec: mediaAsset.duration_sec,
          provider: mediaAsset.provider,
          status: mediaAsset.status,
          segment_count: segments.length,
          created_at: mediaAsset.created_at,
        },
      });
    }

    // ✅ Handle single media file (original behavior)
    // Validation
    if (!asset_id || !url || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: asset_id, url, type (or segments array)',
      });
    }

    // Validate type
    if (!['video', 'audio'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be: video or audio',
      });
    }

    // Map storage to provider
    const provider = storage === 'stream' ? 'cloudflare_stream' : 'cloudflare_r2';

    console.log('Creating media_asset record (single):', {
      asset_id,
      type,
      provider,
      size,
      owner_type: owner_type || 'answer',
    });

    // Build metadata JSON
    const metadata = {
      type,
      mime_type: mime_type || (type === 'video' ? 'video/webm' : 'audio/webm'),
      size: size || 0,
    };

    // Create media_asset record in Xano
    const xanoResponse = await fetch(
      `${process.env.XANO_BASE_URL}/media_asset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.XANO_API_KEY}`,
        },
        body: JSON.stringify({
          owner_type: owner_type || 'answer',
          owner_id: owner_id || null,
          provider,
          asset_id,
          duration_sec: Math.round(duration || 0),
          status: 'ready',
          url,
          metadata,
          segment_index: null, // Single concatenated file
        }),
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      console.error('Xano error:', errorData);
      throw new Error(errorData.message || 'Failed to create media_asset record');
    }

    const mediaAsset = await xanoResponse.json();

    console.log('✅ Media asset created:', mediaAsset.id);

    return res.status(201).json({
      success: true,
      data: {
        id: mediaAsset.id,
        media_asset_id: mediaAsset.id,
        asset_id: mediaAsset.asset_id,
        url: mediaAsset.url,
        duration_sec: mediaAsset.duration_sec,
        provider: mediaAsset.provider,
        status: mediaAsset.status,
        created_at: mediaAsset.created_at,
      },
    });

  } catch (error) {
    console.error('Error creating media_asset:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};