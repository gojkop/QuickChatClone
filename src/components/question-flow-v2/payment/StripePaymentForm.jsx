// src/components/question-flow-v2/payment/StripePaymentForm.jsx
// Stripe payment form using Stripe Elements

import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function StripePaymentForm({ clientSecret, amount, currency, payerEmail, onSuccess, onError, isSubmitting, onPaymentStart }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Track state changes for debugging
  useEffect(() => {
    console.log('📊 [PAYMENT FLOW] isProcessing changed:', isProcessing);
  }, [isProcessing]);

  useEffect(() => {
    console.log('📊 [PAYMENT FLOW] isSubmitting (from parent) changed:', isSubmitting);
  }, [isSubmitting]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    console.log('🔘 [PAYMENT FLOW] handleSubmit called');
    console.log('📊 [PAYMENT FLOW] Current states:', {
      stripeReady: !!stripe,
      elementsReady: !!elements,
      isSubmitting: isSubmitting,
      isProcessing: isProcessing
    });

    if (!stripe || !elements || isSubmitting || isProcessing) {
      console.log('⚠️ [PAYMENT FLOW] Blocked - conditions not met');
      return;
    }

    // Set processing state and notify parent IMMEDIATELY
    console.log('🔄 [PAYMENT FLOW] Setting isProcessing=true');
    setIsProcessing(true);
    setPaymentError(null);
    console.log('📢 [PAYMENT FLOW] Calling onPaymentStart callback');
    onPaymentStart?.();

    // Small delay to ensure loader renders before Stripe validation blocks UI
    console.log('⏳ [PAYMENT FLOW] Waiting 50ms for loader to render...');
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      console.log('🔍 [PAYMENT FLOW] Confirming payment with Stripe...');
      console.log('🔍 [PAYMENT FLOW] Client secret:', clientSecret.substring(0, 20) + '...');

      // Confirm the payment using PaymentElement
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-complete', // Fallback, we handle it manually
        },
        redirect: 'if_required', // Don't redirect, handle in the same page
      });

      console.log('✅ [PAYMENT FLOW] Stripe confirmPayment completed');
      console.log('📊 [PAYMENT FLOW] Payment result:', {
        hasError: !!error,
        errorMessage: error?.message,
        paymentIntentId: paymentIntent?.id,
        status: paymentIntent?.status,
        captureMethod: paymentIntent?.capture_method
      });

      if (error) {
        console.error('❌ [PAYMENT FLOW] Payment failed:', error.message);
        setPaymentError(error.message);
        console.log('🔄 [PAYMENT FLOW] Setting isProcessing=false (error)');
        setIsProcessing(false);  // Reset only on error
        console.log('📢 [PAYMENT FLOW] Calling onError callback');
        onError?.(error);
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
        console.log('✅ [PAYMENT FLOW] Payment confirmed:', paymentIntent.id, 'Status:', paymentIntent.status);
        console.log('⚠️ [PAYMENT FLOW] KEEPING isProcessing=true - will stay true until component unmounts');
        // Keep isProcessing=true until page navigation completes
        // Don't call setIsProcessing(false) here - let the unmount handle it
        console.log('📢 [PAYMENT FLOW] Calling onSuccess callback with paymentIntent');
        onSuccess?.(paymentIntent);
        console.log('✅ [PAYMENT FLOW] onSuccess callback completed, parent should handle submission now');
      } else if (paymentIntent) {
        console.warn('⚠️ [PAYMENT FLOW] Unexpected payment status:', paymentIntent.status);
        setPaymentError(`Payment status: ${paymentIntent.status}`);
        console.log('🔄 [PAYMENT FLOW] Setting isProcessing=false (unexpected status)');
        setIsProcessing(false);  // Reset on unexpected status
      }
    } catch (err) {
      console.error('❌ [PAYMENT FLOW] Payment error:', err);
      setPaymentError(err.message || 'An unexpected error occurred');
      console.log('🔄 [PAYMENT FLOW] Setting isProcessing=false (exception)');
      setIsProcessing(false);  // Reset only on error
      console.log('📢 [PAYMENT FLOW] Calling onError callback');
      onError?.(err);
    }
  };

  const formatPrice = (cents) => {
    const amount = cents / 100;
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Payment Element - supports cards, Link, Amazon Pay, etc. */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 focus-within:border-indigo-500 transition-colors">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: payerEmail ? {
              billingDetails: {
                email: payerEmail,  // Pre-fill email to enable Link
              }
            } : undefined
          }}
        />
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{paymentError}</p>
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
