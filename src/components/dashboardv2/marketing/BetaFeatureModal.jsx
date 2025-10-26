import React from 'react';

export default function BetaFeatureModal({ isOpen, onClose, featureName }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="bg-surface rounded-xl shadow-elev-4 max-w-md w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-xl font-black text-ink text-center mb-2">
              Marketing is in Beta
            </h3>
            <p className="text-sm text-subtext text-center mb-6 font-medium">
              {featureName || 'This feature'} will be available soon. We're actively working on bringing you the full marketing toolkit.
            </p>

            {/* Info Box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-bold text-indigo-900 mb-2">What's coming:</h4>
              <ul className="space-y-1 text-sm text-indigo-800">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Campaign pause/resume controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Archive old campaigns (data preserved)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Custom campaign reports</span>
                </li>
              </ul>
            </div>

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}