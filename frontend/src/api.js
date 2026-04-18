const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// ── Global error listener ────────────────────────────────
let _onApiError = null;

/** Register a callback that fires on every 4xx / 5xx / network error. */
export function onApiError(cb) {
  _onApiError = cb;
}

function emitError(message) {
  if (_onApiError) _onApiError(message);
}

/**
 * Wrapper around fetch that automatically emits errors for non-ok responses
 * and network failures.
 */
async function apiFetch(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    const msg = 'Network error — please check your connection.';
    emitError(msg);
    throw new Error(msg);
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch { /* ignore parse errors */ }
    emitError(msg);
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

// ── API functions ────────────────────────────────────────

export async function createGame(resources, values, ports) {
  return apiFetch(`${API_BASE}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resources, values, ports }),
  });
}

export async function createGameFromImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch(`${API_BASE}/api/games/parse`, {
    method: 'POST',
    body: formData,
  });
}

export async function getGame(gameId) {
  return apiFetch(`${API_BASE}/api/games/${gameId}`);
}

export async function cycleSettlement(gameId, position) {
  return apiFetch(`${API_BASE}/api/games/${gameId}/settlements/${position}`, {
    method: 'PATCH',
  });
}

export async function moveRobber(gameId, tileIndex) {
  return apiFetch(`${API_BASE}/api/games/${gameId}/robber/${tileIndex}`, {
    method: 'PATCH',
  });
}

export async function cloneGame(gameId) {
  return apiFetch(`${API_BASE}/api/games/${gameId}/clone`, {
    method: 'POST',
  });
}

export async function getProbabilities() {
  return apiFetch(`${API_BASE}/api/probabilities`);
}
