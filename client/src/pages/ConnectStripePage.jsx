// client/src/pages/ConnectStripePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import apiClient, { authService } from "@/api";

function ConnectStripePage() {
  const [status, setStatus] = useState("Finalizing Sign-In...");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        if (!code) throw new Error("Missing authorization code. Please sign in again.");

        // 1) Exchange code → token at our backend (which talks to Xano)
        const redirectUri = `${window.location.origin}/connect_stripe`;
        const { token, name, email } = await authService.continueGoogleOAuth(code, redirectUri);
        if (!token) throw new Error("OAuth exchange failed (no token).");

        // 2) Persist token in your app (keeps current localStorage model)
        login(token);

        // Clean URL
        window.history.replaceState({}, document.title, location.pathname);

        // 3) Kick off Stripe Connect
        setStatus("Connecting to Stripe...");
        const returnUrl = `${window.location.origin}/set-price-sla`;
        const r = await apiClient.post("/fALBm5Ej/stripe/connect", { return_url: returnUrl });
        const onboardingUrl = r?.data?.onboarding_url;
        if (!onboardingUrl) throw new Error("Could not retrieve Stripe onboarding URL.");

        window.location.assign(onboardingUrl);
      } catch (err) {
        console.error("Stripe Connection Error:", err);
        setError(err.message || "An unknown error occurred.");
        setStatus("Authentication Failed");
      }
    })();
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {error ? (
          <div>
            <h1 className="text-2xl font-bold text-red-800">{status}</h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button onClick={() => navigate("/signin")} className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
              &larr; Go back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <h1 className="mt-6 text-2xl font-bold text-gray-800">{status}</h1>
            <p className="mt-2 text-sm text-gray-600">Please wait while we securely connect your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectStripePage;
