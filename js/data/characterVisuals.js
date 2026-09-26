/**
 * Character visual manifest.
 * Equipped item → visual id → LPC layer keys. Stats are not read here.
 * Only Knight is wired. Other classes return null and keep their class kit.
 * Layer keys must exist in js/render/lpc.js LAYERS for the active animation.
 */

const BODY = {
  walk: ['body', 'plateFeet', 'plateLegs', 'gloves'],
  slash: ['body', 'plateFeet', 'plateLegs', 'gloves'],
};

/** status: ready | temporary-lpc | missing */
export const CHARACTER_VISUALS = {
  knight_armor_t01: {
    cls: 'Knight', role: 'armor', tier: 1, status: 'ready',
    note: 'LPC plate torso + plate arms. Walk and slash sheets exist.',
    walk: ['plateTorso', 'plateArms'], slash: ['plateTorso', 'plateArms'],
  },
  knight_armor_t05: {
    cls: 'Knight', role: 'armor', tier: 5, status: 'temporary-lpc',
    note: 'Chain torso stands in so tier 5 is visibly different. Dedicated tier-5 plate art does not exist. Plate arms stay so the body is not armless.',
    walk: ['chain', 'plateArms'], slash: ['chain', 'plateArms'],
  },
  knight_armor_t10: {
    cls: 'Knight', role: 'armor', tier: 10, status: 'missing',
    note: 'No tier-10 plate sheet. Renderer falls back to knight_armor_t01.',
    walk: null, slash: null,
  },
  knight_helmet_t01: {
    cls: 'Knight', role: 'helmet', tier: 1, status: 'ready',
    note: 'LPC plate helmet. Walk and slash sheets exist.',
    walk: ['helm'], slash: ['helm'],
  },
  knight_helmet_t05: {
    cls: 'Knight', role: 'helmet', tier: 5, status: 'temporary-lpc',
    note: 'Chain hood stands in so tier 5 is visibly different. Not a second plate helmet.',
    walk: ['chainHood'], slash: ['chainHood'],
  },
  knight_helmet_t10: {
    cls: 'Knight', role: 'helmet', tier: 10, status: 'missing',
    note: 'No tier-10 helmet sheet. Renderer falls back to knight_helmet_t01.',
    walk: null, slash: null,
  },
  knight_sword_t01: {
    cls: 'Knight', role: 'sword', tier: 1, status: 'temporary-lpc',
    note: 'Slash sheet is WEAPON_dagger, not a longsword. No walk-cycle sword sheet exists, so idle/walk show no blade. slash192/WEAPON_longsword.png is 192px and is not used.',
    walk: [], slash: ['dagger'],
  },
  knight_sword_t05: {
    cls: 'Knight', role: 'sword', tier: 5, status: 'missing',
    note: 'No 64px tier-5 sword sheet. Falls back to knight_sword_t01.',
    walk: null, slash: null,
  },
  knight_sword_t10: {
    cls: 'Knight', role: 'sword', tier: 10, status: 'missing',
    note: 'No 64px tier-10 sword sheet. Falls back to knight_sword_t01.',
    walk: null, slash: null,
  },
  knight_shield_t01: {
    cls: 'Knight', role: 'shield', tier: 1, status: 'temporary-lpc',
    note: 'Walk-cycle shield cutout only. Slash sheets have no matching shield, so the attack hides it.',
    walk: ['shield'], slash: [],
  },
  knight_shield_t05: {
    cls: 'Knight', role: 'shield', tier: 5, status: 'missing',
    note: 'No tier-5 shield sheet. Falls back to knight_shield_t01.',
    walk: null, slash: null,
  },
  knight_shield_t10: {
    cls: 'Knight', role: 'shield', tier: 10, status: 'missing',
    note: 'No tier-10 shield sheet. Falls back to knight_shield_t01.',
    walk: null, slash: null,
  },
};

const ROLE_BY_SLOT = { Chest: 'armor', Head: 'helmet', MainHand: 'sword', OffHand: 'shield' };

function tierToken(ilvl) {
  if (ilvl >= 10) return 't10';
  if (ilvl >= 5) return 't05';
  return 't01';
}

/** Item appearance id. Uses item.visualId when set. Otherwise Knight slot + ilvl band. Never reads atk/def. */
export function visualIdForItem(item, role) {
  if (item?.visualId && CHARACTER_VISUALS[item.visualId]) return item.visualId;
  if (item?.cls && item.cls !== 'Knight') return null;
  const ilvl = item?.ilvl || item?.req || 1;
  return `knight_${role}_${tierToken(ilvl)}`;
}

function layersFor(id, act) {
  const entry = CHARACTER_VISUALS[id];
  if (!entry || entry.status === 'missing' || !entry[act]) {
    const fallback = CHARACTER_VISUALS[id.replace(/_t\d\d$/, '_t01')];
    return fallback?.[act] || [];
  }
  return entry[act];
}

/**
 * Build the LPC layer list for a Knight from equipped items.
 * Returns null for every other class so the existing kit stays in place.
 * OffHand is visual-only. It is not a stat slot.
 */
export function resolveCharacterVisual(cls, eq) {
  if (cls !== 'Knight') return null;
  const armorId = visualIdForItem(eq?.Chest, 'armor') || 'knight_armor_t01';
  const helmetId = visualIdForItem(eq?.Head, 'helmet') || 'knight_helmet_t01';
  const swordId = visualIdForItem(eq?.MainHand, 'sword') || 'knight_sword_t01';
  const shieldId = visualIdForItem(eq?.OffHand, 'shield') || 'knight_shield_t01';
  const walk = [...BODY.walk, ...layersFor(armorId, 'walk'), ...layersFor(helmetId, 'walk'), ...layersFor(shieldId, 'walk')];
  const slash = [...BODY.slash, ...layersFor(armorId, 'slash'), ...layersFor(helmetId, 'slash'), ...layersFor(swordId, 'slash')];
  return {
    id: [armorId, helmetId, swordId, shieldId].join('|'),
    armorId, helmetId, swordId, shieldId,
    walk, slash,
  };
}

export function listVisualGaps() {
  return Object.entries(CHARACTER_VISUALS)
    .filter(([, v]) => v.status !== 'ready')
    .map(([id, v]) => ({ id, status: v.status, note: v.note }));
}

export { ROLE_BY_SLOT };
