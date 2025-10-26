// src/components/dashboardv2/metrics/CompactMetricCard.jsx
import React from 'react';

function CompactMetricCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'indigo',
  trend = null,
  onClick
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100',
    green: 'text-green-600 bg-gradient-to-br from-green-50 to-green-100',
    orange: 'text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100',
    purple: 'text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100',
    blue: 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100',
  };

  return (
    <div 
      className="h-full flex flex-col justify-between cursor-pointer group"
      onClick={onClick}
    >
      {/* Header - COMPACT */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg shadow-sm ${colorClasses[color]} transition-transform group-hover:scale-110`}>
            <Icon size={13} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Value - SMALLER */}
      <div className="flex-1 flex items-center">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          {value}
        </h3>
      </div>

      {/* Trend - COMPACT */}
      {trend !== null && (
        <div className={`text-xs font-semibold mt-1 ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export default CompactMetricCard;