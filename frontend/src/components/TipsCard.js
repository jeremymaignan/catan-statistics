import React from 'react';
import { RESOURCES, RESOURCE_BY_CODE, computeTradingRates } from '../shared/constants';
import { styles } from '../styles/TipsCard.styles';

// ── Tip severity levels ─────────────────────────────────────────────
const TIP_STYLES = {
  danger:  { icon: '\u{1F6A8}',    bg: 'var(--tip-danger-bg)',  border: 'var(--tip-danger-border)',  color: 'var(--tip-danger-text)' },
  warning: { icon: '\u26A0\uFE0F', bg: 'var(--tip-warning-bg)', border: 'var(--tip-warning-border)', color: 'var(--tip-warning-text)' },
  success: { icon: '\u2705',       bg: 'var(--tip-success-bg)', border: 'var(--tip-success-border)', color: 'var(--tip-success-text)' },
  info:    { icon: '\u{1F4A1}',    bg: 'var(--tip-info-bg)',    border: 'var(--tip-info-border)',    color: 'var(--tip-info-text)' },
};

const TIP_ORDER = { danger: 0, warning: 1, success: 2, info: 3 };

// ── Helpers (available to all generators) ────────────────────────────

function getActiveRates(perResource) {
  const rates = {};
  for (const [code, info] of Object.entries(perResource)) {
    if (!info.blocked) rates[code] = info.rate || 0;
  }
  return rates;
}

/**
 * Context object passed to every tip generator.
 * Extend this when you need more derived data for new tip types.
 */
function buildContext(statistics, ports, settlements, boardScarcity, positions, tiles) {
  const perResource = statistics?.per_resource || {};
  const activeRates = getActiveRates(perResource);
  const tradingRates = computeTradingRates(ports, settlements);
  const missing = RESOURCES.filter(r => !(r.code in activeRates));

  // Build a tile lookup by 1-based index for quick access
  const tilesByIndex = {};
  if (tiles) {
    for (const t of tiles) tilesByIndex[t.index] = t;
  }

  return {
    statistics,
    ports,
    settlements,
    boardScarcity,
    positions,
    tiles,
    tilesByIndex,
    perResource,
    activeRates,
    tradingRates,
    missing,
  };
}

// ── Tip generators ──────────────────────────────────────────────────
// Each generator receives a `ctx` object and returns an array of tips.
// A tip is { type: 'danger'|'warning'|'success'|'info', text: string }.
// To add a new category, just write a function and push it into TIP_GENERATORS.

function missingResourceTips(ctx) {
  const tips = [];
  for (const r of ctx.missing) {
    const scarcity = ctx.boardScarcity && ctx.boardScarcity[r.code];
    const isScarce = scarcity && scarcity.total_rate <= 4;
    tips.push({
      type: 'danger',
      text: isScarce
        ? `You have no ${r.emoji} ${r.label} production, and it's scarce on the board.`
        : `You have no ${r.emoji} ${r.label} production.`,
    });
  }
  return tips;
}

function weakResourceTips(ctx) {
  const tips = [];
  for (const [code, rate] of Object.entries(ctx.activeRates)) {
    if (rate <= 2) {
      const r = RESOURCE_BY_CODE[code];
      if (r) {
        tips.push({
          type: 'warning',
          text: `Your ${r.emoji} ${r.label} production is weak (${rate}/36).`,
        });
      }
    }
  }
  return tips;
}

function portSynergyTips(ctx) {
  const tips = [];
  for (const [code, rate] of Object.entries(ctx.activeRates)) {
    if (ctx.tradingRates[code] === 2 && rate >= 5) {
      const r = RESOURCE_BY_CODE[code];
      if (r) {
        tips.push({
          type: 'success',
          text: `Great combo: strong ${r.emoji} ${r.label} production (${rate}/36) with a 2:1 port.`,
        });
      }
    }
  }
  return tips;
}

function diversityTips(ctx) {
  if (ctx.missing.length === 0) {
    return [{ type: 'success', text: 'You produce all 5 resources.' }];
  }
  return [];
}

