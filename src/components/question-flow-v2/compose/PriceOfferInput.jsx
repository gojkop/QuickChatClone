import React, { useState, useEffect } from 'react';

function PriceOfferInput({ value, onChange, minPrice, maxPrice, currency, compact = false }) {
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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

    setError('');
  }, [value]);

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    return symbols[currency] || '$';
  };

  if (compact) {
    return (
      <div className="spacing-md">
        <div className="flex items-center gap-2 mb-2">
          <label htmlFor="price-offer" className="label-premium flex-1">
            <span>Your Offer</span>
            <span className="required-badge">Required</span>
          </label>
          
          {/* ✅ NEW: Info Icon with Tooltip */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Price information"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {showTooltip && (
              <div 
                className="absolute right-0 top-8 z-50 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-fadeIn"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-2">How pricing works:</p>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                      <span>You suggest your offer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                      <span>Expert reviews your question within 24h</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
                      <span>They accept and their SLA starts, or they decline</span>
                    </li>
                  </ol>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <strong>You're only charged after they answer your question</strong>
                    </p>
                  </div>
                </div>
                {/* Triangle pointer */}
                <div 
                  className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
                ></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          {value && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base pointer-events-none z-10">
              {getCurrencySymbol()}
            </span>
          )}
          <input
            type="number"
            id="price-offer"
            name="price"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`${minDollars}-${maxDollars}`}
            step="1"
            inputMode="decimal"
            className={`input-premium w-full pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-bold transition-all ${
              error ? 'border-red-300 bg-red-50' : 'border-purple-300'
            }`}
            style={{
              paddingLeft: value ? '2rem' : '1rem',
              letterSpacing: '0.01em'
            }}
            required
            autoComplete="off"
          />
          {isFocused && (
            <div 
              className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 blur pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-semibold mt-2 animate-fadeIn">{error}</p>
        ) : (
          <p className="text-xs text-gray-600 mt-2">
            💡 Suggested range: ${minDollars} - ${maxDollars}
          </p>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-gradient-subtle-purple border-2 border-purple-200 rounded-2xl p-5 sm:p-6 spacing-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title-premium mb-0">Your Offer</h3>
        
        {/* ✅ NEW: Info Icon with Tooltip (Full Version) */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Price information"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {showTooltip && (
            <div 
              className="absolute right-0 top-10 z-50 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-5 animate-fadeIn"
              style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="text-sm">
                <p className="font-bold text-gray-900 mb-3 text-base">How pricing works:</p>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-semibold">You suggest your offer</p>
                      <p className="text-xs text-gray-600 mt-0.5">Enter what you're willing to pay</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-semibold">Expert reviews</p>
                      <p className="text-xs text-gray-600 mt-0.5">They assess your question's complexity</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-semibold">Accept or negotiate</p>
                      <p className="text-xs text-gray-600 mt-0.5">They can accept, decline, or suggest another price</p>
                    </div>
                  </li>
                </ol>
                <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong className="text-green-900">No charge until you approve:</strong> You'll only be charged after you agree to the final price</span>
                  </p>
                </div>
              </div>
              {/* Triangle pointer */}
              <div 
                className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
              ></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="spacing-sm">
        <label htmlFor="price-offer-full" className="label-premium">
          <span>Offer Amount</span>
          <span className="required-badge">Required</span>
        </label>
        <div className="relative">
          {value && (
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl pointer-events-none z-10">
              {getCurrencySymbol()}
            </span>
          )}
          <input
            type="number"
            id="price-offer-full"
            name="price"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`${minDollars} - ${maxDollars}`}
            step="1"
            inputMode="decimal"
            className={`input-premium w-full pr-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-bold transition-all ${
              error ? 'border-red-300 bg-red-50' : 'border-purple-300 bg-white'
            }`}
            style={{
              paddingLeft: value ? '3rem' : '1.25rem'
            }}
            required
            autoComplete="off"
          />
          {isFocused && (
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 blur-sm pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-2.5">
          {error ? (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold animate-fadeIn">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          ) : (
            <span className="text-xs text-gray-600 font-medium">
              💡 Suggested range: ${minDollars} - ${maxDollars}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
        <div className="flex items-start gap-2.5">
          <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-purple-900 body-text-premium">
            <strong>How it works:</strong> The expert will review your question and offer. 
            They may accept, decline, or propose a different price.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceOfferInput;