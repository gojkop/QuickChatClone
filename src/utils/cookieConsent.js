// src/utils/cookieConsent.js
// Cookie consent management utilities

/**
 * Cookie consent categories
 */
export const CONSENT_CATEGORIES = {
  ESSENTIAL: 'essential',
  MARKETING: 'marketing',
  ANALYTICS: 'analytics',
};

/**
 * Default consent state (opt-in approach - all optional categories OFF)
 */
export const DEFAULT_CONSENT = {
  [CONSENT_CATEGORIES.ESSENTIAL]: true,  // Always true, non-toggleable
  [CONSENT_CATEGORIES.MARKETING]: false, // UTM tracking, campaign attribution
  [CONSENT_CATEGORIES.ANALYTICS]: false, // Feedback widget, usage analytics
};

/**
 * localStorage key for consent data
 */
const CONSENT_STORAGE_KEY = 'qc_cookie_consent';

/**
 * Schema version for future migrations
 */
const CONSENT_VERSION = 1;

/**
 * Get current consent preferences from localStorage
 *
 * @returns {Object|null} Consent data object or null if not set
 */
export function getCookieConsent() {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);

    // Validate schema version
    if (data.version !== CONSENT_VERSION) {
      console.warn('Cookie consent schema version mismatch, resetting');
      return null;
    }

    // Return preferences
    return data.preferences || null;
  } catch (error) {
    console.error('Failed to read cookie consent:', error);
    return null;
  }
}

/**
 * Check if user has consented to a specific category
 *
 * @param {string} category - One of CONSENT_CATEGORIES
 * @returns {boolean} True if consented, false otherwise
 */
export function hasConsent(category) {
  const preferences = getCookieConsent();

  // If no consent data, return false (except for essential)
  if (!preferences) {
    return category === CONSENT_CATEGORIES.ESSENTIAL;
  }

  // Essential is always true
  if (category === CONSENT_CATEGORIES.ESSENTIAL) {
    return true;
  }

  return preferences[category] === true;
}

/**
 * Save consent preferences to localStorage
 *
 * @param {Object} preferences - Consent preferences object
 * @param {string} method - How consent was given ('accept_all', 'reject_optional', 'customize')
 * @returns {boolean} True if saved successfully
 */
export function saveCookieConsent(preferences, method = 'customize') {
  try {
    // Ensure essential is always true
    const safePreferences = {
      ...preferences,
      [CONSENT_CATEGORIES.ESSENTIAL]: true,
    };

    const consentData = {
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      lastUpdated: Date.now(),
      preferences: safePreferences,
      bannerDismissed: true,
      method: method,
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));

    console.log('✅ Cookie consent saved:', consentData);

    return true;
  } catch (error) {
    console.error('Failed to save cookie consent:', error);
    return false;
  }
}

/**
 * Check if user has interacted with consent banner
 *
 * @returns {boolean} True if banner has been dismissed
 */
export function hasConsentedBefore() {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      return false;
    }

    const data = JSON.parse(stored);
    return data.bannerDismissed === true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all tracking data from localStorage
 * Used when user revokes consent
 */
export function clearTrackingData() {
  try {
    // Clear UTM tracking data
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Remove UTM-related keys
      if (key && (
        key.startsWith('qc_visit_') ||
        key === 'qc_utm_params' ||
        key === 'qc_utm_timestamp' ||
        key === 'feedback_session_id'
      )) {
        keysToRemove.push(key);
      }
    }

    // Remove all identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🧹 Cleared tracking data:', key);
    });

    // Clear feedback widget session data
    sessionStorage.removeItem('user_actions');

    console.log('✅ All tracking data cleared');
  } catch (error) {
    console.error('Failed to clear tracking data:', error);
  }
}

/**
 * Update specific consent preference
 *
 * @param {string} category - Category to update
 * @param {boolean} value - New value
 * @returns {boolean} True if updated successfully
 */
export function updateConsentCategory(category, value) {
  const current = getCookieConsent() || DEFAULT_CONSENT;

  // Don't allow changing essential
  if (category === CONSENT_CATEGORIES.ESSENTIAL) {
    console.warn('Cannot modify essential consent');
    return false;
  }

  const updated = {
    ...current,
    [category]: value,
  };

  return saveCookieConsent(updated, 'customize');
}

/**
 * Get consent timestamp (when user first gave consent)
 *
 * @returns {number|null} Unix timestamp in milliseconds
 */
export function getConsentTimestamp() {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);
    return data.timestamp || null;
  } catch (error) {
    return null;
  }
}

/**
 * Preset: Accept all optional categories
 *
 * @returns {Object} Consent preferences with all categories enabled
 */
export function acceptAllConsent() {
  return {
    [CONSENT_CATEGORIES.ESSENTIAL]: true,
    [CONSENT_CATEGORIES.MARKETING]: true,
    [CONSENT_CATEGORIES.ANALYTICS]: true,
  };
}

/**
 * Preset: Reject all optional categories
 *
 * @returns {Object} Consent preferences with only essential enabled
 */
export function rejectOptionalConsent() {
  return {
    [CONSENT_CATEGORIES.ESSENTIAL]: true,
    [CONSENT_CATEGORIES.MARKETING]: false,
    [CONSENT_CATEGORIES.ANALYTICS]: false,
  };
}