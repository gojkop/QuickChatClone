// api/questions/deep-dive.js
// Deep Dive submission endpoint (Tier 2: Proposed price, requires expert acceptance)

import { sendNewQuestionNotification, sendQuestionConfirmationNotification } from '../lib/zeptomail.js';
import { fetchUserData } from '../lib/user-data.js';

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
      recordingSegments = [],
      attachments = [],
      sla_hours_snapshot,
      proposed_price_cents,
      asker_message,
      stripe_payment_intent_id
    } = req.body;

    // Validation
    if (!expertHandle || !title || !payerEmail || !proposed_price_cents) {
      return res.status(400).json({
        error: 'Missing required fields: expertHandle, title, payerEmail, proposed_price_cents'
      });
    }

    if (!stripe_payment_intent_id) {
      return res.status(400).json({
        error: 'Missing stripe_payment_intent_id (payment authorization required)'
      });
    }

    // Get expert profile from Xano public endpoint
    const expertResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!expertResponse.ok) {
      throw new Error('Expert not found');
    }

    const expertData = await expertResponse.json();
    const expertProfile = expertData.expert_profile || expertData;

    // ✅ CREATE MEDIA_ASSET RECORD IF RECORDINGS EXIST
    let mediaAssetId = null;

    if (recordingSegments && recordingSegments.length > 0) {
      console.log('📹 Creating media_asset record for', recordingSegments.length, 'segments');
      
      const firstSegment = recordingSegments[0];
      const totalDuration = recordingSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
      
      const metadata = {
        type: 'multi-segment',
        mime_type: 'video/webm',
        segments: recordingSegments.map(seg => ({
          uid: seg.uid,
          playback_url: seg.playbackUrl,
          duration: seg.duration,
          mode: seg.mode,
          segment_index: seg.segmentIndex,
        })),
        segment_count: recordingSegments.length,
      };
      
      try {
        const mediaAssetResponse = await fetch(
          `${process.env.XANO_PUBLIC_API_URL}/media_asset`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              owner_type: 'question',
              owner_id: 0, // Placeholder - Xano will update this
              provider: 'cloudflare_stream',
              asset_id: firstSegment.uid,
              duration_sec: Math.round(totalDuration),
              status: 'ready',
              url: firstSegment.playbackUrl,
              metadata: JSON.stringify(metadata),
              segment_index: null, // Parent record
            })
          }
        );

        if (mediaAssetResponse.ok) {
          const mediaAssetData = await mediaAssetResponse.json();
          mediaAssetId = mediaAssetData.id;
          console.log('✅ Media asset created, ID:', mediaAssetId);
        } else {
          const errorText = await mediaAssetResponse.text();
          console.error('❌ Failed to create media_asset:', errorText);
          // Continue anyway - don't fail the whole question submission
        }
      } catch (mediaError) {
        console.error('❌ Error creating media_asset:', mediaError);
        // Continue anyway
      }
    }

    // Call Xano endpoint for Deep Dive
    const xanoResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/question/deep-dive`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_profile_id: expertProfile.id,
          payer_email: payerEmail,
          proposed_price_cents,
          asker_message: asker_message || null,
          title,
          text: text || null,
          attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
          media_asset_id: mediaAssetId, // ✅ FIXED: Now using the created media_asset ID
          sla_hours_snapshot,
          stripe_payment_intent_id
        })
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      throw new Error(errorData.message || 'Failed to create Deep Dive offer');
    }

    const result = await xanoResponse.json();

    const questionId = result.question_id;
    const reviewToken = result.playback_token_hash || result.review_token;

    // Send email notifications
    // 1. Send notification to expert (about new offer)
    const userId = expertProfile.user_id || expertProfile._user?.id;

    if (userId) {
      try {
        const expertData = await fetchUserData(userId);

        if (expertData?.email) {
          console.log('📧 Sending expert notification to:', expertData.email);

          await sendNewQuestionNotification({
            expertEmail: expertData.email,
            expertName: expertData.name || 'Expert',
            questionTitle: title,
            questionText: text || asker_message || '(Video/audio question)',
            askerEmail: payerEmail,
            questionId,
          });
          console.log('✅ Expert notification sent');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send expert notification:', emailErr.message);
      }
    }

    // 2. Send confirmation to asker
    if (payerEmail) {
      const askerName = [payerFirstName, payerLastName].filter(Boolean).join(' ') || payerEmail.split('@')[0];

      try {
        await sendQuestionConfirmationNotification({
          askerEmail: payerEmail,
          askerName: askerName,
          expertName: expertProfile.name || 'the expert',
          questionTitle: title,
          questionText: text || asker_message || '(Video/audio question)',
          questionId,
          reviewToken: reviewToken,
          slaHours: sla_hours_snapshot,
        });
        console.log('✅ Asker confirmation sent');
      } catch (emailErr) {
        console.error('❌ Failed to send asker confirmation:', emailErr.message);
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        questionId: result.question_id,
        review_token: reviewToken,
        status: result.status,
        proposed_price_cents: result.proposed_price_cents,
        offer_expires_at: result.offer_expires_at,
        media_asset_id: mediaAssetId // Include for debugging
      }
    });

  } catch (error) {
    console.error('Deep Dive submission error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to submit Deep Dive offer'
    });
  }
}