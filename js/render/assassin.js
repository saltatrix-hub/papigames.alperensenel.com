/** Faced assassin cut from the full bodies on the base sheet, plus Rusty_Dagger. */

const DIR_FILE = ['front', 'left', 'right', 'back'];
const SHEET = 'assets/assassin/00_RAW_SHEETS/base.png';
const DAGGER = 'assets/assassin/04_WEAPONS/Rusty_Dagger';
// Uncropped bodies on the sheet: front, left, right, back. The split PNGs clip the front and left.
const BODY_CUT = [
  [176, 16, 235, 380],
  [1038, 22, 235, 373],
  [452, 23, 232, 373],
  [749, 18, 238, 378],
];

const bodies = [null, null, null, null];
const feet = [null, null, null, null];
const daggers = [null, null, null, null];
const grips = [null, null, null, null];

// rest, windup, hit. x right, y up (negative), angle clockwise from the art's natural point.
const POSE = [
  [
    [[0.16, -0.30, -0.12], [0.14, -0.58, -2.45], [0.04, -0.42, 1.05]],
    [[-0.18, -0.30, 0.12], [-0.16, -0.58, 2.45], [-0.06, -0.42, -1.05]],
  ],
  [
    [[-0.08, -0.34, 0.15], [-0.02, -0.56, -1.4], [-0.16, -0.36, 0.15]],
    [[0.04, -0.36, 0.1], [0.08, -0.50, -1.1], [0.00, -0.38, 0.35]],
  ],
  [
    [[0.08, -0.32, -0.15], [0.02, -0.56, 1.4], [0.16, -0.36, -0.15]],
    [[-0.04, -0.36, -0.1], [-0.08, -0.50, 1.1], [0.00, -0.38, -0.35]],
  ],
  [
    [[0.16, -0.30, -0.12], [0.18, -0.50, 0.35], [0.10, -0.56, -2.55]],
    [[-0.18, -0.30, 0.12], [-0.18, -0.50, -0.35], [-0.10, -0.56, 2.55]],
  ],
];

function cropMain(img) {
  const w = img.width;
  const h = img.height;
  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(img, 0, 0);
  const data = sctx.getImageData(0, 0, w, h);
  const pix = data.data;
  const seen = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let bestN = 0;
  let best = null;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if (seen[start] || pix[start * 4 + 3] < 24) continue;
      let qs = 0;
      let qe = 0;
      qx[qe] = x;
      qy[qe] = y;
      qe++;
      seen[start] = 1;
      const cells = [];
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      while (qs < qe) {
        const cx = qx[qs];
        const cy = qy[qs];
        qs++;
        cells.push(cx, cy);
        if (cx < minX) minX = cx;
        if (cy < minY) minY = cy;
        if (cx > maxX) maxX = cx;
        if (cy > maxY) maxY = cy;
        const nbs = [cx + 1, cy, cx - 1, cy, cx, cy + 1, cx, cy - 1];
        for (let k = 0; k < 8; k += 2) {
          const nx = nbs[k];
          const ny = nbs[k + 1];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx;
          if (seen[j] || pix[j * 4 + 3] < 24) continue;
          seen[j] = 1;
          qx[qe] = nx;
          qy[qe] = ny;
          qe++;
        }
      }
      if (cells.length / 2 > bestN) {
        bestN = cells.length / 2;
        best = { cells, minX, minY, maxX, maxY };
      }
    }
  }
  if (!best) return null;
  const cw = best.maxX - best.minX + 1;
  const ch = best.maxY - best.minY + 1;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  const frame = octx.createImageData(cw, ch);
  const dst = frame.data;
  for (let i = 0; i < best.cells.length; i += 2) {
    const x = best.cells[i] - best.minX;
    const y = best.cells[i + 1] - best.minY;
    const si = (best.cells[i + 1] * w + best.cells[i]) * 4;
    const di = (y * cw + x) * 4;
    dst[di] = pix[si];
    dst[di + 1] = pix[si + 1];
    dst[di + 2] = pix[si + 2];
    dst[di + 3] = pix[si + 3];
  }
  octx.putImageData(frame, 0, 0);
  return { canvas: out, footX: cw / 2, footY: ch - 1, h: ch };
}