function strongestResourceTips(ctx) {
  const sorted = Object.entries(ctx.activeRates).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 8) {
    const r = RESOURCE_BY_CODE[sorted[0][0]];
    if (r && ctx.tradingRates[sorted[0][0]] > 3) {
      return [{
        type: 'info',
        text: `${r.emoji} ${r.label} is your strongest resource (${sorted[0][1]}/36). A port could boost your trading power.`,
      }];
    }
  }
  return [];
}

function noPortTips(ctx) {
  const hasAny = Object.values(ctx.tradingRates).some(r => r < 4);
  if (!hasAny && Object.keys(ctx.activeRates).length > 0) {
    return [{
      type: 'warning',
      text: 'You have no port access yet.',
    }];
  }
  return [];
}

function robberPlacementTips(ctx) {
  const { settlements, positions, tilesByIndex, boardScarcity } = ctx;
  if (!positions || !tilesByIndex || !settlements) return [];

  // Identify opponent positions and your own positions
  const opponentPositions = new Set(
    Object.entries(settlements).filter(([, t]) => t === 'opponent').map(([p]) => p)
  );
  const ownPositions = new Set(
    Object.entries(settlements).filter(([, t]) => t === 'colony' || t === 'city').map(([p]) => p)
  );
  if (opponentPositions.size === 0) return [];

  // For each tile, find which opponent positions it would block
  // and check it doesn't block any of our own positions
  // tile.index is 1-based
  const candidates = [];
  for (const tile of Object.values(tilesByIndex)) {
    if (tile.value === 0) continue;           // skip desert
    if (tile.has_robber) continue;            // already robbed
    if (tile.resource === 'r') continue;      // desert resource code

    // Find all settlement positions adjacent to this tile
    const adjacentOpponents = [];
    let blocksOwn = false;
    for (const [pos, info] of Object.entries(positions)) {
      const adjTiles = info.adjacent_tiles || [];
      if (!adjTiles.includes(tile.index)) continue;
      if (ownPositions.has(pos)) { blocksOwn = true; break; }
      if (opponentPositions.has(pos)) adjacentOpponents.push(pos);
    }
    if (blocksOwn || adjacentOpponents.length === 0) continue;

    // Scarcity score: lower board total_rate = scarcer = higher priority for tiebreak
    const scarcity = boardScarcity && boardScarcity[tile.resource];
    const scarcityScore = scarcity ? (1 / (scarcity.total_rate || 1)) : 0;

    candidates.push({
      tile,
      opponentCount: adjacentOpponents.length,
      diceRate: tile.dice_dots || 0,
      scarcityScore,
    });
  }

  if (candidates.length === 0) return [];

  // Sort: most opponents blocked, then highest dice probability, then scarcest resource
  candidates.sort((a, b) =>
    b.opponentCount - a.opponentCount
    || b.diceRate - a.diceRate
    || b.scarcityScore - a.scarcityScore
  );

  const best = candidates[0];
  const r = RESOURCE_BY_CODE[best.tile.resource];
  const resLabel = r ? `${r.emoji} ${r.label} (${best.tile.value})` : `${best.tile.text} (${best.tile.value})`;
  const oppText = best.opponentCount > 1
    ? `blocks ${best.opponentCount} opponent positions`
    : 'blocks 1 opponent position';

  return [{
    type: 'info',
    text: `Best robber spot: ${resLabel} (${best.diceRate}/36) \u2014 ${oppText}.`,
  }];
}

