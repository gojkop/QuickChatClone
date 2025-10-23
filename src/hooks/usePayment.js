// src/hooks/usePayment.js
// Payment hook with Stripe integration and mock mode support

import { useState, useCallback } from 'react';

/**
 * Check if Stripe is enabled from environment variable
 */
const isStripeEnabled = () => {
  return import.meta.env.VITE_STRIPE_ENABLED !== 'false';
};

/**
 * Get Stripe public key from environment
 */
const getStripePublicKey = () => {
  return import.meta.env.VITE_STRIPE_PUBLIC_KEY || null;
};

/**
 * Custom hook for handling payments (Stripe or mock)
 */
export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const stripeEnabled = isStripeEnabled();
  const stripePublicKey = getStripePublicKey();

  /**
   * Create a payment intent
   */
  const createPaymentIntent = useCallback(async ({ amount, currency = 'usd', description, metadata = {} }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`💳 Creating payment intent: $${(amount / 100).toFixed(2)}`);
      console.log(`   Stripe enabled: ${stripeEnabled}`);

      // Use fetch instead of apiClient because apiClient points to Xano
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const intent = await response.json();
      setPaymentIntent(intent);

      if (intent.isMock) {
        console.log('💳 [MOCK MODE] Payment intent created:', intent.paymentIntentId);
      } else {
        console.log('💳 [STRIPE] Payment intent created:', intent.paymentIntentId);
      }

      return intent;
    } catch (err) {
      console.error('❌ Failed to create payment intent:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create payment intent';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stripeEnabled]);

  /**
   * Process payment (Stripe or mock)
   * For Stripe: This will be handled by Stripe Elements
   * For mock: Automatically succeeds
   */
  const processPayment = useCallback(async (paymentIntentId) => {
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }

    // Mock payments are already "succeeded"
    if (paymentIntentId.startsWith('pi_mock_')) {
      console.log('💳 [MOCK MODE] Payment automatically succeeded:', paymentIntentId);
      return {
        success: true,
        paymentIntentId,
        isMock: true
      };
    }

    // For real Stripe payments, the confirmation is handled by Stripe Elements
    // This function just returns success if we reach here
    return {
      success: true,
      paymentIntentId,
      isMock: false
    };
  }, []);

  /**
   * Reset payment state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setPaymentIntent(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    paymentIntent,
    stripeEnabled,
    stripePublicKey,

    // Methods
    createPaymentIntent,
    processPayment,
    reset,

    // Configuration
    config: {
      enabled: stripeEnabled,
      publicKey: stripePublicKey,
      isMockMode: !stripeEnabled || !stripePublicKey
    }
  };
}

/**
 * Format price from cents to dollars
 */
export function formatPrice(cents, currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

/**
 * Helper function to validate Stripe configuration
 */
export function validateStripeConfig() {
  const enabled = isStripeEnabled();
  const publicKey = getStripePublicKey();

  if (enabled && !publicKey) {
    console.warn('⚠️ Stripe is enabled but VITE_STRIPE_PUBLIC_KEY is not set. Using mock mode.');
    return {
      valid: false,
      mode: 'mock',
      reason: 'Missing public key'
    };
  }

  if (!enabled) {
    return {
      valid: true,
      mode: 'mock',
      reason: 'Stripe disabled via VITE_STRIPE_ENABLED=false'
    };
  }

  return {
    valid: true,
    mode: 'stripe',
    publicKey
  };
}
