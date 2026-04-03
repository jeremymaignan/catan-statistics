import React, { useState, useEffect } from 'react';
import HexBoard from './components/HexBoard';
import SetupForm from './components/SetupForm';
import StatsPanel from './components/StatsPanel';
import { createGame, createGameFromImage, getGame, cycleSettlement } from './api';

export default function App() {
  const [gameId, setGameId] = useState(() => localStorage.getItem('catan_game_id'));
  const [boardState, setBoardState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore game state on load if we have a saved gameId
  useEffect(() => {
    if (gameId && !boardState) {
      setLoading(true);
      getGame(gameId)
        .then(state => {
          setBoardState(state);
        })
        .catch(() => {
          localStorage.removeItem('catan_game_id');
          setGameId(null);
        })
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line
  }, []);

  const saveGameId = (id) => {
    setGameId(id);
    localStorage.setItem('catan_game_id', id);
  };

  const handleCreateGame = async (resources, values) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createGame(resources, values);
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

  const handleNewGame = () => {
    localStorage.removeItem('catan_game_id');
    setGameId(null);
    setBoardState(null);
    setError(null);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.headerTitle}>Catan Statistics</h1>
          {gameId && (
            <button onClick={handleNewGame} style={styles.newGameBtn}>
              New Game
            </button>
          )}
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
          <div style={styles.gameLayout}>
            <div style={styles.boardSection}>
              <HexBoard
                tiles={boardState.tiles}
                positions={boardState.positions}
                onPositionClick={handlePositionClick}
              />
              <p style={styles.hint}>
                Click: <span style={{ color: '#43a047', fontWeight: 600 }}>empty</span> &rarr; colony &rarr; city &rarr; removed
              </p>
            </div>
            <div style={styles.statsSection}>
              <StatsPanel
                statistics={boardState.statistics}
                settlements={boardState.settlements}
                points={boardState.points}
              />
            </div>
          </div>
        ) : (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={{ color: '#8d6e63', marginTop: 12, fontSize: 14 }}>Loading game...</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    minHeight: '100vh',
    background: '#f5f1eb',
  },
  header: {
    background: 'linear-gradient(135deg, #4e342e 0%, #6d4c41 100%)',
    color: 'white',
    padding: '0 24px',
    boxShadow: '0 2px 12px rgba(78, 52, 46, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1280,
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
  main: {
    padding: '24px 20px',
    maxWidth: 1280,
    margin: '0 auto',
  },
  error: {
    background: '#fef2f2',
    color: '#b91c1c',
    padding: '12px 20px',
    marginBottom: 20,
    borderRadius: 10,
    border: '1px solid #fecaca',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
  },
  gameLayout: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
  },
  boardSection: {
    flex: '1 1 600px',
    minWidth: 0,
  },
  statsSection: {
    flex: '0 0 380px',
    minWidth: 300,
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#a1887f',
    marginTop: 10,
    fontWeight: 500,
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
    border: '3px solid #d7ccc8',
    borderTopColor: '#6d4c41',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
