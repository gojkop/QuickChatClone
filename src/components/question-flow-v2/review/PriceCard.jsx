import React from 'react';

function PriceCard({ expert, tierType, tierConfig, composeData }) {
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

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Expert Info */}
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">You're asking</p>
          <p className="text-2xl font-bold text-gray-900">{expert.name || expert.user?.name || expert.handle}</p>
          <p className="text-sm text-gray-600 mt-1">
            Responds within <strong className="text-gray-900">{tierConfig?.sla_hours || expert.sla_hours} hours</strong>
          </p>
        </div>

        {/* Price Display */}
        <div className="text-left sm:text-right">
          <div className="text-xs text-gray-500 mb-1 uppercase font-semibold">
            {isDeepDive ? 'Your Offer' : 'Total Price'}
          </div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 border-2 border-indigo-200 rounded-lg px-4 py-2.5">
            <span className="font-black text-indigo-700 text-3xl">
              {formatPrice(displayPriceCents, expert.currency)}
            </span>
          </div>
          {isDeepDive && (
            <p className="text-xs text-gray-600 mt-1.5">
              Expert will review your offer
            </p>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {isDeepDive 
              ? 'Payment will be processed after the expert accepts your offer'
              : 'Payment will be processed on the next page'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

export default PriceCard;