import React from 'react';

function PriceCard({ expert, tierType, tierConfig, composeData }) {
  // Safety check
  if (!expert) {
    return null;
  }

  const formatPrice = (cents, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    const amount = (cents || 0) / 100;
    return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  const displayPrice = tierType === 'deep_dive' && composeData.tierSpecific?.proposedPrice
    ? `$${composeData.tierSpecific.proposedPrice}`
    : formatPrice(tierConfig?.price_cents || expert.price_cents || 0, expert.currency || 'USD');

  const expertName = expert.name || expert.user?.name || expert.handle || 'Expert';

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Asking {expertName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {tierType === 'quick_consult' ? 'Quick Consult' : 'Deep Dive'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-indigo-600">{displayPrice}</p>
        </div>
      </div>

      {tierType === 'quick_consult' && tierConfig?.sla_hours && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>Guaranteed Response:</strong> Within {tierConfig.sla_hours} hours
          </p>
        </div>
      )}

      {tierType === 'deep_dive' && (
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-purple-900">
            <strong>Your Offer:</strong> The expert will review and may accept, decline, or counter.
          </p>
        </div>
      )}
    </div>
  );
}

export default PriceCard;