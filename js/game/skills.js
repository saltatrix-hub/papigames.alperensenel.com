// Skill behaviours. Numbers (coef/cd/cost/ranks) come from GDD skills_ranked.csv; this file maps
// each GDD skill to an executable behaviour + parses hitbox metres / CC text from the GDD row.
import { METER } from './stats.js';
import { dealDamage, healActor, applyStatus, STATUS } from './combat.js';
import { angleTo, dist, clamp } from '../core/util.js';
import { audio } from '../core/audio.js';

const M = METER;
export const ELEMENT = { Knight: '#ffe08a', Berserker: '#ff5a3a', Assassin: '#b070ff', Ranger: '#6aff8a', Mage: '#7fc8ff', Priest: '#fff0a0' };

/** Parse a number of metres from the GDD hitbox string ("120° cone 3m", "13m projectile", "5m circle at 12m"). */
export function hitboxMeters(s, fallback = 3) {
  const m = String(s).match(/(\d+(?:\.\d+)?)\s*m/);
  return m ? parseFloat(m[1]) : fallback;
}
const arcOf = (s, fb = 110) => { const m = String(s).match(/(\d+)°/); return m ? +m[1] : fb; };
const secOf = (s, fb = 2) => { const m = String(s).match(/(\d+(?:\.\d+)?)\s*s/); return m ? parseFloat(m[1]) : fb; };
const pctOf = (s, fb = 0.1) => { const m = String(s).match(/(\d+(?:\.\d+)?)\s*%/); return m ? parseFloat(m[1]) / 100 : fb; };
const threatOf = (s) => { const m = String(s).match(/(-?\d+)\s*threat/); return m ? +m[1] : 0; };

// ---------------------------------------------------------------- targeting helpers
export function resolveTarget(w, c, aim, range) {
  const foes = w.enemiesOf(c);
  if (aim.target && aim.target.alive && foes.includes(aim.target) && dist(c.x, c.y, aim.target.x, aim.target.y) <= range + 40) return aim.target;
  let best = null, bd = 1e9;
  for (const f of foes) {
    if (f.mods.stealth) continue;
    const d = dist(aim.x, aim.y, f.x, f.y);
    if (d < 3.2 * M && d < bd && dist(c.x, c.y, f.x, f.y) <= range + 40) { bd = d; best = f; }
  }
  if (best) return best;
  for (const f of foes) {
    if (f.mods.stealth) continue;
    const d = dist(c.x, c.y, f.x, f.y);
    if (d <= range && d < bd) { bd = d; best = f; }
  }
  return best;
}
const aimAngle = (c, aim) => angleTo(c.x, c.y - 16, aim.x, aim.y);
const clampAim = (c, aim, maxR) => {
  const d = dist(c.x, c.y, aim.x, aim.y);
  if (d <= maxR) return { x: aim.x, y: aim.y };
  const a = angleTo(c.x, c.y, aim.x, aim.y);
  return { x: c.x + Math.cos(a) * maxR, y: c.y + Math.sin(a) * maxR };
};
const lowestAlly = (w, c, range) => {
  let best = c, bv = c.hp / c.maxHp;
  for (const a of w.alliesOf(c)) {
    if (a.dead || dist(c.x, c.y, a.x, a.y) > range) continue;
    const v = a.hp / a.maxHp;
    if (v < bv) { bv = v; best = a; }
  }
  return best;
};
const alliesNear = (w, c, r) => w.alliesOf(c).filter((a) => !a.dead && dist(c.x, c.y, a.x, a.y) <= r);

function hitList(w, c, list, coef, extra = {}, onHit) {
  let n = 0;
  for (const t of list) {
    const d = dealDamage(w, c, t, { coef, magic: c.kit.magic, skill: true, threat: extra.threat || 0, ...extra });
    if (onHit && !t.dead) onHit(t, d);
    n++;
  }
  return n;
}

function buff(c, id, name, dur, o, color) { return c.addBuff({ id, name, dur, color: color || ELEMENT[c.cls], ...o }); }

function stance(c, id, name, mods) {
  const had = c.stance === id;
  c.buffs = c.buffs.filter((b) => !b.stanceBuff);
  if (had) { c.stance = null; return; }
  c.stance = id;
  c.addBuff({ id, name, dur: 1e9, stanceBuff: true, mods, color: ELEMENT[c.cls] });
}

