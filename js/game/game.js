// Game state + player controller + services. Single-player MMO simulation of the GDD.
import { GDD } from '../data/gdd.js';
import { REGION_ORDER, REGION_META, REGION_DUNGEONS, STORY_NPCS, CLASS_TR } from '../data/content.js';
import { Hero } from './entities.js';
import { METER, autoStats, xpToNext, statPointsAt, skillPointsAt, CLASS_KIT, refGear, STATS } from './stats.js';
import { glyphOf, passiveMods, skillRangePx, behaviourOf } from './skills.js';
import { World, regionBoss, dungeonDef, RES_TR } from './world.js';
import { QuestLog, regionById } from './quests.js';
import { Inventory, makeStack, makeGear, baseFor, sumEquipment, starterGear, GEAR_SLOTS, RECIPES, recipeNeeds, tryEnhance, enhanceCost, auctionListings, sellPrice, buyPrice, merchantStock, oreFor } from './items.js';
import { dist, angleTo, clamp, uid } from '../core/util.js';
import { audio } from '../core/audio.js';
import { healActor } from './combat.js';

const M = METER;
export const SAVE_PREFIX = 'astraya_save_v1_';
for (const c in GDD.classes) for (const s of GDD.classes[c].skills) s.glyph = glyphOf(s);

export const COSTUMES = {
  CS_001: { cls: 'Knight', look: { body: '#e8e4f0', trim: '#ffd76a', cape: '#3a6ad8', metal: '#fff4d0' } },
  CS_002: { cls: 'Berserker', look: { body: '#5a0a0a', trim: '#ffcc40', cape: '#2a0000', metal: '#d0a040' } },
  CS_003: { cls: 'Assassin', look: { body: '#1a2440', trim: '#c0d8ff', cape: '#2a3a6a', hair: '#e8f0ff' } },
  CS_004: { cls: 'Ranger', look: { body: '#f0a0c8', trim: '#80e080', cape: '#ffd0e8', hair: '#ffe080' } },
  CS_005: { cls: 'Mage', look: { body: '#1a1040', trim: '#ffd76a', cape: '#3a1a8a', hair: '#c0a0ff' } },
  CS_006: { cls: 'Priest', look: { body: '#ffffff', trim: '#80d0ff', cape: '#ffd76a', hair: '#fff0c0' } },
};

export class Game {
  constructor(ui, input, renderer) {
    this.ui = ui; this.input = input; this.renderer = renderer;
    this.world = new World(this);
    this.settings = loadSettings();
    this.dps = { total: 0, mine: 0 };
    this.party = [];
    this.running = false;
  }

  // ================================================================ lifecycle
  newGame(slot, cls, name, look) {
    this.slot = slot;
    const p = new Hero({ cls, name, level: 1, stats: { ...CLASS_KIT[cls].base }, look, isPlayer: true });
    this.player = p;
    p.xp = 0; p.statPts = 0; p.skillPts = 0;
    p.skillRanks = {};
    for (const s of p.def.skills) if (s.unlock <= 1) p.skillRanks[s.id] = 1;
    p.hotbar = p.def.skills.slice(0, 8).map((s) => s.id);
    p.costume = null; p.ownedMounts = []; p.mountKind = null; p.title = null;
    this.inv = new Inventory(36);
    this.storage = new Inventory(48);
    this.eq = {};
    for (const g of starterGear(cls)) this.eq[g.slot] = g;
    this.inv.add(makeStack('POT_HP_S', 5)); this.inv.add(makeStack('POT_MP_S', 3));
    this.gold = 50; this.crystals = 300;
    this.quests = new QuestLog(this, null);
    this.unlocked = ['MAP_DAW'];
    this.partyDefs = [];
    this.arena = { rating: 1000, wins: 0, losses: 0 };
    this.stats = { kills: 0, bosses: 0, deaths: 0 };
    this.achievements = {};
    this.playTime = 0;
    this.shopOwned = {};
    this.auctionPending = [];
    this.refreshPlayer(true);
    p.resource = p.res.startEmpty ? 0 : p.maxRes;
    this.world.enter({ type: 'region', id: 'MAP_DAW', at: 'spawn' });
    this.renderer.snap(p);
    this.running = true;
    this.ui.startHUD();
    this.quests.beginStep();
    this.ui.chatSystem(`Astraya’ya hoş geldin, ${name}! Muhtar Elric seni bekliyor. (E: etkileşim)`);
    this.save();
  }

  load(slot) {
    const raw = localStorage.getItem(SAVE_PREFIX + slot);
    if (!raw) return false;
    const d = JSON.parse(raw);
    this.slot = slot;
    const p = new Hero({ cls: d.p.cls, name: d.p.name, level: d.p.level, stats: d.p.stats, look: d.p.look, isPlayer: true, skillRanks: d.p.skillRanks });
    Object.assign(p, { xp: d.p.xp, statPts: d.p.statPts, skillPts: d.p.skillPts, hotbar: d.p.hotbar, costume: d.p.costume, ownedMounts: d.p.ownedMounts || [], mountKind: d.p.mountKind, title: d.p.title });
    this.player = p;
    const fix = (it) => (it.kind === 'gear' ? { ...it, gdd: GDD.items.find((x) => x.id === it.id) } : it);
    this.inv = new Inventory(d.invSize || 36); this.inv.items = d.inv.map(fix);
    this.storage = new Inventory(d.stoSize || 48); this.storage.items = d.sto.map(fix);
    this.eq = {}; for (const k in d.eq) this.eq[k] = fix(d.eq[k]);
    this.gold = d.gold; this.crystals = d.crystals;
    this.quests = new QuestLog(this, d.quests);
    this.unlocked = d.unlocked;
    this.arena = d.arena; this.stats = d.stats; this.achievements = d.ach || {}; this.playTime = d.playTime || 0;
    this.shopOwned = d.shopOwned || {}; this.auctionPending = [];
    this.partyDefs = d.party || [];
    this.party = this.partyDefs.map((c) => this.makeCompanion(c.cls, p.level, c.name));
    this.refreshPlayer(true);
    p.hp = p.maxHp; p.resource = p.res.startEmpty ? 0 : p.maxRes;
    const loc = d.loc && REGION_ORDER.includes(d.loc.id) ? d.loc : { id: 'MAP_DAW' };
    this.world.enter({ type: 'region', id: loc.id, at: 'spawn', pos: loc.x ? { x: loc.x, y: loc.y } : null });
    this.renderer.snap(p);
    this.running = true;
    this.ui.startHUD();
    this.ui.chatSystem(`Tekrar hoş geldin, ${p.name}.`);
    return true;
  }

