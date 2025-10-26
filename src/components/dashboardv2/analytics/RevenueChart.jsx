// src/components/dashboardv2/analytics/RevenueChart.jsx
import React, { useMemo } from 'react';

function RevenueChart({ questions = [], dateRange = '30d' }) {
  // Calculate revenue data safely
  const chartData = useMemo(() => {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const answeredQuestions = safeQuestions.filter(q => 
      q.answered_at && q.price_cents
    );

    // Group by date
    const revenueByDate = {};
    
    answeredQuestions.forEach(q => {
      const date = new Date(q.answered_at * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      
      revenueByDate[dateKey] += (q.price_cents || 0) / 100; // Convert to dollars
    });

    // Convert to array and sort
    const data = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return data;
  }, [questions, dateRange]);

  // Calculate total
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
        <span className="text-sm font-semibold text-green-600">
          ${totalRevenue.toFixed(2)}
        </span>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-2">
          {chartData.slice(-10).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20">
                {new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${(item.revenue / Math.max(...chartData.map(d => d.revenue))) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 w-16 text-right">
                ${item.revenue.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No revenue data yet</p>
          <p className="text-xs mt-1">Answer questions to see your earnings</p>
        </div>
      )}
    </div>
  );
}

export default RevenueChart;