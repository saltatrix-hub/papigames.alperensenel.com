// Items, loot, inventory, enhancement, crafting & auction (GDD §8 items/loot, §9 crafting/economy).
import { GDD } from '../data/gdd.js';
import { RARITY, SLOT_TR } from '../data/content.js';
import { clamp, uid } from '../core/util.js';

export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
export const GEAR_SLOTS = ['MainHand', 'Head', 'Chest', 'Gloves', 'Legs', 'Boots', 'Cape', 'Necklace', 'Ring'];
const R_IDX = Object.fromEntries(RARITIES.map((r, i) => [r, i]));
const R_VALUE = [1, 2.2, 4.5, 9, 18, 36];

export const MATERIAL_TR = {
  MAT_COPPER: 'Bakır Cevheri', MAT_IRON: 'Demir Cevheri', MAT_SKYIRON: 'Gök Demiri', MAT_HERB: 'Yeşil Ot', MAT_VOID: 'Boşluk Közü',
  POT_HP_S: 'Can İksiri', POT_MP_S: 'Kaynak İksiri', FLASK_POWER: 'Güç Şişesi', SCROLL_PROTECT: 'Koruma Parşömeni', FOOD: 'Avcı Güveci',
};
const MAT_DESC = {
  MAT_COPPER: 'Madencilik. Temel dövme malzemesi.', MAT_IRON: 'Madencilik. Orta seviye dövme malzemesi.',
  MAT_SKYIRON: 'Frostpeak’e özgü nadir metal.', MAT_HERB: 'Bitki toplama. Simyanın temeli.', MAT_VOID: 'Abyss Kapısı’nın endgame malzemesi.',
  POT_HP_S: 'Anında maksimum canın %35’ini yeniler. (Q)', POT_MP_S: 'Kaynağının %40’ını yeniler. (F)',
  FLASK_POWER: '5 dakika boyunca +%10 hasar.', SCROLL_PROTECT: 'Güçlendirme başarısız olursa seviye düşmez.', FOOD: '10 dakika boyunca +%6 maksimum can.',
};

export function makeStack(id, n = 1) {
  const kind = id.startsWith('POT') ? 'potion' : id === 'FLASK_POWER' ? 'flask' : id === 'FOOD' ? 'potion' : id.startsWith('SCROLL') ? 'scroll' : 'material';
  return { uid: uid(), id, kind, name: MATERIAL_TR[id] || id, qty: n, stack: true, rarity: id === 'MAT_SKYIRON' ? 'Rare' : id === 'MAT_VOID' ? 'Epic' : id === 'FLASK_POWER' || id === 'SCROLL_PROTECT' ? 'Uncommon' : 'Common', desc: MAT_DESC[id] || '', value: MAT_VALUE[id] || 5 };
}
const MAT_VALUE = { MAT_COPPER: 4, MAT_IRON: 12, MAT_SKYIRON: 60, MAT_HERB: 5, MAT_VOID: 180, POT_HP_S: 12, POT_MP_S: 12, FLASK_POWER: 90, SCROLL_PROTECT: 400, FOOD: 20 };
export function questItem(name, n = 1, questId) {
  return { uid: uid(), id: 'Q_' + name, kind: 'quest', name, qty: n, stack: true, rarity: 'Epic', desc: 'Görev eşyası.', quest: questId, value: 0 };
}

