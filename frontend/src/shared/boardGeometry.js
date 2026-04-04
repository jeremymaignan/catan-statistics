/**
 * Shared hex board geometry constants and functions.
 * Used by HexBoard (game view) and SetupBoardPreview (setup view).
 */

export const HEX_SIZE = 70;
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;
export const PADDING_X = 80;
export const PADDING_Y = 60;
export const BOARD_ROWS = [3, 4, 5, 4, 3];

function computeTileCenters() {
  const centers = {};
  let tileNum = 1;
  for (let row = 0; row < BOARD_ROWS.length; row++) {
    const count = BOARD_ROWS[row];
    const maxCount = 5;
    const offsetX = (maxCount - count) * HEX_WIDTH / 2;
    for (let col = 0; col < count; col++) {
      const cx = PADDING_X + offsetX + col * HEX_WIDTH + HEX_WIDTH / 2;
      const cy = PADDING_Y + row * HEX_HEIGHT * 0.75 + HEX_HEIGHT / 2;
      centers[tileNum] = { x: cx, y: cy };
      tileNum++;
    }
  }
  return centers;
}

export const TILE_CENTERS = computeTileCenters();

export function hexVertex(cx, cy, vertexIndex) {
  const angle = (Math.PI / 180) * (60 * vertexIndex - 30);
  return {
    x: cx + HEX_SIZE * Math.cos(angle),
    y: cy + HEX_SIZE * Math.sin(angle),
  };
}

export function hexPoints(cx, cy) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const v = hexVertex(cx, cy, i);
    points.push(`${v.x},${v.y}`);
  }
  return points.join(' ');
}

export const SETTLEMENT_VERTEX_MAP = {
  'a': [1, 4], 'b': [1, 5], 'c': [1, 0], 'd': [2, 5], 'e': [2, 0], 'f': [3, 5], 'g': [3, 0],
  'h': [4, 4], 'i': [4, 5], 'j': [1, 2], 'k': [1, 1], 'l': [2, 2], 'm': [2, 1], 'n': [3, 2], 'o': [3, 1], 'p': [7, 0],
  'q': [8, 4], 'r': [8, 5], 's': [4, 2], 't': [4, 1], 'u': [5, 2], 'v': [5, 1], 'w': [6, 2], 'x': [6, 1], 'y': [7, 2], 'z': [7, 1], '1': [12, 0],
  'A': [8, 3], 'B': [8, 2], 'C': [8, 1], 'D': [9, 2], 'E': [9, 1], 'F': [10, 2], 'G': [10, 1], 'H': [11, 2], 'I': [11, 1], 'J': [12, 2], 'K': [12, 1],
  'L': [13, 3], 'M': [13, 2], 'N': [13, 1], 'O': [14, 2], 'P': [14, 1], 'Q': [15, 2], 'R': [15, 1], 'S': [16, 2], 'T': [16, 1],
  'U': [17, 3], 'V': [17, 2], 'W': [17, 1], 'X': [18, 2], 'Y': [18, 1], 'Z': [19, 2], '2': [19, 1],
};

export function getSettlementPixel(pos) {
  const mapping = SETTLEMENT_VERTEX_MAP[pos];
  if (!mapping) return null;
  const [tileNum, vertexIdx] = mapping;
  const center = TILE_CENTERS[tileNum];
  if (!center) return null;
  return hexVertex(center.x, center.y, vertexIdx);
}

export const BOARD_CENTER = (() => {
  const centers = Object.values(TILE_CENTERS);
  const cx = centers.reduce((s, c) => s + c.x, 0) / centers.length;
  const cy = centers.reduce((s, c) => s + c.y, 0) / centers.length;
  return { x: cx, y: cy };
})();

/**
 * Port edges: pairs of settlement positions that form each port.
 * Order must match backend PORT_EDGES.
 */
export const PORT_EDGES = [
  ['a', 'b'], ['d', 'e'], ['o', 'p'], ['1', 'K'],
  ['S', 'T'], ['X', 'Y'], ['U', 'V'], ['B', 'L'], ['h', 'r'],
];

/**
 * Colors considered dark enough to need white text overlay.
 */
export const DARK_TILES = new Set(['#1b5e20', '#2d6a2d', '#2e7d32', '#616161', '#546e7a', '#c62828', '#a0522d', '#9e9e9e']);
