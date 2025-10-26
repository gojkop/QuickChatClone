import { useMemo } from 'react';
import { calculateMetrics } from '@/utils/dashboardv2/metricsCalculator';

export function useMetrics(questions = [], answers = []) {
  const metrics = useMemo(() => {
    return calculateMetrics(questions, answers);
  }, [questions, answers]);

  return metrics;
}
