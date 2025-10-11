import React from 'react';

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: 16, minWidth: 200 }}>
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
    </div>
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

export default function Dashboard() {
  // Mock KPI values for MVP rollout
  const kpis = [
    { label: 'Experts', value: 128, sub: 'Active last 30d: 83' },
    { label: 'Askers', value: 2_145, sub: 'Repeat rate: 18.4%' },
    { label: 'GTV (This Month)', value: '€12,480', sub: 'Prev: €10,350 (+20.6%)' },
    { label: 'Questions Pending', value: 37, sub: 'SLA compliance: 93.1%' }
  ];

  const atRiskExperts = [
    { id: 101, name: 'Sarah Chen', pending: 3, avgHours: 28, status: 'warning' },
    { id: 204, name: 'Amit Gupta', pending: 5, avgHours: 35, status: 'critical' }
  ];

  const recentTransactions = [
    { id: 'pi_1', expert: 'Sarah Chen', amount: '€125', status: 'completed', ts: 'Today 10:21' },
    { id: 'pi_2', expert: 'Amit Gupta', amount: '€75', status: 'refunded', ts: 'Today 09:54' },
    { id: 'pi_3', expert: 'Elena Rossi', amount: '€100', status: 'completed', ts: 'Yesterday 18:12' }
  ];

  const moderationQueue = [
    { id: 'q_329', type: 'question', reason: 'auto_detected', confidence: 0.84, status: 'pending' },
    { id: 'a_812', type: 'answer', reason: 'quality', confidence: 0.42, status: 'pending' }
  ];

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
        {kpis.map(k => (
          <StatCard key={k.label} label={k.label} value={k.value} sub={k.sub} />
        ))}
      </div>

      {/* Conversion Funnel (placeholder) */}
      <Section title="Conversion Funnel (Last 7d)" right={<span style={{ fontSize: 12, opacity: 0.7 }}>Mocked</span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { step: 'Link Visits', value: 5420 },
            { step: 'Question Started', value: 375 },
            { step: 'Payment Completed', value: 312 },
            { step: 'Answer Delivered', value: 295 }
          ].map(s => (
            <div key={s.step} style={{ background: '#111827', border: '1px solid #374151', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{s.step}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* At-Risk Experts */}
      <Section title="Experts Needing Attention" right={<button style={btnGhost}>View All</button>}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Expert</th>
              <th>Pending</th>
              <th>Avg Response (h)</th>
              <th>Health</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {atRiskExperts.map(e => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.pending}</td>
                <td>{e.avgHours}</td>
                <td>
                  <span style={pill(e.status)}>{e.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btn}>Send Reminder</button>
                    <button style={btn}>Pause New Qs</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Recent Transactions */}
      <Section title="Recent Transactions" right={<button style={btnGhost}>Export CSV</button>}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Expert</th>
              <th>Amount</th>
              <th>Status</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.expert}</td>
                <td>{t.amount}</td>
                <td><span style={pill(t.status)}>{t.status}</span></td>
                <td>{t.ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Moderation Queue */}
      <Section title="Moderation Queue" right={<button style={btnGhost}>Open Queue</button>}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {moderationQueue.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.type}</td>
                <td>{m.reason}</td>
                <td>{Math.round(m.confidence * 100)}%</td>
                <td><span style={pill(m.status)}>{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
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

function pill(kind) {
  const colors = {
    completed: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    refunded: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' },
    pending: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' },
    warning: { bg: '#78350f', border: '#92400e', text: '#fde68a' },
    critical: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' },
    approved: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' }
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
