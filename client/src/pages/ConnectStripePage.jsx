import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api';

function ConnectStripePage() {
  const [status, setStatus] = useState('Finalizing Sign-In...');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processStripeConnection = async () => {
      try {
        // Step 1: Get the token from the URL query params
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('Authentication token not found. Please sign in again.');
        }

        // Step 2: Log the user in with the new token
        login(token);

        // Clean the URL to remove the token
        window.history.replaceState({}, document.title, location.pathname);

        // Step 3: Automatically initiate the Stripe connection
        setStatus('Connecting to Stripe...');
        
        // Define the return URL for after Stripe onboarding is complete
        const returnUrl = `${window.location.origin}/set-price-sla`;

        const response = await apiClient.post('/fALBm5Ej/stripe/connect', {
          return_url: returnUrl
        });

        // Step 4: Redirect to the Stripe onboarding URL
        if (response.data && response.data.onboarding_url) {
          window.location.assign(response.data.onboarding_url);
        } else {
          throw new Error('Could not retrieve Stripe onboarding URL.');
        }

      } catch (err) {
        console.error('Stripe Connection Error:', err);
        setError(err.message || 'An unknown error occurred.');
        setStatus('Authentication Failed');
      }
    };

    processStripeConnection();
  }, [location, login, navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {error ? (
          <div>
            <h1 className="text-2xl font-bold text-red-800">{status}</h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button onClick={() => navigate('/signin')} className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
              &larr; Go back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-auto text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h1 className="mt-6 text-2xl font-bold text-gray-800">{status}</h1>
            <p className="mt-2 text-sm text-gray-600">Please wait while we securely connect your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectStripePage;