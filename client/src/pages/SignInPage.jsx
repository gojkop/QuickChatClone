// client/src/pages/SignInPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { authService } from "../api";
import logo from "@/assets/images/logo-quickchat.png";

export default function SignInPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // ⬇️ If token already present, skip this page
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/expert", { replace: true });
    }
  }, [navigate]);

  const onGoogleClick = async () => {
    setError("");
    setLoading(true);
    try {
      // prevent guards/interceptors from redirecting mid-flow
      sessionStorage.setItem("qc_auth_in_progress", "1");

      const { authUrl } = await AuthAPI.initGoogleOAuth();
      if (!authUrl) throw new Error("No authUrl returned from init endpoint.");
      window.location.assign(authUrl);
    } catch (e) {
      console.error("Google init failed", e);
      setError("Sign-in init failed. Please try again.");
      setLoading(false);
      sessionStorage.removeItem("qc_auth_in_progress");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <img src={logo} alt="QuickChat" className="h-10 w-auto mb-2" />
        <h1 className="text-2xl font-bold text-gray-900">Expert Sign In</h1>
        <p className="text-sm text-gray-600">Monetize every "quick question".</p>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
          <button
            onClick={onGoogleClick}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition px-4 py-3"
          >
            <span className="font-medium">
              {loading ? "Opening Google…" : "Continue with Google"}
            </span>
          </button>

          {loading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-red-600 mt-4 text-sm" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
