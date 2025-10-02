// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient from "../api";         // default export from api/index.js
import { authService } from "../api";   // saves qc_token

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code) {
        navigate("/signin?error=missing_code", { replace: true });
        return;
      }

      try {
        // 1) Exchange code -> token
        const { token } = await AuthAPI.continueGoogleOAuth({ code, state });
        if (token) authService.saveAuthToken(token); // stores 'qc_token'

        // 2) Ensure default expert profile exists (POST)
        try {
          await apiClient.post("/me/bootstrap"); // auth via Bearer qc_token
        } catch (err) {
          // If Xano returns a benign conflict like HANDLE_TAKEN, ignore:
          if (!(err?.response && [400, 401, 403, 404, 409].includes(err.response.status))) {
            console.warn("bootstrap warning:", err);
          }
        }

        // 3) Proceed to expert area
        navigate("/expert", { replace: true });
      } catch (e) {
        console.error("OAuth continue failed", e);
        navigate("/signin?error=oauth_failed", { replace: true });
      }
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
