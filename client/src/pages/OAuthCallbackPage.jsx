// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { authService } from "../api";

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
        const { token } = await AuthAPI.continueGoogleOAuth({ code, state });
        if (token) authService.saveAuthToken(token); // saves under qc_token
        navigate("/expert", { replace: true });
      } catch (e) {
        console.error("OAuth continue failed", e);
        navigate("/signin?error=oauth_failed", { replace: true });
      }
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
