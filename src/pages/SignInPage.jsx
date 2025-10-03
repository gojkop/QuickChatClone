// client/src/pages/SignInPage.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { authService } from "../api";
import logo from "@/assets/images/logo-quickchat.png";

export default function SignInPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/expert", { replace: true });
    }
  }, [navigate]);

  const onGoogleClick = async () => {
    setError("");
    setLoading(true);
    try {
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

  const onLinkedInClick = () => {
    setError("");
    alert("LinkedIn sign-in coming soon! For now, please use Google.");
  };

  const SocialButton = ({ icon, label, onClick, disabled, comingSoon }) => (
    <button
      onClick={onClick}
      disabled={disabled || comingSoon}
      className={`
        w-full inline-flex items-center justify-center gap-3 rounded-xl border-2 transition-all duration-200
        ${comingSoon 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-indigo-400 hover:shadow-md active:scale-[0.98]'
        }
        ${disabled && !comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
        px-6 py-4 font-semibold text-gray-900 shadow-sm relative
      `}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {comingSoon && (
        <span className="absolute top-1 right-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
          SOON
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 right-0 px-4 py-6 md:px-8 z-10">
        <div className="container mx-auto max-w-6xl">
          <Link to="/">
            <img src={logo} alt="QuickChat" className="h-8 md:h-10 w-auto" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-20 pt-32">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Sign in to QuickChat
            </h1>
            <p className="text-gray-600">
              Access your expert dashboard
            </p>
          </div>

          {/* Sign-In Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
            {/* Primary Sign-In Options */}
            <div className="space-y-3">
              <SocialButton
                onClick={onGoogleClick}
                disabled={loading}
                label={loading ? "Opening Google..." : "Continue with Google"}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6 flex-shrink-0" aria-hidden="true">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917Z"/>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.442 15.491 18.846 12 24 12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"/>
                    <path fill="#4CAF50" d="M24 44c5.165 0 10.241-1.959 13.943-5.657l-6.457-5.465C29.414 34.941 26.828 36 24 36c-5.205 0-9.618-3.317-11.281-7.949l-6.53 5.028C9.5 39.546 16.229 44 24 44Z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.002 12.002 0 0 1-23.383-4c0-6.627 5.373-12 12-12 3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.652-.389-3.917Z"/>
                  </svg>
                }
              />

              <SocialButton
                onClick={onLinkedInClick}
                comingSoon={true}
                label="Continue with LinkedIn"
                icon={
                  <svg className="h-6 w-6 flex-shrink-0" fill="#0A66C2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                }
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-center text-gray-500 pt-4 border-t border-gray-100">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600">
              New to QuickChat?{' '}
              <a href="/become-expert" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Become an expert
              </a>
            </p>
            <p className="text-sm text-gray-600">
              Have a question?{' '}
              <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Ask an expert
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}