function cityUpgradeTips(ctx) {
  const { settlements, positions, tilesByIndex } = ctx;
  if (!settlements || !positions || !tilesByIndex) return [];

  // Find all colonies (not cities, not opponents)
  const colonies = Object.entries(settlements)
    .filter(([, type]) => type === 'colony')
    .map(([pos]) => pos);

  if (colonies.length === 0) return [];

  // For each colony, calculate the extra production gained by upgrading to city.
  // A city produces 2x, so upgrading adds 1x the base rate (the same as colony).
  // We sum the dice rates of adjacent non-desert, non-robbed tiles.
  const candidates = colonies.map(pos => {
    const posData = positions[pos];
    if (!posData || !posData.tile_details) return null;

    let extraRate = 0;
    const tileInfos = [];
    for (const tile of posData.tile_details) {
      if (tile.value === 0) continue;          // desert
      if (tile.has_robber) continue;            // blocked by robber
      extraRate += tile.rate || 0;
      const r = RESOURCE_BY_CODE[tile.resource];
      if (r) {
        tileInfos.push({ resource: r, value: tile.value });
      }
    }

    return { pos, extraRate, tileInfos, score: posData.score };
  }).filter(Boolean);

  if (candidates.length === 0) return [];

  // Sort by extra production gained (highest first)
  candidates.sort((a, b) => b.extraRate - a.extraRate);

  const best = candidates[0];
  if (best.extraRate === 0) return [];

  const resText = best.tileInfos.map(t => `${t.resource.emoji} ${t.resource.label} (${t.value})`).join(', ');

  return [{
    type: 'info',
    text: `Best city upgrade: ${resText} (+${best.extraRate}/36).`,
  }];
}

function diceValueCoverageTips(ctx) {
  const { statistics } = ctx;
  const perDice = statistics?.per_dice_value;
  if (!perDice) return [];

  // Collect dice values where the player has at least one non-blocked entry
  const coveredValues = new Set();
  for (const [val, entries] of Object.entries(perDice)) {
    const v = Number(val);
    if (v === 7) continue;
    if (entries.some(e => !e.blocked)) coveredValues.add(v);
  }

  // All possible non-seven dice values
  const ALL_VALUES = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  const CORE_VALUES = [3, 4, 5, 6, 8, 9, 10, 11]; // excluding 2 and 12
  const missing = ALL_VALUES.filter(v => !coveredValues.has(v));

  if (missing.length === 0) {
    // Covers every value 2-12
    return [{ type: 'success', text: 'You receive resources on every dice value!' }];
  }

  // Check if only 2 and/or 12 are missing
  const missingCore = missing.filter(v => CORE_VALUES.includes(v));
  if (missingCore.length === 0) {
    const excluded = missing.sort((a, b) => a - b).join(' and ');
    return [{
      type: 'success',
      text: `You receive resources on all dice values (excluding ${excluded}).`,
    }];
  }

  return [];
}

/**
 * Registry of all tip generators.
 * To add a new tip category, define a function above and append it here.
 */
const TIP_GENERATORS = [
  missingResourceTips,
  weakResourceTips,
  portSynergyTips,
  diversityTips,
  diceValueCoverageTips,
  strongestResourceTips,
  noPortTips,
  robberPlacementTips,
  cityUpgradeTips,
];

// ── Main logic ──────────────────────────────────────────────────────

function generateTips(statistics, ports, settlements, boardScarcity, positions, tiles) {
  if (!statistics?.per_resource) return [];

  const hasOwn = settlements && Object.values(settlements).some(
    t => t === 'colony' || t === 'city'
  );
  if (!hasOwn) return [];

  const ctx = buildContext(statistics, ports, settlements, boardScarcity, positions, tiles);
  const tips = [];
  for (const generator of TIP_GENERATORS) {
    tips.push(...generator(ctx));
  }
  tips.sort((a, b) => (TIP_ORDER[a.type] ?? 99) - (TIP_ORDER[b.type] ?? 99));
  return tips;
}

// ── Component ───────────────────────────────────────────────────────

export default function TipsCard({ statistics, ports, settlements, boardScarcity, positions, tiles }) {
  const tips = generateTips(statistics, ports, settlements, boardScarcity, positions, tiles);

  if (tips.length === 0) return null;

  return (
    <div>
      <div style={styles.list}>
        {tips.map((tip, i) => {
          const ts = TIP_STYLES[tip.type];
          return (
            <div key={i} style={{ ...styles.tip, backgroundColor: ts.bg, borderColor: ts.border }}>
              <span style={styles.tipIcon}>{ts.icon}</span>
              <span style={{ ...styles.tipText, color: ts.color }}>{tip.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
