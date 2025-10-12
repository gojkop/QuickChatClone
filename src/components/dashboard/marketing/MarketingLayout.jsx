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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-canvas">
    {/* 📏 Container matches ExpertDashboardPage */}
         <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
      {/* Header */}
          <div className="mb-6">
             <div className="flex items-center justify-between mb-2">
         <div>
            <h1 className="text-3xl font-black text-ink tracking-tight">Marketing</h1>
            <p className="text-subtext mt-1">Track campaigns and grow revenue</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
            <span className="text-sm font-semibold text-warning">BETA</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'campaigns', label: 'Campaigns' },
          { id: 'traffic', label: 'Traffic' },
          { id: 'share-kit', label: 'Share Kit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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
  );
}