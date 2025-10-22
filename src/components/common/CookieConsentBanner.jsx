// src/components/common/CookieConsentBanner.jsx
import React, { useState } from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import CookiePreferencesModal from './CookiePreferencesModal';

export default function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectOptional } = useCookieConsent();
  const [showModal, setShowModal] = useState(false);

  // Don't render if banner shouldn't be shown
  if (!showBanner) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectOptional = () => {
    rejectOptional();
  };

  const handleCustomize = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl animate-slide-up">
        <div className="container mx-auto px-4 md:px-6 py-6 max-w-5xl">
          <div className="flex items-start gap-4">
            {/* Cookie Icon */}
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zm-3 5a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                We value your privacy
              </h3>
              <div className="text-sm md:text-base text-gray-700 space-y-2 mb-4">
                <p>We use cookies and local storage to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Keep you logged in (essential)</li>
                  <li>Track marketing campaign performance (optional)</li>
                  <li>Improve our product with usage analytics (optional)</li>
                </ul>
                <p className="text-sm text-gray-600">
                  You can change your preferences anytime. Learn more in our{' '}
                  <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectOptional}
                  className="flex-1 sm:flex-initial bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Reject Optional
                </button>
                <button
                  onClick={handleCustomize}
                  className="text-indigo-600 hover:text-indigo-700 font-medium py-3 px-4 underline transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>

            {/* Close button (optional - remove if you want to force choice) */}
            {/* 
            <button
              onClick={handleRejectOptional}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            */}
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showModal && (
        <CookiePreferencesModal
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}