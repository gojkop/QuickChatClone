// client/src/context/AuthContext.jsx
// Enhanced to fetch and provide user profile data while preserving all existing functionality
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(authService.getAuthToken());
  const [authVersion, setAuthVersion] = useState(0);
  
  // ✅ NEW: Add user profile state
  const [user, setUser] = useState(null);
  const [expertProfile, setExpertProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // ✅ NEW: Fetch user profile when token exists
  const fetchUserProfile = async (authToken) => {
    if (!authToken) {
      setUser(null);
      setExpertProfile(null);
      return;
    }

    setIsLoadingProfile(true);
    
    try {
      // Adjust this endpoint to match your API
      const response = await fetch(`${import.meta.env.VITE_XANO_BASE_URL || 'https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ'}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      console.log('[AuthContext] Profile data received:', data);

      // Handle different response structures
      // Case 1: Response has { user: {...}, expert_profile: {...} }
      if (data.user) {
        setUser(data.user);
        console.log('[AuthContext] User set:', data.user);
        console.log('[AuthContext] User email:', data.user.email);
      }
      // Case 2: Response is the user object directly
      else if (data.email || data.id) {
        setUser(data);
        console.log('[AuthContext] User set (direct):', data);
      }

      // Set expert profile if it exists
      if (data.expert_profile) {
        setExpertProfile(data.expert_profile);
        console.log('[AuthContext] Expert profile set:', data.expert_profile);
      }

      // ✅ CRITICAL: Expose to window for FeedbackWidget and other components
      if (typeof window !== 'undefined') {
        window.__profileData = data;
        console.log('[AuthContext] Profile data exposed to window.__profileData');
      }

    } catch (error) {
      console.error('[AuthContext] Failed to fetch user profile:', error);
      
      // Don't clear user on fetch error if we're still authenticated
      // (could be temporary network issue)
      // Only clear if it's an auth error (401/403)
      if (error.message?.includes('401') || error.message?.includes('403')) {
        setUser(null);
        setExpertProfile(null);
        // Optionally trigger logout
        // logout();
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ✅ NEW: Fetch profile when token changes
  useEffect(() => {
    if (token) {
      console.log('[AuthContext] Token detected, fetching profile...');
      fetchUserProfile(token);
    } else {
      console.log('[AuthContext] No token, clearing user data');
      setUser(null);
      setExpertProfile(null);
      
      // Clear window data
      if (typeof window !== 'undefined') {
        delete window.__profileData;
      }
    }
  }, [token]);

  // ✅ ENHANCED: Login now also fetches profile
  const login = (newToken) => {
    authService.saveAuthToken(newToken);
    setToken(newToken);
    setAuthVersion(prev => prev + 1);
    // Profile will be fetched automatically by the useEffect above
  };

  // ✅ ENHANCED: Logout now also clears user data
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setExpertProfile(null);
    setAuthVersion(prev => prev + 1);
    
    // Clear window data
    if (typeof window !== 'undefined') {
      delete window.__profileData;
    }
  };

  // ✅ NEW: Manual refresh function (useful for after profile updates)
  const refreshProfile = () => {
    if (token) {
      console.log('[AuthContext] Manual profile refresh requested');
      fetchUserProfile(token);
    }
  };

  // 🔄 Existing: reflect token changes from other tabs / callback flows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'qc_token') {
        const newToken = authService.getAuthToken();
        setToken(newToken);
        setAuthVersion(prev => prev + 1);
        // Profile will be fetched automatically by the token useEffect
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      // ✅ Existing values (preserved)
      token, 
      isAuthenticated: !!token, 
      login, 
      logout,
      authVersion,
      
      // ✅ NEW: User profile values
      user,
      expertProfile,
      isLoadingProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);