  save() {
    if (!this.player || !this.slot) return;
    const p = this.player;
    const strip = (it) => { const o = { ...it }; delete o.gdd; return o; };
    const w = this.world;
    const loc = w.kind === 'region' ? { id: w.regionId, x: Math.round(p.x), y: Math.round(p.y) } : { id: w.regionId || 'MAP_DAW' };
    const d = {
      v: 1, t: Date.now(),
      p: { cls: p.cls, name: p.name, level: p.level, xp: p.xp, stats: p.stats, statPts: p.statPts, skillPts: p.skillPts, skillRanks: p.skillRanks, hotbar: p.hotbar, look: p.look, costume: p.costume, ownedMounts: p.ownedMounts, mountKind: p.mountKind, title: p.title },
      inv: this.inv.items.map(strip), invSize: this.inv.size, sto: this.storage.items.map(strip), stoSize: this.storage.size,
      eq: Object.fromEntries(Object.entries(this.eq).filter(([, v]) => v).map(([k, v]) => [k, strip(v)])),
      gold: this.gold, crystals: this.crystals, quests: this.quests.toJSON(), unlocked: this.unlocked, loc,
      party: this.partyDefs, arena: this.arena, stats: this.stats, ach: this.achievements, playTime: Math.round(this.playTime), shopOwned: this.shopOwned,
      chapter: this.quests.chapter.short,
    };
    try { localStorage.setItem(SAVE_PREFIX + this.slot, JSON.stringify(d)); } catch (e) { console.warn('save failed', e); }
  }

  // ================================================================ derived stats
  refreshPlayer(full) {
    const p = this.player;
    const extra = {};
    p.gear = sumEquipment(this.eq, extra);
    p.passivePct = passiveMods(p.cls, p.level, p.def);
    if (p.buffs.some((b) => b.id === 'food')) p.passivePct.hp = (p.passivePct.hp || 0) + 0.06;
    p.recalc();
    if (full) { p.hp = p.maxHp; }
    for (const c of this.party) this.levelCompanion(c, p.level);
    this.ui.statsChanged?.();
  }
  makeCompanion(cls, level, name) {
    const h = new Hero({ cls, name: name || CLASS_TR[cls].tr, level, stats: autoStats(cls, level), ai: true });
    h.leader = this.player;
    this.levelCompanion(h, level);
    h.hp = h.maxHp;
    h.resource = h.res.startEmpty ? 0 : h.maxRes;
    return h;
  }
  levelCompanion(h, L) {
    h.level = L;
    h.stats = autoStats(h.cls, L);
    const g = refGear(L);
    h.gear = { atk: g.atk, def: g.def * 8 * 0.95, hp: g.def * 12, pct: {} };
    h.passivePct = passiveMods(h.cls, L, h.def);
    h.skillRanks = {};
    for (const s of h.def.skills) if (s.unlock <= L) h.skillRanks[s.id] = clamp(1 + Math.floor((L - s.unlock) / 12), 1, 5);
    h.recalc();
    h.followSlot = this.party.indexOf(h);
  }

  // ================================================================ progression
  gainXp(xp, src) {
    const p = this.player;
    if (p.level >= 100 || xp <= 0) return;
    p.xp += xp;
    if (src) this.world.floatText(p.x, p.y - 90, `+${xp} XP`, '#b88aff', 0.85);
    let leveled = false;
    while (p.level < 100 && p.xp >= xpToNext(p.level)) {
      p.xp -= xpToNext(p.level);
      p.level++;
      leveled = true;
      p.statPts += statPointsAt(p.level);
      p.skillPts += skillPointsAt(p.level);
      for (const s of p.def.skills) if (s.unlock === p.level || (s.unlock <= p.level && !p.skillRanks[s.id])) {
        p.skillRanks[s.id] = Math.max(1, p.skillRanks[s.id] || 0);
        const empty = p.hotbar.findIndex((x) => !x);
        if (!p.hotbar.includes(s.id)) { if (empty >= 0) p.hotbar[empty] = s.id; else if (p.hotbar.length < 8) p.hotbar.push(s.id); }
        this.ui.toast(`Yeni yetenek: ${s.name}`, '#ffd76a');
      }
      for (const pas of p.def.passives) if (pas.unlock === p.level) this.ui.toast(`Pasif açıldı: ${pas.name}`, '#9fe0ff');
      if (p.level % 5 === 0) { this.crystals += 50; this.ui.toast('+50 Astral Kristal (seviye ödülü)', '#8ae0ff'); }
      const un = GDD.levels[p.level - 1]?.unlock;
      if (un) this.ui.chatSystem(`Seviye ${p.level}: ${un}`);
    }
    if (leveled) {
      if (this.settings.autoStats) this.autoAllocate();
      this.refreshPlayer(true);
      p.resource = p.res.startEmpty ? p.resource : p.maxRes;
      this.world.fx.ring(p.x, p.y, 120, '#ffd76a', 0.8);
      this.world.fx.burst(p.x, p.y - 30, '#ffd76a', 40);
      this.world.floatText(p.x, p.y - 110, `SEVİYE ${p.level}!`, '#ffd76a', 1.8, true);
      this.ui.announce(`Seviye ${p.level}`, '#ffd76a');
      audio.play('levelup');
      this.save();
    }
    this.ui.xpChanged();
  }
  autoAllocate() {
    const p = this.player, kit = CLASS_KIT[p.cls];
    const g = Object.entries(kit.grow);
    while (p.statPts > 0) { for (const [k, v] of g) { const n = Math.min(p.statPts, v); p.stats[k] += n; p.statPts -= n; if (p.statPts <= 0) break; } }
  }
  allocate(stat) { const p = this.player; if (p.statPts <= 0) return; p.stats[stat]++; p.statPts--; this.refreshPlayer(); audio.play('ui'); }
  rankUp(skill) {
    const p = this.player;
    const r = p.rankOf(skill);
    if (r >= 5 || p.skillPts <= 0 || p.level < skill.unlock) return false;
    const need = skill.unlock + r * 4;
    if (r > 0 && p.level < need) { this.ui.toast(`Rank ${r + 1} için seviye ${need} gerekli`, '#ff9090'); return false; }
    p.skillRanks[skill.id] = r + 1; p.skillPts--;
    audio.play('buff');
    return true;
  }

