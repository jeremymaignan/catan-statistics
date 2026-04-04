import React from 'react';

// Same hex geometry as HexBoard
const HEX_SIZE = 70;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;
const PADDING_X = 80;
const PADDING_Y = 60;
const BOARD_ROWS = [3, 4, 5, 4, 3];

const RESOURCE_BOARD_COLORS = {
  wo: '#1b5e20', b: '#a0522d', o: '#9e9e9e',
  s: '#aed581', w: '#fdd835', r: '#efebe9',
};

const RESOURCE_LABELS = {
  wo: 'Wood', b: 'Brick', o: 'Ore',
  s: 'Sheep', w: 'Wheat', r: 'Desert',
};

const DARK_TILES = new Set(['#1b5e20', '#a0522d', '#9e9e9e']);

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

function hexPoints(cx, cy) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const v = hexVertex(cx, cy, i);
    pts.push(`${v.x},${v.y}`);
  }
  return pts.join(' ');
}

// Settlement vertex map (same as HexBoard)
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

// Port edges (must match backend PORT_EDGES order)
const PORT_EDGES = [
  ['a', 'b'], ['d', 'e'], ['o', 'p'], ['1', 'K'],
  ['S', 'T'], ['X', 'Y'], ['U', 'V'], ['B', 'L'], ['h', 'r'],
];

const PORT_COLORS = {
  'none':    { fill: '#e8e0d8', stroke: '#d7ccc8', text: '#bbb' },
  '3:1':    { fill: '#fff', stroke: '#6d4c41', text: '#4e342e' },
  'wo_port': { fill: '#1b5e20', stroke: '#1b5e20', text: '#fff' },
  'b_port':  { fill: '#a0522d', stroke: '#a0522d', text: '#fff' },
  'o_port':  { fill: '#9e9e9e', stroke: '#757575', text: '#fff' },
  's_port':  { fill: '#aed581', stroke: '#7cb342', text: '#33691e' },
  'w_port':  { fill: '#fdd835', stroke: '#f9a825', text: '#4e342e' },
};

const PORT_LABELS = {
  'none': '+', '3:1': '3:1',
  'wo_port': '\u{1F332} Wood', 'b_port': '\u{1F9F1} Brick', 'o_port': '\u{26F0}\uFE0F Ore',
  's_port': '\u{1F411} Sheep', 'w_port': '\u{1F33E} Wheat',
};

const PORT_SUBLABELS = {
  'wo_port': '2:1', 'b_port': '2:1', 'o_port': '2:1',
  's_port': '2:1', 'w_port': '2:1',
};

// Board center for outward direction
const BOARD_CENTER = (() => {
  const centers = Object.values(TILE_CENTERS);
  const cx = centers.reduce((s, c) => s + c.x, 0) / centers.length;
  const cy = centers.reduce((s, c) => s + c.y, 0) / centers.length;
  return { x: cx, y: cy };
})();

