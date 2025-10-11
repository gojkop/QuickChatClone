import React, { useState } from 'react';

function Section({ title, children, right }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <h2 style={{ fontSize: 18 }}>{title}</h2>
        {right}
      </div>
      <div style={{ background: '#0b1220', border: '1px solid #374151', borderRadius: 12, padding: 16 }}>
        {children}
      </div>
    </section>
  );
}

export default function Settings() {
  // Mock admin users (RBAC)
  const [admins, setAdmins] = useState([
    { id: 'a1', name: 'Bogdan Tancic', email: 'b.tancic@gmail.com', role: 'super_admin', disabled: false, token_version: 0 },
    { id: 'a2', name: 'Support User', email: 'support@mindpick.me', role: 'support_admin', disabled: false, token_version: 0 }
  ]);

  const [security, setSecurity] = useState({
    enforce2FA: true,
    ipAllowlistEnabled: false,
    rateLimitSensitiveOps: true
  });

  const [alerts, setAlerts] = useState({
    slaComplianceThreshold: 90,
    paymentFailureThreshold: 5,
    moderationQueueThreshold: 20,
    notifyEmails: 'admin@mindpick.com,tech@mindpick.com'
  });

  const [webhooks] = useState([
    { id: 'w1', name: 'Stripe Webhook', status: 'healthy', lastEvent: 'charge.succeeded (5m)' },
    { id: 'w2', name: 'Xano Events', status: 'healthy', lastEvent: 'question.created (1m)' }
  ]);

  const [envSummary] = useState([
    { key: 'DATABASE_URL', status: 'present' },
    { key: 'XANO_BASE_URL', status: 'present' },
    { key: 'ADMIN_JWT_SECRET', status: 'present' },
    { key: 'CORS_ALLOW_ORIGIN', status: 'optional' }
  ]);

  const [featureDefaults, setFeatureDefaults] = useState({
    defaultRolloutPercent: 0,
    allowTargetedUsers: true
  });

  const toggleAdminDisabled = (id) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, disabled: !a.disabled } : a));
  };

  const bumpTokenVersion = (id) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, token_version: a.token_version + 1 } : a));
  };

  return (
    <div>
      <Section
        title="Admin Users (RBAC)"
        right={<button style={btn}>Invite Admin</button>}
      >
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Disabled</th>
              <th>Token Version</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 700 }}>{a.name}</td>
                <td>{a.email}</td>
                <td><span style={pill(a.role)}>{a.role}</span></td>
                <td><span style={pill(a.disabled ? 'disabled' : 'enabled')}>{a.disabled ? 'Yes' : 'No'}</span></td>
                <td>{a.token_version}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btnGhost}>Edit</button>
                    <button style={btn} onClick={() => toggleAdminDisabled(a.id)}>
                      {a.disabled ? 'Enable' : 'Disable'}
                    </button>
                    <button style={btnDanger} onClick={() => bumpTokenVersion(a.id)}>
                      Revoke Sessions
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Security">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={card}>
            <div style={label}>Enforce 2FA (Admins)</div>
            <select
              style={input}
              value={security.enforce2FA ? '1' : '0'}
              onChange={e => setSecurity({ ...security, enforce2FA: e.target.value === '1' })}
            >
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
          <div style={card}>
            <div style={label}>IP Allowlist (Super Admin)</div>
            <select
              style={input}
              value={security.ipAllowlistEnabled ? '1' : '0'}
              onChange={e => setSecurity({ ...security, ipAllowlistEnabled: e.target.value === '1' })}
            >
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
          <div style={card}>
            <div style={label}>Rate Limit Sensitive Ops</div>
            <select
              style={input}
              value={security.rateLimitSensitiveOps ? '1' : '0'}
              onChange={e => setSecurity({ ...security, rateLimitSensitiveOps: e.target.value === '1' })}
            >
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
        </div>
      </Section>

      <Section
        title="SLA & Alerts"
        right={<button style={btnGhost}>Save</button>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={card}>
            <div style={label}>SLA Compliance Threshold (%)</div>
            <input style={input} type="number" min="0" max="100" value={alerts.slaComplianceThreshold}
              onChange={e => setAlerts({ ...alerts, slaComplianceThreshold: parseInt(e.target.value || '0', 10) })} />
          </div>
          <div style={card}>
            <div style={label}>Payment Failure Threshold (%)</div>
            <input style={input} type="number" min="0" max="100" value={alerts.paymentFailureThreshold}
              onChange={e => setAlerts({ ...alerts, paymentFailureThreshold: parseInt(e.target.value || '0', 10) })} />
          </div>
          <div style={card}>
            <div style={label}>Moderation Queue Threshold</div>
            <input style={input} type="number" min="0" value={alerts.moderationQueueThreshold}
              onChange={e => setAlerts({ ...alerts, moderationQueueThreshold: parseInt(e.target.value || '0', 10) })} />
          </div>
          <div style={card}>
            <div style={label}>Notify Emails</div>
            <input style={input} value={alerts.notifyEmails}
              onChange={e => setAlerts({ ...alerts, notifyEmails: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="API & Webhooks" right={<button style={btnGhost}>Rotate Secrets</button>}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Integration</th>
              <th>Status</th>
              <th>Last Event</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map(w => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td><span style={pill(w.status)}>{w.status}</span></td>
                <td>{w.lastEvent}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btnGhost}>View Logs</button>
                    <button style={btn}>Ping</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Environment" right={<button style={btnGhost}>Check</button>}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Key</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {envSummary.map(e => (
              <tr key={e.key}>
                <td>{e.key}</td>
                <td><span style={pill(e.status)}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Feature Defaults" right={<button style={btnGhost}>Save</button>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={card}>
            <div style={label}>Default Rollout %</div>
            <input
              style={input}
              type="number" min="0" max="100"
              value={featureDefaults.defaultRolloutPercent}
              onChange={e => setFeatureDefaults({ ...featureDefaults, defaultRolloutPercent: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div style={card}>
            <div style={label}>Allow Per-User Targeting</div>
            <select
              style={input}
              value={featureDefaults.allowTargetedUsers ? '1' : '0'}
              onChange={e => setFeatureDefaults({ ...featureDefaults, allowTargetedUsers: e.target.value === '1' })}
            >
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
        </div>
      </Section>
    </div>
  );
}

const btn = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#111827', color: '#e5e7eb', cursor: 'pointer' };
const btnGhost = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' };
const btnDanger = { padding: '6px 10px', borderRadius: 8, border: '1px solid #991b1b', background: '#7f1d1d', color: '#fff', cursor: 'pointer' };
const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#0b1220', color: '#e5e7eb' };
const label = { fontSize: 12, opacity: 0.8, display: 'block', marginBottom: 4 };
const card = { background: '#111827', border: '1px solid #374151', borderRadius: 10, padding: 12 };

function pill(kind) {
  const colors = {
    super_admin: { bg: '#1d4ed8', border: '#2563eb', text: '#dbeafe' },
    support_admin: { bg: '#134e4a', border: '#065f46', text: '#d1fae5' },
    enabled: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    disabled: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' },
    healthy: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    warning: { bg: '#78350f', border: '#92400e', text: '#fde68a' },
    critical: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' },
    present: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    optional: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' }
  }[kind] || { bg: '#1f2937', border: '#374151', text: '#e5e7eb' };

  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 999,
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    fontSize: 12
  };
}
