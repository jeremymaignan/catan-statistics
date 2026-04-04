import React, { useState } from 'react';

const ITEMS = [
  {
    label: 'Available',
    desc: 'Click to place colony',
    render: () => (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#43a047" stroke="#2e7d32" strokeWidth="1.5" />
        <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill="#fff">1</text>
      </svg>
    ),
  },
  {
    label: 'Colony',
    desc: 'Click to upgrade to city',
    render: () => (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#7b1fa2" stroke="#6a1b9a" strokeWidth="1.5" />
        <text x="12" y="13" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="white" fontWeight="bold">{'\u25B2'}</text>
      </svg>
    ),
  },
  {
    label: 'City',
    desc: 'Click to mark as opponent',
    render: () => (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#1565c0" stroke="#0d47a1" strokeWidth="1.5" />
        <text x="12" y="13" textAnchor="middle" dominantBaseline="central" fontSize="13" fill="white" fontWeight="bold">{'\u2605'}</text>
      </svg>
    ),
  },
  {
    label: 'Opponent',
    desc: 'Click to remove',
    render: () => (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#212121" stroke="#000" strokeWidth="1.5" />
        <text x="12" y="13" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="white" fontWeight="bold">{'\u2716'}</text>
      </svg>
    ),
  },
  {
    label: 'Robber',
    desc: 'Click any tile to place',
    render: () => (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#e0e0e0" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="5" y1="19" x2="19" y2="5" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BoardLegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={styles.wrapper}>
      <button
        style={styles.toggle}
        onClick={() => setExpanded(v => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={styles.toggleText}>Legend</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div style={styles.container}>
          <div style={styles.grid}>
            {ITEMS.map(item => (
              <div key={item.label} style={styles.item}>
                <div style={styles.icon}>{item.render()}</div>
                <div>
                  <div style={styles.label}>{item.label}</div>
                  <div style={styles.desc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.rankHint}>
            <span style={styles.rankDot('#43a047')} />
            <span style={styles.rankLabel}>Best</span>
            <span style={styles.rankDot('#f9a825')} />
            <span style={styles.rankLabel}>Medium</span>
            <span style={styles.rankDot('#e53935')} />
            <span style={styles.rankLabel}>Worst</span>
            <span style={styles.rankSuffix}> &mdash; position rank by production value</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 8,
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  toggleText: {
    color: 'var(--text-muted)',
  },
  container: {
    marginTop: 8,
    padding: '12px 16px',
    background: 'var(--card-bg)',
    borderRadius: 12,
    border: '1px solid var(--border-main)',
    boxShadow: 'var(--shadow-card)',
    maxWidth: 520,
    width: '100%',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 8,
    background: 'var(--card-inner-bg)',
    border: '1px solid var(--border-subtle)',
    minWidth: 150,
    flex: '0 0 auto',
  },
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
  },
  desc: {
    fontSize: 11,
    color: 'var(--text-hint)',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
  },
  rankHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1px solid var(--border-subtle)',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    flexWrap: 'wrap',
  },
  rankDot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    flexShrink: 0,
  }),
  rankLabel: {
    fontWeight: 600,
    color: 'var(--text-body)',
    marginRight: 4,
  },
  rankSuffix: {
    color: 'var(--text-hint)',
  },
};
