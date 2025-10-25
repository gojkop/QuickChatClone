import React from 'react';
import { Clock } from 'lucide-react';

function ResponseTimeChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Response Time Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Response Time Distribution</h3>
        <Clock size={20} className="text-blue-600" />
      </div>

      <div className="space-y-4">
        {data.map((bucket, index) => {
          const widthPercent = (bucket.count / maxCount) * 100;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
                {bucket.label}
              </span>
              
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-end px-2 transition-all"
                  style={{ width: `${widthPercent}%`, minWidth: bucket.count > 0 ? '40px' : '0' }}
                >
                  {bucket.count > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {bucket.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResponseTimeChart;