// Field-based terrain: coarse float fields (12px) → per-pixel pixel-art chunks + 24px collision grid.
import { clamp, fbm, hash2, hexToRgb, makeCanvas, pointSegDist, lerp } from '../core/util.js';
import { getProp, getBuilding, clearSpriteCaches } from '../render/sprites.js';
import { pathTint, takeArtRefresh } from '../render/worldart.js';

export const TILE = 48;
export const CELL = 24;   // collision cell
const F = 12;             // field resolution
const CHUNK = 768;        // px
const HALF = 4;           // pixel size of terrain texture

export class GameMap {
  constructor({ id, kind, W, H, theme, seed, name }) {
    Object.assign(this, { id, kind, W, H, theme, seed, name });
    this.pw = W * TILE; this.ph = H * TILE;
    this.fw = Math.ceil(this.pw / F) + 1; this.fh = Math.ceil(this.ph / F) + 1;
    const n = this.fw * this.fh;
    this.liq = new Float32Array(n);
    this.wall = new Float32Array(n);
    this.road = new Float32Array(n).fill(999);
    this.plaza = new Float32Array(n).fill(999);
    this.gn = new Float32Array(n);
    this.floor = null; // dungeon floor grid (tile res) if set
    this.cw = W * 2; this.ch = H * 2;
    this.solid = new Uint8Array(this.cw * this.ch);
    this.props = []; this.decals = []; this.buildings = []; this.lights = [];
    this.pois = {}; this.spawns = []; this.npcSpots = []; this.objects = [];
    this.chunks = new Map();
    this.roadW = 30;
    this.roads = [];
  }

  idx(fx, fy) { return fy * this.fw + fx; }

  sampleField(arr, x, y) {
    const gx = clamp(x / F, 0, this.fw - 1.001), gy = clamp(y / F, 0, this.fh - 1.001);
    const x0 = gx | 0, y0 = gy | 0, tx = gx - x0, ty = gy - y0;
    const i = y0 * this.fw + x0;
    return lerp(lerp(arr[i], arr[i + 1], tx), lerp(arr[i + this.fw], arr[i + this.fw + 1], tx), ty);
  }

  // ---------------------------------------------------------------- authoring
  fillNoise(fn) {
    for (let fy = 0; fy < this.fh; fy++) for (let fx = 0; fx < this.fw; fx++) fn(fx * F, fy * F, fy * this.fw + fx);
  }