// ---------------------------------------------------------------- affixes
const PRIMARY = { Knight: 'VIT', Berserker: 'STR', Assassin: 'AGI', Ranger: 'DEX', Mage: 'INT', Priest: 'SPI' };
const SECOND = { Knight: 'STR', Berserker: 'VIT', Assassin: 'DEX', Ranger: 'AGI', Mage: 'SPI', Priest: 'INT' };
export const AFFIX_TR = {
  STR: 'Güç', AGI: 'Çeviklik', DEX: 'Beceri', VIT: 'Dayanıklılık', INT: 'Zekâ', SPI: 'Ruh',
  crit: 'Kritik Şansı', critDmg: 'Kritik Hasarı', hp: 'Maks. Can', atk: 'Saldırı Gücü', ms: 'Hareket Hızı', cdr: 'Bekleme Azaltma', heal: 'İyileştirme Gücü', aspd: 'Saldırı Hızı', dodge: 'Kaçınma', lifesteal: 'Can Çalma',
};
const PCT = new Set(['crit', 'critDmg', 'hp', 'atk', 'ms', 'cdr', 'heal', 'aspd', 'dodge', 'lifesteal']);
function affixPool(cls, slot) {
  const p = [PRIMARY[cls], PRIMARY[cls], SECOND[cls], 'VIT', 'crit', 'hp'];
  if (slot === 'MainHand') p.push('atk', 'atk', 'critDmg', 'aspd');
  if (slot === 'Boots') p.push('ms', 'ms', 'dodge');
  if (slot === 'Gloves') p.push('aspd', 'crit');
  if (slot === 'Ring' || slot === 'Necklace') p.push('critDmg', 'cdr', 'atk', 'lifesteal');
  if (slot === 'Head' || slot === 'Cape') p.push('cdr');
  if (cls === 'Priest') p.push('heal', 'heal');
  if (cls === 'Assassin' || cls === 'Ranger') p.push('dodge', 'crit');
  return p;
}
function rollAffix(k, ilvl, r, rnd) {
  const q = 0.7 + rnd() * 0.3;
  const tier = 1 + R_IDX[r] * 0.25;
  if (!PCT.has(k)) return { k, v: Math.max(1, Math.round((2 + ilvl * 0.28) * tier * q)) };
  const base = { crit: 2.5, critDmg: 0.06, hp: 0.04, atk: 0.035, ms: 0.04, cdr: 0.03, heal: 0.05, aspd: 0.04, dodge: 2, lifesteal: 0.015 }[k];
  const v = base * tier * q * (0.6 + ilvl / 100 * 0.8);
  return { k, v: k === 'crit' || k === 'dodge' ? Math.round(v * 10) / 10 : Math.round(v * 1000) / 1000 };
}
export function affixText(a) {
  if (!PCT.has(a.k)) return `+${a.v} ${AFFIX_TR[a.k]}`;
  if (a.k === 'crit' || a.k === 'dodge') return `+${a.v}% ${AFFIX_TR[a.k]}`;
  return `+${(a.v * 100).toFixed(1)}% ${AFFIX_TR[a.k]}`;
}

// ---------------------------------------------------------------- gear instances
const BY_CLASS_SLOT = {};
for (const it of GDD.items) ((BY_CLASS_SLOT[it.cls] ||= {})[it.slot] ||= []).push(it);
for (const c in BY_CLASS_SLOT) for (const s in BY_CLASS_SLOT[c]) BY_CLASS_SLOT[c][s].sort((a, b) => a.req - b.req);

export function baseFor(cls, slot, level) {
  const list = BY_CLASS_SLOT[cls][slot];
  let best = list[0];
  for (const it of list) if (it.req <= level) best = it;
  return best;
}
/** Picks the best GDD base for (class, slot) at or under the level, then scales to ilvl. */
export function makeGear(base, ilvl, rnd = Math.random, extraAffix = 0) {
  ilvl = Math.max(base.req, ilvl);
  const scale = 1 + (ilvl - base.req) * 0.03;
  const r = base.rarity;
  const nAff = clamp(R_IDX[r] + (rnd() < 0.35 ? 1 : 0) + extraAffix, 0, 6);
  const pool = affixPool(base.cls, base.slot);
  const affixes = [];
  const used = new Set();
  for (let i = 0; i < nAff * 3 && affixes.length < nAff; i++) {
    const k = pool[(rnd() * pool.length) | 0];
    if (used.has(k)) continue;
    used.add(k); affixes.push(rollAffix(k, ilvl, r, rnd));
  }
  const weapon = base.slot === 'MainHand';
  const acc = base.slot === 'Ring' || base.slot === 'Necklace';
  return {
    uid: uid(), id: base.id, kind: 'gear', gdd: base, name: localName(base), cls: base.cls, slot: base.slot, rarity: r, req: base.req, ilvl,
    atk: weapon ? Math.round(base.atk * scale) : acc ? Math.round(base.def * scale * 0.18) : 0,
    def: weapon ? 0 : Math.round(base.def * scale * (acc ? 0.6 : 1)),
    hp: weapon ? 0 : Math.round(base.def * scale * 1.5),
    affixes, plus: 0, color: RARITY[r].color, value: Math.round((base.req + 6) * R_VALUE[R_IDX[r]] * 2.2),
  };
}
function localName(base) {
  if (base.slot === 'MainHand') return base.name.replace(/ (Common|Uncommon|Rare|Epic|Legendary|Mythic)$/, '');
  return `${RARITY[base.rarity].tr} ${base.cls === 'Knight' ? 'Şövalye' : base.cls === 'Berserker' ? 'Berserker' : base.cls === 'Assassin' ? 'Suikastçı' : base.cls === 'Ranger' ? 'Korucu' : base.cls === 'Mage' ? 'Büyücü' : 'Rahip'} ${SLOT_TR[base.slot]}`;
}
export function gearStats(it) {
  const m = 1 + it.plus * 0.07 + (it.plus >= 10 ? 0.1 : 0);
  return { atk: Math.round(it.atk * m), def: Math.round(it.def * m), hp: Math.round(it.hp * m) };
}
export function gearScore(it) {
  const s = gearStats(it);
  return Math.round(s.atk * 1.2 + s.def * 1.5 + s.hp * 0.2 + it.affixes.length * it.ilvl * 0.8);
}
export function starterGear(cls) {
  return GEAR_SLOTS.filter((s) => s !== 'Necklace' && s !== 'Ring' && s !== 'Cape').map((s) => {
    const g = makeGear(baseFor(cls, s, 1), 1, () => 0.9);
    g.affixes = []; return g;
  });
}

