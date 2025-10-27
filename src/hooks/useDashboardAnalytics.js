import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch pre-calculated dashboard analytics from server
 * This is much more efficient than fetching all questions and calculating client-side
 *
 * Returns all metrics needed for dashboard:
 * - thisMonthRevenue (dollars)
 * - avgResponseTime (hours)
 * - avgRating (1-5 scale)
 * - urgentCount (questions with <2hrs to SLA)
 * - pendingCount (unanswered paid questions)
 * - answeredCount (total answered)
 * - thisMonthAnsweredCount (answered this month)
 * - avgRevenuePerQuestion (this month average)
 * - slaComplianceRate (% answered within SLA)
 * - revenueChange (% change from last month - TODO)
 * - totalQuestions (all questions)
 */
export function useDashboardAnalytics(options = {}) {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/me/dashboard-analytics');
        return response.data;
      } catch (error) {
        // If endpoint doesn't exist yet (404), return null to trigger fallback
        if (error.response?.status === 404) {
          console.warn('Dashboard analytics endpoint not implemented yet. Using fallback calculation.');
          return null;
        }
        throw error;
      }
    },
    staleTime: 60 * 1000, // Consider fresh for 1 minute
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: false, // Don't retry 404s
    ...options,
  });
}
