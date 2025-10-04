// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient from "../api";
import { useAuth } from "@/context/AuthContext";  // ✅ Import useAuth

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();  // ✅ Get login function from context
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      console.log('=== OAUTH CALLBACK STARTED ===');
      const q = new URLSearchParams(location.search);
      const code = q.get("code");
      const state = q.get("state");
      
      console.log('OAuth params:', { code: code?.substring(0, 20) + '...', state });

      if (!code) {
        console.error('❌ No OAuth code found');
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=missing_code", { replace: true });
        return;
      }

      try {
        console.log('📡 Calling OAuth continue endpoint...');
        const oauthResponse = await AuthAPI.continueGoogleOAuth({ code, state });
        console.log('✅ OAuth response received:', {
          hasToken: !!oauthResponse.token,
          tokenPreview: oauthResponse.token?.substring(0, 30) + '...'
        });
        
        // ✅ Use login() to update both localStorage AND context
        if (oauthResponse.token) {
          login(oauthResponse.token);  // ✅ This updates the context!
          console.log('💾 Token saved and context updated');
        }

        console.log('📡 Calling /me/bootstrap...');
        try {
          const bootstrapResponse = await apiClient.post("/me/bootstrap");
          console.log('✅ Bootstrap response:', bootstrapResponse.data);
        } catch (bootstrapError) {
          console.warn('⚠️ Bootstrap error (might be expected):', {
            status: bootstrapError.response?.status,
            message: bootstrapError.response?.data?.message
          });
        }
      } catch (e) {
        console.error('❌ OAuth flow failed:', {
          message: e.message,
          response: e.response?.data,
          status: e.response?.status
        });
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=oauth_failed", { replace: true });
        return;
      }

      console.log('✅ OAuth flow complete, redirecting to /expert');
      sessionStorage.removeItem("qc_auth_in_progress");
      navigate("/expert", { replace: true });
    })();
  }, [navigate, login]);  // ✅ Add login to dependencies

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}