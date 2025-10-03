// client/src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SideMenu from './SideMenu';
import logo from '@/assets/images/logo-quickchat.png';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get user info and notifications
  const getUserInfo = () => {
    if (!isAuthenticated) return null;
    
    // Try to get real user data from auth context or localStorage
    // Priority: 1. Full name, 2. Handle, 3. Email username, 4. Default
    const storedName = localStorage.getItem('qc_user_name');
    const storedHandle = localStorage.getItem('qc_user_handle');
    const storedEmail = localStorage.getItem('qc_user_email');
    
    // Determine display name
    let displayName = 'Expert'; // Default fallback
    
    if (storedName) {
      displayName = storedName;
    } else if (storedHandle) {
      displayName = storedHandle;
    } else if (storedEmail) {
      // Extract name from email (before @)
      displayName = storedEmail.split('@')[0];
    }
    
    // MOCK pending questions count - replace with API call
    const pendingQuestions = 3; // From database: response.data.expert_profile.pending_questions_count
    
    return {
      name: displayName,
      pendingQuestions: pendingQuestions,
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

  // Tooltip Component
  const Tooltip = ({ children }) => (
    <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn">
      {children}
      <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
    </div>
  );

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

            {/* Right Section - Badge or Sign In */}
            <div className="flex items-center">
              {isAuthenticated && userInfo ? (
                <div className="relative">
                  <button
                    onClick={() => navigate('/expert')}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 group"
                    aria-label={`Go to dashboard${userInfo.pendingQuestions > 0 ? ` - ${userInfo.pendingQuestions} pending questions` : ''}`}
                  >
                    {/* User Name (hidden on small screens) */}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                      {userInfo.name.split(' ')[0]}
                    </span>
                    
                    {/* Avatar with Notification Badge */}
                    <div className="relative">
                      <DefaultUserAvatar size={28} />
                      <NotificationBadge count={userInfo.pendingQuestions} />
                    </div>
                  </button>

                  {/* Tooltip on hover */}
                  {showTooltip && userInfo.pendingQuestions > 0 && (
                    <Tooltip>
                      {userInfo.pendingQuestions} pending question{userInfo.pendingQuestions !== 1 ? 's' : ''}
                    </Tooltip>
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

      {/* Compact Spacer */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-12' : 'h-14'}`}></div>

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        userInfo={userInfo}
      />
    </>
  );
}

export default Navbar;