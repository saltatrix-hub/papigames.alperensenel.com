// World simulation: current map, entities, projectiles, zones, telegraphs, events, travel.
import { GDD } from '../data/gdd.js';
import { REGION_META, REGION_ORDER, STORY_NPCS, NPC_NAMES, ROLE_TR, ROLE_SERVICE, EXTRA_DUNGEONS, GARRICK, RAID_WINGS, MINIBOSS_EPITHETS, THEMES } from '../data/content.js';
import { generateRegion, generateDungeon, generateArena } from '../world/mapgen.js';
import { TILE } from '../world/map.js';
import { Monster, NPC, WorldObject, Hero, dirFromAngle } from './entities.js';
import { METER, killXp, autoStats, refGear, TIER } from './stats.js';
import { tickBuffs, dealDamage } from './combat.js';
import { behaviourOf, basicAttack, ELEMENT } from './skills.js';
import { monsterAI, heroAI, mechanicOf, MECH_TR } from './ai.js';
import { regionById, regionMonsters } from './quests.js';
import { rollLoot } from './items.js';
import { angleTo, dist, angDiff, clamp, rng, hashStr } from '../core/util.js';
import { audio } from '../core/audio.js';

const M = METER, T = TILE;
const mapCache = new Map();

export function regionBoss(regionId) {
  if (regionId === 'MAP_DAW') return GARRICK;
  const r = regionById(regionId);
  return GDD.bosses.find((b) => b.region === r.name && b.type !== 'Raid Final') || GDD.bosses[0];
}
export function dungeonDef(name) { return EXTRA_DUNGEONS[name] || GDD.dungeons.find((d) => d.name === name); }
export const bossRow = (b, level) => ({ id: b.id || 'BOSS_' + b.name, name: b.name, level: level ?? b.level, region: b.region, hp: 0, atk: 0, xpMult: 1, tier: 'Boss' });

