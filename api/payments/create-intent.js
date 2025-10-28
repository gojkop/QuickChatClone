// api/payments/create-intent.js
// Create Stripe payment intent (or mock one if Stripe is disabled)

import { createPaymentIntent, isEnabled } from '../lib/stripe.js';
import { rateLimit, getClientIp } from '../lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting: 10 requests per minute per IP
  const rateLimitResult = await applyRateLimit(req, res);
  if (!rateLimitResult.allowed) {
    return; // Response already sent by rate limiter
  }

  try {
    const {
      amount, // in cents
      currency = 'usd',
      description,
      metadata = {},
      captureMethod = 'automatic', // 'automatic' or 'manual'
      expertHandle, // Required for validation
      tierType, // 'quick_consult' or 'deep_dive'
      customerEmail // Optional: customer email for receipts
    } = req.body;

    // Security: Validate required fields
    if (!expertHandle) {
      return res.status(400).json({
        error: 'Missing required field: expertHandle'
      });
    }

    if (!tierType || !['quick_consult', 'deep_dive'].includes(tierType)) {
      return res.status(400).json({
        error: 'Invalid tierType: must be "quick_consult" or "deep_dive"'
      });
    }

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

    // Security: Fetch expert profile and validate pricing
    console.log(`🔍 Validating payment for expert: ${expertHandle}`);
    const expertProfile = await fetchAndValidateExpert(expertHandle, amount, tierType);

    if (!expertProfile) {
      return res.status(404).json({
        error: 'Expert not found'
      });
    }

    // Log payment intent creation with security context
    const clientIp = getClientIp(req);
    console.log(`💳 Creating payment intent: $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`);
    console.log(`   Expert: ${expertHandle} (ID: ${expertProfile.id})`);
    console.log(`   Tier: ${tierType}`);
    console.log(`   Capture method: ${captureMethod}`);
    console.log(`   Stripe enabled: ${isEnabled()}`);
    console.log(`   Client IP: ${clientIp}`);

    // Filter out tier_type from incoming metadata (we don't want it stored)
    const { tier_type, ...cleanMetadata } = metadata || {};

    // Create payment intent (real or mock depending on STRIPE_ENABLED flag)
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      description,
      captureMethod,
      customerEmail, // Pass customer email for receipts
      metadata: {
        ...cleanMetadata,
        expert_handle: expertHandle,
        expert_profile_id: String(expertProfile.id),
        client_ip: clientIp,
        created_at: new Date().toISOString(),
        ...(customerEmail && { customer_email: customerEmail })
      }
    });

    console.log(`✅ Payment intent created: ${paymentIntent.id}`);

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

/**
 * Apply rate limiting to the request
 */
async function applyRateLimit(req, res) {
  const limiter = rateLimit({
    limit: 10, // 10 requests
    windowMs: 60000, // per minute
    keyPrefix: 'payment-intent'
  });

  let allowed = true;
  await limiter(req, res, () => {
    allowed = true;
  });

  return { allowed };
}

/**
 * Fetch expert profile and validate pricing
 */
async function fetchAndValidateExpert(expertHandle, amount, tierType) {
  try {
    const expertResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!expertResponse.ok) {
      console.warn(`⚠️ Expert not found: ${expertHandle}`);
      return null;
    }

    const expertData = await expertResponse.json();
    const expertProfile = expertData.expert_profile || expertData;

    // Validate pricing based on tier type
    if (tierType === 'quick_consult') {
      // Quick Consult: amount must match exact price
      const expectedPrice = expertProfile.tier1_price_cents;
      if (expectedPrice && amount !== expectedPrice) {
        console.warn(`⚠️ Price mismatch for Quick Consult: expected ${expectedPrice}, got ${amount}`);
        throw new Error(`Invalid amount for Quick Consult. Expected: $${(expectedPrice / 100).toFixed(2)}`);
      }
    } else if (tierType === 'deep_dive') {
      // Deep Dive: amount should be within min/max range (but not strictly enforced per spec)
      const minPrice = expertProfile.tier2_min_price_cents;
      const maxPrice = expertProfile.tier2_max_price_cents;

      if (minPrice && maxPrice) {
        if (amount < minPrice * 0.5 || amount > maxPrice * 2) {
          // Allow some flexibility, but flag suspicious amounts
          console.warn(`⚠️ Deep Dive amount outside reasonable range: ${amount} (min: ${minPrice}, max: ${maxPrice})`);
        }
      }
    }

    console.log(`✅ Expert validated: ${expertProfile.name || expertHandle}`);
    return expertProfile;

  } catch (error) {
    console.error(`❌ Error validating expert: ${error.message}`);
    throw error;
  }
}
