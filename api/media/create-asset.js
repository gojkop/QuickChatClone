// api/media/create-asset.js
// Creates a media_asset record in Xano after media is uploaded to Cloudflare
// Works with existing schema: owner_type, owner_id, provider, asset_id

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const {
      asset_id,      // Cloudflare UID
      url,
      duration,      // In seconds
      type,          // 'video' or 'audio'
      size,
      mime_type,
      storage,       // 'stream' or 'r2'
      owner_type,    // 'answer' (will always be 'answer' for this flow)
      owner_id,      // answer.id (may be null initially, updated later)
    } = req.body;

    // Validation
    if (!asset_id || !url || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: asset_id, url, type',
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

    console.log('Creating media_asset record:', {
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