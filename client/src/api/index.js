// client/src/api/index.js
import axios from "axios";

const AUTH_TOKEN_KEY = 'qc_token';

// Create axios instance for same-origin /api (proxied to Xano via vercel.json rewrites)
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Attach token on each request if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authService.logout();
    }
    return Promise.reject(error);
  }
);

// Centralized auth helpers
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
    if (!window.location.pathname.endsWith('/signin')) {
      window.location.href = '/signin';
    }
  },

  // === OAuth (Option A via rewrites) ===

  // 1) Get Google consent URL from Xano (proxied by Vercel rewrite)
  async initGoogleOAuth() {
    const redirect_uri = `${window.location.origin}/auth/callback`;
    const { data } = await apiClient.get('/oauth/google/init', {
      params: { redirect_uri }
    });
    return data; // { authUrl }
  },

  // 2) Exchange code -> token on callback
  async continueGoogleOAuth({ code, state }) {
    const redirect_uri = `${window.location.origin}/auth/callback`;
    const { data } = await apiClient.get('/oauth/google/continue', {
      params: { code, state, redirect_uri }
    });
    // Optional: persist token here if your flow expects it
    if (data?.token) this.saveAuthToken(data.token);
    return data; // { token, user, ... }
  }
};

export default apiClient;
