// api/questions/quick-consult.js
// Quick Consult submission endpoint (Tier 1: Fixed price, immediate SLA)

import { sendNewQuestionNotification, sendQuestionConfirmationNotification } from '../lib/zeptomail.js';
import { fetchUserData } from '../lib/user-data.js';
import { updatePaymentIntentMetadata } from '../lib/stripe.js';

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
      media_asset_id,  // ✅ Now receiving the ID from frontend
      attachments = [],
      sla_hours_snapshot,
      stripe_payment_intent_id
    } = req.body;

    // Validation
    if (!expertHandle || !title || !payerEmail || !stripe_payment_intent_id) {
      return res.status(400).json({
        error: 'Missing required fields: expertHandle, title, payerEmail, stripe_payment_intent_id'
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

    // Call Xano endpoint for Quick Consult
    const xanoResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/question/quick-consult`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_profile_id: expertProfile.id,
          payer_email: payerEmail,
          title,
          text: text || null,
          attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
          media_asset_id: media_asset_id || null, // ✅ Just pass it through
          sla_hours_snapshot,
          stripe_payment_intent_id
        })
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    const result = await xanoResponse.json();

    const questionId = result.question_id;
    const reviewToken = result.playback_token_hash || result.review_token;

    // Update payment intent metadata with question ID (for later retrieval)
    if (stripe_payment_intent_id) {
      try {
        console.log(`💳 Updating payment intent ${stripe_payment_intent_id} with question_id: ${questionId}`);
        await updatePaymentIntentMetadata(stripe_payment_intent_id, {
          question_id: String(questionId)
        });
        console.log('✅ Payment intent metadata updated');
      } catch (metadataError) {
        console.error('⚠️ Failed to update payment intent metadata:', metadataError.message);
        // Non-critical error - continue anyway
      }
    }

    // Send email notifications (unchanged)
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
            questionText: text || '(Video/audio question)',
            askerEmail: payerEmail,
            questionId,
          });
          console.log('✅ Expert notification sent');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send expert notification:', emailErr.message);
      }
    }

    if (payerEmail) {
      const askerName = [payerFirstName, payerLastName].filter(Boolean).join(' ') || payerEmail.split('@')[0];

      try {
        await sendQuestionConfirmationNotification({
          askerEmail: payerEmail,
          askerName: askerName,
          expertName: expertProfile.name || 'the expert',
          questionTitle: title,
          questionText: text || '(Video/audio question)',
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
        sla_deadline: result.sla_deadline,
        final_price_cents: result.final_price_cents,
        media_asset_id: media_asset_id // Include for debugging
      }
    });

  } catch (error) {
    console.error('Quick Consult submission error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to submit question'
    });
  }
}