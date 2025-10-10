// app/auth/callback/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get code from URL
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check if user denied access
      if (errorParam) {
        setError(errorDescription || 'Authentication was cancelled');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      // Check if code is present
      if (!code) {
        setError('No authorization code received');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      setStatus('Authenticating with LinkedIn...');

      // Call your Vercel API endpoint to complete OAuth
      const response = await fetch(
        `/api/oauth/linkedin/continue?code=${encodeURIComponent(code)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();

      // Check if token was returned
      if (!data.token) {
        throw new Error('No authentication token received');
      }

      setStatus('Success! Redirecting...');

      // Store auth token
      localStorage.setItem('authToken', data.token);

      // Store user info if available
      if (data.email) {
        localStorage.setItem('userEmail', data.email);
      }
      if (data.name) {
        localStorage.setItem('userName', data.name);
      }

      // Redirect to expert page after short delay
      setTimeout(() => {
        router.push('/expert');
      }, 500);

    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {/* Logo or Brand */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">mindPick</h1>
          </div>

          {/* Loading Spinner or Error */}
          {!error ? (
            <div>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-700 font-medium">{status}</p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we complete your sign in...
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-2">Authentication Failed</p>
              <p className="text-gray-600 text-sm">{error}</p>
              <p className="text-gray-500 text-xs mt-4">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}