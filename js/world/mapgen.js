// Region / village / dungeon layout generation following GDD §3 zoning rules:
// central quest corridor, north/east elite pockets, one controlled dungeon entry,
// four farm slots, side-branch world boss arena, gathering paths crossing the route.
import { rng, fbm, clamp, hashStr, dist } from '../core/util.js';
import { GameMap, TILE } from './map.js';
import { THEMES } from '../data/content.js';

const T = TILE;

function catmull(pts, seg = 10) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function alongPath(path, t) {
  let total = 0;
  const L = [];
  for (let i = 0; i < path.length - 1; i++) { const d = dist(...path[i], ...path[i + 1]); L.push(d); total += d; }
  let want = total * t;
  for (let i = 0; i < L.length; i++) {
    if (want <= L[i]) {
      const k = want / L[i];
      const [ax, ay] = path[i], [bx, by] = path[i + 1];
      const ang = Math.atan2(by - ay, bx - ax);
      return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, ang, idx: i };
    }
    want -= L[i];
  }
  const p = path[path.length - 1];
  return { x: p[0], y: p[1], ang: 0, idx: path.length - 1 };
}

function baseFields(map, R, opt) {
  const s = map.seed;
  const th = map.theme;
  const liqThr = opt.liqThr ?? 0.62;
  map.fillNoise((x, y, k) => {
    map.gn[k] = fbm(x / 260, y / 260, s + 3, 3);
    let lq = fbm(x / 520, y / 520, s + 11, 4);
    lq = clamp((lq - liqThr) * 6 + 0.5, 0, 1);
    if (opt.coast) {
      const coastY = map.ph - (7 + fbm(x / 600, 1, s + 5, 2) * 7) * T;
      lq = Math.max(lq, clamp((y - coastY) / 80 + 0.5, 0, 1));
    }
    map.liq[k] = lq;
    // border walls
    const edge = Math.min(x, y, map.pw - x, map.ph - y);
    const wob = fbm(x / 180, y / 180, s + 21, 3) * 110;
    let wl = clamp((150 + wob - edge) / 60 + 0.5, 0, 1);
    if (opt.caveWalls) {
      const cw = fbm(x / 340, y / 340, s + 31, 4);
      wl = Math.max(wl, clamp((cw - 0.6) * 7 + 0.5, 0, 1));
    }
    map.wall[k] = wl;
  });
  if (th.liquid === 'chasm' || th.liquid === 'void') {
    // floating-island feel: extra liquid near map edges instead of plain walls
    map.fillNoise((x, y, k) => {
      const edge = Math.min(x, y, map.pw - x, map.ph - y);
      if (edge < 320) { map.liq[k] = Math.max(map.liq[k], clamp((320 - edge) / 90 - 0.6, 0, 1)); if (map.wall[k] > 0.5) { map.liq[k] = 1; map.wall[k] = 0.49; } }
    });
  }
}

function scatterProps(map, R, count, avoid) {
  const th = map.theme;
  const entries = Object.entries(th.props);
  const total = entries.reduce((a, [, w]) => a + w, 0);
  const pick = () => { let r = R() * total; for (const [k, w] of entries) { if ((r -= w) <= 0) return k; } return entries[0][0]; };
  let placed = 0, tries = 0;
  while (placed < count && tries++ < count * 8) {
    const x = R.range(T * 2, map.pw - T * 2), y = R.range(T * 2, map.ph - T * 2);
    if (map.sampleField(map.road, x, y) < 26) continue;
    if (map.sampleField(map.plaza, x, y) < 30) continue;
    if (map.isLiquid(x, y) || map.sampleField(map.wall, x, y) > 0.42) continue;
    if (avoid.some(([ax, ay, ar]) => (x - ax) ** 2 + (y - ay) ** 2 < ar * ar)) continue;
    // clustered density
    const dens = fbm(x / 400, y / 400, map.seed + 77, 2);
    if (R() > dens * 1.6) continue;
    const type = pick();
    map.addProp(type, x, y, R.int(0, 3));
    placed++;
  }
  // decorate walls with tall props for organic borders
  const wallProp = { dawn: 'oak', forest: 'bigtree', swamp: 'deadtree', ash: 'spire', cave: 'stalagmite', desert: 'rock', sky: 'pillar', snow: 'snowpine', void: 'voidcrystal' }[th.key] || 'rock';
  for (let i = 0; i < count * 0.6; i++) {
    const x = R.range(T, map.pw - T), y = R.range(T, map.ph - T);
    const w = map.sampleField(map.wall, x, y);
    if (w > 0.5 && w < 0.7 && map.sampleField(map.wall, x, y + 30) < 0.55) map.addProp(wallProp, x, y + 10, R.int(0, 3));
  }
}

