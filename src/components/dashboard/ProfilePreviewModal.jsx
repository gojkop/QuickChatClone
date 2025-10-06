// src/components/dashboard/ProfilePreviewModal.jsx
import React, { useState } from 'react';

function ProfilePreviewModal({ isOpen, onClose, profile }) {
  const [iframeLoading, setIframeLoading] = useState(true);

  if (!isOpen || !profile) return null;

  const publicPageUrl = profile.handle ? `/u/${profile.handle}` : null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-4 pt-3 pb-3 border-b border-gray-200 flex-shrink-0 bg-gray-50">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-200 rounded-lg transition z-10"
              aria-label="Close preview"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Live Preview</h3>
                <p className="text-xs text-gray-500">Visual preview only</p>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          {profile.isPublic && publicPageUrl ? (
            <div className="flex-1 relative bg-gray-100" style={{ minHeight: 0 }}>
              {/* Browser Chrome */}
              <div className="absolute top-0 left-0 right-0 bg-gray-200 border-b border-gray-300 px-3 py-2 flex items-center gap-2 z-10">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 truncate">
                  {window.location.origin}{publicPageUrl}
                </div>
              </div>

              {/* Loading State */}
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-20 mt-10">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading preview...</p>
                  </div>
                </div>
              )}

              {/* Iframe Container - Scrollable */}
              <div className="absolute inset-0 pt-10 overflow-auto">
                <iframe
                  src={publicPageUrl}
                  className="w-full border-0"
                  style={{ 
                    height: '100%',
                    minHeight: '600px',
                    pointerEvents: 'none'
                  }}
                  title="Profile Preview"
                  onLoad={() => setIframeLoading(false)}
                />
                
                {/* Transparent Overlay - Blocks ALL interactions */}
                <div 
                  className="absolute inset-0 cursor-default"
                  style={{ pointerEvents: 'all' }}
                  title="Preview only - click 'Open Full Page' to interact"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <h4 className="text-base font-bold text-gray-900 mb-2">Profile Not Public</h4>
                <p className="text-sm text-gray-600">
                  Enable your public profile to see the preview
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          {profile.isPublic && publicPageUrl && (
            <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Visual preview only</span>
              </div>
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all"
              >
                <span>Open Full Page</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProfilePreviewModal;