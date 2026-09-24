// GDD §6 stat system + encounter tuning.
import { GDD } from '../data/gdd.js';
import { clamp } from '../core/util.js';

export const STATS = ['STR', 'AGI', 'DEX', 'VIT', 'INT', 'SPI'];
export const STAT_TR = { STR: 'Güç', AGI: 'Çeviklik', DEX: 'Beceri', VIT: 'Dayanıklılık', INT: 'Zekâ', SPI: 'Ruh' };
export const METER = 40; // px per GDD metre

// Per-class base kit. Base stats/HP are tuning values; primary/secondary come from GDD class_config.
export const CLASS_KIT = {
  Knight: {
    base: { STR: 10, AGI: 5, DEX: 5, VIT: 12, INT: 3, SPI: 5 }, grow: { VIT: 3, STR: 2 }, baseHP: 260, armorMult: 1.0,
    attack: { kind: 'melee', range: 1.9, arc: 110, interval: 0.8, coef: 1.0 }, threat: 1.6, magic: false,
    look: { body: '#2c4f9e', trim: '#e2c05a', metal: '#c9ced8', hair: '#8a5a2e', skin: '#f2d0b0', cape: '#2a4a9a', hat: 'none' },
  },
  Berserker: {
    base: { STR: 12, AGI: 6, DEX: 5, VIT: 10, INT: 2, SPI: 3 }, grow: { STR: 3, VIT: 2 }, baseHP: 240, armorMult: 0.85,
    attack: { kind: 'melee', range: 2.2, arc: 140, interval: 1.0, coef: 1.25 }, threat: 1.2, magic: false,
    look: { body: '#8e1f1f', trim: '#2a2020', metal: '#8a8a90', hair: '#e8e0d0', skin: '#e6b894', cape: '#5a1414', hat: 'none', fur: true },
  },
  Assassin: {
    base: { STR: 6, AGI: 12, DEX: 10, VIT: 6, INT: 3, SPI: 3 }, grow: { AGI: 3, DEX: 2 }, baseHP: 175, armorMult: 0.55,
    attack: { kind: 'melee', range: 1.6, arc: 80, interval: 0.48, coef: 0.62 }, threat: 0.8, magic: false,
    look: { body: '#2a2238', trim: '#7b4fd0', metal: '#b0b0c0', hair: '#1a1a24', skin: '#e8c8a8', cape: '#3a2a5a', hat: 'hood' },
  },
  Ranger: {
    base: { STR: 5, AGI: 10, DEX: 12, VIT: 6, INT: 3, SPI: 4 }, grow: { DEX: 3, AGI: 2 }, baseHP: 175, armorMult: 0.65,
    attack: { kind: 'ranged', range: 12, interval: 0.72, coef: 0.85, proj: 'arrow', speed: 16 }, threat: 0.9, magic: false,
    look: { body: '#2e6b3a', trim: '#8a6a3a', metal: '#a08050', hair: '#e8c070', skin: '#f2d0b0', cape: '#24552e', hat: 'hood' },
  },
  Mage: {
    base: { STR: 3, AGI: 3, DEX: 4, VIT: 5, INT: 12, SPI: 10 }, grow: { INT: 3, SPI: 2 }, baseHP: 145, armorMult: 0.4,
    attack: { kind: 'ranged', range: 11, interval: 0.82, coef: 0.9, proj: 'arcane', speed: 13 }, threat: 0.9, magic: true,
    look: { body: '#26357e', trim: '#d8d8e8', metal: '#c8a860', hair: '#dcdce6', skin: '#f0d4b8', cape: '#1e2a66', hat: 'none' },
  },
  Priest: {
    base: { STR: 4, AGI: 3, DEX: 3, VIT: 6, INT: 10, SPI: 12 }, grow: { SPI: 3, INT: 2 }, baseHP: 165, armorMult: 0.42,
    attack: { kind: 'ranged', range: 10, interval: 0.85, coef: 0.82, proj: 'holy', speed: 12 }, threat: 0.7, magic: true,
    look: { body: '#f0ece0', trim: '#c9a23a', metal: '#e0c060', hair: '#f0d8a0', skin: '#f6dcc4', cape: '#a82a2a', hat: 'hood' },
  },
};

