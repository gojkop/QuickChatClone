// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient, { authService } from "../api";
import { useAuth } from "@/context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        if (token) {
          authService.saveAuthToken(token);
          login(token); // ✅ Update AuthContext immediately
        }

        try {
          await apiClient.post("/me/bootstrap");
        } catch (_) {} // ignore expected domain errors
      } catch (e) {
        console.error("OAuth error:", e);
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=oauth_failed", { replace: true });
        return;
      }

      sessionStorage.removeItem("qc_auth_in_progress");
      navigate("/expert", { replace: true });
    })();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Finalizing sign-in…</p>
      </div>
    </div>
  );
}