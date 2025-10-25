import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch paginated questions for the current expert
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by question status (e.g., 'paid', 'answered')
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.perPage - Items per page (default: 10)
 * @param {Object} options - Additional React Query options
 */
export function useQuestionsQuery({ status, page = 1, perPage = 10 } = {}, options = {}) {
  return useQuery({
    queryKey: ['questions', { status, page, perPage }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('per_page', perPage);

      const response = await apiClient.get(`/me/questions?${params.toString()}`);

      // Handle new paginated response format
      if (response.data && response.data.questions) {
        return {
          questions: response.data.questions || [],
          pagination: response.data.pagination || {
            page: 1,
            per_page: perPage,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        };
      }

      // Fallback for old format (backwards compatibility)
      return {
        questions: response.data || [],
        pagination: {
          page: 1,
          per_page: perPage,
          total: (response.data || []).length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      };
    },
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus (new questions might arrive)
    ...options,
  });
}