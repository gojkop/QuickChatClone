// ⚡ PHASE 1 OPTIMIZATION: Replaced N+1 query with batch fetching
import { getMediaAssetsBatch } from '../lib/xano/media.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from request
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch questions from Xano
    const response = await fetch(
      `${process.env.XANO_AUTH_BASE_URL}/me/questions`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Xano returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`📊 Fetched ${data.length} questions from Xano`);

    // ⚡ PHASE 1 OPTIMIZATION: Collect all unique media_asset_ids FIRST
    const mediaAssetIds = [...new Set(
      data
        .map(q => q.media_asset_id)
        .filter(id => id != null && id !== undefined)
    )];

    console.log(`⚡ Found ${mediaAssetIds.length} unique media assets to fetch`);

    // ⚡ PHASE 1 OPTIMIZATION: Batch fetch ALL media assets in ONE operation
    const startTime = Date.now();
    const mediaAssets = await getMediaAssetsBatch(mediaAssetIds);
    const fetchTime = Date.now() - startTime;
    
    console.log(`✅ Batch fetched ${mediaAssets.length} media assets in ${fetchTime}ms (vs ${mediaAssetIds.length * 50}ms+ with N+1)`);

    // Create a Map for O(1) lookup
    const mediaAssetMap = new Map(
      mediaAssets.map(asset => [asset.id, asset])
    );

    // ⚡ PHASE 1 OPTIMIZATION: Enrich questions with media data (synchronous, no await needed)
    const enrichedData = data.map((question) => {
      // Parse attachments safely
      let cleanedAttachments = null;
      if (question.attachments) {
        try {
          cleanedAttachments = typeof question.attachments === 'string' 
            ? JSON.parse(question.attachments)
            : question.attachments;
        } catch (e) {
          console.error(`Invalid attachments JSON for question ${question.id}:`, e.message);
          cleanedAttachments = null;
        }
      }
      
      // Get media asset from map (O(1) lookup)
      let recordingSegments = [];
      
      if (question.media_asset_id) {
        const mediaAsset = mediaAssetMap.get(question.media_asset_id);
        
        if (mediaAsset) {
          // Parse metadata if it's a string
          let metadata = mediaAsset.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              console.error(`Failed to parse metadata for media_asset ${question.media_asset_id}:`, e);
              metadata = null;
            }
          }
          
          // Transform media_asset into recording_segments format
          if (metadata?.type === 'multi-segment' && metadata?.segments) {
            recordingSegments = metadata.segments.map(seg => ({
              id: seg.uid,
              url: seg.playback_url,
              duration_sec: seg.duration,
              segment_index: seg.segment_index,
              metadata: { mode: seg.mode }
            }));
          } else {
            // Single media file (legacy format)
            recordingSegments = [{
              id: mediaAsset.id,
              url: mediaAsset.url,
              duration_sec: mediaAsset.duration_sec,
              segment_index: 0,
              metadata: metadata
            }];
          }
        } else {
          console.warn(`Media asset ${question.media_asset_id} not found for question ${question.id}`);
        }
      }
      
      return {
        ...question,
        attachments: cleanedAttachments,
        recording_segments: recordingSegments
      };
    });

    console.log(`✅ Enriched ${enrichedData.length} questions with media data`);

    return res.json(enrichedData);

  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch questions'
    });
  }
}