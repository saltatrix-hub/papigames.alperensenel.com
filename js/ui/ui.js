import { GDD } from '../data/gdd.js';
import { CLASS_TR, REGION_META, REGION_ORDER, TIPS, RARITY, SLOT_TR } from '../data/content.js';
import { listSaves, SAVE_PREFIX, COSTUMES, loadSettings, saveSettings, REGION_DUNGEONS } from '../game/game.js';
import { CLASS_KIT, STATS, STAT_TR, xpToNext } from '../game/stats.js';
import { RECIPES, recipeNeeds, merchantStock, affixText, gearStats, MATERIAL_TR, PROF_TR } from '../game/items.js';
import { dungeonDef, RES_TR } from '../game/world.js';
import { drawHero, itemIcon, skillIcon } from '../render/sprites.js';
import { ELEMENT } from '../game/skills.js';
import { $, $$, el, esc, fmt, fmtFull } from '../core/util.js';
import { audio } from '../core/audio.js';

const UI_PNG = 'assets/ui/kenney-rpg/PNG';
const DOLL_ROWS = [
  ['', 'Head', ''],
  ['MainHand', 'HERO', 'Cape'],
  ['Gloves', 'Chest', 'Necklace'],
  ['', 'Legs', 'Ring'],
  ['', 'Boots', ''],
];

const HAIR = ['#8a5a2e', '#1a1a24', '#e8c070', '#dcdce6', '#f0d8a0', '#3a2414', '#d8d8d8', '#c05a2a', '#6a3a1a'];
const SKIN = ['#f2d0b0', '#e6b894', '#e8c8a8', '#f0d4b8', '#f6dcc4', '#c89060', '#8d5a3a', '#f8e0c8'];
const FACE = {
  Knight: 'assets/art/class_knight_face.jpg', Berserker: 'assets/art/class_berserker_face.jpg',
  Assassin: 'assets/art/class_assassin_face.jpg', Ranger: 'assets/art/class_ranger_face.jpg',
  Mage: 'assets/art/class_mage_face.jpg', Priest: 'assets/art/class_priest_face.jpg',
};
const SHOP_TR = {
  CS_001: 'Şövalye — Göksel Muhafız Kostümü', CS_002: 'Berserker — Kızıl Kral Kostümü',
  CS_003: 'Suikastçı — Ay Işığı Avcısı', CS_004: 'Korucu — Çiçek Perisi',
  CS_005: 'Büyücü — Kozmik Kâhin', CS_006: 'Rahip — Kutsal Uyum',
  CS_010: 'Hayalet Geyik Bineği', CS_011: 'Çöl Ejderi Bineği',
  CS_020: 'Envanter +24 yuva', CS_021: 'Depo sekmesi',
  CS_030: 'Sezon Premium Geçişi', CS_040: 'İsim Değiştirme',
};
const GREET = {
  lore: 'Astraya’nın mühürleri zayıflıyor. Yardımın şart.',
  shop: 'İhtiyacın olan her şey burada — doğru fiyata.',
  smith: 'Çeliği konuştururum. Getir, güçlendirelim.',
  alchemy: 'Otlar, iksirler, biraz da duman. Ne arıyorsun?',
  storage: 'Eşyaların bende güvende. Al, bırak.',
  auction: 'Pazar bugün hareketli. Al ya da sat.',
  guild: 'Yoldaş mı arıyorsun? Lonca kiralık kahraman tutar.',
  trainer: 'Sınıfını bil, sınırını aş. Bir yoldaş da tutabilirsin.',
  stable: 'İyi bir binek, iyi bir yolculuk demektir.',
  stylist: 'Kristallerin varsa görünüşün değişir — gücün değil.',
  healer: 'Yaraların derin. Otur, ışık işini yapsın.',
  bounty: 'Tahtada iş var. Altın da var.',
  faction: 'İttifak her kılıca ihtiyaç duyar.',
  dungeon: 'Zindanın ağzı açık. Hazırsan gir.',
  craft: 'Tezgâh sıcak. Üret, donan, ilerle.',
  endgame: 'Kapının gölgesinde nadir şeyler satılır.',
};

export class UI {
  constructor() {
    this.game = null;
    this.input = null;
    this.playing = false;
    this.dialogOpen = false;
    this.dead = false;
    this.promptOpen = false;
    this.panels = {};
    this.create = { slot: 1, cls: 'Knight', hair: CLASS_KIT.Knight.look.hair, skin: CLASS_KIT.Knight.look.skin };
    this.titleT = 0;
    this.dodgeFlash = 0;
    this.boss = null;
    this.bossCastT = 0;
    this.drag = null;
  }

  bind(game, input) {
    this.game = game;
    this.input = input;
    this.buildTitle();
    this.bindHud();
    this.bindKeys();
    this.chatSystem('Astraya bekliyor. Bir sınıf seç ve Dawnwatch’a uyan.');
  }

  // ================================================================ title
  buildTitle() {
    const grid = $('#class-grid');
    grid.innerHTML = '';
    for (const cls of Object.keys(CLASS_TR)) {
      const b = el('button', 'class-card' + (cls === this.create.cls ? ' active' : ''));
      b.innerHTML = `<img src="${FACE[cls]}" alt="${CLASS_TR[cls].tr}" /><span>${CLASS_TR[cls].tr}</span>`;
      b.onclick = () => { this.create.cls = cls; this.create.hair = CLASS_KIT[cls].look.hair; this.create.skin = CLASS_KIT[cls].look.skin; this.refreshCreate(); };
      grid.appendChild(b);
    }
    const hs = $('#hair-swatches'), ss = $('#skin-swatches');
    hs.innerHTML = ''; ss.innerHTML = '';
    for (const c of HAIR) {
      const b = el('button', 'swatch'); b.style.background = c;
      b.onclick = () => { this.create.hair = c; this.refreshCreate(); };
      hs.appendChild(b);
    }
    for (const c of SKIN) {
      const b = el('button', 'swatch'); b.style.background = c;
      b.onclick = () => { this.create.skin = c; this.refreshCreate(); };
      ss.appendChild(b);
    }
    $('#btn-start').onclick = () => this.startNew();
    $('#hero-name').value = '';
    this.refreshSlots();
    this.refreshCreate();
  }

