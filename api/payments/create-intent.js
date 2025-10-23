// api/payments/create-intent.js
// Create Stripe payment intent (or mock one if Stripe is disabled)

import { createPaymentIntent, isEnabled } from '../lib/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      amount, // in cents
      currency = 'usd',
      description,
      metadata = {},
      captureMethod = 'automatic' // 'automatic' or 'manual'
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount: must be a positive number in cents'
      });
    }

    if (amount < 50) { // Stripe minimum is $0.50
      return res.status(400).json({
        error: 'Amount too small: minimum is 50 cents ($0.50)'
      });
    }

    console.log(`💳 Creating payment intent: $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`);
    console.log(`   Capture method: ${captureMethod}`);
    console.log(`   Stripe enabled: ${isEnabled()}`);

    // Create payment intent (real or mock depending on STRIPE_ENABLED flag)
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      description,
      captureMethod,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString()
      }
    });

    // Return client secret for frontend
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      isMock: paymentIntent.isMock || false
    });

  } catch (error) {
    console.error('❌ Payment intent creation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create payment intent'
    });
  }
}
