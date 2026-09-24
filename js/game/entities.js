import { uid, clamp, TAU } from '../core/util.js';
import { GDD } from '../data/gdd.js';
import { CLASS_KIT, RESOURCE, derive, monsterNumbers, METER, TIER } from './stats.js';
import { archetypeOf, monsterColor } from '../render/sprites.js';

export class Actor {
  constructor(o) {
    this.id = uid();
    this.x = 0; this.y = 0; this.radius = 12;
    this.team = 'enemy'; this.kind = 'actor';
    this.level = 1; this.name = '';
    this.hp = 1; this.maxHp = 1; this.dead = false;
    this.buffs = [];
    this.dir = 0; this.face = 1; this.moving = false; this.walkT = 0; this.animT = Math.random() * 10;
    this.atkAnim = -1; this.atkAnimDur = 0.3; this.flash = 0;
    this.vx = 0; this.vy = 0; this.kb = null;
    this.mods = emptyMods();
    this.inCombat = 0;
    Object.assign(this, o);
  }

  get alive() { return !this.dead; }

  addBuff(b) {
    const ex = this.buffs.find((x) => x.id === b.id && (!b.perSource || x.src === b.src));
    if (ex) {
      if (b.maxStacks) ex.stacks = Math.min(b.maxStacks, (ex.stacks || 1) + 1);
      ex.t = 0; ex.dur = Math.max(ex.dur - ex.t, b.dur);
      if (b.shield) ex.shield = Math.max(ex.shield || 0, b.shield);
      if (b.dot) ex.dot = b.dot;
      return ex;
    }
    const nb = { t: 0, stacks: 1, tick: 0, ...b };
    this.buffs.push(nb);
    return nb;
  }
  removeBuff(id) { this.buffs = this.buffs.filter((b) => b.id !== id); }
  hasBuff(id) { return this.buffs.some((b) => b.id === id); }
  cleanse(n = 2) {
    let c = 0;
    this.buffs = this.buffs.filter((b) => { if (b.debuff && c < n) { c++; return false; } return true; });
    return c;
  }

  /** Aggregate buff modifiers for this frame. */
  computeMods() {
    const m = emptyMods();
    for (const b of this.buffs) {
      const s = b.stacks || 1;
      if (b.mods) for (const k in b.mods) m[k] += b.mods[k] * (b.stackMods ? s : 1);
      if (b.stun) m.stun = true;
      if (b.root) m.root = true;
      if (b.silence) m.silence = true;
      if (b.slow) m.slow = Math.max(m.slow, b.slow);
      if (b.stealth) m.stealth = true;
      if (b.cheatDeath) m.cheatDeath = true;
      if (b.taunt && b.taunt.alive) m.taunt = b.taunt;
      if (b.ccImmune) m.ccImmune = true;
      if (b.echo) m.echo = b;
      if (b.iframe) m.iframe = true;
      if (b.blind) m.blind = true;
    }
    if (m.ccImmune) { m.stun = false; m.root = false; m.slow = 0; }
    m.slow = Math.min(m.slow, 0.45); // GDD slow stack cap
    this.mods = m;
    return m;
  }

  shieldTotal() { return this.buffs.reduce((a, b) => a + (b.shield || 0), 0); }
}

export function emptyMods() {
  return { dmg: 0, dmgTaken: 0, def: 0, ms: 0, rageGain: 0, aspd: 0, crit: 0, critTaken: 0, dodge: 0, lifesteal: 0, heal: 0, threat: 0, cdr: 0, stun: false, root: false, silence: false, slow: 0, stealth: false, cheatDeath: false, taunt: null, ccImmune: false, echo: null, iframe: false, blind: false };
}

// ------------------------------------------------------------------ heroes
export class Hero extends Actor {
  constructor(o) {
    super({ kind: 'hero', team: 'ally', radius: 12 });
    this.cls = o.cls;
    this.kit = CLASS_KIT[o.cls];
    this.def = GDD.classes[o.cls];
    this.resourceName = this.def.resource;
    this.res = RESOURCE[this.resourceName];
    this.look = { ...this.kit.look, ...(o.look || {}) };
    this.name = o.name;
    this.level = o.level || 1;
    this.stats = o.stats || null;
    this.gear = { atk: 0, def: 0, hp: 0, pct: {} };
    this.cooldowns = {};
    this.gcd = 0;
    this.attackCd = 0;
    this.ai = !!o.ai;
    this.isPlayer = !!o.isPlayer;
    this.skillRanks = o.skillRanks || {};
    this.combo = 0;
    this.stance = null;
    this.mount = null;
    this.dodgeCd = 0;
    this.passivePct = {};
    this.derived = null;
    this.resource = 0;
    this.threatMult = this.kit.threat;
  }

