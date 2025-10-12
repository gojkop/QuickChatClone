import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarketingPreview({ isEnabled }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  const handleClick = () => {
    // On mobile: first click expands, second click navigates
    // On desktop: always navigates
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile && !isExpanded) {
      setIsExpanded(true);
    } else {
      navigate('/expert/marketing');
    }
  };

  return (
    <>
      {/* Desktop Version - Always Expanded */}
      <div 
        onClick={() => navigate('/expert/marketing')}
        className="hidden lg:block bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-elev-2 border border-indigo-200 p-6 cursor-pointer hover:shadow-elev-3 transition-all duration-base group"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-ink flex items-center gap-2">
                Marketing
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                  BETA
                </span>
              </h3>
              <p className="text-sm text-subtext font-medium">Track campaigns & grow revenue</p>
            </div>
          </div>
          <svg 
            className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Top Campaign Highlight */}
        <div className="mb-4 pb-4 border-b border-indigo-200">
          <p className="text-xs font-bold text-indigo-700 uppercase mb-2">Top Campaign</p>
          <p className="font-bold text-ink mb-1">{mockData.topCampaign.name}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-subtext font-medium">
              <span className="font-bold text-ink">{mockData.topCampaign.total_questions}</span> questions
            </span>
            <span className="text-subtext">•</span>
            <span className="text-subtext font-medium">
              <span className="font-bold text-ink">{mockData.topCampaign.conversion_rate}%</span> conv.
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-black text-ink">{mockData.totalVisits}</p>
            <p className="text-xs text-subtext mt-0.5 font-medium">Total Visits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-ink">{mockData.totalQuestions}</p>
            <p className="text-xs text-subtext mt-0.5 font-medium">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-ink">€{mockData.totalRevenue}</p>
            <p className="text-xs text-subtext mt-0.5 font-medium">Revenue</p>
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-subtext font-medium">
              <span className="font-bold text-ink">{mockData.totalCampaigns}</span> active campaigns
            </span>
            <span className="inline-flex items-center gap-1 text-success font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              23% vs last month
            </span>
          </div>
        </div>

        {/* Hover Hint */}
        <div className="mt-3 pt-3 border-t border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-center text-indigo-700 font-bold">
            Click to view full dashboard →
          </p>
        </div>
      </div>

      {/* Mobile Version - Collapsible */}
      <div 
        onClick={handleClick}
        className={`lg:hidden bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-elev-2 border border-indigo-200 cursor-pointer transition-all duration-base ${
          isExpanded ? 'p-6' : 'p-4'
        }`}
      >
        {/* Collapsed View */}
        {!isExpanded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-ink text-sm">Marketing</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-yellow-900">
                    BETA
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-subtext font-medium">
                    <span className="font-bold text-ink">{mockData.totalQuestions}</span> questions
                  </span>
                  <span className="text-subtext">•</span>
                  <span className="text-subtext font-medium">
                    <span className="font-bold text-ink">€{mockData.totalRevenue}</span> revenue
                  </span>
                </div>
              </div>
            </div>
            <svg 
              className="w-5 h-5 text-primary flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-ink flex items-center gap-2">
                    Marketing
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                      BETA
                    </span>
                  </h3>
                  <p className="text-sm text-subtext font-medium">Track campaigns & grow</p>
                </div>
              </div>
              <svg 
                className="w-5 h-5 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>

            {/* Top Campaign Highlight */}
            <div className="mb-4 pb-4 border-b border-indigo-200">
              <p className="text-xs font-bold text-indigo-700 uppercase mb-2">Top Campaign</p>
              <p className="font-bold text-ink mb-1">{mockData.topCampaign.name}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-subtext font-medium">
                  <span className="font-bold text-ink">{mockData.topCampaign.total_questions}</span> questions
                </span>
                <span className="text-subtext">•</span>
                <span className="text-subtext font-medium">
                  <span className="font-bold text-ink">{mockData.topCampaign.conversion_rate}%</span> conv.
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xl font-black text-ink">{mockData.totalVisits}</p>
                <p className="text-xs text-subtext mt-0.5 font-medium">Visits</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-ink">{mockData.totalQuestions}</p>
                <p className="text-xs text-subtext mt-0.5 font-medium">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-ink">€{mockData.totalRevenue}</p>
                <p className="text-xs text-subtext mt-0.5 font-medium">Revenue</p>
              </div>
            </div>

            {/* Growth Indicator */}
            <div className="mt-4 pt-4 border-t border-indigo-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-subtext font-medium">
                  <span className="font-bold text-ink">{mockData.totalCampaigns}</span> campaigns
                </span>
                <span className="inline-flex items-center gap-1 text-success font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  23%
                </span>
              </div>
            </div>

            {/* Tap Hint */}
            <div className="mt-3 pt-3 border-t border-indigo-200">
              <p className="text-xs text-center text-indigo-700 font-bold">
                Tap to view full dashboard →
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}