// client/src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SideMenu from './SideMenu';
import logo from '@/assets/images/logo-quickchat.png';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/signin');
  };

  // Get user info and stats (MOCK DATA - will come from API/database)
  const getUserInfo = () => {
    if (!isAuthenticated) return null;
    
    // MOCK DATA - Replace with real data from API
    return {
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      avatar: null,
      // Notification counts (from database)
      pendingQuestions: 3, // Questions awaiting response
      totalEarnings: 2840, // Total earnings this month
      avgResponseTime: 8 // Average response time in hours
    };
  };

  const userInfo = getUserInfo();

  // Compact default avatar
  const DefaultUserAvatar = ({ size = 28 }) => (
    <div 
      className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg 
        className="text-white" 
        style={{ width: size * 0.55, height: size * 0.55 }}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
        />
      </svg>
    </div>
  );

  // Notification Badge Component
  const NotificationBadge = ({ count }) => {
    if (!count || count === 0) return null;
    
    return (
      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold shadow-sm">
          {count > 9 ? '9+' : count}
        </span>
      </span>
    );
  };

  return (
    <>
      <header 
        className={`fixed z-40 transition-all duration-300 ease-out ${
          isScrolled 
            ? 'top-0 left-0 right-0' 
            : 'top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3'
        }`}
      >
        <nav 
          className={`container mx-auto transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-lg shadow-md rounded-none border-b border-gray-200/50'
              : 'bg-white/80 backdrop-blur-lg shadow-sm rounded-xl border border-white/60'
          }`}
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-2">
            {/* Left Section - Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link to="/" className="flex items-center">
                <img 
                  src={logo} 
                  alt="QuickChat" 
                  className="h-7 w-auto transition-transform duration-200 hover:scale-105" 
                />
              </Link>
            </div>

            {/* Right Section - User Menu or Sign In */}
            <div className="flex items-center">
              {isAuthenticated && userInfo ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 group relative"
                  >
                    {/* User Name (hidden on small screens) */}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                      {userInfo.name.split(' ')[0]}
                    </span>
                    
                    {/* Avatar with Notification Badge */}
                    <div className="relative">
                      {userInfo.avatar ? (
                        <img 
                          src={userInfo.avatar} 
                          alt={userInfo.name}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <DefaultUserAvatar size={28} />
                      )}
                      
                      {/* Notification Badge */}
                      <NotificationBadge count={userInfo.pendingQuestions} />
                    </div>
                    
                    {/* Dropdown Arrow */}
                    <svg 
                      className={`w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-all duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown Menu with Stats */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn">
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            {userInfo.avatar ? (
                              <img 
                                src={userInfo.avatar} 
                                alt={userInfo.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <DefaultUserAvatar size={40} />
                            )}
                            {userInfo.pendingQuestions > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold">
                                  {userInfo.pendingQuestions}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">
                              {userInfo.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {userInfo.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats - Only if user has activity */}
                      {userInfo.pendingQuestions > 0 && (
                        <div className="px-3 py-2 bg-gradient-to-br from-orange-50 to-red-50 border-b border-orange-100">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1.5 flex-1">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="font-semibold text-red-700">
                                {userInfo.pendingQuestions} pending question{userInfo.pendingQuestions !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Link
                              to="/expert"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                            >
                              Answer now
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="py-1.5">
                        <Link
                          to="/expert"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-between gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">Dashboard</span>
                          </div>
                          {userInfo.pendingQuestions > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                              {userInfo.pendingQuestions}
                            </span>
                          )}
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/expert');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">Settings</span>
                        </button>

                        {/* Public Profile Link */}
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            // Copy profile link functionality
                            const profileUrl = `${window.location.origin}/u/sarah_marketing`; // Replace with actual handle
                            navigator.clipboard.writeText(profileUrl);
                            // You could add a toast notification here
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Copy Profile Link</span>
                        </button>
                      </div>

                      {/* Mini Stats Section (if no pending questions) */}
                      {userInfo.pendingQuestions === 0 && (
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-gray-900">${userInfo.totalEarnings}</div>
                              <div className="text-gray-500">This Month</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-900">{userInfo.avgResponseTime}h</div>
                              <div className="text-gray-500">Avg Response</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  <span>Sign In</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Compact Spacer - reduced height */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-12' : 'h-14'}`}></div>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

export default Navbar;