import { useFeatureFlags } from '../context/FeatureFlagsContext';
import { useAuth } from '../context/AuthContext'; // Your existing auth context

const PLAN_LEVELS = {
  free: 0,
  pro: 10,
  enterprise: 20
};

/**
 * Hook to check if a feature is enabled for the current user
 * @param {string} featureKey - The feature flag key (e.g., 'social_impact_dashboard')
 * @returns {object} { isEnabled, requiredPlan, loading, exists }
 */
export function useFeature(featureKey) {
  const { flags, loading: flagsLoading } = useFeatureFlags();
  const { user, loading: authLoading } = useAuth();

  // Check if feature exists in flags
  const exists = !!flags[featureKey];

  function isEnabled() {
    // Wait for both flags and auth to load
    if (flagsLoading || authLoading) {
      return false;
    }

    // Feature doesn't exist or not loaded
    if (!exists) {
      console.warn(`Feature flag '${featureKey}' not found. Feature disabled by default.`);
      return false;
    }

    const feature = flags[featureKey];
    
    // Disabled globally
    if (!feature.enabled) {
      return false;
    }

    // Get user's plan level (default to free if not logged in)
    const userPlan = user?.expert_profile?.plan || user?.plan || 'free';
    const userPlanLevel = PLAN_LEVELS[userPlan] ?? 0;

    // Check if user's plan meets minimum requirement
    return userPlanLevel >= feature.min_plan_level;
  }

  function getRequiredPlan() {
    if (!exists) return null;
    return flags[featureKey].min_plan;
  }

  return {
    isEnabled: isEnabled(),
    requiredPlan: getRequiredPlan(),
    loading: flagsLoading || authLoading,
    exists
  };
}