  reward({ xp = 0, gold = 0, items = [], reason }) {
    if (gold) { this.gold += gold; }
    for (const it of items) this.giveItem(it);
    if (xp) this.gainXp(xp);
    this.ui.rewardToast(reason, xp, gold, items);
  }
  giveItem(it) {
    if (!this.inv.add(it)) { this.storage.add(it) ? this.ui.toast(`Envanter dolu — ${it.name} depoya gönderildi`, '#ffb070') : this.ui.toast('Envanter ve depo dolu!', '#ff6060'); return false; }
    return true;
  }
  lootDrop(loot, mon) {
    const w = this.world;
    this.gold += loot.gold;
    w.floatText(mon.x + 20, mon.y - 70, `+${loot.gold} altın`, '#ffd24a', 0.85);
    audio.play('coin');
    for (const it of loot.items) {
      this.giveItem(it);
      const rare = it.kind === 'gear' && ['Rare', 'Epic', 'Legendary', 'Mythic'].includes(it.rarity);
      this.ui.lootToast(it);
      if (rare) { w.fx.beam(mon.x, mon.y, mon.x, mon.y - 260, it.color, 1.2, 10); audio.play('epic'); }
    }
  }
  randomGear(level, extra = 0) {
    const slot = GEAR_SLOTS[(Math.random() * GEAR_SLOTS.length) | 0];
    return makeGear(baseFor(this.player.cls, slot, level), level, Math.random, extra);
  }
  achievement(id, text) {
    if (this.achievements[id]) return;
    this.achievements[id] = Date.now();
    this.crystals += 25;
    this.ui.toast(`Başarım: ${text} (+25 Kristal)`, '#8ae0ff');
  }
  unlockRegion(id) {
    if (!this.unlocked.includes(id)) this.unlocked.push(id);
    const r = regionById(id);
    this.ui.announce(`Yeni bölge açıldı: ${REGION_META[id].tr}`, '#9fe0ff');
    this.ui.chatSystem(`${REGION_META[id].tr} (Sv ${r.min}–${r.max}) artık erişilebilir. Bölge portalını veya Işınlanma Taşı’nı kullan.`);
  }
  regionBoss(id) { return regionBoss(id); }
  minibossName(id) { return this.world.minibossName(id); }
  sideGiver(regionId, i) {
    const npcs = GDD.npcs.filter((n) => n.region === regionById(regionId).name && !n.tier.includes('Unique'));
    const list = npcs.length ? npcs : [];
    if (regionId === 'MAP_DAW') return ['NPC_01_06', 'NPC_01_03', 'NPC_01_02', 'NPC_01_02', 'NPC_01_03', 'NPC_01_06', 'NPC_01_06', 'NPC_01_06'][i];
    return list[i % list.length].id;
  }
  npcMarker(n) {
    const q = this.quests;
    const st = q.step;
    if (st && q.regionId === this.world.regionId) {
      if (st.obj.talk !== undefined && q.giverOf(st).id === n.storyId) return { ch: '!', color: '#ffd23a' };
      if (st.obj.escort !== undefined && !q.main.flags.escortActive && STORY_NPCS[q.regionId][st.obj.escort].id === n.storyId) return { ch: '!', color: '#ffd23a' };
    }
    for (const id in q.side) {
      const s = q.side[id];
      if (s.state !== 'active') continue;
      if (s.giver === n.npcId && q.sideGoal(id).done) return { ch: '?', color: '#ffd23a' };
      const def = q.sideDef(id);
      if (def.type === 'Delivery' && def.target === n.storyId && s.region === this.world.regionId) return { ch: '?', color: '#ffd23a' };
    }
    if (n.npcId && q.availableSides(this.world.regionId, n.npcId).length) return { ch: '!', color: '#9fe0ff' };
    return null;
  }
  get regionId() { return this.world.regionId; }

