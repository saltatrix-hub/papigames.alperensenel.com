/** Kenney Tiny Town props + LPC base monsters / NPCs. */
const TOWN = 'assets/sprites/town/tile_';
const MOB = 'assets/sprites/lpc-world/monsters/';
const PEOPLE = 'assets/sprites/lpc-world/people/';

const tiles = new Map();
const mobs = new Map();
const people = new Map();
let pathPx = null;
let refresh = false;
let propsBaked = false;

const TREES = {
  oak: { tiles: [[5], [16]], s: 5 },
  bigtree: { tiles: [[5], [16]], s: 6.5 },
  pine: { tiles: [[16]], s: 5.5 },
  snowpine: { tiles: [[4], [15]], s: 5 },
  bush: { tiles: [[6]], s: 4 },
  palm: { tiles: [[4], [15]], s: 5 },
};
const HOUSES = {
  house: [[52, 53, 54, 55], [84, 86, 85, 87]],
  hall: [[48, 49, 50, 51], [88, 90, 89, 91]],
  chapel: [[48, 49, 50, 51], [88, 89, 90, 91]],
  smith: [[52, 53, 54, 55], [84, 85, 87, 86]],
  tent: [[52, 53, 55], [84, 86, 87]],
};

const MOBS = {
  slime: { file: 'slime.png', cols: 3, rows: 4, cw: 32, ch: 32 },
  bat: { file: 'bat.png', cols: 3, rows: 4, cw: 32, ch: 32 },
  bee: { file: 'bee.png', cols: 3, rows: 4, cw: 32, ch: 32 },
  snake: { file: 'snake.png', cols: 3, rows: 4, cw: 32, ch: 32 },
  ghost: { file: 'ghost.png', cols: 3, rows: 4, cw: 40, ch: 46 },
  flower: { file: 'man_eater_flower.png', cols: 3, rows: 4, cw: 60, ch: 76 },
};

function propsReady() {
  const ids = new Set();
  for (const spec of Object.values(TREES)) for (const row of spec.tiles) for (const id of row) ids.add(id);
  for (const rows of Object.values(HOUSES)) for (const row of rows) for (const id of row) ids.add(id);
  for (const id of ids) if (!tiles.has(id)) return false;
  return true;
}

function load(map, src, key) {
  if (typeof Image === 'undefined') return;
  const img = new Image();
  img.onload = () => {
    map.set(key, img);
    if (!propsBaked && propsReady()) { propsBaked = true; refresh = true; }
  };
  img.src = src;
}

export function preloadWorldArt() {
  for (let i = 0; i < 132; i++) load(tiles, `${TOWN}${String(i).padStart(4, '0')}.png`, i);
  for (const [k, spec] of Object.entries(MOBS)) load(mobs, MOB + spec.file, k);
  load(people, PEOPLE + 'soldier.png', 'soldier');
  load(people, PEOPLE + 'princess.png', 'princess');
  const dirt = new Image();
  dirt.onload = () => {
    const c = document.createElement('canvas');
    c.width = dirt.width; c.height = dirt.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(dirt, 0, 0);
    pathPx = { w: dirt.width, h: dirt.height, d: ctx.getImageData(0, 0, dirt.width, dirt.height).data };
    refresh = true;
  };
  dirt.src = `${TOWN}0014.png`;
}

export function takeArtRefresh() {
  const v = refresh;
  refresh = false;
  return v;
}

export function pathTint(wx, wy) {
  if (!pathPx) return null;
  const x = ((wx / 2) | 0) % pathPx.w;
  const y = ((wy / 2) | 0) % pathPx.h;
  const i = (y * pathPx.w + x) * 4;
  return [pathPx.d[i], pathPx.d[i + 1], pathPx.d[i + 2]];
}

function tile(i) { return tiles.get(i); }

export function drawKenneyProp(ctx, type) {
  const spec = TREES[type];
  if (!spec) return false;
  const rows = spec.tiles;
  if (!rows.every((row) => row.every((id) => tile(id)))) return false;
  const tw = 16 * spec.s;
  const totalH = rows.length * tw;
  ctx.imageSmoothingEnabled = false;
  rows.forEach((row, r) => {
    const x0 = -(row.length * tw) / 2;
    const y = -totalH + r * tw + 4;
    row.forEach((id, c) => ctx.drawImage(tile(id), x0 + c * tw, y, tw + 0.5, tw + 0.5));
  });
  return true;
}

export function drawKenneyHouse(ctx, kind, w, h) {
  const rows = HOUSES[kind] || HOUSES.house;
  if (!rows.every((row) => row.every((id) => tile(id)))) return false;
  const cols = rows[0].length;
  let tileW = Math.floor(w / cols);
  tileW -= tileW % 2;
  if (tileW < 18) tileW = 18;
  const tileH = tileW;
  const facadeW = tileW * cols;
  const x0 = Math.floor((w - facadeW) / 2);
  const baseY = h + 84;
  let y = baseY - rows.length * tileH;
  ctx.imageSmoothingEnabled = false;
  for (const row of rows) {
    row.forEach((id, c) => ctx.drawImage(tile(id), x0 + c * tileW, y, tileW + 1, tileH + 1));
    y += tileH;
  }
  return true;
}

export function mobKey(name, arch) {
  const n = name || '';
  if (/slime|ooze|blob/i.test(n)) return 'slime';
  if (/bat|crow|raven|wasp/i.test(n) || arch === 'flyer') return /bee|wasp/i.test(n) ? 'bee' : 'bat';
  if (/snake|serpent|worm/i.test(n)) return 'snake';
  if (/ghost|wisp|spirit|specter/i.test(n) || arch === 'ghost') return 'ghost';
  if (/flower|blossom|plant|vine/i.test(n) || arch === 'plant') return 'flower';
  return null;
}

export function drawSheetMob(ctx, key, t, dir, scale) {
  const spec = MOBS[key];
  const img = spec && mobs.get(key);
  if (!img) return false;
  const col = Math.floor((t || 0) * 6) % spec.cols;
  const row = dir < 0 ? 1 : 2;
  const sc = (scale || 1) * 2.1;
  ctx.drawImage(img, col * spec.cw, row * spec.ch, spec.cw, spec.ch, -spec.cw * sc / 2, -spec.ch * sc + 6, spec.cw * sc, spec.ch * sc);
  return true;
}

export function drawCastSprite(ctx, who, x, y, dir, anim, scale) {
  const img = people.get(who);
  if (!img) return false;
  const row = [2, 1, 3, 0][dir] ?? 2;
  const col = anim?.moving ? 1 + (Math.floor((anim.walk || 0) * 1.6) % 8) : 0;
  const S = 64;
  const sc = (scale || 1) * 1.15;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.drawImage(img, col * S, row * S, S, S, -S / 2, -S + 10, S, S);
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') preloadWorldArt();
