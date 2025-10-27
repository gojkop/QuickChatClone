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
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingPreview from '@/components/dashboardv2/marketing/MarketingPreview';
import { Clock, Star, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/utils/dashboardv2/metricsCalculator';
import { shouldShowOnboardingCard } from '@/utils/profileStrength';

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
  const socialImpactFeature = useFeature('social_impact_dashboard');
  const marketingEnabled = marketingFeature.isEnabled;
  const socialImpactEnabled = socialImpactFeature.isEnabled;

  const questions = questionsData?.questions || [];
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
              value={metrics.avgRating > 0 ? `${metrics.avgRating.toFixed(1)}⭐` : '—'}
              icon={Star}
              color="purple"
              trend={metrics.avgRating > 0 ? 5.2 : null}
              subtitle={metrics.avgRating > 0 ? 'Average rating' : 'Rating appears after reviews'}
              isZeroState={metrics.avgRating === 0}
            />
          </BentoCard>

          <BentoCard size="small" hoverable onClick={() => navigate('/dashboard/inbox')} className="shadow-premium-sm hover:shadow-premium-md">
            <CompactMetricCard
              label="Urgent"
              value={metrics.urgentCount}
              icon={AlertCircle}
              color={metrics.urgentCount === 0 ? 'green' : metrics.urgentCount <= 2 ? 'orange' : 'orange'}
              subtitle={metrics.urgentCount === 0 ? 'All caught up! 🎉' : metrics.urgentCount === 1 ? 'Needs attention now' : 'Need attention now'}
              isZeroState={metrics.urgentCount === 0 && metrics.pendingCount === 0}
            />
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
            <QuickActionsWidget pendingCount={dashboardData.pendingCount} />
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
                thisMonthRevenue={metrics.thisMonthRevenue}
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