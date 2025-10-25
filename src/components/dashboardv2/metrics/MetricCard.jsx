import React from 'react';
import MetricTrend from './MetricTrend';

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend = null, 
  trendSuffix = '%',
  trendInverse = false,
  color = 'indigo'
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">
          {label}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="text-3xl font-black text-gray-900 mb-2">
        {value}
      </div>

      {trend !== null && (
        <MetricTrend value={trend} suffix={trendSuffix} inverse={trendInverse} />
      )}
    </div>
  );
}

export default MetricCard;