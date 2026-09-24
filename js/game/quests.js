// Main story (GDD main_quests.csv MQ_0R_0S → CHAPTERS narrative) and side quests (side_quests.csv).
import { GDD } from '../data/gdd.js';
import { CHAPTERS, REGION_ORDER, STORY_NPCS, SIDE_TEMPLATES, REGION_META, MINIBOSS_EPITHETS } from '../data/content.js';
import { xpToNext } from './stats.js';
import { questItem, makeStack } from './items.js';
import { audio } from '../core/audio.js';

export const regionById = (id) => GDD.regions.find((r) => r.id === id);
export const regionMonsters = (id) => { const r = regionById(id); return GDD.monsters.filter((m) => m.region === r.name); };
export const TYPE_TR = { Talk: 'Konuş', Kill: 'Avla', Collect: 'Topla', Investigate: 'Araştır', Defend: 'Savun', Escort: 'Eşlik Et', Activate: 'Etkinleştir', Boss: 'Boss', Delivery: 'Teslimat', Craft: 'Üret', Explore: 'Keşfet', Bounty: 'Ödül Avı', Event: 'Etkinlik', MiniBoss: 'Mini Boss' };

export function mainRow(regionIdx, step) { return GDD.mainQuests[regionIdx * 8 + step]; }

export class QuestLog {
  constructor(game, data) {
    this.game = game;
    this.main = data?.main || { r: 0, s: 0, p: 0, flags: {}, done: false };
    this.side = data?.side || {};
    this.completed = new Set(data?.completed || []);
  }
  toJSON() { return { main: this.main, side: this.side, completed: [...this.completed] }; }

  // ---------------------------------------------------------------- main quest
  get regionId() { return REGION_ORDER[this.main.r]; }
  get chapter() { return CHAPTERS[this.regionId]; }
  get step() { return this.main.done ? null : this.chapter.steps[this.main.s]; }
  get row() { return mainRow(this.main.r, this.main.s); }
  giverOf(step, regionId = this.regionId) { return STORY_NPCS[regionId][step.g] || STORY_NPCS[regionId][0]; }

  mainGoal() {
    const st = this.step;
    if (!st) return null;
    const o = st.obj;
    const mons = regionMonsters(this.regionId);
    const p = this.main.p;
    if (o.talk !== undefined) return { text: `${this.giverOf(st).name} ile konuş`, done: false };
    if (o.kill !== undefined) return { text: `${mons[o.kill].name} avla (${p}/${o.n})`, done: p >= o.n };
    if (o.collect !== undefined) return { text: `${o.item} topla (${p}/${o.n}) — ${mons[o.collect].name}`, done: p >= o.n };
    if (o.investigate) return { text: `İpuçlarını araştır (${p}/3)`, done: p >= 3 };
    if (o.defend) return { text: this.main.flags.defendActive ? `Dalgaları püskürt (${p}/${o.waves})` : 'Savunma noktasına git ve başlat', done: p >= o.waves };
    if (o.escort !== undefined) return { text: this.main.flags.escortActive ? `${STORY_NPCS[this.regionId][o.escort].name} kişisini koru` : `${STORY_NPCS[this.regionId][o.escort].name} ile yola çık`, done: p >= 1 };
    if (o.activate) return { text: `Kadim mühürleri etkinleştir (${p}/${o.activate})`, done: p >= o.activate };
    if (o.boss) return { text: `${this.game.regionBoss(this.regionId).name} kişisini yen`, done: p >= 1 };
    if (o.raid) return { text: `${o.raid} baskınını tamamla`, done: p >= 1 };
    return { text: st.t, done: false };
  }

  advance(n = 1) {
    this.main.p += n;
    const g = this.mainGoal();
    this.game.ui.questChanged();
    if (g && g.done) this.completeStep();
  }

