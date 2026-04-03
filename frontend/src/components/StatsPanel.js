import React from 'react';

export default function StatsPanel({ statistics, settlements, points }) {
  if (!statistics) return null;

  const { per_dice_value, per_resource, any_resource } = statistics;
  const hasStats = settlements && Object.keys(settlements).length > 0;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Statistics</h3>

      {!hasStats ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>&#127922;</div>
          <p style={styles.emptyText}>Click on a green position on the board to place a settlement.</p>
        </div>
      ) : (
        <>
          {/* Resources per dice value */}
          <div style={styles.section}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Roll</th>
                    <th style={styles.th}>Resources</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(per_dice_value).map(([value, resources]) => (
                    <tr key={value}>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.diceValue,
                          color: (value === '6' || value === '8') ? '#c62828' : '#4e342e',
                          fontWeight: (value === '6' || value === '8') ? 800 : 600,
                        }}>{value}</span>
                      </td>
                      <td style={styles.td}>
                        {resources.map((r, i) => (
                          <span key={i} style={{ ...styles.resourceTag, backgroundColor: r.color + '18', color: r.color, borderColor: r.color + '44' }}>
                            {r.text}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per resource probabilities */}
          <div style={styles.section}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Resource</th>
                    <th style={styles.th}>Prob.</th>
                    <th style={styles.th}>Rate</th>
                    <th style={{ ...styles.th, width: 100 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(per_resource).map(([code, info]) => (
                    <tr key={code}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ ...styles.resColorDot, backgroundColor: info.color }} />
                          <span style={{ fontWeight: 600, color: '#4e342e' }}>{info.text}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums' }}>{info.proba.toFixed(3)}</td>
                      <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums' }}>{info.rate}/36</td>
                      <td style={styles.td}>
                        <div style={styles.percentCell}>
                          <div style={styles.percentBar}>
                            <div style={{ ...styles.percentFill, width: `${info.percentage}%`, backgroundColor: info.color }} />
                          </div>
                          <span style={styles.percentText}>{info.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr style={styles.totalRow}>
                    <td style={styles.td}><strong style={{ color: '#4e342e' }}>Any</strong></td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{any_resource.proba.toFixed(3)}</td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{any_resource.rate}/36</td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{any_resource.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlements list */}
          <div style={styles.section}>
            {(() => {
              const colonyCount = Object.values(settlements).filter(t => t === 'colony').length;
              const cityCount = Object.values(settlements).filter(t => t === 'city').length;
              return (
                <div style={styles.settlementGrid}>
                  <div style={styles.settlementCard}>
                    <div style={styles.settlementHeader}>
                      <span style={{ ...styles.settlementIcon, background: '#ef6c00' }}>{'\u25B2'}</span>
                      <span style={styles.settlementLabel}>Colonies</span>
                    </div>
                    <span style={{ ...styles.settlementCount, color: colonyCount > 5 ? '#c62828' : '#4e342e' }}>
                      {colonyCount}<span style={styles.settlementMax}>/5</span>
                    </span>
                  </div>
                  <div style={styles.settlementCard}>
                    <div style={styles.settlementHeader}>
                      <span style={{ ...styles.settlementIcon, background: '#1565c0', borderRadius: 5 }}>{'\u2605'}</span>
                      <span style={styles.settlementLabel}>Cities</span>
                    </div>
                    <span style={{ ...styles.settlementCount, color: cityCount > 4 ? '#c62828' : '#4e342e' }}>
                      {cityCount}<span style={styles.settlementMax}>/4</span>
                    </span>
                  </div>
                  <div style={styles.pointsCard}>
                    <span style={styles.pointsLabel}>Points</span>
                    <span style={styles.pointsValue}>{points}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    background: 'white',
    borderRadius: 14,
    border: '1px solid #e8e0d8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  title: {
    color: '#4e342e',
    margin: '0 0 16px 0',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 20px',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
    filter: 'grayscale(0.3)',
  },
  emptyText: {
    color: '#a1887f',
    fontSize: 14,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#6d4c41',
    margin: '0 0 10px 0',
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableWrap: {
    borderRadius: 8,
    border: '1px solid #f0ebe5',
    overflow: 'hidden',
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
  diceValue: {
    fontSize: 14,
  },
  resourceTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    marginRight: 3,
    marginBottom: 2,
    border: '1px solid',
  },
  totalRow: {
    backgroundColor: '#faf8f5',
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
  percentText: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 32,
    textAlign: 'right',
    color: '#4e342e',
  },
  settlementGrid: {
    display: 'flex',
    gap: 8,
  },
  settlementCard: {
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
  settlementHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  settlementIcon: {
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
  settlementLabel: {
    fontSize: 11,
    color: '#8d6e63',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  settlementCount: {
    fontSize: 22,
    fontWeight: 800,
  },
  settlementMax: {
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
    border: '2px solid #6d4c41',
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
