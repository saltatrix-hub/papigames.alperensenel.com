// Monster / boss / companion AI. Boss mechanics are derived from GDD ability names (bosses.csv).
import { METER } from './stats.js';
import { dealDamage, applyStatus, STATUS } from './combat.js';
import { angleTo, dist, clamp } from '../core/util.js';
import { audio } from '../core/audio.js';
import { behaviourOf, skillRangePx } from './skills.js';

const M = METER;

// ---------------------------------------------------------------- mechanic classification
export function mechanicOf(name) {
  const n = name.toLowerCase();
  if (/summon|call|add|spawn|brood|minion|egg|thug|legion|choir|servant|hatch|swarm/.test(n)) return 'summon';
  if (/enrage|frenzy|fury|war cry|rage|berserk/.test(n)) return 'enrage';
  if (/shift|phase|second dawn|rebirth|reform|split|mirror|twin/.test(n)) return 'phase';
  if (/pull|gravity|vortex|grip|prison|root|web|vine|chain|bind|tether/.test(n)) return 'pull';
  if (/rain|fall|storm|meteor|shower|barrage|starfall|hail|avalanche|volley|seed/.test(n)) return 'rain';
  if (/breath|cone|cleave|sweep|spray|claw|swipe|bite|fan|wing|scythe|tail/.test(n)) return 'cone';
  if (/beam|ray|spear|lance|laser|judg|sand|line|wave|javelin/.test(n)) return 'beam';
  if (/nova|ring|eclipse|halo|aura|pulse|shock/.test(n)) return 'nova';
  if (/curse|poison|plague|spore|toxic|decay|drain|wail|lament|miasma|venom|acid|brand/.test(n)) return 'curse';
  if (/charge|rush|dash|leap|pounce|burrow|dive|trample/.test(n)) return 'charge';
  return 'slam';
}
export const MECH_TR = { slam: 'Ezici Darbe', summon: 'Çağırma', enrage: 'Öfke', phase: 'Evre Değişimi', pull: 'Çekim', rain: 'Yağmur', cone: 'Koni Saldırısı', beam: 'Işın', nova: 'Nova', curse: 'Lanet', charge: 'Hücum' };

function heroesNear(w, m, r) { return w.enemiesOf(m).filter((h) => dist(m.x, m.y, h.x, h.y) <= r); }