  completeStep() {
    const st = this.step, row = this.row;
    const L = row ? row.level : 1;
    const boss = !!(st.obj.boss || st.obj.raid);
    const xp = Math.round(xpToNext(Math.min(99, L)) * (boss ? 0.9 : 0.4) * this.game.settings.xpRate);
    const gold = Math.round((30 + L * 12) * (boss ? 4 : 1));
    this.completed.add(row.id);
    this.game.reward({ xp, gold, reason: `Görev tamamlandı: ${st.t}` });
    audio.play('quest');
    // clear quest items
    if (st.obj.collect !== undefined) this.game.inv.take('Q_' + st.obj.item, this.game.inv.count('Q_' + st.obj.item));
    this.main.p = 0; this.main.flags = {};
    this.main.s++;
    if (this.main.s >= 8) {
      const ch = this.chapter;
      this.game.ui.chapterComplete(ch);
      this.main.s = 0;
      this.main.r++;
      if (this.main.r >= REGION_ORDER.length) { this.main.r = REGION_ORDER.length - 1; this.main.s = 7; this.main.done = true; this.game.ui.gameComplete(); }
      else this.game.unlockRegion(REGION_ORDER[this.main.r]);
    }
    if (!this.main.done) this.beginStep();
    this.game.world.syncQuest();
    this.game.ui.questChanged();
    this.game.save();
  }

  beginStep() {
    const st = this.step;
    if (!st) return;
    const giver = this.giverOf(st);
    const row = this.row;
    if (st.obj.talk === undefined) this.game.ui.questPopup(giver, st, row);
    else this.game.ui.toast(`Yeni görev: ${st.t}`, '#ffd76a');
  }

  // ---------------------------------------------------------------- events
  onTalk(npc) {
    let handled = false;
    // main quest talk
    const st = this.step;
    if (st && this.game.regionId === this.regionId && st.obj.talk !== undefined && this.giverOf(st).id === npc.storyId) {
      this.game.ui.dialog(npc, st.d, [{ label: 'Kabul ediyorum', fn: () => this.completeStep() }], `${this.chapter.title} · ${st.t}`);
      return true;
    }
    // side quests: turn in / delivery
    for (const id in this.side) {
      const q = this.side[id];
      if (q.state !== 'active') continue;
      const def = this.sideDef(id);
      if (def.type === 'Delivery' && npc.storyId && npc.storyId === def.target && q.region === this.game.regionId) { q.p = 1; this.turnIn(id, npc); return true; }
      if (npc.npcId === q.giver && this.sideGoal(id).done) { this.turnIn(id, npc); return true; }
    }
    return handled;
  }
  onKill(mon) {
    const st = this.step;
    if (st && this.game.regionId === this.regionId) {
      const mons = regionMonsters(this.regionId);
      const o = st.obj;
      if (o.kill !== undefined && mon.gddId === mons[o.kill].id) this.advance();
      else if (o.collect !== undefined && mon.gddId === mons[o.collect].id && Math.random() < 0.7) {
        this.game.inv.add(questItem(o.item, 1, this.row.id));
        this.game.ui.toast(`+1 ${o.item}`, '#c89aff');
        this.advance();
      } else if (o.boss && mon.questBoss) this.advance();
    }
    if (st && o_raid(st) && mon.raidFinal) this.advance();
    for (const id in this.side) {
      const q = this.side[id];
      if (q.state !== 'active' || q.region !== this.game.regionId) continue;
      const def = this.sideDef(id);
      if (def.type === 'Kill' && mon.gddId === def.mobId) this.sideProgress(id);
      if (def.type === 'Bounty' && mon.elite && !mon.boss && mon.tier === 'Elite') this.sideProgress(id);
      if (def.type === 'MiniBoss' && mon.miniboss) this.sideProgress(id);
    }
  }
  onGather() {
    for (const id in this.side) {
      const q = this.side[id];
      if (q.state === 'active' && q.region === this.game.regionId && this.sideDef(id).type === 'Collect') this.sideProgress(id);
    }
  }
  onCraft(rec) {
    for (const id in this.side) {
      const q = this.side[id];
      if (q.state === 'active' && this.sideDef(id).type === 'Craft' && rec.prof === 'Alchemy') this.sideProgress(id, 2);
    }
  }
  onVisit(poiId) {
    for (const id in this.side) {
      const q = this.side[id];
      if (q.state !== 'active' || q.region !== this.game.regionId || this.sideDef(id).type !== 'Explore') continue;
      q.seen ||= [];
      if (!q.seen.includes(poiId)) { q.seen.push(poiId); this.sideProgress(id); this.game.ui.toast(`Keşfedildi (${q.seen.length}/3)`, '#9fe0ff'); }
    }
  }
  onEvent(kind) {
    for (const id in this.side) {
      const q = this.side[id];
      if (q.state === 'active' && q.region === this.game.regionId && this.sideDef(id).type === 'Event' && kind === 'event') this.sideProgress(id);
    }
  }

