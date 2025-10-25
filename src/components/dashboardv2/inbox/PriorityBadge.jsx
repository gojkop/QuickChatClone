import React from 'react';
import { Zap, Star } from 'lucide-react';

function PriorityBadge({ question }) {
  const priceUsd = (question.price_cents || 0) / 100;
  const isDeepDive = question.pricing_tier === 'tier2';
  const isHighValue = priceUsd >= 100;

  if (isDeepDive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold">
        <Star size={12} />
        Deep Dive
      </span>
    );
  }

  if (isHighValue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-semibold">
        <Zap size={12} />
        High Value
      </span>
    );
  }

  return null;
}

export default PriorityBadge;