// ---------------------------------------------------------------- behaviour table
// Each entry: { g: glyph, run(w, caster, skill, aim, coef, ctx) , range?: metres for AI }
const B = {
  // ============================ KNIGHT
  'Shield Rush': { g: 'dash', range: 6, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim); const len = 5 * M;
    w.dash(c, a, len, 0.22, () => {
      const hits = w.inLine(w.enemiesOf(c), c.x, c.y, a + Math.PI, 2.2 * M, 1.4 * M);
      hitList(w, c, hits, k, { threat: threatOf(s.threat) }, (t) => applyStatus(w, t, STATUS.stun(secOf(s.cc, 1.2)), c));
      w.fx.ring(c.x, c.y, 2.2 * M, ELEMENT.Knight, 0.3);
    });
    audio.play('heavy');
  } },
  'Bulwark Stance': { g: 'shield', self: true, run(w, c) { stance(c, 'bulwark', 'Bulwark Stance', { dmgTaken: -0.2, threat: 0.35 }); audio.play('buff'); w.fx.ring(c.x, c.y, 60, '#8ab0ff', 0.4); } },
  'Taunting Cry': { g: 'taunt', range: 5, aoe: true, run(w, c, s) {
    const r = hitboxMeters(s.hitbox, 5) * M;
    for (const t of w.inCircle(w.enemiesOf(c), c.x, c.y, r)) applyStatus(w, t, STATUS.taunt(c, secOf(s.cc, 3)), c);
    w.fx.ring(c.x, c.y, r, '#ff6040', 0.5); audio.play('warn');
  } },
  'Radiant Slash': { g: 'cone', range: 3, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim), r = hitboxMeters(s.hitbox, 3) * M + 12, arc = arcOf(s.hitbox, 120);
    hitList(w, c, w.inCone(w.enemiesOf(c), c.x, c.y, a, arc, r), k, { threat: threatOf(s.threat) }, (t) => t.addBuff({ id: 'holymark', name: 'Kutsal İşaret', dur: 6, debuff: true, mods: { dmgTaken: 0.06 }, color: '#ffe08a' }));
    w.fx.slash(c.x, c.y - 16, a, r, arc, ELEMENT.Knight); audio.play('swing');
  } },
  'Guardian Oath': { g: 'shield', support: true, run(w, c) {
    const t = lowestAlly(w, c, 10 * M);
    t.addBuff({ id: 'oath', name: 'Guardian Oath', dur: 8, mods: { dmgTaken: -0.3 }, color: '#8ab0ff' });
    w.fx.beam(c.x, c.y - 20, t.x, t.y - 20, '#8ab0ff', 0.4); audio.play('holy');
  } },
  'Aegis Wall': { g: 'shield', support: true, run(w, c, s) {
    for (const a of alliesNear(w, c, 6 * M)) a.addBuff({ id: 'aegis', name: 'Aegis Wall', dur: 8, shield: Math.round(a.maxHp * pctOf(s.cc, 0.12)), color: '#9fd8ff' });
    w.fx.ring(c.x, c.y, 6 * M, '#9fd8ff', 0.5); audio.play('buff');
  } },
  'Counter Bastion': { g: 'shield', range: 2.4, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim);
    c.addBuff({ id: 'counter', name: 'Counter Bastion', dur: 2, mods: { dmgTaken: -0.35 }, color: '#ffe08a' });
    hitList(w, c, w.inCone(w.enemiesOf(c), c.x, c.y, a, 110, 2.4 * M), k, { threat: threatOf(s.threat) }, (t) => w.knockback(t, c.x, c.y, 0.8 * M * 2));
    w.fx.slash(c.x, c.y - 16, a, 2.4 * M, 110, '#ffffff'); audio.play('heavy');
  } },
  'Lionheart Banner': { g: 'buff', support: true, run(w, c, s) {
    for (const a of alliesNear(w, c, hitboxMeters(s.hitbox, 6) * M)) a.addBuff({ id: 'lionheart', name: 'Lionheart Banner', dur: 15, mods: { def: 0.12 }, color: '#ffe08a' });
    w.fx.ring(c.x, c.y, 6 * M, '#ffe08a', 0.6); audio.play('holy');
  } },
  'Hammer of Judgment': { g: 'aoe', range: 4, aoe: true, run(w, c, s, aim, k) {
    const r = hitboxMeters(s.hitbox, 4) * M;
    hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, r), k, { threat: threatOf(s.threat) }, (t) => applyStatus(w, t, STATUS.slow(0.35, 4), c));
    w.fx.ring(c.x, c.y, r, ELEMENT.Knight, 0.5); w.fx.burst(c.x, c.y, '#fff4c0', 24); w.shake(6); audio.play('slam');
  } },
  'Sanctified Rampart': { g: 'shield', support: true, run(w, c, s) {
    for (const a of alliesNear(w, c, 7 * M)) { a.cleanse(3); a.addBuff({ id: 'rampart', name: 'Sanctified Rampart', dur: 10, shield: Math.round(a.maxHp * 0.2), ccImmune: true, color: '#fff4c0' }); }
    w.fx.ring(c.x, c.y, 7 * M, '#fff4c0', 0.7); audio.play('holy');
  } },
  'Kings Challenge': { g: 'taunt', range: 8, run(w, c, s, aim) {
    const t = resolveTarget(w, c, aim, 8 * M); if (!t) return false;
    applyStatus(w, t, STATUS.taunt(c, 5), c); if (t.addThreat) t.addThreat(c, 3000);
    w.fx.beam(c.x, c.y - 20, t.x, t.y - 20, '#ff6040', 0.4); audio.play('warn');
  } },
  'Last Bastion': { g: 'ultimate', self: true, run(w, c) { c.addBuff({ id: 'lastbastion', name: 'Last Bastion', dur: 5, cheatDeath: true, color: '#ffe08a' }); w.fx.ring(c.x, c.y, 80, '#ffe08a', 0.8); audio.play('holy'); } },

  // ============================ BERSERKER
  'Savage Cleave': { g: 'cone', range: 2.6, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim), r = 2.7 * M, arc = arcOf(s.hitbox, 120);
    hitList(w, c, w.inCone(w.enemiesOf(c), c.x, c.y, a, arc, r), k, { threat: threatOf(s.threat) }, (t) => applyStatus(w, t, STATUS.bleed(Math.round(c.atk * 0.12 * (1 + (c.passivePct.bleed || 0))), 4), c));
    w.fx.slash(c.x, c.y - 16, a, r, arc, ELEMENT.Berserker); audio.play('heavy');
  } },
  'War Roar': { g: 'taunt', range: 5, aoe: true, run(w, c, s) {
    for (const t of w.inCircle(w.enemiesOf(c), c.x, c.y, 5 * M)) applyStatus(w, t, STATUS.taunt(c, 3), c);
    c.addBuff({ id: 'roar', name: 'War Roar', dur: 3, ccImmune: true, color: '#ff5a3a' });
    c.resource = Math.min(c.maxRes, c.resource + 20);
    w.fx.ring(c.x, c.y, 5 * M, '#ff5a3a', 0.5); w.shake(4); audio.play('warn');
  } },
  'Blood Crash': { g: 'strike', range: 2.5, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 2.8 * M); if (!t) return false;
    hitList(w, c, [t], k, { threat: threatOf(s.threat) }, (x) => applyStatus(w, x, STATUS.bleed(Math.round(c.atk * 0.15 * (1 + (c.passivePct.bleed || 0))), 8), c));
    w.fx.burst(t.x, t.y - 20, '#ff3a2a', 16); audio.play('heavy');
  } },
  'Ravager Stance': { g: 'buff', self: true, run(w, c) { stance(c, 'ravager', 'Ravager Stance', { dmg: 0.15, def: -0.1, threat: -0.2 }); audio.play('buff'); } },
  'Defender Stance': { g: 'shield', self: true, run(w, c) { stance(c, 'defender', 'Defender Stance', { dmgTaken: -0.12, threat: 0.45 }); audio.play('buff'); } },
  'Whirlwind Carve': { g: 'aoe', range: 4, aoe: true, run(w, c, s, aim, k) {
    const r = hitboxMeters(s.hitbox, 4) * M;
    for (let i = 0; i < 3; i++) w.delayed(i * 0.25, () => {
      if (c.dead) return;
      hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, r), k / 3, { threat: threatOf(s.threat) / 3 }, (t) => w.pull(t, c.x, c.y, 10));
      w.fx.ring(c.x, c.y, r, ELEMENT.Berserker, 0.25); audio.play('swing');
    });
  } },
  'Skullsplitter': { g: 'strike', range: 2.5, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 2.8 * M); if (!t) return false;
    hitList(w, c, [t], k, { threat: threatOf(s.threat) }, (x) => x.addBuff({ id: 'armorbreak', name: 'Zırh Kırma', dur: 8, debuff: true, mods: { def: -0.15 }, color: '#c08060' }));
    w.fx.burst(t.x, t.y - 20, '#ffffff', 12); audio.play('heavy');
  } },
  'Blood Pact': { g: 'buff', self: true, run(w, c) { buff(c, 'bloodpact', 'Blood Pact', 12, { mods: { lifesteal: 0.12 } }); w.fx.ring(c.x, c.y, 60, '#ff3a2a', 0.5); audio.play('buff'); } },
  'Titanbreaker Leap': { g: 'leap', range: 8, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 8 * M);
    w.leap(c, p.x, p.y, 0.45, () => {
      hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, 4 * M), k, { threat: threatOf(s.threat) }, (t) => applyStatus(w, t, STATUS.stun(1), c));
      w.fx.ring(c.x, c.y, 4 * M, '#ffb070', 0.5); w.fx.burst(c.x, c.y, '#c8a070', 26); w.shake(8); audio.play('slam');
    });
  } },
  'Chain of Carnage': { g: 'chain', range: 5, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 5 * M); if (!t) return false;
    w.chain(c, t, 5, 5 * M, (x, i) => { dealDamage(w, c, x, { coef: k, skill: true }); const bl = x.buffs.find((b) => b.id === 'bleed'); if (bl) bl.t = 0; }, ELEMENT.Berserker);
    audio.play('swing');
  } },
  'Unyielding Frenzy': { g: 'buff', self: true, run(w, c) { buff(c, 'frenzy', 'Unyielding Frenzy', 10, { mods: { aspd: 0.25, rageGain: 0.35 } }); w.fx.ring(c.x, c.y, 70, '#ff3a2a', 0.6); audio.play('buff'); } },
  'Execution Storm': { g: 'ultimate', range: 5, aoe: true, run(w, c, s, aim, k) {
    for (let i = 0; i < 4; i++) w.delayed(i * 0.2, () => {
      if (c.dead) return;
      hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, 5 * M), k / 4, { lowHpBonus: 0.8 });
      w.fx.ring(c.x, c.y, 5 * M, '#ff2a1a', 0.2); audio.play('heavy');
    });
    w.shake(6);
  } },

  // ============================ ASSASSIN
  'Shadow Jab': { g: 'strike', range: 2, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 2.2 * M); if (!t) return false;
    dealDamage(w, c, t, { coef: k / 2, skill: true }); w.delayed(0.12, () => dealDamage(w, c, t, { coef: k / 2, skill: true }));
    c.combo = Math.min(5, c.combo + 2);
    w.fx.slash(c.x, c.y - 16, angleTo(c.x, c.y, t.x, t.y), 2 * M, 60, ELEMENT.Assassin); audio.play('swing');
  } },
  'Vanish': { g: 'stealth', self: true, run(w, c) {
    buff(c, 'vanish', 'Vanish', 4, { stealth: true, mods: { ms: 0.2 } }, '#7050a0');
    for (const m of w.monsters) if (m.threat.has(c)) m.threat.delete(c);
    w.fx.burst(c.x, c.y - 20, '#503070', 22); audio.play('stealth');
  } },
  'Backstab': { g: 'strike', range: 2, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 2.3 * M); if (!t) return false;
    const facingT = t.kind === 'monster' ? (t.dir >= 0 ? 0 : Math.PI) : t.faceAngle || 0;
    const behind = Math.abs(((angleTo(t.x, t.y, c.x, c.y) - facingT + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < Math.PI * 0.55 || c.mods.stealth;
    dealDamage(w, c, t, { coef: k, skill: true, forceCrit: behind });
    c.combo = Math.min(5, c.combo + 1);
    w.fx.burst(t.x, t.y - 20, '#b070ff', 14); audio.play(behind ? 'crit' : 'swing');
  } },
  'Poison Edge': { g: 'strike', range: 2, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 2.3 * M); if (!t) return false;
    dealDamage(w, c, t, { coef: k, skill: true });
    applyStatus(w, t, STATUS.poison(Math.round(c.atk * 0.08), 8 * (1 + (c.passivePct.poisonDur || 0))), c);
    c.combo = Math.min(5, c.combo + 1);
    w.fx.burst(t.x, t.y - 20, '#60d040', 14); audio.play('swing');
  } },
  'Shadowstep': { g: 'dash', range: 8, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 8.5 * M); if (!t) return false;
    const a = angleTo(c.x, c.y, t.x, t.y);
    w.fx.burst(c.x, c.y - 20, '#503070', 14);
    const tx = t.x + Math.cos(a) * (t.radius + 20), ty = t.y + Math.sin(a) * (t.radius + 20);
    if (!w.map.blockedCircle(tx, ty, c.radius)) { c.x = tx; c.y = ty; }
    dealDamage(w, c, t, { coef: k, skill: true });
    if (c.passivePct.silentStep) c.addBuff({ id: 'silentstep', name: 'Silent Step', dur: 1.5, mods: { dodge: 40 }, color: '#b070ff' });
    w.fx.burst(c.x, c.y - 20, '#b070ff', 14); audio.play('stealth');
  } },
  'Fan of Knives': { g: 'cone', range: 4, aoe: true, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim);
    for (let i = -3; i <= 3; i++) w.projectile({ owner: c, x: c.x, y: c.y - 16, ang: a + i * 0.2, speed: 16 * M, range: 4.5 * M, kind: 'knife', color: '#d8c8ff', pierce: 3, onHit: (t) => { dealDamage(w, c, t, { coef: k * 0.5, skill: true }); applyStatus(w, t, STATUS.bleed(Math.round(c.atk * 0.06), 5), c); } });
    audio.play('shoot');
  } },
  'Smoke Veil': { g: 'stealth', support: true, run(w, c) {
    w.zone({ owner: c, x: c.x, y: c.y, r: 5 * M, dur: 8, every: 0.5, kind: 'smoke', color: '#6a5a8a', ally: (a) => a.addBuff({ id: 'smoke', name: 'Smoke Veil', dur: 0.8, mods: { dodge: 20 }, color: '#8a7aaa' }) });
    audio.play('stealth');
  } },
  'Crimson Mark': { g: 'mark', range: 10, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 10 * M); if (!t) return false;
    dealDamage(w, c, t, { coef: k, skill: true });
    t.addBuff({ id: 'crimson', name: 'Crimson Mark', dur: 10, debuff: true, mods: { dmgTaken: 0.08 }, marked: true, color: '#ff3060' });
    audio.play('magic');
  } },
  'Eviscerate': { g: 'strike', range: 2, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 2.3 * M); if (!t) return false;
    const mult = 1 + c.combo * 0.2; c.combo = 0;
    dealDamage(w, c, t, { coef: k * mult, skill: true, crit: 15 });
    w.fx.slash(c.x, c.y - 16, angleTo(c.x, c.y, t.x, t.y), 2.2 * M, 140, '#ff3060'); audio.play('crit');
  } },
  'Night Parade': { g: 'chain', range: 5, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 6 * M); if (!t) return false;
    w.chain(c, t, 6, 5 * M, (x) => { dealDamage(w, c, x, { coef: k / 6 * 1.5, skill: true }); w.fx.burst(x.x, x.y - 20, '#7050a0', 8); }, '#7050a0', true);
    audio.play('stealth');
  } },
  'Death Lotus': { g: 'aoe', range: 5, aoe: true, run(w, c, s, aim, k) {
    c.addBuff({ id: 'lotus', name: 'Death Lotus', dur: 1.2, mods: { dodge: 100 }, iframe: true, color: '#b070ff' });
    for (let i = 0; i < 4; i++) w.delayed(i * 0.25, () => { if (c.dead) return; hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, 5 * M), k / 4); w.fx.ring(c.x, c.y, 5 * M, '#b070ff', 0.2); audio.play('swing'); });
  } },
  'Kingkiller Art': { g: 'ultimate', range: 3, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 3.2 * M); if (!t) return false;
    dealDamage(w, c, t, { coef: k, skill: true, execute: 1.5, crit: 20 });
    w.fx.slash(c.x, c.y - 16, angleTo(c.x, c.y, t.x, t.y), 3 * M, 200, '#ff3060'); w.shake(6); audio.play('crit');
  } },

  // ============================ RANGER
  'Quick Shot': { g: 'bolt', range: 12, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 12 * M);
    const a = t ? angleTo(c.x, c.y - 16, t.x, t.y - 16) : aimAngle(c, aim);
    w.projectile({ owner: c, x: c.x, y: c.y - 16, ang: a, speed: 20 * M, range: 12.5 * M, kind: 'arrow', color: '#e8ffe0', onHit: (x) => dealDamage(w, c, x, { coef: k, skill: true }) });
    audio.play('shoot');
  } },
  'Rolling Escape': { g: 'dash', self: true, run(w, c, s, aim) {
    const a = c.moveAngle ?? aimAngle(c, aim);
    c.addBuff({ id: 'roll', name: 'Rolling Escape', dur: 0.3, iframe: true, color: '#6aff8a' });
    w.dash(c, a, 4 * M, 0.25); audio.play('swing');
  } },
  'Marked Prey': { g: 'mark', range: 14, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 14 * M); if (!t) return false;
    dealDamage(w, c, t, { coef: k, skill: true });
    t.addBuff({ id: 'marked', name: 'Marked Prey', dur: 12, debuff: true, mods: { critTaken: 6 }, marked: true, color: '#6aff8a' });
    audio.play('shoot');
  } },
  'Piercing Arrow': { g: 'bolt', range: 14, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim);
    w.projectile({ owner: c, x: c.x, y: c.y - 16, ang: a, speed: 24 * M, range: 14 * M, kind: 'arrow', color: '#9fffb0', width: 1.5, pierce: 5, radius: 16, onHit: (x) => dealDamage(w, c, x, { coef: k, skill: true }) });
    audio.play('shoot');
  } },
  'Volley': { g: 'ground', range: 12, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 12 * M);
    w.zone({ owner: c, x: p.x, y: p.y, r: 5 * M, dur: 3, every: 0.5, kind: 'arrows', color: '#9fffb0', onEnemy: (t) => dealDamage(w, c, t, { coef: k / 6, skill: true }) });
    audio.play('shoot');
  } },
  'Snare Trap': { g: 'ground', range: 10, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 10 * M);
    w.trap({ owner: c, x: p.x, y: p.y, r: 1.8 * M, dur: 20 * (1 + (c.passivePct.trapDur || 0)), color: '#c8a060', onTrigger: (list) => { for (const t of w.inCircle(list, p.x, p.y, 3 * M)) { dealDamage(w, c, t, { coef: k, skill: true }); applyStatus(w, t, STATUS.root(2.5 * (1 + (c.passivePct.trapDur || 0))), c); } w.fx.ring(p.x, p.y, 3 * M, '#c8a060', 0.4); } });
    audio.play('ui');
  } },
  'Falcon Scout': { g: 'mark', range: 12, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 12 * M);
    c.addBuff({ id: 'falcon', name: 'Falcon Scout', dur: 10, mods: { cdr: c.passivePct.skyeye ? 0.08 : 0.03 }, color: '#6aff8a' });
    w.zone({ owner: c, x: p.x, y: p.y, r: 10 * M * 0.6, dur: 6, every: 1, kind: 'falcon', color: '#e8ffe0', onEnemy: (t) => { t.buffs = t.buffs.filter((b) => !b.stealth); dealDamage(w, c, t, { coef: k / 6, skill: true }); } });
    audio.play('shoot');
  } },
  'Storm Arrows': { g: 'cone', range: 12, aoe: true, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim);
    for (let i = 0; i < 8; i++) w.delayed(i * 0.06, () => w.projectile({ owner: c, x: c.x, y: c.y - 16, ang: a + (Math.random() - 0.5) * 0.5, speed: 22 * M, range: 12 * M, kind: 'arrow', color: '#e8ffe0', onHit: (x) => dealDamage(w, c, x, { coef: k / 8 * 1.6, skill: true }) }));
    audio.play('shoot');
  } },
  'Ricochet Bolt': { g: 'chain', range: 12, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 12 * M); if (!t) return false;
    w.chain(c, t, 4, 6 * M, (x, i) => dealDamage(w, c, x, { coef: k * Math.pow(0.85, i), skill: true }), '#9fffb0');
    audio.play('shoot');
  } },
  'Emerald Canopy': { g: 'buff', support: true, run(w, c) {
    for (const a of alliesNear(w, c, 6 * M)) a.addBuff({ id: 'canopy', name: 'Emerald Canopy', dur: 12, mods: { dodge: 10, ms: 0.12 }, color: '#6aff8a' });
    w.fx.ring(c.x, c.y, 6 * M, '#6aff8a', 0.6); audio.play('buff');
  } },
  'Meteor Volley': { g: 'ground', range: 12, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 12 * M), r = 7 * M * (1 + (c.passivePct.aoe || 0));
    w.fx.ring(p.x, p.y, r, '#9fffb0', 0.8, true);
    w.delayed(0.8, () => { hitList(w, c, w.inCircle(w.enemiesOf(c), p.x, p.y, r), k, {}, (t) => w.knockback(t, p.x, p.y, 30)); w.fx.burst(p.x, p.y, '#c8ffd0', 40); w.shake(6); audio.play('slam'); });
    audio.play('shoot');
  } },
  'Kings Hunt': { g: 'ultimate', range: 14, run(w, c, s, aim, k) {
    const marked = w.enemiesOf(c).find((e) => e.buffs.some((b) => b.marked) && dist(c.x, c.y, e.x, e.y) < 14 * M);
    const t = marked || resolveTarget(w, c, aim, 14 * M); if (!t) return false;
    for (let i = 0; i < 12; i++) w.delayed(i * 0.1, () => { if (!t.dead) w.projectile({ owner: c, x: c.x, y: c.y - 16, ang: angleTo(c.x, c.y, t.x, t.y) + (Math.random() - 0.5) * 0.15, speed: 26 * M, range: 15 * M, kind: 'arrow', color: '#ffe08a', homing: t, onHit: (x) => dealDamage(w, c, x, { coef: k / 12 * 1.5, skill: true }) }); });
    audio.play('shoot');
  } },

  // ============================ MAGE
  'Arc Bolt': { g: 'bolt', range: 13, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 13 * M);
    const a = t ? angleTo(c.x, c.y - 16, t.x, t.y - 16) : aimAngle(c, aim);
    w.projectile({ owner: c, x: c.x, y: c.y - 30, ang: a, speed: 16 * M, range: 13 * M, kind: 'orb', color: '#9fd8ff', homing: t, onHit: (x) => dealDamage(w, c, x, { coef: k, magic: true, skill: true }) });
    audio.play('magic');
  } },
  'Flame Sigil': { g: 'ground', range: 11, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 11 * M), r = 4 * M * (1 + (c.passivePct.aoe || 0));
    w.zone({ owner: c, x: p.x, y: p.y, r, dur: 6, every: 1, kind: 'fire', color: '#ff8a3a', onEnemy: (t) => { dealDamage(w, c, t, { coef: k / 4, magic: true, skill: true }); applyStatus(w, t, STATUS.burn(Math.round(c.atk * 0.05), 3), c); } });
    audio.play('fire');
  } },
  'Frost Needle': { g: 'bolt', range: 13, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 13 * M);
    const a = t ? angleTo(c.x, c.y - 16, t.x, t.y - 16) : aimAngle(c, aim);
    w.projectile({ owner: c, x: c.x, y: c.y - 30, ang: a, speed: 20 * M, range: 13 * M, kind: 'ice', color: '#dff4ff', homing: t, onHit: (x) => { dealDamage(w, c, x, { coef: k, magic: true, skill: true }); applyStatus(w, x, STATUS.chill(0.35, 3), c); } });
    audio.play('ice');
  } },
  'Mana Shield': { g: 'shield', self: true, run(w, c) { buff(c, 'manashield', 'Mana Shield', 10, { shield: Math.round(c.maxHp * 0.3) }, '#7fc8ff'); w.fx.ring(c.x, c.y, 50, '#7fc8ff', 0.5); audio.play('magic'); } },
  'Chain Lightning': { g: 'chain', range: 11, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 11 * M); if (!t) return false;
    w.chain(c, t, 5, 5 * M, (x, i) => { dealDamage(w, c, x, { coef: k * Math.pow(0.9, i), magic: true, skill: true }); x.addBuff({ id: 'shock', name: 'Şok', dur: 4, debuff: true, mods: { dmgTaken: 0.05 }, color: '#bfe8ff' }); }, '#bfe8ff');
    audio.play('magic');
  } },
  'Arcane Pulse': { g: 'aoe', range: 4, aoe: true, run(w, c, s, aim, k) {
    const r = 4 * M * (1 + (c.passivePct.aoe || 0));
    hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, r), k, {}, (t) => w.knockback(t, c.x, c.y, 0.6 * M * 2.5));
    w.fx.ring(c.x, c.y, r, '#b8a0ff', 0.4); audio.play('magic');
  } },
  'Gravity Well': { g: 'aoe', range: 11, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 11 * M), r = 5 * M * (1 + (c.passivePct.aoe || 0));
    w.zone({ owner: c, x: p.x, y: p.y, r, dur: 4, every: 0.5, kind: 'gravity', color: '#8a60ff', onEnemy: (t) => { dealDamage(w, c, t, { coef: k / 8, magic: true, skill: true, silent: false }); w.pull(t, p.x, p.y, 30); applyStatus(w, t, STATUS.slow(0.3, 1), c); } });
    audio.play('magic');
  } },
  'Meteor Shard': { g: 'ground', range: 12, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 12 * M), r = 6 * M * (1 + (c.passivePct.aoe || 0));
    w.fx.ring(p.x, p.y, r, '#ff8a3a', 0.9, true);
    w.meteor(p.x, p.y, 0.9, '#ff8a3a', () => { hitList(w, c, w.inCircle(w.enemiesOf(c), p.x, p.y, r), k, { magic: true }, (t) => applyStatus(w, t, STATUS.burn(Math.round(c.atk * 0.08), 8), c)); w.shake(7); audio.play('slam'); });
    audio.play('fire');
  } },
  'Mirror Rune': { g: 'buff', self: true, run(w, c) { buff(c, 'mirror', 'Mirror Rune', 12, { echo: true }, '#bfe8ff'); w.fx.ring(c.x, c.y, 60, '#bfe8ff', 0.5); audio.play('magic'); } },
  'Frozen Domain': { g: 'aoe', range: 11, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 11 * M), r = 7 * M * (1 + (c.passivePct.aoe || 0));
    w.zone({ owner: c, x: p.x, y: p.y, r, dur: 6, every: 1, kind: 'frost', color: '#bfe8ff', onEnemy: (t) => { dealDamage(w, c, t, { coef: k / 6, magic: true, skill: true }); applyStatus(w, t, STATUS.chill(0.45, 1.5), c); t.addBuff({ id: 'brittle', name: 'Kırılgan', dur: 2, debuff: true, mods: { dmgTaken: 0.1 }, color: '#dff4ff' }); } });
    audio.play('ice');
  } },
  'Astral Cataclysm': { g: 'ultimate', range: 12, aoe: true, run(w, c, s, aim, k) {
    const p = clampAim(c, aim, 12 * M), r = 7 * M * (1 + (c.passivePct.aoe || 0));
    w.fx.ring(p.x, p.y, r, '#c8a0ff', 1.1, true);
    w.meteor(p.x, p.y, 1.1, '#c8a0ff', () => { hitList(w, c, w.inCircle(w.enemiesOf(c), p.x, p.y, r), k, { magic: true }, (t) => { if (!t.boss && !t.elite) applyStatus(w, t, STATUS.stun(1.2), c); }); w.shake(12); audio.play('slam'); }, 1.6);
    audio.play('magic');
  } },
  'Eclipse Orbit': { g: 'ultimate', self: true, run(w, c) { buff(c, 'orbit', 'Eclipse Orbit', 12, { mods: { dmg: 0.25 } }, '#c8a0ff'); w.fx.ring(c.x, c.y, 90, '#c8a0ff', 0.8); audio.play('magic'); } },

  // ============================ PRIEST
  'Sacred Spark': { g: 'bolt', range: 12, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 12 * M);
    const a = t ? angleTo(c.x, c.y - 16, t.x, t.y - 16) : aimAngle(c, aim);
    w.projectile({ owner: c, x: c.x, y: c.y - 30, ang: a, speed: 15 * M, range: 12 * M, kind: 'holy', color: '#fff4b0', homing: t, onHit: (x) => dealDamage(w, c, x, { coef: k, magic: true, skill: true }) });
    audio.play('holy');
  } },
  'Minor Mend': { g: 'heal', support: true, heal: true, run(w, c, s, aim, k) {
    const t = lowestAlly(w, c, 12 * M);
    healActor(w, c, t, c.atk * k * 1.9);
    w.fx.burst(t.x, t.y - 20, '#9fffb0', 14); w.fx.ring(t.x, t.y, 30, '#9fffb0', 0.4); audio.play('heal');
  } },
  'Blessing of Grace': { g: 'buff', support: true, run(w, c) {
    for (const a of alliesNear(w, c, 6 * M)) a.addBuff({ id: 'grace', name: 'Blessing of Grace', dur: 20, mods: { aspd: 0.08, ms: 0.08 }, color: '#fff0a0' });
    w.fx.ring(c.x, c.y, 6 * M, '#fff0a0', 0.6); audio.play('holy');
  } },
  'Halo Pulse': { g: 'aoe', range: 4, aoe: true, run(w, c, s, aim, k) {
    hitList(w, c, w.inCircle(w.enemiesOf(c), c.x, c.y, 4 * M), k, {}, (t) => applyStatus(w, t, STATUS.blind(1), c));
    w.fx.ring(c.x, c.y, 4 * M, '#fff4b0', 0.4); audio.play('holy');
  } },
  'Sanctuary Field': { g: 'heal', support: true, heal: true, run(w, c) {
    const per = Math.round(c.atk * 0.32);
    w.zone({ owner: c, x: c.x, y: c.y, r: 6 * M, dur: 8, every: 1, kind: 'holyfield', color: '#fff0a0', ally: (a) => { healActor(w, c, a, per); if (c.passivePct.beacon) a.addBuff({ id: 'beacon', name: 'Beacon of Dawn', dur: 1.1, mods: { dmgTaken: -0.05 } }); } });
    audio.play('heal');
  } },
  'Purify': { g: 'heal', support: true, run(w, c) {
    const t = alliesNear(w, c, 12 * M).find((a) => a.buffs.some((b) => b.debuff)) || lowestAlly(w, c, 12 * M);
    t.cleanse(2); healActor(w, c, t, c.atk * 0.6);
    w.fx.burst(t.x, t.y - 20, '#ffffff', 16); audio.play('holy');
  } },
  'Guardian Hymn': { g: 'shield', support: true, run(w, c) {
    for (const a of alliesNear(w, c, 7 * M)) a.addBuff({ id: 'hymn', name: 'Guardian Hymn', dur: 15 * (1 + (c.passivePct.aura || 0)), mods: { def: 0.1 }, color: '#fff0a0' });
    w.fx.ring(c.x, c.y, 7 * M, '#fff0a0', 0.6); audio.play('holy');
  } },
  'Luminous Chains': { g: 'chain', range: 11, run(w, c, s, aim, k) {
    const t = resolveTarget(w, c, aim, 11 * M); if (!t) return false;
    w.chain(c, t, 4, 5 * M, (x) => { dealDamage(w, c, x, { coef: k, magic: true, skill: true }); const al = lowestAlly(w, c, 10 * M); healActor(w, c, al, c.atk * 0.3, { silent: true }); }, '#fff4b0');
    audio.play('holy');
  } },
  'Resurrection': { g: 'heal', support: true, run(w, c) {
    const dead = w.heroes.find((h) => h.dead && h !== c && dist(c.x, c.y, h.x, h.y) < 10 * M * 1.5);
    if (dead) { w.revive(dead, 0.35); w.fx.ring(dead.x, dead.y, 50, '#fff4b0', 1); }
    else { const t = lowestAlly(w, c, 10 * M); healActor(w, c, t, c.atk * 2.5); }
    audio.play('heal');
  } },
  'Judgment Ray': { g: 'bolt', range: 12, run(w, c, s, aim, k) {
    const a = aimAngle(c, aim);
    const list = w.inLine(w.enemiesOf(c), c.x, c.y, a, 12 * M, 1.5 * M);
    hitList(w, c, list, k, { magic: true }, (t) => t.addBuff({ id: 'holyvuln', name: 'Kutsal Zafiyet', dur: 6, debuff: true, mods: { dmgTaken: 0.1 }, color: '#fff4b0' }));
    w.fx.beam(c.x, c.y - 20, c.x + Math.cos(a) * 12 * M, c.y - 20 + Math.sin(a) * 12 * M, '#fff4b0', 0.35, 10); audio.play('holy');
  } },
  'Choir of Dawn': { g: 'heal', support: true, heal: true, run(w, c) {
    for (const a of alliesNear(w, c, 8 * M)) { healActor(w, c, a, c.atk * 3); for (const b of a.buffs) if (!b.debuff && b.dur < 100) b.t = 0; }
    w.fx.ring(c.x, c.y, 8 * M, '#fff4b0', 0.8); w.fx.burst(c.x, c.y - 30, '#fff4b0', 30); audio.play('heal');
  } },
  'Apotheosis': { g: 'ultimate', self: true, run(w, c) { buff(c, 'apotheosis', 'Apotheosis', 15, { mods: { heal: 0.3, dmg: 0.15 } }, '#fff4b0'); w.fx.ring(c.x, c.y, 90, '#fff4b0', 0.8); audio.play('holy'); } },
};

