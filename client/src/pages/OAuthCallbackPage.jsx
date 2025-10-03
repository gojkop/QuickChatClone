// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient, { authService } from "../api";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const ranRef = useRef(false); // run-once guard

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code) {
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=missing_code", { replace: true });
        return;
      }

      try {
        // 1) code -> token
        const { token } = await AuthAPI.continueGoogleOAuth({ code, state });
        if (token) authService.saveAuthToken(token);

        // 2) bootstrap (POST)
        try {
          await apiClient.post("/me/bootstrap");
        } catch (err) {
          // ignore expected domain errors (409 etc.)
          // console.warn("bootstrap issue:", err);
        }
      } catch (e) {
        console.error("OAuth continue failed", e);
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=oauth_failed", { replace: true });
        return;
      }

      // 3) done
      sessionStorage.removeItem("qc_auth_in_progress");
      navigate("/expert", { replace: true });
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
