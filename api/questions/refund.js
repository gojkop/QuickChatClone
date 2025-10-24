// api/questions/refund.js
// Refund a question by canceling the payment intent and updating question status

import { cancelPaymentIntent, findPaymentIntentByQuestionId } from '../lib/stripe.js';
import { sendEmail } from '../lib/zeptomail.js';
import { getOfferExpiredTemplate } from '../lib/email-templates/offer-expired.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question_id, refund_reason } = req.body;

    if (!question_id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    console.log(`💰 Refunding question ${question_id}...`);

    // Get question details from Xano
    const XANO_BASE_URL = process.env.XANO_BASE_URL;

    const questionResponse = await fetch(
      `${XANO_BASE_URL}/question/${question_id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!questionResponse.ok) {
      throw new Error('Failed to fetch question details');
    }

    const question = await questionResponse.json();

    console.log('🔍 Question details:', {
      id: question.id,
      status: question.status,
      payer_email: question.payer_email,
      tier: question.question_tier || question.tier_type,
    });

    // Find payment intent by question ID
    let paymentCanceled = false;
    let paymentIntentId = null;

    try {
      console.log(`💳 Searching for payment intent for question ${question_id}...`);
      const paymentIntent = await findPaymentIntentByQuestionId(question_id);

      if (paymentIntent && !paymentIntent.id.startsWith('pi_mock_')) {
        paymentIntentId = paymentIntent.id;
        console.log(`💳 Found payment intent: ${paymentIntentId}, status: ${paymentIntent.status}`);

        // Only cancel if it's in requires_capture or requires_payment_method status
        if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'requires_payment_method') {
          console.log(`💳 Canceling payment intent...`);
          await cancelPaymentIntent(paymentIntentId);
          console.log(`✅ Payment canceled successfully`);
          paymentCanceled = true;
        } else if (paymentIntent.status === 'canceled') {
          console.log(`✅ Payment was already canceled`);
          paymentCanceled = true;
        } else if (paymentIntent.status === 'succeeded') {
          console.error(`⚠️ Payment already captured - cannot cancel, requires manual refund`);
          return res.status(400).json({
            error: 'Payment has already been captured. Please contact support for manual refund.'
          });
        } else {
          console.log(`⚠️ Payment in unexpected status: ${paymentIntent.status}`);
        }
      } else if (paymentIntent?.id.startsWith('pi_mock_')) {
        console.log(`💳 [MOCK MODE] Skipping payment cancellation for mock payment intent`);
        paymentCanceled = true;
      } else {
        console.log(`⚠️ No payment intent found for this question`);
      }
    } catch (paymentError) {
      console.error(`❌ Failed to cancel payment:`, paymentError.message);
      // Continue anyway - we'll update the question status
    }

    // Update question status in Xano to "refunded"
    try {
      const updateResponse = await fetch(
        `${XANO_BASE_URL}/question/${question_id}/refund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_canceled: paymentCanceled,
            payment_intent_id: paymentIntentId,
            refund_reason: refund_reason || 'Expert declined',
          }),
        }
      );

      if (updateResponse.ok) {
        console.log(`✅ Question status updated to refunded`);
      } else {
        console.warn(`⚠️ Failed to update question status:`, updateResponse.status);
      }
    } catch (updateError) {
      console.error(`❌ Failed to update question status:`, updateError.message);
    }

    // Send email notification to asker
    try {
      const askerEmail = question.payer_email;
      const askerName = question.payer_first_name || askerEmail?.split('@')[0] || 'there';
      const expertName = question._expert_profile?.name || question.expert_name || 'the expert';

      // Calculate price for display
      let offeredPrice = 'N/A';
      if (question.question_tier === 'deep_dive' && question.proposed_price_cents) {
        offeredPrice = `$${(question.proposed_price_cents / 100).toFixed(2)}`;
      } else if (question.question_tier === 'quick_consult' && question.price_cents) {
        offeredPrice = `$${(question.price_cents / 100).toFixed(2)}`;
      } else if (question.final_price_cents) {
        offeredPrice = `$${(question.final_price_cents / 100).toFixed(2)}`;
      }

      if (askerEmail) {
        const { subject, htmlBody, textBody } = getOfferExpiredTemplate({
          askerName,
          questionTitle: question.title || 'Your question',
          expertName,
          questionId: question.id,
          offeredPrice,
          expirationReason: 'sla_expired', // Generic expiration message
        });

        await sendEmail({
          to: askerEmail,
          toName: askerName,
          subject,
          htmlBody,
          textBody,
        });

        console.log(`✅ Refund notification sent to ${askerEmail}`);
      } else {
        console.warn(`⚠️ No asker email found, skipping notification`);
      }
    } catch (emailError) {
      console.error(`❌ Failed to send notification email:`, emailError.message);
    }

    return res.status(200).json({
      success: true,
      question_id: question.id,
      payment_canceled: paymentCanceled,
      payment_intent_id: paymentIntentId,
    });

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process refund'
    });
  }
}
