// admin/src/App.jsx - Optimized version with auth caching
import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './components/Toast';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeatureFlags from './pages/FeatureFlags.jsx';
import FeedbackDashboard from './pages/FeedbackDashboard.jsx';
import Moderation from './pages/Moderation.jsx';
import Experts from './pages/Experts.jsx';
import Transactions from './pages/Transactions.jsx';
import Settings from './pages/Settings.jsx';

// ============================================================================
// AUTH CACHE - Persist auth state across navigations
// ============================================================================
const AUTH_CACHE_KEY = 'admin_auth_cache';
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const AuthCache = {
  get() {
    try {
      const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      // Return cached data if less than 5 minutes old
      if (age < AUTH_CACHE_TTL) {
        console.log('[auth-cache] Using cached auth (age:', Math.floor(age/1000), 'seconds)');
        return data;
      }
      
      console.log('[auth-cache] Cache expired');
      return null;
    } catch (e) {
      return null;
    }
  },
  
  set(data) {
    try {
      sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      console.log('[auth-cache] Cached auth state');
    } catch (e) {
      console.error('[auth-cache] Failed to cache:', e);
    }
  },
  
  clear() {
    sessionStorage.removeItem(AUTH_CACHE_KEY);
    console.log('[auth-cache] Cleared cache');
  }
};

