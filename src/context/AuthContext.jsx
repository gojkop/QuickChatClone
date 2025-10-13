// client/src/context/AuthContext.jsx
// Enhanced with user profile using existing API infrastructure
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
      console.log('[AuthContext] Fetching profile with token:', authToken.substring(0, 20) + '...');

      // ✅ OPTION 1: Try using authService if it has a getProfile method
      if (typeof authService.getProfile === 'function') {
        const data = await authService.getProfile();
        handleProfileData(data);
        return;
      }

      // ✅ OPTION 2: Use Xano API with correct auth header format
      // Xano typically uses 'authToken' in query params, not Authorization header
      const baseUrl = import.meta.env.VITE_XANO_BASE_URL || 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';
      
      // Try method 1: Query parameter (most common for Xano)
      let response = await fetch(`${baseUrl}/auth/me?authToken=${authToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If that fails, try method 2: Different endpoint pattern
      if (!response.ok && response.status === 404) {
        console.log('[AuthContext] /auth/me not found, trying /user endpoint...');
        response = await fetch(`${baseUrl}/user?authToken=${authToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      handleProfileData(data);

    } catch (error) {
      console.error('[AuthContext] Failed to fetch user profile:', error);
      
      // ✅ FALLBACK: Try to extract from existing window data
      if (typeof window !== 'undefined') {
        const existingProfile = window.__profileData;
        if (existingProfile) {
          console.log('[AuthContext] Using existing window.__profileData as fallback');
          handleProfileData(existingProfile);
          setIsLoadingProfile(false);
          return;
        }
      }
      
      // Don't clear user on fetch error if we're still authenticated
      // Only clear if it's an auth error
      if (error.message?.includes('401') || error.message?.includes('403')) {
        setUser(null);
        setExpertProfile(null);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ✅ NEW: Helper to handle profile data from any source
  const handleProfileData = (data) => {
    console.log('[AuthContext] Processing profile data:', data);

    // Handle different response structures
    if (data.user) {
      setUser(data.user);
      console.log('[AuthContext] User set from data.user:', data.user);
      console.log('[AuthContext] User email:', data.user.email);
    } else if (data.email || data.id) {
      // Direct user object
      setUser(data);
      console.log('[AuthContext] User set directly:', data);
    }

    // Set expert profile if it exists
    if (data.expert_profile) {
      setExpertProfile(data.expert_profile);
      console.log('[AuthContext] Expert profile set:', data.expert_profile);
    }

    // ✅ CRITICAL: Expose to window for FeedbackWidget
    if (typeof window !== 'undefined') {
      window.__profileData = data;
      console.log('[AuthContext] Profile data exposed to window.__profileData');
    }
  };

  // ✅ NEW: Allow external components to set profile data
  // This is useful if profile is loaded elsewhere (e.g., in a page component)
  const setProfileData = (data) => {
    console.log('[AuthContext] Profile data set externally:', data);
    handleProfileData(data);
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
  };

  // ✅ ENHANCED: Logout now also clears user data
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setExpertProfile(null);
    setAuthVersion(prev => prev + 1);
    
    if (typeof window !== 'undefined') {
      delete window.__profileData;
    }
  };

  // ✅ NEW: Manual refresh function
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
      setProfileData, // Allow external setting
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);