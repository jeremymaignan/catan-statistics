import React, { useState, useMemo } from 'react';
import SetupBoardPreview from './SetupBoardPreview';
import { ALL_RESOURCES } from '../shared/constants';
import { ALL_COASTAL_EDGES } from '../shared/boardGeometry';
import '../responsive.css';

const RESOURCE_OPTIONS = ALL_RESOURCES;

const VALUE_OPTIONS = [0, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12];

// Official Catan base game distribution
const EXPECTED_RESOURCES = { wo: 4, b: 3, o: 3, s: 4, w: 4, r: 1 };
const EXPECTED_NUMBERS = { '0': 1, '2': 1, '3': 2, '4': 2, '5': 2, '6': 2, '8': 2, '9': 2, '10': 2, '11': 2, '12': 1 };

// Default board for quick setup (standard Catan layout)
const DEFAULT_RESOURCES = ['o', 'wo', 's', 'w', 'b', 's', 'b', 'wo', 'w', 'r', 'wo', 'o', 's', 'w', 'o', 'b', 'wo', 's', 'w'];
const DEFAULT_VALUES = ['10', '2', '9', '12', '6', '4', '10', '9', '11', '0', '3', '8', '8', '3', '4', '5', '5', '6', '11'];

// Helper: edge key from a pair of positions
const edgeKey = (a, b) => `${a}-${b}`;

// Expected port distribution (standard Catan)
const EXPECTED_PORTS = {
  'wo_port': 1,
  'o_port': 1,
  'w_port': 1,
  'b_port': 1,
  's_port': 1,
  '3:1': 4,
};

const PORT_VALIDATION_ORDER = [
  { code: '3:1', label: '3:1', emoji: '\u{1F6A2}', color: '#6d4c41' },
  { code: 'wo_port', label: 'Wood', emoji: '\u{1F332}', color: '#1b5e20' },
  { code: 'b_port', label: 'Brick', emoji: '\u{1F9F1}', color: '#a0522d' },
  { code: 'o_port', label: 'Ore', emoji: '\u{26F0}\uFE0F', color: '#757575' },
  { code: 's_port', label: 'Sheep', emoji: '\u{1F411}', color: '#aed581' },
  { code: 'w_port', label: 'Wheat', emoji: '\u{1F33E}', color: '#fdd835' },
];