function spawnsIn(map, R, zone, mobIdx, n, tier = 'Normal') {
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 20; k++) {
      const a = R() * Math.PI * 2, r = Math.sqrt(R()) * zone.r;
      const x = zone.x + Math.cos(a) * r, y = zone.y + Math.sin(a) * r;
      if (!map.blockedCircle(x, y, 16)) {
        map.spawns.push({ x, y, mob: Array.isArray(mobIdx) ? mobIdx[i % mobIdx.length] : mobIdx, tier, zone: zone.id });
        break;
      }
    }
  }
}

/** Field region (all regions except Dawnwatch village). */
export function generateRegion(region, meta) {
  const seed = hashStr(region.id);
  const R = rng(seed);
  const theme = { ...THEMES[meta.theme], key: meta.theme };
  const W = 100, H = 76;
  const map = new GameMap({ id: region.id, kind: 'field', W, H, theme, seed, name: region.name });
  const village = !!meta.village;
  baseFields(map, R, { coast: village, caveWalls: meta.theme === 'cave', liqThr: meta.theme === 'swamp' ? 0.55 : meta.theme === 'sky' ? 0.6 : meta.theme === 'desert' ? 0.7 : 0.63 });
  map.plazaColor = { dawn: '#b9ad98', forest: '#a89a7a', swamp: '#6a6a58', ash: '#6a5a50', cave: '#5a5060', desert: '#c8a878', sky: '#e8e4f0', snow: '#b8c4d0', void: '#4a3a5a' }[meta.theme];

  const P = map.pois;
  const cy = H * T * 0.5;
  // ---- main quest corridor
  const ctrl = [[4 * T, cy]];
  const n = 6;
  for (let i = 1; i <= n; i++) ctrl.push([(8 + (i / n) * (W - 16)) * T, clamp(cy + R.range(-0.2, 0.2) * H * T, H * T * 0.28, H * T * 0.72)]);
  ctrl.push([(W - 4) * T, ctrl[ctrl.length - 1][1]]);
  if (village) { ctrl[0] = [4 * T, cy]; ctrl[1] = [44 * T, cy]; }
  const main = catmull(ctrl, 12);
  map.mainRoad = main;
  map.addRoad(main, village ? 36 : 30);

  const hub = village ? { x: 27 * T, y: cy } : { x: 12 * T, y: alongPath(main, 0.04).y };
  P.hub = { ...hub, r: village ? 15 * T : 6 * T };
  P.spawn = { x: hub.x + (village ? 0 : 2 * T), y: hub.y + T };
  P.portalPrev = { x: 5.5 * T, y: alongPath(main, 0.0).y };
  const endPt = alongPath(main, 0.985);
  P.portalNext = { x: endPt.x - T, y: endPt.y };

  const branch = (from, to, w = 26) => {
    const mid = [(from[0] + to[0]) / 2 + R.range(-2, 2) * T, (from[1] + to[1]) / 2 + R.range(-2, 2) * T];
    const pts = catmull([from, mid, to], 10);
    map.addRoad(pts, w);
    return pts;
  };
  const off = (t, side, d) => {
    const p = alongPath(main, t);
    const nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
    return { x: clamp(p.x + nx * side * d, 10 * T, (W - 10) * T), y: clamp(p.y + ny * side * d, 10 * T, (H - 10) * T), base: p };
  };

  // ---- farm slots (GDD: solo, fast-respawn AoE, elite duo, resource hybrid)
  const farmT = village ? [0.52, 0.62, 0.72, 0.84] : [0.18, 0.36, 0.55, 0.74];
  P.farms = farmT.map((t, i) => {
    const o = off(t, i % 2 ? 1 : -1, 11 * T);
    branch([o.base.x, o.base.y], [o.x, o.y]);
    return { id: `farm${i}`, x: o.x, y: o.y, r: 5.5 * T };
  });
  // ---- elite pockets north/east
  P.elites = [
    { id: 'elite0', x: (W * 0.7) * T, y: 13 * T, r: 6 * T },
    { id: 'elite1', x: (W - 13) * T, y: (H * 0.3) * T, r: 6 * T },
  ];
  for (const e of P.elites) { const b = alongPath(main, e.x / map.pw); branch([b.x, b.y], [e.x, e.y]); }
  // ---- boss arena on side branch (south), dungeon entry (north)
  P.boss = { id: 'boss', x: (W * 0.6) * T, y: (H - 13) * T, r: 8 * T };
  { const b = alongPath(main, 0.6); branch([b.x, b.y], [P.boss.x, P.boss.y - 5 * T]); }
  P.dungeon = { id: 'dungeon', x: (W * 0.42) * T, y: 11 * T, r: 3 * T };
  { const b = alongPath(main, 0.42); branch([b.x, b.y], [P.dungeon.x, P.dungeon.y + T]); }

  // ---- quest points
  const q = (t, side, d, id, r = 3 * T) => { const o = off(t, side, d); return { id, x: o.x, y: o.y, r }; };
  P.investigate = q(village ? 0.62 : 0.3, 1, 7 * T, 'investigate');
  P.defend = q(village ? 0.5 : 0.46, -1, 5 * T, 'defend', 4 * T);
  P.escortStart = { x: hub.x + 3 * T, y: hub.y + 2 * T };
  P.escortEnd = q(0.66, 1, 3 * T, 'escortEnd');
  P.activates = [q(0.5, 1, 8 * T, 'act0'), q(0.62, -1, 8 * T, 'act1'), q(0.84, 1, 7 * T, 'act2')];
  P.event = q(0.8, -1, 6 * T, 'event', 4 * T);
  P.explore = [
    { id: 'ex0', x: 16 * T, y: 14 * T, r: 3 * T }, { id: 'ex1', x: (W * 0.35) * T, y: (H - 12) * T, r: 3 * T }, { id: 'ex2', x: (W - 12) * T, y: (H - 16) * T, r: 3 * T },
  ];
  P.miniboss = { id: 'miniboss', x: P.elites[1].x, y: P.elites[1].y, r: 4 * T };

  // clear liquids/walls around every POI
  const all = [P.hub, P.spawn, P.portalPrev, P.portalNext, ...P.farms, ...P.elites, P.boss, P.dungeon, P.investigate, P.defend, P.escortEnd, ...P.activates, P.event, ...P.explore];
  for (const p of all) map.clearArea(p.x, p.y, (p.r || 2 * T) + T);
  map.clearAlongRoads(40);

  // hub plaza
  if (village) buildVillage(map, R, hub);
  else buildCamp(map, R, hub);
  map.addPlaza(P.boss.x, P.boss.y, P.boss.r * 0.8);
  map.addPlaza(P.dungeon.x, P.dungeon.y, 2.4 * T);

  // gather nodes (18 per GDD)
  P.gathers = [];
  for (let i = 0, tries = 0; P.gathers.length < 18 && tries < 900; tries++) {
    const x = R.range(8 * T, map.pw - 8 * T), y = R.range(8 * T, map.ph - 8 * T);
    if (map.isLiquid(x, y) || map.sampleField(map.wall, x, y) > 0.35) continue;
    if (map.sampleField(map.road, x, y) < 30 || map.sampleField(map.plaza, x, y) < 60) continue;
    if (all.some((p) => dist(x, y, p.x, p.y) < (p.r || 2 * T) + T)) continue;
    if (P.gathers.some((g) => dist(x, y, g.x, g.y) < 6 * T)) continue;
    P.gathers.push({ x, y, kind: i++ % 3 === 0 ? 'herb' : i % 3 === 1 ? 'ore' : (meta.theme === 'snow' || meta.theme === 'void' ? 'special' : 'herb') });
  }

  // props
  const avoid = all.map((p) => [p.x, p.y, (p.r || 2 * T) + 20]);
  for (const g of P.gathers) avoid.push([g.x, g.y, 50]);
  for (const b of map.buildings) avoid.push([b.x + b.w / 2, b.y - b.h * 0.2, Math.max(b.w, b.h) * 0.7]);
  scatterProps(map, R, 520, avoid);
  // flat decal sprinkles everywhere
  const flatTypes = Object.keys(theme.props).filter((k) => ['flowers', 'reeds', 'bones', 'crack', 'rune', 'rubble', 'dune', 'root'].includes(k));
  for (let i = 0; i < 260 && flatTypes.length; i++) {
    const x = R.range(T * 3, map.pw - T * 3), y = R.range(T * 3, map.ph - T * 3);
    if (map.isLiquid(x, y) || map.sampleField(map.wall, x, y) > 0.45 || map.sampleField(map.road, x, y) < 10) continue;
    map.addProp(R.pick(flatTypes), x, y, R.int(0, 3));
  }
  // arena dressing
  const ringProp = { dawn: 'fence', forest: 'root', swamp: 'grave', ash: 'brazier', cave: 'crystal', desert: 'pillar', sky: 'pillar', snow: 'icespike', void: 'voidcrystal' }[meta.theme];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    if (Math.abs(a - Math.PI * 1.5) < 0.5) continue; // leave entrance to the north
    map.addProp(ringProp, P.boss.x + Math.cos(a) * P.boss.r, P.boss.y + Math.sin(a) * P.boss.r * 0.8, i);
  }
  if (meta.theme === 'swamp' || meta.theme === 'ash' || meta.theme === 'cave' || meta.theme === 'void') {
    for (let i = 0; i < 26; i++) { const p = alongPath(main, i / 26); const side = i % 2 ? 1 : -1; map.addProp(meta.theme === 'ash' ? 'brazier' : meta.theme === 'cave' ? 'glowshroom' : 'lantern', p.x - Math.sin(p.ang) * side * 55, p.y + Math.cos(p.ang) * side * 55, i); }
  }

  map.buildCollision();

  // ---- spawn nodes (GDD monster table: 6 normal + 4 elite per region)
  spawnsIn(map, R, P.farms[0], [0, 0, 0, 1], 7);
  spawnsIn(map, R, P.farms[1], [1, 2], 7);
  spawnsIn(map, R, P.farms[2], [3, 4, 3], 8);
  spawnsIn(map, R, P.farms[3], [5, 4], 7);
  spawnsIn(map, R, P.elites[0], [6, 7], 4, 'Elite');
  spawnsIn(map, R, P.elites[1], [8, 9], 4, 'Elite');
  map.questGuards = { investigate: P.investigate, activates: P.activates };
  map.buildMinimap();
  return map;
}

