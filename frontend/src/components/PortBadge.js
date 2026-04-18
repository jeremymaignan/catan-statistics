import React from 'react';
import { getSettlementPixel, BOARD_CENTER } from '../shared/boardGeometry';
import { PORT_COLORS, PORT_EMOJI_LABELS, PORT_SUBLABELS } from '../shared/constants';

/**
 * Compute the badge position for a port given its two vertex positions.
 * Badge sits on the perpendicular bisector of the edge, offset outward from the board center.
 */
export function computePortBadgePos(posA, posB, dist) {
  const pA = getSettlementPixel(posA);
  const pB = getSettlementPixel(posB);
  if (!pA || !pB) return null;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  const edgeDx = pB.x - pA.x;
  const edgeDy = pB.y - pA.y;
  const perpX = -edgeDy;
  const perpY = edgeDx;
  const toCenterX = BOARD_CENTER.x - midX;
  const toCenterY = BOARD_CENTER.y - midY;
  const dot = perpX * toCenterX + perpY * toCenterY;
  const sign = dot < 0 ? 1 : -1;
  const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;

  return {
    pA,
    pB,
    badgeX: midX + sign * perpX / perpLen * dist,
    badgeY: midY + sign * perpY / perpLen * dist,
  };
}

/**
 * Render a port pill badge with connecting lines and vertex dots.
 * Used by both HexBoard (game view) and SetupBoardPreview (setup view).
 *
 * Props:
 *  - portType: '3:1' | 'wo_port' | ... | 'none'
 *  - badgeX, badgeY: position of the badge center
 *  - pA, pB: vertex pixel positions
 *  - textTransform: optional transform string for counter-rotation
 */
export default function PortBadge({ portType, badgeX, badgeY, pA, pB, textTransform }) {
  const colors = PORT_COLORS[portType] || PORT_COLORS['3:1'];
  const label = PORT_EMOJI_LABELS[portType] || portType;
  const sublabel = PORT_SUBLABELS[portType] || '';

  return (
    <>
      {/* Lines from each vertex to the badge */}
      <line x1={pA.x} y1={pA.y} x2={badgeX} y2={badgeY} stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1={pB.x} y1={pB.y} x2={badgeX} y2={badgeY} stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Dots on vertices */}
      <circle cx={pA.x} cy={pA.y} r="5" fill={colors.stroke} opacity="0.8" />
      <circle cx={pB.x} cy={pB.y} r="5" fill={colors.stroke} opacity="0.8" />
      {/* Port pill badge */}
      <g transform={textTransform}>
        <rect
          x={badgeX - 40}
          y={badgeY - (sublabel ? 22 : 14)}
          width="80"
          height={sublabel ? 46 : 28}
          rx="14"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1.5"
          filter="url(#port-shadow)"
        />
        <text
          x={badgeX}
          y={badgeY + (sublabel ? -7 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="700"
          fontFamily="'Inter', sans-serif"
          fill={colors.text}
        >
          {label}
        </text>
        {sublabel && (
          <text
            x={badgeX}
            y={badgeY + 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight="600"
            fontFamily="'Inter', sans-serif"
            fill={colors.text}
            opacity="0.8"
          >
            {sublabel}
          </text>
        )}
      </g>
    </>
  );
}
