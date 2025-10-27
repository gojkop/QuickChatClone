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
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-gray-600">{label}</span>
        {Icon && (
          <div className={`p-1.5 sm:p-2 rounded-lg shadow-sm ${colorClasses[color]}`}>
            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
        {displayValue}
      </div>

      {hasTrend && (
        <div className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? '↑' : '↓'}
          <span>{Math.abs(trend).toFixed(1)}{trendSuffix}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 font-normal ml-0.5 sm:ml-1 hidden sm:inline">vs last period</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;