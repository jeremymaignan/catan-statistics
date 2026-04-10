const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export async function createGame(resources, values, ports) {
  const res = await fetch(`${API_BASE}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resources, values, ports }),
  });
  return res.json();
}

export async function createGameFromImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/games/parse`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function getGame(gameId) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}`);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to load game');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function cycleSettlement(gameId, position) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/settlements/${position}`, {
    method: 'PATCH',
  });
  return res.json();
}

export async function moveRobber(gameId, tileIndex) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/robber/${tileIndex}`, {
    method: 'PATCH',
  });
  return res.json();
}

export async function cloneGame(gameId) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/clone`, {
    method: 'POST',
  });
  return res.json();
}

export async function getProbabilities() {
  const res = await fetch(`${API_BASE}/api/probabilities`);
  return res.json();
}
