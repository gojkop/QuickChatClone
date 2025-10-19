import React from 'react';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingLayout from '@/components/dashboard/marketing/MarketingLayout';
import MarketingDebugger from '@/components/dashboard/marketing/MarketingDebugger';

export default function ExpertMarketingPage() {
  const {
    campaigns,
    trafficSources,
    insights,
    expertProfile,
    user,
    stats,
    isLoading,
    error,
    createCampaign,
  } = useMarketing();

  // Show error state if needed
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl shadow-elev-2 border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-ink mb-2">Failed to Load Data</h2>
          <p className="text-subtext mb-4 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary px-6 py-2.5"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <MarketingLayout
      campaigns={campaigns}
      trafficSources={trafficSources}
      insights={insights}
      expertProfile={expertProfile}
      user={user}
      stats={stats}
      isLoading={isLoading}
      createCampaign={createCampaign}
    />
    <MarketingDebugger /> {/* Add this */}
    </>
  );
}