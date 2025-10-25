// client/src/api/index.js
import axios from "axios";
import { XANO_BASE_URL } from "@/config/xano";

const AUTH_TOKEN_KEY = "qc_token";

const apiClient = axios.create({
  baseURL: XANO_BASE_URL,
  withCredentials: false // critical: do NOT send Xano cookies
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // ← MODIFIED: Smart caching strategy
  // Cache profile and questions for short periods (React Query handles this better)
  // But we still set cache headers for browser-level caching
  if (config.url === '/me/profile' || config.url === '/me/questions') {
    // Allow caching for 30 seconds, but must revalidate
    config.headers["Cache-Control"] = "max-age=30, must-revalidate";
  } else {
    // Don't cache other requests
    config.headers["Cache-Control"] = "no-store";
  }
  
  return config;
});

// Protect the login round-trip from 401 auto-logout
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const inProgress = sessionStorage.getItem("qc_auth_in_progress") === "1";
    const onCallback =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/auth/callback") ||
       window.location.pathname.startsWith("/auth/magic-link"));

    if (status === 401 && !inProgress && !onCallback) {
      authService.logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  saveAuthToken(token) {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  isAuthenticated() {
    return !!this.getAuthToken();
  },
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("me"); // clear any cached profile
    if (!window.location.pathname.endsWith("/signin")) {
      window.location.href = "/signin";
    }
  },
};

export default apiClient;