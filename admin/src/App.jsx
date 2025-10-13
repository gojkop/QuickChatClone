// admin/src/App.jsx - Improved with better error handling and auto-login

import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useToast } from './components/Toast';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeatureFlags from './pages/FeatureFlags.jsx';
import FeedbackDashboard from './pages/FeedbackDashboard.jsx';
import Moderation from './pages/Moderation.jsx';
import Experts from './pages/Experts.jsx';
import Transactions from './pages/Transactions.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);
  const [manualLoginMode, setManualLoginMode] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  const didCheck = useRef(false);
  const didAutoLogin = useRef(false);

  // ========================================================================
  // AUTO-LOGIN ON MOUNT
  // ========================================================================
  useEffect(() => {
    if (didCheck.current) return;
    didCheck.current = true;
    
    checkSession();
  }, []);

  async function checkSession() {
    console.log('[admin-ui] Starting authentication check...');
    
    try {
      // Step 1: Check existing admin_session
      console.log('[admin-ui] Step 1: Checking for existing admin session...');
      let res = await fetch('/api/me', { credentials: 'include' });
      console.log('[admin-ui] /api/me (existing session) status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('[admin-ui] Already logged in as:', data.role);
        setMe(data);
        toast.success(`Welcome back, ${data.role.replace('_', ' ')}!`, 3000);
        setLoading(false);
        return;
      }

      // Step 2: Try auto-login with qc_session cookie
      if (!didAutoLogin.current) {
        didAutoLogin.current = true;
        console.log('[admin-ui] Step 2: Attempting auto-login from main app...');
        
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          credentials: 'include'
        });
        
        console.log('[admin-ui] /api/auth/verify (auto) status:', verifyRes.status);

        if (verifyRes.ok) {
          // Auto-login successful, check session again
          console.log('[admin-ui] Auto-login successful, verifying session...');
          res = await fetch('/api/me', { credentials: 'include' });
          
          if (res.ok) {
            const data = await res.json();
            console.log('[admin-ui] Auto-login complete:', data.role);
            setMe(data);
            toast.success(`Logged in as ${data.role.replace('_', ' ')}`, 3000);
            setLoading(false);
            return;
          }
        } else {
          // Log detailed error for debugging
          const errorData = await verifyRes.json().catch(() => ({}));
          console.error('[admin-ui] Auto-login failed:', {
            status: verifyRes.status,
            error: errorData
          });
          
          setError({
            title: 'Auto-login failed',
            message: errorData.error || 'Could not authenticate automatically',
            hint: errorData.hint || 'You may need to log in to the main app first',
            details: errorData
          });
        }
      }

      // Step 3: Auto-login failed, show manual login
      console.log('[admin-ui] Auto-login not available, showing manual login');
      setMe(null);
      setLoading(false);
      
    } catch (e) {
      console.error('[admin-ui] Authentication check error:', e);
      setError({
        title: 'Connection error',
        message: e.message || 'Failed to connect to authentication server',
        hint: 'Check your internet connection and try again'
      });
      toast.error('Authentication check failed', 4000);
      setMe(null);
      setLoading(false);
    }
  }

  // ========================================================================
  // MANUAL LOGIN (FALLBACK)
  // ========================================================================
  const handleManualLogin = async () => {
    console.log('[admin-ui] Manual login attempt');
    
    if (!tokenInput.trim()) {
      toast.warning('Please paste a valid token');
      return;
    }
    
    const cleanedToken = tokenInput
      .trim()
      .replace(/^["'`]|["'`]$/g, '')
      .replace(/\s+/g, '');

    const loadingId = toast.info('Signing in...', 0);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanedToken }),
        credentials: 'include'
      });
      
      console.log('[admin-ui] Manual login status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed (${res.status})`);
      }

      const meRes = await fetch('/api/me', { credentials: 'include' });
      
      if (!meRes.ok) {
        throw new Error('Session validation failed');
      }
      
      const meData = await meRes.json();
      
      toast.dismiss(loadingId);
      toast.success(`Welcome! Signed in as ${meData.role.replace('_', ' ')}`);
      
      setMe(meData);
      setTokenInput('');
      setError(null);
      setManualLoginMode(false);
    } catch (e) {
      console.error('[admin-ui] Manual login error:', e);
      toast.dismiss(loadingId);
      toast.error(e.message || 'Sign-in failed. Please check your token.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      toast.info('Logged out successfully');
    } catch (e) {
      toast.error('Logout failed');
    } finally {
      setMe(null);
      setError(null);
      didAutoLogin.current = false;
    }
  };

  const handleRetryAutoLogin = () => {
    didAutoLogin.current = false;
    setError(null);
    setLoading(true);
    checkSession();
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ textAlign: 'center', maxWidth: 760, padding: 24 }}>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>mindPick</div>
          <h1 style={{ fontSize: 28, margin: '10px 0 8px' }}>Loading Admin Console…</h1>
          <div style={{ marginTop: 20 }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // NOT AUTHENTICATED - SHOW LOGIN OPTIONS
  // ========================================================================
  if (!me?.ok) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ width: '100%', maxWidth: 720, padding: 24 }}>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>mindPick</div>
          <h1 style={{ fontSize: 36, margin: '12px 0 16px', textAlign: 'center' }}>Admin Console</h1>

          {/* Error Display */}
          {error && (
            <div style={{ background: '#ef4444', border: '1px solid #dc2626', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{error.title}</h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{error.message}</p>
              {error.hint && (
                <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>💡 {error.hint}</p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleRetryAutoLogin}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #fff',
                    background: 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Retry Auto-Login
                </button>
                <button
                  onClick={() => setManualLoginMode(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #fff',
                    background: '#fff',
                    color: '#ef4444',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Enter Token Manually
                </button>
              </div>
            </div>
          )}

          {/* Login Instructions */}
          {!manualLoginMode && !error && (
            <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>✨ Automatic Login</h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
                The admin console will automatically log you in if you're signed in to the main app.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href="https://www.mindpick.me"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                    color: '#fff',
                    fontWeight: 700,
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                >
                  🔗 Go to Main App & Sign In
                </a>
                <button
                  onClick={() => setManualLoginMode(true)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #4b5563',
                    background: 'transparent',
                    color: '#e5e7eb',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  Or enter token manually →
                </button>
              </div>
            </div>
          )}

          {/* Manual Login Form */}
          {manualLoginMode && (
            <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🔑 Manual Login</h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
                Paste your authentication token from the main app.
              </p>
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your token here (eyJhbGciOi...)"
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #4b5563',
                  background: '#0b1220',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  marginBottom: 12
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleManualLogin}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #2563eb',
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setManualLoginMode(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #4b5563',
                    background: 'transparent',
                    color: '#e5e7eb',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================================
  // AUTHENTICATED - SHOW ADMIN INTERFACE
  // ========================================================================
  return (
    <Layout me={me} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feature-flags" element={<FeatureFlags />} />
        <Route path="/feedback" element={<FeedbackDashboard />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}