// MarketingOverview.jsx - FIXED VERSION
// Use trafficSources as single source of truth until backend is fixed

export default function MarketingOverview({ 
  campaigns, 
  insights, 
  trafficSources,
  onNavigate 
}) {
  // ✅ FIX: Calculate from trafficSources instead of campaigns
  const totalVisits = trafficSources.reduce((sum, s) => sum + (s.visits || 0), 0);
  const totalQuestions = trafficSources.reduce((sum, s) => sum + (s.questions || 0), 0);
  const totalRevenue = trafficSources.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const overallConversionRate = totalVisits > 0 ? ((totalQuestions / totalVisits) * 100).toFixed(1) : '0.0';

  // ✅ FIX: Use trafficSources data, not insights data (which pulls from overall profile)
  const yourConversionRate = overallConversionRate;
  const platformAverage = insights?.platform_average?.visit_to_question || 3.2;

  const topSource = trafficSources.length > 0 
    ? trafficSources.reduce((prev, current) => 
        current.questions > prev.questions ? current : prev
      ) 
    : null;

  // ✅ FIX: Calculate top campaign from traffic sources, not campaigns table
  // Group traffic sources back to campaigns for "top campaign" card
  const campaignPerformance = campaigns.map(campaign => {
    // Find matching traffic source
    const matchingSource = trafficSources.find(s => 
      s.name.toLowerCase() === campaign.utm_source.toLowerCase()
    );
    
    return {
      ...campaign,
      actual_visits: matchingSource?.visits || 0,
      actual_questions: matchingSource?.questions || 0,
      actual_revenue: matchingSource?.revenue || 0,
      actual_conversion: matchingSource ? 
        ((matchingSource.questions / matchingSource.visits) * 100).toFixed(1) : 0
    };
  }).filter(c => c.actual_revenue > 0); // Only show campaigns with revenue

  const topCampaign = campaignPerformance.length > 0
    ? campaignPerformance.reduce((prev, current) => 
        current.actual_revenue > prev.actual_revenue ? current : prev
      )
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 mb-1">
              About Your Campaign Analytics
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed mb-2">
              Your campaign tracking respects visitor privacy through <strong>cookie consent</strong>. 
              When visitors arrive via your campaign links, they choose whether to allow marketing cookies:
            </p>
            <ul className="text-xs text-amber-800 space-y-1 ml-4 list-disc">
              <li><strong>Accept:</strong> Visit is tracked and attributed to your campaign (shown in analytics above)</li>
              <li><strong>Reject:</strong> Visit is <em>not</em> tracked; if they ask a question, it won't be linked to your campaign</li>
            </ul>
            <p className="text-xs text-amber-800 leading-relaxed mt-2">
              <strong>What this means:</strong> The numbers above represent visitors who <em>consented</em> to marketing tracking. 
              Your actual reach may be higher, but we only count visitors who opted in to comply with GDPR privacy laws.
            </p>
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-xs text-amber-700 font-medium">
                💡 <strong>Tip:</strong> High-quality content and clear calls-to-action help convert visitors regardless of tracking. 
                Focus on providing value, and those who consent will be accurately measured here.
              </p>
            </div>
          </div>
        </div>
        </div>
      {/* Key Metrics - NOW ACCURATE */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Visits */}
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-subtext uppercase tracking-wide">Visits</h3>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-ink">{totalVisits.toLocaleString()}</p>
          <p className="text-xs text-subtext mt-1 sm:mt-2 font-medium">
            From campaigns
          </p>
        </div>

        {/* Questions */}
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-subtext uppercase tracking-wide">Questions</h3>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-ink">{totalQuestions}</p>
          <p className="text-xs text-subtext mt-1 sm:mt-2 font-medium">
            From campaigns
          </p>
        </div>

        {/* Revenue */}
<div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-3 sm:p-6">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-xs sm:text-sm font-bold text-subtext uppercase tracking-wide">Campaign Revenue</h3>
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </div>
  <p className="text-2xl sm:text-3xl font-black text-ink">€{totalRevenue.toLocaleString()}</p>
  <p className="text-xs text-subtext mt-1 sm:mt-2 font-medium">
    Attributed to campaigns
  </p>
</div>
        {/* Conversion Rate */}
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-subtext uppercase tracking-wide">Conv. Rate</h3>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-ink">{yourConversionRate}%</p>
          <p className="text-xs text-subtext mt-1 sm:mt-2 font-medium">
            Visit → Question
          </p>
        </div>
      </div>
{/* Revenue Info Tooltip */}
<div className="col-span-2 sm:col-span-2 lg:col-span-4">
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-xs text-blue-800 font-medium">
      <strong>Campaign Revenue</strong> tracks payments from questions attributed to your marketing campaigns. 
      This shows which campaigns drive purchases, not fulfillment status.
    </p>
  </div>
</div>
      {/* Rest of component... */}
      {/* Conversion Performance */}
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
        <h3 className="text-lg font-black text-ink mb-4">Conversion Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-subtext">Your Conversion Rate</span>
              <span className="text-lg font-black text-ink">
                {yourConversionRate}%
              </span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-slow" 
                style={{ width: `${Math.min(parseFloat(yourConversionRate), 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-subtext mt-2 font-medium">
              {parseFloat(yourConversionRate) > platformAverage ? '✓' : '↓'} 
              {' '}Platform average: {platformAverage}%
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards - Updated with actual data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topSource && (
          <div className="bg-surface rounded-lg border border-gray-200 p-4">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <h3 className="text-sm font-bold text-ink">Your Best Channel</h3>
              </div>
              <p className="text-sm text-subtext font-medium capitalize">
                <strong className="text-ink">{topSource.name}</strong> drives {topSource.questions} questions
                <span className="text-xs ml-1">({((topSource.questions / totalQuestions) * 100).toFixed(0)}% of total)</span>
              </p>
            </div>
          </div>
        )}

        {topCampaign && (
          <div className="bg-surface rounded-lg border border-gray-200 p-4">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <h3 className="text-sm font-bold text-ink">Top Performer</h3>
              </div>
 <p className="text-sm text-subtext font-medium">
  <strong className="text-ink">{topCampaign.name}</strong> generated €{topCampaign.actual_revenue}
  <span className="text-xs ml-1">({((topCampaign.actual_revenue / totalRevenue) * 100).toFixed(0)}% of campaign revenue)</span>
</p>
            </div>
          </div>
        )}
      </div>

      {/* Traffic Sources - No changes needed, already accurate */}
      {trafficSources.length > 0 && (
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-ink">Traffic Sources</h3>
          </div>
          
          <div className="space-y-3">
            {trafficSources.map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3 bg-canvas rounded-lg">
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
                    {source.conversion_rate}% conv.
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