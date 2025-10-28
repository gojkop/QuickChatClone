// src/hooks/dashboardv2/useInboxCounts.js
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch question counts for all inbox tabs
 * Returns: { pending, answered, all, urgent }
 */
export function useInboxCounts() {
  return useQuery({
    queryKey: ['inbox-counts'],
    queryFn: async () => {
      try {
        // Fetch counts for all tabs in parallel
        const [pendingRes, answeredRes, allRes] = await Promise.all([
          apiClient.get('/me/questions?filter_type=pending&per_page=1000'),
          apiClient.get('/me/questions?filter_type=answered&per_page=1000'),
          apiClient.get('/me/questions?filter_type=all&per_page=1000')
        ]);

        const pendingQuestions = pendingRes.data?.questions || pendingRes.data || [];
        const answeredQuestions = answeredRes.data?.questions || answeredRes.data || [];
        const allQuestions = allRes.data?.questions || allRes.data || [];

        // Calculate urgent count (questions with < 2 hours to SLA)
        const urgentCount = pendingQuestions.filter(q => {
          if (!q.created_at || !q.sla_hours_snapshot) return false;

          const now = Date.now() / 1000;
          const createdAtSeconds = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
          const elapsed = now - createdAtSeconds;
          const slaSeconds = q.sla_hours_snapshot * 3600;
          const remaining = slaSeconds - elapsed;
          const hoursRemaining = remaining / 3600;

          return hoursRemaining > 0 && hoursRemaining < 2;
        }).length;

        return {
          pending: pendingQuestions.length,
          answered: answeredQuestions.length,
          all: allQuestions.length,
          urgent: urgentCount
        };
      } catch (error) {
        console.error('Failed to fetch inbox counts:', error);
        return { pending: 0, answered: 0, all: 0, urgent: 0 };
      }
    },
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
  });
}
