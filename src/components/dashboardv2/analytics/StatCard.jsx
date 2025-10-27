// src/components/dashboardv2/analytics/StatCard.jsx
import React from 'react';

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend = null,
  trendSuffix = '%',
  trendInverse = false,
  color = 'indigo' 
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100',
    green: 'text-green-600 bg-gradient-to-br from-green-50 to-green-100',
    orange: 'text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100',
    purple: 'text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100',
    blue: 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100',
  };

  // Safe value display
  const displayValue = value !== null && value !== undefined 
    ? value 
    : '0';

  // Safe trend calculation
  const hasTrend = trend !== null && trend !== undefined && !isNaN(trend);
  const isPositive = hasTrend ? (trendInverse ? trend < 0 : trend > 0) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Mobile: Compact vertical layout */}
      <div className="flex sm:hidden flex-col items-center text-center gap-1">
        {Icon && (
          <div className={`p-1.5 rounded-lg shadow-sm ${colorClasses[color]}`}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        )}
        <span className="text-[10px] font-medium text-gray-600 leading-tight">{label}</span>
        <div className="text-base font-black text-gray-900">{displayValue}</div>
        {hasTrend && (
          <div className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '↑' : '↓'}
            <span>{Math.abs(trend).toFixed(1)}{trendSuffix}</span>
          </div>
        )}
      </div>

      {/* Desktop: Original horizontal layout */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          {Icon && (
            <div className={`p-2 rounded-lg shadow-sm ${colorClasses[color]}`}>
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}
        </div>

        <div className="text-2xl font-black text-gray-900 mb-2">
          {displayValue}
        </div>

        {hasTrend && (
          <div className={`inline-flex items-center gap-1 text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '↑' : '↓'}
            <span>{Math.abs(trend).toFixed(1)}{trendSuffix}</span>
            <span className="text-xs text-gray-500 font-normal ml-1">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;