/** Sum equipment into the gear block consumed by derive(). */
export function sumEquipment(eq, extraPct = {}) {
  const g = { atk: 0, def: 0, hp: 0, pct: { ...extraPct }, STR: 0, AGI: 0, DEX: 0, VIT: 0, INT: 0, SPI: 0 };
  for (const slot in eq) {
    const it = eq[slot];
    if (!it) continue;
    const s = gearStats(it);
    g.atk += s.atk; g.def += s.def; g.hp += s.hp;
    for (const a of it.affixes) {
      if (a.k in g && !PCT.has(a.k)) g[a.k] += a.v;
      else if (a.k === 'crit' || a.k === 'dodge') g.pct[a.k] = (g.pct[a.k] || 0) + a.v;
      else g.pct[a.k] = (g.pct[a.k] || 0) + a.v;
    }
  }
  return g;
}

// ---------------------------------------------------------------- loot (GDD LootTable_<REG>_<n>)
export function rollLoot(mon, heroCls, luck = 1) {
  const out = [];
  const tierBoost = mon.tier === 'Raid' ? 8 : mon.tier === 'Boss' ? 5 : mon.tier === 'Named' ? 3 : mon.tier === 'Elite' ? 1.8 : 1;
  const gold = Math.round((3 + mon.level * 1.6) * tierBoost * (0.7 + Math.random() * 0.6));
  const gearChance = mon.boss ? 1 : mon.elite ? 0.35 : 0.075 * luck;
  const nGear = mon.tier === 'Raid' ? 3 : mon.boss ? 2 : 1;
  for (let i = 0; i < nGear; i++) {
    if (Math.random() >= gearChance) continue;
    const slot = GEAR_SLOTS[(Math.random() * GEAR_SLOTS.length) | 0];
    const cls = Math.random() < 0.8 ? heroCls : ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest'][(Math.random() * 6) | 0];
    const base = baseFor(cls, slot, mon.level);
    out.push(makeGear(base, clamp(mon.level + ((Math.random() * 3) | 0) - 1, 1, 100), Math.random, mon.boss ? 1 : 0));
  }
  if (Math.random() < 0.12 * tierBoost) out.push(makeStack('POT_HP_S', 1 + (mon.boss ? 2 : 0)));
  if (Math.random() < 0.06 * tierBoost) out.push(makeStack('POT_MP_S', 1));
  const region = GDD.regions.find((r) => r.name === mon.row.region);
  const lvl = mon.level;
  if (Math.random() < 0.1 * tierBoost) out.push(makeStack(lvl >= 65 && Math.random() < 0.5 ? 'MAT_VOID' : lvl >= 50 && region && region.id === 'MAP_FRO' ? 'MAT_SKYIRON' : lvl >= 25 ? 'MAT_IRON' : 'MAT_COPPER', 1));
  if (mon.boss && Math.random() < 0.3) out.push(makeStack('SCROLL_PROTECT', 1));
  return { gold, items: out };
}

