import { useState } from 'react';
import { useAnalyticsQuery } from '@/hooks/useAnalyticsQuery';

export function useAnalytics(questions = []) {
  const [dateRange, setDateRange] = useState(() => {
    const end = Date.now();
    const start = end - 30 * 24 * 60 * 60 * 1000; // Last 30 days
    return { start, end };
  });

  // Use server-side analytics instead of client-side calculation
  const { data: analytics, isLoading, error } = useAnalyticsQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const setPresetRange = (preset) => {
    const end = Date.now();
    let start;

    switch (preset) {
      case '7d':
        start = end - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        start = end - 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        start = end - 90 * 24 * 60 * 60 * 1000;
        break;
      case 'all':
        start = null;
        break;
      default:
        start = end - 30 * 24 * 60 * 60 * 1000;
    }

    setDateRange({ start, end });
  };

  const setCustomRange = (start, end) => {
    setDateRange({ start, end });
  };

  return {
    analytics: analytics || {
      total_questions: 0,
      total_revenue_cents: 0,
      answered_count: 0,
      paid_count: 0,
      pending_count: 0,
      refunded_count: 0,
      avg_response_time_hours: 0,
      completion_rate: 0,
      revenue_by_month: [],
    },
    dateRange,
    setPresetRange,
    setCustomRange,
    isLoading,
    error,
  };
}