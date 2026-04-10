/**
 * Shared resource, port, and color constants.
 * Single source of truth used across all components.
 */

// ── Resources ───────────────────────────────────────────────────────

export const RESOURCES = [
  { code: 'wo', label: 'Wood',   emoji: '\u{1F332}', color: '#1b5e20', boardColor: '#4a9e4a', portType: 'wo_port' },
  { code: 'b',  label: 'Brick',  emoji: '\u{1F9F1}', color: '#a0522d', boardColor: '#d4a373', portType: 'b_port' },
  { code: 'o',  label: 'Ore',    emoji: '\u{26F0}\uFE0F',  color: '#757575', boardColor: '#c5c5c5', portType: 'o_port' },
  { code: 's',  label: 'Sheep',  emoji: '\u{1F411}', color: '#aed581', boardColor: '#c5e1a5', portType: 's_port' },
  { code: 'w',  label: 'Wheat',  emoji: '\u{1F33E}', color: '#fdd835', boardColor: '#ffe082', portType: 'w_port' },
];

export const DESERT = { code: 'r', label: 'Desert', emoji: '\u{1F3DC}\uFE0F', color: '#a1887f', boardColor: '#efebe9' };

/** All resources including desert (for setup form) */
export const ALL_RESOURCES = [...RESOURCES, DESERT];

/** Lookup by resource code */
export const RESOURCE_BY_CODE = {};
RESOURCES.forEach(r => { RESOURCE_BY_CODE[r.code] = r; });
RESOURCE_BY_CODE[DESERT.code] = DESERT;

/** Emoji lookup by resource code */
export const RESOURCE_EMOJIS = {};
RESOURCES.forEach(r => { RESOURCE_EMOJIS[r.code] = r.emoji; });

/** Board color lookup by resource code */
export const RESOURCE_BOARD_COLORS = {};
ALL_RESOURCES.forEach(r => { RESOURCE_BOARD_COLORS[r.code] = r.boardColor; });

/** Resource label lookup by resource code */
export const RESOURCE_LABELS = {};
ALL_RESOURCES.forEach(r => { RESOURCE_LABELS[r.code] = r.label; });

// ── Ports ───────────────────────────────────────────────────────────

export const PORT_COLORS = {
  'none':    { fill: '#e8e0d8', stroke: '#d7ccc8', text: '#bbb' },
  '3:1':    { fill: '#fff',    stroke: '#6d4c41', text: '#4e342e' },
  'wo_port': { fill: '#1b5e20', stroke: '#1b5e20', text: '#fff' },
  'b_port':  { fill: '#a0522d', stroke: '#a0522d', text: '#fff' },
  'o_port':  { fill: '#9e9e9e', stroke: '#757575', text: '#fff' },
  's_port':  { fill: '#aed581', stroke: '#7cb342', text: '#33691e' },
  'w_port':  { fill: '#fdd835', stroke: '#f9a825', text: '#4e342e' },
};

export const PORT_EMOJI_LABELS = {
  'none': '+',
  '3:1': '3:1',
  'wo_port': '\u{1F332} Wood',
  'b_port': '\u{1F9F1} Brick',
  'o_port': '\u{26F0}\uFE0F Ore',
  's_port': '\u{1F411} Sheep',
  'w_port': '\u{1F33E} Wheat',
};

export const PORT_SUBLABELS = {
  'wo_port': '2:1', 'b_port': '2:1', 'o_port': '2:1',
  's_port': '2:1', 'w_port': '2:1',
};

/** Port type code -> resource code */
export const PORT_TO_RESOURCE = {
  'wo_port': 'wo', 'b_port': 'b', 'o_port': 'o', 's_port': 's', 'w_port': 'w',
};

// ── Trading ─────────────────────────────────────────────────────────

/**
 * Compute trading rates for each resource based on port access.
 * Returns { resourceCode: 2|3|4 }
 */
export function computeTradingRates(ports, settlements) {
  const rates = {};
  RESOURCES.forEach(r => { rates[r.code] = 4; });
  if (!ports || !settlements) return rates;

  const settled = new Set(
    Object.entries(settlements)
      .filter(([, t]) => t === 'colony' || t === 'city')
      .map(([pos]) => pos)
  );

  for (const port of ports) {
    if (!port.positions || port.type === 'none') continue;
    const hasAccess = settled.has(port.positions[0]) || settled.has(port.positions[1]);
    if (!hasAccess) continue;

    if (port.type === '3:1') {
      RESOURCES.forEach(r => { if (rates[r.code] > 3) rates[r.code] = 3; });
    } else {
      const rc = PORT_TO_RESOURCE[port.type];
      if (rc && rates[rc] > 2) rates[rc] = 2;
    }
  }
  return rates;
}
