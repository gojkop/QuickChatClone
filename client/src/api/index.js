// client/src/api/index.js
import axios from "axios";

const AUTH_TOKEN_KEY = 'qc_token';

// 1) Create a single axios instance for your app
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 2) Interceptor to add the auth token to every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 3) Interceptor to handle 401 Unauthorized responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // If token is invalid, log the user out
      authService.logout();
    }
    return Promise.reject(error);
  }
);

// 4) Auth service with all methods
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
    // Redirect to sign-in page, but only if not already there
    if (!window.location.pathname.endsWith('/signin')) {
      window.location.href = '/signin';
    }
  },

  // INIT: Get Google OAuth URL (no redirect_uri needed - server handles it)
  async initGoogleOAuth() {
    try {
      const response = await apiClient.post('/oauth/google/init');
      return response.data; // { authUrl }
    } catch (error) {
      console.error("Error initiating Google OAuth:", error);
      throw error;
    }
  },

  // CONTINUE: Exchange code for token
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

// 5) Export the configured axios instance as default
export default apiClient;