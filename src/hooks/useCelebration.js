// src/hooks/useCelebration.js
// Custom hook to manage celebration state and triggers

import { useState, useCallback } from 'react';

export function useCelebration() {
  const [activeCelebration, setActiveCelebration] = useState(null);
  const [activeToast, setActiveToast] = useState(null);

  /**
   * Show a full-screen milestone celebration
   * @param {string} type - Type of celebration (first_question, first_answer, etc.)
   * @param {object} data - Data to display in celebration
   */
  const celebrate = useCallback((type, data = {}) => {
    setActiveCelebration({ type, data });
  }, []);

  /**
   * Show a subtle toast notification
   * @param {string} type - Type of toast (link_copied, profile_updated, etc.)
   */
  const toast = useCallback((type) => {
    setActiveToast(type);
  }, []);

  /**
   * Close the active celebration
   */
  const closeCelebration = useCallback(() => {
    setActiveCelebration(null);
  }, []);

  /**
   * Close the active toast
   */
  const closeToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  return {
    activeCelebration,
    activeToast,
    celebrate,
    toast,
    closeCelebration,
    closeToast,
  };
}

/**
 * Check if a milestone has been reached and return celebration type
 * @param {object} oldProfile - Previous profile state
 * @param {object} newProfile - Updated profile state
 * @returns {string|null} - Celebration type or null
 */
export function checkProfileMilestone(oldProfile, newProfile) {
  if (!oldProfile || !newProfile) return null;

  const oldStrength = calculateProfileStrength(oldProfile);
  const newStrength = calculateProfileStrength(newProfile);

  // Profile completed (100%)
  if (oldStrength < 100 && newStrength === 100) {
    return 'profile_strength_100';
  }

  // Reached 80%
  if (oldStrength < 80 && newStrength >= 80) {
    return 'profile_strength_80';
  }

  // Reached 60%
  if (oldStrength < 60 && newStrength >= 60) {
    return 'profile_strength_60';
  }

  return null;
}

/**
 * Calculate profile strength percentage
 * @param {object} expertProfile
 * @returns {number} - Percentage (0-100)
 */
function calculateProfileStrength(expertProfile) {
  if (!expertProfile) return 0;

  const fields = [
    expertProfile.handle,
    expertProfile.avatar_url,
    expertProfile.professional_title,
    expertProfile.tagline,
    expertProfile.bio,
    expertProfile.expertise && expertProfile.expertise.length > 0,
    (expertProfile.tier1_enabled !== false && expertProfile.tier1_price_cents) ||
      (expertProfile.tier2_enabled && expertProfile.tier2_min_price_cents),
    Object.values(expertProfile.socials || {}).some(v => v)
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}