function buildCamp(map, R, hub) {
  map.addPlaza(hub.x, hub.y, 5 * T);
  const th = map.theme.key;
  const roof = { forest: '#6a8a3a', swamp: '#5a5a6a', ash: '#8a3a2a', cave: '#6a5a4a', desert: '#c8783a', sky: '#7a7ad0', snow: '#8a6a4a', void: '#4a2a6a' }[th] || '#8a5a3a';
  map.addBuilding('tent', hub.x - 4.5 * T, hub.y - 2.2 * T, 3 * T, 2.5 * T, roof);
  map.addBuilding('tent', hub.x + 1.5 * T, hub.y - 2.6 * T, 3 * T, 2.5 * T, roof);
  map.addProp(th === 'cave' ? 'glowshroom' : th === 'void' ? 'voidcrystal' : 'brazier', hub.x - 5 * T, hub.y + 3 * T);
  map.addProp(th === 'cave' ? 'crystal' : 'brazier', hub.x + 5 * T, hub.y + 3 * T);
  map.campfire = { x: hub.x, y: hub.y + 0.6 * T };
  map.lights.push({ x: hub.x, y: hub.y, r: 260, color: '#ffb060' });
  // NPC spots around plaza
  const spots = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * 0.95 + (i / 9) * Math.PI * 1.9;
    spots.push({ x: hub.x + Math.cos(a) * 3.6 * T, y: hub.y + Math.sin(a) * 2.6 * T + 0.4 * T });
  }
  map.npcSpots = spots;
}

