import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const queryClient = useQueryClient();

  // Fetch profile with React Query (auto-cached)
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/me/profile');
      return response.data;
    },
    staleTime: 60 * 1000, // Consider fresh for 60 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Mutation for updating availability
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (accepting_questions) => {
      const response = await apiClient.post('/expert/profile/availability', {
        accepting_questions,
      });
      return response.data;
    },
    onSuccess: (data, accepting_questions) => {
      // Optimistically update the profile in cache
      queryClient.setQueryData(['profile'], (old) => ({
        ...old,
        expert_profile: {
          ...old?.expert_profile,
          accepting_questions,
        },
      }));
    },
  });

  const value = {
    profile,
    expertProfile: profile?.expert_profile || null,
    user: profile ? { id: profile.id, email: profile.email, name: profile.user?.name } : null,
    isLoading,
    error,
    refetch,
    updateAvailability: updateAvailabilityMutation.mutate,
    isUpdatingAvailability: updateAvailabilityMutation.isLoading,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}