  // ================================================================ travel
  travel(dest) {
    this.ui.loading(true, dest.type === 'region' ? REGION_META[dest.id].tr : dest.name || 'Astral Arena');
    setTimeout(() => {
      this.player.mount = null;
      this.world.enter(dest);
      this.renderer.snap(this.player);
      this.ui.loading(false);
      audio.play('portal');
      if (dest.type === 'region') {
        const r = regionById(dest.id);
        this.ui.regionTitle(REGION_META[dest.id].tr, `${REGION_META[dest.id].sub} · Sv ${r.min}–${r.max}`);
        if (this.player.level < r.min - 2) this.ui.chatSystem(`Uyarı: ${REGION_META[dest.id].tr} önerilen seviye ${r.min}+`);
      }
      this.save();
    }, 60);
  }
  enterDungeon(name) {
    const def = dungeonDef(name);
    if (this.player.level < def.level - 5) { this.ui.toast(`${name} için en az seviye ${def.level - 5} gerekli`, '#ff9090'); return; }
    this.ui.closeAll();
    this.travel({ type: 'dungeon', name, regionId: this.world.regionId });
  }
  enterArena() {
    if (this.player.level < 30) { this.ui.toast('Arena seviye 30’da açılır (GDD: Ranked 3v3)', '#ff9090'); return; }
    this.ui.closeAll();
    this.travel({ type: 'arena' });
  }
  arenaResult(win, why) {
    const a = this.arena;
    const delta = win ? 18 + Math.round(Math.random() * 8) : -(12 + Math.round(Math.random() * 6));
    a.rating = Math.max(0, a.rating + delta); win ? a.wins++ : a.losses++;
    this.ui.announce(win ? 'ZAFER!' : why || 'Yenilgi', win ? '#ffd76a' : '#ff6060');
    this.ui.chatSystem(`Arena: ${win ? 'Galibiyet' : 'Mağlubiyet'} (${delta > 0 ? '+' : ''}${delta} puan → ${a.rating})`);
    if (win) { this.gold += 60 + this.player.level * 8; this.crystals += 10; }
    setTimeout(() => {
      for (const h of this.world.heroes) if (h.team === 'ally') { h.dead = false; h.hp = h.maxHp; h.buffs = []; }
      this.player.dead = false; this.player.hp = this.player.maxHp;
      this.travel({ type: 'region', id: 'MAP_DAW', at: 'spawn' });
    }, 3500);
  }
  onPlayerDeath() {
    this.stats.deaths++;
    this.player.target = null;
    this.player.mount = null;
    if (this.world.arena) return;
    this.ui.death(true);
  }
  respawn() {
    const p = this.player;
    this.ui.death(false);
    p.dead = false; p.hp = Math.round(p.maxHp * 0.6); p.buffs = [];
    p.resource = p.res.startEmpty ? 0 : p.maxRes * 0.5;
    const w = this.world;
    if (w.kind === 'dungeon') { p.x = w.map.pois.spawn.x; p.y = w.map.pois.spawn.y; }
    else if (w.kind === 'region') { p.x = w.map.pois.spawn.x; p.y = w.map.pois.spawn.y; }
    for (const c of this.party) { if (c.dead) w.revive(c, 0.5); c.x = p.x + 20; c.y = p.y + 30; }
    for (const m of w.monsters) m.threat.delete(p);
    this.renderer.snap(p);
    audio.play('heal');
  }

  // ================================================================ player control
  update(dt) {
    if (!this.running) return;
    this.playTime += dt;
    const w = this.world, p = this.player, I = this.input;
    this.controls(dt);
    w.update(dt);
    this.questTarget = w.questTarget();
    this.renderer.follow(p, dt);
    // explore triggers
    for (const o of w.objects) if (o.type === 'explore' && dist(p.x, p.y, o.x, o.y) < o.r) this.quests.onVisit(o.id);
    // channel
    if (p.channel) {
      p.channel.t += dt;
      if (p.moving || p.dead || p.lastHitT > p.channel.start) { p.channel = null; this.ui.castbar(null); this.ui.toast('Kesildi', '#ff9090'); }
      else if (p.channel.t >= p.channel.dur) { const c = p.channel; p.channel = null; this.ui.castbar(null); c.done(); }
      else this.ui.castbar(p.channel);
    }
    // auction sales
    for (let i = this.auctionPending.length - 1; i >= 0; i--) { const a = this.auctionPending[i]; if (w.time >= a.at) { this.auctionPending.splice(i, 1); this.gold += a.gold; this.ui.toast(`Mezat: ${a.name} satıldı (+${a.gold} altın)`, '#ffd24a'); audio.play('coin'); } }
    this.autosaveT = (this.autosaveT || 0) + dt;
    if (this.autosaveT > 45) { this.autosaveT = 0; this.save(); }
  }

