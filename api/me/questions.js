import { getMediaAsset } from '../lib/xano/media.js';

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
    console.log('Raw Xano response:', JSON.stringify(data).substring(0, 500));

    // ✅ NEW: Fetch media_asset for each question and transform
    const enrichedData = await Promise.all(data.map(async (question) => {
      let cleanedAttachments = null;
      
      // Parse attachments safely
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
      
      // ✅ CRITICAL FIX: Fetch media_asset if media_asset_id exists
      let recordingSegments = [];
      
      if (question.media_asset_id) {
        try {
          console.log(`Fetching media_asset ${question.media_asset_id} for question ${question.id}`);
          const mediaAsset = await getMediaAsset(question.media_asset_id);
          
          if (mediaAsset) {
            // Parse metadata if it's a string
            const metadata = typeof mediaAsset.metadata === 'string'
              ? JSON.parse(mediaAsset.metadata)
              : mediaAsset.metadata;
            
            // Transform media_asset into recording_segments format
            if (metadata?.type === 'multi-segment' && metadata?.segments) {
              recordingSegments = metadata.segments.map(seg => ({
                id: seg.uid,
                url: seg.playback_url,
                duration_sec: seg.duration,
                segment_index: seg.segment_index,
                metadata: { mode: seg.mode }
              }));
              console.log(`✅ Transformed ${recordingSegments.length} segments for question ${question.id}`);
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
          }
        } catch (mediaError) {
          console.error(`Failed to fetch media_asset ${question.media_asset_id} for question ${question.id}:`, mediaError.message);
          // Continue without media - don't fail the whole request
        }
      }
      
      return {
        ...question,
        attachments: cleanedAttachments,
        recording_segments: recordingSegments  // ✅ Now populated with actual segment data!
      };
    }));

    return res.json(enrichedData);

  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch questions'
    });
  }
}