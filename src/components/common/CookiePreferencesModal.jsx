// src/components/common/CookiePreferencesModal.jsx
import React, { useState, useEffect } from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { CONSENT_CATEGORIES } from '@/utils/cookieConsent';

export default function CookiePreferencesModal({ isOpen, onClose }) {
  const { consent, updateConsent } = useCookieConsent();

  // Local state for toggles
  const [preferences, setPreferences] = useState({
    [CONSENT_CATEGORIES.ESSENTIAL]: true,
    [CONSENT_CATEGORIES.MARKETING]: false,
    [CONSENT_CATEGORIES.ANALYTICS]: false,
  });

  // Initialize with current consent state
  useEffect(() => {
    if (consent) {
      setPreferences(consent);
    }
  }, [consent]);

  if (!isOpen) {
    return null;
  }

  const handleToggle = (category) => {
    // Don't allow toggling essential
    if (category === CONSENT_CATEGORIES.ESSENTIAL) {
      return;
    }

    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    updateConsent(preferences, 'customize');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Essential Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Essential Cookies</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Required for authentication and basic functionality. Cannot be disabled.
                </p>
                <ul className="mt-2 text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>Login session management</li>
                  <li>Security tokens</li>
                  <li>Basic app functionality</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-7 bg-gray-300 rounded-full cursor-not-allowed relative">
                  <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Marketing & Campaign Tracking */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Marketing & Campaign Tracking
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  Helps experts understand which marketing campaigns drive traffic and conversions.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>UTM parameter tracking</li>
                  <li>Visit attribution (hashed IP address)</li>
                  <li>Campaign performance analytics</li>
                  <li>Question-to-campaign linking</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggle(CONSENT_CATEGORIES.MARKETING)}
                  className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${
                    preferences[CONSENT_CATEGORIES.MARKETING]
                      ? 'bg-indigo-600'
                      : 'bg-gray-300'
                  }`}
                  aria-label="Toggle marketing consent"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      preferences[CONSENT_CATEGORIES.MARKETING]
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Analytics & Product Improvement */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Analytics & Product Improvement
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  Helps us understand how you use mindPick and identify bugs.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>Page visit tracking</li>
                  <li>User interaction analytics</li>
                  <li>Feedback widget data</li>
                  <li>Error reporting</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggle(CONSENT_CATEGORIES.ANALYTICS)}
                  className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${
                    preferences[CONSENT_CATEGORIES.ANALYTICS]
                      ? 'bg-indigo-600'
                      : 'bg-gray-300'
                  }`}
                  aria-label="Toggle analytics consent"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      preferences[CONSENT_CATEGORIES.ANALYTICS]
                        ? 'translate-x-5'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <a
            href="/privacy"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}