function buildVillage(map, R, hub) {
  map.addPlaza(hub.x, hub.y, 5.5 * T);
  map.floorColor = null;
  // GDD §4: north class halls, west blacksmith/crafting, south-west auction, south inn/storage, east guild hall & event plaza
  const B = [
    { kind: 'hall', label: 'Class Halls', x: hub.x - 4 * T, y: hub.y - 8 * T, w: 8 * T, h: 4 * T, roof: '#3a5aa8', npc: ['trainer'] },
    { kind: 'smith', label: 'Blacksmith', x: hub.x - 17 * T, y: hub.y - 2 * T, w: 6 * T, h: 3.5 * T, roof: '#7a5a4a', npc: ['smith'] },
    { kind: 'house', label: 'Alchemist', x: hub.x - 16 * T, y: hub.y - 8 * T, w: 5 * T, h: 3 * T, roof: '#5a8a4a', npc: ['alchemy'] },
    { kind: 'house', label: 'Auction House', x: hub.x - 15 * T, y: hub.y + 7 * T, w: 7 * T, h: 3.5 * T, roof: '#a8883a', npc: ['auction'] },
    { kind: 'house', label: 'Inn / Storage', x: hub.x - 4 * T, y: hub.y + 10 * T, w: 7 * T, h: 4 * T, roof: '#9a3a2a', npc: ['storage'] },
    { kind: 'hall', label: 'Guild Hall', x: hub.x + 9 * T, y: hub.y + 8 * T, w: 7 * T, h: 4 * T, roof: '#4a3a7a', npc: ['guild'] },
    { kind: 'chapel', label: 'Chapel', x: hub.x + 8 * T, y: hub.y - 8 * T, w: 5 * T, h: 4 * T, roof: '#c8c0b0', npc: ['healer'] },
    { kind: 'house', label: 'Stable', x: hub.x + 16 * T, y: hub.y - 5 * T, w: 5 * T, h: 3 * T, roof: '#8a6a3a', npc: ['stable'] },
    { kind: 'house', label: 'Stylist', x: hub.x + 3 * T, y: hub.y + 10 * T, w: 4 * T, h: 3 * T, roof: '#c86a9a', npc: ['stylist'] },
  ];
  map.villageBuildings = [];
  for (const b of B) {
    const bb = map.addBuilding(b.kind, b.x, b.y, b.w, b.h, b.roof, b.label);
    bb.door = { x: b.x + b.w / 2, y: b.y + T * 0.6 };
    bb.service = b.npc[0];
    map.villageBuildings.push(bb);
    map.addRoad([[hub.x, hub.y], [bb.door.x, bb.door.y + T * 0.5]], 22);
    map.clearArea(b.x + b.w / 2, b.y - b.h / 2, Math.max(b.w, b.h) * 0.7);
  }
  map.addPlaza(hub.x + 16 * T, hub.y + 1.5 * T, 3 * T); // event/portal plaza
  map.portalPlaza = { x: hub.x + 16 * T, y: hub.y + 1.5 * T };
  map.clearArea(hub.x, hub.y, 8 * T);
  map.addProp('lantern', hub.x - 5 * T, hub.y - 4 * T); map.addProp('lantern', hub.x + 5 * T, hub.y - 4 * T);
  map.addProp('lantern', hub.x - 5 * T, hub.y + 4 * T); map.addProp('lantern', hub.x + 5 * T, hub.y + 4 * T);
  map.fountain = { x: hub.x, y: hub.y };
  // fields & fences east of village
  for (let i = 0; i < 6; i++) map.addProp('fence', hub.x + (22 + i * 1.8) * T, hub.y - 6 * T);
  for (let i = 0; i < 6; i++) map.addProp('fence', hub.x + (22 + i * 1.8) * T, hub.y + 6.5 * T);
  map.npcSpots = [];
}

