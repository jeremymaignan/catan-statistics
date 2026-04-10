import React, { useState } from 'react';
import { RESOURCE_EMOJIS } from '../shared/constants';

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

export default function StatsPanel({ statistics, settlements }) {
  const [showDiceModal, setShowDiceModal] = useState(false);

  if (!statistics) return null;

  const { per_dice_value, per_resource, any_resource } = statistics;
  const hasStats = settlements && Object.keys(settlements).length > 0;

  return (
    <div>
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
                      <tr key={d.roll} style={isSeven ? { backgroundColor: 'var(--tip-warning-bg)' } : {}}>
                        <td style={styles.td}>
                          <span style={{
                            fontWeight: isHot || isSeven ? 800 : 600,
                            color: isHot ? '#c62828' : isSeven ? '#e65100' : 'var(--text-primary)',
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
          <p style={styles.emptyText}>Click on a position on the board to place a settlement.</p>
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
                          color: (value === '6' || value === '8') ? '#c62828' : 'var(--text-primary)',
                          fontWeight: (value === '6' || value === '8') ? 800 : 600,
                        }}>{value}</span>
                      </td>
                      <td style={styles.td}>
                        {resources.map((r, i) => (
                          <span key={i} style={{
                            ...styles.resourceTag,
                            backgroundColor: r.blocked ? 'var(--card-inner-bg)' : r.color + '18',
                            color: r.blocked ? 'var(--text-disabled)' : r.color,
                            borderColor: r.blocked ? 'var(--border-main)' : r.color + '44',
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
                  {Object.entries(per_resource).sort((a, b) => (b[1].rate || 0) - (a[1].rate || 0)).map(([code, info]) => {
                    const isBlocked = info.blocked;
                    const blockedStyle = isBlocked ? { textDecoration: 'line-through', color: 'var(--text-disabled)' } : {};
                    return (
                      <tr key={code} style={isBlocked ? { opacity: 0.55 } : {}}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ ...styles.resColorDot, backgroundColor: isBlocked ? 'var(--text-disabled)' : info.color }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', ...blockedStyle }}>{RESOURCE_EMOJIS[code] || ''} {info.text}</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums', ...blockedStyle }}>{info.proba.toFixed(3)}</td>
                        <td style={{ ...styles.td, fontVariantNumeric: 'tabular-nums', ...blockedStyle }}>{info.rate}/36</td>
                        <td style={styles.td}>
                          <div style={styles.percentCell}>
                            <div style={styles.percentBar}>
                              <div style={{ ...styles.percentFill, width: `${info.percentage}%`, backgroundColor: isBlocked ? 'var(--text-disabled)' : info.color }} />
                            </div>
                            <span style={{ ...styles.percentText, ...blockedStyle }}>{info.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={styles.totalRow}>
                    <td style={styles.td}><strong style={{ color: 'var(--text-primary)' }}>Any</strong></td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{any_resource.proba.toFixed(3)}</td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{any_resource.rate}/36</td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{any_resource.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      <div style={styles.diceBtnRow}>
        <button
          style={styles.diceBtn}
          onClick={() => setShowDiceModal(true)}
          title="Dice probabilities"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8" cy="8" r="1.5" fill="var(--text-muted)" stroke="none" />
            <circle cx="16" cy="8" r="1.5" fill="var(--text-muted)" stroke="none" />
            <circle cx="8" cy="16" r="1.5" fill="var(--text-muted)" stroke="none" />
            <circle cx="16" cy="16" r="1.5" fill="var(--text-muted)" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="var(--text-muted)" stroke="none" />
          </svg>
          <span style={styles.diceBtnText}>Dice probabilities</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  diceBtnRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 12,
  },
  diceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid var(--border-main)',
    borderRadius: 8,
    background: 'var(--card-inner-bg)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: '4px 10px',
    fontFamily: "'Inter', sans-serif",
  },
  diceBtnText: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--modal-overlay)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--card-bg)',
    borderRadius: 14,
    padding: '20px 24px 24px',
    boxShadow: 'var(--shadow-modal)',
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
    color: 'var(--text-primary)',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    color: 'var(--text-hint)',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 6,
    fontFamily: "'Inter', sans-serif",
  },
  dotsBar: {
    height: 6,
    backgroundColor: 'var(--bar-bg)',
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
    color: 'var(--text-hint)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
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
    backgroundColor: 'var(--table-header-bg)',
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
  percentText: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 32,
    textAlign: 'right',
    color: 'var(--text-primary)',
  },
};