function daggerGrip(canvas) {
  const w = canvas.width;
  const h = canvas.height;
  const pix = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  const cells = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pix[(y * w + x) * 4 + 3] >= 30) cells.push(x, y);
    }
  }
  const n = cells.length / 2;
  if (n < 8) return { x: w / 2, y: 0, tipX: w / 2, tipY: h - 1, len: h };
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < cells.length; i += 2) { cx += cells[i]; cy += cells[i + 1]; }
  cx /= n;
  cy /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < cells.length; i += 2) {
    const dx = cells[i] - cx;
    const dy = cells[i + 1] - cy;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const proj = [];
  for (let i = 0; i < cells.length; i += 2) {
    const x = cells[i];
    const y = cells[i + 1];
    proj.push([(x - cx) * ca + (y - cy) * sa, x, y]);
  }
  proj.sort((a, b) => a[0] - b[0]);
  const thick = (chunk) => {
    let m = 0;
    const vals = chunk.map((p) => -(p[1] - cx) * sa + (p[2] - cy) * ca);
    for (const v of vals) m += v;
    m /= vals.length;
    let s = 0;
    for (const v of vals) s += (v - m) * (v - m);
    return Math.sqrt(s / vals.length);
  };
  const k = Math.max(8, Math.floor(proj.length / 12));
  const a = proj[0];
  const b = proj[proj.length - 1];
  const grip = thick(proj.slice(0, k)) > thick(proj.slice(-k)) ? a : b;
  const tip = grip === a ? b : a;
  const len = Math.hypot(grip[1] - tip[1], grip[2] - tip[2]) || 1;
  return { x: grip[1], y: grip[2], tipX: tip[1], tipY: tip[2], len };
}

function loadSheet(url, onReady) {
  const img = new Image();
  img.onload = () => {
    const cut = cropMain(img);
    if (cut) onReady(cut);
  };
  img.src = url;
}

export function preloadAssassin() {
  if (typeof Image === 'undefined') return;
  const sheet = new Image();
  sheet.onload = () => {
    BODY_CUT.forEach((rect, i) => {
      const [x, y, w, h] = rect;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(sheet, x, y, w, h, 0, 0, w, h);
      bodies[i] = c;
      feet[i] = { x: w / 2, y: h - 1, h };
    });
  };
  sheet.src = SHEET;
  DIR_FILE.forEach((name, i) => {
    loadSheet(`${DAGGER}/${name}.png`, (cut) => {
      daggers[i] = cut.canvas;
      grips[i] = daggerGrip(cut.canvas);
    });
  });
}

function weights(t, delay) {
  if (t < 0) return [1, 0, 0];
  const p = t - delay;
  if (p <= 0) return [1, 0, 0];
  if (p < 0.18) {
    const u = p / 0.18;
    return [1 - u, u, 0];
  }
  if (p < 0.46) {
    const u = (p - 0.18) / 0.28;
    const e = u * u * (3 - 2 * u);
    return [0, 1 - e, e];
  }
  const u = Math.min(1, (p - 0.46) / 0.42);
  const e = u * u * (3 - 2 * u);
  return [e, 0, 1 - e];
}

function handPose(dir, hand, t) {
  const pose = POSE[dir][hand];
  const w = weights(t, hand * 0.1);
  let x = 0;
  let y = 0;
  let ang = 0;
  for (let i = 0; i < 3; i++) {
    x += pose[i][0] * w[i];
    y += pose[i][1] * w[i];
    ang += pose[i][2] * w[i];
  }
  return { x, y, ang, hit: w[2] };
}

