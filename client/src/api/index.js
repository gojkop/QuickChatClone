// client/src/api/index.js
import axios from "axios";

const AUTH_TOKEN_KEY = "qc_token";

const apiClient = axios.create({
  baseURL: "/api"
});

// (Optional) include cookies for cross-site if you stick with cookie auth later
apiClient.defaults.withCredentials = true;

// Attach token from localStorage (your current pattern)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  saveAuthToken(t) {
    if (t) localStorage.setItem(AUTH_TOKEN_KEY, t);
  },
  getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    if (!window.location.pathname.endsWith("/signin")) {
      window.location.href = "/signin";
    }
  },

  // NEW: go through our Node function
  async initGoogleOAuth(redirectUri) {
    const { data } = await apiClient.post("/oauth/google/init", { redirect_uri: redirectUri });
    return data; // { authUrl }
  },

  // NEW: exchange code via our Node function
  async continueGoogleOAuth(code, redirectUri) {
    const { data } = await apiClient.get("/oauth/google/continue", {
      params: { code, redirect_uri: redirectUri }
    });
    return data; // { token, name, email }
  }
};

export default apiClient;