/** Boss / elite ability execution with telegraphs. */
export function castMechanic(w, m, ab, tgt) {
  const kind = mechanicOf(ab);
  const lvlK = m.boss ? 1 : 0.6;
  const col = m.enraged ? '#ff3030' : '#ff5a3a';
  const hit = (list, coef, extra) => { for (const h of list) { dealDamage(w, m, h, { coef, noDodge: true }); if (extra) extra(h); } };
  w.bossBanner(m, ab);
  switch (kind) {
    case 'slam': {
      const r = (m.boss ? 4.6 : 3) * M;
      w.telegraph({ shape: 'circle', x: m.x, y: m.y, r, t: 1.1, owner: m, color: col, onFire: (tg) => { hit(w.inCircle(w.enemiesOf(m), tg.x, tg.y, r), 2.3 * lvlK + 0.6); w.shake(7); w.fx.burst(tg.x, tg.y, '#d8b080', 24); audio.play('slam'); } });
      m.windup = 1.1; break;
    }
    case 'cone': {
      const a = tgt ? angleTo(m.x, m.y, tgt.x, tgt.y) : 0, r = (m.boss ? 7 : 4.5) * M;
      w.telegraph({ shape: 'cone', x: m.x, y: m.y, ang: a, arc: 100, r, t: 1.0, owner: m, color: col, onFire: (tg) => { hit(w.inCone(w.enemiesOf(m), tg.x, tg.y, tg.ang, tg.arc, tg.r), 2.2 * lvlK + 0.5); w.fx.slash(tg.x, tg.y - 20, tg.ang, tg.r, tg.arc, '#ff9a60', 0.3); audio.play('heavy'); } });
      m.windup = 1.0; m.faceTo = a; break;
    }
    case 'beam': {
      const a = tgt ? angleTo(m.x, m.y, tgt.x, tgt.y) : 0, len = 15 * M, wd = 1.7 * M;
      w.telegraph({ shape: 'line', x: m.x, y: m.y, ang: a, len, w: wd, t: 1.2, owner: m, color: col, onFire: (tg) => { hit(w.inLine(w.enemiesOf(m), tg.x, tg.y, tg.ang, tg.len, tg.w), 2.6 * lvlK + 0.4); w.fx.beam(tg.x, tg.y - 30, tg.x + Math.cos(tg.ang) * len, tg.y - 30 + Math.sin(tg.ang) * len, m.aura || '#ff80ff', 0.4, 18); audio.play('magic'); } });
      m.windup = 1.2; break;
    }
    case 'rain': {
      const targets = heroesNear(w, m, 16 * M);
      const n = m.boss ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const h = targets[i % Math.max(1, targets.length)];
        const bx = h ? h.x + (Math.random() - 0.5) * 3 * M : m.x + (Math.random() - 0.5) * 10 * M;
        const by = h ? h.y + (Math.random() - 0.5) * 3 * M : m.y + (Math.random() - 0.5) * 10 * M;
        const r = 2.4 * M;
        w.telegraph({ shape: 'circle', x: bx, y: by, r, t: 1.2 + i * 0.12, owner: m, color: col, fall: true, onFire: (tg) => { hit(w.inCircle(w.enemiesOf(m), tg.x, tg.y, r), 1.5 * lvlK + 0.3); w.fx.burst(tg.x, tg.y, m.aura || '#ffb060', 14); audio.play('fire'); } });
      }
      m.windup = 0.6; break;
    }
    case 'nova': {
      const inner = 3.2 * M, outer = 9 * M;
      w.telegraph({ shape: 'ring', x: m.x, y: m.y, r: outer, r0: inner, t: 1.5, owner: m, color: col, onFire: (tg) => { hit(w.inCircle(w.enemiesOf(m), tg.x, tg.y, outer).filter((h) => dist(h.x, h.y, tg.x, tg.y) > inner), 2.2 * lvlK + 0.5); w.fx.ring(tg.x, tg.y, outer, m.aura || '#c080ff', 0.6); audio.play('magic'); } });
      m.windup = 1.5; break;
    }
    case 'pull': {
      for (const h of heroesNear(w, m, 14 * M)) { w.pull(h, m.x, m.y, dist(m.x, m.y, h.x, h.y) - 2 * M); applyStatus(w, h, STATUS.root(1.2), m); }
      w.fx.ring(m.x, m.y, 14 * M, '#a060ff', 0.5); audio.play('warn');
      const r = 4 * M;
      w.telegraph({ shape: 'circle', x: m.x, y: m.y, r, t: 1.7, owner: m, color: col, onFire: (tg) => { hit(w.inCircle(w.enemiesOf(m), tg.x, tg.y, r), 2 * lvlK + 0.4); w.shake(5); audio.play('slam'); } });
      m.windup = 1.7; break;
    }
    case 'summon': {
      const n = m.boss ? (m.tier === 'Raid' ? 3 : 2) + (m.phase ? 1 : 0) : 1;
      for (let i = 0; i < n; i++) w.spawnAdd(m, i, n);
      w.fx.ring(m.x, m.y, 5 * M, '#80ff80', 0.6); audio.play('warn');
      m.windup = 0.8; break;
    }
    case 'enrage': {
      m.addBuff({ id: 'bossenrage', name: 'Öfke', dur: 12, mods: { dmg: 0.3, aspd: 0.3 }, color: '#ff3030' });
      w.fx.ring(m.x, m.y, 4 * M, '#ff3030', 0.6); audio.play('boss');
      m.windup = 0.6; break;
    }
    case 'phase': {
      m.addBuff({ id: 'phaseshield', name: 'Evre Kalkanı', dur: 3, shield: Math.round(m.maxHp * 0.06), color: '#fff0a0' });
      for (let i = 0; i < 2; i++) w.spawnAdd(m, i, 2);
      const r = 6 * M;
      w.telegraph({ shape: 'circle', x: m.x, y: m.y, r, t: 2, owner: m, color: col, onFire: (tg) => { hit(w.inCircle(w.enemiesOf(m), tg.x, tg.y, r), 2.4 * lvlK + 0.6); w.shake(8); audio.play('slam'); } });
      m.windup = 2; break;
    }
    case 'curse': {
      for (const h of heroesNear(w, m, 12 * M)) applyStatus(w, h, STATUS.curse(Math.round(m.atk * 0.12), 6), m);
      w.zone({ owner: m, x: tgt ? tgt.x : m.x, y: tgt ? tgt.y : m.y, r: 3 * M, dur: 6, every: 0.6, kind: 'poison', color: '#8a40c0', hostile: true, onEnemy: (h) => dealDamage(w, m, h, { coef: 0.22, noDodge: true, dot: true }) });
      audio.play('warn'); m.windup = 0.8; break;
    }
    case 'charge': {
      if (!tgt) break;
      const a = angleTo(m.x, m.y, tgt.x, tgt.y), len = Math.min(12 * M, dist(m.x, m.y, tgt.x, tgt.y) + 2 * M), wd = m.radius * 2 + 20;
      w.telegraph({ shape: 'line', x: m.x, y: m.y, ang: a, len, w: wd, t: 0.9, owner: m, color: col, onFire: (tg) => { w.dash(m, tg.ang, tg.len, 0.3, null, (x) => { dealDamage(w, m, x, { coef: 2 * lvlK + 0.5, noDodge: true }); w.knockback(x, m.x, m.y, 60); }); audio.play('heavy'); } });
      m.windup = 1.2; break;
    }
  }
}

// ---------------------------------------------------------------- monsters
export function monsterAI(w, m, dt) {
  if (m.dead) return;
  if (m.windup > 0) { m.windup -= dt; m.moving = false; return; }
  if (m.mods.stun) { m.moving = false; return; }
  m.attackCd -= dt * (1 + (m.mods.aspd || 0));
  m.abilityCd -= dt;
  const home = m.home || { x: m.x, y: m.y };
  if (m.state === 'return') {
    const d = dist(m.x, m.y, home.x, home.y);
    m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.25 * dt);
    if (d < 20) { m.state = 'idle'; m.threat.clear(); m.hp = m.maxHp; m.buffs = []; m.enraged = false; m.phase = 0; m.moving = false; return; }
    stepTo(w, m, home.x, home.y, m.speed * 1.4, dt);
    return;
  }
  let tgt = m.topThreat(w);
  if (!tgt && !m.passive) {
    // aggro scan
    let best = null, bd = m.aggroR;
    for (const h of w.enemiesOf(m)) {
      if (h.mods.stealth) continue;
      const d = dist(m.x, m.y, h.x, h.y);
      if (d < bd && w.map.lineClear(m.x, m.y, h.x, h.y)) { bd = d; best = h; }
    }
    if (best) {
      m.addThreat(best, 1); tgt = best; m.state = 'chase';
      if (!m.boss) for (const o of w.monsters) if (o !== m && !o.dead && !o.passive && o.state === 'idle' && dist(o.x, o.y, m.x, m.y) < 3.5 * M) { o.addThreat(best, 1); o.state = 'chase'; }
      if (m.boss) w.onBossPull(m);
    }
  }
  if (!tgt) {
    if (m.state === 'chase') { m.state = 'return'; return; }
    m.state = 'idle';
    wander(w, m, home, dt);
    return;
  }
  m.state = 'chase';
  m.inCombat = 6;
  if (!m.noLeash && dist(m.x, m.y, home.x, home.y) > m.leash) { m.state = 'return'; m.threat.clear(); return; }

  // boss/elite abilities
  if (m.abilities.length && m.abilityCd <= 0) {
    const ab = m.abilities[m.abIdx = ((m.abIdx ?? -1) + 1) % m.abilities.length];
    castMechanic(w, m, ab, tgt);
    m.abilityCd = m.boss ? (m.enraged ? 4 : 5.5) - (m.phase ? 0.8 : 0) : 7 + Math.random() * 3;
    return;
  }
  if (m.boss && !m.enraged && m.hp < m.maxHp * 0.25) {
    m.enraged = true;
    w.floatText(m.x, m.y - 90, 'ÖFKELENDİ!', '#ff3030', 1.6, true);
    w.announce(`${m.name} öfkelendi!`, '#ff5050');
    audio.play('boss');
  }
  if (m.boss && !m.phase && m.hp < m.maxHp * 0.5) {
    m.phase = 1;
    w.announce(`${m.name} ikinci evreye geçti!`, '#ffb050');
  }

  const d = dist(m.x, m.y, tgt.x, tgt.y);
  const reach = m.attackRange + tgt.radius;
  m.dir = tgt.x < m.x ? -1 : 1;
  if (d > reach * (m.ranged ? 0.9 : 0.95)) {
    if (m.mods.root) { m.moving = false; return; }
    chase(w, m, tgt, dt);
  } else {
    m.moving = false;
    if (m.ranged && d < 2.5 * M && !m.boss) {
      const a = angleTo(tgt.x, tgt.y, m.x, m.y);
      stepTo(w, m, m.x + Math.cos(a) * 60, m.y + Math.sin(a) * 60, m.speed * 0.6, dt);
    }
    if (m.attackCd <= 0) {
      m.attackCd = m.attackInterval * (0.9 + Math.random() * 0.2);
      m.atkAnim = 0;
      if (m.ranged) {
        const a = angleTo(m.x, m.y - 20, tgt.x, tgt.y - 16);
        w.projectile({ owner: m, x: m.x, y: m.y - 20 * m.size, ang: a, speed: 9 * M, range: 10 * M, kind: 'enemy', color: m.aura || '#ff70a0', onHit: (x) => dealDamage(w, m, x, { coef: 1 }) });
      } else {
        w.delayed(0.22, () => {
          if (m.dead || tgt.dead || m.mods.stun) return;
          if (dist(m.x, m.y, tgt.x, tgt.y) <= reach + 18) dealDamage(w, m, tgt, { coef: 1 });
          if (m.boss) for (const o of w.inCone(w.enemiesOf(m), m.x, m.y, angleTo(m.x, m.y, tgt.x, tgt.y), 90, reach)) if (o !== tgt) dealDamage(w, m, o, { coef: 0.6 });
        });
      }
    }
  }
}

