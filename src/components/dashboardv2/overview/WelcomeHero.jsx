import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext'; // ← NEW
import QRCodeModal from '@/components/dashboard/QRCodeModal';

function WelcomeHero() {
  const { user } = useProfile();
  const { expertProfile } = useProfile(); // ← NEW: Get profile from context
  const [copied, setCopied] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // ← REMOVED: useEffect that fetches profile - no longer needed!

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCopyProfileLink = () => {
    if (expertProfile?.handle) {
      const url = `${window.location.origin}/u/${expertProfile.handle}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userName = user?.name?.split(' ')[0] || 'Expert';

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {getGreeting()}, {userName}! 👋
          </h1>
          {expertProfile?.handle && expertProfile.public && (
            <>
              {/* Desktop version - connected buttons */}
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                <a 
                  href={`/u/${expertProfile.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:opacity-80 transition"
                  title="View public profile"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-xs font-semibold text-indigo-600 max-w-[100px] truncate">
                    /u/{expertProfile.handle}
                  </span>
                </a>
                <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                <button
                  onClick={handleCopyProfileLink}
                  className="p-1 hover:bg-indigo-100 rounded transition"
                  title="Copy link"
                  type="button"
                >
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="p-1 hover:bg-indigo-100 rounded transition"
                  title="Show QR code"
                  type="button"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>

              {/* Mobile version - separate buttons */}
              <div className="md:hidden inline-flex items-center gap-1.5">
                <button
                  onClick={handleCopyProfileLink}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold text-indigo-600"
                  type="button"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {copied ? 'Copied' : 'Link'}
                </button>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold text-indigo-600"
                  type="button"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  QR
                </button>
              </div>
            </>
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Here's what's happening with your expert profile today.
        </p>
      </div>

      {expertProfile && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profileUrl={`${window.location.origin}/u/${expertProfile.handle}`}
          expertName={user?.name || 'Expert'}
          handle={expertProfile.handle}
        />
      )}
    </>
  );
}

export default WelcomeHero;