  controls(dt) {
    const w = this.world, p = this.player, I = this.input, R = this.renderer;
    const blocked = this.ui.blocking();
    const mw = R.screenToWorld(I.mouse.x, I.mouse.y);
    this.mouseWorld = mw;
    this.hover = this.pick(mw.x, mw.y);
    if (p.dead) { p.moving = false; return; }
    p.computeMods();
    // hotkeys
    if (!blocked) {
      if (I.hit('Tab')) this.cycleTarget();
      if (I.hit('KeyE')) this.interactNearest();
      if (I.hit('KeyQ')) this.usePotion('POT_HP_S');
      if (I.hit('KeyF')) this.usePotion('POT_MP_S');
      if (I.hit('KeyR')) this.toggleMount();
      if (I.hit('Escape')) { if (p.target) p.target = null; }
    }
    // movement
    let mx = 0, my = 0;
    if (!blocked) {
      if (I.key('KeyW') || I.key('ArrowUp')) my -= 1;
      if (I.key('KeyS') || I.key('ArrowDown')) my += 1;
      if (I.key('KeyA') || I.key('ArrowLeft')) mx -= 1;
      if (I.key('KeyD') || I.key('ArrowRight')) mx += 1;
    }
    const busy = p.dashM || p.leapM || p.kb;
    if (busy) { /* world.motion handles */ }
    else if (p.mods.stun) p.moving = false;
    else {
      if ((mx || my) && !p.mods.root) {
        const l = Math.hypot(mx, my); mx /= l; my /= l;
        const sp = p.moveSpeed * (p.atkAnim >= 0 && p.kit.attack.kind !== 'melee' ? 0.8 : 1);
        const ox = p.x, oy = p.y;
        w.map.move(p, mx * sp * dt, my * sp * dt);
        p.moving = Math.abs(p.x - ox) + Math.abs(p.y - oy) > 0.05;
        p.moveAngle = Math.atan2(my, mx);
        if (p.atkAnim < 0) p.faceAngle = p.moveAngle;
        this.autoAtk = false;
        this.moveTo = null;
        if (p.channel) p.channel.moved = true;
      } else if (this.moveTo && !p.mods.root) {
        const d = dist(p.x, p.y, this.moveTo.x, this.moveTo.y);
        if (d < this.moveTo.r) { const fn = this.moveTo.then; this.moveTo = null; p.moving = false; if (fn) fn(); }
        else {
          const a = angleTo(p.x, p.y, this.moveTo.x, this.moveTo.y);
          const ox = p.x, oy = p.y;
          w.map.move(p, Math.cos(a) * p.moveSpeed * dt, Math.sin(a) * p.moveSpeed * dt);
          p.moving = Math.abs(p.x - ox) + Math.abs(p.y - oy) > 0.05;
          if (!p.moving) this.moveTo = null;
          p.faceAngle = a; p.moveAngle = a;
        }
      } else p.moving = false;
    }
    if (p.moving) p.walkT += dt * 9;
    p.animT += dt;
    if (blocked) return;
    // dodge
    if (I.hit('ShiftLeft') || I.hit('ShiftRight') || I.hit('Space')) {
      if (p.dodgeCd <= 0 && !p.mods.stun && !p.mods.root && !busy) {
        const a = (mx || my) ? Math.atan2(my, mx) : angleTo(p.x, p.y, mw.x, mw.y);
        p.dodgeCd = 2.6;
        p.addBuff({ id: 'dodge', name: 'Yuvarlanma', dur: 0.35, iframe: true });
        w.dash(p, a, 3.6 * M, 0.26);
        p.mount = null;
        audio.play('swing');
        this.ui.dodgeUsed();
      }
    }
    // mouse
    const aim = { x: mw.x, y: mw.y, target: p.target && !p.target.dead ? p.target : null };
    if (I.mouse.leftPressed && !I.mouse.overUI) {
      const h = this.hover;
      if (h && (h.kind === 'npc' || h.kind === 'object')) { this.approach(h); }
      else if (h && h.kind === 'monster') { p.target = h; this.autoAtk = true; this.ui.targetChanged(); }
      else if (h && h.kind === 'hero' && h.team === 'enemy') { p.target = h; this.autoAtk = true; this.ui.targetChanged(); }
      else if (h && h.kind === 'hero') { p.target = h; this.ui.targetChanged(); }
    }
    if (I.mouse.rightPressed && !I.mouse.overUI) {
      const h = this.hover;
      if (h && (h.kind === 'npc' || h.kind === 'object')) this.approach(h);
      else if (h && (h.kind === 'monster' || h.kind === 'hero')) { p.target = h; this.autoAtk = h.kind === 'monster' || h.team === 'enemy'; this.ui.targetChanged(); }
      else this.moveTo = { x: mw.x, y: mw.y, r: 8 };
    }
    // attack
    if (!busy && !p.mods.stun) {
      const holding = I.mouse.left && !I.mouse.overUI && !(this.hover && (this.hover.kind === 'npc' || this.hover.kind === 'object'));
      if (holding) {
        const tgtAim = this.hover && this.hover.kind === 'monster' ? { x: this.hover.x, y: this.hover.y - 16, target: this.hover, lock: true } : aim;
        if (p.attackCd <= 0) { w.basicAttack(p, tgtAim); p.mount = null; }
      } else if (this.autoAtk && p.target && !p.target.dead && (p.target.kind === 'monster' || p.target.team === 'enemy')) {
        const t = p.target;
        const range = p.kit.attack.kind === 'melee' ? p.kit.attack.range * M + t.radius + 6 : p.kit.attack.range * M;
        const d = dist(p.x, p.y, t.x, t.y);
        if (d <= range) { if (p.attackCd <= 0) { w.basicAttack(p, { x: t.x, y: t.y - 16, target: t, lock: true }); p.mount = null; } }
        else if (!p.moving && !this.moveTo && p.kit.attack.kind === 'melee' && d < 12 * M) this.moveTo = { x: t.x, y: t.y, r: range * 0.8 };
      }
    }
    if (p.target && p.target.dead) { if (p.target.kind === 'monster') this.autoAtk = false; setTimeout(() => { if (p.target && p.target.dead) { p.target = null; this.ui.targetChanged(); } }, 600); }
    // skills 1..8
    for (let i = 0; i < 8; i++) if (I.hit('Digit' + (i + 1))) this.useSlot(i, aim);
  }

  useSlot(i, aim) {
    const p = this.player;
    const id = p.hotbar[i];
    if (!id) return;
    const s = p.def.skills.find((x) => x.id === id);
    if (!s) return;
    if (p.rankOf(s) <= 0) { this.ui.toast(`${s.name} seviye ${s.unlock}’da açılır`, '#ff9090'); return; }
    aim = aim || { x: this.mouseWorld.x, y: this.mouseWorld.y, target: p.target };
    if ((p.cooldowns[s.id] || 0) > 0) { audio.play('error'); return; }
    if (this.world.castSkill(p, s, aim)) { p.mount = null; if (!p.target || p.target.dead) { const b = behaviourOf(s); } }
  }