export default function SetupForm({ onCreateGame, onUploadImage, loading }) {
  const [mode, setMode] = useState('manual');
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState(DEFAULT_RESOURCES);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [ports, setPorts] = useState({}); // { "a-b": "3:1", ... }
  const [file, setFile] = useState(null);

  // Compute which edges are blocked (adjacent to a placed port in the cycle)
  const blockedEdges = useMemo(() => {
    const blocked = new Set();
    const n = ALL_COASTAL_EDGES.length; // 30
    for (let i = 0; i < n; i++) {
      const [a, b] = ALL_COASTAL_EDGES[i];
      const key = edgeKey(a, b);
      if (ports[key]) {
        // Block the previous and next edges in the cycle
        const prev = (i - 1 + n) % n;
        const next = (i + 1) % n;
        const [pa, pb] = ALL_COASTAL_EDGES[prev];
        const [na, nb] = ALL_COASTAL_EDGES[next];
        blocked.add(edgeKey(pa, pb));
        blocked.add(edgeKey(na, nb));
      }
    }
    return blocked;
  }, [ports]);

  const handleResourceChange = (index, value) => {
    const updated = [...resources];
    updated[index] = value;
    if (value === 'r') {
      const updatedValues = [...values];
      updatedValues[index] = '0';
      setValues(updatedValues);
    }
    setResources(updated);
  };

  const handleValueChange = (index, value) => {
    const updated = [...values];
    updated[index] = value;
    setValues(updated);
  };

  const handlePortCycle = (key) => {
    const portOrder = ['none', '3:1', 'wo_port', 'b_port', 'o_port', 's_port', 'w_port'];
    const current = ports[key] || 'none';
    const currentIdx = portOrder.indexOf(current);
    const next = portOrder[(currentIdx + 1) % portOrder.length];
    setPorts(prev => {
      const updated = { ...prev };
      if (next === 'none') {
        delete updated[key];
      } else {
        updated[key] = next;
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only submit on step 2 (manual) or image mode
    if (mode === 'manual' && step !== 2) return;
    if (mode === 'manual') {
      // Convert ports object to list of {type, positions} for backend
      const portsList = Object.entries(ports).map(([key, type]) => {
        const [posA, posB] = key.split('-');
        return { type, positions: [posA, posB] };
      });
      onCreateGame(resources, values, portsList);
    } else if (file) {
      onUploadImage(file);
    }
  };

  const rowStructure = [3, 4, 5, 4, 3];

  // Step 1: tile config + validation
  const renderStep1 = () => (
    <div className="setup-layout">
      <div className="board-setup">
        {(() => {
          let tileIdx = 0;
          return rowStructure.map((count, rowIdx) => (
            <div key={rowIdx} className="tile-row">
              {Array.from({ length: count }).map((_, colIdx) => {
                const idx = tileIdx++;
                const resColor = RESOURCE_OPTIONS.find(r => r.code === resources[idx])?.color || '#999';
                return (
                  <div key={idx} className="tile-card" style={{ ...styles.tileCard, borderLeftColor: resColor }}>
                    <select
                      value={resources[idx]}
                      onChange={(e) => handleResourceChange(idx, e.target.value)}
                      style={{
                        ...styles.select,
                        backgroundColor: resColor + '18',
                        color: resColor,
                        fontWeight: 600,
                      }}
                    >
                      {RESOURCE_OPTIONS.map((r) => (
                        <option key={r.code} value={r.code}>{r.label}</option>
                      ))}
                    </select>
                    <select
                      value={values[idx]}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      style={{
                        ...styles.select,
                        ...(resources[idx] === 'r' ? { opacity: 0.4 } : {}),
                        fontWeight: (values[idx] === '6' || values[idx] === '8') ? 700 : 500,
                        color: (values[idx] === '6' || values[idx] === '8') ? '#c62828' : 'var(--text-primary)',
                      }}
                      disabled={resources[idx] === 'r'}
                    >
                      {VALUE_OPTIONS.map((v) => (
                        <option key={v} value={String(v)}>{v === 0 ? '-' : v}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          ));
        })()}
      </div>

      {/* Validation sidebar */}
      {(() => {
        const resCounts = {};
        resources.forEach(r => { resCounts[r] = (resCounts[r] || 0) + 1; });
        const numCounts = {};
        values.forEach(v => { numCounts[v] = (numCounts[v] || 0) + 1; });
        const resValid = RESOURCE_OPTIONS.every(r => (resCounts[r.code] || 0) === EXPECTED_RESOURCES[r.code]);
        const numValid = Object.entries(EXPECTED_NUMBERS).every(([k, v]) => (numCounts[k] || 0) === v);

        return (
          <div className="validation-sidebar">
            <div className="validation-row-2col" style={styles.validationRow2Col}>
              <div style={{ ...styles.validationBlock, borderTopColor: resValid ? '#43a047' : '#ef5350', flex: 1 }}>
                <h4 style={styles.validationTitle}>
                  Resources
                  <span style={{ ...styles.checkBadge, background: resValid ? '#e8f5e9' : '#ffebee', color: resValid ? '#2e7d32' : '#c62828' }}>
                    {resValid ? '\u2713' : '\u2717'}
                  </span>
                </h4>
                <div style={styles.validationList}>
                  {RESOURCE_OPTIONS.map(r => {
                    const current = resCounts[r.code] || 0;
                    const expected = EXPECTED_RESOURCES[r.code];
                    const isOk = current === expected;
                    return (
                      <div key={r.code} style={{ ...styles.validationRow, backgroundColor: isOk ? 'transparent' : '#fef2f2' }}>
                        <span style={{ ...styles.colorDot, backgroundColor: r.color }} />
                        <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>{r.emoji} {r.label}</span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: isOk ? '#43a047' : '#c62828',
                        }}>
                          {current}<span style={{ color: 'var(--text-hint)', fontWeight: 400 }}>/{expected}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ ...styles.validationBlock, borderTopColor: numValid ? '#43a047' : '#ef5350', flex: 1 }}>
                <h4 style={styles.validationTitle}>
                  Values
                  <span style={{ ...styles.checkBadge, background: numValid ? '#e8f5e9' : '#ffebee', color: numValid ? '#2e7d32' : '#c62828' }}>
                    {numValid ? '\u2713' : '\u2717'}
                  </span>
                </h4>
                <div style={styles.validationList}>
                  {Object.entries(EXPECTED_NUMBERS).filter(([n]) => n !== '0').map(([num, expected]) => {
                    const current = numCounts[num] || 0;
                    const isOk = current === expected;
                    const isHot = num === '6' || num === '8';
                    return (
                      <div key={num} style={{ ...styles.validationRow, backgroundColor: isOk ? 'transparent' : '#fef2f2' }}>
                        <span style={{
                          ...styles.numBadge,
                          backgroundColor: isHot ? '#c62828' : 'var(--text-secondary)',
                          color: 'white',
                        }}>
                          {num}
                        </span>
                        <span style={{ flex: 1 }} />
                        <span style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: isOk ? '#43a047' : '#c62828',
                        }}>
                          {current}<span style={{ color: 'var(--text-hint)', fontWeight: 400 }}>/{expected}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  // Step 2: board preview with clickable ports + validation sidebar
  const renderStep2 = () => {
    // Count current ports by type
    const portCounts = {};
    Object.values(ports).forEach(type => {
      portCounts[type] = (portCounts[type] || 0) + 1;
    });
    const portsValid = PORT_VALIDATION_ORDER.every(
      p => (portCounts[p.code] || 0) === EXPECTED_PORTS[p.code]
    );

    return (
      <div className="setup-layout">
        <div className="board-setup" style={{ flex: 1, minWidth: 0 }}>
          <SetupBoardPreview
            resources={resources}
            values={values}
            ports={ports}
            blockedEdges={blockedEdges}
            onPortClick={handlePortCycle}
          />
        </div>
        <div className="validation-sidebar">
          <div style={{ ...styles.validationBlock, borderTopColor: portsValid ? '#43a047' : '#ef5350' }}>
            <h4 style={styles.validationTitle}>
              Ports
              <span style={{ ...styles.checkBadge, background: portsValid ? '#e8f5e9' : '#ffebee', color: portsValid ? '#2e7d32' : '#c62828' }}>
                {portsValid ? '\u2713' : '\u2717'}
              </span>
            </h4>
            <div style={styles.validationList}>
              {PORT_VALIDATION_ORDER.map(p => {
                const current = portCounts[p.code] || 0;
                const expected = EXPECTED_PORTS[p.code];
                const isOk = current === expected;
                return (
                  <div key={p.code} style={{ ...styles.validationRow, backgroundColor: isOk ? 'transparent' : '#fef2f2' }}>
                    <span style={{ ...styles.colorDot, backgroundColor: p.color }} />
                    <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>{p.emoji} {p.label}</span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: isOk ? '#43a047' : '#c62828',
                    }}>
                      {current}<span style={{ color: 'var(--text-hint)', fontWeight: 400 }}>/{expected}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleWrap}>
        <h2 style={styles.title}>New Game Setup</h2>
      </div>

      {/* Mode toggle (only on step 1) */}
      {step === 1 && (
        <div className="mode-toggle">
          <button
            style={{ ...styles.modeBtn, ...(mode === 'manual' ? styles.modeActive : {}) }}
            onClick={() => setMode('manual')}
            type="button"
          >
            Manual Setup
          </button>
          <button
            style={{ ...styles.modeBtn, ...styles.modeDisabled }}
            type="button"
            disabled
          >
            From Picture <span style={styles.comingSoon}>coming soon</span>
          </button>
        </div>
      )}

      {/* Step indicator (manual mode only) */}
      {mode === 'manual' && (
        <>
          <div style={styles.stepIndicator}>
            <div style={{ ...styles.stepDot, ...(step === 1 ? styles.stepDotActive : styles.stepDotDone) }}>1</div>
            <div style={styles.stepLine} />
            <div style={{ ...styles.stepDot, ...(step === 2 ? styles.stepDotActive : {}) }}>2</div>
          </div>
          <p style={styles.stepDescription}>
            {step === 1
              ? 'Configure the resource and number for each tile on the board'
              : 'Click on port badges around the board to set their type'}
          </p>
        </>
      )}

      <form onSubmit={handleSubmit}>
        {mode === 'manual' ? (
          step === 1 ? renderStep1() : renderStep2()
        ) : (
          <div style={styles.uploadSection}>
            <div className="upload-box" style={styles.uploadBox}>
              <div style={styles.uploadIcon}>&#128247;</div>
              <p style={styles.uploadHint}>Upload a screenshot of your Catan board</p>
              <p style={styles.uploadSub}>The app will use OpenAI Vision to parse it</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.fileInput}
              />
              {file && <p style={styles.fileName}>{file.name}</p>}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={styles.buttonRow}>
          {mode === 'manual' && step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              style={styles.backBtn}
            >
              Back
            </button>
          )}
          {mode === 'manual' && step === 1 ? (
            <button
              key="next"
              type="button"
              onClick={() => setStep(2)}
              style={styles.submitBtn}
            >
              Next
            </button>
          ) : (
            <button
              key="submit"
              type="submit"
              disabled={loading || (mode === 'image' && !file)}
              style={{ ...styles.submitBtn, ...(loading ? styles.btnDisabled : {}) }}
            >
              {loading ? 'Creating...' : 'Start Game'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
  },
  titleWrap: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 24,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    background: 'var(--toggle-bg)',
    color: 'var(--text-hint)',
    transition: 'all 0.2s',
  },
  stepDotActive: {
    background: 'var(--btn-gradient)',
    color: 'white',
    boxShadow: '0 2px 6px rgba(93, 64, 55, 0.3)',
  },
  stepDotDone: {
    background: '#43a047',
    color: 'white',
  },
  stepLine: {
    width: 40,
    height: 2,
    background: 'var(--border-light)',
  },
  stepDescription: {
    textAlign: 'center',
    fontSize: 14,
    color: 'var(--text-muted)',
    fontWeight: 500,
    margin: '-12px 0 20px',
    fontFamily: "'Inter', sans-serif",
  },
  modeBtn: {
    padding: '11px 28px',
    border: 'none',
    borderRadius: 9,
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
  },
  modeActive: {
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  modeDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  tileCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '10px 8px',
    border: '1px solid var(--border-main)',
    borderLeft: '3px solid',
    borderRadius: 10,
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow-card)',
  },
  select: {
    padding: '7px 8px',
    borderRadius: 7,
    border: '1px solid var(--border-light)',
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    background: 'var(--card-bg)',
    color: 'var(--text-body)',
  },
  step2Container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  portHint: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--text-hint)',
    margin: '8px 0 0',
    fontWeight: 500,
  },
  uploadSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0',
  },
  uploadBox: {
    textAlign: 'center',
    padding: '40px 60px',
    border: '2px dashed var(--border-light)',
    borderRadius: 16,
    background: 'var(--card-bg)',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 12,
    filter: 'grayscale(0.3)',
  },
  uploadHint: {
    color: 'var(--text-body)',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 4,
  },
  uploadSub: {
    color: 'var(--text-hint)',
    fontSize: 13,
    marginBottom: 16,
  },
  fileInput: {
    margin: '0 auto',
    fontSize: 13,
  },
  fileName: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    marginTop: 8,
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
  },
  submitBtn: {
    display: 'block',
    padding: '14px 56px',
    background: 'var(--btn-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(93, 64, 55, 0.3)',
    transition: 'all 0.2s',
    minWidth: 200,
  },
  backBtn: {
    display: 'block',
    padding: '14px 40px',
    background: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: 140,
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  validationRow2Col: {
    display: 'flex',
    gap: 14,
  },
  validationBlock: {
    padding: '16px 14px',
    background: 'var(--card-bg)',
    borderRadius: 12,
    border: '1px solid var(--border-main)',
    borderTop: '3px solid',
    boxShadow: 'var(--shadow-card)',
  },
  validationTitle: {
    margin: '0 0 12px 0',
    fontSize: 15,
    color: 'var(--text-primary)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    fontSize: 12,
    fontWeight: 700,
  },
  validationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  validationRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 7,
    fontSize: 14,
    gap: 10,
    transition: 'background 0.2s',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  numBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 22,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    padding: '0 5px',
  },
  comingSoon: {
    fontSize: 10,
    fontWeight: 500,
    color: 'var(--text-hint)',
    fontStyle: 'italic',
    marginLeft: 4,
  },
};
