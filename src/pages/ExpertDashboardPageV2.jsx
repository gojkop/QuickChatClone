import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery'; // Your existing hook
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import WelcomeHero from '@/components/dashboardv2/overview/WelcomeHero';
import MetricsGrid from '@/components/dashboardv2/metrics/MetricsGrid';
import ActionRequired from '@/components/dashboardv2/overview/ActionRequired';
import RecentActivity from '@/components/dashboardv2/overview/RecentActivity';
import PerformanceSnapshot from '@/components/dashboardv2/overview/PerformanceSnapshot';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';

/**
 * OPTIMIZED Expert Dashboard V2
 * 
 * Key Performance Optimizations:
 * 1. Uses existing useQuestionsQuery hook (already cached with React Query)
 * 2. Memoized metrics calculation
 * 3. Progressive loading with skeletons
 * 4. Optimized re-renders with useMemo
 */

function ExpertDashboardPageV2() {
  const navigate = useNavigate();
  
  // Get profile from context (already cached/optimized)
  const { 
    profile, 
    expertProfile, 
    isLoading: profileLoading, 
    error: profileError,
    updateAvailability,
  } = useProfile();

  // Use existing questions hook - it already uses React Query
  // Now supports pagination - loading first 10 questions only
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuestionsQuery({ page: 1, perPage: 10 });

  const questions = questionsData?.questions || [];
  const pagination = questionsData?.pagination;

  // Memoized metrics calculation - only recalculates when questions change
  const metrics = useMetrics(questions);

  // Memoize derived data to prevent unnecessary recalculations
  const dashboardData = useMemo(() => ({
    pendingCount: metrics.pendingCount || 0,
    urgentCount: metrics.urgentCount || 0,
    isAvailable: expertProfile?.accepting_questions ?? true,
  }), [metrics.pendingCount, metrics.urgentCount, expertProfile?.accepting_questions]);

  // Optimized availability change handler
  const handleAvailabilityChange = React.useCallback((newStatus) => {
    updateAvailability(newStatus);
  }, [updateAvailability]);

  // Combined loading state - show progressive UI
  const isInitialLoad = profileLoading || (questionsLoading && questions.length === 0);
  const hasError = profileError || questionsError;

  // PROGRESSIVE LOADING: Show layout immediately
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

  // Error state - but still show layout for navigation
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
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {questionsError?.message || profileError?.message || 'An error occurred while loading your dashboard'}
          </p>
          <button
            onClick={() => {
              if (questionsError) refetchQuestions();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // SUCCESS STATE - All data loaded
  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Dashboard' }]}
      pendingCount={dashboardData.pendingCount}
      isAvailable={dashboardData.isAvailable}
      onAvailabilityChange={handleAvailabilityChange}
      searchData={{ questions }}
    >
      {/* Welcome Hero */}
      <WelcomeHero />

      {/* Metrics Grid */}
      {questionsLoading && questions.length > 0 ? (
        <MetricsGridSkeleton />
      ) : (
        <MetricsGrid metrics={metrics} />
      )}

      {/* Action Required - Only shows if there are urgent items */}
      {dashboardData.urgentCount > 0 && (
        <ActionRequired 
          urgentCount={dashboardData.urgentCount}
          pendingOffersCount={0}
        />
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        {questionsLoading && questions.length === 0 ? (
          <ActivitySkeleton />
        ) : (
          <RecentActivity questions={questions} />
        )}

        {/* Performance Snapshot */}
        <PerformanceSnapshot />
      </div>
    </DashboardLayout>
  );
}

// Skeleton Components
const MetricsGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 skeleton rounded"></div>
          <div className="w-10 h-10 skeleton rounded-lg"></div>
        </div>
        <div className="h-8 w-24 skeleton rounded mb-2"></div>
        <div className="h-4 w-16 skeleton rounded"></div>
      </div>
    ))}
  </div>
);

const ActivitySkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6">
    <div className="h-6 w-40 skeleton rounded mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 skeleton rounded-lg"></div>
      ))}
    </div>
  </div>
);

export default ExpertDashboardPageV2;