  refreshSlots() {
    const box = $('#slots');
    box.innerHTML = '';
    const saves = listSaves();
    saves.forEach((s, i) => {
      const n = i + 1;
      const b = el('button', 'slot' + (this.create.slot === n ? ' active' : ''));
      if (s) {
        b.innerHTML = `<div><b>${esc(s.name)}</b><small>${CLASS_TR[s.cls].tr} · Sv ${s.level}${s.chapter ? ' · ' + esc(s.chapter) : ''}</small></div>`;
        b.onclick = () => { this.create.slot = n; this.refreshSlots(); this.boot(() => this.game.load(n) || this.toast('Kayıt okunamadı', '#ff9090')); };
        b.oncontextmenu = (e) => {
          e.preventDefault();
          if (confirm(`${s.name} kaydını sil?`)) { localStorage.removeItem(SAVE_PREFIX + n); this.refreshSlots(); }
        };
      } else {
        b.innerHTML = `<div><b>Yuva ${n}</b><small>Boş — yeni kahraman</small></div>`;
        b.onclick = () => { this.create.slot = n; this.refreshSlots(); };
      }
      box.appendChild(b);
    });
  }

  refreshCreate() {
    $$('#class-grid .class-card').forEach((el, i) => el.classList.toggle('active', Object.keys(CLASS_TR)[i] === this.create.cls));
    $('#class-blurb').textContent = CLASS_TR[this.create.cls].blurb;
    $$('#hair-swatches .swatch').forEach((el, i) => el.classList.toggle('active', HAIR[i] === this.create.hair));
    $$('#skin-swatches .swatch').forEach((el, i) => el.classList.toggle('active', SKIN[i] === this.create.skin));
    this.drawPreview($('#preview'), this.create.cls, this.look());
  }

  look() {
    const base = { ...CLASS_KIT[this.create.cls].look };
    return { ...base, hair: this.create.hair, skin: this.create.skin };
  }

