import React from 'react';

function StatCard({ label, value, trend, trendLabel, icon: Icon, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="text-3xl font-black text-gray-900 mb-2">
        {value}
      </div>

      {trend !== undefined && (
        <div className={`text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          {trendLabel && <span className="text-gray-500 font-normal ml-1">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;