export class World {
  constructor(game) {
    this.game = game;
    this.time = 0;
    this.map = null;
    this.heroes = []; this.monsters = []; this.npcs = []; this.objects = []; this.ghosts = [];
    this.projectiles = []; this.zones = []; this.traps = []; this.telegraphs = []; this.timers = [];
    this.parts = []; this.floats = []; this.rings = []; this.slashes = []; this.beams = []; this.meteors = [];
    this.respawns = [];
    this.pvp = false;
    this.extraAllies = [];
    this.shakeT = 0; this.shakeA = 0;
    this.dayT = 0.3;
    this.fx = {
      burst: (x, y, color, n = 10, spd = 1) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = (40 + Math.random() * 140) * spd; this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0, dur: 0.4 + Math.random() * 0.4, color, size: 2 + Math.random() * 3, g: 220 }); } },
      ring: (x, y, r, color, dur = 0.4, fill = false) => this.rings.push({ x, y, r, color, dur, t: 0, fill }),
      slash: (x, y, ang, r, arc, color, dur = 0.22) => this.slashes.push({ x, y, ang, r, arc, color, dur, t: 0 }),
      beam: (x1, y1, x2, y2, color, dur = 0.3, w = 6) => this.beams.push({ x1, y1, x2, y2, color, dur, t: 0, w }),
    };
  }

  // ================================================================ queries
  get player() { return this.game.player; }
  enemiesOf(a) {
    if (a.team === 'ally') {
      const out = this.monsters.filter((m) => !m.dead);
      if (this.pvp) for (const h of this.heroes) if (!h.dead && h.team === 'enemy') out.push(h);
      return out;
    }
    const out = this.heroes.filter((h) => !h.dead && h.team === 'ally');
    for (const e of this.extraAllies) if (!e.dead) out.push(e);
    return out;
  }
  alliesOf(a) { return this.heroes.filter((h) => !h.dead && h.team === a.team); }
  inCircle(list, x, y, r) { return list.filter((t) => dist(x, y, t.x, t.y) <= r + (t.radius || 10)); }
  inCone(list, x, y, ang, arcDeg, r) {
    const half = (arcDeg * Math.PI) / 360;
    return list.filter((t) => {
      const d = dist(x, y, t.x, t.y);
      if (d > r + (t.radius || 10)) return false;
      if (d < (t.radius || 10) + 8) return true;
      return Math.abs(angDiff(ang, angleTo(x, y, t.x, t.y))) <= half + Math.atan2(t.radius || 10, d);
    });
  }
  inLine(list, x, y, ang, len, w) {
    const cx = Math.cos(ang), cy = Math.sin(ang);
    return list.filter((t) => {
      const dx = t.x - x, dy = t.y - y;
      const along = dx * cx + dy * cy;
      if (along < -(t.radius || 10) || along > len + (t.radius || 10)) return false;
      return Math.abs(-dx * cy + dy * cx) <= w / 2 + (t.radius || 10);
    });
  }

  // ================================================================ spawning helpers
  projectile(o) {
    const p = { traveled: 0, radius: o.radius || (o.small ? 8 : 12), pierce: o.pierce || 1, hit: new Set(), t: 0, ...o };
    p.vx = Math.cos(o.ang) * o.speed; p.vy = Math.sin(o.ang) * o.speed;
    this.projectiles.push(p);
    return p;
  }
  zone(o) { this.zones.push({ t: 0, tick: 0, ...o }); }
  trap(o) { this.traps.push({ t: 0, ...o }); }
  telegraph(o) { this.telegraphs.push({ e: 0, ...o }); if (o.owner && o.owner.boss) audio.play('warn'); }
  delayed(t, fn) { this.timers.push({ t, fn }); }
  floatText(x, y, text, color = '#fff', scale = 1, crit = false) {
    if (this.floats.length > 90) this.floats.shift();
    this.floats.push({ x, y, text: String(text), color, scale, crit, t: 0, dur: crit ? 1.1 : 0.9, vx: (Math.random() - 0.5) * 30 });
  }
  hitSpark(x, y, color, n) { this.fx.burst(x, y, color, n, 0.8); }
  shake(a) { this.shakeA = Math.max(this.shakeA, a * this.game.settings.shake); this.shakeT = 0.25; }
  announce(text, color) { this.game.ui.announce(text, color); }
  bossBanner(m, ab) {
    this.floatText(m.x, m.y - 70 * m.size, ab, '#ffb070', 1.1);
    if (m.boss) this.game.ui.bossCast(m, ab, MECH_TR[mechanicOf(ab)]);
  }
  onBossPull(m) { this.game.ui.bossBar(m); audio.play('boss'); if (m.tier === 'Raid' || m.boss) this.announce(m.name, '#ff8050'); }

  dash(a, ang, len, dur, onEnd, onHit) {
    a.dashM = { vx: (Math.cos(ang) * len) / dur, vy: (Math.sin(ang) * len) / dur, t: 0, dur, onEnd, onHit, hit: new Set() };
  }
  leap(a, x, y, dur, onLand) {
    const [tx, ty] = this.map.findOpen(x, y, 120);
    a.leapM = { sx: a.x, sy: a.y, tx, ty, t: 0, dur, onLand };
  }
  knockback(t, fx, fy, d) {
    if (t.boss || t.mods.ccImmune || t.kind === 'objective') return;
    const a = angleTo(fx, fy, t.x, t.y);
    t.kb = { vx: (Math.cos(a) * d) / 0.2, vy: (Math.sin(a) * d) / 0.2, t: 0.2 };
  }
  pull(t, x, y, d) {
    if (t.boss || t.mods.ccImmune || t.kind === 'objective') return;
    const dd = Math.min(d, dist(t.x, t.y, x, y) - (t.radius || 10) - 10);
    if (dd <= 0) return;
    const a = angleTo(t.x, t.y, x, y);
    t.kb = { vx: (Math.cos(a) * dd) / 0.2, vy: (Math.sin(a) * dd) / 0.2, t: 0.2 };
  }
  chain(c, first, n, range, fn, color, teleport) {
    const hit = [first];
    let cur = first;
    for (let i = 1; i < n; i++) {
      let best = null, bd = range;
      for (const e of this.enemiesOf(c)) { if (hit.includes(e)) continue; const d = dist(cur.x, cur.y, e.x, e.y); if (d < bd) { bd = d; best = e; } }
      if (!best) break;
      hit.push(best); cur = best;
    }
    let px = c.x, py = c.y - 20;
    hit.forEach((t, i) => {
      const sx = px, sy = py;
      this.delayed(i * 0.09, () => {
        if (t.dead) return;
        if (!teleport) this.fx.beam(sx, sy, t.x, t.y - 20, color, 0.25, 4);
        else { this.fx.burst(t.x, t.y - 20, color, 10); }
        fn(t, i);
      });
      px = t.x; py = t.y - 20;
    });
  }
  meteor(x, y, t, color, onLand, scale = 1) {
    this.meteors.push({ x, y, t: 0, dur: t, color, scale });
    this.delayed(t, onLand);
  }
  revive(h, frac) {
    h.dead = false; h.hp = Math.round(h.maxHp * frac); h.buffs = []; h.reviveT = 0;
    this.floatText(h.x, h.y - 60, 'Diriltildi', '#fff4b0', 1.2);
    audio.play('heal');
  }
  spawnAdd(boss, i, n) {
    let pool = boss.addPool || regionMonsters(this.regionId || 'MAP_DAW').slice(0, 6);
    const row = { ...pool[(Math.random() * pool.length) | 0], level: Math.max(1, boss.level - 2), hp: 0, atk: 0 };
    const a = (i / n) * Math.PI * 2 + Math.random();
    const [x, y] = this.map.findOpen(boss.x + Math.cos(a) * 3 * M, boss.y + Math.sin(a) * 3 * M, 150);
    const m = new Monster(row, 'Normal', { respawn: -1, hpMult: 0.6 });
    m.x = x; m.y = y; m.home = { x, y }; m.add = true; m.noLeash = true; m.map = this.map;
    const tgt = boss.topThreat(this);
    if (tgt) { m.addThreat(tgt, 10); m.state = 'chase'; }
    this.monsters.push(m);
    this.fx.burst(x, y, '#a0ff80', 12);
  }

  // ================================================================ travel & population
  clear() {
    this.monsters = []; this.npcs = []; this.objects = []; this.ghosts = [];
    this.projectiles = []; this.zones = []; this.traps = []; this.telegraphs = []; this.timers = [];
    this.parts = []; this.floats = []; this.rings = []; this.slashes = []; this.beams = []; this.meteors = [];
    this.respawns = []; this.extraAllies = []; this.event = null; this.escort = null;
    this.pvp = false; this.questKey = null; this.guarded = false; this.arena = null; this.dungeon = null;
  }

  /** dest: {type:'region', id, at} | {type:'dungeon', name, regionId} | {type:'arena'} */
  enter(dest) {
    const g = this.game;
    this.clear();
    this.dest = dest;
    this.kind = dest.type;
    if (dest.type === 'region') {
      this.regionId = dest.id;
      const meta = REGION_META[dest.id];
      if (!mapCache.has(dest.id)) mapCache.set(dest.id, generateRegion(regionById(dest.id), meta));
      this.map = mapCache.get(dest.id);
      this.populateRegion();
      const P = this.map.pois;
      const at = dest.at === 'portalNext' ? { x: P.portalNext.x - 2 * T, y: P.portalNext.y } : dest.at === 'portalPrev' ? { x: P.portalPrev.x + 2 * T, y: P.portalPrev.y } : dest.at === 'dungeon' ? { x: P.dungeon.x, y: P.dungeon.y + 2.5 * T } : dest.pos || P.spawn;
      this.placeParty(at.x, at.y);
      audio.setTheme(meta.theme);
    } else if (dest.type === 'dungeon') {
      this.regionId = dest.regionId;
      const def = dungeonDef(dest.name);
      const themeKey = REGION_META[dest.regionId].theme;
      const wings = RAID_WINGS[dest.name];
      this.map = generateDungeon(dest.name, dest.name === 'Eclipse Cathedral' ? 'void' : themeKey, wings ? wings.length : 1);
      this.dungeon = { name: dest.name, def, wings, bossesLeft: 0, done: false, start: this.time };
      this.populateDungeon(def, wings);
      this.placeParty(this.map.pois.spawn.x, this.map.pois.spawn.y);
      audio.setTheme('dungeon');
      this.announce(dest.name, '#ffd76a');
    } else if (dest.type === 'arena') {
      this.regionId = 'MAP_DAW';
      this.map = generateArena();
      this.pvp = true;
      this.populateArena();
      audio.setTheme('arena');
    }
    for (const h of this.heroes) h.map = this.map;
    this.syncQuest();
    g.ui.mapChanged();
  }

  placeParty(x, y) {
    const g = this.game;
    this.heroes = [g.player, ...g.party];
    this.heroes.forEach((h, i) => {
      const [px, py] = this.map.findOpen(x + (i ? (i - 2) * 30 : 0), y + (i ? 36 : 0));
      h.x = px; h.y = py; h.map = this.map; h.kb = null; h.dashM = null; h.leapM = null; h.path = null;
      if (h.dead) { h.dead = false; h.hp = Math.round(h.maxHp * 0.5); }
      h.team = 'ally';
    });
    this.map.prewarm(x, y, 1);
  }

  makeMonster(row, tier, x, y, opts = {}) {
    const hpMult = (opts.hpMult || 1) * (tier === 'Boss' || tier === 'Raid' ? this.partyScale() : 1);
    const m = new Monster(row, tier, { ...opts, hpMult });
    m.x = x; m.y = y; m.home = { x, y }; m.map = this.map;
    this.monsters.push(m);
    return m;
  }
  partyScale() { const n = 1 + this.game.party.length; return 0.55 + 0.15 * n; }

  populateRegion() {
    const map = this.map, P = map.pois, rid = this.regionId, g = this.game;
    const mons = regionMonsters(rid);
    // spawns
    map.spawns.forEach((s, i) => this.spawnFrom(s, i));
    // world boss
    const b = regionBoss(rid);
    const boss = this.makeMonster(bossRow(b), 'Boss', P.boss.x, P.boss.y, { abilities: b.abilities, respawn: 120 });
    boss.questBoss = true; boss.addPool = mons.slice(0, 6); boss.leash = 16 * M;
    this.bossSpawn = { x: P.boss.x, y: P.boss.y, def: b };
    // named mini boss (side quest)
    const mb = this.makeMonster({ ...mons[6], level: mons[6].level + 1, hp: 0, atk: 0 }, 'Named', P.miniboss.x, P.miniboss.y, { name: this.minibossName(rid), abilities: ['Slam', 'Enrage'], respawn: 150 });
    mb.miniboss = true; mb.addPool = mons.slice(0, 4);
    // NPCs
    this.placeNPCs();
    // objects
    const obj = (o) => { const w = new WorldObject(o); this.objects.push(w); return w; };
    const idx = REGION_ORDER.indexOf(rid);
    if (idx > 0) obj({ type: 'portal', x: P.portalPrev.x, y: P.portalPrev.y, dest: REGION_ORDER[idx - 1], label: `← ${REGION_META[REGION_ORDER[idx - 1]].tr}`, r: 34 });
    if (idx < REGION_ORDER.length - 1) obj({ type: 'portal', x: P.portalNext.x, y: P.portalNext.y, dest: REGION_ORDER[idx + 1], label: `${REGION_META[REGION_ORDER[idx + 1]].tr} →`, r: 34 });
    obj({ type: 'dungeon', x: P.dungeon.x, y: P.dungeon.y, label: 'Zindan Girişi', r: 40 });
    const hub = P.hub;
    const ws = map.portalPlaza || { x: hub.x + 3 * T, y: hub.y - 1.2 * T };
    obj({ type: 'waystone', x: ws.x, y: ws.y, label: 'Işınlanma Taşı', r: 30 });
    if (rid === 'MAP_DAW') obj({ type: 'arena', x: ws.x + 3 * T, y: ws.y + 1.5 * T, label: 'Astral Arena', r: 34 });
    const cf = map.fountain ? { x: map.fountain.x - 3.4 * T, y: map.fountain.y + 2.2 * T } : { x: hub.x - 2.4 * T, y: hub.y + 2.4 * T };
    obj({ type: 'craft', x: cf.x, y: cf.y, label: 'Zanaat Tezgâhı', r: 26 });
    for (const gp of P.gathers) obj({ type: 'gather', gkind: gp.kind, x: gp.x, y: gp.y, ready: true, label: gp.kind === 'herb' ? 'Şifalı Ot' : gp.kind === 'ore' ? 'Maden Damarı' : 'Nadir Kristal', r: 22 });
    for (const e of P.explore) obj({ type: 'explore', x: e.x, y: e.y, id: e.id, r: e.r, hidden: true });
    // ambient "players"
    this.spawnGhosts(rid === 'MAP_DAW' ? 7 : 3);
  }
  minibossName(rid) {
    const mons = regionMonsters(rid);
    const i = REGION_ORDER.indexOf(rid);
    return `${MINIBOSS_EPITHETS[i % MINIBOSS_EPITHETS.length]} ${mons[6].name}`;
  }
  spawnFrom(s, i) {
    const mons = regionMonsters(this.regionId);
    const row = mons[s.mob];
    const tier = s.tier === 'Elite' || row.tier === 'Elite' ? 'Elite' : 'Normal';
    const m = this.makeMonster(row, tier, s.x, s.y, { respawn: tier === 'Elite' ? 40 : 16 });
    m.spawnRef = s;
    if (tier === 'Elite') m.abilities = [['Slam', 'Charge', 'Cone sweep', 'Enrage'][i % 4]];
    return m;
  }

  placeNPCs() {
    const map = this.map, rid = this.regionId, r = regionById(rid);
    const gddNpcs = GDD.npcs.filter((n) => n.region === r.name && !n.tier.includes('Unique'));
    const names = NPC_NAMES[rid];
    const story = STORY_NPCS[rid];
    const mk = (o) => { const n = new NPC(o); n.map = map; this.npcs.push(n); return n; };
    const P = map.pois;
    if (rid === 'MAP_DAW') {
      const hub = P.hub;
      // story NPCs around fountain
      const spots = [[-1.8, -1.6], [2.6, 1.2], [0, 0], [3.5, -2.2]];
      story.forEach((s, i) => {
        if (s.role === 'Blacksmith' || s.role === 'Healer') return;
        const [dx, dy] = spots[i];
        mk({ name: s.name, title: ROLE_TR[s.role] || s.role, storyId: s.id, npcId: s.id, look: s.look, x: hub.x + dx * T, y: hub.y + dy * T + 60, service: ROLE_SERVICE[s.role] || 'lore' });
      });
      // service NPCs at doors
      const byService = {};
      gddNpcs.forEach((n, i) => { byService[ROLE_SERVICE[n.role]] ||= { n, name: names[i % names.length] }; });
      for (const b of map.villageBuildings) {
        let name, role, storyId = null, look = null, npcId;
        if (b.service === 'smith') { const s = story.find((x) => x.role === 'Blacksmith'); name = s.name; role = 'Blacksmith'; storyId = s.id; look = s.look; npcId = s.id; }
        else if (b.service === 'healer') { const s = story.find((x) => x.role === 'Healer'); name = s.name; role = 'Healer'; storyId = s.id; look = s.look; npcId = s.id; }
        else {
          const e = byService[b.service];
          role = e ? e.n.role : Object.keys(ROLE_SERVICE).find((k) => ROLE_SERVICE[k] === b.service);
          name = e ? e.name : names[(hashStr(b.service) >>> 0) % names.length];
          npcId = e ? e.n.id : 'NPC_DW_' + b.service.toUpperCase();
        }
        mk({ name, title: ROLE_TR[role] || role, storyId, npcId, look: look || npcLook(role, name), x: b.door.x + 40, y: b.door.y + 26, service: ROLE_SERVICE[role] || b.service });
      }
      const gm = byService.shop;
      if (gm) mk({ name: gm.name, title: ROLE_TR['General Merchant'], npcId: gm.n.id, look: npcLook('General Merchant', gm.name), x: hub.x - 3.6 * T, y: hub.y - 0.4 * T, service: 'shop', stall: true });
    } else {
      const spots = map.npcSpots;
      let k = 0;
      story.forEach((s) => { const p = spots[k++ % spots.length]; mk({ name: s.name, title: ROLE_TR[s.role] || s.role.replace('Story/', ''), storyId: s.id, npcId: s.id, look: s.look, x: p.x, y: p.y, service: ROLE_SERVICE[s.role] || 'lore' }); });
      gddNpcs.forEach((n, i) => { const p = spots[k++ % spots.length]; mk({ name: names[i % names.length], title: ROLE_TR[n.role] || n.role, npcId: n.id, look: npcLook(n.role, names[i]), x: p.x, y: p.y, service: ROLE_SERVICE[n.role] }); });
      // every camp offers the basics (GDD: safe hub services)
      if (!this.npcs.some((n) => n.service === 'shop')) { const p = spots[k++ % spots.length]; mk({ name: names[5], title: ROLE_TR['General Merchant'], npcId: 'NPC_X_SHOP_' + rid, look: npcLook('General Merchant', names[5]), x: p.x, y: p.y, service: 'shop' }); }
      if (!this.npcs.some((n) => n.service === 'smith')) { const p = spots[k++ % spots.length]; mk({ name: names[4], title: ROLE_TR.Blacksmith, npcId: 'NPC_X_SMITH_' + rid, look: npcLook('Blacksmith', names[4]), x: p.x, y: p.y, service: 'smith' }); }
    }
  }

  spawnGhosts(n) {
    const R = rng(hashStr(this.regionId) + ((this.time * 10) | 0));
    const hub = this.map.pois.hub;
    const classes = ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest'];
    for (let i = 0; i < n; i++) {
      const cls = classes[R.int(0, 5)];
      const h = new Hero({ cls, name: GHOST_NAMES[R.int(0, GHOST_NAMES.length - 1)], level: clamp(this.game.player.level + R.int(-4, 12), 1, 100), stats: autoStats(cls, 1) });
      h.recalc(); h.team = 'neutral'; h.ghost = true; h.guild = R.chance(0.5) ? GUILDS[R.int(0, GUILDS.length - 1)] : null;
      const [x, y] = this.map.findOpen(hub.x + R.range(-5, 5) * T, hub.y + R.range(-4, 4) * T);
      h.x = x; h.y = y; h.map = this.map; h.home = { x, y }; h.wanderT = R.range(0, 4);
      if (R.chance(0.25)) h.mount = { kind: ['horse', 'stag', 'drake'][R.int(0, 2)], speed: 0.6 };
      this.ghosts.push(h);
    }
  }

  populateDungeon(def, wings) {
    const map = this.map;
    const rid = this.regionId;
    const L = def.level;
    const pool = regionMonsters(rid);
    const partyN = 1 + this.game.party.length;
    const packScale = 0.75 + partyN * 0.1;
    const bossRooms = map.rooms.filter((r) => r.boss);
    map.rooms.forEach((room, ri) => {
      if (room.boss || ri === 0) return;
      const n = Math.round((3 + (ri % 3)) * packScale);
      for (let i = 0; i < n; i++) {
        const src = pool[(ri * 3 + i) % 6];
        const row = { ...src, level: L + (i === 0 && ri % 2 ? 1 : 0), hp: 0, atk: 0 };
        const [x, y] = map.findOpen(room.cx + (Math.random() - 0.5) * (room.x1 - room.x0 - 3) * T, room.cy + (Math.random() - 0.5) * (room.y1 - room.y0 - 3) * T);
        const elite = i === 0 && ri % 2 === 0;
        const m = this.makeMonster(row, elite ? 'Elite' : 'Normal', x, y, { respawn: -1 });
        if (elite) { m.abilities = ['Slam', 'Cone sweep']; }
        m.noWander = true;
      }
    });
    const tier = wings ? 'Raid' : 'Boss';
    const names = wings || [def.boss];
    names.forEach((name, i) => {
      const room = bossRooms[i] || map.rooms[map.rooms.length - 1];
      const g = GDD.bosses.find((b) => b.name === name);
      const abil = g ? g.abilities : [...(def.mechanics || []).map((x) => x), 'Slam', 'Summon', 'Enrage'].slice(0, 5);
      const lvl = wings ? L - (names.length - 1 - i) : L;
      const m = this.makeMonster(bossRow({ name, region: regionById(rid).name, id: 'DB_' + name }, Math.min(100, lvl + 1)), tier, room.cx, room.cy, { abilities: abil, respawn: -1, hpMult: wings ? 0.45 : 1, aura: wings ? '#b070ff' : undefined });
      m.dungeonBoss = true; m.addPool = pool.slice(0, 6).map((r) => ({ ...r })); m.leash = 14 * M;
      if (name === 'Eclipse Seraph Malzor') m.raidFinal = true;
      this.dungeon.bossesLeft++;
    });
    this.objects.push(new WorldObject({ type: 'exit', x: map.pois.exit.x, y: map.pois.exit.y, label: 'Çıkış', r: 30 }));
  }

  populateArena() {
    const g = this.game, P = this.map.pois;
    const L = g.player.level;
    const allies = g.party.slice(0, 2);
    const classes = ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest'];
    // temporary teammates if needed (3v3)
    this.arenaTemps = [];
    while (allies.length < 2) {
      const cls = classes[(Math.random() * 6) | 0];
      const h = this.game.makeCompanion(cls, L, GHOST_NAMES[(Math.random() * GHOST_NAMES.length) | 0]);
      allies.push(h); this.arenaTemps.push(h);
    }
    this.arenaAllies = allies;
    this.heroes = [g.player, ...allies];
    this.heroes.forEach((h, i) => { h.x = P.spawn.x; h.y = P.spawn.y + (i - 1) * 60; h.team = 'ally'; h.map = this.map; h.dead = false; h.hp = h.maxHp; h.buffs = []; h.cooldowns = {}; h.resource = h.res.startEmpty ? 0 : h.maxRes; h.leader = g.player; });
    const foes = [];
    const comp = [classes[(Math.random() * 2) | 0], classes[2 + ((Math.random() * 2) | 0)], classes[4 + ((Math.random() * 2) | 0)]];
    comp.forEach((cls, i) => {
      const h = this.game.makeCompanion(cls, clamp(L + ((Math.random() * 3) | 0) - 1, 1, 100), ARENA_NAMES[(Math.random() * ARENA_NAMES.length) | 0]);
      h.team = 'enemy'; h.x = P.enemy.x; h.y = P.enemy.y + (i - 1) * 60; h.map = this.map; h.leader = null; h.ai = true;
      foes.push(h);
    });
    this.heroes.push(...foes);
    this.arena = { start: this.time + 3, over: false };
    this.announce('3v3 Arena — Hazırlan!', '#9fd8ff');
  }

  // ================================================================ quest objects
  syncQuest() {
    if (this.kind !== 'region') return;
    this.objects = this.objects.filter((o) => !o.quest);
    const q = this.game.quests;
    const key = `${q.main.r}-${q.main.s}`;
    if (this.questKey !== key) {
      this.monsters = this.monsters.filter((m) => !m.questGuard);
      this.respawns = this.respawns.filter((r) => !r.mon.questGuard);
      this.questKey = key; this.guarded = false;
    }
    const P0 = this.map.pois;
    for (const id in q.side) {
      const sq = q.side[id];
      if (sq.state === 'active' && sq.region === this.regionId && q.sideDef(id).type === 'Event' && sq.p < 1 && !this.event) this.objects.push(new WorldObject({ quest: true, type: 'eventStart', x: P0.event.x, y: P0.event.y, label: 'Nöbeti Başlat', r: 34 }));
    }
    const st = q.step;
    if (!st || q.regionId !== this.regionId) return;
    const o = st.obj, P = this.map.pois, mons = regionMonsters(this.regionId);
    const guard = (mobIdx, x, y, n) => {
      for (let i = 0; i < n; i++) {
        const [gx, gy] = this.map.findOpen(x + (Math.random() - 0.5) * 3 * T, y + (Math.random() - 0.5) * 3 * T);
        const row = mons[mobIdx];
        const m = this.makeMonster(row, row.tier === 'Elite' ? 'Elite' : 'Normal', gx, gy, { respawn: 25 });
        m.questGuard = true;
      }
    };
    const obj = (x) => { const w = new WorldObject({ quest: true, ...x }); this.objects.push(w); return w; };
    if (o.investigate) {
      const c = P.investigate;
      const done = q.main.flags.clues || [];
      for (let i = 0; i < 3; i++) {
        if (done.includes(i)) continue;
        const a = (i / 3) * Math.PI * 2 + 0.5;
        const [x, y] = this.map.findOpen(c.x + Math.cos(a) * 2 * T, c.y + Math.sin(a) * 1.6 * T);
        obj({ type: 'clue', idx: i, x, y, label: 'İpucu', r: 24 });
      }
      if (!this.guarded) { guard(o.mob, c.x, c.y, 3); this.guarded = true; }
    }
    if (o.activate) {
      const done = q.main.flags.acts || [];
      P.activates.forEach((p, i) => { if (!done.includes(i)) obj({ type: 'rune', idx: i, x: p.x, y: p.y, label: 'Kadim Mühür', r: 28 }); });
      if (!this.guarded) { P.activates.forEach((p) => guard(o.mob, p.x, p.y, 2)); this.guarded = true; }
    }
    if (o.defend && !q.main.flags.defendActive) obj({ type: 'defendStart', x: P.defend.x, y: P.defend.y, label: 'Savunmayı Başlat', r: 34, key: o.defend });
    if (o.escort !== undefined && !q.main.flags.escortActive) {
      // the escortee waits at the start point
    }
  }

  questTarget() {
    const q = this.game.quests;
    const st = q.step;
    if (!st || this.kind !== 'region') return null;
    if (q.regionId !== this.regionId) {
      const i = REGION_ORDER.indexOf(this.regionId), j = REGION_ORDER.indexOf(q.regionId);
      const p = j > i ? this.map.pois.portalNext : this.map.pois.portalPrev;
      return p ? { x: p.x, y: p.y, label: REGION_META[q.regionId].tr } : null;
    }
    const o = st.obj, P = this.map.pois;
    if (o.talk !== undefined) { const n = this.npcs.find((x) => x.storyId === q.giverOf(st).id); return n && { x: n.x, y: n.y }; }
    if (o.kill !== undefined || o.collect !== undefined) {
      const mob = o.kill ?? o.collect;
      const s = this.map.spawns.find((sp) => sp.mob === mob);
      return s && { x: s.x, y: s.y };
    }
    if (o.investigate) return P.investigate;
    if (o.defend) return P.defend;
    if (o.escort !== undefined) { if (this.escort) return { x: this.escort.npc.x, y: this.escort.npc.y }; const n = this.npcs.find((x) => x.storyId === STORY_NPCS[this.regionId][o.escort].id); return n && { x: n.x, y: n.y }; }
    if (o.activate) { const r = this.objects.find((x) => x.type === 'rune'); return r || P.activates[0]; }
    if (o.boss) return P.boss;
    if (o.raid) return P.dungeon;
    return null;
  }

  startDefend(objDef) {
    const q = this.game.quests, st = q.step, o = st.obj, P = this.map.pois;
    q.main.flags.defendActive = true;
    this.objects = this.objects.filter((x) => x !== objDef);
    const L = regionMonsters(this.regionId)[o.mob].level;
    const core = { kind: 'objective', name: st.t.includes('Kök') ? 'Kadim Kök' : 'Savunma Noktası', x: P.defend.x, y: P.defend.y, radius: 28, hp: 1, maxHp: 1, dead: false, team: 'ally', mods: { dmgTaken: 0, def: 0, iframe: false }, buffs: [], defVal: 20 + L * 3, mdefVal: 20 + L * 3, level: L, map: this.map, get alive() { return !this.dead; }, addBuff() {}, cleanse() {} };
    core.maxHp = core.hp = Math.round(this.game.player.maxHp * 2.4);
    this.extraAllies.push(core);
    this.event = { kind: 'defend', core, wave: 0, waves: o.waves, next: 2, mob: o.mob, quest: true };
    this.announce('Savunma başladı!', '#ffd76a');
    this.game.ui.questChanged();
  }
  startEvent(pos) {
    const L = this.game.player.level;
    this.event = { kind: 'event', core: null, wave: 0, waves: 3, next: 2, mob: 1, pos, quest: false };
    this.announce('Bölge Nöbeti başladı!', '#9fe0ff');
  }
  startEscort(npc) {
    const q = this.game.quests, o = q.step.obj, P = this.map.pois;
    q.main.flags.escortActive = true;
    const path = (this.map.path(npc.x, npc.y, P.escortEnd.x, P.escortEnd.y, 20000) || []).map(([x, y]) => ({ x, y }));
    npc.escortHome = { x: npc.x, y: npc.y };
    npc.team = 'ally'; npc.maxHp = npc.hp = Math.round(this.game.player.maxHp * 1.8); npc.defVal = npc.mdefVal = 20 + this.game.player.level * 3; npc.level = this.game.player.level;
    this.extraAllies.push(npc);
    this.escort = { npc, path, ambush: [0.3, 0.65], mob: o.mob, sprung: 0 };
    this.announce('Eşlik görevi başladı — onu koru!', '#ffd76a');
    this.game.ui.questChanged();
  }

  updateEvents(dt) {
    const ev = this.event;
    if (ev) {
      const center = ev.core || ev.pos;
      const alive = this.monsters.filter((m) => m.eventMob && !m.dead);
      if (ev.core && ev.core.dead) { this.failEvent('Savunma noktası düştü!'); return; }
      if (dist(this.player.x, this.player.y, center.x, center.y) > 30 * M) { this.failEvent('Savunma alanından çok uzaklaştın.'); return; }
      if (!alive.length) {
        ev.next -= dt;
        if (ev.next <= 0) {
          if (ev.wave >= ev.waves) { this.finishEvent(); return; }
          ev.wave++;
          const rows = regionMonsters(this.regionId);
          const n = 3 + ev.wave + this.game.party.length;
          for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const [x, y] = this.map.findOpen(center.x + Math.cos(a) * 8 * M, center.y + Math.sin(a) * 8 * M, 200);
            const row = ev.wave === ev.waves && i === 0 ? rows[6 + (ev.mob % 4)] : rows[ev.mob];
            const m = this.makeMonster({ ...row, level: Math.max(row.level, this.game.player.level - 1), hp: 0, atk: 0 }, ev.wave === ev.waves && i === 0 ? 'Elite' : 'Normal', x, y, { respawn: -1 });
            m.eventMob = true; m.noLeash = true; m.aggroR = 40 * M;
            m.addThreat(ev.core || this.player, 30); m.state = 'chase';
          }
          ev.next = 2.5;
          this.announce(`Dalga ${ev.wave}/${ev.waves}`, '#ffb050');
          if (ev.quest && ev.wave > 1) this.game.quests.advance(); // completed previous wave
        }
      }
    }
    const es = this.escort;
    if (es) {
      const n = es.npc;
      if (n.dead) { this.failEscort(); return; }
      const nearPlayer = dist(n.x, n.y, this.player.x, this.player.y) < 7 * M;
      const fighting = this.monsters.some((m) => m.eventMob && !m.dead);
      if (es.path.length && nearPlayer && !fighting) {
        const p = es.path[0];
        const a = angleTo(n.x, n.y, p.x, p.y);
        const sp = 3.4 * M * dt;
        n.x += Math.cos(a) * sp; n.y += Math.sin(a) * sp; n.moving = true; n.dir = dirFromAngle(a);
        if (dist(n.x, n.y, p.x, p.y) < 10) es.path.shift();
        const total = es.total ||= es.path.length + 1;
        const prog = 1 - es.path.length / total;
        if (es.sprung < es.ambush.length && prog > es.ambush[es.sprung]) {
          es.sprung++;
          const rows = regionMonsters(this.regionId);
          for (let i = 0; i < 3 + this.game.party.length; i++) {
            const a2 = Math.random() * Math.PI * 2;
            const [x, y] = this.map.findOpen(n.x + Math.cos(a2) * 6 * M, n.y + Math.sin(a2) * 6 * M, 200);
            const m = this.makeMonster({ ...rows[es.mob], level: Math.max(rows[es.mob].level, this.game.player.level - 1), hp: 0, atk: 0 }, 'Normal', x, y, { respawn: -1 });
            m.eventMob = true; m.noLeash = true; m.addThreat(n, 40); m.state = 'chase';
          }
          this.announce('Pusu!', '#ff7050');
        }
      } else n.moving = false;
      if (!es.path.length) {
        this.escort = null;
        this.extraAllies = this.extraAllies.filter((x) => x !== n);
        n.team = 'neutral'; n.hp = n.maxHp;
        this.game.ui.dialog(n, 'Başardık! Buradan sonrasını ben hallederim. Teşekkürler, Şafak Taşıyıcı.', [], 'Eşlik tamamlandı');
        const home = n.escortHome; this.delayed(6, () => { n.x = home.x; n.y = home.y; });
        this.game.quests.advance();
      }
    }
  }
  finishEvent() {
    const ev = this.event;
    this.event = null;
    this.extraAllies = [];
    this.announce('Savunma başarılı!', '#6dff8a');
    if (ev.quest) this.game.quests.advance();
    else { this.game.quests.onEvent('event'); this.game.reward({ xp: 0, gold: 40 + this.game.player.level * 10, reason: 'Nöbet ödülü' }); }
  }
  failEvent(msg) {
    const ev = this.event;
    this.event = null; this.extraAllies = [];
    for (const m of this.monsters) if (m.eventMob) { m.dead = true; m.deathT = this.time; m.respawn = -1; }
    this.announce(msg, '#ff5050');
    if (ev.quest) { const q = this.game.quests; q.main.p = 0; q.main.flags.defendActive = false; this.syncQuest(); this.game.ui.questChanged(); }
  }
  failEscort() {
    const es = this.escort;
    this.escort = null; this.extraAllies = [];
    const n = es.npc;
    n.dead = false; n.team = 'neutral'; n.hp = n.maxHp; n.x = n.escortHome.x; n.y = n.escortHome.y;
    for (const m of this.monsters) if (m.eventMob) { m.dead = true; m.deathT = this.time; m.respawn = -1; }
    const q = this.game.quests; q.main.flags.escortActive = false;
    this.announce('Eşlik başarısız — tekrar dene.', '#ff5050');
    this.game.ui.questChanged();
  }

  // ================================================================ combat entry points
  castSkill(h, s, aim) {
    if (h.dead || h.rankOf(s) <= 0) return false;
    if ((h.cooldowns[s.id] || 0) > 0 || h.gcd > 0) return false;
    if (h.mods.stun) return false;
    const b = behaviourOf(s);
    if (!b) return false;
    if (h.mods.silence && (h.kit.magic || b.support)) { if (h.isPlayer) this.floatText(h.x, h.y - 60, 'Susturuldun', '#c080ff'); return false; }
    const cost = h.skillCost(s);
    if (h.resource < cost) { if (h.isPlayer) { this.floatText(h.x, h.y - 60, `Yetersiz ${RES_TR[h.resourceName]}`, '#8ab0ff', 0.9); audio.play('error'); } return false; }
    if (s.name === 'Eviscerate' && h.combo <= 0 && h.isPlayer) { this.floatText(h.x, h.y - 60, 'Kombo puanı yok', '#c8b0ff', 0.9); return false; }
    const coef = h.skillCoef(s);
    const r = b.run(this, h, s, aim, coef);
    if (r === false) { if (h.isPlayer) { this.floatText(h.x, h.y - 60, 'Hedef yok', '#ccc', 0.9); audio.play('error'); } return false; }
    h.resource -= cost;
    h.cooldowns[s.id] = h.skillCd(s);
    h.gcd = b.self && s.name.includes('Stance') && h.passivePct.aspd ? 0.2 : 0.55;
    h.atkAnim = 0; h.atkAnimDur = 0.32;
    h.faceAngle = angleTo(h.x, h.y, aim.x, aim.y);
    if (h.buffs.some((x) => x.stealth) && !/Vanish|Smoke/.test(s.name)) h.buffs = h.buffs.filter((x) => !x.stealth);
    // Mage Mirror Rune echo
    if (h.mods.echo && h.cls === 'Mage' && s.name !== 'Mirror Rune' && !b.self) {
      const e = h.mods.echo; e.stacks = (e.stacks || 1);
      this.delayed(0.45, () => { if (!h.dead) b.run(this, h, s, aim, coef * 0.4); });
      e.uses = (e.uses || 0) + 1; if (e.uses >= 3) e.dur = 0;
    }
    if (h.isPlayer) this.game.ui.skillUsed(s);
    return true;
  }
  basicAttack(h, aim) {
    if (h.attackCd > 0 || h.dead || h.mods.stun) return false;
    h.attackCd = h.kit.attack.interval / ((h.derived.aspd || 1) + (h.mods.aspd || 0));
    h.atkAnim = 0; h.atkAnimDur = Math.min(0.3, h.attackCd * 0.8);
    h.faceAngle = angleTo(h.x, h.y, aim.x, aim.y);
    if (h.buffs.some((x) => x.stealth)) h.buffs = h.buffs.filter((x) => !x.stealth);
    basicAttack(this, h, aim);
    return true;
  }
  dpsMeter(src, dmg) { const d = this.game.dps; d.total += dmg; if (src.isPlayer) d.mine += dmg; }

  kill(tgt, src) {
    if (tgt.dead) return;
    tgt.dead = true; tgt.deathT = this.time; tgt.buffs = [];
    if (tgt.kind === 'monster') {
      audio.play(tgt.boss ? 'epic' : 'mobdie');
      this.fx.burst(tgt.x, tgt.y - 20, tgt.color, tgt.boss ? 40 : 14);
      const g = this.game, p = this.player;
      if (!tgt.add && !tgt.eventMob && dist(p.x, p.y, tgt.x, tgt.y) < 30 * M && !p.dead) {
        const xp = Math.round(killXp(tgt.level, p.level, tgt.xpMult) * g.settings.xpRate);
        g.gainXp(xp, tgt);
        const loot = rollLoot(tgt, p.cls, 1);
        g.lootDrop(loot, tgt);
      } else if (tgt.eventMob || tgt.add) g.gainXp(Math.round(killXp(tgt.level, p.level, 0.5) * g.settings.xpRate), tgt);
      g.quests.onKill(tgt);
      if (tgt.boss) {
        this.game.ui.bossBar(null);
        this.announce(`${tgt.name} yenildi!`, '#ffd76a');
        g.stats.bosses = (g.stats.bosses || 0) + 1;
        if (tgt.questBoss) g.achievement('boss_' + this.regionId, `${tgt.name} yenildi`);
      }
      g.stats.kills = (g.stats.kills || 0) + 1;
      if (tgt.respawn > 0) this.respawns.push({ t: this.time + tgt.respawn, mon: tgt });
      if (tgt.dungeonBoss && this.dungeon) {
        this.dungeon.bossesLeft--;
        if (this.dungeon.bossesLeft <= 0) this.completeDungeon();
      }
      for (const m of this.monsters) if (m.threat.has(tgt)) m.threat.delete(tgt);
    } else if (tgt.kind === 'hero') {
      this.fx.burst(tgt.x, tgt.y - 20, '#ff4040', 20);
      audio.play('die');
      for (const m of this.monsters) m.threat.delete(tgt);
      if (tgt.isPlayer) this.game.onPlayerDeath();
      else tgt.reviveT = 12;
      if (this.arena) this.checkArena();
    } else if (tgt.kind === 'objective' || tgt.kind === 'npc') {
      this.fx.burst(tgt.x, tgt.y - 20, '#ff4040', 20);
    }
  }

  completeDungeon() {
    const d = this.dungeon;
    d.done = true;
    const last = this.map.rooms[this.map.rooms.length - 1];
    this.objects.push(new WorldObject({ type: 'chest', x: last.cx, y: last.cy + 2 * T, label: 'Ganimet Sandığı', r: 30, level: d.def.level, raid: !!d.wings }));
    this.objects.push(new WorldObject({ type: 'exit', x: last.cx + 3 * T, y: last.cy + 2 * T, label: 'Çıkış', r: 30 }));
    const secs = Math.round(this.time - d.start);
    this.announce(`${d.name} tamamlandı! (${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')})`, '#ffd76a');
    this.game.achievement('dgn_' + d.name, `${d.name} tamamlandı`);
    this.game.save();
  }

  checkArena() {
    const a = this.arena;
    if (!a || a.over) return;
    const allyAlive = this.heroes.some((h) => h.team === 'ally' && !h.dead);
    const foeAlive = this.heroes.some((h) => h.team === 'enemy' && !h.dead);
    if (allyAlive && foeAlive) return;
    a.over = true;
    this.game.arenaResult(allyAlive);
  }

  // ================================================================ update
  update(dt) {
    this.time += dt;
    this.dayT = (this.dayT + dt / 600) % 1;
    const map = this.map;
    // timers
    for (let i = this.timers.length - 1; i >= 0; i--) { const tm = this.timers[i]; tm.t -= dt; if (tm.t <= 0) { this.timers.splice(i, 1); tm.fn(); } }
    // actors
    const arenaWait = this.arena && this.time < this.arena.start;
    for (const h of this.heroes) {
      h.computeMods();
      if (h.dead) {
        if (!h.isPlayer && h.reviveT > 0 && !this.arena) {
          h.reviveT -= dt;
          if (h.reviveT <= 0 && !this.player.dead && this.player.inCombat <= 0) { this.revive(h, 0.5); const l = this.player; h.x = l.x + 30; h.y = l.y + 30; }
          else if (h.reviveT <= 0) h.reviveT = 1;
        }
        continue;
      }
      tickBuffs(this, h, dt);
      h.regen(dt);
      h.inCombat = Math.max(0, h.inCombat - dt);
      h.gcd = Math.max(0, h.gcd - dt);
      h.attackCd = Math.max(0, h.attackCd - dt);
      h.dodgeCd = Math.max(0, h.dodgeCd - dt);
      for (const k in h.cooldowns) if (h.cooldowns[k] > 0) h.cooldowns[k] -= dt;
      if (h.atkAnim >= 0) { h.atkAnim += dt / h.atkAnimDur; if (h.atkAnim > 1) h.atkAnim = -1; }
      if (this.motion(h, dt)) continue;
      if (h.ai && !arenaWait) heroAI(this, h, dt);
      if (h.moving) h.walkT += dt * 9;
      h.animT += dt;
      h.dir = dirFromAngle(h.faceAngle ?? Math.PI / 2);
    }
    const px = this.player.x, py = this.player.y;
    this._aiPhase = ((this._aiPhase || 0) + 1) % 3;
    const FAR = 820 * 820;
    for (let mi = 0; mi < this.monsters.length; mi++) {
      const m = this.monsters[mi];
      if (m.dead) continue;
      const far = !m.boss && m.inCombat <= 0 && (m.x - px) * (m.x - px) + (m.y - py) * (m.y - py) > FAR;
      if (far && (mi % 3) !== this._aiPhase) continue;
      const step = far ? dt * 3 : dt;
      m.computeMods();
      tickBuffs(this, m, step);
      if (m.dead) continue;
      m.flash = Math.max(0, m.flash - step);
      m.inCombat = Math.max(0, m.inCombat - step);
      if (m.atkAnim >= 0) { m.atkAnim += step / 0.35; if (m.atkAnim > 1) m.atkAnim = -1; }
      m.animT += step;
      if (this.motion(m, step)) continue;
      monsterAI(this, m, step);
      if (m.moving) m.walkT += step * 8;
    }
    for (const e of this.extraAllies) if (e.kind === 'npc' && e.computeMods) { e.computeMods(); tickBuffs(this, e, dt); }
    // cull dead monsters (after fade)
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      if (m.dead && this.time - m.deathT >= 1.4) this.monsters.splice(i, 1);
    }
    // respawns
    for (let i = this.respawns.length - 1; i >= 0; i--) {
      const r = this.respawns[i];
      if (this.time < r.t) continue;
      const m = r.mon;
      const home = m.home;
      if (dist(this.player.x, this.player.y, home.x, home.y) < 7 * M) { r.t = this.time + 3; continue; }
      this.respawns.splice(i, 1);
      if (m.spawnRef) this.spawnFrom(m.spawnRef, 0);
      else if (m.questBoss) {
        const b = this.bossSpawn.def;
        const nb = this.makeMonster(bossRow(b), 'Boss', home.x, home.y, { abilities: b.abilities, aura: m.aura, respawn: 120 });
        nb.questBoss = true; nb.addPool = m.addPool; nb.leash = m.leash;
      } else if (m.miniboss) {
        const nb = this.makeMonster(m.row, 'Named', home.x, home.y, { name: m.name, abilities: m.abilities, respawn: 150 });
        nb.miniboss = true; nb.addPool = m.addPool;
      } else if (m.questGuard) {
        const nb = this.makeMonster(m.row, m.tier, home.x, home.y, { respawn: 25 }); nb.questGuard = true;
      }
    }
    // gather respawn
    for (const o of this.objects) if (o.type === 'gather' && !o.ready && this.time > o.readyAt) o.ready = true;
    // ghosts
    for (const gh of this.ghosts) ghostAI(this, gh, dt);
    // NPC idle
    for (const n of this.npcs) { n.animT += dt; if (!this.escort || this.escort.npc !== n) n.moving = false; if (n.moving) n.walkT += dt * 8; }

    this.updateProjectiles(dt);
    this.updateZones(dt);
    this.updateTelegraphs(dt);
    this.updateEvents(dt);
    this.updateFx(dt);
    if (this.arena && !this.arena.over && this.time > this.arena.start + 240) { this.arena.over = true; this.game.arenaResult(false, 'Süre doldu'); }
  }

  /** returns true if the actor is under forced motion this frame. */
  motion(a, dt) {
    if (a.leapM) {
      const l = a.leapM;
      l.t += dt;
      const k = clamp(l.t / l.dur, 0, 1);
      a.x = l.sx + (l.tx - l.sx) * k; a.y = l.sy + (l.ty - l.sy) * k;
      a.z = Math.sin(k * Math.PI) * 70;
      if (k >= 1) { a.z = 0; a.leapM = null; if (l.onLand) l.onLand(); }
      return true;
    }
    if (a.dashM) {
      const d = a.dashM;
      d.t += dt;
      const ok = this.map.move(a, d.vx * dt, d.vy * dt);
      a.moving = true;
      if (d.onHit) for (const e of this.enemiesOf(a)) { if (d.hit.has(e)) continue; if (dist(a.x, a.y, e.x, e.y) < a.radius + (e.radius || 10) + 14) { d.hit.add(e); d.onHit(e); } }
      if (d.t >= d.dur || (!ok && d.t > 0.05)) { a.dashM = null; if (d.onEnd) d.onEnd(); }
      return true;
    }
    if (a.kb) {
      a.kb.t -= dt;
      this.map.move(a, a.kb.vx * dt, a.kb.vy * dt);
      if (a.kb.t <= 0) a.kb = null;
      return true;
    }
    return false;
  }

  updateProjectiles(dt) {
    const map = this.map;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.t += dt;
      if (p.homing && !p.homing.dead) {
        const want = angleTo(p.x, p.y, p.homing.x, p.homing.y - 16);
        const cur = Math.atan2(p.vy, p.vx);
        const na = cur + clamp(angDiff(cur, want), -6 * dt, 6 * dt);
        const sp = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
      }
      const sx = p.vx * dt, sy = p.vy * dt;
      p.x += sx; p.y += sy; p.traveled += Math.hypot(sx, sy);
      let dead = p.traveled > p.range || map.isWall(p.x, p.y + 16);
      if (!dead) {
        for (const e of this.enemiesOf(p.owner)) {
          if (p.hit.has(e)) continue;
          if (dist(p.x, p.y, e.x, e.y - 18 * (e.size || 1)) < p.radius + (e.radius || 10) + 4) {
            p.hit.add(e);
            if (p.owner && (!p.owner.dead || p.owner.kind === 'monster')) p.onHit(e);
            if (p.hit.size >= p.pierce) { dead = true; break; }
          }
        }
      }
      if (dead) { this.projectiles.splice(i, 1); if (p.kind !== 'arrow' && p.kind !== 'knife') this.fx.burst(p.x, p.y, p.color, 6, 0.6); }
    }
  }
  updateZones(dt) {
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      z.t += dt; z.tick += dt;
      if (z.tick >= z.every) {
        z.tick -= z.every;
        if (z.onEnemy) for (const e of this.inCircle(this.enemiesOf(z.owner), z.x, z.y, z.r)) z.onEnemy(e);
        if (z.ally) for (const a of this.inCircle(this.alliesOf(z.owner), z.x, z.y, z.r)) z.ally(a);
      }
      if (z.t >= z.dur || (z.owner.dead && z.owner.kind === 'monster')) this.zones.splice(i, 1);
    }
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const tr = this.traps[i];
      tr.t += dt;
      const foes = this.enemiesOf(tr.owner);
      if (tr.t > 0.4 && this.inCircle(foes, tr.x, tr.y, tr.r).length) { tr.onTrigger(foes); this.traps.splice(i, 1); audio.play('hit'); continue; }
      if (tr.t > tr.dur) this.traps.splice(i, 1);
    }
  }
  updateTelegraphs(dt) {
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const t = this.telegraphs[i];
      t.e += dt;
      if (t.owner && t.owner.dead) { this.telegraphs.splice(i, 1); continue; }
      if (t.e >= t.t) { this.telegraphs.splice(i, 1); t.onFire(t); }
    }
  }
  updateFx(dt) {
    for (let i = this.parts.length - 1; i >= 0; i--) { const p = this.parts[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.vx *= 0.96; if (p.t >= p.dur) this.parts.splice(i, 1); }
    if (this.parts.length > 700) this.parts.splice(0, this.parts.length - 700);
    for (const arr of [this.floats, this.rings, this.slashes, this.beams, this.meteors]) for (let i = arr.length - 1; i >= 0; i--) { arr[i].t += dt; if (arr[i].t >= arr[i].dur) arr.splice(i, 1); }
    for (const f of this.floats) { f.y -= 38 * dt; f.x += f.vx * dt; }
    if (this.shakeT > 0) { this.shakeT -= dt; if (this.shakeT <= 0) this.shakeA = 0; }
  }
}

