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

function QueueRow({ item, onSelect }) {
  return (
    <tr onClick={() => onSelect(item)} style={{ cursor: 'pointer' }}>
      <td>{item.id}</td>
      <td>{item.content_type}</td>
      <td>{item.flagged_reason}</td>
      <td>{Math.round(item.auto_detection_confidence * 100)}%</td>
      <td><span style={pill(item.status)}>{item.status}</span></td>
    </tr>
  );
}

export default function Moderation() {
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);

  const queue = [
    { id: 'q_329', content_type: 'question', flagged_reason: 'auto_detected', auto_detection_confidence: 0.84, status: 'pending' },
    { id: 'a_812', content_type: 'answer', flagged_reason: 'quality', auto_detection_confidence: 0.42, status: 'pending' },
    { id: 'p_991', content_type: 'profile', flagged_reason: 'inappropriate', auto_detection_confidence: 0.63, status: 'escalated' }
  ];

  const items = queue.filter(q => filter === 'all' ? true : q.status === filter);

  return (
    <div>
      <Section
        title="Moderation Queue"
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={input}
            >
              <option value="pending">Pending</option>
              <option value="escalated">Escalated</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
            <button style={btnGhost}>Refresh</button>
          </div>
        }
      >
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
            {items.map(i => (
              <QueueRow key={i.id} item={i} onSelect={setSelected} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Details">
        {!selected ? (
          <div style={{ fontSize: 14, opacity: 0.8 }}>Select an item from the queue to review.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Summary</div>
              <dl style={{ marginTop: 8, fontSize: 14 }}>
                <div><strong>ID:</strong> {selected.id}</div>
                <div><strong>Type:</strong> {selected.content_type}</div>
                <div><strong>Reason:</strong> {selected.flagged_reason}</div>
                <div><strong>Confidence:</strong> {Math.round(selected.auto_detection_confidence * 100)}%</div>
                <div><strong>Status:</strong> {selected.status}</div>
              </dl>
            </div>

            <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Actions</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={btn}>Approve</button>
                <button style={btnDanger}>Reject</button>
                <button style={btnGhost}>Escalate</button>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={label}>Notes</label>
                <textarea style={{ ...input, height: 80 }} placeholder="Add reviewer notes..." />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', background: '#111827', border: '1px solid #374151', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Context (mock)</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                {/* In real impl, fetch text/transcript/media from Xano by content_id */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus.
              </div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 };
const btn = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#111827', color: '#e5e7eb', cursor: 'pointer' };
const btnGhost = { padding: '6px 10px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' };
const btnDanger = { padding: '6px 10px', borderRadius: 8, border: '1px solid #991b1b', background: '#7f1d1d', color: '#fff', cursor: 'pointer' };
const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #4b5563', background: '#0b1220', color: '#e5e7eb' };
const label = { fontSize: 12, opacity: 0.8, display: 'block', marginBottom: 4 };

function pill(kind) {
  const colors = {
    pending: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' },
    escalated: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' },
    approved: { bg: '#064e3b', border: '#065f46', text: '#d1fae5' },
    rejected: { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2' }
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
