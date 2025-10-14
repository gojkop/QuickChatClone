// client/src/pages/SignInPage.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { authService } from "../api";
import logo from "@/assets/images/logo-mindpick.svg";

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
      localStorage.setItem('oauth_provider', 'google');
      const { authUrl } = await AuthAPI.initGoogleOAuth();
      if (!authUrl) throw new Error("No authUrl returned from init endpoint.");
      window.location.assign(authUrl);
    } catch (e) {
      console.error("Google init failed", e);

      if (e.response?.status === 500) {
        setError("Server error. Please check if Google OAuth is configured correctly in your backend environment variables.");
      } else if (e.response?.status === 404) {
        setError("OAuth endpoint not found. Please contact support.");
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Unable to connect to Google. Please try again or contact support.");
      }

      setLoading(false);
      sessionStorage.removeItem("qc_auth_in_progress");
    }
  };

  const onLinkedInClick = async () => {
    setError("");
    setLoading(true);
    try {
      sessionStorage.setItem("qc_auth_in_progress", "1");
      localStorage.setItem('oauth_provider', 'linkedin');
      const { authUrl } = await AuthAPI.initLinkedInOAuth();
      if (!authUrl) throw new Error("No authUrl returned from LinkedIn init endpoint.");
      window.location.assign(authUrl);
    } catch (e) {
      console.error("LinkedIn init failed", e);

      if (e.response?.status === 500) {
        setError("Server error. Please check if LinkedIn OAuth is configured correctly in your backend environment variables.");
      } else if (e.response?.status === 404) {
        setError("LinkedIn OAuth endpoint not found. Please contact support.");
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Unable to connect to LinkedIn. Please try again or contact support.");
      }

      setLoading(false);
      sessionStorage.removeItem("qc_auth_in_progress");
    }
  };

  const SocialButton = ({ icon, label, onClick, disabled, comingSoon }) => (
    <button
      onClick={onClick}
      disabled={disabled || comingSoon}
      className={`
        w-full inline-flex items-center justify-center gap-3 rounded-lg transition-all duration-200
        ${comingSoon 
          ? 'border border-gray-200 bg-gray-50 cursor-not-allowed' 
          : 'border border-gray-300 bg-white hover:bg-gray-50 hover:border-primary hover:shadow-sm active:scale-[0.99]'
        }
        ${disabled && !comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
        px-4 py-3.5 font-semibold text-gray-900 relative
      `}
    >
      <span className="flex items-center gap-3 flex-1">
        {icon}
        <span className="text-sm md:text-base">{label}</span>
      </span>
      {comingSoon && (
        <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-0.5 rounded-full">
          SOON
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 right-0 px-4 py-4 md:py-6 z-10">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="inline-block">
            <img src={logo} alt="mindPick" className="h-7 md:h-9 w-auto" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-16 md:py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink mb-2 tracking-tight">
              Sign in to mindPick
            </h1>
            <p className="text-subtext text-sm md:text-base">
              Access your expert dashboard
            </p>
          </div>

          {/* Sign-In Card */}
          <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            {/* Account Creation Note */}
            <div className="mb-6 p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg">
              <p className="text-xs md:text-sm text-ink text-center">
                <span className="font-semibold">First time here?</span> Your account will be created automatically.
                <br className="hidden sm:block" />
                <span className="text-subtext">Returning users will be signed in directly.</span>
              </p>
            </div>

            {/* Sign-In Options */}
            <div className="space-y-3">
              <SocialButton
                onClick={onGoogleClick}
                disabled={loading}
                label="Continue with Google"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917Z"/>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.442 15.491 18.846 12 24 12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"/>
                    <path fill="#4CAF50" d="M24 44c5.165 0 10.241-1.959 13.943-5.657l-6.457-5.465C29.414 34.941 26.828 36 24 36c-5.205 0-9.618-3.317-11.281-7.949l-6.53 5.028C9.5 39.546 16.229 44 24 44Z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.002 12.002 0 0 1-23.383-4c0-6.627 5.373-12 12-12 3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.652-.389-3.917Z"/>
                  </svg>
                }
              />

              <SocialButton
                onClick={onLinkedInClick}
                disabled={loading}
                label="Continue with LinkedIn"
                icon={
                  <svg className="h-5 w-5 flex-shrink-0" fill="#0A66C2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                }
              />

              <SocialButton
                comingSoon
                label="Continue with Apple"
                icon={
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                }
              />

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-surface text-subtext">Or</span>
                </div>
              </div>

              <SocialButton
                comingSoon
                label="Continue with Email"
                icon={
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-4 mt-4">
                <div className="w-6 h-6 border-3 border-indigo-200 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-lg mt-4" role="alert">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Terms */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-subtext leading-relaxed">
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-primary hover:text-accent font-medium underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:text-accent font-medium underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Help Link */}
          <div className="text-center mt-6">
            <a 
              href="mailto:support@mindpick.me" 
              className="text-sm text-subtext hover:text-ink transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need help? Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}