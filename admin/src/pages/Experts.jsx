import React, { useMemo, useState } from 'react';

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

function ExpertRow({ e, onAction }) {
  return (
    <tr>
      <td style={{ fontWeight: 700 }}>{e.name}</td>
      <td>{e.email}</td>
      <td>
        <span style={pill(e.stripe_connected ? 'connected' : 'disconnected')}>
          {e.stripe_connected ? 'Connected' : 'Not Connected'}
        </span>
      </td>
      <td>{e.sla_hours}h</td>
      <td>€{(e.price_cents / 100).toFixed(0)}</td>
      <td>
        <span style={pill(e.accepting_questions ? 'enabled' : 'disabled')}>
          {e.accepting_questions ? 'Available' : 'Away'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={() => onAction('view', e)}>View</button>
          <button style={btn} onClick={() => onAction('toggle_availability', e)}>
            {e.accepting_questions ? 'Set Away' : 'Set Available'}
          </button>
          <button style={btnGhost} onClick={() => onAction('impersonate', e)}>Impersonate</button>
        </div>
      </td>
    </tr>
  );
}

export default function Experts() {
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('all');
  const [stripe, setStripe] = useState('all');

  const [experts, setExperts] = useState([
    { id: 1, name: 'Sarah Chen', email: 'sarah@example.com', stripe_connected: true, price_cents: 12500, sla_hours: 24, accepting_questions: true },
    { id: 2, name: 'Amit Gupta', email: 'amit@example.com', stripe_connected: false, price_cents: 7500, sla_hours: 48, accepting_questions: false },
    { id: 3, name: 'Elena Rossi', email: 'elena@example.com', stripe_connected: true, price_cents: 10000, sla_hours: 24, accepting_questions: true }
  ]);

  const filtered = useMemo(() => {
    return experts.filter(e => {
      const matchQ = query ? (e.name.toLowerCase().includes(query.toLowerCase()) || e.email.toLowerCase().includes(query.toLowerCase())) : true;
      const matchA = availability === 'all' ? true : (availability === 'available' ? e.accepting_questions : !e.accepting_questions);
      const matchS = stripe === 'all' ? true : (stripe === 'connected' ? e.stripe_connected : !e.stripe_connected);
      return matchQ && matchA && matchS;
    });
  }, [experts, query, availability, stripe]);

  const onAction = (action, expert) => {
    if (action === 'toggle_availability') {
      setExperts(prev => prev.map(e => e.id === expert.id ? { ...e, accepting_questions: !e.accepting_questions } : e));
    }
    // Other actions (view, impersonate) are mocked
    console.log('Action:', action, 'Expert:', expert);
  };

  return (
    <div>
      <Section
        title="Experts"
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={input}
              placeholder="Search name or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <select style={input} value={availability} onChange={e => setAvailability(e.target.value)}>
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="away">Away</option>
            </select>
            <select style={input} value={stripe} onChange={e => setStripe(e.target.value)}>
              <option value="all">Stripe: All</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
            </select>
            <button style={btnGhost}>Export CSV</button>
          </div>
        }
      >
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Stripe</th>
              <th>SLA</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <ExpertRow key={e.id} e={e} onAction={onAction} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Selected Expert (mock)">
        <div style={{ fontSize: 14, opacity: 0.8 }}>
          Pick an expert from the table to manage settings, view performance, and moderate content. In the real MVP, this will open a detail drawer with profile, performance KPIs, and quick actions (toggle availability, connect Stripe, refund last tx, etc.).
        </div>
      </Section>
    </div>
  );
}

const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 };
const btn = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#111827', color: '#e5e7eb', cursor: 'pointer' };
const btnGhost = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' };
const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#0b1220', color: '#e5e7eb' };

function pill(kind) {
  const colors = {
    connected: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    disconnected: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' },
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
