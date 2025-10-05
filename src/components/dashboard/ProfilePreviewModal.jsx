// src/components/dashboard/ProfilePreviewModal.jsx
import React from 'react';
import DefaultAvatar from './DefaultAvatar';

function ProfilePreviewModal({ isOpen, onClose, profile }) {
  if (!isOpen || !profile) return null;

  const formatPrice = (priceUsd) => {
    return `$${priceUsd}`;
  };

  const formatSLA = (hours) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Profile Preview</h3>
            </div>

            {/* Avatar and Name */}
            <div className="flex flex-col items-center text-center mb-6">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.user?.name || 'Expert'} 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100 mb-4"
                />
              ) : (
                <div className="mb-4">
                  <DefaultAvatar size={96} />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {profile.user?.name || 'Expert'}
              </h2>
              {profile.handle && profile.isPublic && (
                <p className="text-sm text-indigo-600 font-medium">
                  @{profile.handle}
                </p>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Price
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {formatPrice(profile.priceUsd)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  per question
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                <div className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">
                  Response Time
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {profile.slaHours}h
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  typical response
                </div>
              </div>
            </div>

            {/* Charity Info */}
            {profile.charity_percentage > 0 && profile.selected_charity && (
              <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-900">Making an Impact</span>
                </div>
                <p className="text-xs text-gray-700">
                  {profile.charity_percentage}% of earnings donated to charity
                </p>
              </div>
            )}

            {/* Status Badge */}
            {profile.isPublic ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">Public Profile Active</p>
                  <p className="text-xs text-green-700">Accepting questions</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Profile Private</p>
                  <p className="text-xs text-gray-600">Not accepting questions</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {profile.handle && profile.isPublic && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
              <a
                href={`/u/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <span>View Full Public Page</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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