  recalc() {
    const pct = { ...this.gear.pct };
    for (const k in this.passivePct) pct[k] = (pct[k] || 0) + this.passivePct[k];
    const d = derive(this.cls, this.level, this.stats, { ...this.gear, pct }, this.resourceName);
    const hpFrac = this.maxHp > 1 ? this.hp / this.maxHp : 1;
    this.derived = d;
    this.maxHp = d.maxHp;
    this.hp = clamp(Math.round(this.maxHp * hpFrac), this.dead ? 0 : 1, this.maxHp);
    this.maxRes = d.maxRes;
    if (this.resource > this.maxRes) this.resource = this.maxRes;
  }

  get atk() { return this.derived.atk; }
  get defVal() { return this.derived.def; }
  get mdefVal() { return this.derived.mdef; }
  get moveSpeed() {
    const base = 5.2 * METER;
    const mountB = this.mount && !this.inCombatRecent() ? this.mount.speed : 0;
    return base * (1 + mountB + this.mods.ms + (this.derived.ms - 1)) * (1 - this.mods.slow);
  }
  inCombatRecent() { return this.inCombat > 0; }

  passiveDmg(tgt) {
    const p = this.passivePct;
    let b = 0;
    if (p.bossDmg && tgt.boss) b += p.bossDmg;
    if (p.farDmg && Math.hypot(tgt.x - this.x, tgt.y - this.y) > 8 * METER) b += p.farDmg;
    if (p.lowHpDmg && this.hp / this.maxHp < 0.35) b += p.lowHpDmg;
    if (p.bossCrit && tgt.boss && Math.random() * 100 < p.bossCrit) b += 0.25;
    return b;
  }
  onLethal(world) {
    if (this.passivePct.phantom && !(this.phantomCd > world.time)) {
      this.phantomCd = world.time + 90;
      this.addBuff({ id: 'vanish', name: 'Phantom Escape', dur: 3, stealth: true, color: '#7050a0' });
      for (const m of world.monsters) m.threat.delete(this);
      return true;
    }
    return false;
  }
  skillList() { return this.def.skills; }
  rankOf(skill) { return this.skillRanks[skill.id] || 0; }
  skillCost(skill) {
    const r = skill.ranks[Math.max(0, this.rankOf(skill) - 1)];
    if (this.res.pool) return Math.round(r.cost * (3 + this.level * 0.12));
    return r.cost;
  }
  skillCd(skill) {
    const r = skill.ranks[Math.max(0, this.rankOf(skill) - 1)];
    return r.cd * (1 - clamp((this.derived.cdr || 0) + this.mods.cdr, 0, 0.3));
  }
  skillCoef(skill) { return skill.ranks[Math.max(0, this.rankOf(skill) - 1)].coef; }

  regen(dt) {
    const r = this.res;
    if (this.dead) return;
    if (r.pool) {
      const rate = this.maxRes * (this.inCombat > 0 ? 0.018 : 0.06) + (this.derived.S.SPI * 0.05);
      this.resource = Math.min(this.maxRes, this.resource + rate * dt * (1 + (this.passivePct.resRegen || 0)));
    } else if (this.resourceName === 'Rage') {
      if (this.inCombat <= 0) this.resource = Math.max(0, this.resource - 6 * dt);
    } else {
      this.resource = Math.min(this.maxRes, this.resource + r.regen * dt * (this.inCombat > 0 ? 1 : 2));
    }
    if (this.inCombat <= 0 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.035 * dt);
  }
}

// ------------------------------------------------------------------ monsters
const RANGED_RE = /archer|priest|acolyte|witch|djinn|sprite|wisp|lumen|ether|glowcap|harpy|keeper|oracle|cantor|apostle|shade|sentinel|mirage/i;

