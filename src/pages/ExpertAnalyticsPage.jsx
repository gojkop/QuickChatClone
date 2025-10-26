// src/pages/ExpertAnalyticsPage.jsx
import React, { useState, useMemo } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import AnalyticsLayout from '@/components/dashboardv2/analytics/AnalyticsLayout';
import StatCard from '@/components/dashboardv2/analytics/StatCard';
import RevenueChart from '@/components/dashboardv2/analytics/RevenueChart';
import ResponseTimeChart from '@/components/dashboardv2/analytics/ResponseTimeChart';
import RatingDistribution from '@/components/dashboardv2/analytics/RatingDistribution';
import InsightsPanel from '@/components/dashboardv2/analytics/InsightsPanel';
import DateRangeSelector from '@/components/dashboardv2/analytics/DateRangeSelector';
import ExportButton from '@/components/dashboardv2/analytics/ExportButton';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { DollarSign, Clock, Star, MessageSquare } from 'lucide-react';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';

function ExpertAnalyticsPage() {
  const { expertProfile, isLoading: profileLoading } = useProfile();
  const { data: questionsData, isLoading: questionsLoading } = useQuestionsQuery({ 
    page: 1, 
    perPage: 100 // Get more questions for analytics
  });

  const [dateRange, setDateRange] = useState('30d'); // 30d, 90d, 1y, all

  const questions = questionsData?.questions || [];
  const metrics = useMetrics(questions);

  // Safe format currency function
  const formatCurrency = (cents) => {
    if (cents === null || cents === undefined || isNaN(cents)) return '$0';
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Safe format number function
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return num.toLocaleString();
  };

  // Safe format duration function
  const formatDuration = (hours) => {
    if (hours === null || hours === undefined || isNaN(hours) || hours === 0) {
      return '0h';
    }
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  // Calculate analytics metrics with safe handling
  const analyticsMetrics = useMemo(() => {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    
    // Total revenue (all time)
    const totalRevenue = safeQuestions
      .filter(q => q.answered_at && q.price_cents)
      .reduce((sum, q) => sum + (q.price_cents || 0), 0);

    // This month revenue
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthRevenue = safeQuestions
      .filter(q => {
        if (!q.answered_at) return false;
        const answeredDate = new Date(q.answered_at * 1000);
        return answeredDate.getMonth() === currentMonth && 
               answeredDate.getFullYear() === currentYear;
      })
      .reduce((sum, q) => sum + (q.price_cents || 0), 0);

    // Average response time
    const responseTimes = safeQuestions
      .filter(q => q.answered_at && q.created_at)
      .map(q => {
        const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
        const answered = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
        return (answered - created) / 3600; // hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    // Average rating
    const ratingsWithScores = safeQuestions.filter(q => 
      q.rating !== null && q.rating !== undefined && q.rating > 0
    );
    
    const avgRating = ratingsWithScores.length > 0
      ? ratingsWithScores.reduce((sum, q) => sum + q.rating, 0) / ratingsWithScores.length
      : 0;

    // Total questions answered
    const totalAnswered = safeQuestions.filter(q => q.answered_at).length;

    // Pending questions
    const pendingCount = safeQuestions.filter(q => !q.answered_at && q.status === 'paid').length;

    return {
      totalRevenue: totalRevenue || 0,
      thisMonthRevenue: thisMonthRevenue || 0,
      avgResponseTime: avgResponseTime || 0,
      avgRating: avgRating || 0,
      totalAnswered: totalAnswered || 0,
      pendingCount: pendingCount || 0,
    };
  }, [questions]);

  const isLoading = profileLoading || questionsLoading;

  if (isLoading) {
    return (
      <DashboardLayout 
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Analytics' }
        ]}
        pendingCount={0}
        isAvailable={true}
        searchData={{ questions: [] }}
      >
        <LoadingState text="Loading analytics..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Analytics' }
      ]}
      pendingCount={analyticsMetrics.pendingCount}
      isAvailable={expertProfile?.accepting_questions ?? true}
      searchData={{ questions }}
    >
      <AnalyticsLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your performance and earnings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <ExportButton questions={questions} />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(analyticsMetrics.totalRevenue)}
            icon={DollarSign}
            trend={null}
            color="green"
          />
          <StatCard
            label="This Month"
            value={formatCurrency(analyticsMetrics.thisMonthRevenue)}
            icon={DollarSign}
            trend={23.5}
            color="green"
          />
          <StatCard
            label="Avg Response Time"
            value={formatDuration(analyticsMetrics.avgResponseTime)}
            icon={Clock}
            trend={-12.5}
            trendInverse={true}
            color="indigo"
          />
          <StatCard
            label="Avg Rating"
            value={analyticsMetrics.avgRating > 0 ? `${analyticsMetrics.avgRating.toFixed(1)}⭐` : 'No ratings'}
            icon={Star}
            trend={analyticsMetrics.avgRating > 0 ? 5.2 : null}
            color="purple"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Answered"
            value={formatNumber(analyticsMetrics.totalAnswered)}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            label="Pending Questions"
            value={formatNumber(analyticsMetrics.pendingCount)}
            icon={MessageSquare}
            color="orange"
          />
          <StatCard
            label="Avg per Question"
            value={analyticsMetrics.totalAnswered > 0 
              ? formatCurrency(analyticsMetrics.totalRevenue / analyticsMetrics.totalAnswered)
              : '$0'
            }
            icon={DollarSign}
            color="green"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueChart questions={questions} dateRange={dateRange} />
          <ResponseTimeChart questions={questions} dateRange={dateRange} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <InsightsPanel questions={questions} metrics={analyticsMetrics} />
          </div>
          <RatingDistribution questions={questions} />
        </div>
      </AnalyticsLayout>
    </DashboardLayout>
  );
}

export default ExpertAnalyticsPage;