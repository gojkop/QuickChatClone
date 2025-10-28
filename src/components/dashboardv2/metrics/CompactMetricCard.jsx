// src/components/dashboardv2/metrics/CompactMetricCard.jsx
import React from 'react';

function CompactMetricCard({
  label,
  value,
  icon: Icon,
  color = 'indigo',
  trend = null,
  onClick,
  subtitle = null,
  isZeroState = false
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100',
    green: 'text-green-600 bg-gradient-to-br from-green-50 to-green-100',
    orange: 'text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100',
    purple: 'text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100',
    blue: 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100',
    gray: 'text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100',
  };

  // Format value to avoid NaN/undefined display
  // Allow strings (like "4.7 ⭐") and valid numbers, but block null/undefined/NaN numbers
  const displayValue = value !== null && value !== undefined && !(typeof value === 'number' && isNaN(value))
    ? value
    : '—';

  // Use gray color for zero state
  const displayColor = isZeroState ? 'gray' : color;

  return (
    <div
      className="h-full cursor-pointer group"
      onClick={onClick}
    >
      {/* Mobile: Ultra-compact vertical centered layout */}
      <div className="flex sm:hidden flex-col items-center text-center justify-center h-full gap-1">
        {Icon && (
          <div className={`p-1 rounded shadow-sm ${colorClasses[displayColor]} transition-transform group-hover:scale-110 ${isZeroState ? 'opacity-50' : ''}`}>
            <Icon size={12} strokeWidth={2.5} />
          </div>
        )}
        <span className="text-[10px] font-medium text-gray-600 leading-tight mt-0.5">{label}</span>
        <h3 className={`text-base font-black tracking-tight leading-tight ${isZeroState ? 'text-gray-500' : 'text-gray-900'}`}>
          {displayValue}
        </h3>
        {!isZeroState && trend !== null && !isNaN(trend) && (
          <div className={`text-[9px] font-semibold leading-tight ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
        {subtitle && (
          <p className={`text-[9px] leading-tight ${isZeroState ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
        )}
      </div>

      {/* Desktop: Original horizontal layout */}
      <div className="hidden sm:flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-1.5 flex-shrink-0">
          <span className="text-xs font-medium text-gray-600">{label}</span>
          {Icon && (
            <div className={`p-1.5 rounded-lg shadow-sm ${colorClasses[displayColor]} transition-transform group-hover:scale-110 flex-shrink-0 ${isZeroState ? 'opacity-50' : ''}`}>
              <Icon size={13} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className={`text-2xl font-black tracking-tight ${isZeroState ? 'text-gray-500' : 'text-gray-900'}`}>
            {displayValue}
          </h3>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isZeroState ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>

        {/* Trend */}
        {!isZeroState && trend !== null && !isNaN(trend) && (
          <div className={`text-xs font-semibold mt-1 flex-shrink-0 ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default CompactMetricCard;