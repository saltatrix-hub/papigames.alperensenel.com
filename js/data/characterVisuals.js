/**
 * Data-driven class visuals for the existing LPC compositor.
 *
 * equipped item -> visual id -> layer keys -> LPC action group
 *
 * The Assassin source pack defines the shared four-direction modular-art goal, but
 * its large static cut-outs are not animation sheets. Runtime animation therefore
 * uses compatible 64 px LPC sheets until class-specific production sheets pass
 * visual review. Stats are never read or changed here.
 */

const CLASS_PROFILES = {
  Knight: {
    slug: 'knight', action: 'slash', weaponRole: 'sword', offhandRole: 'shield',
    body: { walk: ['body', 'plateFeet', 'plateLegs', 'gloves'], attack: ['body', 'plateFeet', 'plateLegs', 'gloves'] },
    defaults: { armor: 'knight_armor_t01', helmet: 'knight_helmet_t01', weapon: 'knight_sword_t01', offhand: 'knight_shield_t01' },
  },
  Berserker: {
    slug: 'berserker', action: 'slash', weaponRole: 'axe',
    body: { walk: ['body', 'shoes', 'pants'], attack: ['body', 'shoes', 'pants'] },
    defaults: { armor: 'berserker_armor_t01', helmet: 'berserker_helmet_t01', weapon: 'berserker_axe_t01' },
  },
  Assassin: {
    slug: 'assassin', action: 'slash', weaponRole: 'dagger',
    body: { walk: ['body', 'shoes', 'pants', 'belt'], attack: ['body', 'shoes', 'pants', 'belt'] },
    defaults: { armor: 'assassin_armor_t01', helmet: 'assassin_helmet_t01', weapon: 'assassin_dagger_t01' },
  },
  Ranger: {
    slug: 'ranger', action: 'bow', weaponRole: 'bow',
    body: { walk: ['quiver', 'body', 'shoes', 'pants'], attack: ['body', 'shoes', 'pants'] },
    defaults: { armor: 'ranger_armor_t01', helmet: 'ranger_helmet_t01', weapon: 'ranger_bow_t01' },
  },
  Mage: {
    slug: 'mage', action: 'spell', weaponRole: 'staff',
    body: { walk: ['body', 'shoes', 'robeLegs'], attack: ['body', 'shoes', 'robeLegs'] },
    defaults: { armor: 'mage_armor_t01', helmet: 'mage_helmet_t01', weapon: 'mage_staff_t01' },
  },
  Priest: {
    slug: 'priest', action: 'spell', weaponRole: 'mace',
    body: { walk: ['body', 'shoes', 'robeLegs'], attack: ['body', 'shoes', 'robeLegs'] },
    defaults: { armor: 'priest_armor_t01', helmet: 'priest_helmet_t01', weapon: 'priest_mace_t01' },
  },
};

/** status: ready | temporary-lpc | missing */
export const CHARACTER_VISUALS = {
  knight_armor_t01: visual('Knight', 'armor', 'ready', ['plateTorso', 'plateArms'], ['plateTorso', 'plateArms']),
  knight_armor_t05: visual('Knight', 'armor', 'temporary-lpc', ['chain', 'plateArms'], ['chain', 'plateArms'], 'Chain torso is the reviewed temporary tier-5 distinction.'),
  knight_armor_t10: visual('Knight', 'armor', 'missing', null, null, 'No tier-10 plate sheet; falls back to tier 1.'),
  knight_helmet_t01: visual('Knight', 'helmet', 'ready', ['helm'], ['helm']),
  knight_helmet_t05: visual('Knight', 'helmet', 'temporary-lpc', ['chainHood'], ['chainHood'], 'Chain hood is the reviewed temporary tier-5 distinction.'),
  knight_helmet_t10: visual('Knight', 'helmet', 'missing', null, null, 'No tier-10 helmet sheet; falls back to tier 1.'),
  knight_sword_t01: visual('Knight', 'sword', 'temporary-lpc', [], ['dagger'], 'Dagger is temporary until the reviewed longsword candidates are promoted.'),
  knight_sword_t05: visual('Knight', 'sword', 'missing', null, null, 'No tier-5 sword sheet; falls back to tier 1.'),
  knight_sword_t10: visual('Knight', 'sword', 'missing', null, null, 'No tier-10 sword sheet; falls back to tier 1.'),
  knight_shield_t01: visual('Knight', 'shield', 'temporary-lpc', ['shield'], [], 'Walk-only shield; a matching attack sheet is still missing.'),
  knight_shield_t05: visual('Knight', 'shield', 'missing', null, null, 'No tier-5 shield sheet; falls back to tier 1.'),
  knight_shield_t10: visual('Knight', 'shield', 'missing', null, null, 'No tier-10 shield sheet; falls back to tier 1.'),

  berserker_armor_t01: visual('Berserker', 'armor', 'ready', ['leather', 'leatherShoulders'], ['leather', 'leatherShoulders']),
  berserker_helmet_t01: visual('Berserker', 'helmet', 'ready', ['hair'], ['hair']),
  berserker_axe_t01: visual('Berserker', 'axe', 'temporary-lpc', [], ['dagger'], 'Slash animation is live; production greataxe layers are missing.'),

  assassin_armor_t01: visual('Assassin', 'armor', 'temporary-lpc', ['leather'], ['leather'], 'Animated LPC stand-in follows the static Assassin pack style.'),
  assassin_helmet_t01: visual('Assassin', 'helmet', 'temporary-lpc', ['chainHood'], ['chainHood']),
  assassin_dagger_t01: visual('Assassin', 'dagger', 'ready', [], [], 'Dual daggers are drawn by the Assassin compositor pass.'),

  ranger_armor_t01: visual('Ranger', 'armor', 'ready', ['leather', 'leatherShoulders'], ['leather', 'leatherShoulders']),
  ranger_helmet_t01: visual('Ranger', 'helmet', 'ready', ['hat'], ['hat']),
  ranger_bow_t01: visual('Ranger', 'bow', 'ready', [], ['bow', 'arrow']),

  mage_armor_t01: visual('Mage', 'armor', 'ready', ['robe'], ['robe']),
  mage_helmet_t01: visual('Mage', 'helmet', 'ready', ['hood'], ['hood']),
  mage_staff_t01: visual('Mage', 'staff', 'temporary-lpc', [], [], 'Spellcast animation is live; a matching staff layer is missing.'),

  priest_armor_t01: visual('Priest', 'armor', 'ready', ['robe'], ['robe']),
  priest_helmet_t01: visual('Priest', 'helmet', 'ready', ['hair'], ['hair']),
  priest_mace_t01: visual('Priest', 'mace', 'temporary-lpc', [], [], 'Spellcast animation is live; a matching mace layer is missing.'),
};

