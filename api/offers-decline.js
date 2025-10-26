// api/offers-decline.js
// Decline a Deep Dive offer and cancel/refund the payment

import { cancelPaymentIntent, findPaymentIntentByQuestionId } from './lib/stripe.js';
import { rateLimit } from './lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting: 10 declines per minute per IP
  const rateLimitResult = await applyRateLimit(req, res);
  if (!rateLimitResult.allowed) {
    return; // Response already sent by rate limiter
  }

  try {
    const { id, decline_reason } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }

    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    console.log(`🚫 Declining offer ${id} and canceling payment...`);

    // Use the correct base URL (try both for compatibility)
    const baseUrl = process.env.XANO_BASE_URL || process.env.XANO_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error('Xano base URL not configured');
    }

    console.log(`🔍 Using Xano base URL: ${baseUrl.substring(0, 30)}...`);

    // Decline the offer in Xano (this should return question data with payment intent ID)
    const xanoResponse = await fetch(
      `${baseUrl}/offers/${id}/decline`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decline_reason: decline_reason || 'Expert declined'
        })
      }
    );

    if (!xanoResponse.ok) {
      const errorText = await xanoResponse.text();
      console.error('Xano decline error:', {
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

      throw new Error(errorData.message || errorData.error || 'Failed to decline offer');
    }

    const result = await xanoResponse.json();

    // Get payment intent ID from the result
    let paymentIntentId = result.stripe_payment_intent_id || result.payment_intent_id;

    console.log('🔍 Decline result:', {
      question_id: result.question_id,
      status: result.status,
      hasPaymentIntentId: !!paymentIntentId,
      paymentIntentId: paymentIntentId,
      resultKeys: Object.keys(result)
    });

    // If Xano didn't return payment intent ID, search for it in Stripe by question ID
    if (!paymentIntentId && result.question_id) {
      console.log(`🔍 Payment intent ID not in response, searching Stripe by question_id: ${result.question_id}`);
      try {
        const paymentIntent = await findPaymentIntentByQuestionId(result.question_id);
        if (paymentIntent) {
          paymentIntentId = paymentIntent.id;
          console.log(`✅ Found payment intent via search: ${paymentIntentId}`);
        } else {
          console.warn('⚠️ No payment intent found in Stripe for this question');
        }
      } catch (searchError) {
        console.error('❌ Error searching for payment intent:', searchError.message);
      }
    }

    if (!paymentIntentId) {
      console.warn('⚠️ No payment intent ID found - cannot cancel payment');
    }

    // Cancel/refund the payment (if not mock)
    let paymentCanceled = false;
    if (paymentIntentId && !paymentIntentId.startsWith('pi_mock_')) {
      try {
        console.log(`💳 Canceling payment intent: ${paymentIntentId}`);
        const canceledPayment = await cancelPaymentIntent(paymentIntentId);
        console.log(`✅ Payment canceled: ${canceledPayment.id}, status: ${canceledPayment.status}`);
        paymentCanceled = true;
      } catch (paymentError) {
        console.error('❌ Failed to cancel payment:', paymentError.message);
        // Payment cancellation failed, but offer was already declined
        // Log this for manual review
        console.error('⚠️ WARNING: Offer declined but payment cancellation failed!', {
          questionId: id,
          paymentIntentId,
          error: paymentError.message
        });
        // Continue anyway - the offer is already declined
      }
    } else if (paymentIntentId?.startsWith('pi_mock_')) {
      console.log('💳 [MOCK MODE] Skipping payment cancellation for mock payment intent');
      paymentCanceled = true; // Mock payments don't need cancellation
    }

    return res.status(200).json({
      success: true,
      question_id: result.question_id,
      status: result.status,
      payment_canceled: paymentCanceled
    });

  } catch (error) {
    console.error('Decline offer error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to decline offer'
    });
  }
}

/**
 * Apply rate limiting to the request
 */
async function applyRateLimit(req, res) {
  const limiter = rateLimit({
    limit: 10, // 10 requests
    windowMs: 60000, // per minute
    keyPrefix: 'offer-decline'
  });

  let allowed = true;
  await limiter(req, res, () => {
    allowed = true;
  });

  return { allowed };
}
