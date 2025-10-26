import React from 'react';
import { useMarketing } from '@/hooks/useMarketing';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import MarketingLayout from '@/components/dashboardv2/marketing/MarketingLayout';
import MarketingDebugger from '@/components/dashboardv2/marketing/MarketingDebugger';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';

export default function MarketingDashboardPage() {
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
console.log('🔍 MarketingDashboardPage - Data from useMarketing:', {
  campaigns: { type: typeof campaigns, isArray: Array.isArray(campaigns), value: campaigns },
  trafficSources: { type: typeof trafficSources, isArray: Array.isArray(trafficSources), value: trafficSources },
  isLoading,
  error
});

  const { profile, expertProfile: profileExpert } = useProfile();
  const { data: questions = [] } = useQuestionsQuery();

  // Calculate pending count for top bar
  const pendingCount = questions.filter(q => q.status === 'pending').length;
  const isAvailable = profileExpert?.accepting_questions ?? true;

  // Error state
  if (error && !isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Marketing' }
        ]}
        pendingCount={pendingCount}
        isAvailable={isAvailable}
        searchData={{ questions }}
      >
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load marketing data
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Marketing' }
      ]}
      pendingCount={pendingCount}
      isAvailable={isAvailable}
      searchData={{ questions }}
    >
      {isLoading ? (
        <LoadingState text="Loading marketing data..." />
      ) : (
        <>
          {/* BETA Badge - Optional */}
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-bold text-yellow-800">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              BETA
            </span>
          </div>
          
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
          
          {import.meta.env.MODE === 'development' && <MarketingDebugger />}
        </>
      )}
    </DashboardLayout>
  );
}