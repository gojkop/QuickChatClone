// src/pages/ExpertDashboardPageV2.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import BentoGrid from '@/components/dashboardv2/layout/BentoGrid';
import BentoCard from '@/components/dashboardv2/layout/BentoCard';
import WelcomeHero from '@/components/dashboardv2/overview/WelcomeHero';
import FeaturedRevenueCard from '@/components/dashboardv2/metrics/FeaturedRevenueCard';
import CompactMetricCard from '@/components/dashboardv2/metrics/CompactMetricCard';
import QuickActionsWidget from '@/components/dashboardv2/widgets/QuickActionsWidget';
import SLACountdownWidget from '@/components/dashboardv2/widgets/SLACountdownWidget';
import RecentActivity from '@/components/dashboardv2/overview/RecentActivity';
import PerformanceSnapshot from '@/components/dashboardv2/overview/PerformanceSnapshot';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import MobileBottomNav from '@/components/dashboardv2/navigation/MobileBottomNav';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingPreview from '@/components/dashboardv2/marketing/MarketingPreview';
import { Clock, Star, MessageSquare } from 'lucide-react';
import { formatDuration } from '@/utils/dashboardv2/metricsCalculator';

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
  const metrics = useMetrics(questions);

  // Log metrics for debugging
  React.useEffect(() => {
    console.log('📊 Dashboard Metrics:', {
      thisMonthRevenue: metrics.thisMonthRevenue,
      avgResponseTime: metrics.avgResponseTime,
      avgRating: metrics.avgRating,
      pendingCount: metrics.pendingCount,
      answeredCount: metrics.answeredCount,
      revenueChange: metrics.revenueChange,
    });
  }, [metrics]);

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
        <WelcomeHero />

        <BentoGrid className="mb-4">
          {/* Featured Revenue Card - Clickable */}
          <BentoCard size="large" hoverable onClick={() => navigate('/dashboard/analytics')}>
            <FeaturedRevenueCard metrics={metrics} />
          </BentoCard>

          {/* Small Metric: Response Time - Clickable */}
          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/analytics')}>
            <CompactMetricCard
              label="Avg Response"
              value={formatDuration(metrics.avgResponseTime)}
              icon={Clock}
              color="indigo"
              trend={-12.5}
              subtitle={metrics.avgResponseTime > 0 ? `${metrics.answeredCount} answered` : 'No data yet'}
            />
          </BentoCard>

          {/* Small Metric: Rating - Clickable */}
          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/analytics')}>
            <CompactMetricCard
              label="Rating"
              value={metrics.avgRating > 0 ? `${metrics.avgRating.toFixed(1)}⭐` : 'No ratings yet'}
              icon={Star}
              color="purple"
              trend={metrics.avgRating > 0 ? 5.2 : null}
              subtitle={metrics.avgRating > 0 ? 'Average rating' : 'Answer questions to get rated'}
            />
          </BentoCard>

          {/* Small Metric: Pending - Clickable */}
          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/inbox')}>
            <CompactMetricCard
              label="Pending"
              value={metrics.pendingCount}
              icon={MessageSquare}
              color="orange"
              subtitle={metrics.pendingCount > 0 ? 'Need your answer' : 'All caught up!'}
            />
          </BentoCard>

          {/* Small Metric: Answered - Clickable */}
          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/analytics')}>
            <CompactMetricCard
              label="Answered"
              value={metrics.answeredCount}
              icon={MessageSquare}
              color="green"
              subtitle={`${metrics.thisMonthAnsweredCount} this month`}
            />
          </BentoCard>

          {/* Quick Actions Widget */}
          <BentoCard size="tall">
            <QuickActionsWidget pendingCount={dashboardData.pendingCount} />
          </BentoCard>

          {/* Recent Activity */}
          <BentoCard size="large">
            <RecentActivity questions={questions} />
          </BentoCard>

          {/* SLA Countdown Widget */}
          <BentoCard size="tall">
            <SLACountdownWidget 
              questions={questions} 
              slaHours={expertProfile?.sla_hours || 24}
            />
          </BentoCard>

          {/* Performance Snapshot */}
          <BentoCard size="wide">
            <PerformanceSnapshot />
          </BentoCard>

          {/* Marketing Preview */}
          {marketingEnabled && (
            <BentoCard size="wide" hoverable onClick={() => navigate('/dashboard/marketing')}>
              <MarketingPreview 
                isEnabled={marketingEnabled}
                campaigns={campaigns}
                trafficSources={trafficSources}
                insights={insights}
                onNavigate={() => navigate('/dashboard/marketing')}
              />
            </BentoCard>
          )}
        </BentoGrid>

        <div className="h-32 lg:h-0" />
      </DashboardLayout>

      <MobileBottomNav 
        pendingCount={dashboardData.pendingCount}
        currentRevenue={dashboardData.currentRevenue}
        avgRating={dashboardData.avgRating}
      />
    </>
  );
}

export default ExpertDashboardPageV2;