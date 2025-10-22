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

  const handleAccept = () => {
    acceptAll();
  };

  const handleReject = () => {
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
      {/* Compact Bottom Banner - No Backdrop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg animate-slide-up">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 max-w-6xl mx-auto">
            
            {/* Icon + Message */}
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              {/* Cookie Icon */}
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zm-3 5a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base text-gray-700 leading-snug">
                  We use cookies to improve your experience and analyze performance. 
                  <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline ml-1 font-medium">
                    Learn more
                  </a>
                </p>
              </div>
            </div>

            {/* Actions - EQUAL PROMINENCE */}
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto md:flex-shrink-0">
              {/* Accept Button */}
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 md:px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap"
              >
                Accept
              </button>
              
              {/* Reject Button - SAME SIZE/PROMINENCE */}
              <button
                onClick={handleReject}
                className="flex-1 md:flex-initial bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-5 md:px-6 rounded-lg transition-all duration-200 text-sm md:text-base whitespace-nowrap"
              >
                Reject
              </button>
              
              {/* Customize Link - Tertiary */}
              <button
                onClick={handleCustomize}
                className="hidden md:block text-gray-600 hover:text-gray-900 font-medium py-2.5 px-3 transition-colors text-sm whitespace-nowrap underline"
              >
                Customize
              </button>
            </div>
          </div>

          {/* Mobile: Customize Link Below */}
          <div className="md:hidden mt-2 text-center">
            <button
              onClick={handleCustomize}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm underline"
            >
              Customize preferences
            </button>
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