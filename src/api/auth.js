// client/src/api/auth.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: false // we store token in app storage, not cookies
});

export const AuthAPI = {
  async initGoogleOAuth() {
    const redirect_uri = `${window.location.origin}/auth/callback`;
    const r = await api.get("/oauth/google/init", { params: { redirect_uri } });
    // Expected: { authUrl }
    return r.data;
  },

  async continueGoogleOAuth({ code, state }) {
    // IMPORTANT: Xano's continue endpoint doesn't need redirect_uri
    // Only send code (and state if Xano expects it)
    const r = await api.get("/oauth/google/continue", {
      params: { code }
      // Removed: redirect_uri - causes Xano "ERROR_CODE_ACCESS_DENIED"
      // Removed: state - only include if Xano specifically requires it
    });
    // Expected: { token, user, ... }
    return r.data;
  },

  async initLinkedInOAuth() {
    const redirect_uri = `${window.location.origin}/auth/callback`;
    const r = await api.get("/oauth/linkedin/init", { params: { redirect_uri } });
    // Expected: { authUrl }
    return r.data;
  },

  async continueLinkedInOAuth({ code, state }) {
    // IMPORTANT: Xano's continue endpoint doesn't need redirect_uri
    // Only send code (and state if Xano expects it)
    const r = await api.get("/oauth/linkedin/continue", {
      params: { code }
      // Removed: redirect_uri - causes Xano "ERROR_CODE_ACCESS_DENIED"
      // Removed: state - only include if Xano specifically requires it
    });
    // Expected: { token, user, ... }
    return r.data;
  }
};
