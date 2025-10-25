import React from 'react';
import { Star, Zap, Sparkles } from 'lucide-react';

function PriorityBadge({ question }) {
  const priceUsd = (question.price_cents || 0) / 100;
  const isDeepDive = question.pricing_tier === 'tier2';
  const isHighValue = priceUsd >= 100;
  const isPremium = priceUsd >= 500;

  if (isPremium) {
    return (
      <span className="badge-premium bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md">
        <Sparkles size={12} className="icon-container" />
        <span className="font-bold">Premium</span>
      </span>
    );
  }

  if (isDeepDive) {
    return (
      <span className="badge-premium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
        <Star size={12} className="icon-container" />
        <span className="font-bold">Deep Dive</span>
      </span>
    );
  }

  if (isHighValue) {
    return (
      <span className="badge-premium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200">
        <Zap size={12} className="icon-container" />
        <span className="font-bold">High Value</span>
      </span>
    );
  }

  return null;
}

export default PriorityBadge;