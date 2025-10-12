import React, { createContext, useContext, useState, useEffect } from 'react';

const FeatureFlagsContext = createContext({});

const PLAN_LEVELS = {
  free: 0,
  pro: 10,
  enterprise: 20
};

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    try {
      const response = await fetch('https://admin.mindpick.me/api/flags/public');
      
      if (!response.ok) {
        throw new Error(`Failed to load flags: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert array to map for easy lookup
      const flagsMap = {};
      data.flags.forEach(flag => {
        flagsMap[flag.key] = {
          enabled: flag.enabled,
          min_plan: flag.min_plan,
          min_plan_level: flag.min_plan_level
        };
      });

      setFlags(flagsMap);
      setError(null);
    } catch (err) {
      console.error('Failed to load feature flags:', err);
      setError(err.message);
      setFlags({}); // Fail gracefully - all features disabled
    } finally {
      setLoading(false);
    }
  }

  // Manual refresh function (useful after plan upgrades)
  const refreshFlags = () => {
    setLoading(true);
    loadFlags();
  };

  return (
    <FeatureFlagsContext.Provider value={{ 
      flags, 
      loading, 
      error,
      refreshFlags 
    }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}