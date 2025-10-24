// api/offers/[...slug].js
// Handle Deep Dive offer accept/decline with Stripe payment capture/cancellation
// Catch-all route to handle: /api/offers/123/accept and /api/offers/123/decline

import { capturePaymentIntent, cancelPaymentIntent } from '../lib/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    // Parse slug: ['123', 'accept'] or ['123', 'decline']
    if (!slug || slug.length !== 2) {
      return res.status(400).json({ error: 'Invalid request path' });
    }

    const [id, action] = slug;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use /accept or /decline' });
    }

    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    console.log(`${action === 'accept' ? '💰' : '🚫'} ${action === 'accept' ? 'Accepting' : 'Declining'} offer ${id}...`);

    // Step 1: Get question details to find payment intent ID
    const questionResponse = await fetch(
      `${process.env.XANO_BASE_URL}/question/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!questionResponse.ok) {
      throw new Error('Failed to fetch question details');
    }

    const question = await questionResponse.json();
    const paymentIntentId = question.stripe_payment_intent_id;

    console.log('🔍 Question data:', {
      id: question.id,
      hasPaymentIntentId: !!paymentIntentId,
      paymentIntentId: paymentIntentId,
      questionKeys: Object.keys(question)
    });

    if (!paymentIntentId) {
      console.warn('⚠️ No payment intent ID found for question', id);
    }

    // Step 2: Accept or Decline the offer in Xano
    let xanoBody = {};
    if (action === 'decline') {
      const { decline_reason } = req.body;
      xanoBody = { decline_reason: decline_reason || 'Expert declined' };
    }

    const xanoResponse = await fetch(
      `${process.env.XANO_BASE_URL}/offers/${id}/${action}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: Object.keys(xanoBody).length > 0 ? JSON.stringify(xanoBody) : undefined
      }
    );

    if (!xanoResponse.ok) {
      const errorText = await xanoResponse.text();
      console.error(`Xano ${action} error:`, {
        status: xanoResponse.status,
        statusText: xanoResponse.statusText,
        body: errorText
      });

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      throw new Error(errorData.message || errorData.error || `Failed to ${action} offer`);
    }

    const result = await xanoResponse.json();

    // Step 3: Handle Stripe payment based on action
    let paymentResult = {};

    if (action === 'accept') {
      // Capture the payment
      if (paymentIntentId && !paymentIntentId.startsWith('pi_mock_')) {
        try {
          console.log(`💳 Capturing payment intent: ${paymentIntentId}`);
          const capturedPayment = await capturePaymentIntent(paymentIntentId);
          console.log(`✅ Payment captured: ${capturedPayment.id}, status: ${capturedPayment.status}`);
          paymentResult = { payment_captured: true };
        } catch (paymentError) {
          console.error('❌ Failed to capture payment:', paymentError.message);
          console.error('⚠️ CRITICAL: Offer accepted but payment capture failed!', {
            questionId: id,
            paymentIntentId,
            error: paymentError.message
          });
          paymentResult = { payment_captured: false, payment_error: paymentError.message };
        }
      } else if (paymentIntentId?.startsWith('pi_mock_')) {
        console.log('💳 [MOCK MODE] Skipping payment capture for mock payment intent');
        paymentResult = { payment_captured: true, is_mock: true };
      }
    } else if (action === 'decline') {
      // Cancel the payment
      let paymentCanceled = false;
      if (paymentIntentId && !paymentIntentId.startsWith('pi_mock_')) {
        try {
          console.log(`💳 Canceling payment intent: ${paymentIntentId}`);
          const canceledPayment = await cancelPaymentIntent(paymentIntentId);
          console.log(`✅ Payment canceled: ${canceledPayment.id}, status: ${canceledPayment.status}`);
          paymentCanceled = true;
        } catch (paymentError) {
          console.error('❌ Failed to cancel payment:', paymentError.message);
          console.error('⚠️ WARNING: Offer declined but payment cancellation failed!', {
            questionId: id,
            paymentIntentId,
            error: paymentError.message
          });
        }
      } else if (paymentIntentId?.startsWith('pi_mock_')) {
        console.log('💳 [MOCK MODE] Skipping payment cancellation for mock payment intent');
        paymentCanceled = true;
      }
      paymentResult = { payment_canceled: paymentCanceled };
    }

    return res.status(200).json({
      success: true,
      question_id: result.question_id,
      status: result.status,
      sla_deadline: result.sla_deadline,
      ...paymentResult
    });

  } catch (error) {
    console.error('Offer action error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process offer action'
    });
  }
}
