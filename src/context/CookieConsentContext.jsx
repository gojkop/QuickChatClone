// src/context/CookieConsentContext.jsx
// React Context for global cookie consent management

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCookieConsent,
  saveCookieConsent,
  hasConsentedBefore,
  clearTrackingData,
  acceptAllConsent,
  rejectOptionalConsent,
  DEFAULT_CONSENT,
  CONSENT_CATEGORIES,
} from '@/utils/cookieConsent';

/**
 * Cookie Consent Context
 */
const CookieConsentContext = createContext(null);

/**
 * Cookie Consent Provider Component
 *
 * Wraps the entire app and provides consent state globally
 */
export function CookieConsentProvider({ children }) {
  // Consent preferences state
  const [consent, setConsent] = useState(null);

  // Whether user has interacted with banner
  const [hasConsented, setHasConsented] = useState(false);

  // Whether banner should be shown
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const loadConsent = () => {
      const storedConsent = getCookieConsent();
      const hasInteracted = hasConsentedBefore();

      console.log('🍪 Loading cookie consent...');
      console.log('  Stored consent:', storedConsent);
      console.log('  Has interacted:', hasInteracted);

      if (storedConsent) {
        setConsent(storedConsent);
        setHasConsented(true);
        setShowBanner(false);
      } else {
        // No consent data - show banner
        setConsent(DEFAULT_CONSENT);
        setHasConsented(false);
        setShowBanner(true);
      }
    };

    loadConsent();
  }, []);

  /**
   * Update consent preferences
   *
   * @param {Object} newConsent - New consent preferences
   * @param {string} method - How consent was given
   */
  const updateConsent = (newConsent, method = 'customize') => {
    console.log('🍪 Updating consent:', newConsent, 'via', method);

    // Save to localStorage
    const saved = saveCookieConsent(newConsent, method);

    if (saved) {
      setConsent(newConsent);
      setHasConsented(true);
      setShowBanner(false);

      // If user revoked marketing or analytics consent, clear tracking data
      if (!newConsent[CONSENT_CATEGORIES.MARKETING] ||
          !newConsent[CONSENT_CATEGORIES.ANALYTICS]) {
        clearTrackingData();
      }
    }
  };

  /**
   * Handle "Accept All" button
   */
  const acceptAll = () => {
    console.log('✅ User clicked Accept All');
    updateConsent(acceptAllConsent(), 'accept_all');
  };

  /**
   * Handle "Reject Optional" button
   */
  const rejectOptional = () => {
    console.log('❌ User clicked Reject Optional');
    updateConsent(rejectOptionalConsent(), 'reject_optional');

    // Clear existing tracking data
    clearTrackingData();
  };

  /**
   * Open preferences modal (doesn't save, just signals intent)
   */
  const openPreferences = () => {
    console.log('⚙️ User clicked Customize');
    // Modal component will handle actual save
    // This just logs the intent
  };

  /**
   * Manually show banner (e.g., from footer link)
   */
  const reopenBanner = () => {
    setShowBanner(true);
  };

  // Context value
  const value = {
    // State
    consent,
    hasConsented,
    showBanner,

    // Actions
    updateConsent,
    acceptAll,
    rejectOptional,
    openPreferences,
    reopenBanner,

    // Utilities
    hasMarketingConsent: () => consent?.[CONSENT_CATEGORIES.MARKETING] === true,
    hasAnalyticsConsent: () => consent?.[CONSENT_CATEGORIES.ANALYTICS] === true,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Custom hook to use cookie consent context
 *
 * @returns {Object} Consent context value
 */
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (context === null) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }

  return context;
}

/**
 * HOC to wrap components that need consent checking
 *
 * @param {React.Component} Component - Component to wrap
 * @param {string} requiredCategory - Required consent category
 * @returns {React.Component} Wrapped component
 */
export function withConsentCheck(Component, requiredCategory) {
  return function ConsentCheckedComponent(props) {
    const { consent, hasConsented } = useCookieConsent();

    // Wait for consent to load
    if (!hasConsented) {
      return null;
    }

    // Check if required consent is granted
    const hasRequiredConsent = consent?.[requiredCategory] === true;

    if (!hasRequiredConsent) {
      console.log(`⚠️ ${Component.name} blocked: missing ${requiredCategory} consent`);
      return null;
    }

    return <Component {...props} />;
  };
}

export default CookieConsentContext;