/** Instanced dungeon: chain of rooms left→right. bosses: number of boss rooms (raid wings). */
export function generateDungeon(name, themeKey, bossCount = 1, seedExtra = 0) {
  const seed = hashStr(name) + seedExtra;
  const R = rng(seed);
  const theme = { ...THEMES[themeKey], key: themeKey };
  const rooms = [];
  const nRooms = Math.max(5, bossCount + 4);
  const W = 16 + nRooms * 17, H = 44;
  const map = new GameMap({ id: 'DGN_' + name, kind: 'dungeon', W, H, theme, seed, name });
  map.floor = new Uint8Array(W * H);
  map.floorColor = { dawn: '#8a8478', forest: '#5a6a48', swamp: '#4a5248', ash: '#5a4640', cave: '#4a4052', desert: '#b89a6a', sky: '#b8b4c8', snow: '#a8b8c8', void: '#34283e' }[themeKey];
  const carve = (x0, y0, x1, y1) => { for (let y = Math.max(1, y0); y <= Math.min(H - 2, y1); y++) for (let x = Math.max(1, x0); x <= Math.min(W - 2, x1); x++) map.floor[y * W + x] = 1; };
  let x = 3;
  for (let i = 0; i < nRooms; i++) {
    const big = i >= nRooms - bossCount;
    const rw = big ? R.int(13, 15) : R.int(9, 12), rh = big ? R.int(13, 15) : R.int(8, 12);
    const ry = clamp(Math.round(H / 2 - rh / 2 + R.range(-6, 6)), 2, H - rh - 2);
    const room = { x0: x, y0: ry, x1: x + rw, y1: ry + rh, cx: (x + rw / 2) * T, cy: (ry + rh / 2) * T, boss: big, i };
    carve(room.x0, room.y0, room.x1, room.y1);
    if (rooms.length) {
      const p = rooms[rooms.length - 1];
      const ya = Math.round(p.cy / T), yb = Math.round(room.cy / T);
      const mx = p.x1 + 1;
      carve(p.x1 - 1, ya - 1, mx + 1, ya + 1);
      carve(mx - 1, Math.min(ya, yb) - 1, mx + 1, Math.max(ya, yb) + 1);
      carve(mx - 1, yb - 1, room.x0 + 1, yb + 1);
    }
    rooms.push(room);
    x += rw + R.int(4, 6);
  }
  map.rooms = rooms;
  map.fillNoise((px, py, k) => {
    map.gn[k] = fbm(px / 200, py / 200, seed, 3);
    const lq = themeKey === 'ash' || themeKey === 'void' || themeKey === 'swamp' ? fbm(px / 300, py / 300, seed + 4, 3) : 0;
    map.liq[k] = lq > 0.68 ? 0.8 : 0.2;
  });
  for (const r of rooms) map.clearArea(r.cx, r.cy, 5 * T);
  // doorway clear
  for (let i = 0; i < rooms.length - 1; i++) map.clearArea((rooms[i].x1 + 2) * T, rooms[i].cy, 3 * T);
  const start = rooms[0];
  map.pois = { spawn: { x: (start.x0 + 2) * T, y: start.cy }, exit: { x: (start.x0 + 1.5) * T, y: start.cy - 2 * T } };
  // dressing
  const dress = { dawn: 'pillar', forest: 'root', swamp: 'grave', ash: 'brazier', cave: 'crystal', desert: 'pillar', sky: 'pillar', snow: 'icespike', void: 'voidcrystal' }[themeKey];
  for (const r of rooms) {
    for (const [dx, dy] of [[1.5, 1.5], [-1.5, 1.5], [1.5, -0.5], [-1.5, -0.5]]) {
      const px = (dx > 0 ? r.x0 + dx : r.x1 + dx) * T, py = (dy > 0 ? r.y0 + dy + 0.5 : r.y1 + dy) * T;
      map.addProp(dress, px, py, R.int(0, 3));
    }
    map.addProp('brazier', r.cx, (r.y0 + 1.2) * T);
    for (let i = 0; i < 4; i++) map.addProp(R.pick(['rubble', 'bones', themeKey === 'sky' ? 'rune' : 'rubble']), R.range(r.x0 + 1, r.x1 - 1) * T, R.range(r.y0 + 1, r.y1 - 1) * T);
  }
  map.lights.push(...rooms.map((r) => ({ x: r.cx, y: r.cy, r: 300, color: '#ffc080' })));
  map.buildCollision();
  map.buildMinimap();
  return map;
}

