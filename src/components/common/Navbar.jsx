// client/src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api';
import SideMenu from './SideMenu';
import logo from '@/assets/images/logo.svg';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
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

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        setUserProfile(null);
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);

      try {
        const response = await apiClient.get('/me/profile');
        const userData = response.data?.user || {};
        const expertData = response.data?.expert_profile || {};
        
        const avatarUrl = expertData.avatar_url || null;
        
        // Fetch pending questions count
        let pendingCount = 0;
          try {
            const questionsResponse = await apiClient.get('/me/questions');
            const questions = questionsResponse.data || [];
            // Count questions that haven't been answered yet
            pendingCount = questions.filter(q => !q.answered_at).length;
          } catch (err) {
            console.error('Failed to fetch questions count:', err);
          }
        
        setUserProfile({
          name: userData.name || 'Expert',
          email: userData.email,
          avatar_url: avatarUrl,
          pendingQuestions: pendingCount,
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        const storedName = localStorage.getItem('qc_user_name');
        const storedEmail = localStorage.getItem('qc_user_email');
        setUserProfile({
          name: storedName || 'Expert',
          email: storedEmail,
          avatar_url: null,
          pendingQuestions: 0,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);
  
  const UserAvatar = ({ size = 28, avatarUrl }) => {
    const [imageError, setImageError] = useState(false);

    if (avatarUrl && !imageError) {
      return (
        <img 
          src={avatarUrl} 
          alt="" 
          className="rounded-full object-cover flex-shrink-0"
          style={{ width: size, height: size }}
          onError={() => setImageError(true)}
        />
      );
    }

    return (
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
  };

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

  const Tooltip = ({ children }) => (
    <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn">
      {children}
      <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="hidden sm:block w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse"></div>
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
                  className="h-9 w-auto transition-transform duration-200 hover:scale-105" 
                />
              </Link>
            </div>

            {/* Right Section - Ask Anyone + Badge/Loading/Sign In */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Ask Anyone Button */}
              <Link
                to="/invite"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline">Ask Anyone</span>
                <span className="sm:hidden">Ask</span>
              </Link>

              {/* User Section */}
              {isAuthenticated ? (
                isLoadingProfile ? (
                  <LoadingSkeleton />
                ) : userProfile ? (
                  <div className="relative">
                    <button
                      onClick={() => navigate('/expert')}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 group"
                      aria-label={`Go to dashboard${userProfile.pendingQuestions > 0 ? ` - ${userProfile.pendingQuestions} pending questions` : ''}`}
                    >
                      <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                        {userProfile.name.split(' ')[0]}
                      </span>
                      
                      <div className="relative">
                        <UserAvatar size={28} avatarUrl={userProfile.avatar_url} />
                        <NotificationBadge count={userProfile.pendingQuestions} />
                      </div>
                    </button>

                    {showTooltip && userProfile.pendingQuestions > 0 && (
                      <Tooltip>
                        {userProfile.pendingQuestions} pending question{userProfile.pendingQuestions !== 1 ? 's' : ''}
                      </Tooltip>
                    )}
                  </div>
                ) : null
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

      <div className={`transition-all duration-300 ${isScrolled ? 'h-12' : 'h-14'}`}></div>

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        userInfo={userProfile}
        isLoadingProfile={isLoadingProfile}
      />
    </>
  );
}

export default Navbar;