export const RESOURCE = {
  Valor: { color: '#e7c14a', max: 100, regen: 5, pool: false },
  Rage: { color: '#d8342c', max: 100, regen: -4, pool: false, startEmpty: true },
  Focus: { color: '#f2e14a', max: 100, regen: 11, pool: false },
  Mana: { color: '#3c7cf0', pool: true },
  Faith: { color: '#f0d890', pool: true },
};

const LV = GDD.levels;
export const xpToNext = (L) => (L >= 100 ? 0 : LV[L - 1].xpNext);
export const statPointsAt = (L) => LV[L - 1]?.stat ?? 4;
export const skillPointsAt = (L) => LV[L - 1]?.skill ?? 0;
export const unlockAt = (L) => LV[L - 1]?.unlock || '';

/** Stats for a class at level with automatic allocation (used by companions, arena bots, references). */
export function autoStats(cls, level) {
  const kit = CLASS_KIT[cls];
  const s = { ...kit.base };
  for (let L = 2; L <= level; L++) {
    const pts = statPointsAt(L);
    const g = Object.entries(kit.grow);
    let left = pts;
    for (const [k, v] of g) { const add = Math.min(left, pts === 5 ? v : Math.max(1, v - 0.5) | 0); s[k] += add; left -= add; }
    if (left > 0) s[g[0][0]] += left;
  }
  return s;
}

/** Derived combat stats using GDD formulas (+ class weapon mastery). */
export function derive(cls, level, stats, gear = { atk: 0, def: 0, hp: 0, pct: {} }, resourceName) {
  const kit = CLASS_KIT[cls];
  const p = gear.pct || {};
  const S = {};
  for (const k of STATS) S[k] = (stats[k] || 0) + (gear[k] || 0);
  const hp = (kit.baseHP + S.VIT * 32 + level * 18 + gear.hp) * (1 + (p.hp || 0));
  let atk;
  if (kit.magic) {
    atk = gear.atk + S.INT * 3.4 + S.SPI * (cls === 'Priest' ? 1.8 : 1.4);
  } else {
    atk = gear.atk + S.STR * 3.0 + S.DEX * 1.2;
    if (cls === 'Assassin') atk += S.AGI * 2.2;
    if (cls === 'Ranger') atk += S.DEX * 1.4;
  }
  atk *= 1 + (p.atk || 0);
  const armor = gear.def * kit.armorMult;
  const def = (armor + S.VIT * 2.2 + S.STR * 0.6) * (1 + (p.def || 0));
  const mdef = (armor * 0.8 + S.SPI * 2.5 + S.INT * 0.7) * (1 + (p.def || 0));
  const crit = clamp(5 + S.DEX * 0.08 + S.AGI * 0.03 + (p.crit || 0), 0, 65);
  const dodge = clamp(3 + S.AGI * 0.07 + (p.dodge || 0), 0, 35);
  const res = RESOURCE[resourceName];
  const maxRes = res.pool ? Math.round(100 + S.INT * 12 + S.SPI * 18) : res.max;
  const aspd = 1 + S.AGI * 0.0018 + (p.aspd || 0);
  const ms = 1 + (p.ms || 0);
  return {
    maxHp: Math.round(hp), atk: Math.round(atk), def: Math.round(def), mdef: Math.round(mdef), crit, dodge, maxRes, aspd, ms,
    critDmg: 1.5 + (p.critDmg || 0), heal: 1 + (p.heal || 0), cdr: clamp(p.cdr || 0, 0, 0.3), S,
  };
}

