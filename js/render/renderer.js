// World renderer: ground chunks, y-sorted scene, telegraphs, FX, overhead UI, lighting, weather.
import { drawHero, drawMonster, shadow } from './sprites.js';
import { drawCastSprite } from './worldart.js';
import { THEMES } from '../data/content.js';
import { makeCanvas, rgba, clamp, TAU, shade } from '../core/util.js';
import { RARITY } from '../data/content.js';
import { resolveCharacterVisual } from '../data/characterVisuals.js';

export class Renderer {
  constructor(canvas, game) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.cam = { x: 0, y: 0, zoom: 1 };
    this.light = makeCanvas(4, 4);
    this.weather = [];
    this.drawList = [];
    this.resize();
  }
  resize() {
    const dpr = 1;
    const w = window.innerWidth, h = window.innerHeight;
    this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    this.cv.style.width = w + 'px'; this.cv.style.height = h + 'px';
    this.dpr = dpr;
    // world zoom: keep ~ 30 metres visible horizontally on wide screens
    this.cam.zoom = clamp(Math.min(w / 1280, h / 760), 0.72, 1.35) * dpr;
    this.vw = this.cv.width / this.cam.zoom; this.vh = this.cv.height / this.cam.zoom;
    const lw = Math.ceil(this.vw / 8), lh = Math.ceil(this.vh / 8);
    this.light.width = lw; this.light.height = lh;
  }
  screenToWorld(sx, sy) { return { x: this.cam.x + (sx * this.dpr) / this.cam.zoom, y: this.cam.y + (sy * this.dpr) / this.cam.zoom }; }
  worldToScreen(x, y) { return { x: ((x - this.cam.x) * this.cam.zoom) / this.dpr, y: ((y - this.cam.y) * this.cam.zoom) / this.dpr }; }

  follow(target, dt) {
    const w = this.game.world, map = w.map;
    const tx = target.x - this.vw / 2, ty = target.y - 20 - this.vh / 2;
    const k = 1 - Math.pow(0.0008, dt);
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
    if (map.pw > this.vw) this.cam.x = clamp(this.cam.x, 0, map.pw - this.vw); else this.cam.x = (map.pw - this.vw) / 2;
    if (map.ph > this.vh) this.cam.y = clamp(this.cam.y, 0, map.ph - this.vh); else this.cam.y = (map.ph - this.vh) / 2;
  }
  snap(target) { this.cam.x = target.x - this.vw / 2; this.cam.y = target.y - this.vh / 2; this.follow(target, 1); }

  render() {
    const { ctx, game } = this;
    const w = game.world, map = w.map;
    if (!map) return;
    const z = this.cam.zoom;
    let sx = 0, sy = 0;
    if (w.shakeA > 0) { sx = (Math.random() - 0.5) * w.shakeA; sy = (Math.random() - 0.5) * w.shakeA; }
    const cam = { x: Math.round(this.cam.x + sx), y: Math.round(this.cam.y + sy) };
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = map.floor ? '#07050a' : map.theme.wall;
    ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    ctx.setTransform(z, 0, 0, z, 0, 0);
    ctx.imageSmoothingEnabled = false;
    map.drawGround(ctx, cam, this.vw, this.vh, 3);
    ctx.imageSmoothingEnabled = false;
    ctx.translate(-cam.x, -cam.y);
    const T = w.time;
    const view = { x0: cam.x - 120, y0: cam.y - 60, x1: cam.x + this.vw + 120, y1: cam.y + this.vh + 260 };
    const inView = (x, y) => x > view.x0 && x < view.x1 && y > view.y0 && y < view.y1;

    // liquid shimmer
    this.drawLiquidGlints(ctx, map, view, T);

    // ground layer: zones, traps, telegraphs, object rings
    for (const zn of w.zones) this.drawZone(ctx, zn, T);
    for (const tr of w.traps) { ctx.strokeStyle = rgba(tr.color, 0.8); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#8a6a3a'; ctx.fillRect(tr.x - 7, tr.y - 3, 14, 6); }
    for (const tg of w.telegraphs) this.drawTelegraph(ctx, tg);
    for (const o of w.objects) if (!o.hidden && inView(o.x, o.y)) this.drawObjectBase(ctx, o, T);
    const tgt = game.player.target;
    if (tgt && !tgt.dead) { ctx.strokeStyle = tgt.team === 'neutral' ? '#ffe070' : '#ff5050'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tgt.x, tgt.y, (tgt.radius || 12) + 8, ((tgt.radius || 12) + 8) * 0.42, 0, 0, TAU); ctx.stroke(); }
    const qt = game.questTarget;
    if (qt && inView(qt.x, qt.y)) { const p = 0.5 + Math.sin(T * 4) * 0.5; ctx.strokeStyle = `rgba(255,215,106,${0.4 + p * 0.4})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(qt.x, qt.y, 40 + p * 8, 16 + p * 3, 0, 0, TAU); ctx.stroke(); }

    // y-sorted scene
    const list = this.drawList;
    let n = 0;
    const push = (y, k, o) => {
      const it = list[n] || (list[n] = { y: 0, k: 0, o: null });
      it.y = y; it.k = k; it.o = o; n++;
    };
    for (const p of map.props) if (inView(p.x, p.y)) push(p.y, 0, p);
    for (const b of map.buildings) if (b.x + b.w > view.x0 && b.x < view.x1 && b.y > view.y0 && b.y - b.h - 100 < view.y1) push(b.y, 1, b);
    for (const o of w.objects) if (!o.hidden && inView(o.x, o.y)) push(o.y, 2, o);
    for (const npc of w.npcs) if (inView(npc.x, npc.y)) push(npc.y, 3, npc);
    for (const h of w.ghosts) if (inView(h.x, h.y)) push(h.y, 4, h);
    for (const h of w.heroes) if (inView(h.x, h.y)) push(h.y, 4, h);
    for (const m of w.monsters) if (inView(m.x, m.y)) push(m.y, 5, m);
    for (const e of w.extraAllies) if (e.kind === 'objective' && inView(e.x, e.y)) push(e.y, 6, e);
    list.length = n;
    list.sort((a, b) => a.y - b.y);
    const P = game.player;
    for (const it of list) {
      const o = it.o;
      if (it.k === 0) {
        const sp = o.sp;
        const fade = P.y < o.y && P.y > o.y - sp.ay + 10 && Math.abs(P.x - o.x) < sp.c.width * 0.4 && sp.ay > 60;
        if (fade) ctx.globalAlpha = 0.55;
        ctx.drawImage(sp.c, o.x - sp.ax, o.y - sp.ay);
        ctx.globalAlpha = 1;
      } else if (it.k === 1) {
        const sp = o.sp;
        const fade = P.y < o.y && P.y > o.y - o.h - 60 && P.x > o.x && P.x < o.x + o.w;
        if (fade) ctx.globalAlpha = 0.6;
        ctx.drawImage(sp.c, o.x - sp.ox, o.y - sp.oy);
        ctx.globalAlpha = 1;
        if (o.label) this.label(ctx, o.x + o.w / 2, o.y - o.h - 28, BUILDING_TR[o.label] || o.label, '#ffe8b0', 12);
      } else if (it.k === 2) this.drawObject(ctx, o, T);
      else if (it.k === 3) this.drawNPC(ctx, o, T);
      else if (it.k === 4) this.drawHeroEnt(ctx, o, T);
      else if (it.k === 5) this.drawMonsterEnt(ctx, o, T);
      else if (it.k === 6) this.drawCore(ctx, o, T);
    }

    // projectiles
    for (const p of w.projectiles) this.drawProjectile(ctx, p, T);
    // meteors
    for (const m of w.meteors) {
      const k = m.t / m.dur;
      const x = m.x + (1 - k) * 160, y = m.y - (1 - k) * 420;
      ctx.save();
      ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(x, y, 14 * m.scale, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 6 * m.scale, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(m.color, 0.5); ctx.lineWidth = 10 * m.scale; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60, y - 150); ctx.stroke();
      ctx.restore();
    }
    // slashes / rings / beams
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of w.slashes) {
      const k = s.t / s.dur;
      const half = (s.arc * Math.PI) / 360;
      ctx.strokeStyle = rgba(s.color, 0.85 * (1 - k)); ctx.lineWidth = 10 * (1 - k) + 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.55 + k * 0.45), s.ang - half, s.ang - half + 2 * half * Math.min(1, k * 3)); ctx.stroke();
    }
    for (const r of w.rings) {
      const k = r.t / r.dur;
      ctx.strokeStyle = rgba(r.color, 0.8 * (1 - k)); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * (0.3 + k * 0.7), r.r * (0.3 + k * 0.7) * 0.55, 0, 0, TAU); ctx.stroke();
      if (r.fill) { ctx.fillStyle = rgba(r.color, 0.12 * (1 - k)); ctx.fill(); }
    }
    for (const b of w.beams) {
      const k = b.t / b.dur;
      ctx.strokeStyle = rgba(b.color, 0.9 * (1 - k)); ctx.lineWidth = b.w * (1 - k * 0.5);
      ctx.beginPath(); ctx.moveTo(b.x1, b.y1);
      if (b.w <= 5) { const n = 5; for (let i = 1; i < n; i++) { const t = i / n; ctx.lineTo(b.x1 + (b.x2 - b.x1) * t + (Math.random() - 0.5) * 14, b.y1 + (b.y2 - b.y1) * t + (Math.random() - 0.5) * 14); } }
      ctx.lineTo(b.x2, b.y2); ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', 0.8 * (1 - k)); ctx.lineWidth = Math.max(1, b.w * 0.3); ctx.stroke();
    }
    for (const p of w.parts) {
      const k = p.t / p.dur;
      ctx.fillStyle = rgba(p.color, 1 - k);
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();

    // overhead UI
    for (const it of list) {
      if (it.k === 3) this.npcOverhead(ctx, it.o, T);
      else if (it.k === 4) this.heroOverhead(ctx, it.o);
      else if (it.k === 5) this.monsterOverhead(ctx, it.o);
    }
    // floating combat text
    ctx.textAlign = 'center';
    for (const f of w.floats) {
      const k = f.t / f.dur;
      const pop = f.crit ? 1 + Math.max(0, 0.4 - k) * 1.5 : 1;
      const size = Math.round(15 * f.scale * pop);
      ctx.font = `${f.crit ? 900 : 800} ${size}px Inter, system-ui, sans-serif`;
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(10,6,14,.85)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    // lighting
    this.drawLighting(ctx, cam, w, map);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawWeather(ctx, map, w);
  }

  // ---------------------------------------------------------------- pieces
  drawLiquidGlints(ctx, map, view, T) {
    if (map.floor || !map.theme.liq) return;
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    const step = 128;
    const x0 = Math.floor(view.x0 / step) * step, y0 = Math.floor(view.y0 / step) * step;
    for (let y = y0; y < view.y1; y += step) for (let x = x0; x < view.x1; x += step) {
      const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      const ox = (h % 50), oy = ((h >> 8) % 50);
      const px = x + ox, py = y + oy;
      if (!map.isLiquid(px, py)) continue;
      const a = Math.sin(T * 2 + (h % 100)) ;
      if (a < 0.4) continue;
      ctx.globalAlpha = (a - 0.4) * 0.8;
      ctx.fillRect(px, py, 10 + (h % 8), 2);
    }
    ctx.globalAlpha = 1;
  }
  drawZone(ctx, z, T) {
    const k = z.t / z.dur;
    const a = k > 0.85 ? (1 - k) / 0.15 : 1;
    ctx.save();
    const g = ctx.createRadialGradient(z.x, z.y, z.r * 0.1, z.x, z.y, z.r);
    g.addColorStop(0, rgba(z.color, 0.32 * a)); g.addColorStop(1, rgba(z.color, 0.08 * a));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.62, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(z.color, 0.7 * a); ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]); ctx.lineDashOffset = -T * 30; ctx.stroke(); ctx.setLineDash([]);
    // flavour particles
    if (Math.random() < 0.5) {
      const an = Math.random() * TAU, r = Math.random() * z.r;
      this.game.world.parts.push({ x: z.x + Math.cos(an) * r, y: z.y + Math.sin(an) * r * 0.62, vx: 0, vy: z.kind === 'arrows' || z.kind === 'fire' ? -60 : -25, t: 0, dur: 0.6, color: z.color, size: z.kind === 'arrows' ? 2 : 3 });
    }
    if (z.kind === 'arrows' && Math.random() < 0.8) { const an = Math.random() * TAU, r = Math.random() * z.r; ctx.strokeStyle = '#e8ffe0'; ctx.lineWidth = 2; const x = z.x + Math.cos(an) * r, y = z.y + Math.sin(an) * r * 0.6; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x, y); ctx.stroke(); }
    ctx.restore();
  }
  drawTelegraph(ctx, t) {
    const k = clamp(t.e / t.t, 0, 1);
    ctx.save();
    const col = t.color || '#ff4030';
    ctx.fillStyle = rgba(col, 0.16); ctx.strokeStyle = rgba(col, 0.85); ctx.lineWidth = 2.5;
    const fill2 = rgba(col, 0.28);
    if (t.shape === 'circle') {
      ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r, t.r * 0.62, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = fill2; ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r * k, t.r * k * 0.62, 0, 0, TAU); ctx.fill();
    } else if (t.shape === 'ring') {
      ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r, t.r * 0.62, 0, 0, TAU); ctx.ellipse(t.x, t.y, t.r0, t.r0 * 0.62, 0, 0, TAU, true); ctx.fill('evenodd'); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r0, t.r0 * 0.62, 0, 0, TAU); ctx.strokeStyle = 'rgba(120,255,160,.8)'; ctx.stroke();
      ctx.fillStyle = fill2; const rr = t.r0 + (t.r - t.r0) * k; ctx.beginPath(); ctx.ellipse(t.x, t.y, rr, rr * 0.62, 0, 0, TAU); ctx.ellipse(t.x, t.y, t.r0, t.r0 * 0.62, 0, 0, TAU, true); ctx.fill('evenodd');
    } else if (t.shape === 'cone') {
      const half = (t.arc * Math.PI) / 360;
      ctx.translate(t.x, t.y); ctx.scale(1, 0.62);
      const ang = Math.atan2(Math.sin(t.ang) / 0.62, Math.cos(t.ang));
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, t.r, ang - half, ang + half); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = fill2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, t.r * k, ang - half, ang + half); ctx.closePath(); ctx.fill();
    } else if (t.shape === 'line') {
      ctx.translate(t.x, t.y); ctx.rotate(t.ang);
      ctx.fillRect(0, -t.w / 2, t.len, t.w); ctx.strokeRect(0, -t.w / 2, t.len, t.w);
      ctx.fillStyle = fill2; ctx.fillRect(0, -t.w / 2, t.len * k, t.w);
    }
    ctx.restore();
  }
  drawObjectBase(ctx, o, T) {
    if (o.type === 'portal' || o.type === 'dungeon' || o.type === 'exit' || o.type === 'arena') {
      const col = o.type === 'dungeon' ? '#c070ff' : o.type === 'arena' ? '#ffd76a' : o.type === 'exit' ? '#9fe0ff' : '#7fd8ff';
      const g = ctx.createRadialGradient(o.x, o.y, 4, o.x, o.y, o.r * 1.6);
      g.addColorStop(0, rgba(col, 0.5)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * 1.6, o.r, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(col, 0.9); ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { const rr = o.r * (0.5 + ((T * 0.6 + i / 3) % 1) * 0.9); ctx.globalAlpha = 1 - ((T * 0.6 + i / 3) % 1); ctx.beginPath(); ctx.ellipse(o.x, o.y, rr * 1.4, rr * 0.6, 0, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    if (o.type === 'defendStart' || o.type === 'eventStart') { ctx.strokeStyle = 'rgba(255,215,106,.8)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -T * 20; ctx.beginPath(); ctx.ellipse(o.x, o.y, 90, 40, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  }
  drawObject(ctx, o, T) {
    const bob = Math.sin(T * 2 + o.t) * 3;
    switch (o.type) {
      case 'portal': case 'exit': {
        const col = o.type === 'exit' ? '#9fe0ff' : '#7fd8ff';
        ctx.save(); shadow(ctx, o.x, o.y, 26);
        ctx.fillStyle = '#6a6a7a'; ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = 2;
        ctx.fillRect(o.x - 30, o.y - 70, 10, 70); ctx.strokeRect(o.x - 30, o.y - 70, 10, 70);
        ctx.fillRect(o.x + 20, o.y - 70, 10, 70); ctx.strokeRect(o.x + 20, o.y - 70, 10, 70);
        ctx.beginPath(); ctx.arc(o.x, o.y - 70, 30, Math.PI, 0); ctx.lineWidth = 10; ctx.strokeStyle = '#6a6a7a'; ctx.stroke();
        ctx.shadowColor = col; ctx.shadowBlur = 20;
        const g = ctx.createLinearGradient(o.x, o.y - 96, o.x, o.y);
        g.addColorStop(0, rgba(col, 0.9)); g.addColorStop(1, rgba('#ffffff', 0.35));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(o.x - 20, o.y); ctx.lineTo(o.x - 20, o.y - 70); ctx.arc(o.x, o.y - 70, 20, Math.PI, 0); ctx.lineTo(o.x + 20, o.y); ctx.closePath(); ctx.globalAlpha = 0.7 + Math.sin(T * 3) * 0.15; ctx.fill();
        ctx.restore();
        this.label(ctx, o.x, o.y - 108, o.label, o.locked ? '#ff9090' : '#bfe8ff', 12);
        break;
      }
      case 'dungeon': {
        ctx.save(); shadow(ctx, o.x, o.y, 44);
        ctx.fillStyle = '#3a3040'; ctx.strokeStyle = '#140e18'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(o.x - 50, o.y); ctx.lineTo(o.x - 40, o.y - 60); ctx.lineTo(o.x, o.y - 84); ctx.lineTo(o.x + 40, o.y - 60); ctx.lineTo(o.x + 50, o.y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#0a0610'; ctx.beginPath(); ctx.moveTo(o.x - 22, o.y); ctx.lineTo(o.x - 22, o.y - 38); ctx.arc(o.x, o.y - 38, 22, Math.PI, 0); ctx.lineTo(o.x + 22, o.y); ctx.fill();
        ctx.shadowColor = '#c070ff'; ctx.shadowBlur = 18; ctx.fillStyle = rgba('#c070ff', 0.5 + Math.sin(T * 2) * 0.2); ctx.fillRect(o.x - 20, o.y - 40, 40, 40);
        ctx.restore();
        this.label(ctx, o.x, o.y - 100, o.label, '#e0b0ff', 12);
        break;
      }
      case 'arena': {
        ctx.save(); shadow(ctx, o.x, o.y, 30);
        ctx.fillStyle = '#c8b070'; ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(o.x - 12, o.y); ctx.lineTo(o.x - 8, o.y - 70); ctx.lineTo(o.x, o.y - 80); ctx.lineTo(o.x + 8, o.y - 70); ctx.lineTo(o.x + 12, o.y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.shadowColor = '#ffd76a'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff4c0'; ctx.beginPath(); ctx.arc(o.x, o.y - 90 + bob, 8, 0, TAU); ctx.fill();
        ctx.restore();
        this.label(ctx, o.x, o.y - 110, o.label, '#ffd76a', 12);
        break;
      }
      case 'waystone': {
        ctx.save(); shadow(ctx, o.x, o.y, 22);
        ctx.fillStyle = '#8a8aa0'; ctx.strokeStyle = '#22202a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(o.x - 14, o.y); ctx.lineTo(o.x - 10, o.y - 56); ctx.lineTo(o.x, o.y - 66); ctx.lineTo(o.x + 10, o.y - 56); ctx.lineTo(o.x + 14, o.y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.shadowColor = '#7fd8ff'; ctx.shadowBlur = 14; ctx.fillStyle = rgba('#7fd8ff', 0.7 + Math.sin(T * 3) * 0.3);
        ctx.beginPath(); ctx.moveTo(o.x, o.y - 50); ctx.lineTo(o.x + 5, o.y - 38); ctx.lineTo(o.x, o.y - 26); ctx.lineTo(o.x - 5, o.y - 38); ctx.closePath(); ctx.fill();
        ctx.restore();
        this.label(ctx, o.x, o.y - 80, o.label, '#bfe8ff', 11);
        break;
      }
      case 'craft': {
        ctx.save(); shadow(ctx, o.x, o.y, 28);
        ctx.fillStyle = '#7a5230'; ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2;
        ctx.fillRect(o.x - 28, o.y - 26, 56, 12); ctx.strokeRect(o.x - 28, o.y - 26, 56, 12);
        ctx.fillRect(o.x - 24, o.y - 14, 6, 14); ctx.fillRect(o.x + 18, o.y - 14, 6, 14);
        ctx.fillStyle = '#9aa0aa'; ctx.fillRect(o.x - 16, o.y - 36, 18, 10); ctx.strokeRect(o.x - 16, o.y - 36, 18, 10);
        ctx.fillStyle = '#c03030'; ctx.beginPath(); ctx.arc(o.x + 12, o.y - 32, 6, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.restore();
        this.label(ctx, o.x, o.y - 50, o.label, '#ffe8b0', 11);
        break;
      }
      case 'gather': {
        if (!o.ready) { ctx.globalAlpha = 0.35; }
        shadow(ctx, o.x, o.y, 16);
        if (o.gkind === 'herb') {
          for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.6; ctx.fillStyle = i % 2 ? '#5ac04a' : '#3a9a3a'; ctx.beginPath(); ctx.ellipse(o.x + Math.sin(a) * 8, o.y - 10 - Math.cos(a) * 6, 4, 11, a, 0, TAU); ctx.fill(); }
          ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.arc(o.x, o.y - 20 + bob * 0.3, 3, 0, TAU); ctx.fill();
        } else {
          const col = o.gkind === 'ore' ? '#b07040' : '#9fd8ff';
          ctx.fillStyle = '#6a6470'; ctx.strokeStyle = '#2a2430'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(o.x - 18, o.y); ctx.lineTo(o.x - 12, o.y - 18); ctx.lineTo(o.x + 4, o.y - 24); ctx.lineTo(o.x + 18, o.y - 10); ctx.lineTo(o.x + 16, o.y); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = o.ready ? 10 : 0; ctx.fillStyle = col;
          for (const [dx, dy] of [[-6, -10], [4, -16], [8, -6]]) { ctx.beginPath(); ctx.moveTo(o.x + dx, o.y + dy - 5); ctx.lineTo(o.x + dx + 4, o.y + dy); ctx.lineTo(o.x + dx, o.y + dy + 4); ctx.lineTo(o.x + dx - 4, o.y + dy); ctx.fill(); }
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        break;
      }
      case 'clue': case 'rune': case 'defendStart': case 'eventStart': case 'chest': {
        const col = o.type === 'rune' ? '#9f7fff' : o.type === 'chest' ? '#ffd76a' : '#ffd76a';
        ctx.save(); shadow(ctx, o.x, o.y, 20);
        if (o.type === 'rune') {
          ctx.fillStyle = '#5a5470'; ctx.strokeStyle = '#1a1424'; ctx.lineWidth = 2;
          ctx.fillRect(o.x - 12, o.y - 54, 24, 54); ctx.strokeRect(o.x - 12, o.y - 54, 24, 54);
          ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.fillStyle = rgba(col, 0.6 + Math.sin(T * 4) * 0.3);
          ctx.fillRect(o.x - 3, o.y - 46, 6, 20); ctx.fillRect(o.x - 8, o.y - 38, 16, 4);
        } else if (o.type === 'chest') {
          ctx.fillStyle = '#8a5a24'; ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2;
          ctx.fillRect(o.x - 22, o.y - 26, 44, 26); ctx.strokeRect(o.x - 22, o.y - 26, 44, 26);
          ctx.fillStyle = '#e0b040'; ctx.fillRect(o.x - 22, o.y - 18, 44, 4); ctx.fillRect(o.x - 3, o.y - 22, 6, 8);
          ctx.shadowColor = '#ffd76a'; ctx.shadowBlur = 20; ctx.fillStyle = rgba('#fff4c0', 0.5 + Math.sin(T * 3) * 0.3); ctx.fillRect(o.x - 20, o.y - 30, 40, 3);
        } else if (o.type === 'clue') {
          ctx.fillStyle = '#e8dcb0'; ctx.strokeStyle = '#6a5a3a'; ctx.lineWidth = 1.5;
          ctx.fillRect(o.x - 10, o.y - 8, 20, 8); ctx.strokeRect(o.x - 10, o.y - 8, 20, 8);
          ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(o.x, o.y - 26 + bob, 5, 0, TAU); ctx.fill();
        } else {
          ctx.fillStyle = '#8a6a3a'; ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2;
          ctx.fillRect(o.x - 3, o.y - 70, 6, 70); ctx.strokeRect(o.x - 3, o.y - 70, 6, 70);
          ctx.fillStyle = '#c03030'; ctx.beginPath(); ctx.moveTo(o.x + 3, o.y - 70); ctx.lineTo(o.x + 36, o.y - 60 + Math.sin(T * 3) * 3); ctx.lineTo(o.x + 3, o.y - 48); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        this.label(ctx, o.x, o.y - (o.type === 'rune' ? 70 : o.type === 'defendStart' || o.type === 'eventStart' ? 84 : 44), o.label, '#ffe8a0', 11);
        break;
      }
    }
  }
  drawCore(ctx, c, T) {
    ctx.save(); shadow(ctx, c.x, c.y, 30);
    ctx.fillStyle = '#7a5a3a'; ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2;
    ctx.fillRect(c.x - 26, c.y - 30, 52, 30); ctx.strokeRect(c.x - 26, c.y - 30, 52, 30);
    ctx.shadowColor = '#ffd76a'; ctx.shadowBlur = 20; ctx.fillStyle = rgba('#ffe8a0', 0.6 + Math.sin(T * 3) * 0.2);
    ctx.beginPath(); ctx.arc(c.x, c.y - 46, 12, 0, TAU); ctx.fill();
    ctx.restore();
    this.bar(ctx, c.x, c.y - 72, 70, 7, c.hp / c.maxHp, '#6dd060');
    this.label(ctx, c.x, c.y - 80, c.name, '#ffe8a0', 11);
  }
  drawNPC(ctx, n, T) {
    const who = /guard|captain|soldier|watch|knight|marshal/i.test(`${n.title} ${n.name}`) ? 'soldier'
      : /lady|maiden|princess|sister|priestess/i.test(`${n.title} ${n.name}`) ? 'princess' : null;
    const anim = { walk: n.walkT, moving: n.moving, attack: -1, time: n.animT };
    if (who && drawCastSprite(ctx, who, n.x, n.y, n.moving ? n.dir : 0, anim, 1.15)) return;
    drawHero(ctx, n.x, n.y, 'npc', n.look, n.moving ? n.dir : 0, anim, 1.15, {});
  }
  drawHeroEnt(ctx, h, T) {
    if (h.dead) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(h.x, h.y); ctx.rotate(Math.PI / 2); drawHero(ctx, 0, 0, h.cls, h.look, 2, { walk: 0, attack: -1, time: 0 }, 1.2, { noShadow: true }); ctx.restore();
      return;
    }
    const stealth = h.buffs.some((b) => b.stealth);
    if (stealth) ctx.globalAlpha = h.team === 'ally' ? 0.4 : 0.08;
    const z = h.z || 0;
    if (z) shadow(ctx, h.x, h.y, 14);
    // shields & auras
    const sh = h.shieldTotal();
    if (sh > 0) { ctx.save(); ctx.strokeStyle = 'rgba(160,220,255,.7)'; ctx.fillStyle = 'rgba(160,220,255,.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(h.x, h.y - 26 - z, 26, 34, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
    if (h.stance) { ctx.save(); ctx.strokeStyle = rgba(h.stance === 'ravager' ? '#ff5040' : '#8ab0ff', 0.55); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(h.x, h.y, 22, 9, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (h.buffs.some((b) => b.id === 'orbit' || b.id === 'apotheosis')) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = T * 3 + (i * TAU) / 3; ctx.fillStyle = h.cls === 'Mage' ? '#c8a0ff' : '#fff4b0'; ctx.beginPath(); ctx.arc(h.x + Math.cos(a) * 26, h.y - 26 + Math.sin(a) * 10, 4, 0, TAU); ctx.fill(); } ctx.restore(); }
    const blink = (h.animT % 4) < 0.12;
    const flash = h.flash > 0;
    if (flash) h.flash -= 0.016;
    const visual = h.isPlayer ? resolveCharacterVisual(h.cls, this.game.eq) : null;
    drawHero(ctx, h.x, h.y - z, h.cls, h.look, h.dir, { walk: h.walkT, moving: h.moving, attack: h.atkAnim, time: h.animT }, 1.2, { mount: h.mount && h.mount.kind, blink, noShadow: !!z, visual });
    if (h.mods.stun) this.stunStars(ctx, h.x, h.y - 64, T);
    ctx.globalAlpha = 1;
  }
  drawMonsterEnt(ctx, m, T) {
    if (m.dead) {
      const k = clamp((this.game.world.time - m.deathT) / 1.4, 0, 1);
      ctx.save(); ctx.globalAlpha = 1 - k;
      drawMonster(ctx, m.x, m.y + k * 4, { name: m.name, arch: m.arch, color: shade(m.color, -0.4), size: m.size * (1 - k * 0.2), dir: m.dir, t: 0, atk: -1, moving: false, boss: m.boss, eye: m.eye, wing: m.wing });
      ctx.restore();
      return;
    }
    const z = m.z || 0;
    if (m.state === 'return') ctx.globalAlpha = 0.6;
    drawMonster(ctx, m.x, m.y - z, { name: m.name, arch: m.arch, color: m.color, size: m.size, dir: m.dir, t: m.animT, atk: m.atkAnim, moving: m.moving, boss: m.boss, aura: m.aura && (m.enraged ? '#ff2020' : m.aura), flash: m.flash > 0, eye: m.eye, wing: m.wing });
    ctx.globalAlpha = 1;
    if (m.windup > 0 && m.boss) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba('#ff6040', 0.25 + Math.sin(T * 20) * 0.1); ctx.beginPath(); ctx.ellipse(m.x, m.y - 30 * m.size, 30 * m.size, 36 * m.size, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    if (m.mods.stun) this.stunStars(ctx, m.x, m.y - 50 * m.size - 10, T);
  }
  stunStars(ctx, x, y, T) {
    ctx.fillStyle = '#ffe060';
    for (let i = 0; i < 3; i++) { const a = T * 5 + (i * TAU) / 3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 12, y + Math.sin(a) * 4, 3, 0, TAU); ctx.fill(); }
  }
  drawProjectile(ctx, p, T) {
    const a = Math.atan2(p.vy, p.vx);
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.kind === 'arrow' || p.kind === 'knife') {
      ctx.rotate(a);
      ctx.strokeStyle = rgba(p.color, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(0, 0); ctx.stroke();
      ctx.strokeStyle = p.kind === 'knife' ? '#d8d8e8' : '#8a6a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(4, 0); ctx.stroke();
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(2, -3); ctx.lineTo(2, 3); ctx.fill();
    } else {
      const r = p.small ? 6 : 9;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 2.4);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, rgba(p.color, 0.9)); g.addColorStop(1, rgba(p.color, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 2.4, 0, TAU); ctx.fill();
      ctx.rotate(a);
      ctx.fillStyle = rgba(p.color, 0.35); ctx.beginPath(); ctx.ellipse(-r * 2, 0, r * 2.2, r * 0.7, 0, 0, TAU); ctx.fill();
      if (Math.random() < 0.5) this.game.world.parts.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, t: 0, dur: 0.35, color: p.color, size: 3 });
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- overhead
  label(ctx, x, y, text, color = '#fff', size = 12, weight = 700) {
    const font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    if (this._font !== font) { this._font = font; ctx.font = font; }
    ctx.textAlign = 'center';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,6,14,.8)'; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  bar(ctx, x, y, w, h, k, col, back = 'rgba(10,6,14,.75)') {
    ctx.fillStyle = back; ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = col; ctx.fillRect(x - w / 2, y, w * clamp(k, 0, 1), h);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x - w / 2, y, w * clamp(k, 0, 1), h / 2);
  }
  npcOverhead(ctx, n, T) {
    const g = this.game;
    const mk = g.npcMarker(n);
    this.label(ctx, n.x, n.y - 70, n.name, '#9fe0ff', 12);
    if (n.title) this.label(ctx, n.x, n.y - 57, `<${n.title}>`, '#c8d8e0', 10, 600);
    if (mk) {
      const y = n.y - 92 + Math.sin(T * 4) * 3;
      ctx.font = '900 26px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = '#2a1a00'; ctx.strokeText(mk.ch, n.x, y);
      ctx.fillStyle = mk.color; ctx.fillText(mk.ch, n.x, y);
    }
    if (n.team === 'ally' && n.maxHp > 1) this.bar(ctx, n.x, n.y - 84, 56, 5, n.hp / n.maxHp, '#6dd060');
  }
  heroOverhead(ctx, h) {
    if (h.dead) return;
    const z = h.z || 0;
    const y = h.y - 76 - z - (h.mount ? 12 : 0);
    if (h.ghost) {
      this.label(ctx, h.x, y, `${h.name}`, '#e8e8ff', 11);
      if (h.guild) this.label(ctx, h.x, y + 12, `«${h.guild}»`, '#b8a0ff', 9, 600);
      return;
    }
    const col = h.team === 'enemy' ? '#ff7070' : h.isPlayer ? '#ffffff' : '#9fffb0';
    this.label(ctx, h.x, y - 6, `${h.name}`, col, 12);
    if (!h.isPlayer) this.bar(ctx, h.x, y, 50, 5, h.hp / h.maxHp, h.team === 'enemy' ? '#e04040' : '#40c060');
    const b = this.game.chat && h.bubble;
    if (h.bubble && h.bubbleT > this.game.world.time) this.bubble(ctx, h.x, y - 22, h.bubble);
  }
  monsterOverhead(ctx, m) {
    if (m.dead) return;
    const top = m.y - (m.arch === 'golem' || m.arch === 'seraph' ? 68 : 50) * m.size - (m.z || 0);
    const pl = this.game.player;
    const near = Math.abs(m.x - pl.x) < 360 && Math.abs(m.y - pl.y) < 280;
    const show = m.boss || m.inCombat > 0 || m.hp < m.maxHp || pl.target === m || m.elite;
    if (!show && !near) return;
    const lvlCol = levelColor(m.level, this.game.player.level);
    if (show) {
      const w = m.boss ? 90 : m.elite ? 64 : 48;
      this.bar(ctx, m.x, top, w, m.boss ? 7 : 5, m.hp / m.maxHp, m.boss ? '#e04030' : '#d04040');
      const sh = m.shieldTotal(); if (sh > 0) this.bar(ctx, m.x, top - 4, w, 2, sh / m.maxHp * 4, '#9fe0ff', 'rgba(0,0,0,0)');
    }
    const name = `${m.elite && !m.boss ? '★ ' : ''}${m.name}`;
    this.label(ctx, m.x, top - 6, name, m.boss ? '#ffb070' : m.tier === 'Named' ? '#ffd76a' : m.passive ? '#e8e8b0' : '#ff9a8a', m.boss ? 13 : 11);
    this.label(ctx, m.x, top - (m.boss ? 21 : 19), `Sv ${m.level}`, lvlCol, 10, 700);
  }
  bubble(ctx, x, y, text) {
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    const w = Math.min(200, ctx.measureText(text).width + 16);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - 20, w, 20, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1a1420'; ctx.textAlign = 'center'; ctx.fillText(text.length > 32 ? text.slice(0, 31) + '…' : text, x, y - 6);
  }

  // ---------------------------------------------------------------- lighting & weather
  darkness(w, map) {
    if (map.kind === 'dungeon') return 0.62;
    if (map.kind === 'arena') return 0.1;
    const base = (map.theme.dark || 0) * 0.8;
    const night = 0.5 - 0.5 * Math.cos(w.dayT * TAU); // 0 at dayT=0 (noon) → 1 at 0.5 (midnight)
    return clamp(base + Math.max(0, night - 0.35) * 0.85, 0, 0.72);
  }
  drawLighting(ctx, cam, w, map) {
    const dark = this.darkness(w, map);
    if (dark < 0.03) return;
    const L = this.light, lc = L.getContext('2d');
    const s = L.width / this.vw;
    lc.globalCompositeOperation = 'source-over';
    lc.clearRect(0, 0, L.width, L.height);
    const tint = map.kind === 'dungeon' ? '8,4,18' : map.theme.key === 'void' ? '20,6,36' : map.theme.key === 'cave' ? '6,8,20' : '8,10,34';
    lc.fillStyle = `rgba(${tint},${dark})`;
    lc.fillRect(0, 0, L.width, L.height);
    lc.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => {
      const sx = (x - cam.x) * s, sy = (y - cam.y) * s, sr = r * s;
      if (sx < -sr || sy < -sr || sx > L.width + sr || sy > L.height + sr) return;
      const g = lc.createRadialGradient(sx, sy, 0, sx, sy, sr);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      lc.fillStyle = g; lc.beginPath(); lc.arc(sx, sy, sr, 0, TAU); lc.fill();
    };
    const T = w.time;
    for (const l of map.lights) hole(l.x, l.y, l.r * (0.95 + Math.sin(T * 7 + l.x) * 0.04), 0.95);
    for (const h of w.heroes) if (!h.dead) hole(h.x, h.y - 20, h.isPlayer ? 300 : 170, 0.9);
    for (const p of w.projectiles) if (p.kind !== 'arrow') hole(p.x, p.y, 90, 0.7);
    for (const z of w.zones) hole(z.x, z.y, z.r * 1.2, 0.6);
    for (const o of w.objects) if (o.type === 'portal' || o.type === 'dungeon' || o.type === 'rune' || o.type === 'waystone' || o.type === 'exit') hole(o.x, o.y - 40, 160, 0.8);
    for (const m of w.monsters) if (m.boss && !m.dead) hole(m.x, m.y - 30, 200, 0.6);
    // light colour glow
    lc.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.setTransform(this.cam.zoom, 0, 0, this.cam.zoom, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(L, 0, 0, this.vw, this.vh);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of map.lights) {
      const x = l.x - cam.x, y = l.y - cam.y;
      if (x < -l.r || y < -l.r || x > this.vw + l.r || y > this.vh + l.r) continue;
      const g = ctx.createRadialGradient(x, y, 0, x, y, l.r * 0.6);
      g.addColorStop(0, rgba(l.color || '#ffb060', 0.22 * dark * 1.6)); g.addColorStop(1, rgba(l.color || '#ffb060', 0));
      ctx.fillStyle = g; ctx.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
    }
    ctx.restore();
  }
  drawWeather(ctx, map, w) {
    if (!this.game.settings.weather) return;
    const th = THEMES[map.theme.key] || map.theme;
    const pk = PARTICLES[th.particles];
    if (!pk || map.kind === 'arena') return;
    const W = this.cv.width, H = this.cv.height;
    const want = Math.round((pk.n || 40) * (W * H) / (1920 * 1080));
    while (this.weather.length < want) this.weather.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random(), p: Math.random() * TAU });
    if (this.weather.length > want) this.weather.length = want;
    ctx.save();
    const dt = 1 / 60;
    for (const p of this.weather) {
      const kind = pk.kind;
      if (kind === 'snow') { p.y += (40 + p.s * 60) * dt * this.dpr; p.x += Math.sin(w.time + p.p) * 0.6 * this.dpr; }
      else if (kind === 'ash' || kind === 'ember') { p.y -= (20 + p.s * 40) * dt * this.dpr; p.x += Math.sin(w.time * 0.7 + p.p) * 0.5 * this.dpr; }
      else if (kind === 'leaf' || kind === 'petal') { p.y += (26 + p.s * 30) * dt * this.dpr; p.x += (18 + Math.sin(w.time + p.p) * 30) * dt * this.dpr; }
      else if (kind === 'sand') { p.x += (180 + p.s * 200) * dt * this.dpr; p.y += Math.sin(w.time * 2 + p.p) * 0.4; }
      else { p.y -= (8 + p.s * 14) * dt * this.dpr; p.x += Math.sin(w.time * 0.5 + p.p) * 0.4 * this.dpr; }
      if (p.y > H + 10) p.y = -10; if (p.y < -10) p.y = H + 10; if (p.x > W + 10) p.x = -10; if (p.x < -10) p.x = W + 10;
      const a = kind === 'sand' ? 0.35 : kind === 'firefly' || kind === 'mote' || kind === 'wisp' ? 0.5 + Math.sin(w.time * 3 + p.p) * 0.4 : 0.75;
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.fillStyle = pk.color;
      const sz = (kind === 'snow' ? 2 + p.s * 2.5 : kind === 'leaf' || kind === 'petal' ? 3 + p.s * 2 : kind === 'sand' ? 1.5 : 1.5 + p.s * 2) * this.dpr;
      if (kind === 'firefly' || kind === 'mote' || kind === 'wisp' || kind === 'ember') { ctx.globalAlpha = clamp(a * 1.15, 0, 1); }
      if (kind === 'leaf' || kind === 'petal') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(w.time * 2 + p.p); ctx.fillRect(-sz, -sz / 2, sz * 2, sz); ctx.restore(); }
      else if (kind === 'sand') ctx.fillRect(p.x, p.y, sz * 8, sz * 0.7);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }
}

export function levelColor(L, pl) {
  const d = L - pl;
  return d >= 5 ? '#ff4040' : d >= 3 ? '#ff9a40' : d >= -2 ? '#ffe070' : d >= -6 ? '#70e070' : '#a0a0a0';
}
const PARTICLES = {
  leaves: { kind: 'leaf', color: '#9ad060', n: 26 }, fireflies: { kind: 'firefly', color: '#e8ff80', n: 44 }, wisps: { kind: 'wisp', color: '#a0ffd0', n: 34 },
  embers: { kind: 'ember', color: '#ff8a40', n: 70 }, spores: { kind: 'mote', color: '#a0ffc0', n: 44 }, dust: { kind: 'sand', color: '#f6e0b0', n: 60 },
  motes: { kind: 'mote', color: '#e0e8ff', n: 44 }, snow: { kind: 'snow', color: '#ffffff', n: 130 }, voidsparks: { kind: 'ember', color: '#c080ff', n: 60 },
};
const BUILDING_TR = { 'Class Halls': 'Sınıf Salonları', Blacksmith: 'Demirhane', Alchemist: 'Simyahane', 'Auction House': 'Mezat Evi', 'Inn / Storage': 'Han / Depo', 'Guild Hall': 'Lonca Salonu', Chapel: 'Şapel', Stable: 'Ahır', Stylist: 'Stilist' };
export { RARITY };
