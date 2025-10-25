import { useMemo } from 'react';
import { calculateMetrics } from '@/utils/dashboardv2/metricsCalculator';

export function useMetrics(questions = []) {
  const metrics = useMemo(() => {
    return calculateMetrics(questions);
  }, [questions]);

  return metrics;
}