// client/src/components/common/SideMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/images/logo-mindpick.svg';

function SideMenu({ isOpen, onClose, userInfo, isLoadingProfile }) {
  const { isAuthenticated, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    onClose();
  };

  const handleCopyProfileLink = () => {
    const handle = userInfo?.handle || userInfo?.user?.handle;
    if (handle) {
      const profileUrl = `${window.location.origin}/u/${handle}`;
      navigator.clipboard.writeText(profileUrl);
    }
  };

  // These are no longer needed - we'll use Link with hash instead

  const menuItems = [
    {
      section: 'Product',
      items: [
        { to: '/how-it-works', label: 'How It Works', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { to: '/pricing', label: 'Pricing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { to: '/social-impact', label: 'Social Impact', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
        { to: '/invite', label: 'Invite Expert', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> }
      ]
    }
  ];

  const accountItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      to: '/dashboard#profile-settings',
      label: 'Profile Settings',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      to: '/dashboard#account-settings',
      label: 'Account Settings',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
  ];

  // Only show View Public Profile if user has a handle
  const userHandle = userInfo?.handle || userInfo?.user?.handle;
  if (userHandle) {
    accountItems.push({
      to: `/u/${userHandle}`,
      label: 'View Public Profile', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    });
  }

  const QuickActionsLoading = () => (
    <div className="px-4 py-4 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-b border-gray-200">
      <div className="px-3 mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
        Quick Actions
      </div>
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
      <div className="mt-2 h-10 bg-white border border-indigo-200 rounded-lg animate-pulse"></div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside className={`relative h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img src={logo} alt="mindPick" className="h-8 w-auto" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isAuthenticated && (
          isLoadingProfile ? (
            <QuickActionsLoading />
          ) : userInfo ? (
            <div className="px-4 py-4 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-b border-gray-200">
              <div className="px-3 mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                Quick Actions
              </div>
              
              {userInfo.pendingQuestions > 0 ? (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-sm font-bold text-red-900">
                        {userInfo.pendingQuestions} pending question{userInfo.pendingQuestions !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
                  >
                    Answer now
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        $2.8k
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">This Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        8h
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">Avg Response</div>
                    </div>
                  </div>
                </div>
              )}

              <Link
                to="/dashboard"
                onClick={onClose}
                className="mt-2 flex items-center justify-center gap-2 w-full py-2 px-3 bg-white border border-indigo-200 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Dashboard
              </Link>
            </div>
          ) : null
        )}

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {section.section}
              </div>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {isAuthenticated && !isLoadingProfile && (
            <div className="mb-6">
              <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                My Account
              </div>
              <ul className="space-y-1">
                {accountItems.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  </li>
                ))}
                
                {userHandle && (
                  <li>
                    <button
                      onClick={handleCopyProfileLink}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="font-medium text-sm">Copy Profile Link</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mb-6">
              <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Account
              </div>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/signin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-semibold text-sm">Sign In</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Support
          </div>
          <ul className="space-y-1 mb-3">
            <li>
              <Link
                to="/faq"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-indigo-600 hover:bg-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>FAQ</span>
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-indigo-600 hover:bg-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Terms</span>
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-indigo-600 hover:bg-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy</span>
              </Link>
            </li>
          </ul>

          {isAuthenticated && !isLoadingProfile && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-red-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default SideMenu;