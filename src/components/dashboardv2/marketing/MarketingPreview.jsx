// src/components/dashboardv2/marketing/MarketingPreview.jsx
import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

export default function MarketingPreview({ isEnabled, campaigns = [], trafficSources = [], insights = null }) {
  
  const marketingData = useMemo(() => {
    if (!trafficSources || trafficSources.length === 0) {
      return {
        totalVisits: 991,
        totalQuestions: 41,
        totalRevenue: 4920,
        conversionRate: 4.1,
        totalCampaigns: 3,
        hasRealData: false
      };
    }

    const totalVisits = trafficSources.reduce((sum, s) => sum + (s.visits || 0), 0);
    const totalQuestions = trafficSources.reduce((sum, s) => sum + (s.questions || 0), 0);
    const totalRevenue = trafficSources.reduce((sum, s) => sum + (s.revenue || 0), 0);
    const conversionRate = totalVisits > 0 ? ((totalQuestions / totalVisits) * 100).toFixed(1) : 0;

    const activeCampaigns = campaigns.filter(c => 
      trafficSources.some(s => s.name.toLowerCase() === c.utm_source.toLowerCase())
    ).length;

    return {
      totalVisits,
      totalQuestions,
      totalRevenue,
      conversionRate,
      totalCampaigns: activeCampaigns,
      hasRealData: true
    };
  }, [campaigns, trafficSources]);

  if (!isEnabled) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-sm">
          <BarChart3 size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">Marketing Hub</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900">
              BETA
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <p className="text-lg font-black text-gray-900">{marketingData.totalVisits}</p>
          <p className="text-xs text-gray-600 font-medium">Visits</p>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <p className="text-lg font-black text-gray-900">{marketingData.totalQuestions}</p>
          <p className="text-xs text-gray-600 font-medium">Questions</p>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <p className="text-lg font-black text-green-600">€{marketingData.totalRevenue}</p>
          <p className="text-xs text-gray-600 font-medium">Revenue</p>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
          <p className="text-lg font-black text-blue-600">{marketingData.conversionRate}%</p>
          <p className="text-xs text-gray-600 font-medium">Conv. Rate</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
        <span className="text-gray-600">
          <span className="font-bold text-gray-900">{marketingData.totalCampaigns}</span> active campaign{marketingData.totalCampaigns !== 1 ? 's' : ''}
        </span>
        <span className="text-indigo-600 font-semibold group-hover:underline">
          View Dashboard →
        </span>
      </div>
    </div>
  );
}