function visual(cls, role, status, walk, attack, note = '') {
  return { cls, role, tier: 1, status, walk, attack, note };
}

const ROLE_BY_SLOT = { Chest: 'armor', Head: 'helmet', MainHand: 'weapon', OffHand: 'offhand' };

function tierToken(ilvl) {
  if (ilvl >= 10) return 't10';
  if (ilvl >= 5) return 't05';
  return 't01';
}

function concreteRole(profile, role) {
  if (role === 'weapon') return profile.weaponRole;
  if (role === 'offhand') return profile.offhandRole;
  return role;
}

/** Resolve an optional item visual id without coupling appearance to item stats. */
export function visualIdForItem(item, role, cls = 'Knight') {
  if (item?.visualId && CHARACTER_VISUALS[item.visualId]?.cls === cls) return item.visualId;
  if (item?.cls && item.cls !== cls) return null;
  const profile = CLASS_PROFILES[cls];
  if (!profile) return null;
  const specificRole = concreteRole(profile, role);
  if (!specificRole) return null;
  const id = `${profile.slug}_${specificRole}_${tierToken(item?.ilvl || item?.req || 1)}`;
  return CHARACTER_VISUALS[id] ? id : `${profile.slug}_${specificRole}_t01`;
}

function layersFor(id, phase) {
  const entry = CHARACTER_VISUALS[id];
  if (!entry || entry.status === 'missing' || !entry[phase]) {
    const fallback = CHARACTER_VISUALS[id?.replace(/_t\d\d$/, '_t01')];
    return fallback?.[phase] || [];
  }
  return entry[phase];
}

/** Build one four-direction walk + class-attack descriptor for every playable class. */
export function resolveCharacterVisual(cls, eq) {
  const profile = CLASS_PROFILES[cls];
  if (!profile) return null;

  const ids = {
    armor: visualIdForItem(eq?.Chest, 'armor', cls) || profile.defaults.armor,
    helmet: visualIdForItem(eq?.Head, 'helmet', cls) || profile.defaults.helmet,
    weapon: visualIdForItem(eq?.MainHand, 'weapon', cls) || profile.defaults.weapon,
    offhand: profile.offhandRole
      ? (visualIdForItem(eq?.OffHand, 'offhand', cls) || profile.defaults.offhand)
      : null,
  };
  const orderedIds = [ids.armor, ids.helmet, ids.weapon, ids.offhand].filter(Boolean);
  const walk = [...profile.body.walk];
  const attack = [...profile.body.attack];
  for (const id of orderedIds) {
    walk.push(...layersFor(id, 'walk'));
    attack.push(...layersFor(id, 'attack'));
  }

  return {
    id: `${cls}|${profile.action}|${orderedIds.join('|')}`,
    cls,
    action: profile.action,
    ...ids,
    walk,
    attack,
    // Backward compatibility for the first Knight-only visual contract.
    slash: profile.action === 'slash' ? attack : undefined,
  };
}

export function listVisualGaps() {
  return Object.entries(CHARACTER_VISUALS)
    .filter(([, entry]) => entry.status !== 'ready')
    .map(([id, entry]) => ({ id, status: entry.status, note: entry.note }));
}

export { CLASS_PROFILES, ROLE_BY_SLOT };