export function behaviourOf(skill) { return B[skill.name]; }
export function glyphOf(skill) { return (B[skill.name] || {}).g || 'strike'; }
export function skillRangePx(skill) { const b = B[skill.name]; return ((b && b.range) || 2) * M; }

/** Basic attack per class (GDD weapons). */
export function basicAttack(w, c, aim) {
  const kit = c.kit.attack;
  const a = aimAngle(c, aim);
  if (kit.kind === 'melee') {
    const r = kit.range * M;
    const list = w.inCone(w.enemiesOf(c), c.x, c.y, a, kit.arc, r + 10);
    const t = aim.target && list.includes(aim.target) ? aim.target : null;
    const hits = c.cls === 'Assassin' ? (t ? [t] : list.slice(0, 1)) : list.slice(0, 3);
    for (const h of hits) dealDamage(w, c, h, { coef: kit.coef, magic: false });
    if (c.cls === 'Assassin' && hits.length) c.combo = Math.min(5, c.combo + 1);
    w.fx.slash(c.x, c.y - 16, a, r, kit.arc, c.cls === 'Berserker' ? '#ffb0a0' : '#ffffff', 0.16);
    audio.play(c.cls === 'Berserker' ? 'heavy' : 'swing');
  } else {
    const t = resolveTarget(w, c, aim, kit.range * M);
    const ang = t && aim.lock ? angleTo(c.x, c.y - 16, t.x, t.y - 16) : a;
    w.projectile({ owner: c, x: c.x, y: c.y - (kit.proj === 'arrow' ? 16 : 30), ang, speed: kit.speed * M, range: kit.range * M, kind: kit.proj === 'arrow' ? 'arrow' : kit.proj === 'holy' ? 'holy' : 'orb', color: kit.proj === 'arrow' ? '#f0f0e0' : kit.proj === 'holy' ? '#fff4b0' : '#9fd8ff', small: true, onHit: (x) => dealDamage(w, c, x, { coef: kit.coef, magic: c.kit.magic }) });
    audio.play(kit.proj === 'arrow' ? 'shoot' : 'magic');
  }
}

