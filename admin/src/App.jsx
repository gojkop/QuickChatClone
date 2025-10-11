import React, { useEffect, useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [flags, setFlags] = useState(null);

  // Check existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMe(data);
        } else {
          setMe(null);
        }
      } catch (e) {
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleSignIn = async () => {
    setError('');
    if (!tokenInput.trim()) {
      setError('Paste a valid Xano JWT token first.');
      return;
    }
    try {
      // Normalize token: strip quotes/backticks and remove whitespace/newlines
      const cleanedToken = tokenInput
        .trim()
        .replace(/^["'`]|["'`]$/g, '')
        .replace(/\s+/g, '');
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanedToken }),
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Sign-in failed (${res.status})`);
      }
      // Session cookie set; fetch /api/me
      const meRes = await fetch('/api/me', { credentials: 'include' });
      if (!meRes.ok) {
        const body = await meRes.json().catch(() => ({}));
        throw new Error(body.error || `Session validation failed (${meRes.status})`);
      }
      const meData = await meRes.json();
      setMe(meData);
      setTokenInput('');
      setError('');
    } catch (e) {
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

  // Authenticated: show simple dashboard shell
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>mindPick</div>
          <div style={{ fontSize: 16, marginTop: 4 }}>
            Admin Dashboard — <span style={{ opacity: 0.85 }}>{me.role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={handleLoadFlags}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #4b5563',
              background: '#111827',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Load Flags
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #b91c1c',
              background: '#7f1d1d',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: 24 }}>
        {error && (
          <div style={{ marginBottom: 12, color: '#fca5a5', fontSize: 12 }}>
            {error}
          </div>
        )}

        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Session</h2>
          <pre style={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: 12, overflowX: 'auto' }}>
{JSON.stringify(me, null, 2)}
          </pre>
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Feature Flags (public)</h2>
          <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
            This reads from /api/flags/public. In production, you&#39;ll add CRUD with RBAC + audit.
          </div>
          <pre style={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: 12, overflowX: 'auto' }}>
{JSON.stringify(flags, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}
