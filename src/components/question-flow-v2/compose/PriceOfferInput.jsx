import React, { useState, useEffect } from 'react';

function PriceOfferInput({ value, onChange, minPrice, maxPrice, currency }) {
  const [error, setError] = useState('');

  const minDollars = (minPrice || 0) / 100;
  const maxDollars = (maxPrice || 0) / 100;

  useEffect(() => {
    const numValue = parseFloat(value);
    
    if (!value || value === '') {
      setError('');
      return;
    }

    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numValue < minDollars) {
      setError(`Minimum offer is $${minDollars}`);
      return;
    }

    if (numValue > maxDollars) {
      setError(`Maximum offer is $${maxDollars}`);
      return;
    }

    setError('');
  }, [value, minDollars, maxDollars]);

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    return symbols[currency] || '$';
  };

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
      <h3 className="text-base font-bold text-gray-900 mb-3">Your Offer</h3>
      
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Offer Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">
            {getCurrencySymbol()}
          </span>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${minDollars} - ${maxDollars}`}
            min={minDollars}
            max={maxDollars}
            step="1"
            className="w-full pl-10 pr-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-bold"
            required
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {error ? (
            <span className="text-xs text-red-600 font-semibold">{error}</span>
          ) : (
            <span className="text-xs text-gray-600">
              Suggested range: ${minDollars} - ${maxDollars}
            </span>
          )}
        </div>
      </div>

      <div className="bg-purple-100 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-purple-900">
            <strong>How it works:</strong> The expert will review your question and offer. 
            They may accept, decline, or propose a different price.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceOfferInput;