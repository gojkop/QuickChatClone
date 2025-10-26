// src/components/dashboardv2/metrics/MetricTrend.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function MetricTrend({ value, suffix = '%', inverse = false, period = 'vs last month' }) {
  if (value === null || value === undefined) return null;
  
  const isPositive = inverse ? value < 0 : value > 0;
  const isNeutral = value === 0;
  const absValue = Math.abs(value);
  
  return (
    <div className="flex items-center justify-between">
      <div className={`inline-flex items-center gap-1 text-sm font-semibold ${
        isNeutral ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isNeutral ? (
          <Minus size={16} strokeWidth={2.5} />
        ) : isPositive ? (
          <TrendingUp size={16} strokeWidth={2.5} />
        ) : (
          <TrendingDown size={16} strokeWidth={2.5} />
        )}
        <span>
          {isPositive && '+'}{absValue}{suffix}
        </span>
      </div>
      <span className="text-xs text-gray-500 font-medium">{period}</span>
    </div>
  );
}

export default MetricTrend;