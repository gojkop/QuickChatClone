import React from 'react';
import { PaymentIcon, CheckCircleIcon, InformationIcon, LockIcon } from '../shared/SVGIcons';

function PaymentPlaceholder({ 
  expert, 
  tierType, 
  tierConfig, 
  composeData, 
  reviewData,
  onSubmit,
  isSubmitting = false
}) {
  const formatPrice = (cents, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    const amount = (cents || 0) / 100;
    return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  const displayPrice = tierType === 'deep_dive' && composeData.tierSpecific?.price
    ? `$${composeData.tierSpecific.price}`
    : formatPrice(tierConfig?.price_cents || expert.price_cents, expert.currency);

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
            <span className="text-gray-700 font-medium">Question to {expert.name || expert.handle}</span>
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
            <p>Email confirmation to: <strong>{reviewData.email}</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>Question: <strong>{composeData.title}</strong></p>
          </div>
          {composeData.recordings?.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p>Recordings: <strong>{composeData.recordings.length} segment(s)</strong></p>
            </div>
          )}
          {composeData.attachments?.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p>Attachments: <strong>{composeData.attachments.length} file(s)</strong></p>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Integration Notice */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InformationIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900 mb-1">Payment Integration Coming Soon</p>
            <p className="text-amber-700">
              Stripe payment processing is not yet implemented. Click "Submit Question" to create your question without payment for testing purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
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
          'Submit Question →'
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          <LockIcon className="w-3 h-3" />
          <p>Secure submission - Your information is encrypted</p>
        </div>
      </div>
    </div>
  );
}

export default PaymentPlaceholder;