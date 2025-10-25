import { useState, useMemo } from 'react';
import { calculateAnalytics } from '@/utils/dashboardv2/analyticsCalculator';

export function useAnalytics(questions = []) {
  const [dateRange, setDateRange] = useState(() => {
    const end = Date.now();
    const start = end - 30 * 24 * 60 * 60 * 1000; // Last 30 days
    return { start, end };
  });

  const analytics = useMemo(() => {
    return calculateAnalytics(questions, dateRange);
  }, [questions, dateRange]);

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
    analytics,
    dateRange,
    setPresetRange,
    setCustomRange,
  };
}