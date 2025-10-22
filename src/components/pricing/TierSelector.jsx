import React from 'react';
import { Zap, Target } from 'lucide-react';

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

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Choose Your Question Type
      </h2>

      <div className={`grid gap-4 ${availableTiers.length === 2 ? 'md:grid-cols-2' : 'md:max-w-md'}`}>
        {/* Quick Consult Card */}
        {quick_consult?.enabled && (
          <div className="bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg flex flex-col">
            <div className="p-6 flex-grow">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 min-h-[60px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Quick Consult</h3>
                  <p className="text-sm text-gray-500">Fast & Focused</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(quick_consult.price_cents)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Fixed price • {quick_consult.sla_hours}h turnaround
                </div>
              </div>

              {/* Description - Fixed height to maintain alignment */}
              <div className="mb-4 h-10">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {quick_consult.description || '\u00A0'}
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => onSelectTier('quick_consult', quick_consult)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Ask Question</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Feature List */}
            <div className="bg-blue-50 px-6 py-4 border-t border-blue-100">
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

        {/* Deep Dive Card */}
        {deep_dive?.enabled && (
          <div className="bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg flex flex-col">
            <div className="p-6 flex-grow">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 min-h-[60px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Deep Dive</h3>
                  <p className="text-sm text-gray-500">In-Depth Expert Review</p>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(deep_dive.min_price_cents)} - {formatPrice(deep_dive.max_price_cents)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  You propose • {deep_dive.sla_hours}h after acceptance
                </div>
              </div>

              {/* Description - Fixed height to maintain alignment */}
              <div className="mb-4 h-10">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {deep_dive.description || '\u00A0'}
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => onSelectTier('deep_dive', deep_dive)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Make Offer</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Feature List */}
            <div className="bg-purple-50 px-6 py-4 border-t border-purple-100">
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

      {/* Help Text */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        Not sure which to choose? Quick Consult is great for focused questions. Deep Dive is for comprehensive analysis where you set the price.
      </p>
    </div>
  );
};

export default TierSelector;
