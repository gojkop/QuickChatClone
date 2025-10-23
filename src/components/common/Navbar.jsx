// client/src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api';
import SideMenu from './SideMenu';
import logo from '@/assets/images/logo-mindpick.svg';

// ✅ Cache configuration
const CACHE_DURATION = 30000; // 30 seconds in milliseconds

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ✅ Caching refs
  const cacheRef = useRef({
    pendingCount: null,
    timestamp: null
  });

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Helper function to check if cache is valid
  const isCacheValid = () => {
    if (!cacheRef.current.timestamp) return false;
    const timeSinceCache = Date.now() - cacheRef.current.timestamp;
    return timeSinceCache < CACHE_DURATION;
  };

  // ✅ Optimized function to fetch pending questions count
  const fetchPendingCount = async () => {
    // Check cache first
    if (isCacheValid()) {
      console.log('📦 Using cached pending count:', cacheRef.current.pendingCount);
      return cacheRef.current.pendingCount;
    }

    try {
      // ✅ OPTIMIZATION: Use query parameters to filter on backend
      // This returns only pending questions instead of all questions
      const response = await apiClient.get('/me/questions?status=paid');
      const questions = response.data || [];
      
      // Filter for questions that haven't been answered yet
      const pendingCount = questions.filter(q => !q.answered_at).length;
      
      // Update cache
      cacheRef.current = {
        pendingCount,
        timestamp: Date.now()
      };
      
      console.log('🔄 Fetched and cached pending count:', pendingCount);
      return pendingCount;
    } catch (err) {
      console.error('Failed to fetch pending questions count:', err);
      return 0;
    }
  };

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        setUserProfile(null);
        setIsLoadingProfile(false);
        // Clear cache when user logs out
        cacheRef.current = {
          pendingCount: null,
          timestamp: null
        };
        return;
      }

      setIsLoadingProfile(true);

      try {
        const response = await apiClient.get('/me/profile');
        const userData = response.data?.user || {};
        const expertData = response.data?.expert_profile || {};
        
        const avatarUrl = expertData.avatar_url || null;
        
        // ✅ Fetch pending count with caching
        const pendingCount = await fetchPendingCount();
        
        setUserProfile({
          name: userData.name || 'Expert',
          email: userData.email,
          avatar_url: avatarUrl,
          handle: expertData.handle || null,
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
          handle: null,
          pendingQuestions: 0,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // ✅ Optional: Invalidate cache when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Optional: Clear cache on unmount if desired
      // cacheRef.current = { pendingCount: null, timestamp: null };
    };
  }, []);
  
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
        className="rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0"
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
          className={`container mx-auto transition duration-base ease-[var(--ease-standard)] ${
            isScrolled
              ? 'bg-surface/95 backdrop-blur-lg shadow-md rounded-none border-b border-gray-200/50'
              : 'bg-surface/80 backdrop-blur-lg shadow-sm rounded-xl border border-surface/60'
          }`}
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-2">
            {/* Left Section - Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-1.5 rounded-lg text-subtext hover:text-primary hover:bg-canvas transition duration-base ease-[var(--ease-standard)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="mindPick"
                  className="h-9 w-auto transition-transform duration-200 hover:scale-105"
                />
              </Link>
            </div>

            {/* Right Section - Badge/Loading/Sign In ONLY */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-canvas transition duration-base ease-[var(--ease-standard)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                      aria-label={`Go to dashboard${userProfile.pendingQuestions > 0 ? ` - ${userProfile.pendingQuestions} pending questions` : ''}`}
                    >
                      <span className="hidden sm:block text-sm font-medium text-subtext group-hover:text-primary transition-colors">
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
                  className="btn btn-primary gap-1.5 px-3 sm:px-4 py-1.5 text-sm"
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