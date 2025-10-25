import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext'; // ← NEW
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery'; // ← NEW
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import WelcomeHero from '@/components/dashboardv2/overview/WelcomeHero';
import MetricsGrid from '@/components/dashboardv2/metrics/MetricsGrid';
import ActionRequired from '@/components/dashboardv2/overview/ActionRequired';
import RecentActivity from '@/components/dashboardv2/overview/RecentActivity';
import PerformanceSnapshot from '@/components/dashboardv2/overview/PerformanceSnapshot';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';

function ExpertDashboardPageV2() {
  const navigate = useNavigate();
  
  // ← NEW: Use ProfileContext instead of fetching
  const { profile, expertProfile, isLoading: profileLoading, error: profileError } = useProfile();
  
  // ← NEW: Use React Query for questions
  const { data: questions = [], isLoading: questionsLoading, error: questionsError } = useQuestionsQuery();

  const metrics = useMetrics(questions);

  const handleAvailabilityChange = (newStatus) => {
    // ProfileContext will handle the update
    // This is now just for optimistic UI updates if needed
  };

  // ← MODIFIED: Combined loading state
  const isLoading = profileLoading || questionsLoading;
  const error = profileError || questionsError;

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="text-center py-12">
          <p className="text-red-600">Could not load dashboard data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Dashboard' }]}
      pendingCount={metrics.pendingCount}
      isAvailable={expertProfile?.accepting_questions ?? true}
      onAvailabilityChange={handleAvailabilityChange}
      searchData={{ questions }}
    >
      {/* Welcome Hero */}
      <WelcomeHero />

      {/* Metrics */}
      <MetricsGrid metrics={metrics} />

      {/* Action Required */}
      <ActionRequired 
        urgentCount={metrics.urgentCount}
        pendingOffersCount={0}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity questions={questions} />

        {/* Performance Snapshot */}
        <PerformanceSnapshot />
      </div>
    </DashboardLayout>
  );
}

export default ExpertDashboardPageV2;