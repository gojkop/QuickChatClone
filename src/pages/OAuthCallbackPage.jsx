// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import apiClient from "../api";
import { useAuth } from "@/context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      console.log('=== OAUTH CALLBACK STARTED ===');
      const q = new URLSearchParams(location.search);
      const code = q.get("code");
      const state = q.get("state");
      const error = q.get("error");
      const errorDescription = q.get("error_description");
      
      console.log('OAuth params:', { 
        code: code?.substring(0, 20) + '...', 
        state,
        error,
        errorDescription 
      });

      // Check for OAuth error from provider
      if (error) {
        console.error('❌ OAuth provider returned error:', error, errorDescription);
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate(`/signin?error=${error}`, { replace: true });
        return;
      }

      if (!code) {
        console.error('❌ No OAuth code found');
        sessionStorage.removeItem("qc_auth_in_progress");
        navigate("/signin?error=missing_code", { replace: true });
        return;
      }

      try {
        console.log('📡 Calling OAuth continue endpoint...');

        // ⭐ DETECT WHICH PROVIDER TO USE
        const provider = localStorage.getItem('oauth_provider') || 'linkedin';
        localStorage.removeItem('oauth_provider'); // Clean up
        
        console.log(`🔍 Detected provider: ${provider}`);

        let oauthResponse;
        let providerUsed = '';

        // ⭐ CALL THE CORRECT ENDPOINT BASED ON PROVIDER
        if (provider === 'linkedin') {
          try {
            console.log('📡 Trying LinkedIn OAuth continue...');
            oauthResponse = await AuthAPI.continueLinkedInOAuth({ code, state });
            providerUsed = 'LinkedIn';
            console.log('✅ LinkedIn OAuth response received');
          } catch (linkedInError) {
            console.error('❌ LinkedIn OAuth failed:', linkedInError);
            // If LinkedIn fails, try Google as fallback
            console.log('⚠️ Falling back to Google OAuth...');
            try {
              oauthResponse = await AuthAPI.continueGoogleOAuth({ code, state });
              providerUsed = 'Google';
              console.log('✅ Google OAuth response received (fallback)');
            } catch (googleError) {
              console.error('❌ Google OAuth also failed:', googleError);
              throw linkedInError; // Throw original error
            }
          }
        } else {
          // provider === 'google'
          try {
            console.log('📡 Trying Google OAuth continue...');
            oauthResponse = await AuthAPI.continueGoogleOAuth({ code, state });
            providerUsed = 'Google';
            console.log('✅ Google OAuth response received');
          } catch (googleError) {
            console.error('❌ Google OAuth failed:', googleError);
            // Try LinkedIn as fallback
            console.log('⚠️ Falling back to LinkedIn OAuth...');
            try {
              oauthResponse = await AuthAPI.continueLinkedInOAuth({ code, state });
              providerUsed = 'LinkedIn';
              console.log('✅ LinkedIn OAuth response received (fallback)');
            } catch (linkedInError) {
              console.error('❌ LinkedIn OAuth also failed:', linkedInError);
              throw googleError; // Throw original error
            }
          }
        }

        console.log(`${providerUsed} OAuth response received:`, {
          hasToken: !!oauthResponse.token,
          tokenPreview: oauthResponse.token?.substring(0, 30) + '...'
        });
        
        // ✅ Use login() to update both localStorage AND context
        if (oauthResponse.token) {
          login(oauthResponse.token);
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
  }, [navigate, login]);

  return <div style={{ padding: 24 }}>Finalizing sign-in…</div>;
}
