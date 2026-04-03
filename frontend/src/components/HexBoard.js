import React from 'react';

// Hex geometry: flat-top hexagons
const HEX_SIZE = 70;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

const PADDING_X = 80;
const PADDING_Y = 60;

const BOARD_ROWS = [3, 4, 5, 4, 3];

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

const TILE_CENTERS = computeTileCenters();

function hexVertex(cx, cy, vertexIndex) {
  const angle = (Math.PI / 180) * (60 * vertexIndex - 30);
  return {
    x: cx + HEX_SIZE * Math.cos(angle),
    y: cy + HEX_SIZE * Math.sin(angle),
  };
}

const SETTLEMENT_VERTEX_MAP = {
  'a': [1, 4], 'b': [1, 5], 'c': [1, 0], 'd': [2, 5], 'e': [2, 0], 'f': [3, 5], 'g': [3, 0],
  'h': [4, 4], 'i': [4, 5], 'j': [1, 2], 'k': [1, 1], 'l': [2, 2], 'm': [2, 1], 'n': [3, 2], 'o': [3, 1], 'p': [7, 0],
  'q': [8, 4], 'r': [8, 5], 's': [4, 2], 't': [4, 1], 'u': [5, 2], 'v': [5, 1], 'w': [6, 2], 'x': [6, 1], 'y': [7, 2], 'z': [7, 1], '1': [12, 0],
  'A': [8, 3], 'B': [8, 2], 'C': [8, 1], 'D': [9, 2], 'E': [9, 1], 'F': [10, 2], 'G': [10, 1], 'H': [11, 2], 'I': [11, 1], 'J': [12, 2], 'K': [12, 1],
  'L': [13, 3], 'M': [13, 2], 'N': [13, 1], 'O': [14, 2], 'P': [14, 1], 'Q': [15, 2], 'R': [15, 1], 'S': [16, 2], 'T': [16, 1],
  'U': [17, 3], 'V': [17, 2], 'W': [17, 1], 'X': [18, 2], 'Y': [18, 1], 'Z': [19, 2], '2': [19, 1],
};

function getSettlementPixel(pos) {
  const mapping = SETTLEMENT_VERTEX_MAP[pos];
  if (!mapping) return null;
  const [tileNum, vertexIdx] = mapping;
  const center = TILE_CENTERS[tileNum];
  if (!center) return null;
  return hexVertex(center.x, center.y, vertexIdx);
}

function hexPoints(cx, cy) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const v = hexVertex(cx, cy, i);
    points.push(`${v.x},${v.y}`);
  }
  return points.join(' ');
}

// Dark tile colors where white text is needed for readability
const DARK_TILES = new Set(['#1b5e20', '#2d6a2d', '#2e7d32', '#616161', '#546e7a', '#c62828', '#8d6e63']);

export default function HexBoard({ tiles, positions, onPositionClick }) {
  if (!tiles || tiles.length === 0) return null;

  const hexData = [];
  let tileIdx = 0;
  for (let row = 0; row < BOARD_ROWS.length; row++) {
    const count = BOARD_ROWS[row];
    for (let col = 0; col < count; col++) {
      const tileNum = tileIdx + 1;
      const center = TILE_CENTERS[tileNum];
      hexData.push({ ...center, tile: tiles[tileIdx] });
      tileIdx++;
    }
  }

  return (
    <svg width="860" height="690" viewBox="0 0 860 690" style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <filter id="hexShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4e342e" floodOpacity="0.15" />
        </filter>
        <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Draw hexagons */}
      {hexData.map((hex, i) => {
        const isHot = hex.tile.value === 6 || hex.tile.value === 8;
        const isDark = DARK_TILES.has(hex.tile.board_color);
        return (
          <g key={`hex-${i}`} filter="url(#hexShadow)">
            <polygon
              points={hexPoints(hex.x, hex.y)}
              fill={hex.tile.board_color}
              stroke="#5d4037"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <text
              x={hex.x}
              y={hex.y - 14}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fontFamily="'Inter', sans-serif"
              fill={isDark ? 'rgba(255,255,255,0.9)' : '#4e342e'}
            >
              {hex.tile.text}
            </text>
            {hex.tile.value > 0 && (
              <>
                <circle cx={hex.x} cy={hex.y + 14} r="22" fill="#faf8f5" stroke={isHot ? '#c62828' : '#a1887f'} strokeWidth={isHot ? 2 : 1.5} />
                <text
                  x={hex.x}
                  y={hex.y + 19}
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight={isHot ? '800' : '600'}
                  fontFamily="'Inter', sans-serif"
                  fill={isHot ? '#c62828' : '#4e342e'}
                >
                  {hex.tile.value}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Draw settlement positions */}
      {positions && Object.entries(positions).map(([pos, info]) => {
        const pixel = getSettlementPixel(pos);
        if (!pixel) return null;

        const { status } = info;
        const isClickable = status === 'available' || status === 'colony' || status === 'city';

        return (
          <g
            key={`pos-${pos}`}
            onClick={() => isClickable ? onPositionClick(pos) : null}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            filter={status === 'colony' || status === 'city' ? 'url(#markerGlow)' : undefined}
          >
            {status === 'colony' ? (
              <>
                <circle cx={pixel.x} cy={pixel.y} r="13" fill="#ef6c00" stroke="#e65100" strokeWidth="2" />
                <text x={pixel.x} y={pixel.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="white" fontWeight="bold">
                  {'\u25B2'}
                </text>
              </>
            ) : status === 'city' ? (
              <>
                <rect x={pixel.x - 13} y={pixel.y - 13} width="26" height="26" rx="5" fill="#1565c0" stroke="#0d47a1" strokeWidth="2" />
                <text x={pixel.x} y={pixel.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="15" fill="white" fontWeight="bold">
                  {'\u2605'}
                </text>
              </>
            ) : status === 'blocked' ? (
              <circle cx={pixel.x} cy={pixel.y} r="5" fill="#ccc" opacity="0.5" />
            ) : status === 'available' ? (
              <>
                <circle cx={pixel.x} cy={pixel.y} r="10" fill="white" stroke="#43a047" strokeWidth="2.5" opacity="0.85" />
                <circle cx={pixel.x} cy={pixel.y} r="3" fill="#43a047" opacity="0.6" />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
