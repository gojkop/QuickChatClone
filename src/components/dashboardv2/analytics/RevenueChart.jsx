import React from 'react';
import { TrendingUp } from 'lucide-react';

function RevenueChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 200;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
        <TrendingUp size={20} className="text-green-600" />
      </div>

      {/* Simple Bar Chart */}
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>${maxValue.toFixed(0)}</span>
          <span>${(maxValue / 2).toFixed(0)}</span>
          <span>$0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md hover:from-green-600 hover:to-green-500 transition-all cursor-pointer group relative"
                  style={{ height: `${heightPercent}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ${item.value.toFixed(0)}
                  </div>
                </div>
                
                {/* X-axis label */}
                <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;