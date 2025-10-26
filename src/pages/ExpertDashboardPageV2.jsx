// src/pages/ExpertDashboardPageV2.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import WelcomeHero from '@/components/dashboardv2/overview/WelcomeHero';
import MetricsGrid from '@/components/dashboardv2/metrics/MetricsGrid';
import ActionRequired from '@/components/dashboardv2/overview/ActionRequired';
import RecentActivity from '@/components/dashboardv2/overview/RecentActivity';
import PerformanceSnapshot from '@/components/dashboardv2/overview/PerformanceSnapshot';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import MobileBottomNav from '@/components/dashboardv2/navigation/MobileBottomNav';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingPreview from '@/components/dashboardv2/marketing/MarketingPreview';

function ExpertDashboardPageV2() {
  const navigate = useNavigate();
  
  const { 
    profile, 
    expertProfile, 
    isLoading: profileLoading, 
    error: profileError,
    updateAvailability,
  } = useProfile();

  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuestionsQuery({ page: 1, perPage: 10 });

  const { 
    campaigns, 
    trafficSources, 
    insights 
  } = useMarketing();

  const marketingFeature = useFeature('marketing_module');
  const marketingEnabled = marketingFeature.isEnabled;

  const questions = questionsData?.questions || [];
  const pagination = questionsData?.pagination;

  const metrics = useMetrics(questions);

  const dashboardData = useMemo(() => ({
    pendingCount: metrics.pendingCount || 0,
    urgentCount: metrics.urgentCount || 0,
    isAvailable: expertProfile?.accepting_questions ?? true,
    currentRevenue: metrics.thisMonthRevenue || 0,
    avgRating: metrics.avgRating || 0,
  }), [metrics, expertProfile?.accepting_questions]);

  const handleAvailabilityChange = React.useCallback((newStatus) => {
    updateAvailability(newStatus);
  }, [updateAvailability]);

  const isInitialLoad = profileLoading || (questionsLoading && questions.length === 0);
  const hasError = profileError || questionsError;

  if (isInitialLoad) {
    return (
      <DashboardLayout 
        breadcrumbs={[{ label: 'Dashboard' }]}
        pendingCount={0}
        isAvailable={true}
        searchData={{ questions: [] }}
      >
        <LoadingState text="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  if (hasError) {
    return (
      <DashboardLayout 
        breadcrumbs={[{ label: 'Dashboard' }]}
        pendingCount={dashboardData.pendingCount}
        isAvailable={dashboardData.isAvailable}
        onAvailabilityChange={handleAvailabilityChange}
        searchData={{ questions }}
      >
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Could not load dashboard data
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
            {questionsError?.message || profileError?.message || 'An error occurred while loading your dashboard'}
          </p>
          <button
            onClick={() => {
              if (questionsError) refetchQuestions();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout
        breadcrumbs={[{ label: 'Dashboard' }]}
        pendingCount={dashboardData.pendingCount}
        isAvailable={dashboardData.isAvailable}
        onAvailabilityChange={handleAvailabilityChange}
        searchData={{ questions }}
      >
        {/* Welcome Hero - Compact */}
        <WelcomeHero />

        {/* Metrics Grid - Compact with fixed sparklines */}
        <MetricsGrid metrics={metrics} />

        {/* Action Required - Only shows if urgent */}
        {dashboardData.urgentCount > 0 && (
          <div className="mb-4">
            <ActionRequired 
              urgentCount={dashboardData.urgentCount}
              pendingOffersCount={0}
            />
          </div>
        )}

        {/* Two Column Layout - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <RecentActivity questions={questions} />
          <PerformanceSnapshot />
        </div>

        {/* Marketing Preview - Compact */}
        {marketingEnabled && (
          <div className="mb-4">
            <MarketingPreview 
              isEnabled={marketingEnabled}
              campaigns={campaigns}
              trafficSources={trafficSources}
              insights={insights}
              onNavigate={() => navigate('/dashboard/marketing')}
            />
          </div>
        )}

        {/* Bottom spacing for mobile nav */}
        <div className="h-32 lg:h-0" />
      </DashboardLayout>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        pendingCount={dashboardData.pendingCount}
        currentRevenue={dashboardData.currentRevenue}
        avgRating={dashboardData.avgRating}
      />
    </>
  );
}

export default ExpertDashboardPageV2;