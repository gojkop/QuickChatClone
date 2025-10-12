import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingLayout from '@/components/dashboard/marketing/MarketingLayout';

export default function ExpertMarketingPage() {
  const navigate = useNavigate();
  const { isEnabled: marketingEnabled, loading: featureFlagLoading } = useFeature('marketing_module');
  const marketingData = useMarketing();

  // Show loading state while checking feature flag
  if (featureFlagLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if feature is disabled
  if (!marketingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Marketing Module</h2>
          <p className="text-gray-600 mb-4">
            The Marketing Module is currently in beta. Check back soon!
          </p>
          <button
            onClick={() => navigate('/expert')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <MarketingLayout {...marketingData} />;
}