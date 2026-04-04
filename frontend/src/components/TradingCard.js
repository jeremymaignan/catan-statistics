import React from 'react';
import { RESOURCES, computeTradingRates } from '../shared/constants';

const RATE_STYLES = {
  4: { bg: 'var(--rate-4-bg)', border: 'var(--rate-4-border)', color: 'var(--rate-4-text)', label: '4:1', tagBg: 'var(--rate-4-tag-bg)', tagColor: 'var(--rate-4-tag-text)' },
  3: { bg: 'var(--rate-3-bg)', border: 'var(--rate-3-border)', color: 'var(--rate-3-text)', label: '3:1', tagBg: 'var(--rate-3-tag-bg)', tagColor: 'var(--rate-3-tag-text)' },
  2: { bg: 'var(--rate-2-bg)', border: 'var(--rate-2-border)', color: 'var(--rate-2-text)', label: '2:1', tagBg: 'var(--rate-2-tag-bg)', tagColor: 'var(--rate-2-tag-text)' },
};

export default function TradingCard({ ports, settlements }) {
  const rates = computeTradingRates(ports, settlements);
  const hasAnyPort = Object.values(rates).some(r => r < 4);

  return (
    <div>
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
    color: 'var(--text-hint)',
    marginTop: 10,
    marginBottom: 0,
    fontWeight: 500,
  },
};
