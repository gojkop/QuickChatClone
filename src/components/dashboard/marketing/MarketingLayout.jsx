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
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'share-kit',
      label: 'Share Kit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )
    },
  ];

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
    <div className="min-h-screen bg-canvas pb-20 sm:pb-8">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mb-1">Marketing</h1>
              <p className="text-sm sm:text-base text-subtext font-medium">Track campaigns and grow your consulting business</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg shadow-elev-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs sm:text-sm font-bold text-indigo-700">BETA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all duration-base ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-subtext hover:text-ink hover:border-gray-300'
              }`}
            >
              {tab.icon}
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

      {/* Mobile Bottom Navigation */}
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-base relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-subtext'
              }`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              {tab.icon}
              <span className="text-xs font-bold">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button (Mobile - Campaigns Tab Only) */}
      {activeTab === 'campaigns' && (
        <button
          onClick={() => setShowCampaignModal(true)}
          className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-elev-4 flex items-center justify-center z-30 active:scale-95 transition-transform"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
}