import React from 'react';
import { RESOURCES } from '../shared/constants';

const PADDING = 54;        // extra space around the chart for labels
const RADIUS = 85;         // outer ring radius
const CENTER = RADIUS + PADDING;
const SIZE = CENTER * 2;
const LEVELS = 4;          // concentric grid rings
const MAX_RATE = 16;       // max expected rate per resource (for scale)

// Pre-compute vertex angles: start from top (-90°), one per resource
const ANGLES = RESOURCES.map((_, i) => (Math.PI * 2 * i) / RESOURCES.length - Math.PI / 2);

function polarToXY(angle, r) {
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}

function pentagonPoints(r) {
  return ANGLES.map(a => polarToXY(a, r));
}

function pointsToString(pts) {
  return pts.map(p => `${p.x},${p.y}`).join(' ');
}

export default function ResourceRadar({ perResource }) {
  if (!perResource) return null;

  // Build data array aligned with RESOURCES order
  const data = RESOURCES.map(r => {
    const info = perResource[r.code];
    const rate = info && !info.blocked ? (info.rate || 0) : 0;
    return { ...r, rate };
  });

  // Scale each rate to a radius
  const dataPoints = data.map((d, i) => {
    const r = (d.rate / MAX_RATE) * RADIUS;
    return polarToXY(ANGLES[i], Math.max(r, 2)); // min 2px so dot is visible
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}>
      {/* Grid rings */}
      {Array.from({ length: LEVELS }, (_, lvl) => {
        const r = (RADIUS / LEVELS) * (lvl + 1);
        const pts = pentagonPoints(r);
        return (
          <polygon
            key={`grid-${lvl}`}
            points={pointsToString(pts)}
            fill="none"
            stroke="var(--border-main)"
            strokeWidth={lvl === LEVELS - 1 ? 1.2 : 0.7}
            opacity={0.5}
          />
        );
      })}

      {/* Axis lines */}
      {ANGLES.map((a, i) => {
        const outer = polarToXY(a, RADIUS);
        return (
          <line
            key={`axis-${i}`}
            x1={CENTER} y1={CENTER}
            x2={outer.x} y2={outer.y}
            stroke="var(--border-main)"
            strokeWidth="0.7"
            opacity="0.4"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={pointsToString(dataPoints)}
        fill="var(--tip-info-border)"
        fillOpacity="0.3"
        stroke="var(--tip-info-text)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.x} cy={p.y}
          r="3.5"
          fill="var(--tip-info-text)"
        />
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const labelR = RADIUS + 20;
        const pos = polarToXY(ANGLES[i], labelR);
        // Adjust text anchor based on position
        const angle = ANGLES[i];
        const isLeft = Math.cos(angle) < -0.2;
        const isRight = Math.cos(angle) > 0.2;
        const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
        // Nudge Y for top/bottom
        const isTop = Math.sin(angle) < -0.3;
        const yOffset = isTop ? -4 : 4;

        return (
          <g key={`label-${i}`}>
            <text
              x={pos.x}
              y={pos.y + yOffset}
              textAnchor={anchor}
              dominantBaseline="central"
              fontSize="28"
              fontFamily="'Inter', sans-serif"
            >
              {d.emoji}
            </text>
            <text
              x={pos.x}
              y={pos.y + yOffset + 22}
              textAnchor={anchor}
              dominantBaseline="central"
              fontSize="11"
              fontWeight="600"
              fontFamily="'Inter', sans-serif"
              fill="var(--text-muted)"
            >
              {d.rate}/36
            </text>
          </g>
        );
      })}
    </svg>
  );
}
