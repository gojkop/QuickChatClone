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
    const redirect_uri = `${window.location.origin}/auth/callback`;
    const r = await api.get("/oauth/google/continue", {
      params: { code, state, redirect_uri }
    });
    // Expected: { token, user, ... }
    return r.data;
  }
};