const RES_TR = { Valor: 'Cesaret', Rage: 'Öfke', Focus: 'Odak', Mana: 'Mana', Faith: 'İnanç' };
export { RES_TR };

function npcLook(role, name) {
  const h = hashStr(name || role) >>> 0;
  const bodies = ['#6a4a3a', '#3a5a7a', '#7a3a4a', '#4a6a3a', '#6a5a8a', '#8a6a3a', '#3a3a4a'];
  const hairs = ['#3a2414', '#d8b070', '#1a1a1a', '#a0522d', '#d8d8d8', '#6a3a1a'];
  const hat = role === 'Blacksmith' ? 'none' : role === 'Healer' ? 'hood' : role === 'Stablemaster' ? 'hat' : (h % 5 === 0 ? 'hood' : 'none');
  return { body: bodies[h % bodies.length], trim: ['#e0c060', '#c0c0c0', '#a07040'][h % 3], hair: hairs[(h >> 3) % hairs.length], skin: ['#f2d0b0', '#e6b894', '#c8966a', '#8a5a3a'][(h >> 5) % 4], hat, apron: role === 'Blacksmith' || role === 'Craft Master' };
}

function ghostAI(w, h, dt) {
  h.computeMods();
  h.animT += dt;
  h.wanderT -= dt;
  if (h.wanderT <= 0) {
    h.wanderT = 3 + Math.random() * 7;
    if (Math.random() < 0.65) { const a = Math.random() * Math.PI * 2, r = Math.random() * 5 * M; h.to = { x: h.home.x + Math.cos(a) * r, y: h.home.y + Math.sin(a) * r }; }
    else h.to = null;
    if (Math.random() < 0.12) w.game.ui.ghostChat(h);
  }
  if (h.to) {
    const d = dist(h.x, h.y, h.to.x, h.to.y);
    if (d < 8) { h.to = null; h.moving = false; }
    else {
      const a = angleTo(h.x, h.y, h.to.x, h.to.y);
      const ox = h.x, oy = h.y;
      w.map.move(h, Math.cos(a) * 110 * dt, Math.sin(a) * 110 * dt);
      h.moving = Math.abs(h.x - ox) + Math.abs(h.y - oy) > 0.1;
      if (!h.moving) h.to = null;
      h.faceAngle = a; h.dir = dirFromAngle(a); h.walkT += dt * 9;
    }
  } else h.moving = false;
}

export const GHOST_NAMES = ['Aerith', 'Kaelen', 'Thorne', 'Miravel', 'Dusk', 'Seraphine', 'Brakka', 'Lyric', 'Vaelin', 'Oryn', 'Nyssa', 'Garruk', 'Elowyn', 'Riven', 'Talon', 'Zephyr', 'Isolde', 'Kairo', 'Fenna', 'Magnus', 'Selene', 'Rook', 'Anwen', 'Cassius', 'Ysra', 'Borin', 'Liora', 'Ashe'];
const ARENA_NAMES = ['Kan Yemini', 'Gece Gölgesi', 'Kuzey Fırtınası', 'Kızıl Şahin', 'Demir Yumruk', 'Ay Büyücüsü', 'Sessiz Ok', 'Kutsal Alev', 'Kül Kral', 'Ayaz Kurdu'];
const GUILDS = ['Şafak Muhafızları', 'Kızıl Pençe', 'Astral Düzen', 'Gece Kuzgunları', 'Demir Kök'];
export { TIER, refGear };