  addRoad(pts, halfW = 30) {
    this.roads.push({ pts, halfW });
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const pad = halfW + 40;
      const x0 = Math.max(0, Math.floor((Math.min(ax, bx) - pad) / F)), x1 = Math.min(this.fw - 1, Math.ceil((Math.max(ax, bx) + pad) / F));
      const y0 = Math.max(0, Math.floor((Math.min(ay, by) - pad) / F)), y1 = Math.min(this.fh - 1, Math.ceil((Math.max(ay, by) + pad) / F));
      for (let fy = y0; fy <= y1; fy++) for (let fx = x0; fx <= x1; fx++) {
        const d = pointSegDist(fx * F, fy * F, ax, ay, bx, by) - halfW;
        const k = fy * this.fw + fx;
        if (d < this.road[k]) this.road[k] = d;
      }
    }
  }

  addPlaza(cx, cy, r) {
    const pad = r + 40;
    for (let fy = Math.max(0, ((cy - pad) / F) | 0); fy <= Math.min(this.fh - 1, (cy + pad) / F); fy++)
      for (let fx = Math.max(0, ((cx - pad) / F) | 0); fx <= Math.min(this.fw - 1, (cx + pad) / F); fx++) {
        const d = Math.hypot(fx * F - cx, fy * F - cy) - r;
        const k = fy * this.fw + fx;
        if (d < this.plaza[k]) this.plaza[k] = d;
      }
  }

  /** Force-clear liquid/wall inside radius (for POIs). */
  clearArea(cx, cy, r) {
    const pad = r + 60;
    for (let fy = Math.max(0, ((cy - pad) / F) | 0); fy <= Math.min(this.fh - 1, (cy + pad) / F); fy++)
      for (let fx = Math.max(0, ((cx - pad) / F) | 0); fx <= Math.min(this.fw - 1, (cx + pad) / F); fx++) {
        const d = Math.hypot(fx * F - cx, fy * F - cy);
        const k = fy * this.fw + fx;
        const m = clamp((d - r) / 60, 0, 1);
        this.liq[k] = Math.min(this.liq[k], 0.2 + m * (this.liq[k] - 0.2));
        this.wall[k] = Math.min(this.wall[k], 0.2 + m * (this.wall[k] - 0.2));
      }
  }

  clearAlongRoads(extra = 50) {
    for (let k = 0; k < this.road.length; k++) {
      const d = this.road[k];
      if (d < extra + 60) {
        const m = clamp((d - extra) / 60, 0, 1);
        this.liq[k] = Math.min(this.liq[k], 0.2 + m * (this.liq[k] - 0.2));
        this.wall[k] = Math.min(this.wall[k], 0.2 + m * (this.wall[k] - 0.2));
      }
    }
  }

  addProp(type, x, y, variant = 0) {
    const sp = getProp(type, this.theme, variant);
    const p = { type, x, y, sp, r: sp.r };
    if (sp.flat) this.decals.push(p);
    else this.props.push(p);
    if (sp.light) this.lights.push({ x, y: y - 20, r: sp.light.r, color: sp.light.color });
    return p;
  }

  addBuilding(kind, x, y, w, h, roof, label) {
    const sp = getBuilding(kind, w, h, roof, label);
    const b = { kind, x, y, w, h, sp, label };
    this.buildings.push(b);
    return b;
  }

  // ---------------------------------------------------------------- queries
  isLiquid(x, y) { return this.sampleField(this.liq, x, y) > 0.5; }
  isWall(x, y) {
    if (this.floor) {
      const tx = (x / TILE) | 0, ty = (y / TILE) | 0;
      if (tx < 0 || ty < 0 || tx >= this.W || ty >= this.H) return true;
      return !this.floor[ty * this.W + tx];
    }
    return this.sampleField(this.wall, x, y) > 0.5;
  }

  buildCollision() {
    const { cw, ch } = this;
    const walkLiquid = this.theme.liquid === 'ice';
    for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
      const x = cx * CELL + CELL / 2, y = cy * CELL + CELL / 2;
      let s = 0;
      if (cx < 1 || cy < 1 || cx >= cw - 1 || cy >= ch - 1) s = 1;
      else if (this.isWall(x, y)) s = 1;
      else if (!walkLiquid && !this.floor && this.isLiquid(x, y)) s = 1;
      this.solid[cy * cw + cx] = s;
    }
    for (const p of this.props) if (p.r > 0) this.stampCircle(p.x, p.y - 4, p.r);
    for (const b of this.buildings) {
      const x0 = ((b.x) / CELL) | 0, x1 = ((b.x + b.w) / CELL) | 0;
      const y0 = ((b.y - b.h * 0.35) / CELL) | 0, y1 = ((b.y - 6) / CELL) | 0;
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) this.setSolid(cx, cy, 1);
    }
  }

  stampCircle(x, y, r) {
    const x0 = ((x - r) / CELL) | 0, x1 = ((x + r) / CELL) | 0, y0 = ((y - r) / CELL) | 0, y1 = ((y + r) / CELL) | 0;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      if (Math.hypot(cx * CELL + CELL / 2 - x, cy * CELL + CELL / 2 - y) <= r + 6) this.setSolid(cx, cy, 1);
    }
  }
  setSolid(cx, cy, v) { if (cx >= 0 && cy >= 0 && cx < this.cw && cy < this.ch) this.solid[cy * this.cw + cx] = v; }
  solidAt(x, y) {
    const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
    if (cx < 0 || cy < 0 || cx >= this.cw || cy >= this.ch) return true;
    return this.solid[cy * this.cw + cx] === 1;
  }
  blockedCircle(x, y, r) {
    return this.solidAt(x - r, y) || this.solidAt(x + r, y) || this.solidAt(x, y - r * 0.6) || this.solidAt(x, y + r * 0.4) || this.solidAt(x, y);
  }
  /** Moves a circle with axis-separated sliding; returns true if fully moved. */
  move(ent, dx, dy) {
    const r = ent.radius || 10;
    let moved = true;
    if (dx) { if (!this.blockedCircle(ent.x + dx, ent.y, r)) ent.x += dx; else moved = false; }
    if (dy) { if (!this.blockedCircle(ent.x, ent.y + dy, r)) ent.y += dy; else moved = false; }
    return moved;
  }
  lineClear(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay);
    const steps = Math.ceil(d / 16);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
      if (this.solid[cy * this.cw + cx] && (this.isWall(x, y))) return false;
    }
    return true;
  }
  /** Nearest walkable point around (x,y). */
  findOpen(x, y, maxR = 300) {
    if (!this.blockedCircle(x, y, 12)) return [x, y];
    for (let r = 24; r < maxR; r += 24) for (let a = 0; a < 16; a++) {
      const px = x + Math.cos((a / 16) * Math.PI * 2) * r, py = y + Math.sin((a / 16) * Math.PI * 2) * r;
      if (!this.blockedCircle(px, py, 12)) return [px, py];
    }
    return [x, y];
  }

  // ---------------------------------------------------------------- A* (collision grid)
  path(ax, ay, bx, by, maxIter = 3000) {
    const { cw, ch, solid } = this;
    const sx = (ax / CELL) | 0, sy = (ay / CELL) | 0, gx = (bx / CELL) | 0, gy = (by / CELL) | 0;
    if (sx === gx && sy === gy) return [[bx, by]];
    const key = (x, y) => y * cw + x;
    const open = [[sx, sy, 0, 0]];
    const came = new Map(), gs = new Map([[key(sx, sy), 0]]);
    let it = 0, best = null, bestH = 1e9;
    while (open.length && it++ < maxIter) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) if (open[i][3] < open[bi][3]) bi = i;
      const [x, y, g] = open.splice(bi, 1)[0];
      const h = Math.abs(x - gx) + Math.abs(y - gy);
      if (h < bestH) { bestH = h; best = [x, y]; }
      if (x === gx && y === gy) { best = [x, y]; break; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch || solid[key(nx, ny)]) continue;
        if (dx && dy && (solid[key(x + dx, y)] || solid[key(x, y + dy)])) continue;
        const ng = g + (dx && dy ? 1.414 : 1);
        const k = key(nx, ny);
        if (ng < (gs.get(k) ?? 1e9)) {
          gs.set(k, ng); came.set(k, key(x, y));
          open.push([nx, ny, ng, ng + Math.hypot(nx - gx, ny - gy)]);
        }
      }
    }
    if (!best) return null;
    const out = [];
    let k = key(best[0], best[1]);
    while (k !== key(sx, sy) && came.has(k)) { out.push([(k % cw) * CELL + CELL / 2, ((k / cw) | 0) * CELL + CELL / 2]); k = came.get(k); }
    out.reverse();
    // simplify
    const simp = [];
    let last = [ax, ay];
    for (let i = 0; i < out.length; i++) {
      const nxt = out[i + 1];
      if (nxt && this.lineClearSolid(last[0], last[1], nxt[0], nxt[1])) continue;
      simp.push(out[i]); last = out[i];
    }
    return simp;
  }
  lineClearSolid(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay), steps = Math.ceil(d / 10);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (this.blockedCircle(ax + (bx - ax) * t, ay + (by - ay) * t, 10)) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------- rendering
  getChunk(cx, cy) {
    const k = cy * 1000 + cx;
    let c = this.chunks.get(k);
    if (!c) { c = this.renderChunk(cx, cy); this.chunks.set(k, c); }
    return c;
  }
  hasChunk(cx, cy) { return this.chunks.has(cy * 1000 + cx); }

  renderChunk(cx, cy) {
    const th = this.theme;
    const S = CHUNK / HALF;
    const cnv = makeCanvas(S, S);
    const ctx = cnv.getContext('2d');
    const img = ctx.createImageData(S, S);
    const d = img.data;
    const G = th.ground.map(hexToRgb), P = hexToRgb(th.path), PE = hexToRgb(th.pathEdge), DT = hexToRgb(th.detail);
    const L = hexToRgb(th.liq), LD = hexToRgb(th.liqDeep), SH = hexToRgb(th.shore), W = hexToRgb(th.wall);
    const PZ = hexToRgb(this.plazaColor || '#b8b0a0');
    const ox = cx * CHUNK, oy = cy * CHUNK;
    const liquidKind = th.liquid;
    const floorCol = hexToRgb(this.floorColor || th.ground[0]);
    for (let py = 0; py < S; py++) {
      const wy = oy + py * HALF;
      for (let px = 0; px < S; px++) {
        const wx = ox + px * HALF;
        let r, g, b;
        const h = hash2(wx >> 1, wy >> 1, this.seed);
        if (this.floor) {
          const tx = (wx / TILE) | 0, ty = (wy / TILE) | 0;
          const inside = tx >= 0 && ty >= 0 && tx < this.W && ty < this.H && this.floor[ty * this.W + tx];
          if (!inside) {
            const belowFloor = ty + 1 < this.H && tx >= 0 && tx < this.W && this.floor[(ty + 1) * this.W + tx];
            const ly = wy - ty * TILE;
            if (belowFloor && ly > 8) {
              // wall face (brick)
              const row = ((ly - 8) / 10) | 0;
              const brick = (((wx + (row % 2) * 12) % 24) < 2) || ((ly - 8) % 10 < 2);
              const k = brick ? 0.55 : 0.85 + h * 0.15;
              r = W[0] * 1.6 * k; g = W[1] * 1.6 * k; b = W[2] * 1.6 * k;
            } else { const k = 0.7 + h * 0.2; r = W[0] * k; g = W[1] * k; b = W[2] * k; }
          } else {
            const gnv = this.sampleField(this.gn, wx, wy);
            const tileEdge = (wx % TILE < 2) || (wy % TILE < 2);
            const k = (tileEdge ? 0.8 : 1) * (0.9 + gnv * 0.2 + h * 0.08);
            r = floorCol[0] * k; g = floorCol[1] * k; b = floorCol[2] * k;
            const lq = this.sampleField(this.liq, wx, wy);
            if (lq > 0.5) { const t = clamp((lq - 0.5) * 3, 0, 1); r = lerp(L[0], LD[0], t); g = lerp(L[1], LD[1], t); b = lerp(L[2], LD[2], t); }
          }
        } else {
          const wl = this.sampleField(this.wall, wx, wy);
          const lq = this.sampleField(this.liq, wx, wy);
          const rd = this.sampleField(this.road, wx, wy);
          const pz = this.sampleField(this.plaza, wx, wy);
          const gnv = this.sampleField(this.gn, wx, wy);
          // ground
          const t1 = clamp((gnv - 0.35) * 3.2, 0, 1), t2 = clamp((gnv - 0.62) * 4, 0, 1);
          r = lerp(lerp(G[1][0], G[0][0], t1), G[2][0], t2); g = lerp(lerp(G[1][1], G[0][1], t1), G[2][1], t2); b = lerp(lerp(G[1][2], G[0][2], t1), G[2][2], t2);
          if (h > 0.93) { r = DT[0]; g = DT[1]; b = DT[2]; }
          else if (h < 0.05) { r *= 0.86; g *= 0.86; b *= 0.86; }
          // plaza (cobbles)
          if (pz < 0) {
            const cob = ((wx + ((wy / 16) | 0) % 2 * 8) % 16 < 2) || (wy % 16 < 2);
            const k = cob ? 0.72 : 0.92 + h * 0.12;
            r = PZ[0] * k; g = PZ[1] * k; b = PZ[2] * k;
          } else if (pz < 6) { r = r * 0.7 + PZ[0] * 0.2; g = g * 0.7 + PZ[1] * 0.2; b = b * 0.7 + PZ[2] * 0.2; }
          // road
          if (rd < 0 && pz >= 0) {
            const e = rd > -7 + h * 4;
            const C = e ? PE : P;
            const tex = pathTint(wx, wy);
            const k = 0.92 + h * 0.14;
            if (tex && !e) {
              r = tex[0] * 0.65 + C[0] * 0.35;
              g = tex[1] * 0.65 + C[1] * 0.35;
              b = tex[2] * 0.65 + C[2] * 0.35;
            } else {
              r = C[0] * k; g = C[1] * k; b = C[2] * k;
            }
            if (h > 0.97) { r *= 0.8; g *= 0.8; b *= 0.8; }
          }
          // liquid
          if (lq > 0.46) {
            if (lq < 0.5) { r = SH[0]; g = SH[1]; b = SH[2]; }
            else {
              const t = clamp((lq - 0.5) * 4, 0, 1);
              r = lerp(L[0], LD[0], t); g = lerp(L[1], LD[1], t); b = lerp(L[2], LD[2], t);
              if (liquidKind === 'water' && h > 0.985) { r += 50; g += 50; b += 50; }
              if (liquidKind === 'lava') { const k = 0.85 + hash2(wx >> 3, wy >> 3, 9) * 0.3; r *= k; g *= k; }
              if (liquidKind === 'chasm' || liquidKind === 'void') { if (h > 0.992) { r = 255; g = 255; b = 255; } }
              if (liquidKind === 'ice' && ((wx + wy) % 40 < 2)) { r += 30; g += 30; b += 30; }
            }
          }
          // walls / cliffs
          if (wl > 0.5) {
            const t = clamp((wl - 0.5) * 3, 0, 1);
            const k = 0.75 + t * 0.2 + h * 0.1;
            r = W[0] * k; g = W[1] * k; b = W[2] * k;
            const below = this.sampleField(this.wall, wx, wy + 18);
            if (below < 0.5) { r *= 0.7; g *= 0.7; b *= 0.7; }
            else if (wl < 0.56) { r *= 1.25; g *= 1.25; b *= 1.25; }
          }
        }
        const i = (py * S + px) * 4;
        d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    for (const dc of this.decals) {
      if (dc.x < ox - 80 || dc.x > ox + CHUNK + 80 || dc.y < oy - 80 || dc.y > oy + CHUNK + 80) continue;
      ctx.drawImage(dc.sp.c, (dc.x - dc.sp.ax - ox) / HALF, (dc.y - dc.sp.ay - oy) / HALF, dc.sp.c.width / HALF, dc.sp.c.height / HALF);
    }
    return cnv;
  }

  /** Draws ground chunks covering the view. budget: max new chunks rendered this frame. */
  drawGround(ctx, cam, vw, vh, budget = 2) {
    if (takeArtRefresh()) { this.chunks.clear(); clearSpriteCaches(); }
    const x0 = Math.floor(cam.x / CHUNK), y0 = Math.floor(cam.y / CHUNK);
    const x1 = Math.floor((cam.x + vw) / CHUNK), y1 = Math.floor((cam.y + vh) / CHUNK);
    let made = 0;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      if (cx < 0 || cy < 0 || cx * CHUNK >= this.pw || cy * CHUNK >= this.ph) continue;
      if (!this.hasChunk(cx, cy)) { if (made >= budget) { ctx.fillStyle = this.theme.ground[0]; ctx.fillRect(cx * CHUNK - cam.x, cy * CHUNK - cam.y, CHUNK, CHUNK); continue; } made++; }
      ctx.drawImage(this.getChunk(cx, cy), cx * CHUNK - cam.x, cy * CHUNK - cam.y, CHUNK, CHUNK);
    }
  }

  prewarm(x, y, rad = 1) {
    const cx = Math.floor(x / CHUNK), cy = Math.floor(y / CHUNK);
    for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
      const X = cx + i, Y = cy + j;
      if (X >= 0 && Y >= 0 && X * CHUNK < this.pw && Y * CHUNK < this.ph) this.getChunk(X, Y);
    }
  }

  buildMinimap() {
    const c = makeCanvas(this.cw, this.ch);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(this.cw, this.ch);
    const th = this.theme;
    const G = hexToRgb(th.ground[0]), P = hexToRgb(th.path), L = hexToRgb(th.liq), W = hexToRgb(th.wall), PZ = hexToRgb(this.plazaColor || '#b8b0a0');
    for (let cy = 0; cy < this.ch; cy++) for (let cx = 0; cx < this.cw; cx++) {
      const x = cx * CELL + 12, y = cy * CELL + 12;
      let C = G;
      if (this.floor) C = this.isWall(x, y) ? W : hexToRgb(this.floorColor || th.ground[0]);
      else if (this.sampleField(this.wall, x, y) > 0.5) C = W;
      else if (this.sampleField(this.liq, x, y) > 0.5) C = L;
      else if (this.sampleField(this.plaza, x, y) < 0) C = PZ;
      else if (this.sampleField(this.road, x, y) < 0) C = P;
      else if (this.solid[cy * this.cw + cx]) C = [G[0] * 0.6, G[1] * 0.6, G[2] * 0.6];
      const i = (cy * this.cw + cx) * 4;
      img.data[i] = C[0]; img.data[i + 1] = C[1]; img.data[i + 2] = C[2]; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = 'rgba(60,40,30,.9)';
    for (const b of this.buildings) ctx.fillRect(b.x / CELL, (b.y - b.h * 0.4) / CELL, b.w / CELL, (b.h * 0.4) / CELL);
    this.minimap = c;
  }
}

export { CHUNK, F };
