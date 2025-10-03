// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(authService.getAuthToken());

  const login = (newToken) => {
    authService.saveAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
  };

  // 🔄 reflect token changes from other tabs / callback flows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'qc_token') {
        setToken(authService.getAuthToken());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
