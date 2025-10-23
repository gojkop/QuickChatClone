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
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Expert Info */}
        <div className="flex-1">
          <p className="text-sm text-indigo-100 mb-1">You're asking</p>
          <p className="text-2xl font-bold">{expert.name || expert.user?.name || expert.handle}</p>
          <p className="text-sm text-indigo-100 mt-1">
            Responds within <strong>{tierConfig?.sla_hours || expert.sla_hours} hours</strong>
          </p>
        </div>

        {/* Price Display */}
        <div className="text-left sm:text-right">
          <div className="text-xs text-indigo-100 mb-1">
            {isDeepDive ? 'Your Offer' : 'Total Price'}
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-white/30">
            <span className="font-black text-white text-3xl">
              {formatPrice(displayPriceCents, expert.currency)}
            </span>
          </div>
          {isDeepDive && (
            <p className="text-xs text-indigo-100 mt-1.5">
              Expert will review your offer
            </p>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="flex items-start gap-2 text-sm text-indigo-100">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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