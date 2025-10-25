import React from 'react';
import { Lightbulb } from 'lucide-react';

function InsightsPanel({ insights = [] }) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={20} className="text-yellow-600" />
        <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {insight.title}
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">
                  {insight.value}
                </div>
                <div className="text-xs text-gray-500">
                  {insight.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InsightsPanel;