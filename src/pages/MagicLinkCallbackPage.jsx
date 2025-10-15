// src/pages/MagicLinkCallbackPage.jsx
import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthAPI } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import logo from "@/assets/images/logo-mindpick.svg";

export default function MagicLinkCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [status, setStatus] = React.useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = React.useState("");
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    console.log('[Magic Link Page] Component mounted');
    console.log('[Magic Link Page] Search params:', searchParams.toString());

    const verifyToken = async () => {
      console.log('[Magic Link Page] verifyToken function called');

      const token = searchParams.get('token');
      console.log('[Magic Link Page] Token from URL:', token);

      if (!token) {
        console.error('[Magic Link Page] No token found in URL');
        setStatus('error');
        setError('Invalid magic link. No token found.');
        return;
      }

      try {
        console.log('[Magic Link] Starting verification for token:', token);
        setStatus('verifying');

        // Call verify endpoint
        console.log('[Magic Link] Calling AuthAPI.verifyMagicLink...');
        const response = await AuthAPI.verifyMagicLink(token);
        console.log('[Magic Link] API response received:', response);

        if (!response.token) {
          console.error('[Magic Link] No auth token in response');
          throw new Error('No authentication token received');
        }

        console.log('[Magic Link] Verification successful, storing token');

        // Store JWT token
        login(response.token);
        console.log('[Magic Link] Token stored via login()');

        // Store user data for display
        setUserData({
          email: response.email,
          name: response.name,
          isNewUser: response.is_new_user
        });
        console.log('[Magic Link] User data set:', response.email);

        setStatus('success');
        console.log('[Magic Link] Status set to success, will redirect in 2 seconds');

        // Redirect after brief success message
        setTimeout(() => {
          console.log('[Magic Link] Redirecting to /expert');
          navigate('/expert', { replace: true });
        }, 2000);

      } catch (e) {
        console.error('[Magic Link] Verification failed - Full error:', e);
        console.error('[Magic Link] Error response:', e.response);
        console.error('[Magic Link] Error status:', e.response?.status);
        console.error('[Magic Link] Error data:', e.response?.data);

        setStatus('error');

        if (e.response?.status === 404) {
          setError('Invalid or expired link. The link may have already been used.');
        } else if (e.response?.status === 410) {
          const errorCode = e.response?.data?.code;
          if (errorCode === 'token_expired') {
            setError('This link has expired. Please request a new sign-in link.');
          } else if (errorCode === 'token_already_used') {
            setError('This link has already been used. Please request a new one.');
          } else {
            setError('This link is no longer valid. Please request a new one.');
          }
        } else if (!navigator.onLine) {
          setError('No internet connection. Please check your network and try again.');
        } else {
          setError('Verification failed. Please try requesting a new sign-in link.');
        }
      }
    };

    console.log('[Magic Link Page] About to call verifyToken()');
    verifyToken();
  }, [searchParams, login, navigate]);

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
          <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-primary rounded-full animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">
                  Verifying your link...
                </h1>
                <p className="text-subtext text-sm">
                  Please wait while we sign you in.
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">
                  {userData?.isNewUser ? 'Welcome to QuickChat!' : 'Welcome back!'}
                </h1>
                <p className="text-subtext text-sm mb-4">
                  Signed in as <span className="font-medium text-ink">{userData?.email}</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Redirecting to your dashboard...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">
                  Verification Failed
                </h1>
                <p className="text-subtext text-sm mb-6">
                  {error}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/signin"
                    className="block w-full px-4 py-3 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-colors text-center"
                  >
                    Request New Sign-In Link
                  </Link>
                  <Link
                    to="/"
                    className="block w-full px-4 py-3 border border-gray-300 text-ink hover:bg-gray-50 font-semibold rounded-lg transition-colors text-center"
                  >
                    Return to Home
                  </Link>
                </div>

                {/* Help Link */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-center text-subtext">
                    Need help?{' '}
                    <a href="mailto:support@mindpick.me" className="text-primary hover:text-accent font-medium underline">
                      Contact Support
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {status === 'error' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Why did this happen?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Magic links expire after 15 minutes</li>
                    <li>Each link can only be used once</li>
                    <li>Some email clients may click links automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