// ---------- Encounter tuning (GDD EncounterModifier) ----------
// Weapon/armor reference for a level from the GDD item table.
const itemsByTierLevel = (() => {
  const arr = [];
  const kn = GDD.items.filter((i) => i.cls === 'Knight');
  for (let L = 1; L <= 100; L++) {
    const w = kn.filter((i) => i.slot === 'MainHand' && i.req <= L).sort((a, b) => b.atk - a.atk)[0];
    const a = kn.filter((i) => i.slot === 'Chest' && i.req <= L).sort((x, y) => y.def - x.def)[0];
    arr[L] = { atk: w ? w.atk : 25, def: a ? a.def : 13 };
  }
  return arr;
})();
export const refGear = (L) => itemsByTierLevel[clamp(L, 1, 100)];

/** Monster defence: grows slowly so the GDD mitigation formula stays readable. */
export const monsterDef = (L) => Math.round(4 + L * 2.2);
/** Mitigation constant scaled by attacker level (normalises 100/(100+DEF) across 1..100). */
export const mitigation = (attackerLevel, def) => {
  const K = 100 + attackerLevel * 40;
  return K / (K + Math.max(0, def));
};

// Reference hero (average class, level-appropriate gear) used to normalise GDD monster curves.
const refCache = [];
export function refHero(L) {
  if (refCache[L]) return refCache[L];
  const g = refGear(L);
  const avgAtk = ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest']
    .map((c) => derive(c, L, autoStats(c, L), { atk: g.atk, def: g.def * 8, hp: g.def * 12, pct: {} }, 'Valor').atk)
    .reduce((a, b) => a + b, 0) / 6;
  const avgHp = ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest']
    .map((c) => derive(c, L, autoStats(c, L), { atk: g.atk, def: g.def * 8, hp: g.def * 12, pct: {} }, 'Valor').maxHp)
    .reduce((a, b) => a + b, 0) / 6;
  refCache[L] = { atk: avgAtk, hp: avgHp, hit: avgAtk * mitigation(L, monsterDef(L)) };
  return refCache[L];
}

export const TIER = {
  Normal: { hp: 4.2, atk: 0.075, xp: 1, size: 1 },
  Elite: { hp: 11, atk: 0.11, xp: 2.5, size: 1.3 },
  Named: { hp: 26, atk: 0.13, xp: 6, size: 1.55 },
  Boss: { hp: 70, atk: 0.14, xp: 14, size: 2.4 },
  Raid: { hp: 110, atk: 0.16, xp: 20, size: 2.9 },
};

/** Converts a GDD monster row into encounter numbers (keeps its relative toughness vs the curve). */
export function monsterNumbers(row, tierKey) {
  const L = clamp(row.level, 1, 100);
  const T = TIER[tierKey];
  const ref = refHero(L);
  const relHp = row.hp ? clamp(row.hp / GDD.curves.hp[L], 0.6, 1.6) : 1;
  const relAtk = row.atk ? clamp(row.atk / GDD.curves.atk[L], 0.7, 1.4) : 1;
  return {
    maxHp: Math.round(ref.hit * T.hp * relHp),
    atk: Math.round(ref.hp * T.atk * relAtk),
    def: monsterDef(L),
  };
}

export const levelDiffDealt = (attL, defL) => clamp(1 - 0.035 * (defL - attL), 0.5, 1.15);
export const levelDiffTaken = (attL, defL) => clamp(1 + 0.045 * (attL - defL), 0.7, 1.7);

export function killXp(monLevel, heroLevel, tierMult) {
  const base = xpToNext(clamp(monLevel, 1, 99)) / 16;
  const diff = monLevel - heroLevel;
  let m = 1;
  if (diff > 0) m = Math.min(2, 1 + diff * 0.1);
  else if (diff < -5) m = Math.max(0.1, 1 + (diff + 5) * 0.15);
  return Math.max(1, Math.round(base * tierMult * m));
}

export const gearTierForLevel = (L) => (L >= 86 ? 'Mythic' : L >= 69 ? 'Legendary' : L >= 52 ? 'Epic' : L >= 35 ? 'Rare' : L >= 18 ? 'Uncommon' : 'Common');
