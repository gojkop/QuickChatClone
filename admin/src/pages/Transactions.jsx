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

function TxRow({ tx, onAction }) {
  return (
    <tr>
      <td style={{ fontFamily: 'monospace' }}>{tx.id}</td>
      <td>{tx.expert}</td>
      <td>{tx.asker}</td>
      <td>{tx.amount}</td>
      <td><span style={pill(tx.status)}>{tx.status}</span></td>
      <td>{tx.ts}</td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost} onClick={() => onAction('view', tx)}>View</button>
          <button style={btnDanger} disabled={tx.status !== 'completed'} onClick={() => onAction('refund', tx)}>
            Refund
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Transactions() {
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('7d'); // placeholder

  const [txs, setTxs] = useState([
    { id: 'pi_3Jk81', expert: 'Sarah Chen', asker: 'john@acme.com', amount: '€125', status: 'completed', ts: 'Today 10:21' },
    { id: 'pi_9Ds20', expert: 'Amit Gupta', asker: 'maria@globex.com', amount: '€75', status: 'refunded', ts: 'Today 09:54' },
    { id: 'pi_0Ke11', expert: 'Elena Rossi', asker: 'ops@initech.com', amount: '€100', status: 'pending', ts: 'Yesterday 18:12' },
    { id: 'pi_7Qa50', expert: 'Amit Gupta', asker: 'sam@contoso.com', amount: '€85', status: 'disputed', ts: 'Yesterday 16:40' }
  ]);

  const filtered = useMemo(() => {
    return txs.filter(t => {
      const matchS = status === 'all' ? true : t.status === status;
      const q = query.trim().toLowerCase();
      const matchQ = !q ? true :
        t.id.toLowerCase().includes(q) ||
        t.expert.toLowerCase().includes(q) ||
        t.asker.toLowerCase().includes(q);
      // range filter is mocked
      return matchS && matchQ;
    });
  }, [txs, status, query, range]);

  const onAction = (action, tx) => {
    console.log('Tx action:', action, tx);
    if (action === 'refund' && tx.status === 'completed') {
      setTxs(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'refunded' } : t));
    }
  };

  return (
    <div>
      <Section
        title="Transactions"
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={input}
              placeholder="Search id/expert/asker…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <select style={input} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </select>
            <select style={input} value={range} onChange={e => setRange(e.target.value)}>
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
              <option value="90d">Last 90d</option>
            </select>
            <button style={btnGhost}>Export CSV</button>
          </div>
        }
      >
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Expert</th>
              <th>Asker</th>
              <th>Amount</th>
              <th>Status</th>
              <th>When</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <TxRow key={t.id} tx={t} onAction={onAction} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Stripe Events (mock)">
        <div style={{ fontSize: 14, opacity: 0.8 }}>
          In the MVP, view a transaction to see its timeline and Stripe events (payment_intent.created, charge.succeeded, payout.paid, etc.).
        </div>
      </Section>
    </div>
  );
}

const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 };
const btn = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#111827', color: '#e5e7eb', cursor: 'pointer' };
const btnGhost = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' };
const btnDanger = { padding: '6px 10px', borderRadius: 8, border: '1px solid #991b1b', background: '#7f1d1d', color: '#fff', cursor: 'pointer' };
const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#0b1220', color: '#e5e7eb' };

function pill(kind) {
  const colors = {
    completed: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    refunded: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' },
    pending: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' },
    disputed: { bg: '#78350f', border: '#92400e', text: '#fde68a' }
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
