// src/components/dashboard/ProfilePreviewModal.jsx
import React from 'react';

// Helper to format price
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  if (amount % 1 !== 0) {
    return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol}${amount.toFixed(0)}`;
};

// Default Avatar Component
const DefaultAvatar = ({ size = 96 }) => (
  <div 
    className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg"
    style={{ width: size, height: size }}
  >
    <svg 
      className="text-white" 
      style={{ width: size / 2, height: size / 2 }}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
      />
    </svg>
  </div>
);

function ProfilePreviewModal({ isOpen, onClose, profile }) {
  if (!isOpen || !profile) return null;

  const publicPageUrl = profile.handle ? `/u/${profile.handle}` : null;
  const charityInfo = {
    'unicef': { name: 'UNICEF', icon: '💖' },
    'doctors-without-borders': { name: 'Doctors Without Borders', icon: '🏥' },
    'red-cross': { name: 'Red Cross', icon: '❤️' },
    'world-wildlife': { name: 'World Wildlife Fund', icon: '🐼' },
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
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
                <h3 className="text-sm font-bold text-gray-900">Profile Preview</h3>
                <p className="text-xs text-gray-500">How visitors see your page</p>
              </div>
            </div>
          </div>

          {/* Live Preview Content - Miniaturized Public Profile */}
          {profile.isPublic ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {/* Browser Chrome Mockup */}
              <div className="bg-gray-200 border-b border-gray-300 px-3 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 truncate">
                  {window.location.origin}{publicPageUrl}
                </div>
              </div>

              {/* Actual Profile Preview - Scaled Down */}
              <div className="p-4 bg-gray-50">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden max-w-sm mx-auto">
                  {/* Gradient Header */}
                  <div className="h-16 bg-gradient-to-br from-indigo-100 to-violet-100"></div>

                  <div className="px-4 pb-4 space-y-3">
                    {/* Avatar */}
                    <div className="flex items-start gap-3 -mt-10">
                      {profile.avatar_url ? (
                        <img 
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg" 
                          src={profile.avatar_url}
                          alt={profile.user?.name || 'Expert'}
                        />
                      ) : (
                        <div className="ring-4 ring-white shadow-lg rounded-full">
                          <DefaultAvatar size={64} />
                        </div>
                      )}
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">{profile.user?.name || 'Expert'}</h1>
                      {profile.professional_title && (
                        <p className="text-sm text-indigo-600 font-semibold">{profile.professional_title}</p>
                      )}
                      {profile.tagline && (
                        <p className="text-xs text-gray-700 mt-1">{profile.tagline}</p>
                      )}
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{profile.bio}</p>
                    )}

                    {/* Expertise */}
                    {profile.expertise && profile.expertise.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expertise</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.expertise.slice(0, 6).map((field, index) => (
                            <span key={index} className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-md border border-indigo-200">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Response</div>
                        <div className="font-bold text-gray-900 text-sm">{profile.slaHours}h</div>
                      </div>
                      <div className="text-center border-l border-gray-200">
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="font-bold text-gray-900 text-sm">{formatPrice(profile.price_cents, profile.currency)}</div>
                      </div>
                    </div>

                    {/* Charity */}
                    {profile.charity_percentage > 0 && profile.selected_charity && charityInfo[profile.selected_charity] && (
                      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{charityInfo[profile.selected_charity].icon}</span>
                          <p className="text-xs text-gray-700 leading-snug">
                            <span className="font-bold">{profile.charity_percentage}%</span> donation to{' '}
                            <span className="font-bold text-gray-900">{charityInfo[profile.selected_charity].name}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-2.5 rounded-lg text-sm">
                      Ask Your Question
                    </button>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-4 flex justify-center items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <h4 className="text-base font-bold text-gray-900 mb-2">Profile Not Public</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Enable your public profile to see the preview
                </p>
              </div>
            </div>
          )}

          {/* Footer - Always Visible */}
          {publicPageUrl && profile.isPublic && (
            <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-xl flex-shrink-0">
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all duration-300 group"
              >
                <span>Open Full Page</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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