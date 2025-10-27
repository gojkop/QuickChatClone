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
  const [email, setEmail] = React.useState("");
  const [magicLinkSent, setMagicLinkSent] = React.useState(false);
  const [rateLimitError, setRateLimitError] = React.useState(null);

  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
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

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRateLimitError(null);
    setMagicLinkSent(false);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthAPI.sendMagicLink(email);

      if (response.success) {
        setMagicLinkSent(true);
        setEmail(""); // Clear email field
      }
    } catch (e) {
      console.error("Magic link send failed", e);

      if (e.response?.status === 429) {
        // Rate limit exceeded
        const retryAfter = e.response?.data?.retryAfter || 3600;
        const minutesLeft = Math.ceil(retryAfter / 60);
        setRateLimitError({
          message: `Too many requests. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
          retryAfter
        });
      } else if (e.response?.status === 400) {
        setError("Invalid email address. Please check and try again.");
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Unable to send magic link. Please try again or use another sign-in method.");
      }
    } finally {
      setLoading(false);
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
          {/* Simplified Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink mb-3 tracking-tight">
              Start Earning from Your Expertise
            </h1>
            <p className="text-subtext text-base">
              Create your expert page in 5 minutes
            </p>
          </div>

          {/* Sign-In Card */}
          <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            {/* Simplified Account Creation Note */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">New here?</span> Your account is created automatically.
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

              {/* Email Magic Link Form */}
              <form onSubmit={onEmailSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || magicLinkSent}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg transition-all duration-200 border border-primary bg-primary hover:bg-accent hover:border-accent active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3.5 font-semibold text-white"
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm md:text-base">
                    {magicLinkSent ? 'Check your email' : 'Continue with Email'}
                  </span>
                </button>
              </form>
            </div>

            {/* Magic Link Success Message */}
            {magicLinkSent && (
              <div className="flex items-start gap-2 p-3.5 bg-green-50 border border-green-200 rounded-lg mt-4" role="status">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-green-700 leading-relaxed">
                  <p className="font-semibold mb-1">Check your inbox!</p>
                  <p>We've sent you a sign-in link. Click the link in the email to continue.</p>
                  <p className="mt-2 text-xs text-green-600">The link expires in 15 minutes.</p>
                </div>
              </div>
            )}

            {/* Rate Limit Message */}
            {rateLimitError && (
              <div className="flex items-start gap-2 p-3.5 bg-yellow-50 border border-yellow-200 rounded-lg mt-4" role="alert">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-700 leading-relaxed">
                  <p className="font-semibold mb-1">Too many attempts</p>
                  <p>{rateLimitError.message}</p>
                  <p className="mt-2 text-xs text-yellow-600">You can use Google or LinkedIn to sign in immediately.</p>
                </div>
              </div>
            )}

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

            {/* Simplified Terms */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-primary hover:underline">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Condensed What Happens Next - Collapsible */}
          <details className="mt-6 group">
            <summary className="cursor-pointer text-center text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors list-none flex items-center justify-center gap-2">
              <span>What happens after sign-in?</span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            
            <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-gray-700">Set your price & SLA</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-gray-700">Connect Stripe for payouts</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-gray-700">Share your expert link</span>
                </div>
              </div>
              <p className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                ⏱️ Setup takes ~4 minutes
              </p>
            </div>
          </details>

          {/* Minimal Trust Indicators */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span>Secure</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>No card required</span>
            </div>
            <span>•</span>
            <span>Powered by Stripe</span>
          </div>

          {/* Help Link */}
          <div className="text-center mt-6">
            <a 
              href="mailto:support@mindpick.me" 
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need help?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}