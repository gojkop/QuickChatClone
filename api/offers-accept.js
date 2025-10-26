// api/offers-accept.js
// Accept a Deep Dive offer and capture the payment

import { capturePaymentIntent, findPaymentIntentByQuestionId } from './lib/stripe.js';
import { rateLimit } from './lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting: 10 accepts per minute per IP
  const rateLimitResult = await applyRateLimit(req, res);
  if (!rateLimitResult.allowed) {
    return; // Response already sent by rate limiter
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }

    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    console.log(`💰 Accepting offer ${id} and capturing payment...`);

    // Use the correct base URL (try both for compatibility)
    const baseUrl = process.env.XANO_BASE_URL || process.env.XANO_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error('Xano base URL not configured');
    }

    console.log(`🔍 Using Xano base URL: ${baseUrl.substring(0, 30)}...`);

    // Accept the offer in Xano (this should return question data with payment intent ID)
    const xanoResponse = await fetch(
      `${baseUrl}/offers/${id}/accept`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      throw new Error(errorData.message || 'Failed to accept offer');
    }

    const result = await xanoResponse.json();

    // Get payment intent ID from the result
    let paymentIntentId = result.stripe_payment_intent_id || result.payment_intent_id;

    console.log('🔍 Accept result:', {
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
      console.warn('⚠️ No payment intent ID found - cannot capture payment');
    }

    // Keep payment on hold - will be captured when question is answered
    if (paymentIntentId && !paymentIntentId.startsWith('pi_mock_')) {
      console.log(`💳 Payment intent ${paymentIntentId} remains on hold (requires_capture)`);
      console.log('✅ Payment will be captured when question is answered');
    } else if (paymentIntentId?.startsWith('pi_mock_')) {
      console.log('💳 [MOCK MODE] Mock payment intent remains on hold');
    }

    return res.status(200).json({
      success: true,
      question_id: result.question_id,
      status: result.status,
      sla_deadline: result.sla_deadline,
      payment_captured: !!paymentIntentId
    });

  } catch (error) {
    console.error('Accept offer error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to accept offer'
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
    keyPrefix: 'offer-accept'
  });

  let allowed = true;
  await limiter(req, res, () => {
    allowed = true;
  });

  return { allowed };
}
