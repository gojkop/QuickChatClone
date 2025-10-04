// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(authService.getAuthToken());
  const [authVersion, setAuthVersion] = useState(0); // Track auth state changes

  const login = (newToken) => {
    authService.saveAuthToken(newToken);
    setToken(newToken);
    // Increment version to notify all subscribers that auth state changed
    setAuthVersion(prev => prev + 1);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setAuthVersion(prev => prev + 1);
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

  return (
    <AuthContext.Provider value={{ 
      token, 
      isAuthenticated: !!token, 
      login, 
      logout,
      authVersion // Expose this so components can watch for changes
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);