function tipAt(dir, hx, hy, ang, blade) {
  const g = grips[dir];
  if (!g) return null;
  const s = blade / g.len;
  const rx = (g.tipX - g.x) * s;
  const ry = (g.tipY - g.y) * s;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  return { x: hx + rx * ca - ry * sa, y: hy + rx * sa + ry * ca };
}

function drawBlade(ctx, dir, hx, hy, ang, blade) {
  const img = daggers[dir];
  const g = grips[dir];
  if (!img || !g) return null;
  const s = blade / g.len;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  ctx.drawImage(img, -g.x * s, -g.y * s, img.width * s, img.height * s);
  ctx.restore();
  return tipAt(dir, hx, hy, ang, blade);
}

function slash(ctx, a, b, scale, alpha) {
  if (!a || !b || alpha < 0.05) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(180, 20, 30, ${alpha * 0.45})`;
  ctx.lineWidth = 7 * scale;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 236, 214, ${alpha})`;
  ctx.lineWidth = 2.4 * scale;
  ctx.stroke();
  ctx.restore();
}

export function drawAssassin(ctx, x, y, dir, anim, scale = 1, opts = {}) {
  const i = bodies[dir] ? dir : 0;
  const img = bodies[i];
  const foot = feet[i];
  if (!img || !foot) return false;
  const h = 72 * scale;
  const k = h / foot.h;
  const walk = anim?.walk || 0;
  const attacking = anim?.attack >= 0;
  const t = attacking ? Math.max(0, Math.min(0.999, anim.attack)) : -1;
  const bob = anim?.moving ? Math.abs(Math.sin(walk * 2)) * 2.2 * scale : Math.sin((anim?.time || 0) * 2) * 0.6 * scale;
  const punch = attacking ? Math.sin(t * Math.PI) : 0;
  const lx = dir === 1 ? -punch * 14 * scale : dir === 2 ? punch * 14 * scale : 0;
  const ly = dir === 0 ? punch * 8 * scale : dir === 3 ? -punch * 10 * scale : 0;
  const lead = handPose(i, 0, t);
  const rear = handPose(i, 1, t);
  const blade = h * (attacking ? 0.26 + 0.08 * Math.max(lead.hit, rear.hit) : 0.22);

  ctx.save();
  ctx.translate(x + lx, y + ly - bob);
  ctx.rotate((dir === 1 ? -1 : dir === 2 ? 1 : 0) * punch * 0.1);
  ctx.imageSmoothingEnabled = true;
  if (!opts.noShadow) {
    ctx.beginPath();
    ctx.ellipse(0, 3, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
  }
  const side = dir === 1 || dir === 2;
  if (side) {
    const rx = rear.x * h;
    const ry = rear.y * h;
    drawBlade(ctx, i, rx, ry, rear.ang, blade * 0.92);
  }
  ctx.drawImage(img, -foot.x * k, -foot.y * k, img.width * k, img.height * k);
  const tips = [];
  const hands = side ? [lead] : [rear, lead];
  for (const hand of hands) {
    tips.push(drawBlade(ctx, i, hand.x * h, hand.y * h, hand.ang, blade));
  }
  if (attacking && (lead.hit > 0.25 || rear.hit > 0.25)) {
    const prevLead = handPose(i, 0, Math.max(0, t - 0.12));
    const prevRear = handPose(i, 1, Math.max(0, t - 0.12));
    const pa = tipAt(i, prevLead.x * h, prevLead.y * h, prevLead.ang, blade);
    const pb = tipAt(i, prevRear.x * h, prevRear.y * h, prevRear.ang, blade);
    if (!side && tips[0] && pb) slash(ctx, pb, tips[0], scale, rear.hit);
    const leadTip = side ? tips[0] : tips[1];
    if (leadTip && pa) slash(ctx, pa, leadTip, scale, lead.hit);
  }
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') preloadAssassin();
