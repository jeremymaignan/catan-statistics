import React, { useState } from 'react';
import SetupBoardPreview from './SetupBoardPreview';
import '../responsive.css';

const RESOURCE_OPTIONS = [
  { code: 'wo', label: 'Wood', emoji: '\u{1F332}', color: '#1b5e20' },
  { code: 'b', label: 'Brick', emoji: '\u{1F9F1}', color: '#a0522d' },
  { code: 'o', label: 'Ore', emoji: '\u{26F0}\uFE0F', color: '#757575' },
  { code: 's', label: 'Sheep', emoji: '\u{1F411}', color: '#aed581' },
  { code: 'w', label: 'Wheat', emoji: '\u{1F33E}', color: '#fdd835' },
  { code: 'r', label: 'Desert', emoji: '\u{1F3DC}\uFE0F', color: '#a1887f' },
];

const VALUE_OPTIONS = [0, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12];

// Official Catan base game distribution
const EXPECTED_RESOURCES = { wo: 4, b: 3, o: 3, s: 4, w: 4, r: 1 };
const EXPECTED_NUMBERS = { '0': 1, '2': 1, '3': 2, '4': 2, '5': 2, '6': 2, '8': 2, '9': 2, '10': 2, '11': 2, '12': 1 };

// Default board for quick setup (standard Catan layout)
const DEFAULT_RESOURCES = ['o', 'wo', 's', 'w', 'b', 's', 'b', 'wo', 'w', 'r', 'wo', 'o', 's', 'w', 'o', 'b', 'wo', 's', 'w'];
const DEFAULT_VALUES = ['10', '2', '9', '12', '6', '4', '10', '9', '11', '0', '3', '8', '8', '3', '4', '5', '5', '6', '11'];
const DEFAULT_PORTS = ['3:1', 'wo_port', '3:1', 'o_port', '3:1', 's_port', '3:1', 'b_port', 'w_port'];

export default function SetupForm({ onCreateGame, onUploadImage, loading }) {
  const [mode, setMode] = useState('manual');
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState(DEFAULT_RESOURCES);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [ports, setPorts] = useState(DEFAULT_PORTS);
  const [file, setFile] = useState(null);

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

  const handlePortCycle = (index) => {
    const portOrder = ['none', '3:1', 'wo_port', 'b_port', 'o_port', 's_port', 'w_port'];
    const updated = [...ports];
    const currentIdx = portOrder.indexOf(updated[index]);
    updated[index] = portOrder[(currentIdx + 1) % portOrder.length];
    setPorts(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only submit on step 2 (manual) or image mode
    if (mode === 'manual' && step !== 2) return;
    if (mode === 'manual') {
      onCreateGame(resources, values, ports);
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
                        color: (values[idx] === '6' || values[idx] === '8') ? '#c62828' : '#4e342e',
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
                        <span style={{ flex: 1, fontWeight: 500, color: '#4e342e' }}>{r.emoji} {r.label}</span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: isOk ? '#43a047' : '#c62828',
                        }}>
                          {current}<span style={{ color: '#bcaaa4', fontWeight: 400 }}>/{expected}</span>
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
                          backgroundColor: isHot ? '#c62828' : '#6d4c41',
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
                          {current}<span style={{ color: '#bcaaa4', fontWeight: 400 }}>/{expected}</span>
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

  // Step 2: board preview with clickable ports
  const renderStep2 = () => (
    <div style={styles.step2Container}>
      <SetupBoardPreview
        resources={resources}
        values={values}
        ports={ports}
        onPortClick={handlePortCycle}
      />
    </div>
  );

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
            style={{ ...styles.modeBtn, ...(mode === 'image' ? styles.modeActive : {}) }}
            onClick={() => setMode('image')}
            type="button"
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
    color: '#4e342e',
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
    background: '#ede7e0',
    color: '#a1887f',
    transition: 'all 0.2s',
  },
  stepDotActive: {
    background: 'linear-gradient(135deg, #5d4037 0%, #795548 100%)',
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
    background: '#d7ccc8',
  },
  stepDescription: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8d6e63',
    fontWeight: 500,
    margin: '-12px 0 20px',
    fontFamily: "'Inter', sans-serif",
  },
  modeBtn: {
    padding: '11px 28px',
    border: 'none',
    borderRadius: 9,
    background: 'transparent',
    color: '#8d6e63',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
  },
  modeActive: {
    background: 'white',
    color: '#4e342e',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  tileCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '10px 8px',
    border: '1px solid #e8e0d8',
    borderLeft: '3px solid',
    borderRadius: 10,
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  select: {
    padding: '7px 8px',
    borderRadius: 7,
    border: '1px solid #e0d6cc',
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    background: 'white',
  },
  step2Container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  portHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#a1887f',
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
    border: '2px dashed #d7ccc8',
    borderRadius: 16,
    background: 'white',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 12,
    filter: 'grayscale(0.3)',
  },
  uploadHint: {
    color: '#5d4037',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 4,
  },
  uploadSub: {
    color: '#a1887f',
    fontSize: 13,
    marginBottom: 16,
  },
  fileInput: {
    margin: '0 auto',
    fontSize: 13,
  },
  fileName: {
    color: '#6d4c41',
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
    background: 'linear-gradient(135deg, #5d4037 0%, #795548 100%)',
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
    background: 'white',
    color: '#6d4c41',
    border: '1px solid #d7ccc8',
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
    background: 'white',
    borderRadius: 12,
    border: '1px solid #e8e0d8',
    borderTop: '3px solid',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  validationTitle: {
    margin: '0 0 12px 0',
    fontSize: 15,
    color: '#4e342e',
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
    color: '#a1887f',
    fontStyle: 'italic',
    marginLeft: 4,
  },
};
