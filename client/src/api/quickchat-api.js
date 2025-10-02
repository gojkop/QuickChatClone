import axios from 'axios';

const AUTH_TOKEN_KEY = 'qc_token';

// Create an axios instance that points to our server's API proxy
const apiClient = axios.create({
  baseURL: '/api' // This will be proxied to your serverless functions by Vercel
});

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor to handle 401 Unauthorized responses
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

  // Initiates the Google OAuth flow by getting the URL from our backend
  async initGoogleOAuth(redirectUri) {
    try {
      const response = await apiClient.get('/fALBm5Ej/oauth/google/init', {
        params: { redirect_uri: redirectUri }
      });
      return response.data; // Should contain { authUrl: '...' }
    } catch (error) {
      console.error("Error initiating Google OAuth:", error);
      throw error;
    }
  },

  // Continues the OAuth flow by exchanging the code for a token
  async continueGoogleOAuth(code, redirectUri) {
     try {
      const response = await apiClient.get('/fALBm5Ej/oauth/google/continue', {
        params: { code, redirect_uri: redirectUri }
      });
      return response.data; // Should contain { token: '...' }
    } catch (error) {
      console.error("Error continuing Google OAuth:", error);
      throw error;
    }
  }
};

// Export the configured axios instance for other API calls
export default apiClient;