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

    const XANO_BASE_URL = process.env.XANO_BASE_URL;

    // Step 1: Find and cancel payment intent in Stripe
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

    // Step 2: Update question and payment status in Xano
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

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.error || 'Failed to update question status in Xano');
    }

    const xanoResult = await updateResponse.json();
    console.log(`✅ Question status updated to refunded:`, xanoResult);

    // Step 3: Email notification (simplified - using question_id only)
    // Note: Email details would need to be fetched from Xano or passed from frontend
    // For now, we'll skip detailed email and just log success
    console.log(`✅ Refund processed for question ${question_id}`);

    return res.status(200).json({
      success: true,
      question_id: question_id,
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
