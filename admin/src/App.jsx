import React from 'react';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ textAlign: 'center', maxWidth: 760, padding: 24 }}>
        <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>mindPick</div>
        <h1 style={{ fontSize: 36, margin: '12px 0 8px' }}>Admin Dashboard</h1>
        <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6 }}>
          Placeholder landing page for the Admin Console. Authentication, RBAC, Neon integration, feature flags, and moderation
          will be added after creating the Vercel project and database.
        </p>
        <div style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
          Deployed as a separate project mapped to the <code>admin/</code> subfolder.
        </div>
      </div>
    </div>
  );
}
