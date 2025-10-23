import React, { useState } from 'react';
import MobileStickyFooter from '../shared/MobileStickyFooter';


function PaymentPlaceholder({ 
  expert, 
  tierType, 
  tierConfig, 
  composeData, 
  reviewData,
  onSubmit 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formatPrice = (cents, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    const amount = (cents || 0) / 100;
    return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  const getDisplayPrice = () => {
    if (tierType === 'quick_consult' && tierConfig?.price_cents) {
      return tierConfig.price_cents;
    } else if (tierType === 'deep_dive' && composeData?.tierSpecific?.proposedPrice) {
      return Math.round(parseFloat(composeData.tierSpecific.proposedPrice) * 100);
    }
    return expert.price_cents;
  };

  const displayPriceCents = getDisplayPrice();
  const isDeepDive = tierType === 'deep_dive';

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Placeholder */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Stripe Payment Integration</h4>
          <p className="text-sm text-gray-600 mb-4">
            Stripe Checkout will be embedded here
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-indigo-600 font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>

      {/* Final Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          {/* Expert */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Asking</span>
            <span className="font-semibold text-gray-900">
              {expert.name || expert.user?.name || expert.handle}
            </span>
          </div>

          {/* SLA */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Answer within</span>
            <span className="font-semibold text-gray-900">
              {tierConfig?.sla_hours || expert.sla_hours} hours
            </span>
          </div>

          {/* Question Type */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Question Type</span>
            <span className="font-semibold text-gray-900">
              {tierType === 'quick_consult' ? '⚡ Quick Consult' : '🎯 Deep Dive'}
            </span>
          </div>

          <div className="border-t border-green-300 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">
                {isDeepDive ? 'Your Offer' : 'Total'}
              </span>
              <span className="text-2xl font-black text-green-700">
                {formatPrice(displayPriceCents, expert.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
              Terms & Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t">
<MobileStickyFooter>
  <button
    onClick={handleSubmit}
    disabled={!agreedToTerms || isSubmitting}
    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
  >
    {isSubmitting ? (
      <span className="flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Processing...
      </span>
    ) : !agreedToTerms ? (
      'Please agree to Terms & Conditions'
    ) : isDeepDive ? (
      'Submit Offer →'
    ) : (
      'Pay & Submit Question →'
    )}
  </button>
</MobileStickyFooter>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {isDeepDive 
            ? 'Your payment will be processed after the expert accepts your offer'
            : 'Your payment will be processed securely via Stripe'
          }
        </p>
      </div>
    </div>
  );
}

export default PaymentPlaceholder;