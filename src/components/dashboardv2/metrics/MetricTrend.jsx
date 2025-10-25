import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function MetricTrend({ value, suffix = '', inverse = false }) {
  if (!value || value === 0) return null;

  const isPositive = inverse ? value < 0 : value > 0;
  const displayValue = Math.abs(value).toFixed(1);

  return (
    <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      <span>{displayValue}{suffix}</span>
    </div>
  );
}

export default MetricTrend;