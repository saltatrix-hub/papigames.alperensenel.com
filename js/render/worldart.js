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
  oak: [5, 16],
  bigtree: [5, 16],
  pine: [4, 6],
  snowpine: [8, 10],
  bush: [7, 18],
  palm: [8],
};
const HOUSES = {
  house: [48, 49, 50, 51, 60, 61, 62, 63],
  hall: [52, 53, 54, 55, 64, 65, 66, 67],
  chapel: [48, 49, 50, 51, 60, 61, 62, 63],
  smith: [52, 53, 54, 55, 64, 65, 66, 67],
  tent: [8, 9, 10, 11],
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
  for (const list of Object.values(TREES)) for (const id of list) ids.add(id);
  for (const list of Object.values(HOUSES)) for (const id of list) ids.add(id);
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
  const ids = TREES[type];
  if (!ids || !ids.every((id) => tile(id))) return false;
  const s = 5;
  const tw = 16 * s;
  ids.forEach((id, n) => {
    const img = tile(id);
    ctx.drawImage(img, -tw / 2 + (n % 2) * (tw * 0.15), -tw * (ids.length - n) * 0.72, tw, tw);
  });
  return true;
}

export function drawKenneyHouse(ctx, kind, w, h) {
  const ids = HOUSES[kind] || HOUSES.house;
  if (!ids.every((id) => tile(id))) return false;
  const cols = ids.length > 4 ? 4 : ids.length;
  const rows = Math.ceil(ids.length / cols);
  const cw = w / cols;
  const ch = Math.min(h, w * 0.7) / rows;
  const top = -h * 0.15 - rows * ch;
  ids.forEach((id, n) => {
    const img = tile(id);
    const c = n % cols;
    const r = (n / cols) | 0;
    ctx.drawImage(img, c * cw, top + r * ch, cw + 1, ch + 1);
  });
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