  drawPreview(cv, cls, look, t = this.titleT) {
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, cv.width, cv.height);
    try {
      drawHero(ctx, cv.width / 2, cv.height * 0.82, cls, look, 0, { walk: t * 3, attack: -1, time: t, moving: true }, 2.6);
    } catch (err) { console.warn('preview', err); }
  }

  startNew() {
    const name = ($('#hero-name').value || '').trim() || CLASS_TR[this.create.cls].tr;
    audio.init();
    this.boot(() => this.game.newGame(this.create.slot, this.create.cls, name.slice(0, 16), this.look()));
  }

  boot(fn) {
    audio.init();
    const s = this.game.settings || loadSettings();
    audio.setVolumes(s.sfx * s.master, s.music * s.master);
    fn();
  }

  // ================================================================ HUD bind
  bindHud() {
    $$('.dock [data-panel]').forEach((b) => b.onclick = () => this.open(b.dataset.panel));
    const on = (id, fn) => { const n = $(id); if (n) n.onclick = fn; };
    const hpIco = itemIcon({ id: 'POT_HP_S', kind: 'potion', color: '#e03a3a' });
    const mpIco = itemIcon({ id: 'POT_MP_S', kind: 'potion', color: '#3c7cf0' });
    const hpBtn = $('#util-hp'), mpBtn = $('#util-mp');
    if (hpBtn && !hpBtn.querySelector('img')) hpBtn.insertAdjacentHTML('afterbegin', `<img src="${hpIco}" alt="">`);
    if (mpBtn && !mpBtn.querySelector('img')) mpBtn.insertAdjacentHTML('afterbegin', `<img src="${mpIco}" alt="">`);
    on('#util-hp', () => this.game.usePotion('POT_HP_S'));
    on('#util-mp', () => this.game.usePotion('POT_MP_S'));
    on('#util-dodge', () => this.input.pressed.add('ShiftLeft'));
    on('#util-mount', () => this.game.toggleMount());
    $('#chat-in')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const t = e.target.value.trim();
        if (t) { this.chatLine(this.game.player.name, t); e.target.value = ''; }
      }
    });
    on('#pm-ok', () => this.finishPrompt(true));
    on('#pm-cancel', () => this.finishPrompt(false));
    on('#minimap', () => this.open('map'));
  }

  bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.code === 'Escape') e.target.blur();
        return;
      }
      if (!this.playing) {
        if (e.code === 'Enter' || e.code === 'Space') this.startNew();
        return;
      }
      const map = { KeyC: 'char', KeyI: 'inv', KeyK: 'skills', KeyN: 'skills', KeyJ: 'quests', KeyL: 'quests', KeyM: 'map', KeyP: 'social', KeyO: 'settings', KeyB: 'shop' };
      if (e.code === 'Escape') {
        if (this.dialogOpen) { this.closeDialog(); return; }
        if (Object.keys(this.panels).length) { this.closeAll(); return; }
        this.open('settings');
        return;
      }
      if (e.code === 'Enter' && !this.dialogOpen) { $('#chat-in').focus(); e.preventDefault(); }
      if (e.code === 'KeyF' && e.ctrlKey) { e.preventDefault(); document.documentElement.requestFullscreen?.(); }
      if (map[e.code] && !this.blocking()) this.open(map[e.code]);
    });
  }

  // ================================================================ lifecycle API
  startHUD() {
    this.playing = true;
    $('#title').classList.add('hidden');
    $('#hud').classList.remove('hidden');
    this.closeAll();
    this.refreshAll();
    this.chatSystem(`${this.game.player.name}, Dawnwatch seni bekliyor.`);
  }

  blocking() { return !this.playing || this.dialogOpen || this.dead || this.promptOpen; }

  closeAll() {
    for (const id in this.panels) this.panels[id].remove();
    this.panels = {};
    this.closeDialog();
  }

  loading(on, name) {
    $('#loading').classList.toggle('hidden', !on);
    if (name) $('#load-name').textContent = name;
  }

  death(on) {
    this.dead = !!on;
    $('#death').classList.toggle('hidden', !on);
  }

  // ================================================================ tick
  tickTitle(dt) {
    this.titleT += dt;
    this.drawPreview($('#preview'), this.create.cls, this.look(), this.titleT);
  }

  tick(dt) {
    const g = this.game, p = g.player;
    if (!p) return;
    this.dodgeFlash = Math.max(0, this.dodgeFlash - dt);
    this.updateBars();
    this.updateHotbar();
    this.updateTarget();
    this.updateBoss();
    this.updatePrompt();
    this.updateMinimap();
    this.drawPortrait($('#portrait'), p);
  }

  updateBars() {
    const p = this.game.player;
    $('#hud-name').textContent = p.name;
    $('#hud-title').textContent = p.title || '';
    $('#hud-class').textContent = CLASS_TR[p.cls].tr;
    $('#hud-level').textContent = p.level;
    setBar($('#bar-hp'), $('#txt-hp'), p.hp, p.maxHp);
    setBar($('#bar-res'), $('#txt-res'), p.resource, p.maxRes, `${RES_TR[p.resourceName]} ${fmt(p.resource)}/${fmt(p.maxRes)}`);
    const need = xpToNext(p.level);
    setBar($('#bar-xp'), null, p.xp, need || 1);
    $('#txt-xp').textContent = p.level >= 100 ? 'Seviye 100' : `${fmt(p.xp)} / ${fmt(need)} XP`;
    $('#hud-gold').textContent = fmt(this.game.gold);
    $('#hud-crystals').textContent = fmt(this.game.crystals);
    $('#bar-res').style.background = `linear-gradient(90deg, ${p.res.color}, #fff)`;
    this.renderBuffs();
    this.renderParty();
  }

  renderBuffs() {
    const box = $('#buffs');
    const p = this.game.player;
    box.innerHTML = p.buffs.slice(0, 10).map((b) =>
      `<div class="buff" style="border-color:${b.color || '#ffd76a'}" title="${esc(b.name)}">${esc((b.name || '?').slice(0, 3))}<small>${Math.ceil(b.dur - b.t)}</small></div>`
    ).join('');
  }

  renderParty() {
    const box = $('#party');
    box.innerHTML = this.game.party.map((h) =>
      `<div class="mate"><b>${esc(h.name)}</b> <small>${CLASS_TR[h.cls].tr}</small><div class="bar hp slim"><i style="width:${pct(h.hp, h.maxHp)}%"></i></div></div>`
    ).join('');
  }

  updateHotbar() {
    const p = this.game.player;
    const box = $('#hotbar');
    if (box.childElementCount !== 8) {
      box.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const b = el('button', 'slot-key');
        b.onclick = () => this.game.useSlot(i, { x: this.game.mouseWorld?.x || p.x, y: this.game.mouseWorld?.y || p.y, target: p.target });
        box.appendChild(b);
      }
    }
    [...box.children].forEach((b, i) => {
      const id = p.hotbar[i];
      const s = id && p.def.skills.find((x) => x.id === id);
      if (!s) {
        if (b.dataset.sid !== '') {
          b.dataset.sid = '';
          b.className = 'slot-key empty';
          b.innerHTML = `<span class="key">${i + 1}</span>`;
        }
        return;
      }
      const r = p.rankOf(s);
      const cd = p.cooldowns[s.id] || 0;
      if (b.dataset.sid !== s.id) {
        b.dataset.sid = s.id;
        const ico = skillIcon(s, CLASS_KIT[p.cls].look.body, ELEMENT[p.cls]);
        b.innerHTML = `<span class="key">${i + 1}</span><img class="sk-ico" src="${ico}" alt=""><div class="cd hidden"></div>`;
        b.onmouseenter = (e) => this.tip(e, `<b>${esc(s.name)}</b><br>${esc(s.desc)}<br><small>Sv ${s.unlock} · Rank ${r}/5 · ${s.type}</small>`);
        b.onmouseleave = () => this.tip();
      }
      b.className = 'slot-key' + (r <= 0 ? ' locked' : '');
      const cdEl = b.querySelector('.cd');
      if (cdEl) {
        cdEl.classList.toggle('hidden', cd <= 0);
        if (cd > 0) cdEl.textContent = cd.toFixed(1);
      }
    });
    const hpCd = p.cooldowns.potHp || 0, mpCd = p.cooldowns.potRes || 0;
    $('#util-hp').querySelector('span').textContent = `Can ×${this.game.inv.count('POT_HP_S')}`;
    $('#util-mp').querySelector('span').textContent = `Kaynak ×${this.game.inv.count('POT_MP_S')}`;
    paintCd($('#util-hp'), hpCd, 8);
    paintCd($('#util-mp'), mpCd, 12);
    paintCd($('#util-dodge'), p.dodgeCd, 2.6);
  }

  updateTarget() {
    const t = this.game.player.target;
    const box = $('#target');
    if (!t || t.dead) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    $('#tg-name').textContent = t.name;
    $('#tg-lvl').textContent = t.level ? `Sv ${t.level}` : '';
    setBar($('#tg-hp'), $('#tg-hp-txt'), t.hp, t.maxHp);
  }

  updateBoss() {
    const box = $('#boss');
    if (!this.boss || this.boss.dead) { box.classList.add('hidden'); this.boss = null; return; }
    box.classList.remove('hidden');
    $('#boss-name').textContent = this.boss.name;
    setBar($('#boss-hp'), $('#boss-hp-txt'), this.boss.hp, this.boss.maxHp);
    const cast = $('#boss-cast');
    if (this.bossCastT > 0) this.bossCastT -= 1 / 60;
    cast.classList.toggle('hidden', this.bossCastT <= 0);
  }

  updatePrompt() {
    const n = this.game.nearestInteractable?.();
    const box = $('#prompt');
    if (!n) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.textContent = `E — ${n.name || n.label || n.title || 'Etkileşim'}`;
  }

  updateMinimap() {
    const cv = $('#minimap'), ctx = cv.getContext('2d');
    const w = this.game.world, map = w.map, p = this.game.player;
    if (!map) return;
    ctx.fillStyle = '#0a0e16'; ctx.fillRect(0, 0, cv.width, cv.height);
    const sx = cv.width / map.pw, sy = cv.height / map.ph;
    ctx.fillStyle = '#1a2438'; ctx.fillRect(0, 0, cv.width, cv.height);
    for (const n of w.npcs) { ctx.fillStyle = '#ffd76a'; ctx.fillRect(n.x * sx - 1, n.y * sy - 1, 3, 3); }
    for (const m of w.monsters) if (!m.dead) { ctx.fillStyle = m.boss ? '#ff6a3a' : '#e05050'; ctx.fillRect(m.x * sx - 1, m.y * sy - 1, m.boss ? 4 : 2, m.boss ? 4 : 2); }
    const qt = this.game.questTarget;
    if (qt) { ctx.strokeStyle = '#ffd76a'; ctx.beginPath(); ctx.arc(qt.x * sx, qt.y * sy, 5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = '#6dff8a'; ctx.beginPath(); ctx.arc(p.x * sx, p.y * sy, 3, 0, Math.PI * 2); ctx.fill();
  }

  drawPortrait(cv, hero) {
    if (!cv || !hero) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#121018'; ctx.fillRect(0, 0, cv.width, cv.height);
    drawHero(ctx, cv.width / 2, cv.height * 0.92, hero.cls, hero.look, 0, { walk: 0, attack: -1, time: this.game.world.time, moving: false }, 1.35);
  }

  // ================================================================ feedback
  toast(msg, color = '#e8eef7') {
    const t = el('div', 'toast', esc(msg));
    t.style.color = color;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  announce(text, color = '#ffd76a') {
    const a = $('#announce');
    a.textContent = text; a.style.color = color; a.classList.remove('hidden');
    clearTimeout(this._ann); this._ann = setTimeout(() => a.classList.add('hidden'), 2800);
  }
  chatSystem(msg) { this.chatLine('Sistem', msg, 'sys'); }
  chatLine(who, msg, cls = '') {
    const log = $('#chat-log');
    const line = el('div', cls, `<b>${esc(who)}:</b> ${esc(msg)}`);
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    while (log.children.length > 80) log.firstChild.remove();
  }
  xpChanged() { /* bars tick */ }
  statsChanged() { if (this.panels.char) this.fillChar(this.panels.char); }
  invChanged() {
    if (this.panels.inv) this.fillInv(this.panels.inv);
    if (this.panels.storage) this.fillStorage(this.panels.storage);
    if (this.panels.enhance) this.fillEnhance(this.panels.enhance);
    if (this.panels.craft) this.fillCraft(this.panels.craft);
  }
  partyChanged() { this.renderParty(); if (this.panels.social) this.fillSocial(this.panels.social); }
  targetChanged() { this.updateTarget(); }
  questChanged() { this.fillTracker(); if (this.panels.quests) this.fillQuests(this.panels.quests); }
  mapChanged() { this.fillTracker(); if (this.panels.map) this.fillMap(this.panels.map); }
  skillUsed() { /* hotbar cooldown paints on tick */ }
  ghostChat(h) {
    const lines = ['İyi avlar.', 'Mühürler titriyor…', 'Parti aranır.', 'Zindan bu gece.', 'Dawnwatch’a dönüyorum.'];
    this.chatLine(h.name || 'Gezgin', lines[(Math.random() * lines.length) | 0]);
  }
  dodgeUsed() { this.dodgeFlash = 0.3; }
  regionTitle(title, sub) {
    const elr = $('#region-title');
    elr.classList.remove('hidden');
    elr.innerHTML = `<b>${esc(title)}</b><span>${esc(sub)}</span>`;
    elr.style.animation = 'none'; void elr.offsetWidth; elr.style.animation = '';
    this.chatSystem(`${title} — ${sub}`);
  }
  rewardToast(reason, xp, gold, items) {
    this.toast(`${reason}${xp ? `  +${fmt(xp)} XP` : ''}${gold ? `  +${fmt(gold)} altın` : ''}`, '#ffd76a');
    for (const it of items || []) this.lootToast(it);
  }
  lootToast(it) {
    const c = it.color || RARITY[it.rarity]?.color || '#fff';
    const n = el('div', 'loot', `<img src="${itemIcon(it)}" alt=""> ${esc(it.name)}${it.qty > 1 ? ' ×' + it.qty : ''}${it.plus ? ' +' + it.plus : ''}`);
    n.style.color = c;
    $('#loots').appendChild(n);
    this.chatLine('Ganimet', `${it.name}${it.qty > 1 ? ' ×' + it.qty : ''}`, 'loot');
    setTimeout(() => n.remove(), 3500);
  }
  castbar(ch) {
    const bar = $('#castbar');
    if (!ch) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    bar.querySelector('i').style.width = pct(ch.t, ch.dur) + '%';
    bar.querySelector('span').textContent = ch.label;
  }
  fillTracker() {
    const q = this.game.quests;
    const g = q.mainGoal();
    const sides = Object.keys(q.side).filter((id) => q.side[id].state === 'active').slice(0, 3);
    $('#tracker').innerHTML = `
      <h3>${esc(q.chapter.short)}</h3>
      <div class="goal">${g ? esc(q.step.t) + ' — ' + esc(g.text) : 'Ana hikâye tamamlandı.'}</div>
      ${sides.map((id) => `<div class="side">${esc(q.sideGoal(id).text)}</div>`).join('')}`;
  }
  refreshAll() {
    this.updateBars(); this.updateHotbar(); this.fillTracker(); this.questChanged();
  }

  bossBar(m) { this.boss = m; }
  bossCast(m, ab) {
    this.boss = m;
    this.bossCastT = 1.6;
    const c = $('#boss-cast');
    c.classList.remove('hidden');
    c.querySelector('span').textContent = ab;
    c.querySelector('i').style.width = '100%';
  }

  // ================================================================ dialog
  dialog(npc, text, choices = [], title) {
    this.dialogOpen = true;
    $('#dialog').classList.remove('hidden');
    $('#dlg-name').textContent = npc?.name || 'Bilinmeyen';
    $('#dlg-sub').textContent = title || npc?.title || '';
    $('#dlg-text').textContent = text;
    const face = $('#dlg-face');
    const ctx = face.getContext('2d');
    ctx.clearRect(0, 0, face.width, face.height);
    if (npc?.look) drawHero(ctx, 32, 58, 'npc', npc.look, 0, { walk: 0, attack: -1, time: 0, moving: false }, 1.1);
    const box = $('#dlg-choices');
    box.innerHTML = '';
    const list = choices.length ? choices : [{ label: 'Kapat' }];
    for (const c of list) {
      const b = el('button', 'btn', esc(c.label));
      b.onclick = () => { this.closeDialog(); c.fn?.(); };
      box.appendChild(b);
    }
  }
  closeDialog() {
    this.dialogOpen = false;
    $('#dialog').classList.add('hidden');
  }
  questPopup(giver, st) {
    this.dialog({ name: giver.name, title: 'Hikâye', look: giver.look }, st.d, [{ label: 'Anlaşıldı' }], st.t);
  }
  chapterComplete(ch) {
    this.announce(ch.short, '#ffd76a');
    this.dialog({ name: 'Astraya', title: 'Bölüm Bitti', look: CLASS_KIT.Priest.look }, ch.outro, [{ label: 'Devam' }], ch.title);
  }
  gameComplete() {
    this.announce('Kapı kapandı… fakat gök hatırladı.', '#c89aff');
    this.dialog({ name: 'Malzor', title: 'Epilog', look: CLASS_KIT.Mage.look }, 'Malzor yenildi. Mühürler yeniden bağlandı — ama göksel savaş bitmedi. Sezon 2 bekliyor.', [{ label: 'Astraya yaşasın' }]);
  }
  npcMenu(e) {
    const g = this.game, q = g.quests;
    const choices = [];
    for (const row of q.availableSides(g.world.regionId, e.npcId)) {
      choices.push({ label: `Görev: ${q.sideDef(row.id).t}`, fn: () => q.accept(row.id, e.npcId) });
    }
    const svc = e.service;
    if (svc === 'shop' || svc === 'alchemy' || svc === 'endgame') choices.push({ label: 'Alışveriş', fn: () => this.openMerchant(svc) });
    if (svc === 'smith') choices.push({ label: 'Güçlendir', fn: () => this.open('enhance') });
    if (svc === 'storage') choices.push({ label: 'Depo', fn: () => this.open('storage') });
    if (svc === 'auction') choices.push({ label: 'Mezat Salonu', fn: () => this.open('auction') });
    if (svc === 'guild' || svc === 'trainer') choices.push({ label: 'Yoldaş Kirala', fn: () => this.open('social') });
    if (svc === 'stable') choices.push({ label: 'Ahır', fn: () => this.openStable() });
    if (svc === 'stylist') choices.push({ label: 'Kristal Mağaza', fn: () => this.open('shop') });
    if (svc === 'healer') choices.push({
      label: 'İyileş (ücretsiz)',
      fn: () => { g.player.hp = g.player.maxHp; g.player.resource = g.player.res.startEmpty ? g.player.resource : g.player.maxRes; audio.play('heal'); this.toast('Yaraların sarıldı', '#6dff8a'); },
    });
    if (svc === 'dungeon') choices.push({ label: 'Zindanlar', fn: () => this.open('dungeons') });
    if (svc === 'craft') choices.push({ label: 'Zanaat Tezgâhı', fn: () => this.open('craft') });
    if (svc === 'bounty' || svc === 'faction') choices.push({ label: 'Görevler', fn: () => this.open('quests') });
    choices.push({ label: 'Hoşça kal' });
    this.dialog(e, GREET[svc] || GREET.lore, choices, e.title);
  }
  openStable() {
    const p = this.game.player;
    if (p.level < 20) { this.toast('Binekler seviye 20’de açılır (GDD: Mount quest)', '#ff9090'); return; }
    if (!p.ownedMounts.includes('stag')) p.ownedMounts.push('stag');
    p.mountKind = p.mountKind || 'stag';
    this.toast('Ahır: Gri geyik bineğin hazır. R ile çağır.', '#6dff8a');
    this.game.save();
  }
  promptName(fn) {
    this.promptOpen = true;
    this._promptFn = fn;
    $('#prompt-modal').classList.remove('hidden');
    $('#pm-in').value = this.game.player.name;
    $('#pm-in').focus();
  }
  finishPrompt(ok) {
    $('#prompt-modal').classList.add('hidden');
    this.promptOpen = false;
    const n = $('#pm-in').value.trim().slice(0, 16);
    if (ok && n) this._promptFn?.(n);
    this._promptFn = null;
  }

  // ================================================================ panels
  open(id) {
    if (this.panels[id]) { this.panels[id].remove(); delete this.panels[id]; audio.play('close'); return; }
    audio.play('open');
    const panel = el('div', `panel rpg panel-${id}`);
    panel.dataset.ui = '1';
    panel.style.left = (100 + Object.keys(this.panels).length * 28) + 'px';
    panel.style.top = (64 + Object.keys(this.panels).length * 20) + 'px';
    const titles = {
      char: 'Karakter', inv: 'Envanter', skills: 'Yetenekler', quests: 'Görevler', map: 'Dünya Haritası',
      social: 'Parti & Yoldaşlar', shop: 'Kristal Mağaza', settings: 'Ayarlar', dungeons: 'Zindanlar',
      craft: 'Zanaat', auction: 'Mezat', enhance: 'Güçlendirme', storage: 'Depo', merchant: 'Tüccar',
    };
    panel.innerHTML = `<header><h2>${titles[id] || id}</h2><button class="x" type="button"><img src="${UI_PNG}/iconCross_brown.png" alt="×"></button></header><div class="body"></div>`;
    panel.querySelector('.x').onclick = () => this.open(id);
    this.makeDrag(panel);
    $('#panels').appendChild(panel);
    this.panels[id] = panel;
    this.fillPanel(id, panel);
  }
  fillPanel(id, panel) {
    const fill = {
      char: () => this.fillChar(panel), inv: () => this.fillInv(panel), skills: () => this.fillSkills(panel),
      quests: () => this.fillQuests(panel), map: () => this.fillMap(panel), social: () => this.fillSocial(panel),
      shop: () => this.fillShop(panel), settings: () => this.fillSettings(panel), dungeons: () => this.fillDungeons(panel),
      craft: () => this.fillCraft(panel), auction: () => this.fillAuction(panel), enhance: () => this.fillEnhance(panel),
      storage: () => this.fillStorage(panel),
    };
    fill[id]?.();
  }
  makeDrag(panel) {
    const hd = panel.querySelector('header');
    hd.onmousedown = (e) => {
      if (e.target.closest('button')) return;
      this.drag = { panel, x: e.clientX - panel.offsetLeft, y: e.clientY - panel.offsetTop };
      const move = (ev) => {
        if (!this.drag) return;
        panel.style.left = (ev.clientX - this.drag.x) + 'px';
        panel.style.top = (ev.clientY - this.drag.y) + 'px';
      };
      const up = () => { this.drag = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    };
  }

  fillChar(panel) {
    const p = this.game.player, d = p.derived;
    panel.querySelector('.body').innerHTML = `
      <div class="sheet">
        <div class="doll" id="doll"></div>
        <div class="sheet-meta">
          <p><b>${esc(p.name)}</b><br>${CLASS_TR[p.cls].tr} · Sv ${p.level}<br>${esc(p.def.identity)}</p>
          <div class="stats-list" id="stat-box"></div>
          <p class="hint">Kalan stat puanı: <b>${p.statPts}</b></p>
          <p>Saldırı ${fmt(d.atk)} · Zırh ${fmt(d.def)} · Büyü Def ${fmt(d.mdef)}</p>
          <p>Kritik %${d.crit.toFixed(1)} · Kaçınma %${d.dodge.toFixed(1)}</p>
          <p>Can ${fmt(p.maxHp)} · ${RES_TR[p.resourceName]} ${fmt(p.maxRes)}</p>
          <p>Oyun süresi ${fmtTime(this.game.playTime)} · Öldürme ${this.game.stats.kills} · Ölüm ${this.game.stats.deaths}</p>
          <p class="hint">${TIPS[(p.level + this.game.stats.kills) % TIPS.length]}</p>
        </div>
      </div>`;
    this.paintDoll(panel.querySelector('#doll'), (s) => this.game.unequip(s));
    const box = panel.querySelector('#stat-box');
    for (const s of STATS) {
      const row = el('div', 'stat-row', `<span>${STAT_TR[s]}</span><b>${p.stats[s]} ${p.statPts > 0 ? '<button data-s="' + s + '">+</button>' : ''}</b>`);
      box.appendChild(row);
    }
    box.querySelectorAll('button').forEach((b) => b.onclick = () => { this.game.allocate(b.dataset.s); this.fillChar(panel); });
  }

  fillInv(panel) {
    const g = this.game;
    const filter = panel.dataset.filter || 'all';
    const body = panel.querySelector('.body');
    body.innerHTML = `
      <div class="inv-layout">
        <div>
          <div class="doll" id="doll"></div>
          <div class="inv-wallet">
            <span>🪙 <b>${fmt(g.gold)}</b></span>
            <span>✦ <b>${fmt(g.crystals)}</b></span>
            <span>${g.inv.items.length}/${g.inv.size}</span>
          </div>
        </div>
        <div>
          <div class="tabs" id="inv-tabs">
            <button type="button" data-f="all" class="${filter === 'all' ? 'on' : ''}">Tümü</button>
            <button type="button" data-f="gear" class="${filter === 'gear' ? 'on' : ''}">Ekipman</button>
            <button type="button" data-f="use" class="${filter === 'use' ? 'on' : ''}">Tüketim</button>
            <button type="button" data-f="mat" class="${filter === 'mat' ? 'on' : ''}">Malzeme</button>
          </div>
          <div class="grid-inv" id="invg"></div>
          <p class="hint">Sol tık kullan / kuşan · sağ tık sat</p>
        </div>
      </div>`;
    this.paintDoll(body.querySelector('#doll'), (s) => g.unequip(s));
    body.querySelectorAll('#inv-tabs button').forEach((b) => {
      b.onclick = () => { panel.dataset.filter = b.dataset.f; this.fillInv(panel); };
    });
    this.drawBag(body.querySelector('#invg'), g.inv, (it) => g.useItem(it), filter);
  }

  fillStorage(panel) {
    const g = this.game;
    const body = panel.querySelector('.body');
    body.innerHTML = `
      <p class="hint">Tıkla: çanta ↔ kasa. Sağ tık satmaz — eşya kasaya gider.</p>
      <div class="vault">
        <div class="vault-col bag"><h3>Çanta</h3><div class="grid-inv" id="a"></div><div class="vault-cap">${g.inv.items.length}/${g.inv.size}</div></div>
        <img class="vault-xfer" src="${UI_PNG}/arrowBrown_right.png" alt="">
        <div class="vault-col chest"><h3>Depo</h3><div class="grid-inv" id="b"></div><div class="vault-cap">${g.storage.items.length}/${g.storage.size}</div></div>
      </div>`;
    this.drawBag(body.querySelector('#a'), g.inv, (it) => { if (this.moveStack(g.inv, g.storage, it)) this.fillStorage(panel); }, 'all', false);
    this.drawBag(body.querySelector('#b'), g.storage, (it) => { if (this.moveStack(g.storage, g.inv, it)) this.fillStorage(panel); }, 'all', false);
  }

  paintDoll(root, onUnequip) {
    if (!root) return;
    const g = this.game, p = g.player;
    root.innerHTML = '';
    for (const row of DOLL_ROWS) {
      const line = el('div', 'doll-row');
      for (const key of row) {
        if (key === 'HERO') {
          const hero = el('div', 'doll-hero');
          hero.innerHTML = `<img src="${FACE[p.cls]}" alt="${CLASS_TR[p.cls].tr}"><div class="doll-tag">${esc(p.name)} · Sv ${p.level}</div>`;
          line.appendChild(hero);
        } else if (!key) {
          line.appendChild(el('div', 'eq-gap'));
        } else {
          line.appendChild(this.eqSlot(key, g.eq[key], () => onUnequip(key)));
        }
      }
      root.appendChild(line);
    }
  }

  eqSlot(slot, it, onClick) {
    const cell = el('button', `eq-slot r-${it?.rarity || 'empty'}${it ? '' : ' empty'}`);
    cell.innerHTML = `<img src="${it ? itemIcon(it) : this.slotGlyph(slot)}" alt=""><small>${SLOT_TR[slot]}</small>${it?.plus ? `<em>+${it.plus}</em>` : ''}`;
    if (it) {
      cell.onmouseenter = (e) => this.tip(e, this.itemTip(it));
      cell.onmouseleave = () => this.tip();
      cell.onclick = onClick;
    }
    return cell;
  }

  slotGlyph(slot) {
    return itemIcon({ slot, kind: 'gear', rarity: 'Common', color: '#7a6a50', cls: this.game?.player?.cls || 'Knight' });
  }

  drawBag(grid, inv, onUse, filter = 'all', sell = true) {
    grid.innerHTML = '';
    const shown = inv.items.filter((it) => this.matchFilter(it, filter));
    for (let i = 0; i < inv.size; i++) {
      const it = shown[i];
      const c = el('button', it ? `cell r-${it.rarity || 'Common'}` : 'cell empty');
      if (it) {
        const badge = it.qty > 1 ? it.qty : (it.plus ? '+' + it.plus : '');
        c.innerHTML = `<img src="${itemIcon(it)}" alt="">${badge ? `<span class="qty">${badge}</span>` : ''}`;
        c.onmouseenter = (e) => this.tip(e, this.itemTip(it));
        c.onmouseleave = () => this.tip();
        c.onclick = () => onUse(it);
        c.oncontextmenu = (ev) => { ev.preventDefault(); if (sell) this.game.sell(it); else onUse(it); };
      }
      grid.appendChild(c);
    }
  }

  moveStack(from, to, it) {
    const n = it.qty || 1;
    const canMerge = !!(it.stack && to.items.some((i) => i.stack && i.id === it.id));
    if (!canMerge && to.free <= 0) { this.toast('Yer yok', '#ff9090'); return false; }
    from.remove(it, n);
    if (!to.add(it)) { from.add(it); return false; }
    return true;
  }

  matchFilter(it, filter) {
    if (filter === 'gear') return it.kind === 'gear';
    if (filter === 'use') return it.kind === 'potion' || it.kind === 'flask' || it.kind === 'scroll';
    if (filter === 'mat') return it.kind === 'material' || it.kind === 'quest';
    return true;
  }

  itemLabel(it) { return `${esc(it.name)}${it.plus ? ' +' + it.plus : ''}`; }
  itemChip(it) {
    return `<span class="it-chip"><img src="${itemIcon(it)}" alt=""><span><b style="color:${it.color || RARITY[it.rarity]?.color || '#fff'}">${this.itemLabel(it)}</b><small>${RARITY[it.rarity]?.tr || ''} ${it.slot ? SLOT_TR[it.slot] : (it.kind || '')}</small></span></span>`;
  }
  itemTip(it) {
    const s = it.kind === 'gear' ? gearStats(it) : null;
    return `<div class="tip-top"><img src="${itemIcon(it)}" alt=""><div><b style="color:${it.color || RARITY[it.rarity]?.color}">${esc(it.name)}${it.plus ? ' +' + it.plus : ''}</b><br>` +
      `${RARITY[it.rarity]?.tr || ''} ${it.slot ? SLOT_TR[it.slot] : it.kind}</div></div>` +
      (s ? `Atk ${s.atk} · Def ${s.def} · HP ${s.hp}<br>${it.affixes.map(affixText).join('<br>')}` : esc(it.desc || '')) +
      `<br><small>Değer ${it.value || 0} · sağ tık sat</small>`;
  }

  fillSkills(panel) {
    const p = this.game.player;
    panel.querySelector('.body').innerHTML = p.def.skills.map((s) => {
      const r = p.rankOf(s);
      const ico = skillIcon(s, CLASS_KIT[p.cls].look.body, ELEMENT[p.cls]);
      return `<div class="skill-row"><img class="sk-ico" src="${ico}" alt=""><div><b>${esc(s.name)}</b> <small>Sv ${s.unlock} · ${s.type}</small><br>${esc(s.desc)} · Rank ${r}/5</div>
        <button class="btn" data-id="${s.id}" ${p.skillPts <= 0 || r >= 5 || p.level < s.unlock ? 'disabled' : ''}>Yükselt</button></div>`;
    }).join('') + `<p class="hint">Yetenek puanı: ${p.skillPts}</p>` +
      p.def.passives.map((x) => `<div class="skill-row"><div><b>${esc(x.name)}</b> <small>Sv ${x.unlock}</small><br>${esc(x.effect || x.desc || '')}</div><span>${p.level >= x.unlock ? 'Açık' : 'Kilitli'}</span></div>`).join('');
    panel.querySelectorAll('button[data-id]').forEach((b) => b.onclick = () => {
      const s = p.def.skills.find((x) => x.id === b.dataset.id);
      if (this.game.rankUp(s)) this.fillSkills(panel);
    });
  }

  fillQuests(panel) {
    const q = this.game.quests;
    const g = q.mainGoal();
    const sides = Object.entries(q.side);
    panel.querySelector('.body').innerHTML = `
      <h3>${esc(q.chapter.title)}</h3>
      <p>${esc(q.chapter.intro)}</p>
      <p><b>${q.step ? esc(q.step.t) : 'Tamamlandı'}</b><br>${g ? esc(g.text) : ''}</p>
      <h3>Yan görevler</h3>
      ${sides.length ? sides.map(([id, s]) => `<div class="skill-row"><div>${esc(q.sideGoal(id).text)}</div><button data-ab="${id}">Bırak</button></div>`).join('') : '<p class="hint">Aktif yan görev yok. NPC’lerde ! işaretine bak.</p>'}`;
    panel.querySelectorAll('[data-ab]').forEach((b) => b.onclick = () => { q.abandon(b.dataset.ab); this.fillQuests(panel); });
  }

  fillMap(panel) {
    panel.querySelector('.body').innerHTML = `<div class="map-grid">${REGION_ORDER.map((id) => {
      const r = GDD.regions.find((x) => x.id === id);
      const lock = !this.game.unlocked.includes(id);
      return `<button class="map-card${lock ? ' lock' : ''}" data-id="${id}" ${lock ? 'disabled' : ''}>
        <b>${REGION_META[id].tr}</b><small>Sv ${r.min}–${r.max} · ${esc(REGION_META[id].sub)}</small></button>`;
    }).join('')}</div>`;
    panel.querySelectorAll('.map-card').forEach((b) => b.onclick = () => { this.closeAll(); this.game.travel({ type: 'region', id: b.dataset.id, at: 'spawn' }); });
  }

  fillDungeons(panel) {
    const id = this.game.world.regionId || 'MAP_DAW';
    const list = REGION_DUNGEONS[id] || [];
    panel.querySelector('.body').innerHTML = list.map((name) => {
      const d = dungeonDef(name);
      return `<div class="shop-row"><div><b>${esc(name)}</b><br><small>Sv ${d.level} · ${d.players} oyuncu · ${esc(d.boss)}</small></div>
        <button class="btn gold" data-d="${esc(name)}">Gir</button></div>`;
    }).join('') || '<p>Bu bölgede zindan yok.</p>';
    panel.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => this.game.enterDungeon(b.dataset.d));
  }

  fillSocial(panel) {
    const g = this.game;
    panel.querySelector('.body').innerHTML = `
      <p>Parti ${g.party.length}/3 · Arena ${g.arena.rating} (${g.arena.wins}G/${g.arena.losses}M)</p>
      ${g.party.map((h) => `<div class="shop-row"><div><b>${esc(h.name)}</b> ${CLASS_TR[h.cls].tr}</div><button data-d="${h.id}">Çıkar</button></div>`).join('')}
      <h3>Kirala</h3>
      <div class="class-grid">${Object.keys(CLASS_TR).map((c) => `<button class="class-card" data-c="${c}"><img src="${FACE[c]}" alt=""><span>${CLASS_TR[c].tr}</span></button>`).join('')}</div>
      <p class="hint">Lonca kâtibi / eğitmenin kiralık yoldaşı. Seviyenle ölçeklenir.</p>
      ${g.player.level >= 30 ? '<button class="btn gold" id="go-arena">Astral Arena (3v3)</button>' : '<p class="hint">Arena seviye 30’da açılır.</p>'}`;
    panel.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { g.hire(b.dataset.c); this.fillSocial(panel); });
    panel.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => { const h = g.party.find((x) => String(x.id) === b.dataset.d); if (h) g.dismiss(h); this.fillSocial(panel); });
    panel.querySelector('#go-arena')?.addEventListener('click', () => g.enterArena());
  }

  fillShop(panel) {
    const g = this.game;
    panel.querySelector('.body').innerHTML = `<p class="hint">Astral Kristal yalnızca kozmetik ve kolaylık alır. Güç satılmaz.</p>` +
      GDD.shop.map((it) => `<div class="shop-row"><div><b>${esc(SHOP_TR[it.id] || it.name)}</b><br><small>${it.category} · ${it.policy}</small></div>
        <button class="btn gold" data-id="${it.id}">${it.price} ✦</button></div>`).join('');
    panel.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => { g.buyShop(GDD.shop.find((x) => x.id === b.dataset.id)); this.fillShop(panel); this.updateBars(); });
  }

  openMerchant(kind) {
    this.open('merchant');
    const panel = this.panels.merchant;
    const stock = merchantStock(this.game.player.level, kind);
    panel.querySelector('.body').innerHTML = stock.map((it, i) =>
      `<div class="shop-row">${this.itemChip(it)}<button class="btn gold" data-i="${i}">${fmt(it.value * 2.5 | 0)} 🪙</button></div>`
    ).join('');
    panel.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { this.game.buy(stock[+b.dataset.i]); });
  }

  fillCraft(panel) {
    const p = this.game.player;
    panel.querySelector('.body').innerHTML = RECIPES.map((r) => {
      const { needs, gold } = recipeNeeds(r, p);
      const need = Object.entries(needs).map(([id, n]) => `${MATERIAL_TR[id] || id} ×${n}`).join(', ');
      return `<div class="rec-row"><div><b>${esc(r.name)}</b> <small>${PROF_TR[r.prof]} · Sv ${r.level}</small><br>${esc(need)} · ${gold} altın</div>
        <button class="btn" data-id="${r.id}" ${p.level < r.level ? 'disabled' : ''}>Üret</button></div>`;
    }).join('');
    panel.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => { this.game.craft(RECIPES.find((r) => r.id === b.dataset.id)); this.fillCraft(panel); });
  }

  fillEnhance(panel) {
    const g = this.game;
    const gear = [...Object.values(g.eq).filter(Boolean), ...g.inv.items.filter((i) => i.kind === 'gear')];
    panel.querySelector('.body').innerHTML = gear.map((it) =>
      `<div class="shop-row">${this.itemChip(it)}<button class="btn gold" data-u="${it.uid}">+${it.plus}/10</button></div>`
    ).join('') || '<p>Güçlendirilecek eşya yok.</p>';
    panel.querySelectorAll('[data-u]').forEach((b) => b.onclick = () => {
      const it = gear.find((x) => String(x.uid) === b.dataset.u);
      if (it) g.enhance(it);
      this.fillEnhance(panel);
    });
  }

  fillAuction(panel) {
    const g = this.game;
    const list = g.auction();
    panel.querySelector('.body').innerHTML = `<p class="hint">%5 komisyon. Envanterdeki eşyaya sağ tık satmak yerine buradan da koyabilirsin.</p>` +
      list.map((l, i) => `<div class="auc-row">${this.itemChip(l.item)}<div><small>${esc(l.seller)}</small> <button class="btn gold" data-i="${i}">${fmt(l.price)}</button></div></div>`).join('');
    panel.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { g.auctionBuy(list[+b.dataset.i]); this.fillAuction(panel); });
  }

  fillSettings(panel) {
    const s = this.game.settings;
    panel.querySelector('.body').innerHTML = `
      ${row('Ana Ses', 'master', s.master)}${row('Müzik', 'music', s.music)}${row('Efekt', 'sfx', s.sfx)}${row('XP Hızı', 'xpRate', s.xpRate, 0.5, 3)}
      <label class="look-row"><input type="checkbox" id="st-auto" ${s.autoStats ? 'checked' : ''}/> Stat puanlarını otomatik dağıt</label>
      <label class="look-row"><input type="checkbox" id="st-prot" ${s.useProtect ? 'checked' : ''}/> +6 üzeri güçlendirmede koruma parşömeni kullan</label>
      <div class="choices">
        <button class="btn" id="st-save">Kaydet & Çıkış</button>
        <button class="ghost" id="st-fs">Tam Ekran</button>
      </div>`;
    panel.querySelectorAll('input[type=range]').forEach((inp) => inp.oninput = () => {
      s[inp.dataset.k] = +inp.value;
      audio.setVolumes(s.sfx * s.master, s.music * s.master);
      saveSettings(s);
    });
    panel.querySelector('#st-auto').onchange = (e) => { s.autoStats = e.target.checked; saveSettings(s); };
    panel.querySelector('#st-prot').onchange = (e) => { s.useProtect = e.target.checked; saveSettings(s); };
    panel.querySelector('#st-save').onclick = () => { this.game.save(); this.game.running = false; this.playing = false; $('#hud').classList.add('hidden'); $('#title').classList.remove('hidden'); this.refreshSlots(); };
    panel.querySelector('#st-fs').onclick = () => document.documentElement.requestFullscreen?.();
  }

  tip(e, html) {
    const t = $('#tip');
    if (!html) { t.classList.add('hidden'); return; }
    t.innerHTML = html; t.classList.remove('hidden');
    t.style.left = Math.min(window.innerWidth - 300, e.clientX + 14) + 'px';
    t.style.top = Math.min(window.innerHeight - 160, e.clientY + 14) + 'px';
  }
}

function setBar(i, txt, cur, max, label) {
  if (i) i.style.width = pct(cur, max) + '%';
  if (txt) txt.textContent = label || `${fmt(cur)} / ${fmt(max)}`;
}
function pct(a, b) { return b ? Math.max(0, Math.min(100, (a / b) * 100)) : 0; }
function paintCd(btn, left, max) {
  let i = btn.querySelector('i');
  if (!i) { i = el('i'); btn.appendChild(i); }
  i.style.transform = left > 0 ? `scaleY(${left / max})` : 'scaleY(0)';
}
function row(label, k, v, min = 0, max = 1) {
  return `<label>${label}<input type="range" min="${min}" max="${max}" step="0.05" value="${v}" data-k="${k}" /></label>`;
}
function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}s ${m}dk` : `${m}dk`;
}
export { fmtFull };
