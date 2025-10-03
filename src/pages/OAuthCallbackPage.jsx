// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient, { authService } from "../api";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      const q = new URLSearchParams(location.search);
      const code = q.get("code");
      const state = q.get("state");

      if (!code) {
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=missing_code", { replace: true });
        return;
      }

      try {
        const { token } = await AuthAPI.continueGoogleOAuth({ code, state });
        if (token) authService.saveAuthToken(token);

        try {
          await apiClient.post("/me/bootstrap");
        } catch (_) {} // ignore expected domain errors
      } catch (e) {
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=oauth_failed", { replace: true });
        return;
      }

      sessionStorage.removeItem("qc_auth_in_progress");
      navigate("/expert", { replace: true });
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
