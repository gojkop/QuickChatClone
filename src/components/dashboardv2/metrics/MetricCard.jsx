import React from 'react';
import MetricTrend from './MetricTrend';

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend = null, 
  trendSuffix = '%',
  trendInverse = false,
  color = 'indigo',
  loading = false
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100',
    green: 'text-green-600 bg-gradient-to-br from-green-50 to-green-100',
    orange: 'text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100',
    purple: 'text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100',
    blue: 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100',
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 card-premium">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 skeleton rounded"></div>
          <div className="w-10 h-10 skeleton rounded-lg"></div>
        </div>
        <div className="h-8 w-24 skeleton rounded mb-2"></div>
        <div className="h-4 w-16 skeleton rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">
          {label}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl shadow-sm ${colorClasses[color]} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
            <Icon size={20} className="icon-container" />
          </div>
        )}
      </div>
      
      <div className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
        {value}
      </div>

      {trend !== null && (
        <MetricTrend value={trend} suffix={trendSuffix} inverse={trendInverse} />
      )}
    </div>
  );
}

export default MetricCard;