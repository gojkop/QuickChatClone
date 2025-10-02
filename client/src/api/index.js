// client/src/api/index.js
import axios from "axios";

const AUTH_TOKEN_KEY = 'qc_token';

// Create axios instance
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Add auth token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle 401 responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      authService.logout();
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  saveAuthToken(token) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
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

  // INIT: Get Google OAuth URL
  async initGoogleOAuth() {
    try {
      const response = await apiClient.post('/oauth/google/init');
      return response.data; // { authUrl }
    } catch (error) {
      console.error("Error initiating Google OAuth:", error);
      throw error;
    }
  },

  // CONTINUE: Exchange code for token (simplified - no Stripe)
  async continueGoogleOAuth(code) {
    try {
      const response = await apiClient.get('/oauth/google/continue', {
        params: { code }
      });
      return response.data; // { token, name, email }
    } catch (error) {
      console.error("Error continuing Google OAuth:", error);
      throw error;
    }
  }
};

export default apiClient;