import React, { useState } from 'react';

function Row({ flag, onToggle }) {
  return (
    <tr>
      <td style={{ fontWeight: 700 }}>{flag.key}</td>
      <td>{flag.name}</td>
      <td>{flag.description}</td>
      <td>
        <span style={pill(flag.enabled ? 'enabled' : 'disabled')}>
          {flag.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </td>
      <td>{flag.rollout_percentage}%</td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={() => onToggle(flag.key)}>
            {flag.enabled ? 'Disable' : 'Enable'}
          </button>
          <button style={btnGhost}>Edit</button>
          <button style={btnDanger}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

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

export default function FeatureFlags() {
  const [flags, setFlags] = useState([
    { key: 'coach_tier2', name: 'AI Coach Tier 2', description: 'Enable Tier 2 analysis and clarifications', enabled: true, rollout_percentage: 100 },
    { key: 'copilot_beta', name: 'Expert Copilot (Beta)', description: 'Show Copilot panel to selected experts', enabled: false, rollout_percentage: 10 },
    { key: 'deep_dive_question', name: 'Deep Dive Question Type', description: 'Offer long-form, higher-priced question type', enabled: false, rollout_percentage: 0 }
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ key: '', name: '', description: '', enabled: false, rollout_percentage: 0 });

  const toggle = (key) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const create = () => {
    if (!draft.key || !draft.name) return;
    if (flags.some(f => f.key === draft.key)) return;
    setFlags(prev => [{ ...draft }, ...prev]);
    setDraft({ key: '', name: '', description: '', enabled: false, rollout_percentage: 0 });
    setShowCreate(false);
  };

  const filtered = flags; // Add filters/search later

  return (
    <div>
      <Section
        title="Feature Flags"
        right={
          <button style={btn} onClick={() => setShowCreate(true)}>New Flag</button>
        }
      >
        <div style={{ display: showCreate ? 'block' : 'none', marginBottom: 12, background: '#111827', border: '1px solid #374151', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div>
              <label style={label}>Key</label>
              <input style={input} value={draft.key} onChange={e => setDraft({ ...draft, key: e.target.value })} placeholder="unique_key" />
            </div>
            <div>
              <label style={label}>Name</label>
              <input style={input} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Human name" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Description</label>
              <input style={input} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="What does this flag do?" />
            </div>
            <div>
              <label style={label}>Enabled</label>
              <select style={input} value={draft.enabled ? '1' : '0'} onChange={e => setDraft({ ...draft, enabled: e.target.value === '1' })}>
                <option value="1">Enabled</option>
                <option value="0">Disabled</option>
              </select>
            </div>
            <div>
              <label style={label}>Rollout %</label>
              <input style={input} type="number" min="0" max="100" value={draft.rollout_percentage} onChange={e => setDraft({ ...draft, rollout_percentage: parseInt(e.target.value || '0', 10) })} />
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={btn} onClick={create}>Create</button>
            <button style={btnGhost} onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Rollout</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <Row key={f.key} flag={f} onToggle={toggle} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Audit Trail" right={<span style={{ fontSize: 12, opacity: 0.7 }}>Mocked</span>}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14 }}>
          <li>10:12 — Enabled copilot_beta by Admin (rollout 10% → 25%)</li>
          <li>09:44 — Created deep_dive_question by Admin</li>
          <li>Yesterday — Disabled coach_tier2 by Support Admin</li>
        </ul>
      </Section>
    </div>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  fontSize: 14
};

const btn = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #4b5563',
  background: '#111827',
  color: '#e5e7eb',
  cursor: 'pointer'
};

const btnGhost = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #4b5563',
  background: 'transparent',
  color: '#e5e7eb',
  cursor: 'pointer'
};

const btnDanger = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #991b1b',
  background: '#7f1d1d',
  color: '#fff',
  cursor: 'pointer'
};

const label = { fontSize: 12, opacity: 0.8, display: 'block', marginBottom: 4 };
const input = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #4b5563',
  background: '#0b1220',
  color: '#e5e7eb'
};

function pill(kind) {
  const colors = {
    enabled: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    disabled: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' }
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
