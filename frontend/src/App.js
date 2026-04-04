import React, { useState, useEffect } from 'react';
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
import { createGame, createGameFromImage, getGame, cycleSettlement, moveRobber, cloneGame } from './api';
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
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
        .catch(() => {
          localStorage.removeItem('catan_game_id');
          updateUrl(null);
          setGameId(null);
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
    setError(null);
    try {
      const data = await createGame(resources, values, ports);
      if (data.error) throw new Error(data.error);
      saveGameId(data.id);
      const state = await getGame(data.id);
      setBoardState(state);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUploadImage = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createGameFromImage(file);
      if (data.error) throw new Error(data.error);
      saveGameId(data.id);
      const state = await getGame(data.id);
      setBoardState(state);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handlePositionClick = async (position) => {
    if (!gameId) return;
    setError(null);
    try {
      const data = await cycleSettlement(gameId, position);
      if (data.error) throw new Error(data.error);
      setBoardState(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTileClick = async (tileIndex) => {
    if (!gameId) return;
    setError(null);
    try {
      const data = await moveRobber(gameId, tileIndex);
      if (data.error) throw new Error(data.error);
      setBoardState(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewGame = () => {
    localStorage.removeItem('catan_game_id');
    updateUrl(null);
    setGameId(null);
    setBoardState(null);
    setError(null);
  };

  const handleShare = async () => {
    if (!gameId || copied) return;
    setError(null);
    try {
      const data = await cloneGame(gameId);
      if (data.error) throw new Error(data.error);
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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div className="header-inner" style={styles.headerInner}>
          <h1 className="header-title" style={styles.headerTitle}>Catan Companion</h1>
          <div className="header-actions" style={styles.headerActions}>
            {gameId && (
              <>
                <button onClick={handleShare} style={styles.shareBtn}>
                  {copied ? 'Copied!' : 'Share'}
                </button>
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
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {!gameId ? (
          <SetupForm
            onCreateGame={handleCreateGame}
            onUploadImage={handleUploadImage}
            loading={loading}
          />
        ) : boardState ? (
          <div className="game-layout">
            <div className="board-section">
              <div className="board-wrapper">
                <HexBoard
                  tiles={boardState.tiles}
                  positions={boardState.positions}
                  ports={boardState.ports}
                  onPositionClick={handlePositionClick}
                  onTileClick={handleTileClick}
                />
                <BoardLegend />
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
  shareBtn: {
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
  error: {
    background: 'var(--error-bg)',
    color: 'var(--error-text)',
    padding: '12px 20px',
    marginBottom: 20,
    borderRadius: 10,
    border: '1px solid var(--error-border)',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
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
};
