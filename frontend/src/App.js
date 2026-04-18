import React, { useState, useEffect, useCallback, useRef } from 'react';
import HexBoard from './components/HexBoard';
import SetupForm from './components/SetupForm';
import StatsPanel from './components/StatsPanel';
import TradingCard from './components/TradingCard';
import ScarcityCard from './components/ScarcityCard';
import SettlementsCard from './components/SettlementsCard';
import TipsCard from './components/TipsCard';
import BoardLegend from './components/BoardLegend';
import CollapsibleCard from './components/CollapsibleCard';
import { ThemeProvider, useTheme } from './shared/ThemeContext';
import { createGame, createGameFromImage, getGame, cycleSettlement, moveRobber, cloneGame, onApiError } from './api';
import './responsive.css';

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} style={styles.themeBtn} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? '\u2600\uFE0F' : '\u{1F319}'}
    </button>
  );
}

function AppContent() {
  const [gameId, setGameId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGameId = params.get('game');
    if (urlGameId) return urlGameId;
    return localStorage.getItem('catan_game_id');
  });
  const [boardState, setBoardState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const boardAreaRef = useRef(null);

  const addToast = useCallback((message) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Subscribe to global API errors
  useEffect(() => {
    onApiError((msg) => addToast(msg));
  }, [addToast]);

  // Scroll board to center when zoom changes
  useEffect(() => {
    const el = boardAreaRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoom]);

  const updateUrl = (id) => {
    const url = new URL(window.location);
    if (id) {
      url.searchParams.set('game', id);
    } else {
      url.searchParams.delete('game');
    }
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    if (gameId && !boardState) {
      setLoading(true);
      updateUrl(gameId);
      getGame(gameId)
        .then(state => {
          setBoardState(state);
          localStorage.setItem('catan_game_id', gameId);
        })
        .catch((err) => {
          if (err.status === 404 || err.status === 400) {
            localStorage.removeItem('catan_game_id');
            setNotFound(true);
          } else {
            localStorage.removeItem('catan_game_id');
            updateUrl(null);
            setGameId(null);
          }
        })
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line
  }, []);

  const saveGameId = (id) => {
    setGameId(id);
    localStorage.setItem('catan_game_id', id);
    updateUrl(id);
  };

  const handleCreateGame = async (resources, values, ports) => {
    setLoading(true);
    try {
      const data = await createGame(resources, values, ports);
      saveGameId(data.id);
      const state = await getGame(data.id);
      setBoardState(state);
    } catch { /* toast fires automatically via onApiError */ }
    setLoading(false);
  };

  const handleUploadImage = async (file) => {
    setLoading(true);
    try {
      const data = await createGameFromImage(file);
      saveGameId(data.id);
      const state = await getGame(data.id);
      setBoardState(state);
    } catch { /* toast fires automatically via onApiError */ }
    setLoading(false);
  };

  const handlePositionClick = async (position) => {
    if (!gameId) return;
    try {
      const data = await cycleSettlement(gameId, position);
      setBoardState(data);
    } catch { /* toast fires automatically via onApiError */ }
  };

  const handleTileClick = async (tileIndex) => {
    if (!gameId) return;
    try {
      const data = await moveRobber(gameId, tileIndex);
      setBoardState(data);
    } catch { /* toast fires automatically via onApiError */ }
  };

  const handleNewGame = () => {
    localStorage.removeItem('catan_game_id');
    updateUrl(null);
    setGameId(null);
    setBoardState(null);
    setNotFound(false);
  };

  const handleShare = async () => {
    if (!gameId || copied) return;
    try {
      const data = await cloneGame(gameId);
      const shareUrl = new URL(window.location);
      shareUrl.searchParams.set('game', data.id);
      const url = shareUrl.toString();
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* toast fires automatically via onApiError */ }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div className="header-inner" style={styles.headerInner}>
          <h1 className="header-title" style={styles.headerTitle}>Catan Companion</h1>
          <div className="header-actions" style={styles.headerActions}>
            {gameId && (
              <>
                <div className="share-wrap" style={styles.shareWrap}>
                  <button onClick={handleShare} style={styles.shareBtn}>
                    {copied ? 'Copied!' : 'Share'}
                    <span style={styles.shareInfo}>?</span>
                  </button>
                  <div className="share-tooltip" style={styles.shareTooltip}>
                    Share the board layout with other players. Creates a fresh copy with the same tiles and ports. Your settlements won't be shared.
                  </div>
                </div>
                <button onClick={handleNewGame} style={styles.newGameBtn}>
                  New Game
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {notFound ? (
          <div style={styles.notFoundWrap}>
            <div style={styles.notFoundCard}>
              <div style={styles.notFoundIcon}>&#127922;</div>
              <h2 style={styles.notFoundTitle}>Game Not Found</h2>
              <p style={styles.notFoundText}>
                This game doesn't exist or the link may have expired.
              </p>
              <button onClick={handleNewGame} style={styles.notFoundBtn}>
                Create a New Game
              </button>
            </div>
          </div>
        ) : !gameId ? (
          <SetupForm
            onCreateGame={handleCreateGame}
            onUploadImage={handleUploadImage}
            loading={loading}
          />
        ) : boardState ? (
          <div className="game-layout">
            <div className="board-section">
              <div className="board-area" ref={boardAreaRef}>
                <div style={{ width: `${zoom}%`, margin: '0 auto' }}>
                  <HexBoard
                    tiles={boardState.tiles}
                    positions={boardState.positions}
                    ports={boardState.ports}
                    onPositionClick={handlePositionClick}
                    onTileClick={handleTileClick}
                    rotation={rotation}
                  />
                </div>
              </div>
              <div className="board-toolbar">
                <BoardLegend />
                <div style={styles.toolbarDivider} />
                <button
                  onClick={() => setZoom(z => Math.max(50, z - 10))}
                  style={{ ...styles.toolbarBtn, ...(zoom <= 50 ? styles.toolbarBtnDisabled : {}) }}
                  title="Zoom out"
                  disabled={zoom <= 50}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <button
                  onClick={() => setZoom(z => Math.min(200, z + 10))}
                  style={{ ...styles.toolbarBtn, ...(zoom >= 200 ? styles.toolbarBtnDisabled : {}) }}
                  title="Zoom in"
                  disabled={zoom >= 200}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <div style={styles.toolbarDivider} />
                <button
                  onClick={() => setRotation((r) => r + 90)}
                  style={styles.toolbarBtn}
                  title="Rotate board 90°"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="stats-section">
              {boardState.settlements && Object.keys(boardState.settlements).length > 0 && (
                <CollapsibleCard title="Settlements">
                  <SettlementsCard
                    settlements={boardState.settlements}
                    points={boardState.points}
                  />
                </CollapsibleCard>
              )}
              <div style={{ marginTop: 16 }}>
                <CollapsibleCard title="Tips">
                  <TipsCard
                    statistics={boardState.statistics}
                    ports={boardState.ports}
                    settlements={boardState.settlements}
                    boardScarcity={boardState.board_scarcity}
                    positions={boardState.positions}
                    tiles={boardState.tiles}
                  />
                </CollapsibleCard>
              </div>
              <div style={{ marginTop: 16 }}>
                <CollapsibleCard title="Statistics">
                  <StatsPanel
                    statistics={boardState.statistics}
                    settlements={boardState.settlements}
                  />
                </CollapsibleCard>
              </div>
              <div style={{ marginTop: 16 }}>
                <CollapsibleCard title="Trading Rates">
                  <TradingCard
                    ports={boardState.ports}
                    settlements={boardState.settlements}
                  />
                </CollapsibleCard>
              </div>
              <div style={{ marginTop: 16 }}>
                <CollapsibleCard title="Resource Availability" defaultOpen={false}>
                  <ScarcityCard
                    boardScarcity={boardState.board_scarcity}
                  />
                </CollapsibleCard>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 14 }}>Loading game...</p>
          </div>
        )}
      </main>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div style={styles.toastContainer}>
          {toasts.map(t => (
            <div key={t.id} className="toast-slide-in" style={styles.toast}>
              <span style={styles.toastIcon}>&#x26A0;&#xFE0F;</span>
              <span style={styles.toastMsg}>{t.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={styles.toastClose}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    minHeight: '100vh',
    background: 'var(--page-bg)',
    transition: 'background 0.3s',
  },
  header: {
    background: 'var(--header-gradient)',
    color: 'white',
    padding: '0 24px',
    boxShadow: 'var(--shadow-header)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  headerTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  shareWrap: {
    position: 'relative',
  },
  shareBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 18px',
    background: 'rgba(255,255,255,0.25)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
    minWidth: 72,
  },
  shareInfo: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 15,
    height: 15,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1,
    opacity: 0.7,
  },
  shareTooltip: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    padding: '10px 14px',
    background: 'var(--card-bg, #fff)',
    color: 'var(--text-body, #333)',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
    width: 240,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    border: '1px solid var(--border-main, #ddd)',
    zIndex: 200,
    pointerEvents: 'none',
  },
  newGameBtn: {
    padding: '7px 18px',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
  },
  themeBtn: {
    padding: '5px 8px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    transition: 'all 0.2s',
  },
  main: {
    padding: '24px 12px',
    maxWidth: 1400,
    margin: '0 auto',
  },
  toastContainer: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 380,
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'var(--error-bg)',
    color: 'var(--error-text)',
    border: '1px solid var(--error-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.4,
  },
  toastIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  toastMsg: {
    flex: 1,
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: 'var(--error-text)',
    fontSize: 18,
    cursor: 'pointer',
    padding: '0 2px',
    opacity: 0.6,
    flexShrink: 0,
    lineHeight: 1,
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid var(--border-light)',
    borderTopColor: 'var(--text-secondary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  toolbarBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: 'var(--text-body)',
    padding: 0,
  },
  toolbarBtnDisabled: {
    opacity: 0.3,
    cursor: 'default',
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    background: 'var(--border-main)',
  },
  notFoundWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  notFoundCard: {
    textAlign: 'center',
    background: 'var(--card-bg)',
    borderRadius: 16,
    padding: '48px 40px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border-subtle)',
    maxWidth: 420,
    width: '100%',
  },
  notFoundIcon: {
    fontSize: 64,
    marginBottom: 16,
    filter: 'grayscale(0.3)',
  },
  notFoundTitle: {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
  },
  notFoundText: {
    margin: '0 0 28px',
    fontSize: 15,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  notFoundBtn: {
    padding: '12px 32px',
    background: 'var(--header-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
};