function wander(w, m, home, dt) {
  m.wanderT -= dt;
  if (m.wanderT <= 0) {
    m.wanderT = 2.5 + Math.random() * 4;
    if (m.noWander || m.boss) { m.wanderTo = null; } else {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 2.4 * M;
      m.wanderTo = { x: home.x + Math.cos(a) * r, y: home.y + Math.sin(a) * r };
    }
  }
  if (m.wanderTo) {
    if (dist(m.x, m.y, m.wanderTo.x, m.wanderTo.y) < 8) { m.wanderTo = null; m.moving = false; return; }
    stepTo(w, m, m.wanderTo.x, m.wanderTo.y, m.speed * 0.35, dt);
  } else m.moving = false;
}

export function stepTo(w, a, tx, ty, speed, dt) {
  const d = dist(a.x, a.y, tx, ty);
  if (d < 1) { a.moving = false; return true; }
  const s = Math.min(d, speed * dt);
  const ang = angleTo(a.x, a.y, tx, ty);
  const ox = a.x, oy = a.y;
  w.map.move(a, Math.cos(ang) * s, Math.sin(ang) * s);
  a.moving = Math.abs(a.x - ox) + Math.abs(a.y - oy) > 0.05;
  if (Math.abs(Math.cos(ang)) > 0.2) a.dir = Math.cos(ang) < 0 ? -1 : 1;
  return false;
}

function chase(w, a, tgt, dt) {
  const sp = a.speed * (1 - a.mods.slow) * (1 + (a.mods.ms || 0));
  if (w.map.lineClearSolid(a.x, a.y, tgt.x, tgt.y, a.radius)) { a.path = null; stepTo(w, a, tgt.x, tgt.y, sp, dt); return; }
  a.pathT = (a.pathT || 0) - dt;
  if (!a.path || a.pathT <= 0) { a.path = (w.map.path(a.x, a.y, tgt.x, tgt.y, 900) || []).map(([x, y]) => ({ x, y })); a.pathT = 0.6; }
  if (a.path.length) {
    const p = a.path[0];
    if (stepTo(w, a, p.x, p.y, sp, dt) || dist(a.x, a.y, p.x, p.y) < 10) a.path.shift();
  } else stepTo(w, a, tgt.x, tgt.y, sp, dt);
}

// ---------------------------------------------------------------- companions & arena bots
const ROLE = { Knight: 'tank', Berserker: 'tank', Assassin: 'melee', Ranger: 'ranged', Mage: 'ranged', Priest: 'healer' };

function inTelegraph(w, h) {
  for (const t of w.telegraphs) {
    if (t.owner && t.owner.team === h.team) continue;
    if (t.shape === 'circle' && dist(h.x, h.y, t.x, t.y) < t.r + h.radius) return { x: t.x, y: t.y };
    if (t.shape === 'ring') { const d = dist(h.x, h.y, t.x, t.y); if (d > t.r0 && d < t.r) return { x: t.x, y: t.y, inward: true }; }
    if (t.shape === 'cone' && w.inCone([h], t.x, t.y, t.ang, t.arc, t.r).length) return { x: t.x, y: t.y };
    if (t.shape === 'line' && w.inLine([h], t.x, t.y, t.ang, t.len, t.w).length) return { x: t.x, y: t.y, line: t };
  }
  return null;
}

