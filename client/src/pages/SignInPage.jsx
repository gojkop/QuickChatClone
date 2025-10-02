// client/src/pages/SignInPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '../api/index.js';
import logo from '@/assets/images/logo-quickchat.png';

function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (isAuthenticated && !params.has('force')) {
      navigate('/expert');
    }
  }, [isAuthenticated, navigate, location.search]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { authUrl } = await authService.initGoogleOAuth();

      if (authUrl) {
        window.location.assign(authUrl);
      } else {
        throw new Error('Could not get authentication URL.');
      }
    } catch (e) {
      console.error('Google Sign-In Error:', e);
      setError('Could not start Google sign-in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-28">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="p-8 text-center">
            <img src={logo} className="h-14 mx-auto mb-4" alt="QuickChat" />
            <h1 className="text-2xl font-bold text-gray-900">Expert Sign In</h1>
            <p className="text-sm text-gray-500 mt-1">Monetize every "quick question".</p>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white font-semibold px-4 py-3 hover:bg-indigo-700 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.8 10.23h-9.55v3.54h5.46c-.24 1.37-1.48 4.02-5.46 4.02c-3.29 0-5.98-2.72-5.98-6.08s2.69-6.08 5.98-6.08c1.87 0 3.12.8 3.84 1.49l2.61-2.52C17.31 2.87 15.02 2 12.25 2C6.9 2 2.5 6.42 2.5 11.71S6.9 21.42 12.25 21.42c7.12 0 9.25-4.97 9.25-7.6c0-.51-.05-1-.12-1.59Z" />
              </svg>
              {isLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-6 text-xs text-gray-400">By continuing you agree to the Terms and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;