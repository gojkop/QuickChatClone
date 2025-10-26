// src/components/dashboardv2/overview/PerformanceSnapshot.jsx
import React from 'react';
import { TrendingUp } from 'lucide-react';

function PerformanceSnapshot() {
  const insights = [
    { label: 'Response time improved', value: '15%', positive: true },
    { label: 'Revenue growth', value: '+$1.2k', positive: true },
    { label: 'Most productive day', value: 'Tuesday', neutral: true },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp size={20} className="text-indigo-600" />
        Performance Insights
      </h2>

      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-700">{insight.label}</span>
            <span className={`text-xs font-bold ${
              insight.positive ? 'text-green-600' : 
              insight.neutral ? 'text-gray-900' : 'text-red-600'
            }`}>
              {insight.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-xs text-indigo-900">
          💡 <span className="font-semibold">Tip:</span> Your best answering time is between 9-11 AM. Questions answered during this window have 23% higher ratings!
        </p>
      </div>
    </div>
  );
}

export default PerformanceSnapshot;