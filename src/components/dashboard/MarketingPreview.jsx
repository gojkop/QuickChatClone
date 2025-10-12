import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarketingPreview({ isEnabled }) {
  const navigate = useNavigate();
  
  // Mock data - will be replaced with real data from API later
  const mockData = {
    topCampaign: {
      name: "LinkedIn Launch Post",
      total_visits: 342,
      total_questions: 14,
      total_revenue: 1680,
      conversion_rate: 4.1
    },
    totalCampaigns: 3,
    totalVisits: 991,
    totalQuestions: 41,
    totalRevenue: 4920
  };

  // Don't render if feature is disabled
  if (!isEnabled) return null;

  return (
    <div 
      onClick={() => navigate('/expert/marketing')}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6 cursor-pointer hover:shadow-lg transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              Marketing
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                BETA
              </span>
            </h3>
            <p className="text-sm text-gray-600">Track campaigns & grow revenue</p>
          </div>
        </div>
        <svg 
          className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Top Campaign Highlight */}
      <div className="mb-4 pb-4 border-b border-indigo-200">
        <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Top Campaign</p>
        <p className="font-bold text-gray-900 mb-1">{mockData.topCampaign.name}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{mockData.topCampaign.total_questions}</span> questions
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{mockData.topCampaign.conversion_rate}%</span> conv.
          </span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">{mockData.totalVisits}</p>
          <p className="text-xs text-gray-600 mt-0.5">Total Visits</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">{mockData.totalQuestions}</p>
          <p className="text-xs text-gray-600 mt-0.5">Questions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">€{mockData.totalRevenue}</p>
          <p className="text-xs text-gray-600 mt-0.5">Revenue</p>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="mt-4 pt-4 border-t border-indigo-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{mockData.totalCampaigns}</span> active campaigns
          </span>
          <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            23% vs last month
          </span>
        </div>
      </div>

      {/* Hover Hint */}
      <div className="mt-3 pt-3 border-t border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-center text-indigo-700 font-semibold">
          Click to view full dashboard →
        </p>
      </div>
    </div>
  );
}