export default function SetupBoardPreview({ resources, values, ports, onPortClick }) {
  // Build hex data
  const hexData = [];
  let tileIdx = 0;
  for (let row = 0; row < BOARD_ROWS.length; row++) {
    const count = BOARD_ROWS[row];
    for (let col = 0; col < count; col++) {
      const tileNum = tileIdx + 1;
      const center = TILE_CENTERS[tileNum];
      hexData.push({
        ...center,
        resource: resources[tileIdx],
        value: parseInt(values[tileIdx], 10),
      });
      tileIdx++;
    }
  }

  return (
    <svg viewBox="-40 -20 940 740" className="hex-board-svg">
      <defs>
        <filter id="port-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>
      {/* Hexagons */}
      {hexData.map((hex, i) => {
        const boardColor = RESOURCE_BOARD_COLORS[hex.resource] || '#ccc';
        const isDark = DARK_TILES.has(boardColor);
        const isHot = hex.value === 6 || hex.value === 8;
        const label = RESOURCE_LABELS[hex.resource] || '';
        return (
          <g key={`hex-${i}`}>
            <polygon
              points={hexPoints(hex.x, hex.y)}
              fill={boardColor}
              stroke="#5d4037"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Resource name */}
            <text
              x={hex.x} y={hex.y - (hex.value > 0 ? 28 : 0)}
              textAnchor="middle" dominantBaseline="central"
              fontSize="13" fontWeight="600"
              fontFamily="'Inter', sans-serif"
              fill={isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)'}
            >
              {label}
            </text>
            {hex.value > 0 && (
              <>
                <circle
                  cx={hex.x} cy={hex.y} r="20"
                  fill="#faf8f5"
                  stroke={isHot ? '#c62828' : '#5d4037'}
                  strokeWidth={isHot ? 2 : 1}
                />
                <text
                  x={hex.x} y={hex.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="18" fontWeight={isHot ? '800' : '600'}
                  fontFamily="'Inter', sans-serif"
                  fill={isHot ? '#c62828' : '#3e2723'}
                >
                  {hex.value}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Port indicators */}
      {PORT_EDGES.map(([posA, posB], i) => {
        const pA = getSettlementPixel(posA);
        const pB = getSettlementPixel(posB);
        if (!pA || !pB) return null;

        // Midpoint of the two coastal vertices
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;

        // Perpendicular bisector direction (ensures equal distance to both vertices)
        const edgeDx = pB.x - pA.x;
        const edgeDy = pB.y - pA.y;
        // Two perpendicular candidates
        const perpX = -edgeDy;
        const perpY = edgeDx;
        // Pick the one pointing outward (away from board center)
        const toCenterX = BOARD_CENTER.x - midX;
        const toCenterY = BOARD_CENTER.y - midY;
        const dot = perpX * toCenterX + perpY * toCenterY;
        const sign = dot < 0 ? 1 : -1;
        const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
        const nx = sign * perpX / perpLen;
        const ny = sign * perpY / perpLen;
        const dist = 55;
        const badgeX = midX + nx * dist;
        const badgeY = midY + ny * dist;

        const portType = ports[i] || 'none';
        const colors = PORT_COLORS[portType];
        const label = PORT_LABELS[portType];
        const sublabel = PORT_SUBLABELS[portType];
        const isNone = portType === 'none';
        const lineColor = isNone ? '#ccc' : colors.stroke;

        return (
          <g
            key={`port-${i}`}
            onClick={() => onPortClick(i)}
            style={{ cursor: 'pointer' }}
          >
            {/* Lines from each vertex to the badge */}
            <line x1={pA.x} y1={pA.y} x2={badgeX} y2={badgeY} stroke={lineColor} strokeWidth="2" strokeLinecap="round" opacity={isNone ? 0.3 : 0.6} />
            <line x1={pB.x} y1={pB.y} x2={badgeX} y2={badgeY} stroke={lineColor} strokeWidth="2" strokeLinecap="round" opacity={isNone ? 0.3 : 0.6} />
            {/* Dots on vertices */}
            <circle cx={pA.x} cy={pA.y} r={isNone ? 3 : 5} fill={lineColor} opacity={isNone ? 0.4 : 0.8} />
            <circle cx={pB.x} cy={pB.y} r={isNone ? 3 : 5} fill={lineColor} opacity={isNone ? 0.4 : 0.8} />

            {isNone ? (
              <>
                <circle
                  cx={badgeX} cy={badgeY} r="16"
                  fill="#f5f1eb" stroke="#d7ccc8" strokeWidth="1.5"
                />
                <text
                  x={badgeX} y={badgeY}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="18" fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                  fill="#bbb"
                >
                  +
                </text>
              </>
            ) : (
              <>
                <rect
                  x={badgeX - 40} y={badgeY - (sublabel ? 22 : 14)}
                  width="80" height={sublabel ? 46 : 28}
                  rx="14"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                  filter="url(#port-shadow)"
                />
                <text
                  x={badgeX} y={badgeY + (sublabel ? -7 : 0)}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="13" fontWeight="700"
                  fontFamily="'Inter', sans-serif"
                  fill={colors.text}
                >
                  {label}
                </text>
                {sublabel && (
                  <text
                    x={badgeX} y={badgeY + 14}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="12" fontWeight="600"
                    fontFamily="'Inter', sans-serif"
                    fill={colors.text}
                    opacity="0.8"
                  >
                    {sublabel}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