// ---------------------------------------------------------------- inventory
export class Inventory {
  constructor(size = 36) { this.size = size; this.items = []; }
  get free() { return this.size - this.items.length; }
  count(id) { return this.items.filter((i) => i.id === id).reduce((a, b) => a + (b.qty || 1), 0); }
  add(it) {
    if (it.stack) {
      const ex = this.items.find((i) => i.stack && i.id === it.id);
      if (ex) { ex.qty += it.qty; return true; }
    }
    if (this.items.length >= this.size) return false;
    this.items.push(it);
    return true;
  }
  remove(uidOrItem, qty = 1) {
    const it = typeof uidOrItem === 'object' ? uidOrItem : this.items.find((i) => i.uid === uidOrItem);
    if (!it) return false;
    if (it.stack && it.qty > qty) { it.qty -= qty; return true; }
    this.items = this.items.filter((i) => i !== it);
    return true;
  }
  take(id, qty) {
    if (this.count(id) < qty) return false;
    let left = qty;
    for (const it of [...this.items]) {
      if (it.id !== id || left <= 0) continue;
      const n = Math.min(left, it.qty || 1);
      this.remove(it, n); left -= n;
    }
    return true;
  }
  sort() {
    const order = { gear: 0, potion: 1, flask: 1, scroll: 2, material: 3, quest: 4 };
    this.items.sort((a, b) => (order[a.kind] - order[b.kind]) || (R_IDX[b.rarity] - R_IDX[a.rarity]) || ((b.ilvl || 0) - (a.ilvl || 0)));
  }
}

