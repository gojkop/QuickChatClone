// src/pages/ExpertDashboardPageV2.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import BentoGrid from '@/components/dashboardv2/layout/BentoGrid';
import BentoCard from '@/components/dashboardv2/layout/BentoCard';
import WelcomeHero from '@/components/dashboardv2/overview/WelcomeHero';
import FeaturedRevenueCard from '@/components/dashboardv2/metrics/FeaturedRevenueCard';
import CompactMetricCard from '@/components/dashboardv2/metrics/CompactMetricCard';
import InboxSnapshotCard from '@/components/dashboardv2/metrics/InboxSnapshotCard';
import QuickActionsWidget from '@/components/dashboardv2/widgets/QuickActionsWidget';
import SocialImpactWidget from '@/components/dashboardv2/widgets/SocialImpactWidget';
import SLACountdownWidget from '@/components/dashboardv2/widgets/SLACountdownWidget';
import RecentActivity from '@/components/dashboardv2/overview/RecentActivity';
import PerformanceSnapshot from '@/components/dashboardv2/overview/PerformanceSnapshot';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import MobileBottomNav from '@/components/dashboardv2/navigation/MobileBottomNav';
import OnboardingFlow from '@/components/dashboardv2/onboarding/OnboardingFlow';
import ProfileCompletionCard from '@/components/dashboardv2/onboarding/ProfileCompletionCard';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { usePendingCount } from '@/hooks/dashboardv2/usePendingCount';
import { useInboxCounts } from '@/hooks/dashboardv2/useInboxCounts';
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingPreview from '@/components/dashboardv2/marketing/MarketingPreview';
import { Clock, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/utils/dashboardv2/metricsCalculator';
import { shouldShowOnboardingCard } from '@/utils/profileStrength';
import apiClient from '@/api';

function ExpertDashboardPageV2() {
  const navigate = useNavigate();

  const {
    profile,
    expertProfile,
    isLoading: profileLoading,
    error: profileError,
    updateAvailability,
    refetch: refetchProfile,
  } = useProfile();

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Ratings state
  const [ratings, setRatings] = useState([]);

  // Fetch accurate pending count
  const { data: accuratePendingCount } = usePendingCount();

  // Fetch inbox counts for overview card
  const { data: inboxCounts } = useInboxCounts();

  // Fetch pre-calculated analytics from server (accurate metrics from ALL questions)
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useDashboardAnalytics();

  // Determine if we need to fetch more questions for fallback calculation
  // If analytics endpoint doesn't exist (404), fetch 100 questions for client-side calculation
  const shouldUseFallback = analyticsData === null;
  const questionsPerPage = shouldUseFallback ? 100 : 10;

  // Fetch questions: 10 for widgets, or 100 for fallback calculation
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuestionsQuery({ page: 1, perPage: questionsPerPage });

  const {
    campaigns,
    trafficSources,
    insights
  } = useMarketing();

  const marketingFeature = useFeature('marketing_module');
  const socialImpactFeature = useFeature('social_impact_dashboard');
  const marketingEnabled = marketingFeature.isEnabled;
  const socialImpactEnabled = socialImpactFeature.isEnabled;

  const questions = questionsData?.questions || [];

  // Use pre-calculated metrics if available, otherwise calculate client-side
  // When analytics endpoint is implemented, this will automatically switch to server-side
  const metrics = useMetrics(shouldUseFallback ? questions : [], analyticsData);

  // Calculate average rating from ratings array (same logic as old dashboard)
  const avgRating = useMemo(() => {
    const ratedAnswers = ratings.filter(r => r && r.rating && r.rating > 0);
    const avg = ratedAnswers.length > 0
      ? ratedAnswers.reduce((sum, r) => sum + r.rating, 0) / ratedAnswers.length
      : 0;
    return avg;
  }, [ratings]);

  const dashboardData = useMemo(() => ({
    pendingCount: accuratePendingCount ?? metrics.pendingCount ?? 0,
    urgentCount: metrics.urgentCount || 0,
    isAvailable: expertProfile?.accepting_questions ?? true,
    currentRevenue: metrics.thisMonthRevenue || 0,
    avgRating: avgRating || 0,
  }), [accuratePendingCount, metrics, expertProfile?.accepting_questions, avgRating]);

  const handleAvailabilityChange = React.useCallback((newStatus) => {
    updateAvailability(newStatus);
  }, [updateAvailability]);

  // Fetch ratings from /me/answers endpoint
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await apiClient.get('/me/answers');
        const ratingsData = response.data;
        if (Array.isArray(ratingsData)) {
          setRatings(ratingsData);
        }
      } catch (err) {
        console.error('Failed to fetch ratings:', err);
        setRatings([]);
      }
    };
    fetchRatings();
  }, []);

  // Check if expert needs onboarding or profile completion card
  // Re-check whenever expertProfile changes to update card in real-time
  useEffect(() => {
    if (!profileLoading && expertProfile) {
      const hasHandle = !!expertProfile.handle;
      const hasPrice = !!expertProfile.tier1_price_cents;
      const hasSLA = !!expertProfile.tier1_sla_hours;

      // Show onboarding modal if any essential field is missing
      if (!hasHandle || !hasPrice || !hasSLA) {
        setShowOnboarding(true);
        setShowProfileCard(false);
      } else {
        // Show profile completion card if profile is incomplete
        const shouldShow = shouldShowOnboardingCard(expertProfile);
        setShowProfileCard(shouldShow);
        setShowOnboarding(false);
      }

      if (!onboardingChecked) {
        setOnboardingChecked(true);
      }
    }
  }, [profileLoading, expertProfile, onboardingChecked]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refetch profile to get updated data
    if (refetchProfile) {
      await refetchProfile();
    }
    // Show profile completion card after onboarding
    setShowProfileCard(true);
  };

  const handleProfileCardDismiss = (permanent) => {
    setShowProfileCard(false);

    if (permanent) {
      // TODO: Call API to permanently dismiss profile card
      // await apiClient.post('/expert/profile/dismiss-onboarding', { permanent: true });
      console.log('Profile card permanently dismissed');
    } else {
      // Temporary dismiss - will show again on next visit
      console.log('Profile card temporarily dismissed');
    }
  };

  const handleCompleteSetup = () => {
    // Re-open onboarding modal
    setShowOnboarding(true);
    setShowProfileCard(false);
  };

  const isInitialLoad = profileLoading || analyticsLoading || (questionsLoading && questions.length === 0);
  // Don't treat analytics 404 as error (endpoint not implemented yet)
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

        {/* Profile Completion Card - shows when profile is incomplete */}
        {showProfileCard && expertProfile && (
          <div className="mb-6">
            <ProfileCompletionCard
              expertProfile={expertProfile}
              onDismiss={handleProfileCardDismiss}
              onCompleteSetup={handleCompleteSetup}
            />
          </div>
        )}

        {/* BENTO GRID with stagger animation */}
        <BentoGrid className="mb-4 stagger-children">
          {/* Row 1: Featured Revenue (2x2) + 4 Small Metrics (1x1) */}
          
          <BentoCard size="large" hoverable onClick={() => navigate('/dashboard/analytics')} className="shadow-premium-sm hover:shadow-premium-lg">
            <FeaturedRevenueCard metrics={metrics} />
          </BentoCard>

          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/analytics')} className="shadow-premium-sm hover:shadow-premium-md">
            <CompactMetricCard
              label="Avg Response"
              value={metrics.avgResponseTime > 0 ? formatDuration(metrics.avgResponseTime) : '—'}
              icon={Clock}
              color="indigo"
              trend={metrics.avgResponseTime > 0 ? -12.5 : null}
              subtitle={metrics.avgResponseTime > 0 ? `${metrics.answeredCount} answered` : 'Track how fast you answer'}
              isZeroState={metrics.avgResponseTime === 0}
            />
          </BentoCard>

          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/analytics')} className="shadow-premium-sm hover:shadow-premium-md">
            <CompactMetricCard
              label="Rating"
              value={avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : '—'}
              icon={Star}
              color="purple"
              trend={avgRating > 0 ? 5.2 : null}
              subtitle={avgRating > 0 ? 'Average rating' : 'Rating appears after reviews'}
              isZeroState={avgRating === 0}
            />
          </BentoCard>

          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/inbox')} className="shadow-premium-sm hover:shadow-premium-md">
            <InboxSnapshotCard counts={inboxCounts} />
          </BentoCard>

          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/analytics')} className="shadow-premium-sm hover:shadow-premium-md">
            <CompactMetricCard
              label="Avg per Question"
              value={metrics.avgRevenuePerQuestion > 0 ? `$${metrics.avgRevenuePerQuestion.toFixed(0)}` : '—'}
              icon={TrendingUp}
              color="green"
              subtitle={metrics.avgRevenuePerQuestion > 0 ? 'This month average' : 'Tracks pricing effectiveness'}
              isZeroState={metrics.avgRevenuePerQuestion === 0}
            />
          </BentoCard>

          {/* Row 2: Quick Actions (1x2) + Recent Activity (2x2) + Conditional (1x2) */}
          
          <BentoCard size="tall" className="shadow-premium-sm">
            <QuickActionsWidget
              pendingCount={dashboardData.pendingCount}
              expertHandle={expertProfile?.handle}
            />
          </BentoCard>

          <BentoCard size="large" className="shadow-premium-sm">
            <RecentActivity questions={questions} />
          </BentoCard>

          {/* Conditionally show Social Impact OR SLA Countdown */}
          {socialImpactEnabled ? (
            <BentoCard size="tall" className="shadow-premium-sm hover:shadow-premium-md hover-scale transition-all">
              <SocialImpactWidget
                totalDonated={expertProfile?.total_donated || 0}
                charityPercentage={expertProfile?.charity_percentage || 0}
                selectedCharity={expertProfile?.selected_charity}
              />
            </BentoCard>
          ) : (
            <BentoCard size="tall" className="shadow-premium-sm">
              <SLACountdownWidget 
                questions={questions} 
                slaHours={expertProfile?.sla_hours || 24}
              />
            </BentoCard>
          )}

          {/* Row 3: Performance (2x1) + Marketing (2x1) */}
          
          <BentoCard size="wide" className="shadow-premium-sm">
            <PerformanceSnapshot />
          </BentoCard>

          {marketingEnabled && (
            <BentoCard size="wide" hoverable onClick={() => navigate('/dashboard/marketing')} className="shadow-premium-sm hover:shadow-premium-md">
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

      {/* Onboarding Flow - shows when expert profile is incomplete */}
      {showOnboarding && (
        <OnboardingFlow
          userName={profile?.name || profile?.email?.split('@')[0]}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}

export default ExpertDashboardPageV2;