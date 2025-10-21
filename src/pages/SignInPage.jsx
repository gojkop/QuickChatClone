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
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            {/* Quick Setup Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                  bg-indigo-50 border border-indigo-200 text-sm font-semibold text-indigo-700 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>5-minute setup • No credit card required</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-ink mb-3 tracking-tight">
              Start Earning from Your Expertise
            </h1>
            <p className="text-subtext text-base md:text-lg mb-6">
              Create your expert page and start monetizing questions today
            </p>
            
            {/* Micro-Benefits */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Set your own price</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>No meetings needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Get paid instantly</span>
              </div>
            </div>
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

          {/* What Happens Next Section */}
          <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-center">What happens after you sign in?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                <div>
                  <div className="font-semibold text-gray-900">Set your price & availability</div>
                  <div className="text-gray-600">Choose how much you charge and when you'll respond</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                <div>
                  <div className="font-semibold text-gray-900">Connect Stripe for payouts</div>
                  <div className="text-gray-600">Secure payment processing, direct to your bank</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                <div>
                  <div className="font-semibold text-gray-900">Share your unique link</div>
                  <div className="text-gray-600">Add to your bio, email signature, or anywhere you like</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              ⏱️ Average setup time: <span className="font-semibold text-gray-700">4 minutes</span>
            </div>
          </div>
          
          {/* Trust Indicators */}
<div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
  <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-600">
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
      </svg>
      <span>Bank-level security</span>
    </div>
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span>Trusted by 500+ experts</span>
    </div>
    <div className="flex items-center gap-1.5">
      <svg className="h-3" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#6772E5"/>
      </svg>
      <span>Powered by Stripe</span>
    </div>
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