  pick(x, y) {
    const w = this.world;
    let best = null, bd = 1e9;
    const test = (e, r, oy = 22) => { const d = dist(x, y, e.x, e.y - oy * (e.size || 1)); if (d < r && d < bd) { bd = d; best = e; } };
    for (const m of w.monsters) if (!m.dead) test(m, 30 * m.size + 6, 22);
    for (const h of w.heroes) if (!h.dead && !h.isPlayer) test(h, 28);
    for (const n of w.npcs) test(n, 30, 26);
    for (const o of w.objects) if (!o.hidden) test(o, 36, 20);
    return best;
  }
  cycleTarget() {
    const p = this.player, w = this.world;
    const list = w.enemiesOf(p).filter((e) => dist(p.x, p.y, e.x, e.y) < 16 * M && !e.mods.stealth).sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y));
    if (!list.length) return;
    const i = list.indexOf(p.target);
    p.target = list[(i + 1) % list.length];
    this.autoAtk = false;
    this.ui.targetChanged();
    audio.play('ui');
  }
  interactNearest() {
    const p = this.player, w = this.world;
    let best = null, bd = 2.6 * M;
    for (const n of w.npcs) { const d = dist(p.x, p.y, n.x, n.y); if (d < bd) { bd = d; best = n; } }
    for (const o of w.objects) { if (o.hidden) continue; const d = dist(p.x, p.y, o.x, o.y) - (o.r || 20) * 0.6; if (d < bd) { bd = d; best = o; } }
    if (best) this.interact(best);
  }
  nearestInteractable() {
    const p = this.player, w = this.world;
    let best = null, bd = 2.6 * M;
    for (const n of w.npcs) { const d = dist(p.x, p.y, n.x, n.y); if (d < bd) { bd = d; best = n; } }
    for (const o of w.objects) { if (o.hidden || (o.type === 'gather' && !o.ready)) continue; const d = dist(p.x, p.y, o.x, o.y) - (o.r || 20) * 0.6; if (d < bd) { bd = d; best = o; } }
    return best;
  }
  approach(e) {
    const p = this.player;
    const r = e.kind === 'npc' ? 2.2 * M : (e.r || 20) + 1.4 * M;
    if (dist(p.x, p.y, e.x, e.y) <= r) this.interact(e);
    else this.moveTo = { x: e.x, y: e.y + 10, r, then: () => this.interact(e) };
  }

  interact(e) {
    const p = this.player, w = this.world, q = this.quests;
    p.mount = null;
    if (e.kind === 'npc') {
      e.dir = dirTo(e, p);
      audio.play('open');
      // escort start
      const st = q.step;
      if (st && q.regionId === w.regionId && st.obj.escort !== undefined && !q.main.flags.escortActive && STORY_NPCS[q.regionId][st.obj.escort].id === e.storyId) {
        this.ui.dialog(e, st.d, [{ label: 'Yola çıkalım', fn: () => w.startEscort(e) }, { label: 'Henüz değil' }], `${q.chapter.title} · ${st.t}`);
        return;
      }
      if (q.onTalk(e)) return;
      this.ui.npcMenu(e);
      return;
    }
    switch (e.type) {
      case 'portal': {
        if (!this.unlocked.includes(e.dest)) { this.ui.toast(`${REGION_META[e.dest].tr} kilitli — ana hikâyeyi ilerlet`, '#ff9090'); audio.play('error'); return; }
        const fwd = REGION_ORDER.indexOf(e.dest) > REGION_ORDER.indexOf(w.regionId);
        this.travel({ type: 'region', id: e.dest, at: fwd ? 'portalPrev' : 'portalNext' });
        break;
      }
      case 'waystone': this.ui.open('map'); break;
      case 'dungeon': this.ui.open('dungeons'); break;
      case 'arena': this.enterArena(); break;
      case 'craft': this.ui.open('craft'); break;
      case 'exit': this.travel({ type: 'region', id: w.regionId, at: 'dungeon' }); break;
      case 'chest': {
        w.objects = w.objects.filter((o) => o !== e);
        const L = e.level;
        const items = [this.randomGear(L + 1, 1), this.randomGear(L + 1, 1)];
        if (e.raid) items.push(this.randomGear(L + 2, 2));
        items.push(makeStack(oreFor(L), 3), makeStack('POT_HP_S', 3));
        if (Math.random() < 0.5) items.push(makeStack('SCROLL_PROTECT', 1));
        this.reward({ xp: Math.round(xpToNext(Math.min(99, p.level)) * 0.25 * this.settings.xpRate), gold: 100 + L * 25, items, reason: 'Zindan sandığı' });
        audio.play('epic');
        break;
      }
      case 'gather': {
        if (!e.ready) return;
        this.channel(e.label, 1.4, () => {
          e.ready = false; e.readyAt = w.time + 45;
          const L = regionById(w.regionId).min;
          const id = e.gkind === 'herb' ? 'MAT_HERB' : e.gkind === 'ore' ? (L >= 50 ? 'MAT_SKYIRON' : L >= 22 ? 'MAT_IRON' : 'MAT_COPPER') : (w.map.theme.key === 'void' ? 'MAT_VOID' : 'MAT_SKYIRON');
          const n = 1 + (Math.random() < 0.4 ? 1 : 0);
          this.giveItem(makeStack(id, n));
          this.ui.toast(`+${n} ${makeStack(id).name}`, '#9fe0a0');
          audio.play('gather');
          q.onGather();
        });
        break;
      }
      case 'clue': {
        this.channel('Araştırılıyor', 1.8, () => {
          w.objects = w.objects.filter((o) => o !== e);
          (q.main.flags.clues ||= []).push(e.idx);
          const lines = ['Toprakta taze mor kristal tozu…', 'Kült sembolü kazınmış bir taş.', 'Aceleyle bırakılmış bir mektup parçası.'];
          this.ui.toast(lines[e.idx % 3], '#ffe8a0');
          audio.play('quest');
          q.advance();
        });
        break;
      }
      case 'rune': {
        this.channel('Etkinleştiriliyor', 2.2, () => {
          w.objects = w.objects.filter((o) => o !== e);
          (q.main.flags.acts ||= []).push(e.idx);
          w.fx.beam(e.x, e.y - 50, e.x, e.y - 400, '#9f7fff', 1.2, 14);
          w.fx.ring(e.x, e.y, 120, '#9f7fff', 0.8);
          audio.play('holy');
          q.advance();
        });
        break;
      }
      case 'defendStart': w.startDefend(e); break;
      case 'eventStart': w.objects = w.objects.filter((o) => o !== e); w.startEvent({ x: e.x, y: e.y }); break;
    }
  }
  channel(label, dur, done) {
    const p = this.player;
    p.channel = { label, dur, t: 0, done, start: this.world.time };
    p.lastHitT = -1;
  }
  usePotion(id) {
    const p = this.player, w = this.world;
    const key = id === 'POT_HP_S' ? 'potHp' : 'potRes';
    if ((p.cooldowns[key] || 0) > 0) { audio.play('error'); return; }
    if (!this.inv.count(id)) { this.ui.toast(`${makeStack(id).name} kalmadı`, '#ff9090'); audio.play('error'); return; }
    this.inv.take(id, 1);
    p.cooldowns[key] = id === 'POT_HP_S' ? 8 : 12;
    if (id === 'POT_HP_S') healActor(w, null, p, p.maxHp * 0.35);
    else { p.resource = Math.min(p.maxRes, p.resource + p.maxRes * 0.4); w.floatText(p.x, p.y - 52, `+${RES_TR[p.resourceName]}`, '#8ab0ff'); }
    w.fx.burst(p.x, p.y - 20, id === 'POT_HP_S' ? '#ff6060' : '#6090ff', 12);
    audio.play('heal');
    this.ui.invChanged();
  }
  useItem(it) {
    const p = this.player;
    if (it.id === 'POT_HP_S' || it.id === 'POT_MP_S') return this.usePotion(it.id);
    if (it.id === 'FLASK_POWER') { this.inv.take(it.id, 1); p.addBuff({ id: 'flask', name: 'Güç Şişesi', dur: 300, mods: { dmg: 0.1 }, color: '#ff8a2a' }); audio.play('buff'); this.ui.invChanged(); return; }
    if (it.id === 'FOOD') { this.inv.take(it.id, 1); p.addBuff({ id: 'food', name: 'Avcı Güveci', dur: 600, color: '#c8904a' }); this.refreshPlayer(); audio.play('buff'); this.ui.invChanged(); return; }
    if (it.kind === 'gear') this.equip(it);
  }
  equip(it) {
    const p = this.player;
    if (it.cls !== p.cls) { this.ui.toast(`Bu eşya ${CLASS_TR[it.cls].tr} sınıfına ait`, '#ff9090'); audio.play('error'); return; }
    if (it.req > p.level) { this.ui.toast(`Seviye ${it.req} gerekli`, '#ff9090'); audio.play('error'); return; }
    const old = this.eq[it.slot];
    this.inv.remove(it);
    this.eq[it.slot] = it;
    if (old) this.inv.add(old);
    this.refreshPlayer();
    audio.play('buff');
    this.ui.invChanged();
  }
  unequip(slot) {
    const it = this.eq[slot];
    if (!it) return;
    if (this.inv.free <= 0) { this.ui.toast('Envanter dolu', '#ff9090'); return; }
    this.eq[slot] = null; this.inv.add(it);
    this.refreshPlayer(); this.ui.invChanged();
  }
  sell(it) {
    const g = sellPrice(it) * (it.qty || 1);
    this.inv.remove(it, it.qty || 1);
    this.gold += g;
    audio.play('coin');
    this.ui.invChanged();
  }
  buy(it, n = 1) {
    const cost = buyPrice(it) * n;
    if (this.gold < cost) { this.ui.toast('Yetersiz altın', '#ff9090'); audio.play('error'); return false; }
    const copy = it.stack ? makeStack(it.id, n) : { ...it, uid: uid() };
    if (!this.inv.add(copy)) { this.ui.toast('Envanter dolu', '#ff9090'); return false; }
    this.gold -= cost; audio.play('coin'); this.ui.invChanged();
    return true;
  }
  enhance(it) {
    if (it.plus >= 10) return;
    const c = enhanceCost(it);
    if (this.gold < c.gold || this.inv.count(c.mat) < c.qty) { this.ui.toast('Malzeme veya altın yetersiz', '#ff9090'); audio.play('error'); return; }
    const protect = this.settings.useProtect && it.plus >= 6 && this.inv.count('SCROLL_PROTECT') > 0;
    this.gold -= c.gold; this.inv.take(c.mat, c.qty);
    if (protect) this.inv.take('SCROLL_PROTECT', 1);
    const r = tryEnhance(it, protect);
    const msg = { success: [`Başarılı! +${it.plus}`, '#6dff8a', 'levelup'], fail: ['Başarısız — seviye korundu', '#ffb070', 'error'], drop: [`Başarısız! Seviye düştü (+${it.plus})`, '#ff6060', 'hurt'], protected: ['Başarısız — Koruma Parşömeni seviyeyi korudu', '#9fe0ff', 'buff'] }[r];
    this.ui.toast(msg[0], msg[1]); audio.play(msg[2]);
    if (r === 'success' && it.plus >= 7) this.ui.chatSystem(`${this.player.name}, ${it.name} eşyasını +${it.plus} yaptı!`);
    this.refreshPlayer(); this.ui.invChanged();
  }
  craft(rec) {
    const p = this.player;
    if (p.level < rec.level) return;
    const { needs, gold } = recipeNeeds(rec, p);
    for (const id in needs) if (this.inv.count(id) < needs[id]) { this.ui.toast('Malzeme yetersiz', '#ff9090'); audio.play('error'); return; }
    if (this.gold < gold) { this.ui.toast('Yetersiz altın', '#ff9090'); return; }
    for (const id in needs) this.inv.take(id, needs[id]);
    this.gold -= gold;
    const out = rec.out(p);
    this.giveItem(out);
    this.ui.toast(`Üretildi: ${out.name}${out.qty > 1 ? ' ×' + out.qty : ''}`, '#6dff8a');
    audio.play('gather');
    this.quests.onCraft(rec);
    this.ui.invChanged();
  }
  auction() {
    const seed = Math.floor(this.world.time / 300) + 17 + this.player.level * 31;
    if (!this._auc || this._aucSeed !== seed) { this._auc = auctionListings(this.player.level, this.player.cls, seed); this._aucSeed = seed; }
    return this._auc;
  }
  auctionBuy(l) {
    if (this.gold < l.price) { this.ui.toast('Yetersiz altın', '#ff9090'); return; }
    if (!this.giveItem(l.item)) return;
    this.gold -= l.price;
    this._auc = this._auc.filter((x) => x !== l);
    audio.play('coin'); this.ui.invChanged();
  }
  auctionSell(it) {
    const price = Math.round(sellPrice(it) * (it.qty || 1) * 1.8 * 0.95);
    this.inv.remove(it, it.qty || 1);
    this.auctionPending.push({ name: it.name, gold: price, at: this.world.time + 20 + Math.random() * 60 });
    this.ui.toast(`${it.name} mezata kondu (~${price} altın, %5 komisyon)`, '#ffd24a');
    this.ui.invChanged();
  }
  hire(cls) {
    if (this.party.length >= 3) { this.ui.toast('Parti dolu (en fazla 3 yoldaş)', '#ff9090'); return; }
    const cost = 40 + this.player.level * 12;
    if (this.gold < cost) { this.ui.toast(`Yetersiz altın (${cost})`, '#ff9090'); return; }
    this.gold -= cost;
    const used = new Set(this.party.map((h) => h.name));
    const names = COMPANION_NAMES[cls].filter((n) => !used.has(n));
    const h = this.makeCompanion(cls, this.player.level, names[0] || CLASS_TR[cls].tr);
    this.party.push(h);
    this.partyDefs.push({ cls, name: h.name });
    h.followSlot = this.party.length - 1;
    const p = this.player;
    h.x = p.x + 30; h.y = p.y + 30; h.map = this.world.map; h.team = 'ally';
    this.world.heroes.push(h);
    this.ui.toast(`${h.name} (${CLASS_TR[cls].tr}) partiye katıldı`, '#6dff8a');
    audio.play('quest');
    this.ui.partyChanged();
    this.save();
  }
  dismiss(h) {
    this.party = this.party.filter((x) => x !== h);
    this.partyDefs = this.party.map((x) => ({ cls: x.cls, name: x.name }));
    this.party.forEach((x, i) => (x.followSlot = i));
    this.world.heroes = this.world.heroes.filter((x) => x !== h);
    this.ui.partyChanged();
    this.save();
  }
  toggleMount() {
    const p = this.player;
    if (p.mount) { p.mount = null; return; }
    if (!p.mountKind) { this.ui.toast('Binek yok — Ahır Ustası’ndan (Sv 20) veya Kristal Mağazası’ndan edinebilirsin', '#ff9090'); return; }
    if (p.inCombat > 0) { this.ui.toast('Savaşta binek çağrılamaz', '#ff9090'); return; }
    if (this.world.kind !== 'region') { this.ui.toast('Burada binek kullanılamaz', '#ff9090'); return; }
    this.channel('Binek çağrılıyor', 1, () => { p.mount = { kind: p.mountKind, speed: 0.6 }; audio.play('buff'); });
  }
  applyLook() {
    const p = this.player;
    const base = { ...CLASS_KIT[p.cls].look, ...(p.baseLook || {}) };
    p.look = p.costume && COSTUMES[p.costume] ? { ...base, ...COSTUMES[p.costume].look, hair: p.baseLook?.hair || base.hair, skin: p.baseLook?.skin || base.skin } : base;
  }
  buyShop(item) {
    if (this.shopOwned[item.id] && item.duration !== 'One use') { this.ui.toast('Zaten sahipsin', '#ff9090'); return; }
    if (this.crystals < item.price) { this.ui.toast('Yetersiz Astral Kristal', '#ff9090'); audio.play('error'); return; }
    const p = this.player;
    if (item.category === 'Costume' && COSTUMES[item.id].cls !== p.cls) { this.ui.toast('Bu kostüm başka bir sınıf için', '#ff9090'); return; }
    this.crystals -= item.price;
    this.shopOwned[item.id] = true;
    if (item.category === 'Costume') { p.baseLook ||= { hair: p.look.hair, skin: p.look.skin, body: p.look.body }; p.costume = item.id; this.applyLook(); }
    if (item.category === 'Mount') { const k = item.id === 'CS_010' ? 'stag' : 'drake'; if (!p.ownedMounts.includes(k)) p.ownedMounts.push(k); p.mountKind = k; }
    if (item.id === 'CS_020') this.inv.size += 24;
    if (item.id === 'CS_021') this.storage.size += 24;
    if (item.id === 'CS_030') { p.title = 'Sezon Öncüsü'; }
    if (item.id === 'CS_040') { this.ui.promptName((n) => { if (n) { p.name = n; this.ui.statsChanged(); this.save(); } }); }
    audio.play('epic');
    this.ui.toast(`${item.name} satın alındı`, '#8ae0ff');
    this.save();
  }
}

