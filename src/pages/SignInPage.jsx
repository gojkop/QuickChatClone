// src/pages/SignInPage.jsx
// Updated to store OAuth provider info

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SignInPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({ google: false, linkedin: false });

  const handleGoogleSignIn = async () => {
    try {
      setLoading({ ...loading, google: true });
      
      console.log('Starting Google OAuth...');
      
      // Store provider in localStorage so callback knows which one to use
      localStorage.setItem('oauth_provider', 'google');
      
      // Get authorization URL from your API
      const response = await fetch('/api/oauth/google/init');
      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('No auth URL received');
      }
      
      console.log('Redirecting to Google:', data.authUrl);
      
      // Redirect to Google
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoading({ ...loading, google: false });
      alert('Failed to start Google sign-in. Please try again.');
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setLoading({ ...loading, linkedin: true });
      
      console.log('Starting LinkedIn OAuth...');
      
      // Store provider in localStorage so callback knows which one to use
      localStorage.setItem('oauth_provider', 'linkedin');
      
      // Get authorization URL from your API
      const response = await fetch('/api/oauth/linkedin/init');
      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('No auth URL received');
      }
      
      console.log('Redirecting to LinkedIn:', data.authUrl);
      
      // Redirect to LinkedIn
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('LinkedIn sign-in error:', error);
      setLoading({ ...loading, linkedin: false });
      alert('Failed to start LinkedIn sign-in. Please try again.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Sign In to MindPick
        </h1>
        
        <button
          onClick={handleLinkedInSignIn}
          disabled={loading.linkedin}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px',
            background: '#0077b5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading.linkedin ? 'not-allowed' : 'pointer',
            opacity: loading.linkedin ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {loading.linkedin ? '...' : '🔗'} 
          {loading.linkedin ? 'Connecting...' : 'Continue with LinkedIn'}
        </button>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading.google}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading.google ? 'not-allowed' : 'pointer',
            opacity: loading.google ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {loading.google ? '...' : '🔵'}
          {loading.google ? 'Connecting...' : 'Continue with Google'}
        </button>

        <p style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          color: '#666', 
          textAlign: 'center' 
        }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
