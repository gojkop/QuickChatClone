import React, { useState, useEffect } from 'react';

function PriceOfferInput({ value, onChange, minPrice, maxPrice, currency, compact = false }) {
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
      setError(`Min $${minDollars}`);
      return;
    }

    if (numValue > maxDollars) {
      setError(`Max $${maxDollars}`);
      return;
    }

    setError('');
  }, [value, minDollars, maxDollars]);

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    return symbols[currency] || '$';
  };

  if (compact) {
    return (
      <div>
        <label htmlFor="price-offer" className="block text-sm font-semibold text-gray-700 mb-2">
          Your Offer <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {/* Only show $ when user has entered a value */}
          {value && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base pointer-events-none z-10">
              {getCurrencySymbol()}
            </span>
          )}
          <input
            type="number"
            id="price-offer"
            name="price"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${minDollars}-${maxDollars}`}
            min={minDollars}
            max={maxDollars}
            step="1"
            inputMode="decimal"
            className={`w-full pr-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-bold ${
              error ? 'border-red-300 bg-red-50' : 'border-purple-300'
            }`}
            style={{
              paddingLeft: value ? '2rem' : '0.75rem'
            }}
            required
            autoComplete="off"
          />
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium mt-1">{error}</p>
        ) : (
          <p className="text-xs text-gray-600 mt-1">
            Range: ${minDollars} - ${maxDollars}
          </p>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Your Offer</h3>
      
      <div className="mb-3">
        <label htmlFor="price-offer-full" className="block text-sm font-semibold text-gray-700 mb-2">
          Offer Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {value && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg sm:text-xl pointer-events-none">
              {getCurrencySymbol()}
            </span>
          )}
          <input
            type="number"
            id="price-offer-full"
            name="price"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${minDollars} - ${maxDollars}`}
            min={minDollars}
            max={maxDollars}
            step="1"
            inputMode="decimal"
            className={`w-full pr-4 py-3 sm:py-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg sm:text-xl font-bold ${
              error ? 'border-red-300 bg-red-50' : 'border-purple-300'
            }`}
            style={{
              paddingLeft: value ? '2.5rem' : '1rem'
            }}
            required
            autoComplete="off"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {error ? (
            <div className="flex items-center gap-1 text-xs text-red-600 font-semibold animate-fadeIn">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
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