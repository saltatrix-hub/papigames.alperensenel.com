// Server-style authoritative damage resolution (GDD §6 formulas, §6.1 statuses).
import { clamp } from '../core/util.js';
import { mitigation, levelDiffDealt, levelDiffTaken } from './stats.js';
import { audio } from '../core/audio.js';

const atkOf = (a) => a.atk;
const critOf = (a) => (a.kind === 'hero' ? a.derived.crit : a.elite ? 8 : 4) + a.mods.crit;
const critDmgOf = (a) => (a.kind === 'hero' ? a.derived.critDmg : 1.5);
const defOf = (a, magic) => {
  const base = a.kind === 'hero' ? (magic ? a.derived.mdef : a.derived.def) : (magic ? a.mdefVal : a.defVal);
  const md = a.kind === 'hero' && a.passivePct.missingDef ? a.passivePct.missingDef * (1 - a.hp / a.maxHp) : 0;
  return base * (1 + a.mods.def + md);
};
const dodgeOf = (a) => (a.kind === 'hero' ? clamp(a.derived.dodge + a.mods.dodge, 0, 35) : 0);

/**
 * opts: { coef, flat, magic, crit (bonus %), forceCrit, noDodge, dot (bool), threat (flat), skill, execute, vfx, silent }
 */
export function dealDamage(world, src, tgt, opts) {
  if (!tgt || tgt.dead || tgt.invuln) return 0;
  if (tgt.mods.iframe && !opts.dot) { world.floatText(tgt.x, tgt.y - 50, 'KAÇINDI', '#9fe8ff', 0.9); return 0; }
  const magic = !!opts.magic;
  if (!opts.dot && !opts.noDodge && Math.random() * 100 < dodgeOf(tgt)) {
    world.floatText(tgt.x, tgt.y - 50, 'Kaçış', '#cfd8ff', 0.9);
    return 0;
  }
  if (!opts.dot && src && src.mods.blind && Math.random() < 0.35) {
    world.floatText(tgt.x, tgt.y - 50, 'Iskaladı', '#bbb', 0.9);
    return 0;
  }
  let raw = (opts.flat || 0) + (src ? atkOf(src) * (opts.coef ?? 1) : 0);
  if (opts.execute) raw *= 1 + (1 - tgt.hp / tgt.maxHp) * opts.execute;
  if (opts.lowHpBonus && tgt.hp / tgt.maxHp < 0.3) raw *= 1 + opts.lowHpBonus;
  const srcLvl = src ? src.level : tgt.level;
  let dmg = raw * mitigation(srcLvl, defOf(tgt, magic));
  dmg *= levelDiffDealt(srcLvl, tgt.level);
  if (src && src.kind === 'monster') dmg *= levelDiffTaken(src.level, tgt.level) / levelDiffDealt(srcLvl, tgt.level);
  if (src) dmg *= 1 + (src.mods.dmg || 0) + (src.passiveDmg ? src.passiveDmg(tgt) : 0);
  dmg *= 1 + tgt.mods.dmgTaken;
  if (world.pvp && src && src.kind === 'hero' && tgt.kind === 'hero') dmg *= 0.85; // GDD PvP coefficient
  let crit = false;
  if (!opts.dot && src) {
    const cc = critOf(src) + (opts.crit || 0) + (tgt.mods.critTaken || 0);
    if (opts.forceCrit || Math.random() * 100 < Math.min(65, cc)) { crit = true; dmg *= critDmgOf(src); }
  }
  dmg *= opts.dot ? 1 : 0.92 + Math.random() * 0.16;
  dmg = Math.max(1, Math.round(dmg));

  // shields absorb first
  let absorbed = 0;
  for (const b of tgt.buffs) {
    if (!b.shield || dmg <= 0) continue;
    const a = Math.min(b.shield, dmg);
    b.shield -= a; dmg -= a; absorbed += a;
    if (b.shield <= 0) b.dur = 0;
  }
  tgt.hp -= dmg;
  if (tgt.hp <= 0 && tgt.mods.cheatDeath) tgt.hp = 1;
  if (tgt.hp <= 0 && tgt.onLethal && tgt.onLethal(world)) tgt.hp = 1;

  tgt.flash = 0.1;
  tgt.inCombat = 6;
  if (src) src.inCombat = 6;
  tgt.lastHitT = world.time;

  // resource gains
  if (tgt.kind === 'hero') {
    if (tgt.resourceName === 'Rage') tgt.resource = Math.min(tgt.maxRes, tgt.resource + 4 * (1 + (tgt.passivePct.rageGain || 0)));
    if (tgt.resourceName === 'Valor') tgt.resource = Math.min(tgt.maxRes, tgt.resource + 2);
    if (tgt.mount) tgt.mount = null;
  }
  if (src && src.kind === 'hero') {
    if (src.resourceName === 'Rage' && !opts.dot) src.resource = Math.min(src.maxRes, src.resource + (opts.skill ? 3 : 7) * (1 + (src.passivePct.rageGain || 0) + (src.mods.rageGain || 0)));
    const ls = (src.mods.lifesteal || 0) + (src.passivePct.lifesteal || 0) + ((src.gear.pct && src.gear.pct.lifesteal) || 0);
    if (ls > 0 && dmg > 0) healActor(world, src, src, dmg * ls, { silent: true });
    if (src.mount) src.mount = null;
  }
  // threat
  if (tgt.kind === 'monster' && src) {
    const tm = (src.threatMult || 1) * (1 + (src.mods.threat || 0));
    tgt.addThreat(src, (dmg + absorbed) * tm + (opts.threat || 0));
    if (tgt.state === 'idle' || tgt.state === 'return') tgt.state = 'chase';
  }
  // feedback
  if (!opts.silent) {
    const col = tgt.team === 'ally' ? '#ff6060' : opts.dot ? '#d8a0ff' : crit ? '#ffd23a' : magic ? '#9fd4ff' : '#ffffff';
    world.floatText(tgt.x + (Math.random() - 0.5) * 16, tgt.y - 44 * (tgt.size || 1), (crit ? '' : '') + dmg, col, crit ? 1.35 : opts.dot ? 0.8 : 1, crit);
    if (!opts.dot) {
      world.hitSpark(tgt.x, tgt.y - 18 * (tgt.size || 1), crit ? '#ffd23a' : magic ? '#9fd4ff' : '#ffffff', crit ? 10 : 6);
      audio.play(crit ? 'crit' : 'hit');
    }
    if (absorbed > 0) world.floatText(tgt.x, tgt.y - 62, `(${absorbed} emildi)`, '#9fe0ff', 0.75);
    if (tgt.isPlayer && dmg > tgt.maxHp * 0.12) world.shake(Math.min(10, (dmg / tgt.maxHp) * 30));
  }
  if (world.dpsMeter && src && src.team === 'ally') world.dpsMeter(src, dmg);
  if (tgt.hp <= 0) { tgt.hp = 0; world.kill(tgt, src); }
  return dmg;
}

