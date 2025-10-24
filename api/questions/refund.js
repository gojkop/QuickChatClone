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
    const XANO_BASE_URL = process.env.XANO_BASE_URL;

    // Step 1: Find and cancel payment intent in Stripe
    let paymentCanceled = false;
    let paymentIntentId = null;

    try {
      const paymentIntent = await findPaymentIntentByQuestionId(question_id);

      if (paymentIntent && !paymentIntent.id.startsWith('pi_mock_')) {
        paymentIntentId = paymentIntent.id;

        if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'requires_payment_method') {
          await cancelPaymentIntent(paymentIntentId);
          paymentCanceled = true;
        } else if (paymentIntent.status === 'canceled') {
          paymentCanceled = true;
        } else if (paymentIntent.status === 'succeeded') {
          return res.status(400).json({
            error: 'Payment has already been captured. Please contact support for manual refund.'
          });
        } else {
          console.warn(`⚠️ Payment in unexpected status: ${paymentIntent.status} for question ${question_id}`);
        }
      } else if (paymentIntent?.id.startsWith('pi_mock_')) {
        paymentCanceled = true;
      }
    } catch (paymentError) {
      console.error(`❌ Payment cancellation failed for question ${question_id}:`, paymentError.message);
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
