import React, { createContext, useState, useContext } from 'react';
// CORRECTED: Using absolute import path from the 'src' directory.
import { authService } from '@/api/quickchat-api';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
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

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the auth context easily in other components
export const useAuth = () => {
  return useContext(AuthContext);
};