// ---------------------------------------------------------------- enhancement (+1..+10)
export const ENH_RATE = [1, 1, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
export function enhanceCost(it) {
  const n = it.plus + 1;
  const mat = it.req >= 65 ? 'MAT_VOID' : it.req >= 50 ? 'MAT_SKYIRON' : it.req >= 18 ? 'MAT_IRON' : 'MAT_COPPER';
  return { gold: Math.round((20 + it.req * 6) * n * (1 + R_IDX[it.rarity] * 0.3)), mat, qty: Math.ceil(n / 2) + (n >= 7 ? 2 : 0), rate: ENH_RATE[it.plus] };
}
/** Returns 'success' | 'fail' | 'drop' | 'protected' */
export function tryEnhance(it, protect) {
  if (it.plus >= 10) return 'max';
  const c = enhanceCost(it);
  if (Math.random() < c.rate) { it.plus++; return 'success'; }
  if (it.plus >= 6) { if (protect) return 'protected'; it.plus = Math.max(0, it.plus - 1); return 'drop'; }
  return 'fail';
}

// ---------------------------------------------------------------- crafting (GDD recipes → concrete outputs)
const recipeOf = (prof, i) => GDD.recipes.filter((r) => r.profession === prof)[i] || GDD.recipes[0];
export const RECIPES = [
  { id: recipeOf('Alchemy', 0).id, prof: 'Alchemy', name: 'Can İksiri ×3', level: 1, gold: 8, mats: { MAT_HERB: 2 }, out: () => makeStack('POT_HP_S', 3) },
  { id: recipeOf('Alchemy', 1).id, prof: 'Alchemy', name: 'Kaynak İksiri ×3', level: 1, gold: 8, mats: { MAT_HERB: 2, MAT_COPPER: 1 }, out: () => makeStack('POT_MP_S', 3) },
  { id: recipeOf('Alchemy', 3).id, prof: 'Alchemy', name: 'Güç Şişesi', level: 25, gold: 60, mats: { MAT_HERB: 5, MAT_IRON: 2 }, out: () => makeStack('FLASK_POWER', 1) },
  { id: recipeOf('Cooking', 0).id, prof: 'Cooking', name: 'Avcı Güveci ×2', level: 1, gold: 5, mats: { MAT_HERB: 1 }, out: () => makeStack('FOOD', 2) },
  { id: recipeOf('Enchanting', 1).id, prof: 'Enchanting', name: 'Koruma Parşömeni', level: 20, gold: 250, mats: { MAT_IRON: 4, MAT_HERB: 4 }, out: () => makeStack('SCROLL_PROTECT', 1) },
  { id: recipeOf('Blacksmithing', 0).id, prof: 'Blacksmithing', name: 'Seviyene Uygun Silah', level: 1, gold: 40, scale: true, mats: { ore: 6 }, out: (h) => makeGear(baseFor(h.cls, 'MainHand', h.level), h.level, Math.random, 1) },
  { id: recipeOf('Leatherworking', 0).id, prof: 'Leatherworking', name: 'Seviyene Uygun Zırh (rastgele)', level: 1, gold: 30, scale: true, mats: { ore: 4, MAT_HERB: 2 }, out: (h) => { const s = ['Head', 'Chest', 'Gloves', 'Legs', 'Boots', 'Cape'][(Math.random() * 6) | 0]; return makeGear(baseFor(h.cls, s, h.level), h.level, Math.random, 1); } },
  { id: recipeOf('Jewelcrafting', 0).id, prof: 'Jewelcrafting', name: 'Seviyene Uygun Takı', level: 10, gold: 60, scale: true, mats: { ore: 5 }, out: (h) => makeGear(baseFor(h.cls, Math.random() < 0.5 ? 'Ring' : 'Necklace', h.level), h.level, Math.random, 1) },
];
export const PROF_TR = { Alchemy: 'Simya', Cooking: 'Aşçılık', Enchanting: 'Efsunculuk', Blacksmithing: 'Demircilik', Leatherworking: 'Deri İşleme', Jewelcrafting: 'Kuyumculuk', Tailoring: 'Terzilik' };
export function oreFor(level) { return level >= 65 ? 'MAT_VOID' : level >= 50 ? 'MAT_SKYIRON' : level >= 22 ? 'MAT_IRON' : 'MAT_COPPER'; }
export function recipeNeeds(rec, hero) {
  const needs = {};
  for (const k in rec.mats) {
    const id = k === 'ore' ? oreFor(hero.level) : k;
    needs[id] = (needs[id] || 0) + (k === 'ore' && id === 'MAT_VOID' ? Math.ceil(rec.mats[k] / 3) : k === 'ore' && id === 'MAT_SKYIRON' ? Math.ceil(rec.mats[k] / 2) : rec.mats[k]);
  }
  const gold = rec.scale ? Math.round(rec.gold * (1 + hero.level * 0.12)) : rec.gold;
  return { needs, gold };
}

// ---------------------------------------------------------------- merchants
export function merchantStock(level, kind) {
  if (kind === 'alchemy') return [makeStack('POT_HP_S', 1), makeStack('POT_MP_S', 1), makeStack('MAT_HERB', 1), makeStack('FLASK_POWER', 1)];
  if (kind === 'shop') return [makeStack('POT_HP_S', 1), makeStack('POT_MP_S', 1), makeStack('FOOD', 1), makeStack('MAT_COPPER', 1), makeStack('MAT_HERB', 1), makeStack('MAT_IRON', 1)];
  if (kind === 'endgame') return [makeStack('MAT_VOID', 1), makeStack('MAT_SKYIRON', 1), makeStack('SCROLL_PROTECT', 1), makeStack('FLASK_POWER', 1)];
  return [];
}
export const buyPrice = (it) => Math.max(1, Math.round((it.value || 5) * (it.kind === 'gear' ? 4 : 2.5)));
export const sellPrice = (it) => Math.max(1, Math.round((it.value || 1) * (it.kind === 'gear' ? 1 + it.plus * 0.15 : 1)));

// ---------------------------------------------------------------- auction house simulation
const SELLERS = ['Kaelthorn', 'Mirabel', 'Dusk_Rider', 'Solenne', 'Torgrim', 'Nyxie', 'Aurelion', 'Vexa', 'Brannoc', 'Lumi', 'Rhogar', 'Selwyn'];
export function auctionListings(level, cls, seed) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out = [];
  for (let i = 0; i < 16; i++) {
    const L = clamp(level + ((rnd() * 10) | 0) - 4, 1, 100);
    const c = rnd() < 0.55 ? cls : ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest'][(rnd() * 6) | 0];
    const it = makeGear(baseFor(c, GEAR_SLOTS[(rnd() * GEAR_SLOTS.length) | 0], L), L, rnd, rnd() < 0.3 ? 1 : 0);
    if (rnd() < 0.25) it.plus = 1 + ((rnd() * 5) | 0);
    out.push({ item: it, price: Math.round(buyPrice(it) * (0.6 + rnd() * 0.7)), seller: SELLERS[(rnd() * SELLERS.length) | 0] });
  }
  for (const id of ['MAT_IRON', 'MAT_SKYIRON', 'MAT_VOID', 'SCROLL_PROTECT']) {
    const it = makeStack(id, id === 'SCROLL_PROTECT' ? 1 : 5);
    out.push({ item: it, price: Math.round(buyPrice(it) * it.qty * (0.7 + rnd() * 0.5)), seller: SELLERS[(rnd() * SELLERS.length) | 0] });
  }
  return out;
}
