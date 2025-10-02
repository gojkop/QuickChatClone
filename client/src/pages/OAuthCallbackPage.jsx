// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { authService } from "../api";
import { bootstrapMe } from "../api/me";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const q = new URLSearchParams(location.search);
      const code = q.get("code");
      const state = q.get("state");
      if (!code) return navigate("/signin?error=missing_code", { replace: true });

      try {
        const { token } = await AuthAPI.continueGoogleOAuth({ code, state });
        if (token) authService.saveAuthToken(token);
        await bootstrapMe();     // <— always POST /api/me/bootstrap
        navigate("/expert", { replace: true });
      } catch (e) {
        console.error(e);
        navigate("/signin?error=oauth_failed", { replace: true });
      }
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
