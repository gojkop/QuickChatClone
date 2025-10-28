// src/components/dashboardv2/analytics/ResponseTimeDistribution.jsx
import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * ResponseTimeDistribution - Shows histogram of response times
 */
function ResponseTimeDistribution({ questions = [] }) {
  const distribution = useMemo(() => {
    const answered = questions.filter(q => q.answered_at && q.created_at);

    // Initialize buckets
    const buckets = [
      { label: '0-12h', min: 0, max: 12, count: 0 },
      { label: '12-24h', min: 12, max: 24, count: 0 },
      { label: '24-48h', min: 24, max: 48, count: 0 },
      { label: '48-60h', min: 48, max: 60, count: 0 },
      { label: '60-72h', min: 60, max: 72, count: 0 },
      { label: '72h+', min: 72, max: Infinity, count: 0 },
    ];

    // Calculate response times and categorize
    answered.forEach(q => {
      const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
      const hours = (answeredAt - created) / 3600;

      // Find appropriate bucket
      const bucket = buckets.find(b => hours >= b.min && hours < b.max);
      if (bucket) bucket.count++;
    });

    // Calculate max count for scaling
    const maxCount = Math.max(...buckets.map(b => b.count), 1);

    return { buckets, maxCount, total: answered.length };
  }, [questions]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
          <BarChart3 size={18} className="text-green-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Response Time Distribution</h3>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {distribution.buckets.map((bucket, index) => {
          const percentage = distribution.total > 0
            ? (bucket.count / distribution.total) * 100
            : 0;
          const barWidth = distribution.maxCount > 0
            ? (bucket.count / distribution.maxCount) * 100
            : 0;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {bucket.label}
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {bucket.count}
                  <span className="text-gray-500 font-normal ml-1">
                    ({percentage.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Total answered: <span className="font-bold text-gray-900">{distribution.total}</span>
        </p>
      </div>
    </div>
  );
}

export default ResponseTimeDistribution;
