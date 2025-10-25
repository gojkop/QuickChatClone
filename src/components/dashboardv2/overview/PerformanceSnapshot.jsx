import React from 'react';
import { TrendingUp } from 'lucide-react';

function PerformanceSnapshot() {
  // This would use real data in production
  const insights = [
    { label: 'Response time improved', value: '15%', positive: true },
    { label: 'Revenue growth', value: '+$1.2k', positive: true },
    { label: 'Most productive day', value: 'Tuesday', neutral: true },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp size={24} className="text-indigo-600" />
        Performance Insights
      </h2>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">{insight.label}</span>
            <span className={`text-sm font-bold ${
              insight.positive ? 'text-green-600' : 
              insight.neutral ? 'text-gray-900' : 'text-red-600'
            }`}>
              {insight.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-900">
          💡 <span className="font-semibold">Tip:</span> Your best answering time is between 9-11 AM. Questions answered during this window have 23% higher ratings!
        </p>
      </div>
    </div>
  );
}

export default PerformanceSnapshot;