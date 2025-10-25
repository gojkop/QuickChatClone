import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

export function useQuestionsQuery(options = {}) {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const response = await apiClient.get('/me/questions');
      return response.data || [];
    },
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus (new questions might arrive)
    ...options,
  });
}