// ============================================================================
// AUTH CONTEXT - Share auth state across components
// ============================================================================
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);
  const [manualLoginMode, setManualLoginMode] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  const didInitialCheck = useRef(false);
  const checkInProgress = useRef(false);

  // ========================================================================
  // OPTIMIZED AUTH CHECK - Only runs once on mount
  // ========================================================================
  useEffect(() => {
    // Prevent multiple simultaneous checks
    if (didInitialCheck.current || checkInProgress.current) {
      console.log('[auth] Skipping check (already done or in progress)');
      return;
    }
    
    didInitialCheck.current = true;
    checkInProgress.current = true;
    
    checkAuthWithCache();
  }, []); // Empty deps - only run on mount

  async function checkAuthWithCache() {
    console.log('[auth] Starting optimized auth check...');
    
    // Step 1: Try cache first (instant)
    const cached = AuthCache.get();
    if (cached) {
      console.log('[auth] ✅ Loaded from cache (instant)');
      setMe(cached);
      setLoading(false);
      
      // Revalidate in background (don't block UI)
      revalidateAuthInBackground();
      return;
    }
    
    // Step 2: No cache, do full check
    try {
      console.log('[auth] Cache miss, checking /api/me...');
      const res = await fetch('/api/me', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        console.log('[auth] ✅ Authenticated as:', data.role);
        
        setMe(data);
        AuthCache.set(data); // Cache for next time
        toast.success(`Welcome back, ${data.role.replace('_', ' ')}!`, 3000);
        setLoading(false);
        return;
      }

      // Step 3: No session, try auto-login from main app
      console.log('[auth] No session, attempting auto-login...');
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (verifyRes.ok) {
        // Auto-login successful, check session again
        const meRes = await fetch('/api/me', { credentials: 'include' });
        
        if (meRes.ok) {
          const data = await meRes.json();
          console.log('[auth] ✅ Auto-login successful:', data.role);
          
          setMe(data);
          AuthCache.set(data);
          toast.success(`Logged in as ${data.role.replace('_', ' ')}`, 3000);
          setLoading(false);
          return;
        }
      }

      // Step 4: Auth failed, show login
      console.log('[auth] Authentication failed');
      setError({
        title: 'Authentication required',
        message: 'Please log in to the main app first',
        hint: 'Visit www.mindpick.me and sign in, then return here'
      });
      setMe(null);
      setLoading(false);
      
    } catch (e) {
      console.error('[auth] Error:', e);
      setError({
        title: 'Connection error',
        message: e.message || 'Failed to connect to authentication server'
      });
      setMe(null);
      setLoading(false);
    } finally {
      checkInProgress.current = false;
    }
  }

  // Background revalidation (doesn't block UI)
  async function revalidateAuthInBackground() {
    try {
      console.log('[auth] Revalidating in background...');
      const res = await fetch('/api/me', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        console.log('[auth] ✅ Revalidation successful');
        
        // Update cache and state silently
        AuthCache.set(data);
        setMe(data);
      } else {
        console.warn('[auth] Revalidation failed, clearing cache');
        AuthCache.clear();
        setMe(null);
      }
    } catch (e) {
      console.error('[auth] Revalidation error:', e);
    }
  }

  // ========================================================================
  // MANUAL LOGIN
  // ========================================================================
  const handleManualLogin = async () => {
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
      AuthCache.set(meData); // Cache the result
      setTokenInput('');
      setError(null);
      setManualLoginMode(false);
    } catch (e) {
      console.error('[auth] Manual login error:', e);
      toast.dismiss(loadingId);
      toast.error(e.message || 'Sign-in failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      AuthCache.clear(); // Clear cache on logout
      toast.info('Logged out successfully');
    } catch (e) {
      toast.error('Logout failed');
    } finally {
      setMe(null);
      setError(null);
      didInitialCheck.current = false;
      navigate('/');
    }
  };

  const handleRetryAutoLogin = () => {
    didInitialCheck.current = false;
    checkInProgress.current = false;
    AuthCache.clear();
    setError(null);
    setLoading(true);
    checkAuthWithCache();
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'grid', 
        placeItems: 'center', 
        background: '#0f172a', 
        color: '#e2e8f0' 
      }}>
        <div style={{ textAlign: 'center', maxWidth: 760, padding: 24 }}>
          <div style={{ 
            fontSize: 12, 
            opacity: 0.7, 
            letterSpacing: 1.5, 
            textTransform: 'uppercase' 
          }}>
            mindPick
          </div>
          <h1 style={{ fontSize: 28, margin: '10px 0 8px' }}>
            Loading Admin Console…
          </h1>
          <div style={{ marginTop: 20 }}>
            <div style={{
              width: 40,
              height: 40,
              margin: '0 auto',
              border: '4px solid #334155',
              borderTop: '4px solid #4f46e5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ========================================================================
  // NOT AUTHENTICATED - SHOW LOGIN
  // ========================================================================
  if (!me?.ok) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'grid', 
        placeItems: 'center', 
        background: '#0f172a', 
        color: '#e2e8f0' 
      }}>
        <div style={{ width: '100%', maxWidth: 720, padding: 24 }}>
          <div style={{ 
            fontSize: 12, 
            opacity: 0.7, 
            letterSpacing: 1.5, 
            textTransform: 'uppercase', 
            textAlign: 'center' 
          }}>
            mindPick
          </div>
          <h1 style={{ fontSize: 36, margin: '12px 0 16px', textAlign: 'center' }}>
            Admin Console
          </h1>

          {/* Error Display */}
          {error && (
            <div style={{ 
              background: '#ef4444', 
              border: '1px solid #dc2626', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 16 
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                {error.title}
              </h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
                {error.message}
              </p>
              {error.hint && (
                <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>
                  💡 {error.hint}
                </p>
              )}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <a
                  href="https://www.mindpick.me"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #fff',
                    background: '#fff',
                    color: '#ef4444',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🔗 Go to Main App
                </a>
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
                  Retry
                </button>
                <button
                  onClick={() => setManualLoginMode(true)}
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
                  Manual Login
                </button>
              </div>
            </div>
          )}

          {/* Login Options */}
          {!manualLoginMode && !error && (
            <div style={{ 
              background: '#111827', 
              border: '1px solid #374151', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 16 
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                ✨ Automatic Login
              </h3>
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
            <div style={{ 
              background: '#111827', 
              border: '1px solid #374151', 
              borderRadius: 12, 
              padding: 16 
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                🔑 Manual Login
              </h3>
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your token here..."
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
    <AuthContext.Provider value={{ me, logout: handleLogout, revalidate: revalidateAuthInBackground }}>
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
    </AuthContext.Provider>
  );
}