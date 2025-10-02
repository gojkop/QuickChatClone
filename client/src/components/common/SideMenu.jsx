import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/images/logo-quickchat.png';

function SideMenu({ isOpen, onClose }) {
  const { isAuthenticated, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    onClose();
  };

  const menuItems = [
    {
      section: 'Product',
      items: [
        { to: '/pricing', label: 'Pricing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { to: '/social-impact', label: 'Social Impact', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
        { to: '/invite', label: 'Invite an Expert', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> }
      ]
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`relative h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img src={logo} alt="QuickChat" className="h-8 w-auto" />
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

        {/* User Section - if authenticated */}
        {isAuthenticated && (
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
            <Link 
              to="/expert" 
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                ME
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">My Dashboard</div>
                <div className="text-xs text-gray-500">View your stats</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Main Navigation */}
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

          {/* Auth Section */}
          <div className="mb-6">
            <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Account
            </div>
            <ul className="space-y-1">
              {!isAuthenticated ? (
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
              ) : (
                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Footer Links */}
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Support
          </div>
          <ul className="space-y-1">
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
        </div>
      </aside>
    </div>
  );
}

export default SideMenu;