// ---------------------------------------------------------------- passives (GDD passives.csv → modifiers)
const PASSIVE_RULES = [
  [/max hp \+(\d+)%/i, (v, p) => (p.hp = (p.hp || 0) + v / 100)],
  [/armor \+(\d+)%/i, (v, p) => (p.def = (p.def || 0) + v / 100)],
  [/block \+(\d+)%/i, (v, p) => (p.def = (p.def || 0) + v / 100)],
  [/shield block value \+(\d+)%/i, (v, p) => (p.def = (p.def || 0) + v / 200)],
  [/allies def \+(\d+)%/i, (v, p) => (p.def = (p.def || 0) + v / 100)],
  [/crit damage \+(\d+)%/i, (v, p) => (p.critDmg = (p.critDmg || 0) + v / 100)],
  [/move speed \+(\d+)%/i, (v, p) => (p.ms = (p.ms || 0) + v / 100)],
  [/dodge \+(\d+)%/i, (v, p) => (p.dodge = (p.dodge || 0) + v)],
  [/max mana \+(\d+)%/i, (v, p) => (p.resRegen = (p.resRegen || 0) + v / 100)],
  [/element damage \+(\d+)%/i, (v, p) => (p.atk = (p.atk || 0) + v / 100)],
  [/heal power \+(\d+)%/i, (v, p) => (p.heal = (p.heal || 0) + v / 100)],
  [/regen \+(\d+)%/i, (v, p) => (p.resRegen = (p.resRegen || 0) + v / 100)],
  [/generates \+(\d+)% rage/i, (v, p) => (p.rageGain = (p.rageGain || 0) + v / 100)],
  [/rage gain \+(\d+)%/i, (v, p) => (p.rageGain = (p.rageGain || 0) + v / 100)],
  [/boss single target damage \+(\d+)%/i, (v, p) => (p.bossDmg = (p.bossDmg || 0) + v / 100)],
  [/boss crit \+(\d+)%/i, (v, p) => (p.bossCrit = (p.bossCrit || 0) + v)],
  [/damage \+(\d+)% beyond/i, (v, p) => (p.farDmg = (p.farDmg || 0) + v / 100)],
  [/aoe radius \+(\d+)%/i, (v, p) => (p.aoe = (p.aoe || 0) + v / 100)],
  [/cast time -(\d+)%/i, (v, p) => (p.cdr = (p.cdr || 0) + v / 200)],
  [/cooldown -(\d+)%/i, (v, p) => (p.cdr = (p.cdr || 0) + v / 100)],
  [/cd by 0\.5s/i, (v, p) => (p.cdr = (p.cdr || 0) + 0.04)],
  [/below 35% hp damage \+(\d+)%/i, (v, p) => (p.lowHpDmg = (p.lowHpDmg || 0) + v / 100)],
  [/missing hp grants up to \+(\d+)% def/i, (v, p) => (p.missingDef = (p.missingDef || 0) + v / 100)],
  [/bleed damage \+(\d+)%/i, (v, p) => (p.bleed = (p.bleed || 0) + v / 100)],
  [/poison duration \+(\d+)%/i, (v, p) => (p.poisonDur = (p.poisonDur || 0) + v / 100)],
  [/trap duration \+(\d+)%/i, (v, p) => (p.trapDur = (p.trapDur || 0) + v / 100)],
  [/below 35% hp heal \+(\d+)%/i, (v, p) => (p.healLow = (p.healLow || 0) + v / 100)],
  [/aura duration \+(\d+)%/i, (v, p) => (p.aura = (p.aura || 0) + v / 100)],
  [/buff potency \+(\d+)%/i, (v, p) => (p.heal = (p.heal || 0) + v / 200)],
  [/heal (\d+)% dealt/i, (v, p) => (p.lifesteal = (p.lifesteal || 0) + v / 100)],
  [/stealth exit damage \+(\d+)%/i, (v, p) => (p.atk = (p.atk || 0) + v / 300)],
  [/marked target crit rate \+(\d+)%/i, (v, p) => (p.crit = (p.crit || 0) + v / 2)],
  [/ignore (\d+)% armor/i, (v, p) => (p.atk = (p.atk || 0) + v / 200)],
  [/damage taken while cc -(\d+)%/i, (v, p) => (p.def = (p.def || 0) + v / 200)],
  [/stun resist/i, (v, p) => (p.def = (p.def || 0) + 0.02)],
  [/knockback resistance/i, (v, p) => (p.def = (p.def || 0) + 0.02)],
  [/barrier power \+(\d+)%/i, (v, p) => (p.def = (p.def || 0) + v / 300)],
  [/lethal hit leaves 1 hp/i, (v, p) => (p.phantom = 1)],
  [/shadowstep grants dodge/i, (v, p) => (p.silentStep = 1)],
  [/falcon active grants cdr/i, (v, p) => (p.skyeye = 1)],
  [/sanctuary grants/i, (v, p) => (p.beacon = 1)],
  [/moving for 3s restores mana/i, (v, p) => (p.resRegen = (p.resRegen || 0) + 0.15)],
  [/move while attacking penalty/i, (v, p) => (p.ms = (p.ms || 0) + 0.03)],
  [/roll gains 1 charge/i, (v, p) => (p.cdr = (p.cdr || 0) + 0.03)],
  [/different element casts/i, (v, p) => (p.atk = (p.atk || 0) + 0.05)],
  [/high-cost spells crit \+(\d+)%/i, (v, p) => (p.crit = (p.crit || 0) + v / 2)],
  [/support cast grants ms/i, (v, p) => (p.ms = (p.ms || 0) + 0.03)],
  [/first revive/i, (v, p) => (p.heal = (p.heal || 0) + 0.03)],
  [/stance swap has no gcd/i, (v, p) => (p.aspd = (p.aspd || 0) + 0.05)],
];
export function passiveMods(cls, level, def) {
  const p = {};
  for (const pas of def.passives) {
    if (level < pas.unlock) continue;
    for (const [re, fn] of PASSIVE_RULES) {
      const m = pas.effect.match(re);
      if (m) fn(m[1] ? parseFloat(m[1]) : 0, p);
    }
  }
  return p;
}
