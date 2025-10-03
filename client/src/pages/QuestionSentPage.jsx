// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient, { authService } from "../api";
import { useAuth } from "@/context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // update context immediately
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
        // 1) code -> token via OAuth group
        const { token } = await AuthAPI.continueGoogleOAuth({ code, state });
        if (token) {
          authService.saveAuthToken(token);
          login(token); // make Navbar / useAuth see it instantly
        }

        // 2) bootstrap (direct to api:3B14WLbJ, bearer only, no cookies)
        try {
          await apiClient.post("/me/bootstrap");
        } catch (e) {
          // ignore benign domain errors like handle taken, etc.
        }
      } catch (e) {
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=oauth_failed", { replace: true });
        return;
      }

      sessionStorage.removeItem("qc_auth_in_progress");
      navigate("/expert", { replace: true });
    })();
  }, [navigate, login]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
