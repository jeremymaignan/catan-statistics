import React from 'react';

const RESOURCES = [
  { code: 'wo', label: 'Wood',  emoji: '\u{1F332}', color: '#1b5e20', portType: 'wo_port' },
  { code: 'b',  label: 'Brick', emoji: '\u{1F9F1}', color: '#a0522d', portType: 'b_port' },
  { code: 'o',  label: 'Ore',   emoji: '\u{26F0}\uFE0F',  color: '#9e9e9e', portType: 'o_port' },
  { code: 's',  label: 'Sheep', emoji: '\u{1F411}', color: '#aed581', portType: 's_port' },
  { code: 'w',  label: 'Wheat', emoji: '\u{1F33E}', color: '#fdd835', portType: 'w_port' },
];

function computeTradingRates(ports, settlements) {
  // Default: 4:1 for everything
  const rates = {};
  RESOURCES.forEach(r => { rates[r.code] = 4; });

  if (!ports || !settlements) return rates;

  // Only our settlements (colony/city) grant port access, not opponents
  const settledPositions = new Set(
    Object.entries(settlements)
      .filter(([, type]) => type === 'colony' || type === 'city')
      .map(([pos]) => pos)
  );

  for (const port of ports) {
    if (!port.positions || port.type === 'none') continue;
    const [posA, posB] = port.positions;
    const hasAccess = settledPositions.has(posA) || settledPositions.has(posB);
    if (!hasAccess) continue;

    if (port.type === '3:1') {
      // 3:1 applies to all resources (only if better than current)
      RESOURCES.forEach(r => {
        if (rates[r.code] > 3) rates[r.code] = 3;
      });
    } else {
      // Resource-specific 2:1 port
      const res = RESOURCES.find(r => r.portType === port.type);
      if (res && rates[res.code] > 2) {
        rates[res.code] = 2;
      }
    }
  }

  return rates;
}

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
