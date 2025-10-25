import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api';
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
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const metrics = useMetrics(questions);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, questionsRes] = await Promise.all([
          apiClient.get('/me/profile'),
          apiClient.get('/me/questions'),
        ]);

        setProfile(profileRes.data.expert_profile || {});
        setQuestions(questionsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Could not load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAvailabilityChange = (newStatus) => {
    setProfile(prev => ({ ...prev, accepting_questions: newStatus }));
  };

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
          <p className="text-red-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Dashboard' }]}
      pendingCount={metrics.pendingCount}
      isAvailable={profile?.accepting_questions ?? true}
      onAvailabilityChange={handleAvailabilityChange}
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