export function heroAI(w, h, dt) {
  if (h.dead || h.mods.stun) { h.moving = false; return; }
  const role = ROLE[h.cls];
  const leader = h.leader && !h.leader.dead ? h.leader : null;
  h.aiThink = (h.aiThink || 0) - dt;
  const sp = h.moveSpeed;

  // 1) dodge telegraphs
  const danger = inTelegraph(w, h);
  if (danger && !h.mods.root) {
    let a;
    if (danger.inward) a = angleTo(h.x, h.y, danger.x, danger.y);
    else if (danger.line) a = danger.line.ang + Math.PI / 2;
    else a = angleTo(danger.x, danger.y, h.x, h.y);
    move(w, h, Math.cos(a), Math.sin(a), sp, dt);
    return;
  }

  // 2) pick target
  const foes = w.enemiesOf(h).filter((f) => !f.mods.stealth);
  const anchor = leader || h;
  let tgt = h.aiTarget && !h.aiTarget.dead && foes.includes(h.aiTarget) ? h.aiTarget : null;
  if (!tgt || h.aiThink <= 0) {
    h.aiThink = 0.5;
    tgt = null;
    if (leader && leader.target && !leader.target.dead && foes.includes(leader.target) && dist(anchor.x, anchor.y, leader.target.x, leader.target.y) < 14 * M) tgt = leader.target;
    let bd = w.pvp ? 40 * M : 11 * M;
    if (!tgt) for (const f of foes) {
      const engaged = w.pvp || f.kind === 'hero' || f.state === 'chase' || (leader && leader.inCombat > 0 && dist(anchor.x, anchor.y, f.x, f.y) < 7 * M);
      if (!engaged) continue;
      const d = dist(anchor.x, anchor.y, f.x, f.y);
      if (d < bd) { bd = d; tgt = f; }
    }
    // tanks peel monsters that hit squishies
    if (role === 'tank' && !w.pvp) for (const f of foes) if (f.kind === 'monster' && f.state === 'chase') { const t = f.topThreat(w); if (t && t !== h && ROLE[t.cls] !== 'tank' && dist(h.x, h.y, f.x, f.y) < 10 * M) { tgt = f; break; } }
    h.aiTarget = tgt;
  }

  // 3) healer logic
  if (role === 'healer') {
    const allies = w.alliesOf(h).filter((a) => !a.dead && dist(h.x, h.y, a.x, a.y) < 12 * M);
    const hurt = allies.filter((a) => a.hp / a.maxHp < 0.72).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const deadAlly = w.heroes.find((x) => x.dead && x.team === h.team && dist(h.x, h.y, x.x, x.y) < 12 * M);
    if (deadAlly && tryCast(w, h, ['Resurrection'], deadAlly)) return;
    if (hurt) {
      const many = allies.filter((a) => a.hp / a.maxHp < 0.7).length >= 2;
      if (tryCast(w, h, many ? ['Choir of Dawn', 'Sanctuary Field', 'Minor Mend'] : ['Minor Mend', 'Purify', 'Sanctuary Field'], hurt)) return;
    }
    if (allies.some((a) => a.buffs.some((b) => b.debuff && b.cc))) if (tryCast(w, h, ['Purify'], h)) return;
  }

  if (!tgt) {
    // follow leader / idle
    h.inCombatAI = false;
    if (leader) {
      const slot = h.followSlot || 0;
      const ang = (leader.faceAngle ?? Math.PI / 2) + Math.PI + (slot - 1) * 0.8;
      const fx = leader.x + Math.cos(ang) * 2.2 * M, fy = leader.y + Math.sin(ang) * 2.2 * M;
      const d = dist(h.x, h.y, fx, fy);
      if (d > 5 * M * 4) { h.x = leader.x; h.y = leader.y + 20; }
      if (d > 26) moveTo(w, h, fx, fy, sp * (d > 5 * M ? 1.25 : 1), dt);
      else h.moving = false;
      h.mount = leader.mount ? { ...leader.mount } : null;
    } else h.moving = false;
    return;
  }

  // 4) combat positioning
  h.faceAngle = angleTo(h.x, h.y, tgt.x, tgt.y);
  const d = dist(h.x, h.y, tgt.x, tgt.y);
  const ranged = h.kit.attack.kind === 'ranged';
  const want = ranged ? (role === 'healer' ? 7.5 : 8) * M : h.kit.attack.range * M * 0.8 + tgt.radius;
  if (!h.mods.root) {
    if (d > want + 10) moveTo(w, h, tgt.x, tgt.y, sp, dt);
    else if (ranged && d < want * 0.55) { const a = angleTo(tgt.x, tgt.y, h.x, h.y); move(w, h, Math.cos(a), Math.sin(a), sp * 0.8, dt); }
    else if (w.pvp && Math.random() < 0.02) h.strafe = (h.strafe || 1) * -1;
    else if (w.pvp && ranged) { const a = h.faceAngle + Math.PI / 2 * (h.strafe || 1); move(w, h, Math.cos(a), Math.sin(a), sp * 0.5, dt); }
    else h.moving = false;
  }

  // 5) skills then basic attack
  const aim = { x: tgt.x, y: tgt.y, target: tgt, lock: true };
  if (h.gcd <= 0 && !h.mods.silence) {
    const nearFoes = foes.filter((f) => dist(tgt.x, tgt.y, f.x, f.y) < 5 * M).length;
    const list = h.def.skills.filter((s) => h.rankOf(s) > 0 && (h.cooldowns[s.id] || 0) <= 0 && h.resource >= h.skillCost(s));
    for (const s of list.sort(() => Math.random() - 0.5)) {
      const b = behaviourOf(s);
      if (!b) continue;
      if (b.heal && role === 'healer') continue;
      if (b.aoe && nearFoes < 2 && !tgt.boss && !w.pvp && Math.random() < 0.7) continue;
      if (b.self && s.name.includes('Stance')) { if ((role === 'tank') === s.name.includes('Ravager')) continue; if (h.stance) continue; }
      if (b.support && !b.heal && h.inCombat <= 0) continue;
      if (s.name === 'Resurrection') continue;
      if (/Vanish|Rolling Escape|Last Bastion/.test(s.name) && h.hp / h.maxHp > 0.4) continue;
      if (/Taunting Cry|Kings Challenge|War Roar/.test(s.name) && (w.pvp || role !== 'tank')) continue;
      const range = skillRangePx(s);
      if (!b.self && !b.support && d > range + tgt.radius + 10) continue;
      if (w.castSkill(h, s, aim)) return;
    }
  }
  if (h.attackCd <= 0 && d <= (ranged ? h.kit.attack.range * M : h.kit.attack.range * M + tgt.radius + 8)) w.basicAttack(h, aim);
}

