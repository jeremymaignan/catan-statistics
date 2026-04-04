import React, { useState } from 'react';

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
const DARK_TILES = new Set(['#1b5e20', '#2d6a2d', '#2e7d32', '#616161', '#546e7a', '#c62828', '#a0522d']);

// Return color based on rank percentile: green (top third), yellow (middle), red (bottom third)
function getRankColor(rank, totalRanks) {
  if (totalRanks <= 1) return { fill: '#43a047', stroke: '#2e7d32', text: '#2e7d32' }; // green
  const pct = (rank - 1) / (totalRanks - 1); // 0 = best, 1 = worst
  if (pct < 0.33) return { fill: '#43a047', stroke: '#2e7d32', text: '#fff' };  // green
  if (pct < 0.66) return { fill: '#f9a825', stroke: '#f57f17', text: '#fff' };  // yellow
  return { fill: '#e53935', stroke: '#c62828', text: '#fff' };                  // red
}

// Dots string for rate visualization (like dice dots)
function dotsForRate(rate) {
  return '\u2022'.repeat(rate);
}

export default function HexBoard({ tiles, positions, onPositionClick, onTileClick }) {
  const [hoveredPos, setHoveredPos] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

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

  const handleMouseEnter = (pos, info, pixel) => {
    setHoveredPos(pos);
    setTooltipData({ pos, info, pixel });
  };

  const handleMouseLeave = () => {
    setHoveredPos(null);
    setTooltipData(null);
  };

  // Calculate tooltip position (keep within SVG bounds)
  const getTooltipPos = (pixel) => {
    const tooltipW = 160;
    const tooltipH = 120;
    let tx = pixel.x + 18;
    let ty = pixel.y - tooltipH / 2;

    // If too far right, flip to left side
    if (tx + tooltipW > 840) tx = pixel.x - tooltipW - 18;
    // Keep within vertical bounds
    if (ty < 10) ty = 10;
    if (ty + tooltipH > 670) ty = 670 - tooltipH;

    return { x: tx, y: ty };
  };

  return (
    <svg width="860" height="690" viewBox="0 0 860 690" style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <filter id="hexShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4e342e" floodOpacity="0.15" />
        </filter>
        <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
        </filter>
        <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Draw hexagons */}
      {hexData.map((hex, i) => {
        const isHot = hex.tile.value === 6 || hex.tile.value === 8;
        const isDark = DARK_TILES.has(hex.tile.board_color);
        const hasRobber = hex.tile.has_robber;
        return (
          <g
            key={`hex-${i}`}
            filter="url(#hexShadow)"
            onClick={() => onTileClick && onTileClick(hex.tile.index)}
            style={{ cursor: onTileClick ? 'pointer' : 'default' }}
          >
            <polygon
              points={hexPoints(hex.x, hex.y)}
              fill={hex.tile.board_color}
              stroke={hasRobber ? '#1a1a1a' : '#5d4037'}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Grey overlay when robber is on the tile */}
            {hasRobber && (
              <polygon
                points={hexPoints(hex.x, hex.y)}
                fill="rgba(0,0,0,0.35)"
                stroke="none"
              />
            )}
            <text
              x={hex.x}
              y={hex.y - 14}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fontFamily="'Inter', sans-serif"
              fill={hasRobber ? 'rgba(255,255,255,0.7)' : isDark ? 'rgba(255,255,255,0.9)' : '#4e342e'}
            >
              {hex.tile.text}
            </text>
            {hex.tile.value > 0 && (
              <>
                <circle cx={hex.x} cy={hex.y + 14} r="22" fill={hasRobber ? '#e0e0e0' : '#faf8f5'} stroke={hasRobber ? '#1a1a1a' : isHot ? '#c62828' : '#a1887f'} strokeWidth={hasRobber ? 2 : isHot ? 2 : 1.5} />
                <text
                  x={hex.x}
                  y={hex.y + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  fontWeight={isHot ? '800' : '600'}
                  fontFamily="'Inter', sans-serif"
                  fill={hasRobber ? '#1a1a1a' : isHot ? '#c62828' : '#4e342e'}
                >
                  {hex.tile.value}
                </text>
                {hasRobber && (
                  <g>
                    {/* Black interdit circle */}
                    <circle cx={hex.x} cy={hex.y + 14} r="22" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                    {/* Diagonal cross line */}
                    <line x1={hex.x - 15} y1={hex.y + 29} x2={hex.x + 15} y2={hex.y - 1} stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
                  </g>
                )}
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
        const isHovered = hoveredPos === pos;
        const rankColors = getRankColor(info.rank, info.total_ranks || 1);

        return (
          <g
            key={`pos-${pos}`}
            onClick={() => isClickable ? onPositionClick(pos) : null}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            filter={status === 'colony' || status === 'city' ? 'url(#markerGlow)' : undefined}
            onMouseEnter={() => status === 'available' ? handleMouseEnter(pos, info, pixel) : null}
            onMouseLeave={handleMouseLeave}
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
                <circle
                  cx={pixel.x}
                  cy={pixel.y}
                  r={isHovered ? 14 : 12}
                  fill={rankColors.fill}
                  stroke={rankColors.stroke}
                  strokeWidth="2"
                  opacity={isHovered ? 1 : 0.9}
                />
                <text
                  x={pixel.x}
                  y={pixel.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isHovered ? 12 : 11}
                  fontWeight="700"
                  fontFamily="'Inter', sans-serif"
                  fill={rankColors.text}
                >
                  {info.rank}
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      {/* Tooltip */}
      {tooltipData && (() => {
        const { info, pixel } = tooltipData;
        const tileDetails = info.tile_details || [];
        const nonDesert = tileDetails.filter(t => t.value > 0);
        const rowHeight = 20;
        const headerH = 28;
        const footerH = 22;
        const tooltipW = 155;
        const tooltipH = headerH + nonDesert.length * rowHeight + footerH + 4;
        const tp = getTooltipPos(pixel);

        return (
          <g filter="url(#tooltipShadow)" style={{ pointerEvents: 'none' }}>
            <rect
              x={tp.x}
              y={tp.y}
              width={tooltipW}
              height={tooltipH}
              rx="8"
              fill="white"
              stroke="#d7ccc8"
              strokeWidth="1"
            />
            {/* Header */}
            <text
              x={tp.x + tooltipW / 2}
              y={tp.y + 17}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="'Inter', sans-serif"
              fill="#4e342e"
            >
              Rank #{info.rank} — Score {info.score}
            </text>
            <line x1={tp.x + 8} y1={tp.y + headerH} x2={tp.x + tooltipW - 8} y2={tp.y + headerH} stroke="#ede7e0" strokeWidth="1" />

            {/* Resource rows */}
            {nonDesert.map((tile, i) => {
              const ry = tp.y + headerH + 4 + i * rowHeight;
              return (
                <g key={i}>
                  {/* Resource color dot */}
                  <circle cx={tp.x + 14} cy={ry + 9} r="5" fill={tile.color} />
                  {/* Resource name */}
                  <text
                    x={tp.x + 24}
                    y={ry + 9}
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="'Inter', sans-serif"
                    fill={tile.has_robber ? '#bbb' : '#4e342e'}
                    textDecoration={tile.has_robber ? 'line-through' : 'none'}
                  >
                    {tile.text}
                  </text>
                  {/* Dice value */}
                  <text
                    x={tp.x + 90}
                    y={ry + 9}
                    dominantBaseline="central"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="'Inter', sans-serif"
                    fill={tile.has_robber ? '#bbb' : (tile.value === 6 || tile.value === 8) ? '#c62828' : '#5d4037'}
                  >
                    {tile.value}
                  </text>
                  {/* Dots */}
                  <text
                    x={tp.x + 105}
                    y={ry + 9}
                    dominantBaseline="central"
                    fontSize="9"
                    fontFamily="'Inter', sans-serif"
                    fill={tile.has_robber ? '#ccc' : '#8d6e63'}
                    letterSpacing="-1"
                  >
                    {dotsForRate(tile.rate)}
                  </text>
                </g>
              );
            })}

            {/* Footer: total */}
            <line
              x1={tp.x + 8}
              y1={tp.y + headerH + nonDesert.length * rowHeight + 4}
              x2={tp.x + tooltipW - 8}
              y2={tp.y + headerH + nonDesert.length * rowHeight + 4}
              stroke="#ede7e0"
              strokeWidth="1"
            />
            <text
              x={tp.x + tooltipW / 2}
              y={tp.y + tooltipH - 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fontFamily="'Inter', sans-serif"
              fill="#6d4c41"
            >
              Total: {info.score}/36
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
