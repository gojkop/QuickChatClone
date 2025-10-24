// api/lib/stripe.js
// Stripe integration with feature flag for easy on/off toggling

import Stripe from 'stripe';

/**
 * Check if Stripe is enabled via environment variable
 * Set STRIPE_ENABLED=false to disable Stripe and use mock payment flow
 */
const isStripeEnabled = () => {
  return process.env.STRIPE_ENABLED !== 'false';
};

/**
 * Initialize Stripe client (only if enabled)
 */
let stripeInstance = null;

const getStripeClient = () => {
  if (!isStripeEnabled()) {
    return null;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ Stripe is enabled but STRIPE_SECRET_KEY is not set');
    return null;
  }

  // Singleton pattern - create once and reuse
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeInstance;
};

/**
 * Create a payment intent (or mock one if Stripe is disabled)
 *
 * @param {Object} params
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code (default: 'usd')
 * @param {string} params.description - Payment description
 * @param {Object} params.metadata - Additional metadata
 * @param {boolean} params.captureMethod - 'automatic' or 'manual' (default: 'automatic')
 * @returns {Promise<Object>} Payment intent object
 */
export async function createPaymentIntent({ amount, currency = 'usd', description, metadata = {}, captureMethod = 'automatic' }) {
  if (!isStripeEnabled()) {
    console.log('💳 [MOCK MODE] Creating mock payment intent:', {
      amount,
      currency,
      description,
      metadata,
      captureMethod
    });

    // Return mock payment intent
    return {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      client_secret: `pi_mock_secret_${Date.now()}`,
      amount,
      currency,
      status: captureMethod === 'manual' ? 'requires_capture' : 'succeeded',
      description,
      metadata,
      capture_method: captureMethod,
      isMock: true
    };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is enabled but not properly configured');
  }

  console.log('💳 [STRIPE] Creating payment intent:', {
    amount,
    currency,
    description,
    captureMethod
  });

  const createParams = {
    amount,
    currency,
    description,
    metadata,
    capture_method: captureMethod, // 'automatic' for Quick Consult, 'manual' for Deep Dive
    payment_method_types: ['card', 'link', 'amazon_pay'], // Enable Link and Amazon Pay
  };

  console.log('📤 [STRIPE] Sending to Stripe API:', JSON.stringify(createParams, null, 2));

  try {
    const paymentIntent = await stripe.paymentIntents.create(createParams);

    console.log('📥 [STRIPE] Response from Stripe:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      capture_method: paymentIntent.capture_method,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    return paymentIntent;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to create payment intent:', error.message);
    throw error;
  }
}

/**
 * Retrieve a payment intent
 *
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
export async function retrievePaymentIntent(paymentIntentId) {
  // Handle mock payment intents
  if (paymentIntentId.startsWith('pi_mock_')) {
    console.log('💳 [MOCK MODE] Retrieving mock payment intent:', paymentIntentId);
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 0,
      currency: 'usd',
      isMock: true
    };
  }

  if (!isStripeEnabled()) {
    throw new Error('Cannot retrieve real payment intent when Stripe is disabled');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not properly configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to retrieve payment intent:', error.message);
    throw error;
  }
}

/**
 * Confirm a payment intent (finalize payment)
 *
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Confirmed payment intent
 */
export async function confirmPaymentIntent(paymentIntentId) {
  // Handle mock payment intents
  if (paymentIntentId.startsWith('pi_mock_')) {
    console.log('💳 [MOCK MODE] Confirming mock payment intent:', paymentIntentId);
    return {
      id: paymentIntentId,
      status: 'succeeded',
      isMock: true
    };
  }

  if (!isStripeEnabled()) {
    throw new Error('Cannot confirm real payment intent when Stripe is disabled');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not properly configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to confirm payment intent:', error.message);
    throw error;
  }
}

/**
 * Capture a payment intent (for Deep Dive after expert accepts)
 *
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amountToCapture - Amount to capture in cents (optional)
 * @returns {Promise<Object>} Captured payment intent
 */
export async function capturePaymentIntent(paymentIntentId, amountToCapture = null) {
  // Handle mock payment intents
  if (paymentIntentId.startsWith('pi_mock_')) {
    console.log('💳 [MOCK MODE] Capturing mock payment intent:', paymentIntentId);
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount_received: amountToCapture,
      isMock: true
    };
  }

  if (!isStripeEnabled()) {
    throw new Error('Cannot capture real payment intent when Stripe is disabled');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not properly configured');
  }

  try {
    const captureOptions = {};
    if (amountToCapture) {
      captureOptions.amount_to_capture = amountToCapture;
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, captureOptions);
    return paymentIntent;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to capture payment intent:', error.message);
    throw error;
  }
}

/**
 * Cancel a payment intent (for declined Deep Dive offers)
 *
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Canceled payment intent
 */
export async function cancelPaymentIntent(paymentIntentId) {
  // Handle mock payment intents
  if (paymentIntentId.startsWith('pi_mock_')) {
    console.log('💳 [MOCK MODE] Canceling mock payment intent:', paymentIntentId);
    return {
      id: paymentIntentId,
      status: 'canceled',
      isMock: true
    };
  }

  if (!isStripeEnabled()) {
    throw new Error('Cannot cancel real payment intent when Stripe is disabled');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not properly configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to cancel payment intent:', error.message);
    throw error;
  }
}

/**
 * Update payment intent metadata
 *
 * @param {string} paymentIntentId - Payment intent ID
 * @param {Object} metadata - Metadata to add/update
 * @returns {Promise<Object>} Updated payment intent
 */
export async function updatePaymentIntentMetadata(paymentIntentId, metadata) {
  // Handle mock payment intents
  if (paymentIntentId.startsWith('pi_mock_')) {
    console.log('💳 [MOCK MODE] Skipping metadata update for mock payment intent');
    return { id: paymentIntentId, metadata, isMock: true };
  }

  if (!isStripeEnabled()) {
    throw new Error('Cannot update real payment intent when Stripe is disabled');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not properly configured');
  }

  try {
    console.log(`💳 [STRIPE] Updating payment intent metadata: ${paymentIntentId}`);
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata
    });
    return paymentIntent;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to update payment intent metadata:', error.message);
    throw error;
  }
}

/**
 * Find payment intent by question ID in metadata
 *
 * @param {number} questionId - Question ID to search for
 * @returns {Promise<Object|null>} Payment intent or null if not found
 */
export async function findPaymentIntentByQuestionId(questionId) {
  // Handle mock mode
  if (!isStripeEnabled()) {
    console.log('💳 [MOCK MODE] Cannot search for payment intent when Stripe is disabled');
    return null;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not properly configured');
  }

  try {
    console.log(`🔍 [STRIPE] Listing recent payment intents for question ${questionId}...`);

    // List recent payment intents and filter by metadata
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    // Find payment intent with matching question_id in metadata
    const found = paymentIntents.data.find(pi =>
      pi.metadata && pi.metadata.question_id === String(questionId)
    );

    if (found) {
      console.log(`✅ Found payment intent: ${found.id}`);
      return found;
    }

    console.log(`⚠️ No payment intent found for question ${questionId}`);
    return null;
  } catch (error) {
    console.error('❌ [STRIPE] Failed to search payment intents:', error.message);
    throw error;
  }
}

/**
 * Check if Stripe is enabled
 * @returns {boolean}
 */
export function isEnabled() {
  return isStripeEnabled();
}

/**
 * Get Stripe configuration
 * @returns {Object}
 */
export function getConfig() {
  return {
    enabled: isStripeEnabled(),
    publicKey: process.env.STRIPE_PUBLIC_KEY || null,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY
  };
}
