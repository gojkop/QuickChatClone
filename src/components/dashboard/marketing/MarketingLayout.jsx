import React, { useState } from 'react';
import MarketingOverview from './MarketingOverview';
import CampaignList from './CampaignList';
import ShareKitTemplates from './ShareKitTemplates';

export default function MarketingLayout({ 
  campaigns, 
  trafficSources, 
  insights, 
  isLoading,
  createCampaign,
  expertProfile,
  user,
  stats,
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-subtext font-medium">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-ink tracking-tight mb-1">Marketing</h1>
              <p className="text-subtext font-medium">Track campaigns and grow your consulting business</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg shadow-elev-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm font-bold text-indigo-700">BETA</span>
              </div>
              {activeTab === 'campaigns' && (
                <button
                  onClick={() => {
                    const modal = document.querySelector('[data-campaign-modal]');
                    if (modal) modal.click();
                  }}
                  className="btn btn-primary px-4 py-2.5 text-sm gap-2 shadow-elev-2 hover:shadow-elev-3 sm:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'campaigns', label: 'Campaigns', icon: '🚀' },
            { id: 'share-kit', label: 'Share Kit', icon: '✨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all duration-base ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-subtext hover:text-ink hover:border-gray-300'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up">
          {activeTab === 'overview' && (
            <MarketingOverview 
              campaigns={campaigns}
              insights={insights}
              trafficSources={trafficSources}
              onNavigate={handleNavigate}
            />
          )}
          
          {activeTab === 'campaigns' && (
            <CampaignList 
              campaigns={campaigns}
              onCreate={createCampaign}
            />
          )}
          
          {activeTab === 'share-kit' && (
            <ShareKitTemplates 
              campaigns={campaigns}
              expertProfile={expertProfile}
              user={user}
              stats={stats}
            />
          )}
        </div>
      </div>
    </div>
  );
}