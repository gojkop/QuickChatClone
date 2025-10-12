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
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6 hover:shadow-elev-3 transition-all duration-base">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-subtext uppercase tracking-wide">Total Visits</h3>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-ink">{totalVisits.toLocaleString()}</p>
          <p className="text-xs text-success mt-2 font-bold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            23% vs last month
          </p>
        </div>

        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6 hover:shadow-elev-3 transition-all duration-base">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-subtext uppercase tracking-wide">Questions</h3>
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-ink">{totalQuestions}</p>
          <p className="text-xs text-success mt-2 font-bold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            31% vs last month
          </p>
        </div>

        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6 hover:shadow-elev-3 transition-all duration-base">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-subtext uppercase tracking-wide">Revenue</h3>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-ink">€{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-success mt-2 font-bold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            28% vs last month
          </p>
        </div>
      </div>

      {/* Conversion Benchmark */}
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
        <h3 className="text-lg font-black text-ink mb-4">Conversion Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-subtext">Visit → Question Rate</span>
              <span className="text-sm font-black text-ink">
                {insights?.your_metrics?.visit_to_question?.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-3 bg-canvas rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-slow" 
                style={{ width: `${Math.min(insights?.your_metrics?.visit_to_question || 0, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-success mt-1 font-bold">
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
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
        <h3 className="text-lg font-black text-ink mb-4">Top Performing Campaigns</h3>
        <div className="space-y-3">
          {campaigns.slice(0, 3).map((campaign, idx) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-canvas rounded-lg hover:bg-gray-100 transition-all duration-base">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-black text-gray-300">#{idx + 1}</div>
                <div>
                  <p className="font-bold text-ink">{campaign.name}</p>
                  <p className="text-sm text-subtext capitalize">{campaign.utm_source}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-ink">€{campaign.total_revenue}</p>
                <p className="text-sm text-subtext">
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