function dirTo(n, p) { const a = angleTo(n.x, n.y, p.x, p.y); return Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? (Math.cos(a) < 0 ? 1 : 2) : Math.sin(a) < 0 ? 3 : 0; }

const COMPANION_NAMES = {
  Knight: ['Sir Aldric', 'Dame Elara', 'Sir Bennet'], Berserker: ['Ragnar', 'Hilde', 'Thorvald'], Assassin: ['Vex', 'Shira', 'Kestrel'],
  Ranger: ['Fenwick', 'Aria', 'Lark'], Mage: ['Orrin', 'Celestra', 'Mordan'], Priest: ['Sister Liora', 'Brother Amos', 'Mother Ysel'],
};

export function loadSettings() {
  const def = { master: 0.7, music: 0.45, sfx: 0.8, xpRate: 1, autoStats: true, shake: 1, weather: true, useProtect: true, showDps: false };
  try { return { ...def, ...JSON.parse(localStorage.getItem('astraya_settings') || '{}') }; } catch { return def; }
}
export function saveSettings(s) { localStorage.setItem('astraya_settings', JSON.stringify(s)); }
export function listSaves() {
  const out = [];
  for (let i = 1; i <= 3; i++) {
    const raw = localStorage.getItem(SAVE_PREFIX + i);
    if (!raw) { out.push(null); continue; }
    try { const d = JSON.parse(raw); out.push({ slot: i, name: d.p.name, cls: d.p.cls, level: d.p.level, t: d.t, region: d.loc?.id, chapter: d.chapter, look: d.p.look }); } catch { out.push(null); }
  }
  return out;
}
export { REGION_DUNGEONS, RECIPES, STATS };
