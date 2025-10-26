import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import AnalyticsLayout from '@/components/dashboardv2/analytics/AnalyticsLayout';
import DateRangeSelector from '@/components/dashboardv2/analytics/DateRangeSelector';
import StatCard from '@/components/dashboardv2/analytics/StatCard';
import RevenueChart from '@/components/dashboardv2/analytics/RevenueChart';
import ResponseTimeChart from '@/components/dashboardv2/analytics/ResponseTimeChart';
import RatingDistribution from '@/components/dashboardv2/analytics/RatingDistribution';
import InsightsPanel from '@/components/dashboardv2/analytics/InsightsPanel';
import ExportButton from '@/components/dashboardv2/analytics/ExportButton';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { useAnalytics } from '@/hooks/dashboardv2/useAnalytics';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';
import { DollarSign, Clock, Star, MessageSquare } from 'lucide-react';
import { formatDuration } from '@/utils/dashboardv2/metricsCalculator';

function ExpertAnalyticsPage() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const metrics = useMetrics(questions);
  const { analytics, dateRange, setPresetRange, isLoading: analyticsLoading, error: analyticsError } = useAnalytics(questions);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, questionsRes] = await Promise.all([
          apiClient.get('/me/profile'),
          apiClient.get('/me/questions?page=1&per_page=10'), // Only need recent questions for display
        ]);

        setProfile(profileRes.data.expert_profile || {});
        // Handle new paginated response format
        setQuestions(questionsRes.data?.questions || questionsRes.data || []);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAvailabilityChange = (newStatus) => {
    setProfile(prev => ({ ...prev, accepting_questions: newStatus }));
  };

  if (isLoading || analyticsLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Analytics' }
        ]}
      >
        <LoadingState text={analyticsLoading ? "Loading analytics..." : "Loading..."} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Analytics' }
      ]}
      pendingCount={metrics.pendingCount}
      isAvailable={profile?.accepting_questions ?? true}
      onAvailabilityChange={handleAvailabilityChange}
      searchData={{ questions }}
    >
      <AnalyticsLayout
        header={
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                Analytics 📊
              </h1>
              <p className="text-gray-600">
                Track your performance and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangeSelector
                dateRange={dateRange}
                onPresetChange={setPresetRange}
              />
              <ExportButton analytics={analytics} questions={questions} />
            </div>
          </div>
        }
      >
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            label="Questions Answered"
            value={analytics.answeredCount}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            label="Avg Response Time"
            value={formatDuration(analytics.avgResponseTime)}
            icon={Clock}
            color="indigo"
          />
          <StatCard
            label="Avg Rating"
            value={analytics.avgRating > 0 ? `${analytics.avgRating.toFixed(1)} ⭐` : 'N/A'}
            icon={Star}
            color="purple"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={analytics.revenueOverTime} />
          <ResponseTimeChart data={analytics.responseTimeDistribution} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RatingDistribution data={analytics.ratingDistribution} />
          
          {/* Top Questions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Questions</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.topQuestions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-bold text-gray-400 flex-shrink-0">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate mb-1">
                      {question.question_text || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {question.user_name || 'Anonymous'}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0">
                    ${(question.price_cents / 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <InsightsPanel insights={analytics.insights} />
      </AnalyticsLayout>
    </DashboardLayout>
  );
}

export default ExpertAnalyticsPage;