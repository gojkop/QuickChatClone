// client/src/pages/OAuthCallbackPage.jsx  (REPLACE ENTIRE FILE)
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { useAuth } from "../state/auth"; // if you already have your own provider, this will be used

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuthSafe();

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
        const { token, user, ...rest } = await AuthAPI.continueGoogleOAuth({
          code,
          state
        });

        // Persist and update app state
        login(token, user, rest);

        // Redirect to expert area
        navigate("/expert", { replace: true });
      } catch (e) {
        console.error("OAuth continue failed", e);
        navigate("/signin?error=oauth_failed", { replace: true });
      }
    })();
  }, [navigate, login]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}

/** Safe wrapper: uses app's useAuth() if available, otherwise falls back to localStorage */
function useAuthSafe() {
  try {
    const hook = useAuth();
    if (hook && typeof hook.login === "function") return hook;
  } catch {}
  return {
    login: (token, user) => {
      if (token) localStorage.setItem("auth_token", token);
      if (user) localStorage.setItem("me", JSON.stringify(user));
    }
  };
}
