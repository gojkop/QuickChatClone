// src/components/question-flow-v2/payment/StripePaymentForm.jsx
// Stripe payment form using Stripe Elements

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
      lineHeight: '24px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

function StripePaymentForm({ clientSecret, amount, currency, onSuccess, onError, isSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async () => {
    if (!stripe || !elements || isSubmitting || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      console.log('🔍 [STRIPE FORM] Confirming payment with client secret:', clientSecret.substring(0, 20) + '...');

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      console.log('🔍 [STRIPE FORM] Payment confirmation result:', {
        error: error?.message,
        paymentIntentId: paymentIntent?.id,
        status: paymentIntent?.status,
        captureMethod: paymentIntent?.capture_method
      });

      if (error) {
        console.error('❌ Payment failed:', error.message);
        setCardError(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
        console.log('✅ Payment confirmed:', paymentIntent.id, 'Status:', paymentIntent.status);
        onSuccess?.(paymentIntent);
      } else {
        console.warn('⚠️ Payment status:', paymentIntent.status);
        setCardError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setCardError(err.message || 'An unexpected error occurred');
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (cents) => {
    const amount = cents / 100;
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Card Input */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 focus-within:border-indigo-500 transition-colors">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleCardChange}
        />
      </div>

      {/* Card Error */}
      {cardError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{cardError}</p>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Total Amount</span>
        <span className="text-xl font-bold text-gray-900">{formatPrice(amount)}</span>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!stripe || isSubmitting || isProcessing}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting Question...
          </span>
        ) : (
          `Pay ${formatPrice(amount)} & Submit Question →`
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p>Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}

export default StripePaymentForm;