export function healActor(world, src, tgt, amount, opts = {}) {
  if (!tgt || tgt.dead) return 0;
  let h = amount * (src && src.kind === 'hero' ? (src.derived.heal + (src.mods.heal || 0)) : 1);
  if (src && src.passivePct && src.passivePct.healLow && tgt.hp / tgt.maxHp < 0.35) h *= 1 + src.passivePct.healLow;
  h = Math.round(h);
  const before = tgt.hp;
  tgt.hp = Math.min(tgt.maxHp, tgt.hp + h);
  const real = tgt.hp - before;
  if (!opts.silent && real > 0) world.floatText(tgt.x, tgt.y - 52, '+' + real, '#6dff8a', 1);
  if (src && src.kind === 'hero' && real > 0) {
    for (const m of world.monsters) if (m.alive && m.threat.has(tgt)) m.addThreat(src, real * 0.45);
  }
  return real;
}

// ---------------------------------------------------------------- statuses (GDD §6.1)
export const STATUS = {
  stun: (dur) => ({ id: 'stun', name: 'Sersemletme', dur, stun: true, debuff: true, color: '#ffe060', cc: true }),
  root: (dur) => ({ id: 'root', name: 'Kök', dur, root: true, debuff: true, color: '#7fd060', cc: true }),
  slow: (pct, dur) => ({ id: 'slow', name: 'Yavaşlama', dur, slow: pct, debuff: true, color: '#80c0ff' }),
  chill: (pct, dur) => ({ id: 'chill', name: 'Üşüme', dur, slow: pct, mods: { dmgTaken: 0.04 }, stackMods: true, maxStacks: 3, debuff: true, color: '#a0e0ff' }),
  silence: (dur) => ({ id: 'silence', name: 'Susturma', dur, silence: true, debuff: true, color: '#c080ff', cc: true }),
  blind: (dur) => ({ id: 'blind', name: 'Körlük', dur, blind: true, debuff: true, color: '#e0e0e0' }),
  bleed: (per, dur) => ({ id: 'bleed', name: 'Kanama', dur, dot: { per, type: 'phys' }, maxStacks: 3, debuff: true, color: '#d03030' }),
  poison: (per, dur) => ({ id: 'poison', name: 'Zehir', dur, dot: { per, type: 'nature' }, maxStacks: 5, debuff: true, color: '#60d040' }),
  burn: (per, dur) => ({ id: 'burn', name: 'Yanma', dur, dot: { per, type: 'fire' }, debuff: true, color: '#ff8030' }),
  taunt: (by, dur) => ({ id: 'taunt', name: 'Provoke', dur, taunt: by, debuff: true, color: '#ff4040' }),
  curse: (per, dur) => ({ id: 'curse', name: 'Lanet', dur, dot: { per, type: 'shadow' }, maxStacks: 5, debuff: true, color: '#9040c0' }),
};

