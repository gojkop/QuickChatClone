import React, { useState } from 'react';
import MarketingOverview from './MarketingOverview';
import CampaignList from './CampaignList';
import TrafficSources from './TrafficSources';
import ShareKitTemplates from './ShareKitTemplates';

export default function MarketingLayout({ 
  campaigns, 
  trafficSources, 
  shareTemplates, 
  insights, 
  isLoading,
  createCampaign 
}) {
  const [activeTab, setActiveTab] = useState('overview');

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
      {/* Main Container - Matches Expert Dashboard Width */}
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-black text-ink tracking-tight">Marketing</h1>
              <p className="text-subtext mt-1 font-medium">Track campaigns and grow your consulting business</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg shadow-elev-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-bold text-indigo-700">BETA</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'campaigns', label: 'Campaigns', icon: '🚀' },
            { id: 'traffic', label: 'Traffic', icon: '📈' },
            { id: 'share-kit', label: 'Share Kit', icon: '✨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
            />
          )}
          
          {activeTab === 'campaigns' && (
            <CampaignList 
              campaigns={campaigns}
              onCreate={createCampaign}
            />
          )}
          
          {activeTab === 'traffic' && (
            <TrafficSources trafficSources={trafficSources} />
          )}
          
          {activeTab === 'share-kit' && (
            <ShareKitTemplates templates={shareTemplates} />
          )}
        </div>
      </div>
    </div>
  );
}