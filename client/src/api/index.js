// client/src/api/index.js
import axios from "axios";

const AUTH_TOKEN_KEY = "qc_token";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 👇 tweak this block
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const inProgress = sessionStorage.getItem("qc_auth_in_progress") === "1";
    const onCallback =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/auth/callback");

    if (status === 401 && !inProgress && !onCallback) {
      authService.logout(); // your existing redirect to /signin
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
    if (!window.location.pathname.endsWith("/signin")) {
      window.location.href = "/signin";
    }
  },
};

export default apiClient;
