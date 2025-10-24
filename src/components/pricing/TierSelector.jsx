import React, { useState } from 'react';

// ⭐ INLINE SVG ICONS - No external dependencies
const ZapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>
);

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  if (amount % 1 !== 0) {
    return symbol + amount.toFixed(2);
  }
  return symbol + amount.toFixed(0);
};

const TierSelector = ({ tiers, expertName, onSelectTier }) => {
  const [loadingTier, setLoadingTier] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null); // 'quick_consult', 'deep_dive', or null

  const { quick_consult, deep_dive } = tiers || {};

  // Filter enabled tiers
  const availableTiers = [];
  if (quick_consult?.enabled) {
    availableTiers.push({
      type: 'quick_consult',
      ...quick_consult
    });
  }
  if (deep_dive?.enabled) {
    availableTiers.push({
      type: 'deep_dive',
      ...deep_dive
    });
  }

  // If no tiers enabled, don't render anything
  if (availableTiers.length === 0) {
    return null;
  }

  const handleTierSelect = async (tierType, tierConfig) => {
    setLoadingTier(tierType);
    try {
      await onSelectTier(tierType, tierConfig);
    } catch (error) {
      console.error('Tier selection error:', error);
    } finally {
      setTimeout(() => setLoadingTier(null), 300);
    }
  };

  const toggleExpand = (cardType, e) => {
    e.stopPropagation(); // Prevent card click from triggering
    setExpandedCard(expandedCard === cardType ? null : cardType);
  };

  const handleCardClick = (tierType, tierConfig) => {
    // Only navigate if not clicking the expand button
    handleTierSelect(tierType, tierConfig);
  };

  return (
    <div className="mt-6">
      {/* Compact header with smaller text */}
      <div className="mb-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 text-center tracking-tight">
          Choose Your Question Type
        </h2>
        <p className="text-xs md:text-sm text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
          Not sure? Quick Consult is perfect for focused questions. Deep Dive is for comprehensive analysis where you propose the price.
        </p>
      </div>

      <div className={`grid gap-3 sm:gap-4 ${availableTiers.length === 2 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
        {/* Quick Consult Card */}
        {quick_consult?.enabled && (
          <div 
            onClick={() => handleCardClick('quick_consult', quick_consult)}
            className="bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover-lift flex flex-col"
          >
            {/* Always Visible Top Section */}
            <div className="p-4 sm:p-5">
              {/* Header with Expand Arrow */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <ZapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">Quick Consult</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Fast & Focused</p>
                  </div>
                </div>
                
                {/* Expand Arrow Button */}
                <button 
                  onClick={(e) => toggleExpand('quick_consult', e)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 flex-shrink-0 ml-2 group touch-manipulation"
                  aria-label={expandedCard === 'quick_consult' ? 'Collapse details' : 'Expand details'}
                >
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
                      expandedCard === 'quick_consult' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Collapsed State: Price + CTA in compact layout */}
              {expandedCard !== 'quick_consult' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-lg sm:text-xl text-gray-900">{formatPrice(quick_consult.price_cents)}</span>
                    <span className="mx-1.5 text-gray-400">•</span>
                    <span className="text-xs sm:text-sm">{quick_consult.sla_hours}h turnaround</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTierSelect('quick_consult', quick_consult);
                    }}
                    disabled={loadingTier === 'quick_consult'}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium sm:font-semibold px-4 py-2 sm:py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm whitespace-nowrap min-h-[40px] sm:min-h-[44px] touch-manipulation disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden shadow-sm hover:shadow-md"
                  >
                    {loadingTier === 'quick_consult' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Ask Question</span>
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {/* Shimmer effect */}
                    {loadingTier !== 'quick_consult' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Expanded State: Full Details */}
            {expandedCard === 'quick_consult' && (
              <div className="tier-expanded-content">
                {/* Price Section */}
                <div className="px-4 sm:px-5 pb-4">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(quick_consult.price_cents)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Fixed price • {quick_consult.sla_hours}h turnaround
                    </div>
                  </div>

                  {/* Description */}
                  {quick_consult.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {quick_consult.description}
                      </p>
                    </div>
                  )}

                  {/* CTA Button - Full width in expanded state */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTierSelect('quick_consult', quick_consult);
                    }}
                    disabled={loadingTier === 'quick_consult'}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] min-h-[48px] touch-manipulation disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden shadow-md hover:shadow-lg"
                  >
                    {loadingTier === 'quick_consult' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Ask Question</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {/* Enhanced shimmer effect */}
                    {loadingTier !== 'quick_consult' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    )}
                  </button>
                </div>

                {/* Feature List */}
                <div className="bg-blue-50 px-4 py-3 sm:px-5 sm:py-4 border-t border-blue-100">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span>Immediate SLA start</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span>Fixed pricing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span>Best for tactical advice</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deep Dive Card */}
        {deep_dive?.enabled && (
          <div 
            onClick={() => handleCardClick('deep_dive', deep_dive)}
            className="bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover-lift flex flex-col"
          >
            {/* Always Visible Top Section */}
            <div className="p-4 sm:p-5">
              {/* Header with Expand Arrow */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <TargetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">Deep Dive</h3>
                    <p className="text-xs sm:text-sm text-gray-500">In-Depth Expert Review</p>
                  </div>
                </div>
                
                {/* Expand Arrow Button */}
                <button 
                  onClick={(e) => toggleExpand('deep_dive', e)}
                  className="p-2 hover:bg-purple-50 rounded-lg transition-all duration-200 flex-shrink-0 ml-2 group touch-manipulation"
                  aria-label={expandedCard === 'deep_dive' ? 'Collapse details' : 'Expand details'}
                >
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-purple-600 transition-transform duration-200 ${
                      expandedCard === 'deep_dive' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Collapsed State: Price + CTA in compact layout */}
              {expandedCard !== 'deep_dive' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-lg sm:text-xl text-gray-900">
                      {formatPrice(deep_dive.min_price_cents)} - {formatPrice(deep_dive.max_price_cents)}
                    </span>
                    <span className="mx-1.5 text-gray-400">•</span>
                    <span className="text-xs sm:text-sm">{deep_dive.sla_hours}h after accept</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTierSelect('deep_dive', deep_dive);
                    }}
                    disabled={loadingTier === 'deep_dive'}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium sm:font-semibold px-4 py-2 sm:py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm whitespace-nowrap min-h-[40px] sm:min-h-[44px] touch-manipulation disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden shadow-sm hover:shadow-md"
                  >
                    {loadingTier === 'deep_dive' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Make Offer</span>
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {/* Shimmer effect */}
                    {loadingTier !== 'deep_dive' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Expanded State: Full Details */}
            {expandedCard === 'deep_dive' && (
              <div className="tier-expanded-content">
                {/* Price Section */}
                <div className="px-4 sm:px-5 pb-4">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(deep_dive.min_price_cents)} - {formatPrice(deep_dive.max_price_cents)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      You propose • {deep_dive.sla_hours}h after acceptance
                    </div>
                  </div>

                  {/* Description */}
                  {deep_dive.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {deep_dive.description}
                      </p>
                    </div>
                  )}

                  {/* CTA Button - Full width in expanded state */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTierSelect('deep_dive', deep_dive);
                    }}
                    disabled={loadingTier === 'deep_dive'}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] min-h-[48px] touch-manipulation disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden shadow-md hover:shadow-lg"
                  >
                    {loadingTier === 'deep_dive' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Make Offer</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {/* Enhanced shimmer effect */}
                    {loadingTier !== 'deep_dive' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    )}
                  </button>
                </div>

                {/* Feature List */}
                <div className="bg-purple-50 px-4 py-3 sm:px-5 sm:py-4 border-t border-purple-100">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span>Deep reviews</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span>Flexible pricing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span>Best for complex topics</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TierSelector;