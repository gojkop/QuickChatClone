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
};
