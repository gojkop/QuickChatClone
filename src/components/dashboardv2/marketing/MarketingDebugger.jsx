import React, { useState } from 'react';
import { useMarketing } from '@/hooks/useMarketing';

/**
 * Marketing Data Debugger
 * Add this component temporarily to any marketing page to see raw API data
 * Usage: <MarketingDebugger />
 */
export default function MarketingDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    campaigns, 
    trafficSources, 
    insights, 
    expertProfile,
    user,
    stats,
    isLoading,
    error 
  } = useMarketing();

  // Calculate what components are calculating
  const calculatedMetrics = {
    fromCampaigns: {
      totalVisits: campaigns.reduce((sum, c) => sum + (c.total_visits || 0), 0),
      totalQuestions: campaigns.reduce((sum, c) => sum + (c.total_questions || 0), 0),
      totalRevenue: campaigns.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
      campaignCount: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    },
    fromInsights: {
      totalVisits: insights?.your_metrics?.total_visits || 0,
      totalQuestions: insights?.your_metrics?.total_questions || 0,
      conversionRate: insights?.your_metrics?.visit_to_question || 0,
    },
    fromTrafficSources: {
      totalVisits: trafficSources.reduce((sum, s) => sum + (s.visits || 0), 0),
      totalQuestions: trafficSources.reduce((sum, s) => sum + (s.questions || 0), 0),
      totalRevenue: trafficSources.reduce((sum, s) => sum + (s.revenue || 0), 0),
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 font-bold text-sm"
        >
          🐛 Debug Marketing Data
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-auto p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-red-600">🐛 Marketing Data Debugger</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
          >
            Close
          </button>
        </div>

        {isLoading && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="font-bold text-yellow-800">⏳ Loading data...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="font-bold text-red-800">❌ Error: {error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Data Consistency Check */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-black text-red-900 mb-3">⚠️ Data Consistency Issues</h3>
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${
                calculatedMetrics.fromCampaigns.totalVisits === calculatedMetrics.fromInsights.totalVisits
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <strong>Total Visits:</strong> Campaigns={calculatedMetrics.fromCampaigns.totalVisits} | 
                Insights={calculatedMetrics.fromInsights.totalVisits} | 
                Traffic Sources={calculatedMetrics.fromTrafficSources.totalVisits}
              </div>
              <div className={`p-2 rounded ${
                calculatedMetrics.fromCampaigns.totalQuestions === calculatedMetrics.fromInsights.totalQuestions
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <strong>Total Questions:</strong> Campaigns={calculatedMetrics.fromCampaigns.totalQuestions} | 
                Insights={calculatedMetrics.fromInsights.totalQuestions} | 
                Traffic Sources={calculatedMetrics.fromTrafficSources.totalQuestions}
              </div>
              <div className="p-2 rounded bg-blue-100 text-blue-800">
                <strong>Total Revenue:</strong> Campaigns={calculatedMetrics.fromCampaigns.totalRevenue} | 
                Traffic Sources={calculatedMetrics.fromTrafficSources.totalRevenue}
              </div>
            </div>
          </div>

          {/* Campaigns Data */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-black text-blue-900 mb-3">
              📊 Campaigns Data ({campaigns.length} campaigns)
            </h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {campaigns.map((campaign, idx) => (
                <details key={campaign.id} className="bg-white p-3 rounded border">
                  <summary className="font-bold cursor-pointer">
                    {idx + 1}. {campaign.name} (ID: {campaign.id})
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(campaign, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </div>

          {/* Insights Data */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-black text-purple-900 mb-3">💡 Insights Data</h3>
            <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-96">
              {JSON.stringify(insights, null, 2)}
            </pre>
          </div>

          {/* Traffic Sources Data */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-black text-green-900 mb-3">
              🎯 Traffic Sources ({trafficSources.length} sources)
            </h3>
            <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-96">
              {JSON.stringify(trafficSources, null, 2)}
            </pre>
          </div>

          {/* Expert Profile */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="font-black text-indigo-900 mb-3">👤 Expert Profile</h3>
            <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-96">
              {JSON.stringify(expertProfile, null, 2)}
            </pre>
          </div>

          {/* User Data */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-black text-yellow-900 mb-3">👤 User Data</h3>
            <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-96">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Stats */}
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <h3 className="font-black text-pink-900 mb-3">📈 Stats</h3>
            <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-96">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>

          {/* API Endpoints Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-black text-gray-900 mb-3">🔗 API Endpoints Being Called</h3>
            <div className="text-sm space-y-1 font-mono">
              <div>✓ GET /marketing/campaigns</div>
              <div>✓ GET /marketing/traffic-sources</div>
              <div>✓ GET /marketing/insights</div>
              <div>✓ GET /expert-profile</div>
            </div>
          </div>

          {/* Copy to Clipboard */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const debugData = {
                  calculatedMetrics,
                  campaigns,
                  insights,
                  trafficSources,
                  expertProfile,
                  user,
                  stats,
                  timestamp: new Date().toISOString(),
                };
                navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
                alert('Debug data copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              📋 Copy All Data to Clipboard
            </button>
            <button
              onClick={() => {
                console.group('🐛 Marketing Debug Data');
                console.log('Calculated Metrics:', calculatedMetrics);
                console.log('Campaigns:', campaigns);
                console.log('Insights:', insights);
                console.log('Traffic Sources:', trafficSources);
                console.log('Expert Profile:', expertProfile);
                console.log('User:', user);
                console.log('Stats:', stats);
                console.groupEnd();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
            >
              🖨️ Log to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}