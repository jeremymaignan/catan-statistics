import React, { useState } from 'react';

/**
 * Reusable collapsible card wrapper.
 *
 * Props:
 *   title       – card heading text
 *   defaultOpen – whether the card starts expanded (default: true)
 *   children    – card body content
 */
export default function CollapsibleCard({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={styles.container}>
      <button
        style={styles.header}
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        <h3 style={styles.title}>{title}</h3>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={styles.body}>
          {children}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
    borderRadius: 14,
    border: '1px solid #e8e0d8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    color: '#4e342e',
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  body: {
    padding: '0 12px 16px',
  },
};
