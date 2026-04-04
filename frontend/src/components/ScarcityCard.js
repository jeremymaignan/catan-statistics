import React from 'react';

const RESOURCE_EMOJIS = {
  wo: '\u{1F332}', b: '\u{1F9F1}', o: '\u{26F0}\uFE0F',
  s: '\u{1F411}', w: '\u{1F33E}',
};

export default function ScarcityCard({ boardScarcity }) {
  if (!boardScarcity || Object.keys(boardScarcity).length === 0) return null;

  const entries = Object.entries(boardScarcity).sort((a, b) => b[1].total_rate - a[1].total_rate);
  const maxRate = Math.max(...entries.map(([, v]) => v.total_rate));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Resource Availability</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Resource</th>
              <th style={styles.th}>Tiles</th>
              <th style={styles.th}>Rate</th>
              <th style={{ ...styles.th, width: 100 }}>Availability</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([code, info]) => (
              <tr key={code}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ ...styles.resColorDot, backgroundColor: info.color }} />
                    <span style={{ fontWeight: 600, color: '#4e342e' }}>{RESOURCE_EMOJIS[code] || ''} {info.text}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums' }}>{info.tile_count}</td>
                <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums' }}>{info.total_rate}/36</td>
                <td style={styles.td}>
                  <div style={styles.percentCell}>
                    <div style={styles.percentBar}>
                      <div style={{
                        ...styles.percentFill,
                        width: `${(info.total_rate / maxRate) * 100}%`,
                        backgroundColor: info.board_color,
                        opacity: 0.7,
                      }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  tableWrap: {
    borderRadius: 8,
    border: '1px solid #f0ebe5',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    fontSize: 11,
    color: '#a1887f',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    backgroundColor: '#faf8f5',
    borderBottom: '1px solid #f0ebe5',
  },
  td: {
    padding: '7px 10px',
    fontSize: 13,
    borderBottom: '1px solid #f8f5f0',
    verticalAlign: 'middle',
    color: '#5d4037',
  },
  resColorDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  percentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  percentBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0ebe5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  percentFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
};
