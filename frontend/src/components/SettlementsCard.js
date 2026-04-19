import React, { useState } from 'react';
import { VALIDATION_COLORS } from '../shared/constants';

function BonusToggle({ active, onClick, emoji, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.bonusBtn,
        background: active ? 'var(--tip-success-bg)' : 'var(--card-inner-bg)',
        border: `1.5px solid ${active ? 'var(--tip-success-border)' : 'var(--border-main)'}`,
        color: active ? 'var(--tip-success-text)' : 'var(--text-muted)',
      }}
      title={`${label} (+2 VP)`}
    >
      <span style={styles.bonusEmoji}>{emoji}</span>
      <span style={styles.bonusLabel}>{label}</span>
      <span style={styles.bonusVp}>+2</span>
    </button>
  );
}

export default function SettlementsCard({ settlements, points }) {
  const [longestRoad, setLongestRoad] = useState(false);
  const [largestArmy, setLargestArmy] = useState(false);

  if (!settlements || Object.keys(settlements).length === 0) return null;

  const colonyCount = Object.values(settlements).filter(t => t === 'colony').length;
  const cityCount = Object.values(settlements).filter(t => t === 'city').length;
  const totalPoints = (points || 0) + (longestRoad ? 2 : 0) + (largestArmy ? 2 : 0);

  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.icon, background: '#7b1fa2', borderRadius: 5 }}>{'\u25B2'}</span>
            <span style={styles.label}>Colonies</span>
          </div>
          <span style={{ ...styles.count, color: colonyCount > 5 ? VALIDATION_COLORS.over : 'var(--text-primary)' }}>
            {colonyCount}<span style={styles.max}>/5</span>
          </span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.icon, background: '#1565c0', borderRadius: 5 }}>{'\u2605'}</span>
            <span style={styles.label}>Cities</span>
          </div>
          <span style={{ ...styles.count, color: cityCount > 4 ? VALIDATION_COLORS.over : 'var(--text-primary)' }}>
            {cityCount}<span style={styles.max}>/4</span>
          </span>
        </div>
        <div style={styles.pointsCard}>
          <span style={styles.pointsLabel}>Points</span>
          <span style={styles.pointsValue}>{totalPoints}</span>
        </div>
      </div>
      <div style={styles.bonusRow}>
        <BonusToggle
          active={longestRoad}
          onClick={() => setLongestRoad(v => !v)}
          emoji={'\uD83D\uDEE4\uFE0F'}
          label="Longest Road"
        />
        <BonusToggle
          active={largestArmy}
          onClick={() => setLargestArmy(v => !v)}
          emoji={'\u2694\uFE0F'}
          label="Largest Army"
        />
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'flex',
    gap: 8,
  },
  card: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '10px 8px',
    borderRadius: 10,
    background: 'var(--card-inner-bg)',
    border: '1px solid var(--border-subtle)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: '50%',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  count: {
    fontSize: 22,
    fontWeight: 800,
  },
  max: {
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--text-hint)',
  },
  pointsCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '10px 8px',
    borderRadius: 10,
    background: 'var(--card-inner-bg)',
    border: '1px solid var(--border-subtle)',
  },
  pointsLabel: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  pointsValue: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  bonusRow: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  },
  bonusBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '7px 10px',
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  bonusEmoji: {
    fontSize: 14,
    lineHeight: 1,
  },
  bonusLabel: {
    flex: 1,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  bonusVp: {
    fontSize: 11,
    fontWeight: 700,
    opacity: 0.7,
  },
};
