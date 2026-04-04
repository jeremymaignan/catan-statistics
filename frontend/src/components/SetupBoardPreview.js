import React from 'react';
import { BOARD_ROWS, TILE_CENTERS, hexPoints, getSettlementPixel, BOARD_CENTER, PORT_EDGES, DARK_TILES } from '../shared/boardGeometry';
import { RESOURCE_BOARD_COLORS, RESOURCE_LABELS, PORT_COLORS, PORT_EMOJI_LABELS, PORT_SUBLABELS } from '../shared/constants';

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
        const label = PORT_EMOJI_LABELS[portType];
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
