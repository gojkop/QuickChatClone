import React from 'react';
import InsightCard from './InsightCard';

export default function MarketingOverview({ 
  campaigns, 
  insights, 
  trafficSources,
  onNavigate 
}) {
  // Calculate totals
  const totalVisits = campaigns.reduce((sum, c) => sum + c.total_visits, 0);
  const totalQuestions = campaigns.reduce((sum, c) => sum + c.total_questions, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.total_revenue, 0);
  const overallConversionRate = totalVisits > 0 ? ((totalQuestions / totalVisits) * 100).toFixed(1) : '0.0';

  // Get top traffic source
  const topSource = trafficSources.length > 0 
    ? trafficSources.reduce((prev, current) => 
        current.questions > prev.questions ? current : prev
      ) 
    : null;

  // Get top campaign
  const topCampaign = campaigns.length > 0
    ? campaigns.reduce((prev, current) => 
        current.total_revenue > prev.total_revenue ? current : prev
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
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
          <p className="text-xs text-subtext mt-2 font-medium">
            Profile page views
          </p>
        </div>

        {/* Questions */}
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
          <p className="text-xs text-subtext mt-2 font-medium">
            From tracked campaigns
          </p>
        </div>

        {/* Revenue */}
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
          <p className="text-xs text-subtext mt-2 font-medium">
            Total campaign revenue
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6 hover:shadow-elev-3 transition-all duration-base">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-subtext uppercase tracking-wide">Conv. Rate</h3>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-ink">{overallConversionRate}%</p>
          <p className="text-xs text-subtext mt-2 font-medium">
            Visit → Question rate
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Traffic Source Action */}
        {topSource && (
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border-2 border-indigo-200 p-6 shadow-elev-2 hover:shadow-elev-3 transition-all duration-base">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-indigo-900 mb-1">
                  🎯 Your Best Channel
                </h3>
                <p className="text-sm text-indigo-700 font-medium capitalize">
                  <strong>{topSource.name}</strong> drives {topSource.questions} questions
                  ({((topSource.questions / totalQuestions) * 100).toFixed(0)}% of total)
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('share-kit')}
              className="w-full btn bg-gradient-to-r from-primary to-accent text-white px-4 py-3 text-sm font-black shadow-elev-2 hover:shadow-elev-3"
            >
              Create {topSource.name} Post →
            </button>
          </div>
        )}

        {/* Top Campaign Action */}
        {topCampaign && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 shadow-elev-2 hover:shadow-elev-3 transition-all duration-base">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-green-900 mb-1">
                  💰 Top Performer
                </h3>
                <p className="text-sm text-green-700 font-medium">
                  <strong>{topCampaign.name}</strong> earned €{topCampaign.total_revenue}
                  ({((topCampaign.total_revenue / totalRevenue) * 100).toFixed(0)}% of revenue)
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('campaigns')}
              className="w-full btn bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 text-sm font-black shadow-elev-2 hover:shadow-elev-3"
            >
              View Campaign Details →
            </button>
          </div>
        )}
      </div>

      {/* Conversion Performance */}
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
        <h3 className="text-lg font-black text-ink mb-4">Conversion Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-subtext">Your Conversion Rate</span>
              <span className="text-sm font-black text-ink">
                {insights?.your_metrics?.visit_to_question?.toFixed(1) || overallConversionRate}%
              </span>
            </div>
            <div className="relative h-3 bg-canvas rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-slow" 
                style={{ width: `${Math.min(insights?.your_metrics?.visit_to_question || parseFloat(overallConversionRate), 100)}%` }}
              ></div>
            </div>
            {insights?.platform_average?.visit_to_question && (
              <p className="text-xs text-success mt-1 font-bold">
                {insights.your_metrics.visit_to_question > insights.platform_average.visit_to_question ? '✓' : '↓'} 
                {' '}Platform average: {insights.platform_average.visit_to_question}%
              </p>
            )}
          </div>

          {/* Insights with Actions */}
          {insights?.insights && insights.insights.length > 0 && (
            <div className="space-y-3 mt-4">
              {insights.insights.map((insight, idx) => (
                <InsightCard 
                  key={idx} 
                  {...insight}
                  onAction={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Traffic Sources Mini-View */}
      {trafficSources.length > 0 && (
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-ink">Traffic Sources</h3>
            <button
              onClick={() => onNavigate('campaigns')}
              className="text-primary hover:text-indigo-700 font-bold text-sm"
            >
              View All →
            </button>
          </div>
          
          <div className="space-y-3">
            {trafficSources.slice(0, 4).map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3 bg-canvas rounded-lg hover:bg-gray-100 transition-colors duration-fast">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-black text-primary capitalize">
                      {source.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-ink capitalize">{source.name}</p>
                    <p className="text-xs text-subtext">
                      {source.visits} visits • {source.questions} questions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-ink">€{source.revenue}</p>
                  <p className="text-xs text-subtext">
                    {((source.questions / source.visits) * 100).toFixed(1)}% conv.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}