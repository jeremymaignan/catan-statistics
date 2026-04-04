import React from 'react';

export default function SettlementsCard({ settlements, points }) {
  if (!settlements || Object.keys(settlements).length === 0) return null;

  const colonyCount = Object.values(settlements).filter(t => t === 'colony').length;
  const cityCount = Object.values(settlements).filter(t => t === 'city').length;

  return (
    <div>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.icon, background: '#7b1fa2', borderRadius: 5 }}>{'\u25B2'}</span>
            <span style={styles.label}>Colonies</span>
          </div>
          <span style={{ ...styles.count, color: colonyCount > 5 ? '#c62828' : '#4e342e' }}>
            {colonyCount}<span style={styles.max}>/5</span>
          </span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.icon, background: '#1565c0', borderRadius: 5 }}>{'\u2605'}</span>
            <span style={styles.label}>Cities</span>
          </div>
          <span style={{ ...styles.count, color: cityCount > 4 ? '#c62828' : '#4e342e' }}>
            {cityCount}<span style={styles.max}>/4</span>
          </span>
        </div>
        <div style={styles.pointsCard}>
          <span style={styles.pointsLabel}>Points</span>
          <span style={styles.pointsValue}>{points}</span>
        </div>
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
    background: '#faf8f5',
    border: '1px solid #f0ebe5',
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
    color: '#8d6e63',
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
    color: '#bcaaa4',
  },
  pointsCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '10px 8px',
    borderRadius: 10,
    background: '#faf8f5',
    border: '1px solid #f0ebe5',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#6d4c41',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  pointsValue: {
    fontSize: 26,
    fontWeight: 800,
    color: '#4e342e',
  },
};
