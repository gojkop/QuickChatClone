// client/src/api/index.js
import axios from "axios";

// 1) Define a single axios instance for your app
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 2) Export it (default) so other files can import apiClient
export default apiClient;

// 3) Use the same instance inside authService
export const authService = {
  // INIT via GET (no args)
  async initGoogleOAuth() {
    const { data } = await apiClient.get("/oauth/google/init");
    return data; // { authUrl }
  },

  // CONTINUE via GET (?code=...)
  async continueGoogleOAuth(code) {
    const { data } = await apiClient.get("/oauth/google/continue", {
      params: { code },
    });
    return data; // { token, name, email }
  },

  // (keep your other token helpers here if you had them)
};
