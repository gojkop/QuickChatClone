import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeatureFlags from './pages/FeatureFlags.jsx';
import Moderation from './pages/Moderation.jsx';
import Experts from './pages/Experts.jsx';
import Transactions from './pages/Transactions.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [flags, setFlags] = useState(null);

  // Check existing session on load
  const didAuto = useRef(false);

  const didCheck = useRef(false);

  useEffect(() => {
    if (didCheck.current) return;
    didCheck.current = true;
    const checkSession = async () => {
      try {
        // 1) Try existing admin_session
        let res = await fetch('/api/me', { credentials: 'include' });
        console.log('[admin-ui] /api/me (pre) status =', res.status);

        // 2) If not authenticated, auto-exchange qc_session -> admin_session
        if (!res.ok && !didAuto.current) {
          didAuto.current = true;
          console.log('[admin-ui] Attempt auto exchange via POST /api/auth/verify (no body)');
          const v = await fetch('/api/auth/verify', {
            method: 'POST',
            credentials: 'include'
          });
          console.log('[admin-ui] /api/auth/verify (auto) status =', v.status);

          // 3) Retry /api/me after auto exchange
          res = await fetch('/api/me', { credentials: 'include' });
          console.log('[admin-ui] /api/me (post-auto) status =', res.status);
        }

        if (res.ok) {
          const data = await res.json();
          setMe(data);
        } else {
          setMe(null);
        }
      } catch (e) {
        console.error('[admin-ui] checkSession error:', e);
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleSignIn = async () => {
    setError('');
    console.log('[admin-ui] Sign In clicked');
    if (!tokenInput.trim()) {
      setError('Paste a valid Xano JWT token first.');
      return;
    }
    // Normalize token: strip quotes/backticks and remove whitespace/newlines
    const cleanedToken = tokenInput
      .trim()
      .replace(/^["'`]|["'`]$/g, '')
      .replace(/\s+/g, '');

    // Try JSON POST first, then fallback to form-encoded if needed
    try {
      console.log('[admin-ui] POST /api/auth/verify with JSON body');
      let res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanedToken }),
        credentials: 'include'
      });
      console.log('[admin-ui] /api/auth/verify (json) status =', res.status);
      if (!res.ok) {
        // Attempt form-encoded fallback
        console.log('[admin-ui] JSON POST failed, trying form-encoded fallback');
        const formBody = new URLSearchParams({ token: cleanedToken }).toString();
        res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody,
          credentials: 'include'
        });
        console.log('[admin-ui] /api/auth/verify (form) status =', res.status);
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Sign-in failed (${res.status})`);
      }

      console.log('[admin-ui] Fetch /api/me to confirm session');
      const meRes = await fetch('/api/me', { credentials: 'include' });
      console.log('[admin-ui] /api/me status =', meRes.status);
      if (!meRes.ok) {
        const body = await meRes.json().catch(() => ({}));
        throw new Error(body.error || `Session validation failed (${meRes.status})`);
      }
      const meData = await meRes.json();
      setMe(meData);
      setTokenInput('');
      setError('');
    } catch (e) {
      console.error('[admin-ui] Sign in error:', e);
      setError(e.message || 'Sign-in failed');
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setMe(null);
      setFlags(null);
    }
  };

  const handleLoadFlags = async () => {
    setError('');
    try {
      const res = await fetch('/api/flags/public', { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load flags');
      }
      const data = await res.json();
      setFlags(data.flags || []);
    } catch (e) {
      setError(e.message || 'Failed to load flags');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ textAlign: 'center', maxWidth: 760, padding: 24 }}>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>mindPick</div>
          <h1 style={{ fontSize: 28, margin: '10px 0 8px' }}>Loading Admin Console…</h1>
        </div>
      </div>
    );
  }

  // Not authenticated: show token-based sign-in
  if (!me?.ok) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ width: '100%', maxWidth: 720, padding: 24 }}>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>mindPick</div>
          <h1 style={{ fontSize: 36, margin: '12px 0 16px', textAlign: 'center' }}>Admin Sign-In</h1>

          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
              Paste your Xano JWT (qc_token) for the same user you seeded in admin_users, then click “Sign In”.
            </p>
            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste Xano JWT (eyJhbGciOi...)"
              rows={4}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #4b5563',
                background: '#0b1220',
                color: '#e5e7eb',
                fontFamily: 'monospace',
                fontSize: 12
              }}
            />
            {error && (
              <div style={{ marginTop: 8, color: '#fca5a5', fontSize: 12 }}>
                {error}
              </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                onClick={handleSignIn}
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
              <div style={{ fontSize: 12, opacity: 0.7, alignSelf: 'center' }}>
                Tip: Verify your token with curl: curl -i '&lt;XANO_BASE_URL&gt;/auth/me' -H 'Authorization: Bearer &lt;TOKEN&gt;'
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
            Admin app is deployed as a separate project mapped to the <code>admin/</code> subfolder.
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: show shell + routed pages
  return (
    <Layout me={me} onLogout={handleLogout}>
      {error && (
        <div style={{ marginBottom: 12, color: '#fca5a5', fontSize: 12 }}>
          {error}
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feature-flags" element={<FeatureFlags />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
