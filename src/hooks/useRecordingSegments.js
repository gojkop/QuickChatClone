import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch recording segments for a specific question (lazy loaded)
 * This is called only when the user needs to view the recording
 *
 * @param {number} questionId - The ID of the question
 * @param {Object} options - Additional React Query options
 */
export function useRecordingSegments(questionId, options = {}) {
  return useQuery({
    queryKey: ['recording-segments', questionId],
    queryFn: async () => {
      if (!questionId) {
        return [];
      }

      const response = await apiClient.get(`/questions/${questionId}/recording-segments`);
      return response.data?.recording_segments || [];
    },
    enabled: !!questionId, // Only run if questionId is provided
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
}
