import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavItem({ to, label }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '10px 12px',
        borderRadius: 8,
        color: active ? '#fff' : '#e5e7eb',
        background: active ? 'linear-gradient(90deg, #4f46e5, #7c3aed)' : 'transparent',
        border: active ? '1px solid #6366f1' : '1px solid transparent',
        textDecoration: 'none',
        fontWeight: 600,
        marginBottom: 6
      }}
    >
      {label}
    </Link>
  );
}

export default function Layout({ me, onLogout, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'grid', gridTemplateColumns: '260px 1fr' }}>
      <aside style={{ borderRight: '1px solid #374151', padding: 16, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>mindPick</div>
          <div style={{ fontSize: 16, marginTop: 6, opacity: 0.9 }}>Admin Console</div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
          Role: <span style={{ opacity: 0.9 }}>{me?.role}</span>
        </div>
        <nav>
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/feature-flags" label="Feature Flags" />
          <NavItem to="/moderation" label="Moderation" />
          <NavItem to="/experts" label="Experts" />
          <NavItem to="/transactions" label="Transactions" />
          <NavItem to="/settings" label="Settings" />
        </nav>
        <button
          onClick={onLogout}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #b91c1c',
            background: '#7f1d1d',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Logout
        </button>
      </aside>
      <main style={{ padding: 20 }}>
        {children}
      </main>
    </div>
  );
}
