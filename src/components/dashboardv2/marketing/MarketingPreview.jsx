// src/components/dashboardv2/marketing/MarketingPreview.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarketingPreview({ isEnabled, campaigns = [], trafficSources = [], insights = null }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const marketingData = useMemo(() => {
    if (!trafficSources || trafficSources.length === 0) {
      return {
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
        totalRevenue: 4920,
        hasRealData: false
      };
    }

    const totalVisits = trafficSources.reduce((sum, s) => sum + (s.visits || 0), 0);
    const totalQuestions = trafficSources.reduce((sum, s) => sum + (s.questions || 0), 0);
    const totalRevenue = trafficSources.reduce((sum, s) => sum + (s.revenue || 0), 0);
    
    const topSource = trafficSources.length > 0
      ? trafficSources.reduce((prev, current) => 
          current.revenue > prev.revenue ? current : prev
        )
      : null;

    const topCampaign = topSource ? {
      name: `${topSource.name.charAt(0).toUpperCase() + topSource.name.slice(1)} campaigns`,
      total_visits: topSource.visits,
      total_questions: topSource.questions,
      total_revenue: topSource.revenue,
      conversion_rate: topSource.conversion_rate
    } : {
      name: "No campaigns yet",
      total_visits: 0,
      total_questions: 0,
      total_revenue: 0,
      conversion_rate: 0
    };

    const activeCampaigns = campaigns.filter(c => 
      trafficSources.some(s => s.name.toLowerCase() === c.utm_source.toLowerCase())
    ).length;

    return {
      topCampaign,
      totalCampaigns: activeCampaigns,
      totalVisits,
      totalQuestions,
      totalRevenue,
      hasRealData: true
    };
  }, [campaigns, trafficSources]);

  if (!isEnabled) return null;

  const handleCardClick = () => {
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile && !isExpanded) {
      setIsExpanded(true);
    } else {
      navigate('/dashboard/marketing');
    }
  };

  const handleChevronClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Desktop Version - Compact Card */}
      <div 
        onClick={() => navigate('/dashboard/marketing')}
        className="hidden lg:block bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm border border-indigo-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 group"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">Marketing Hub</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900">
                  BETA
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium mt-0.5">Track campaigns & grow revenue</p>
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

        {/* Stats Grid - 3 Columns */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-indigo-100">
            <p className="text-2xl font-black text-gray-900">{marketingData.totalVisits}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Total Visits</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-indigo-100">
            <p className="text-2xl font-black text-gray-900">{marketingData.totalQuestions}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Questions</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-indigo-100">
            <p className="text-2xl font-black text-green-600">€{marketingData.totalRevenue}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Revenue</p>
          </div>
        </div>

        {/* Footer with conversion */}
        {marketingData.totalQuestions > 0 && marketingData.totalVisits > 0 && (
          <div className="mt-4 pt-4 border-t border-indigo-200 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{marketingData.totalCampaigns}</span> active campaign{marketingData.totalCampaigns !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {((marketingData.totalQuestions / marketingData.totalVisits) * 100).toFixed(1)}% conversion
            </span>
          </div>
        )}
      </div>

      {/* Mobile Version - Collapsible */}
      <div 
        onClick={handleCardClick}
        className={`lg:hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm border border-indigo-200 cursor-pointer transition-all ${
          isExpanded ? 'p-6' : 'p-4'
        }`}
      >
        {!isExpanded ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900 text-sm">Marketing Hub</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900">
                    BETA
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {marketingData.totalQuestions} questions • €{marketingData.totalRevenue} revenue
                </p>
              </div>
            </div>
            <button
              onClick={handleChevronClick}
              className="flex-shrink-0 p-2 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Marketing Hub</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900">
                      BETA
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">Track & grow</p>
                </div>
              </div>
              <button
                onClick={handleChevronClick}
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xl font-black text-gray-900">{marketingData.totalVisits}</p>
                <p className="text-xs text-gray-600 mt-0.5">Visits</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xl font-black text-gray-900">{marketingData.totalQuestions}</p>
                <p className="text-xs text-gray-600 mt-0.5">Questions</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xl font-black text-green-600">€{marketingData.totalRevenue}</p>
                <p className="text-xs text-gray-600 mt-0.5">Revenue</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}