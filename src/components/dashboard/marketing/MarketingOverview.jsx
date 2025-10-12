import React from 'react';
import InsightCard from './InsightCard';

export default function MarketingOverview({ campaigns, insights, trafficSources }) {
  // Calculate totals
  const totalVisits = campaigns.reduce((sum, c) => sum + c.total_visits, 0);
  const totalQuestions = campaigns.reduce((sum, c) => sum + c.total_questions, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.total_revenue, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Visits</h3>
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalVisits.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2 font-semibold">↑ 23% vs last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Questions</h3>
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalQuestions}</p>
          <p className="text-xs text-green-600 mt-2 font-semibold">↑ 31% vs last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-black text-gray-900">€{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2 font-semibold">↑ 28% vs last month</p>
        </div>
      </div>

      {/* Conversion Benchmark */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Conversion Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Visit → Question Rate</span>
              <span className="text-sm font-bold text-gray-900">
                {insights?.your_metrics?.visit_to_question?.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full" 
                style={{ width: `${Math.min(insights?.your_metrics?.visit_to_question || 0, 10)}%` }}
              ></div>
            </div>
            <p className="text-xs text-green-600 mt-1 font-semibold">
              ✓ Above platform average ({insights?.platform_average?.visit_to_question}%)
            </p>
          </div>

          {/* Insights */}
          {insights?.insights && insights.insights.length > 0 && (
            <div className="space-y-3 mt-4">
              {insights.insights.map((insight, idx) => (
                <InsightCard key={idx} {...insight} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Campaigns</h3>
        <div className="space-y-3">
          {campaigns.slice(0, 3).map((campaign, idx) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-black text-gray-400">#{idx + 1}</div>
                <div>
                  <p className="font-semibold text-gray-900">{campaign.name}</p>
                  <p className="text-sm text-gray-600">{campaign.utm_source}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">€{campaign.total_revenue}</p>
                <p className="text-sm text-gray-600">
                  {campaign.total_questions} questions • {campaign.conversion_rate}% conv.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}	