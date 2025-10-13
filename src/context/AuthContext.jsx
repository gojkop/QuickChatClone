// client/src/context/AuthContext.jsx
// Clean version - profile set manually by components, no auto-fetch
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(authService.getAuthToken());
  const [authVersion, setAuthVersion] = useState(0); // Track auth state changes
  
  // ✅ User profile state
  const [user, setUser] = useState(null);
  const [expertProfile, setExpertProfile] = useState(null);

  // ✅ Method to set profile data from anywhere in the app
  const setProfileData = (data) => {
    console.log('[AuthContext] Profile data received from external source');
    
    // Handle the structure from /me/profile endpoint
    if (data.user) {
      setUser(data.user);
      console.log('[AuthContext] User set:', data.user.email);
    }
    
    if (data.expert_profile) {
      setExpertProfile(data.expert_profile);
      console.log('[AuthContext] Expert profile set');
    }
    
    // ✅ Expose to window for FeedbackWidget
    if (typeof window !== 'undefined') {
      window.__profileData = data;
      console.log('[AuthContext] Profile exposed to window.__profileData');
    }
  };

  const login = (newToken) => {
    authService.saveAuthToken(newToken);
    setToken(newToken);
    // Increment version to notify all subscribers that auth state changed
    setAuthVersion(prev => prev + 1);
  };

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

  // 🔄 reflect token changes from other tabs / callback flows
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

  // ✅ Clear user data when token is removed
  useEffect(() => {
    if (!token) {
      console.log('[AuthContext] No token, clearing user data');
      setUser(null);
      setExpertProfile(null);
      
      if (typeof window !== 'undefined') {
        delete window.__profileData;
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
      // ✅ Existing values (preserved - nothing broken)
      token, 
      isAuthenticated: !!token, 
      login, 
      logout,
      authVersion,
      
      // ✅ NEW: User profile values
      user,
      expertProfile,
      setProfileData, // Allow components to set profile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);