/** Circular PvP arena (GDD §14 Ranked 3v3). */
export function generateArena() {
  const theme = { ...THEMES.sky, key: 'sky' };
  const W = 36, H = 28;
  const map = new GameMap({ id: 'ARENA', kind: 'arena', W, H, theme, seed: 4242, name: 'Astral Arena' });
  map.floor = new Uint8Array(W * H);
  map.floorColor = '#b8b0c8';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (((x - W / 2) / 15) ** 2 + ((y - H / 2) / 11) ** 2 < 1) map.floor[y * W + x] = 1;
  map.fillNoise((px, py, k) => { map.gn[k] = fbm(px / 200, py / 200, 9, 3); map.liq[k] = 0.2; });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; map.addProp('pillar', (W / 2 + Math.cos(a) * 13.2) * T, (H / 2 + Math.sin(a) * 9.4) * T, i); }
  map.addProp('rune', (W / 2) * T, (H / 2) * T);
  map.pois = { spawn: { x: (W / 2 - 9) * T, y: (H / 2) * T }, enemy: { x: (W / 2 + 9) * T, y: (H / 2) * T }, exit: { x: (W / 2 - 11) * T, y: (H / 2 - 3) * T } };
  map.lights.push({ x: (W / 2) * T, y: (H / 2) * T, r: 800, color: '#c0c8ff' });
  map.buildCollision();
  map.buildMinimap();
  return map;
}