  // ---------------------------------------------------------------- side quests
  sidesFor(regionId) {
    const r = regionById(regionId);
    return GDD.sideQuests.filter((q) => q.region === r.name);
  }
  sideDef(id) {
    const row = GDD.sideQuests.find((q) => q.id === id);
    const regionId = GDD.regions.find((r) => r.name === row.region).id;
    const idx = +id.slice(-2) - 1;
    const mons = regionMonsters(regionId);
    const t = row.type;
    let def = { id, row, type: t, regionId, level: row.level, n: 1 };
    if (t === 'Kill') { const m = mons[[0, 1, 2, 3, 4, 5][idx % 6]]; Object.assign(def, SIDE_TEMPLATES.Kill(m.name), { mobId: m.id, n: 10, goal: `${m.name} avla` }); }
    if (t === 'Collect') Object.assign(def, SIDE_TEMPLATES.Collect('ot ve maden'), { n: 5, goal: 'Kaynak topla (ot/maden)' });
    if (t === 'Delivery') { const tg = STORY_NPCS[regionId][STORY_NPCS[regionId].length - 1]; Object.assign(def, SIDE_TEMPLATES.Delivery(tg.name), { target: tg.id, goal: `Paketi ${tg.name} kişisine götür` }); }
    if (t === 'Craft') Object.assign(def, SIDE_TEMPLATES.Craft(), { n: 2, goal: 'Zanaat tezgâhında Can İksiri üret' });
    if (t === 'Explore') Object.assign(def, SIDE_TEMPLATES.Explore(), { n: 3, goal: 'Haritadaki keşif noktalarını bul' });
    if (t === 'Bounty') { const m = mons[6]; Object.assign(def, SIDE_TEMPLATES.Bounty(m.name), { n: 3, goal: 'Elit yaratık avla' }); }
    if (t === 'Event') Object.assign(def, SIDE_TEMPLATES.Event(), { n: 1, goal: 'Nöbet noktasında dalgaları püskürt' });
    if (t === 'MiniBoss') { const name = this.game.minibossName(regionId); Object.assign(def, SIDE_TEMPLATES.MiniBoss(name), { n: 1, goal: `${name} kişisini yen` }); }
    return def;
  }
  sideGoal(id) {
    const q = this.side[id], def = this.sideDef(id);
    return { text: `${def.goal} (${Math.min(q.p, def.n)}/${def.n})`, done: q.p >= def.n };
  }
  availableSides(regionId, npcId) {
    return this.sidesFor(regionId).filter((row, i) => !this.side[row.id] && !this.completed.has(row.id) && this.game.sideGiver(regionId, i) === npcId && this.game.player.level >= row.level - 3);
  }
  accept(id, npcId) {
    const def = this.sideDef(id);
    this.side[id] = { state: 'active', p: 0, giver: npcId, region: def.regionId };
    audio.play('quest');
    this.game.ui.toast(`Yan görev alındı: ${def.t}`, '#9fe0ff');
    this.game.ui.questChanged();
    this.game.world.syncQuest();
  }
  sideProgress(id, n = 1) {
    const q = this.side[id];
    q.p += n;
    const def = this.sideDef(id);
    if (q.p >= def.n && !q.notified) { q.notified = true; this.game.ui.toast(`${def.t}: tamamlandı — teslim et`, '#6dff8a'); audio.play('quest'); }
    this.game.ui.questChanged();
  }
  turnIn(id, npc) {
    const def = this.sideDef(id);
    const L = def.level;
    const xp = Math.round(xpToNext(Math.min(99, L)) * 0.3 * this.game.settings.xpRate);
    const gold = Math.round(20 + L * 9);
    const items = [];
    if (def.type === 'Craft' || def.type === 'Collect') items.push(makeStack('POT_HP_S', 3));
    if (def.type === 'MiniBoss' || def.type === 'Bounty') items.push(this.game.randomGear(L + 1, 1));
    delete this.side[id];
    this.completed.add(id);
    this.game.ui.dialog(npc, 'Harika iş çıkardın! Al bakalım, hak ettin.', [], def.t);
    this.game.reward({ xp, gold, items, reason: `Yan görev: ${def.t}` });
    audio.play('quest');
    this.game.ui.questChanged();
    this.game.save();
  }
  abandon(id) { delete this.side[id]; this.game.ui.questChanged(); this.game.world.syncQuest(); }
}
function o_raid(st) { return !!st.obj.raid; }
export { MINIBOSS_EPITHETS, REGION_META };
