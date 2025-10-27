import { useState, useEffect } from 'react';
import apiClient from '@/api';

/**
 * Hook to manage expert onboarding flow
 * Checks if user needs onboarding and provides state management
 */
export function useOnboardingSetup() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [expertProfile, setExpertProfile] = useState(null);
  const [error, setError] = useState(null);

  // Check if user needs onboarding
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setIsChecking(true);
      setError(null);

      // Fetch expert profile
      const response = await apiClient.get('/expert/profile');
      const profile = response.data;

      setExpertProfile(profile);

      // Check if essential setup is complete
      const hasHandle = !!profile.handle;
      const hasPrice = !!profile.tier1_price_cents;
      const hasSLA = !!profile.tier1_sla_hours;

      // If any essential field is missing, needs onboarding
      const needsSetup = !hasHandle || !hasPrice || !hasSLA;

      setNeedsOnboarding(needsSetup);
      setIsChecking(false);

      return { needsSetup, profile };
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      setError(err.response?.data?.message || 'Failed to check profile status');
      setIsChecking(false);

      // If error fetching profile, assume needs onboarding
      setNeedsOnboarding(true);

      return { needsSetup: true, profile: null };
    }
  };

  const markOnboardingComplete = () => {
    setNeedsOnboarding(false);
  };

  return {
    needsOnboarding,
    isChecking,
    expertProfile,
    error,
    checkOnboardingStatus,
    markOnboardingComplete
  };
}
