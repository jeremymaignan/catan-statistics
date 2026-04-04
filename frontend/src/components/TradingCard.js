import React from 'react';
import { RESOURCES, computeTradingRates } from '../shared/constants';

const RATE_STYLES = {
  4: { bg: '#faf8f5', border: '#f0ebe5', color: '#a1887f', label: '4:1', tagBg: '#f0ebe5', tagColor: '#8d6e63' },
  3: { bg: '#fff8e1', border: '#ffe082', color: '#6d4c41', label: '3:1', tagBg: '#ffe082', tagColor: '#e65100' },
  2: { bg: '#e8f5e9', border: '#a5d6a7', color: '#2e7d32', label: '2:1', tagBg: '#a5d6a7', tagColor: '#1b5e20' },
};

export default function TradingCard({ ports, settlements }) {
  const rates = computeTradingRates(ports, settlements);
  const hasAnyPort = Object.values(rates).some(r => r < 4);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Trading Rates</h3>
      <div style={styles.grid}>
        {[...RESOURCES].sort((a, b) => rates[a.code] - rates[b.code]).map(res => {
          const rate = rates[res.code];
          const rs = RATE_STYLES[rate];
          return (
            <div key={res.code} style={{ ...styles.row, backgroundColor: rs.bg, borderColor: rs.border }}>
              <div style={styles.resourceInfo}>
                <span style={styles.emoji}>{res.emoji}</span>
                <span style={{ ...styles.resourceName, color: rs.color }}>{res.label}</span>
              </div>
              <span style={{ ...styles.rateTag, backgroundColor: rs.tagBg, color: rs.tagColor }}>
                {rs.label}
              </span>
            </div>
          );
        })}
      </div>
      {!hasAnyPort && (
        <p style={styles.hint}>
          Place a settlement on a port to unlock better rates.
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px 12px',
    background: 'white',
    borderRadius: 14,
    border: '1px solid #e8e0d8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  title: {
    color: '#4e342e',
    margin: '0 0 14px 0',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid',
    transition: 'all 0.3s ease',
  },
  resourceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 18,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  rateTag: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    padding: '3px 10px',
    borderRadius: 8,
    fontVariantNumeric: 'tabular-nums',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a1887f',
    marginTop: 10,
    marginBottom: 0,
    fontWeight: 500,
  },
};
