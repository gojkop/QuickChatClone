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
        
        if (oauthResponse.token) {
          authService.saveAuthToken(oauthResponse.token);
          console.log('💾 Token saved to localStorage');
        }

        console.log('📡 Calling /me/bootstrap...');
        try {
          const bootstrapResponse = await apiClient.post("/me/bootstrap");
          console.log('✅ Bootstrap response:', bootstrapResponse.data);
          console.log('📊 Expert profile created/updated:', {
            id: bootstrapResponse.data.expert_profile?.id,
            user_id: bootstrapResponse.data.expert_profile?.user_id,
            handle: bootstrapResponse.data.expert_profile?.handle,
            status: bootstrapResponse.data.expert_profile?.status
          });
          console.log('👤 User data:', {
            id: bootstrapResponse.data.user?.id,
            name: bootstrapResponse.data.user?.name,
            email: bootstrapResponse.data.user?.email
          });
        } catch (bootstrapError) {
          console.warn('⚠️ Bootstrap error (might be expected):', {
            status: bootstrapError.response?.status,
            message: bootstrapError.response?.data?.message,
            fullError: bootstrapError.response?.data
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
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}