export class Monster extends Actor {
  constructor(row, tier = 'Normal', opts = {}) {
    super({ kind: 'monster', team: 'enemy' });
    this.row = row;
    this.tier = tier;
    this.name = opts.name || row.name;
    this.level = row.level;
    this.gddId = row.id;
    const n = monsterNumbers(row, tier);
    this.maxHp = this.hp = Math.round(n.maxHp * (opts.hpMult || 1));
    this.atkVal = Math.round(n.atk * (opts.atkMult || 1));
    this.defVal = n.def; this.mdefVal = n.def;
    this.arch = opts.arch || archetypeOf(this.name);
    this.color = opts.color || monsterColor(this.name, opts.fallbackColor);
    this.size = TIER[tier].size * (opts.sizeMult || 1) * (this.arch === 'golem' ? 1.1 : this.arch === 'flyer' ? 0.9 : 1);
    this.radius = 11 * this.size;
    this.boss = tier === 'Boss' || tier === 'Raid';
    this.elite = tier !== 'Normal';
    this.ranged = !this.boss && RANGED_RE.test(this.name);
    this.attackRange = this.ranged ? 7 * METER : this.radius + 1.3 * METER;
    this.attackInterval = this.boss ? 1.6 : this.elite ? 1.5 : 1.45;
    this.attackCd = 1;
    this.speed = (this.arch === 'quad' ? 4.4 : this.arch === 'flyer' ? 4.6 : this.arch === 'golem' ? 3.2 : 3.8) * METER * (this.boss ? 0.95 : 1);
    this.aggroR = (this.boss ? 9 : this.elite ? 6 : 4.8) * METER;
    this.passive = !this.boss && this.level <= 3 && tier === 'Normal';
    this.threat = new Map();
    this.state = 'idle';
    this.home = null;
    this.wanderT = Math.random() * 3;
    this.wanderTo = null;
    this.abilities = opts.abilities || [];
    this.abilityCd = 4;
    this.xpMult = TIER[tier].xp * (row.xpMult || 1);
    this.respawn = opts.respawn ?? (this.boss ? 90 : this.elite ? 30 : 14);
    this.questTag = opts.questTag || null;
    this.aura = this.boss ? (opts.aura || this.color) : tier === 'Named' ? '#ffcc40' : null;
    this.enraged = false;
    this.phase = 0;
    this.leash = (this.boss ? 22 : 16) * METER;
    this.dir = 1;
    this.lastHitT = 0;
    this.eye = opts.eye;
    this.wing = opts.wing;
  }
  get atk() { return this.atkVal * (1 + this.mods.dmg) * (this.enraged ? 1.35 : 1); }
  topThreat(world) {
    if (this.mods.taunt && this.mods.taunt.alive) return this.mods.taunt;
    let best = null, bv = -1;
    for (const [a, v] of this.threat) {
      if (!a.alive || a.map !== world.map || a.mods.stealth) { this.threat.delete(a); continue; }
      if (v > bv) { bv = v; best = a; }
    }
    return best;
  }
  addThreat(a, v) { if (a && a.alive) this.threat.set(a, (this.threat.get(a) || 0) + Math.max(0, v)); }
}

// ------------------------------------------------------------------ NPCs & objects
export class NPC extends Actor {
  constructor(o) {
    super({ kind: 'npc', team: 'neutral', radius: 12, ...o });
    this.look = o.look || { body: '#6a5a8a', trim: '#e0c060', hair: '#3a2a1a', skin: '#f0d0b0', hat: 'none' };
    this.interactR = 2.2 * METER;
    this.hp = this.maxHp = 1000;
    this.dir = 0;
  }
}

/** Static interactable: seal runes, clues, gather nodes, portals, chests, defend objectives. */
export class WorldObject {
  constructor(o) {
    this.id = uid();
    this.kind = 'object';
    this.x = 0; this.y = 0; this.r = 26;
    this.t = Math.random() * 10;
    Object.assign(this, o);
  }
}

export const DIRS = { down: 0, left: 1, right: 2, up: 3 };
export function dirFromAngle(a) {
  const d = ((a % TAU) + TAU) % TAU;
  if (d > Math.PI * 0.25 && d <= Math.PI * 0.75) return 0;
  if (d > Math.PI * 0.75 && d <= Math.PI * 1.25) return 1;
  if (d > Math.PI * 1.25 && d <= Math.PI * 1.75) return 3;
  return 2;
}
