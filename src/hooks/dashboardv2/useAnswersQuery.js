import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch answers (with ratings) for the current expert
 * This endpoint returns all answers by the authenticated expert
 * Each answer includes: id, question_id, rating, feedback_text, allow_testimonial, feedback_at
 *
 * @param {Object} options - Additional React Query options
 */
export function useAnswersQuery(options = {}) {
  return useQuery({
    queryKey: ['answers'],
    queryFn: async () => {
      const response = await apiClient.get('/me/answers');

      // Handle response - should be an array of answers with ratings
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback to empty array if response is not an array
      console.warn('⚠️ /me/answers returned non-array data:', response.data);
      return [];
    },
    staleTime: 60 * 1000, // Consider fresh for 1 minute
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    ...options,
  });
}