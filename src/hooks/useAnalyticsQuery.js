import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch pre-calculated analytics from the server
 * This is much faster than fetching all questions and calculating client-side
 *
 * @param {Object} params - Query parameters
 * @param {number} params.startDate - Start date filter (epochms)
 * @param {number} params.endDate - End date filter (epochms)
 * @param {Object} options - Additional React Query options
 */
export function useAnalyticsQuery({ startDate, endDate } = {}, options = {}) {
  return useQuery({
    queryKey: ['analytics', { startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiClient.get(
        `/me/analytics${params.toString() ? '?' + params.toString() : ''}`
      );

      return response.data || {
        total_questions: 0,
        total_revenue_cents: 0,
        answered_count: 0,
        paid_count: 0,
        pending_count: 0,
        refunded_count: 0,
        avg_response_time_hours: 0,
        completion_rate: 0,
        revenue_by_month: [],
      };
    },
    staleTime: 60 * 1000, // Consider fresh for 1 minute
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options,
  });
}