/** Apply a status with CC diminishing (bosses resist hard CC; GDD Blind: boss immune). */
export function applyStatus(world, tgt, b, src) {
  if (!tgt || tgt.dead) return;
  if (tgt.boss && (b.id === 'stun' || b.id === 'root' || b.id === 'blind' || b.id === 'silence')) {
    if (b.id === 'stun' && Math.random() < 0.4) { b = { ...b, dur: b.dur * 0.3 }; } else { world.floatText(tgt.x, tgt.y - 70, 'Bağışık', '#ccc', 0.8); return; }
  }
  if (tgt.mods.ccImmune && b.cc) return;
  if (world.pvp && b.id === 'root') b = { ...b, dur: Math.min(b.dur, 2.5) };
  if (world.pvp && b.id === 'silence') b = { ...b, dur: Math.min(b.dur, 2) };
  if (b.id === 'taunt' && tgt.kind === 'monster' && src) {
    const top = tgt.topThreat(world);
    const want = (top ? tgt.threat.get(top) || 0 : 0) * 1.1 + 100;
    tgt.threat.set(src, Math.max(tgt.threat.get(src) || 0, want));
  }
  b.src = src;
  tgt.addBuff(b);
}

/** Tick DoTs/HoTs/durations. */
export function tickBuffs(world, a, dt) {
  for (const b of a.buffs) {
    b.t += dt;
    if (b.dot || b.hot) {
      b.tick += dt;
      while (b.tick >= 1) {
        b.tick -= 1;
        if (b.dot) dealDamage(world, b.src && b.src.alive ? b.src : null, a, { flat: b.dot.per * (b.stacks || 1), dot: true, noDodge: true, magic: b.dot.type !== 'phys' });
        if (b.hot) healActor(world, b.src, a, b.hot, {});
        if (a.dead) return;
      }
    }
  }
  a.buffs = a.buffs.filter((b) => b.t < b.dur);
}
