// src/hooks/dashboardv2/usePendingCount.js
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';

/**
 * Hook to fetch accurate pending question count
 * Fetches all pending questions to get the true count
 * This is used for consistent badge counts across all pages
 */
export function usePendingCount() {
  return useQuery({
    queryKey: ['pending-count'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/me/questions?filter_type=pending&per_page=1000');
        const questions = response.data?.questions || response.data || [];
        return questions.length;
      } catch (error) {
        console.error('Failed to fetch pending count:', error);
        return 0;
      }
    },
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
  });
}
