// client/src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "../api/index.js";

function OAuthCallbackPage() {
  const [status, setStatus] = useState("Completing sign-in...");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        
        if (!code) {
          throw new Error("Missing authorization code. Please sign in again.");
        }

        // Exchange code for token
        const { token, name, email } = await authService.continueGoogleOAuth(code);
        
        if (!token) {
          throw new Error("OAuth exchange failed. No token received.");
        }

        // Save token and update auth state
        login(token);

        // Clean URL
        window.history.replaceState({}, document.title, location.pathname);

        // Redirect to dashboard
        setStatus("Success! Redirecting to dashboard...");
        setTimeout(() => {
          navigate('/expert');
        }, 500);

      } catch (err) {
        console.error("OAuth Error:", err);
        setError(err.message || "An error occurred during sign-in.");
        setStatus("Sign-in Failed");
      }
    })();
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {error ? (
          <div>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{status}</h1>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate("/signin")} 
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900">{status}</h1>
            <p className="mt-2 text-sm text-gray-600">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OAuthCallbackPage;