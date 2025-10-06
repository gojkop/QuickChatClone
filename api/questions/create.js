// ============================================
// FILE: api/questions/create.js
// Create question with pre-uploaded content
// ============================================
import { getExpertByHandle } from '../lib/xano/expert.js';
import { createQuestion, updateQuestion } from '../lib/xano/question.js';
import { createMediaAsset } from '../lib/xano/media.js';

/**
 * Create question using already-uploaded content
 * No uploads happen here - content is already in Cloudflare
 * 
 * ⭐ UPDATED: Now supports multiple recording segments!
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      expertHandle,
      title,
      text,
      payerEmail,
      payerFirstName,
      payerLastName,
      
      // ⭐ NEW: Multiple recording segments (already uploaded!)
      recordingSegments = [],  // [{uid, playbackUrl, duration, mode, segmentIndex}]
      
      // Attachments (already uploaded!)
      attachments = [],  // [{name, url, type, size}]
      
      // ⭐ OLD FORMAT: Support for backward compatibility
      recordingUid,
      recordingPlaybackUrl,
      recordingDuration,
      recordingMode,
    } = req.body;

    console.log('Question creation request:', {
      expertHandle,
      title,
      segmentCount: recordingSegments.length,
      attachmentCount: attachments.length,
      hasOldFormatRecording: !!recordingUid,
    });

    // Validate required fields
    if (!expertHandle) {
      return res.status(400).json({ error: 'expertHandle is required' });
    }
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!payerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return res.status(400).json({ error: 'valid payerEmail is required' });
    }

    // 1. Get expert profile
    console.log('Fetching expert profile...');
    const expert = await getExpertByHandle(expertHandle);
    console.log('Expert found:', expert.id);

    // 2. Create question record (without media_asset_id initially)
    console.log('Creating question...');
    const question = await createQuestion({
      expertProfileId: expert.id,
      title: title.trim(),
      text: text?.trim() || '',
      attachments: attachments.length > 0 ? attachments : null,
      payerEmail,
      payerFirstName: payerFirstName || null,
      payerLastName: payerLastName || null,
      priceCents: expert.price_cents || 5000,
      currency: expert.currency || 'USD',
      status: 'pending_payment',
      slaHours: expert.sla_hours || 48,
    });
    console.log('Question created:', question.id);

    // ⭐ 3. Create media_asset records for MULTIPLE segments
    const mediaAssetIds = [];
    
    // Handle NEW format (multiple segments)
    if (recordingSegments.length > 0) {
      console.log(`Creating ${recordingSegments.length} media assets...`);
      
      for (let i = 0; i < recordingSegments.length; i++) {
        const segment = recordingSegments[i];
        
        try {
          const mediaAsset = await createMediaAsset({
            ownerType: 'question',
            ownerId: question.id,
            provider: 'cloudflare_stream',
            assetId: segment.uid,
            duration: Math.round(segment.duration || 0),
            status: 'ready', // Already uploaded!
            url: segment.playbackUrl,
            segmentIndex: segment.segmentIndex ?? i,
            metadata: {
              segmentIndex: segment.segmentIndex ?? i,
              mode: segment.mode || 'video',
            },
          });
          
          mediaAssetIds.push(mediaAsset.id);
          console.log(`Media asset ${i + 1}/${recordingSegments.length} created:`, mediaAsset.id);
        } catch (error) {
          console.error(`Failed to create media asset for segment ${i}:`, error);
          // Continue with other segments
        }
      }
    } 
    // Handle OLD format (single recording) for backward compatibility
    else if (recordingUid && recordingPlaybackUrl) {
      console.log('Creating single media asset (old format)...');
      
      const mediaAsset = await createMediaAsset({
        ownerType: 'question',
        ownerId: question.id,
        provider: 'cloudflare_stream',
        assetId: recordingUid,
        duration: recordingDuration || 0,
        status: 'ready',
        url: recordingPlaybackUrl,
        segmentIndex: 0,
        metadata: {
          segmentIndex: 0,
          mode: recordingMode || 'video',
        },
      });
      
      mediaAssetIds.push(mediaAsset.id);
      console.log('Media asset created:', mediaAsset.id);
    }

    // 4. Update question with first segment's media_asset_id
    if (mediaAssetIds.length > 0) {
      console.log('Updating question with first media_asset_id...');
      await updateQuestion(question.id, {
        mediaAssetId: mediaAssetIds[0],
      });
    }

    // 5. Mark as paid (dev mode only)
    if (process.env.SKIP_STRIPE === 'true') {
      console.log('Dev mode: marking as paid...');
      await updateQuestion(question.id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
      });
    }

    console.log('✅ Question created successfully!');

    return res.status(200).json({
      success: true,
      data: {
        questionId: question.id,
        mediaAssetIds,
        segmentCount: recordingSegments.length,
        attachmentCount: attachments.length,
        status: process.env.SKIP_STRIPE === 'true' ? 'paid' : 'pending_payment',
      },
      // TODO: Add Stripe checkout URL in production
      checkoutUrl: null,
    });

  } catch (error) {
    console.error('❌ Question creation error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create question',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}