function tryCast(w, h, names, target) {
  if (h.gcd > 0 || h.mods.silence) return false;
  for (const n of names) {
    const s = h.def.skills.find((x) => x.name === n);
    if (!s || h.rankOf(s) <= 0 || (h.cooldowns[s.id] || 0) > 0 || h.resource < h.skillCost(s)) continue;
    if (w.castSkill(h, s, { x: target.x, y: target.y, target })) return true;
  }
  return false;
}

function move(w, h, dx, dy, sp, dt) {
  const ox = h.x, oy = h.y;
  w.map.move(h, dx * sp * dt, dy * sp * dt);
  h.moving = Math.abs(h.x - ox) + Math.abs(h.y - oy) > 0.1;
  if (h.moving) { h.faceAngle = Math.atan2(dy, dx); h.moveAngle = h.faceAngle; }
}
function moveTo(w, h, tx, ty, sp, dt) {
  if (w.map.lineClearSolid(h.x, h.y, tx, ty, h.radius)) { h.path = null; const a = angleTo(h.x, h.y, tx, ty); move(w, h, Math.cos(a), Math.sin(a), sp, dt); return; }
  h.pathT = (h.pathT || 0) - dt;
  if (!h.path || h.pathT <= 0) { h.path = (w.map.path(h.x, h.y, tx, ty, 1500) || []).map(([x, y]) => ({ x, y })); h.pathT = 0.7; }
  if (h.path.length) {
    const p = h.path[0];
    const a = angleTo(h.x, h.y, p.x, p.y);
    move(w, h, Math.cos(a), Math.sin(a), sp, dt);
    if (dist(h.x, h.y, p.x, p.y) < 14) h.path.shift();
  } else { const a = angleTo(h.x, h.y, tx, ty); move(w, h, Math.cos(a), Math.sin(a), sp, dt); }
}
export { clamp };
