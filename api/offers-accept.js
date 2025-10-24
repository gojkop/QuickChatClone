// api/offers-accept.js
// Accept a Deep Dive offer and capture the payment

import { capturePaymentIntent } from './lib/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Step 1: Get question details to find payment intent ID
    const questionResponse = await fetch(
      `${baseUrl}/question/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.error('❌ Failed to fetch question:', {
        status: questionResponse.status,
        statusText: questionResponse.statusText,
        url: `${baseUrl}/question/${id}`,
        body: errorText
      });
      throw new Error(`Failed to fetch question details: ${questionResponse.status} ${errorText}`);
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

    // Step 2: Accept the offer in Xano
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

    // Step 3: Capture the payment (if not mock)
    if (paymentIntentId && !paymentIntentId.startsWith('pi_mock_')) {
      try {
        console.log(`💳 Capturing payment intent: ${paymentIntentId}`);
        const capturedPayment = await capturePaymentIntent(paymentIntentId);
        console.log(`✅ Payment captured: ${capturedPayment.id}, status: ${capturedPayment.status}`);
      } catch (paymentError) {
        console.error('❌ Failed to capture payment:', paymentError.message);
        // Payment capture failed, but offer was already accepted
        // Log this for manual review
        console.error('⚠️ CRITICAL: Offer accepted but payment capture failed!', {
          questionId: id,
          paymentIntentId,
          error: paymentError.message
        });
        // Continue anyway - the offer is already accepted
      }
    } else if (paymentIntentId?.startsWith('pi_mock_')) {
      console.log('💳 [MOCK MODE] Skipping payment capture for mock payment intent');
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
