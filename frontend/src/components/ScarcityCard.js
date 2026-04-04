import React from 'react';
import { RESOURCE_EMOJIS } from '../shared/constants';

export default function ScarcityCard({ boardScarcity }) {
  if (!boardScarcity || Object.keys(boardScarcity).length === 0) return null;

  const entries = Object.entries(boardScarcity).sort((a, b) => b[1].total_rate - a[1].total_rate);
  const maxRate = Math.max(...entries.map(([, v]) => v.total_rate));

  return (
    <div>
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
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{RESOURCE_EMOJIS[code] || ''} {info.text}</span>
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
  tableWrap: {
    borderRadius: 8,
    border: '1px solid var(--border-subtle)',
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
    color: 'var(--table-header-text)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    backgroundColor: 'var(--table-header-bg)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  td: {
    padding: '7px 10px',
    fontSize: 13,
    borderBottom: '1px solid var(--border-table-row)',
    verticalAlign: 'middle',
    color: 'var(--text-body)',
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
    backgroundColor: 'var(--bar-bg)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  percentFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
};
