import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentIcon, CheckCircleIcon, InformationIcon, LockIcon } from '../shared/SVGIcons';
import { usePayment } from '@/hooks/usePayment';
import StripePaymentForm from './StripePaymentForm';

function PaymentPlaceholder({
  expert,
  tierType,
  tierConfig,
  composeData,
  reviewData,
  onSubmit,
  isSubmitting = false
}) {
  const { createPaymentIntent, config } = usePayment();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState(null);

  // ✅ SAFETY CHECK - Add this at the top
  if (!expert) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading payment information...</p>
      </div>
    );
  }

  // Initialize Stripe if enabled
  useEffect(() => {
    if (config.enabled && config.publicKey && !stripePromise) {
      console.log('💳 Initializing Stripe with public key');
      setStripePromise(loadStripe(config.publicKey));
    }
  }, [config.enabled, config.publicKey, stripePromise]);

  // Create payment intent when we have the required data
  useEffect(() => {
    // Don't create intent if we don't have the required data yet
    const hasRequiredData = tierType === 'deep_dive'
      ? composeData.tierSpecific?.proposedPrice  // Deep Dive needs proposed price
      : composeData.title;  // Quick Consult just needs a title

    if (!clientSecret && !isCreatingIntent && hasRequiredData) {
      handleCreatePaymentIntent();
    }
  }, [clientSecret, isCreatingIntent, composeData.title, composeData.tierSpecific?.proposedPrice, tierType]);

  const handleCreatePaymentIntent = async () => {
    setIsCreatingIntent(true);
    setIntentError(null);

    try {
      // Calculate amount
      console.log('💰 [DEBUG] Payment calculation:', {
        tierType,
        proposedPrice: composeData.tierSpecific?.proposedPrice,
        tierConfigPrice: tierConfig?.price_cents,
        expertPrice: expert.price_cents
      });

      const amount = tierType === 'deep_dive' && composeData.tierSpecific?.proposedPrice
        ? parseFloat(composeData.tierSpecific.proposedPrice) * 100 // Convert dollars to cents
        : tierConfig?.price_cents || expert.price_cents || 0;

      console.log('💰 [DEBUG] Calculated amount (cents):', amount);

      const description = `${tierType === 'quick_consult' ? 'Quick Consult' : 'Deep Dive'}: ${composeData.title}`;
      // Both tiers now use manual capture - payment is only captured when question is answered
      const captureMethod = 'manual';

      console.log(`🔍 [PAYMENT] Tier type: ${tierType}, Capture method: ${captureMethod}`);

      const intent = await createPaymentIntent({
        amount,
        currency: expert.currency || 'usd',
        description,
        captureMethod, // Hold for Deep Dive
        metadata: {
          expert_handle: expert.handle || '',
          tier_type: tierType,
          question_title: composeData.title || ''
        }
      });

      setClientSecret(intent.clientSecret);
      setPaymentIntentId(intent.paymentIntentId);
    } catch (err) {
      console.error('Failed to create payment intent:', err);
      setIntentError(err.message);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('✅ Payment succeeded, submitting question...');
    // Call parent's onSubmit with payment intent ID
    onSubmit(paymentIntent.id);
  };

  const handlePaymentError = (error) => {
    console.error('❌ Payment failed:', error);
    setIntentError(error.message || 'Payment failed');
  };

  // Mock mode: Submit directly without payment
  const handleMockSubmit = () => {
    console.log('💳 [MOCK MODE] Submitting with mock payment:', paymentIntentId);
    onSubmit(paymentIntentId);
  };

  const formatPrice = (cents, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    const amount = (cents || 0) / 100;
    return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  const displayPrice = tierType === 'deep_dive' && composeData.tierSpecific?.price
    ? `$${composeData.tierSpecific.price}`
    : formatPrice(tierConfig?.price_cents || expert.price_cents, expert.currency);

  // ✅ Safe expert name
  const expertName = expert.name || expert.user?.name || expert.handle || 'Expert';

  return (
    <div className="space-y-6">
      {/* Payment Info Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border-2 border-indigo-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <PaymentIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Payment Summary
            </h3>
            <p className="text-sm text-gray-600">
              {tierType === 'quick_consult' 
                ? 'Fixed price - answer guaranteed' 
                : 'Offer pending expert approval'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            {/* ✅ FIXED: Use safe expert name */}
            <span className="text-gray-700 font-medium">Question to {expertName}</span>
            <span className="text-2xl font-black text-indigo-600">{displayPrice}</span>
          </div>
          
          {tierType === 'deep_dive' && (
            <div className="text-xs text-gray-600 bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">Deep Dive Offer</p>
              <p>Your offer will be reviewed by the expert. You'll be notified if accepted or countered.</p>
            </div>
          )}

          {tierType === 'quick_consult' && tierConfig?.sla_hours && (
            <div className="text-xs text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">Quick Consult</p>
              <p>Answer delivered within {tierConfig.sla_hours} hours after payment</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-600 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>Email confirmation to: <strong>{reviewData?.email || 'Not provided'}</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>Question: <strong>{composeData?.title || 'Untitled'}</strong></p>
          </div>
          {composeData?.recordings?.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p>Recordings: <strong>{composeData.recordings.length} segment(s)</strong></p>
            </div>
          )}
          {composeData?.attachments?.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p>Attachments: <strong>{composeData.attachments.length} file(s)</strong></p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isCreatingIntent && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-blue-800">Preparing payment...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {intentError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="font-semibold text-red-900 mb-1">Payment Setup Error</p>
              <p className="text-red-700">{intentError}</p>
              <button
                onClick={handleCreatePaymentIntent}
                className="mt-2 text-red-800 underline hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Form (when enabled and ready) */}
      {!isCreatingIntent && !intentError && config.enabled && clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={tierType === 'deep_dive' && composeData?.tierSpecific?.price
              ? composeData.tierSpecific.price * 100
              : tierConfig?.price_cents || expert.price_cents || 0}
            currency={expert.currency || 'usd'}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            isSubmitting={isSubmitting}
          />
        </Elements>
      )}

      {/* Mock Mode Notice & Button */}
      {!isCreatingIntent && !intentError && (!config.enabled || config.isMockMode) && paymentIntentId && (
        <>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">Testing Mode (No Payment Required)</p>
                <p className="text-amber-700">
                  Stripe is disabled. Questions will be created without actual payment processing for testing purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button (Mock Mode) */}
          <button
            onClick={handleMockSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Question...
              </span>
            ) : (
              'Submit Question (Test Mode) →'
            )}
          </button>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500">
            <div className="flex items-center justify-center gap-1">
              <LockIcon className="w-3 h-3" />
              <p>Secure submission - Your information is encrypted</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PaymentPlaceholder;