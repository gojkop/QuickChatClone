// client/src/pages/ExpertMarketingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingLayout from '@/components/dashboard/marketing/MarketingLayout';

export default function ExpertMarketingPage() {
  const navigate = useNavigate();
  const { isEnabled: marketingEnabled, loading: featureFlagLoading } = useFeature('marketing_module');
  
  const {
    campaigns,
    trafficSources,
    shareTemplates,
    insights,
    isLoading,
    createCampaign
  } = useMarketing();

  // Feature flag check
  if (featureFlagLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-subtext font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if feature is disabled
  if (!marketingEnabled) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-ink mb-2">Marketing Module Not Available</h2>
          <p className="text-subtext mb-6 font-medium">
            This feature is currently in beta and not enabled for your account.
          </p>
          <button
            onClick={() => navigate('/expert')}
            className="btn btn-primary px-6 py-3"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render marketing layout
  return (
    <MarketingLayout
      campaigns={campaigns}
      trafficSources={trafficSources}
      shareTemplates={shareTemplates}
      insights={insights}
      isLoading={isLoading}
      createCampaign={createCampaign}
    />
  );
}