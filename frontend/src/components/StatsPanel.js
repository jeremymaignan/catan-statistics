import React, { useState } from 'react';

const DICE_PROBABILITIES = [
  { roll: 2,  combos: 1,  proba: '2.78%',  dots: 1 },
  { roll: 3,  combos: 2,  proba: '5.56%',  dots: 2 },
  { roll: 4,  combos: 3,  proba: '8.33%',  dots: 3 },
  { roll: 5,  combos: 4,  proba: '11.11%', dots: 4 },
  { roll: 6,  combos: 5,  proba: '13.89%', dots: 5 },
  { roll: 7,  combos: 6,  proba: '16.67%', dots: 6 },
  { roll: 8,  combos: 5,  proba: '13.89%', dots: 5 },
  { roll: 9,  combos: 4,  proba: '11.11%', dots: 4 },
  { roll: 10, combos: 3,  proba: '8.33%',  dots: 3 },
  { roll: 11, combos: 2,  proba: '5.56%',  dots: 2 },
  { roll: 12, combos: 1,  proba: '2.78%',  dots: 1 },
];

export default function StatsPanel({ statistics, settlements, points, boardScarcity }) {
  const [showDiceModal, setShowDiceModal] = useState(false);

  if (!statistics) return null;

  const { per_dice_value, per_resource, any_resource } = statistics;
  const hasStats = settlements && Object.keys(settlements).length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <h3 style={styles.title}>Statistics</h3>
        <button
          style={styles.diceBtn}
          onClick={() => setShowDiceModal(true)}
          title="Dice probabilities"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8d6e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8" cy="8" r="1.5" fill="#8d6e63" stroke="none" />
            <circle cx="16" cy="8" r="1.5" fill="#8d6e63" stroke="none" />
            <circle cx="8" cy="16" r="1.5" fill="#8d6e63" stroke="none" />
            <circle cx="16" cy="16" r="1.5" fill="#8d6e63" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="#8d6e63" stroke="none" />
          </svg>
        </button>
      </div>

      {/* Dice probability modal */}
      {showDiceModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDiceModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>Dice Roll Probabilities</h4>
              <button style={styles.modalClose} onClick={() => setShowDiceModal(false)}>
                {'\u2715'}
              </button>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Roll</th>
                    <th style={styles.th}>Combos</th>
                    <th style={styles.th}>Prob.</th>
                    <th style={{ ...styles.th, width: 90 }}>Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {DICE_PROBABILITIES.map((d) => {
                    const isHot = d.roll === 6 || d.roll === 8;
                    const isSeven = d.roll === 7;
                    return (
                      <tr key={d.roll} style={isSeven ? { backgroundColor: '#fff8e1' } : {}}>
                        <td style={styles.td}>
                          <span style={{
                            fontWeight: isHot || isSeven ? 800 : 600,
                            color: isHot ? '#c62828' : isSeven ? '#e65100' : '#4e342e',
                            fontSize: 14,
                          }}>{d.roll}</span>
                        </td>
                        <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums' }}>
                          {d.combos}/36
                        </td>
                        <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {d.proba}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dotsBar}>
                            <div style={{
                              ...styles.dotsFill,
                              width: `${(d.dots / 6) * 100}%`,
                              backgroundColor: isHot ? '#c62828' : isSeven ? '#e65100' : '#8d6e63',
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                          <span key={i} style={{
                            ...styles.resourceTag,
                            backgroundColor: r.blocked ? '#f5f5f5' : r.color + '18',
                            color: r.blocked ? '#bbb' : r.color,
                            borderColor: r.blocked ? '#ddd' : r.color + '44',
                            textDecoration: r.blocked ? 'line-through' : 'none',
                          }}>
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
                  {Object.entries(per_resource).map(([code, info]) => {
                    const isBlocked = info.blocked;
                    const blockedStyle = isBlocked ? { textDecoration: 'line-through', color: '#bbb' } : {};
                    return (
                      <tr key={code} style={isBlocked ? { opacity: 0.55 } : {}}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ ...styles.resColorDot, backgroundColor: isBlocked ? '#ccc' : info.color }} />
                            <span style={{ fontWeight: 600, color: '#4e342e', ...blockedStyle }}>{info.text}</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums', ...blockedStyle }}>{info.proba.toFixed(3)}</td>
                        <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums', ...blockedStyle }}>{info.rate}/36</td>
                        <td style={styles.td}>
                          <div style={styles.percentCell}>
                            <div style={styles.percentBar}>
                              <div style={{ ...styles.percentFill, width: `${info.percentage}%`, backgroundColor: isBlocked ? '#ccc' : info.color }} />
                            </div>
                            <span style={{ ...styles.percentText, ...blockedStyle }}>{info.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                      <span style={{ ...styles.settlementIcon, background: '#f9a825', borderRadius: 5 }}>{'\u25B2'}</span>
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

      {/* Board scarcity - always visible, at bottom */}
      {boardScarcity && Object.keys(boardScarcity).length > 0 && (() => {
        const entries = Object.entries(boardScarcity).sort((a, b) => b[1].total_rate - a[1].total_rate);
        const maxRate = Math.max(...entries.map(([, v]) => v.total_rate));
        return (
          <div style={{ marginTop: hasStats ? 0 : 20 }}>
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
                          <span style={{ fontWeight: 600, color: '#4e342e' }}>{info.text}</span>
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
      })()}
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
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: '#4e342e',
    margin: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
  },
  diceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    border: '1px solid #e8e0d8',
    borderRadius: 8,
    background: '#faf8f5',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: 14,
    padding: '20px 24px 24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#4e342e',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    color: '#a1887f',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 6,
    fontFamily: "'Inter', sans-serif",
  },
  dotsBar: {
    height: 6,
    backgroundColor: '#f0ebe5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dotsFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
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
