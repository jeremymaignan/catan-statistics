const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export async function createGame(resources, values) {
  const res = await fetch(`${API_BASE}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resources, values }),
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
  return res.json();
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

export async function getProbabilities() {
  const res = await fetch(`${API_BASE}/api/probabilities`);
  return res.json();
}
