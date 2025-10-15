// Add these methods to your AuthAPI (src/api/auth.js)

export const AuthAPI = {
  // ... your existing methods ...

  // LinkedIn OAuth
  async initLinkedInOAuth() {
    const response = await fetch('/api/oauth/linkedin/init');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'LinkedIn OAuth init failed');
    }
    return response.json();
  },

  async continueLinkedInOAuth({ code, state }) {
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    if (state) params.append('state', state);
    
    const response = await fetch(`/api/oauth/linkedin/continue?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'LinkedIn OAuth continue failed');
    }
    return response.json();
  },

  // Google OAuth (if not already present)
  async initGoogleOAuth() {
    const response = await fetch('/api/oauth/google/init');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Google OAuth init failed');
    }
    return response.json();
  },

  async continueGoogleOAuth({ code, state }) {
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    if (state) params.append('state', state);

    const response = await fetch(`/api/oauth/google/continue?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Google OAuth continue failed');
    }
    return response.json();
  },

  // Magic Link Authentication
  async sendMagicLink(email) {
    const response = await fetch('/api/auth/magic-link/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.message || 'Failed to send magic link');
      err.response = { status: response.status, data: error };
      throw err;
    }

    return response.json();
  },

  async verifyMagicLink(token) {
    const response = await fetch('/api/auth/magic-link/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.message || 'Failed to verify magic link');
      err.response = { status: response.status, data: error };
      throw err;
    }

    return response.json();
  },
};
