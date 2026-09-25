// Procedural character / monster / prop art. All art is drawn with canvas primitives
// following the GDD identity colours (class_config.json "color").
import { TAU, shade, rgba, makeCanvas, hashStr, rng, mix } from '../core/util.js';
import { itemPng, skillPng, slotPng } from '../data/icons.js';
import { drawLpcHero, lpcReady } from './lpc.js';

// ------------------------------------------------------------------ helpers
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ell(ctx, x, y, rx, ry, fill, stroke) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}
function poly(ctx, pts, fill, stroke, lw = 1.5) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}
const OUT = 'rgba(20,14,24,0.85)';

export function shadow(ctx, x, y, r, a = 0.28) {
  ell(ctx, x, y, r, r * 0.38, `rgba(0,0,0,${a})`);
}

// ------------------------------------------------------------------ weapons
function drawWeapon(ctx, kind, look, t) {
  ctx.lineWidth = 1.5; ctx.strokeStyle = OUT;
  switch (kind) {
    case 'sword':
      rr(ctx, -1.5, -4, 3, 6, 1); ctx.fillStyle = '#5a3a20'; ctx.fill(); ctx.stroke();
      rr(ctx, -5, -6, 10, 2.5, 1); ctx.fillStyle = look.trim; ctx.fill(); ctx.stroke();
      poly(ctx, [-2.2, -6, 2.2, -6, 1.6, -26, 0, -30, -1.6, -26], '#e6ebf2', OUT);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-0.5, -26, 1, 19);
      break;
    case 'axe':
      rr(ctx, -1.8, -34, 3.6, 38, 1.5); ctx.fillStyle = '#4a2e1a'; ctx.fill(); ctx.stroke();
      poly(ctx, [1, -33, 15, -38, 18, -28, 15, -18, 1, -22], '#b8bcc6', OUT);
      poly(ctx, [-1, -31, -9, -34, -10, -26, -1, -24], '#9a9ea8', OUT);
      ctx.fillStyle = '#8e1f1f'; ctx.fillRect(-2, -12, 4, 4);
      break;
    case 'dagger':
      rr(ctx, -1.3, -3, 2.6, 5, 1); ctx.fillStyle = '#2a2030'; ctx.fill();
      poly(ctx, [-2, -3, 2, -3, 3, -10, 0, -17, -1.5, -10], '#d8d8e8', OUT, 1);
      ctx.fillStyle = look.trim; ctx.fillRect(-3, -4, 6, 1.6);
      break;
    case 'bow':
      ctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = '#6a4424';
      ctx.arc(-6, 0, 16, -1.2, 1.2); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = look.trim; ctx.beginPath(); ctx.arc(-6, 0, 16, -0.25, 0.25); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.strokeStyle = '#f0f0e0';
      ctx.beginPath(); ctx.moveTo(-6 + 16 * Math.cos(-1.2), 16 * Math.sin(-1.2)); ctx.lineTo(-6 - t * 6, 0); ctx.lineTo(-6 + 16 * Math.cos(1.2), 16 * Math.sin(1.2)); ctx.stroke();
      break;
    case 'staff':
      rr(ctx, -1.6, -34, 3.2, 44, 1.5); ctx.fillStyle = '#5a3a24'; ctx.fill(); ctx.stroke();
      poly(ctx, [0, -44, 6, -36, 0, -30, -6, -36], look.metal, OUT);
      ctx.save(); ctx.shadowColor = '#7fd0ff'; ctx.shadowBlur = 12;
      ell(ctx, 0, -37, 4.2, 4.2, '#bfe8ff'); ctx.restore();
      ell(ctx, -1, -38.5, 1.5, 1.5, '#ffffff');
      break;
    case 'mace':
      rr(ctx, -1.5, -20, 3, 24, 1.2); ctx.fillStyle = '#6a4a2a'; ctx.fill(); ctx.stroke();
      ell(ctx, 0, -23, 5.5, 5.5, '#e8c860', OUT);
      ctx.save(); ctx.shadowColor = '#fff4b0'; ctx.shadowBlur = 8; ell(ctx, 0, -23, 2.2, 2.2, '#fffbe0'); ctx.restore();
      break;
    case 'shield':
      poly(ctx, [-8, -12, 8, -12, 8, 2, 0, 12, -8, 2], look.body, OUT);
      poly(ctx, [-5.5, -9.5, 5.5, -9.5, 5.5, 1, 0, 8.5, -5.5, 1], null, look.trim, 1.6);
      ctx.fillStyle = look.trim; ctx.fillRect(-1, -8, 2, 13); ctx.fillRect(-4.5, -4, 9, 2);
      break;
    case 'tome':
      rr(ctx, -6, -7, 12, 14, 1.5); ctx.fillStyle = '#8a1e1e'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8c860'; ctx.fillRect(-4, -5, 8, 1.4); ctx.fillRect(-0.7, -3, 1.4, 6);
      break;
  }
}

const CLASS_WEAPONS = {
  Knight: ['sword', 'shield'], Berserker: ['axe', null], Assassin: ['dagger', 'dagger'],
  Ranger: ['bow', null], Mage: ['staff', null], Priest: ['mace', 'tome'],
};

// ------------------------------------------------------------------ heroes
/**
 * Draw a chibi hero. dir: 0=down,1=left,2=right,3=up. anim: { walk, attack(0..1|-1), cast }.
 * look: colours; cls: class id (weapons/silhouette) or 'npc'.
 */
export function drawHero(ctx, x, y, cls, look, dir, anim, scale = 1, opts = {}) {
  if (lpcReady()) {
    if (opts.mount) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      drawMount(ctx, opts.mount, dir, anim.walk || 0, anim.moving);
      ctx.restore();
    }
    drawLpcHero(ctx, x, y, cls, look, dir, anim, scale, opts);
    return;
  }
  const walk = anim.walk || 0;
  const moving = anim.moving;
  const atk = anim.attack >= 0 ? anim.attack : -1;
  const bob = moving ? Math.abs(Math.sin(walk * 2)) * 1.6 : Math.sin(anim.time * 2.2) * 0.6;
  const robe = cls === 'Mage' || cls === 'Priest' || look.robe;
  const [wMain, wOff] = CLASS_WEAPONS[cls] || [look.weapon || null, null];
  const side = dir === 1 || dir === 2;
  const flip = dir === 1 ? -1 : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (!opts.noShadow) shadow(ctx, 0, 0, 13);
  if (opts.mount) drawMount(ctx, opts.mount, dir, walk, moving);
  const lift = opts.mount ? -12 : 0;
  ctx.translate(0, lift - bob);
  if (side) ctx.scale(flip, 1);

  const legSwing = moving ? Math.sin(walk * 2) * 4 : 0;
  const skin = look.skin || '#f2d0b0';
  ctx.lineWidth = 1.5; ctx.strokeStyle = OUT;

  // cape (behind)
  const capeCol = look.cape || shade(look.body, -0.25);
  const drawCape = (front) => {
    const sway = moving ? Math.sin(walk * 2 + 1) * 2 : Math.sin(anim.time * 1.5);
    if (side) poly(ctx, [-3, -28, -6, -28, -12 - sway, -4, -4, -5], capeCol, OUT);
    else poly(ctx, [-9, -29, 9, -29, 11 + sway * 0.5, front ? -3 : -4, -11 - sway * 0.5, front ? -3 : -4], front ? capeCol : shade(capeCol, -0.2), OUT);
  };
  if (dir !== 3 && (look.cape || cls === 'Knight' || cls === 'Berserker' || cls === 'Assassin' || cls === 'Ranger' || cls === 'Priest')) drawCape(false);

  // off-hand weapon behind body when facing up
  const armY = -24;
  const drawArm = (sx, front, holding) => {
    const swingA = holding && atk >= 0 ? atkAngle(cls, atk) : (moving ? Math.sin(walk * 2 + (front ? 0 : Math.PI)) * 0.4 : 0.05);
    ctx.save();
    ctx.translate(sx, armY);
    ctx.rotate(swingA);
    rr(ctx, -2.6, -1, 5.2, 11, 2.4); ctx.fillStyle = robe ? look.body : shade(look.body, -0.08); ctx.fill(); ctx.stroke();
    ell(ctx, 0, 10.5, 2.6, 2.6, cls === 'Knight' ? look.metal : skin, OUT);
    if (holding) {
      ctx.translate(0, 10);
      const wk = holding;
      if (wk === 'bow') ctx.rotate(-swingA + (side ? 0 : 0));
      if (wk === 'shield') ctx.rotate(-swingA);
      drawWeapon(ctx, wk, look, atk >= 0 ? Math.sin(atk * Math.PI) : 0);
    }
    ctx.restore();
  };

  if (dir === 3) { if (wOff) drawArm(-9, false, wOff); if (wMain) drawArm(9, true, wMain); }
  else if (side && wOff) drawArm(-4, false, wOff);
  else if (side) drawArm(-4, false, null);

  // legs
  if (!robe) {
    ctx.fillStyle = shade(look.body, -0.35);
    rr(ctx, -6 + (side ? legSwing * 0.5 : 0), -12 + (side ? 0 : Math.max(0, legSwing) * 0.3), 5, 12 - (side ? 0 : Math.max(0, legSwing) * 0.3), 2); ctx.fill(); ctx.stroke();
    rr(ctx, 1 - (side ? legSwing * 0.5 : 0), -12 + (side ? 0 : Math.max(0, -legSwing) * 0.3), 5, 12 - (side ? 0 : Math.max(0, -legSwing) * 0.3), 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = cls === 'Knight' ? look.metal : '#3a2a20';
    rr(ctx, -6.5 + (side ? legSwing * 0.5 : 0), -3, 6, 3.5, 1.5); ctx.fill();
    rr(ctx, 0.5 - (side ? legSwing * 0.5 : 0), -3, 6, 3.5, 1.5); ctx.fill();
  } else {
    ctx.fillStyle = '#2a2020';
    rr(ctx, -5 + legSwing * 0.4, -4, 4.5, 4, 1.5); ctx.fill();
    rr(ctx, 0.5 - legSwing * 0.4, -4, 4.5, 4, 1.5); ctx.fill();
  }

  // torso / robe
  if (robe) {
    poly(ctx, [-8, -30, 8, -30, 11, -2, -11, -2], look.body, OUT);
    ctx.fillStyle = look.trim;
    ctx.fillRect(-11, -4.5, 22, 2.5);
    if (!side && dir === 0) { ctx.fillRect(-1.2, -28, 2.4, 25); }
    if (cls === 'Priest' && dir === 0) { ctx.fillStyle = '#a82a2a'; ctx.fillRect(-4.5, -28, 2, 24); ctx.fillRect(2.5, -28, 2, 24); }
  } else {
    rr(ctx, -8.5, -31, 17, 20, 4); ctx.fillStyle = look.body; ctx.fill(); ctx.stroke();
    if (cls === 'Knight') {
      rr(ctx, -7, -30, 14, 10, 3); ctx.fillStyle = look.metal; ctx.fill();
      ctx.fillStyle = look.trim; if (dir === 0) { ctx.fillRect(-1, -29, 2, 8); ctx.fillRect(-3.5, -26.5, 7, 2); }
    }
    if (look.fur || cls === 'Berserker') { ell(ctx, -6, -30, 5.5, 4, '#e8dcc8', OUT); ell(ctx, 6, -30, 5.5, 4, '#e8dcc8', OUT); }
    ctx.fillStyle = look.trim; ctx.fillRect(-8.5, -15.5, 17, 3);
    if (look.apron) { ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-6, -22, 12, 12); }
  }
  if (cls === 'Knight' && !side) { ell(ctx, -9, -28, 4.5, 3.5, look.metal, OUT); ell(ctx, 9, -28, 4.5, 3.5, look.metal, OUT); }

  // head
  ctx.save();
  ctx.translate(0, -39);
  const hr = 10.5;
  if (look.hat === 'helm' || (cls === 'Knight' && look.helm)) {
    ell(ctx, 0, 0, hr, hr, look.metal, OUT);
  } else {
    ell(ctx, 0, 0, hr, hr, skin, OUT);
  }
  const hair = look.hair || '#5a3a20';
  const hood = look.hat === 'hood' || cls === 'Assassin' || cls === 'Ranger';
  if (dir === 3) {
    ell(ctx, 0, -0.5, hr, hr, hood ? (look.hoodCol || look.cape || look.body) : hair, OUT);
  } else if (hood) {
    const hc = look.hoodCol || (cls === 'Priest' ? '#f6f2e8' : look.cape || look.body);
    ctx.beginPath(); ctx.arc(0, 0, hr + 1.8, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(hr + 2, 7); ctx.lineTo(-hr - 2, 7); ctx.closePath();
    ctx.fillStyle = hc; ctx.fill(); ctx.stroke();
    ell(ctx, side ? 3 : 0, 2, side ? 6.5 : 8, 7.5, skin);
    ctx.fillStyle = hair; ctx.fillRect(side ? -2 : -6.5, -5, side ? 10 : 13, 3);
    if (cls === 'Assassin') { ctx.fillStyle = '#2a2238'; ctx.fillRect(side ? -1 : -8, 3, side ? 11 : 16, 5); }
  } else if (look.hat === 'turban') {
    ell(ctx, 0, -4, hr + 1, 7, look.trim, OUT); ell(ctx, 0, -9, 4, 3, look.body);
  } else if (look.hat === 'fur') {
    ell(ctx, 0, -6, hr + 2, 6, '#d8ccb8', OUT);
  } else if (look.hat === 'wizard') {
    poly(ctx, [-hr - 3, -4, hr + 3, -4, 2, -24], look.body, OUT);
  } else if (!(look.hat === 'helm')) {
    // hair
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(0, -1, hr + 0.5, Math.PI, 0); ctx.lineTo(hr + 0.5, 2); ctx.lineTo(side ? -2 : 5, -3); ctx.lineTo(side ? -6 : -5, -3); ctx.lineTo(-hr - 0.5, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (cls === 'Berserker' || look.longHair) { ctx.fillRect(side ? -11 : -11, -1, 4, 12); if (!side) ctx.fillRect(7, -1, 4, 12); }
    if (cls === 'Priest') { ctx.fillStyle = hair; ctx.fillRect(-11, 0, 4, 13); ctx.fillRect(7, 0, 4, 13); }
  }
  if (look.hat === 'helm') {
    ctx.fillStyle = OUT;
    if (dir === 0) ctx.fillRect(-6, -1, 12, 2.5); else if (side) ctx.fillRect(1, -1, 9, 2.5);
    ctx.fillStyle = look.trim; ctx.fillRect(-1, -hr, 2, 7);
  }
  // face
  if (dir !== 3 && look.hat !== 'helm') {
    ctx.fillStyle = '#2a1a1a';
    if (side) { ctx.fillRect(4, 0, 2, 3); }
    else { ctx.fillRect(-4.5, 0, 2, 3); ctx.fillRect(2.5, 0, 2, 3); }
    if (opts.blink) { ctx.fillStyle = skin; ctx.fillRect(-5, 0, 11, 2); }
  }
  if (cls === 'Priest' && dir !== 3) { ctx.fillStyle = look.trim; ctx.beginPath(); ctx.arc(0, -hr - 1, 4, Math.PI, 0); ctx.fill(); }
  ctx.restore();

  // costume aura/halo
  if (look.halo) {
    ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = look.halo; ctx.lineWidth = 2; ctx.shadowColor = look.halo; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(0, -53, 8, 2.5, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }

  // front arms + weapons
  if (dir === 0) { drawArm(-10, false, wOff); drawArm(10, true, wMain); }
  else if (side) drawArm(3, true, wMain);
  if (dir === 3 && (look.cape || cls !== 'Mage')) drawCape(true);

  ctx.restore();
}

function atkAngle(cls, t) {
  // t 0..1 swing progress
  switch (cls) {
    case 'Knight': case 'Berserker': return -2.2 + t * 3.2;
    case 'Assassin': return -1.2 + Math.sin(t * Math.PI) * 1.8;
    case 'Ranger': return -1.45;
    default: return -0.9 - Math.sin(t * Math.PI) * 0.8;
  }
}

function drawMount(ctx, mount, dir, walk, moving) {
  const col = mount === 'stag' ? '#bfe6ff' : mount === 'drake' ? '#c4863a' : '#8a5a34';
  const side = dir === 1 || dir === 2;
  ctx.save();
  if (dir === 1) ctx.scale(-1, 1);
  const leg = moving ? Math.sin(walk * 2.4) * 4 : 0;
  ctx.lineWidth = 1.5; ctx.strokeStyle = OUT;
  if (side) {
    ctx.fillStyle = shade(col, -0.2);
    for (const [lx, s] of [[-12, 1], [-6, -1], [8, 1], [13, -1]]) { rr(ctx, lx + leg * s * 0.4, -12, 3.5, 12, 1.5); ctx.fill(); }
    rr(ctx, -16, -22, 34, 13, 6); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
    poly(ctx, [14, -20, 24, -34, 30, -30, 22, -16], col, OUT);
    if (mount === 'stag') { ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(25, -33); ctx.lineTo(22, -44); ctx.moveTo(24, -38); ctx.lineTo(18, -42); ctx.moveTo(27, -33); ctx.lineTo(32, -43); ctx.stroke(); }
    if (mount === 'drake') { poly(ctx, [-4, -22, 4, -36, 8, -22], shade(col, -0.2), OUT); }
  } else {
    ctx.fillStyle = shade(col, -0.2);
    rr(ctx, -7, -12, 4, 12, 1.5); ctx.fill(); rr(ctx, 3, -12, 4, 12, 1.5); ctx.fill();
    rr(ctx, -10, -24, 20, 16, 7); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
    if (dir === 0) { ell(ctx, 0, -26, 6, 7, col, OUT); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-3, -27, 1.6, 1.6); ctx.fillRect(1.4, -27, 1.6, 1.6); }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ monsters
const ARCH_RULES = [
  ['bug', /beetle|crab|scorpion|spider|creeper|chitin|crawler|velkra|hive|queen/i],
  ['flyer', /crow|hawk|vulture|harpy|drake|bat/i],
  ['serpent', /snake|worm|wyrm|khar|tyrant|devourer|eater/i],
  ['blob', /slime|leech|toad|mossling|glowcap|sprite|wisp|lumen|ether|bloom/i],
  ['plant', /entling|rootling|vine|treant|thornmaw|fungal|briar|sap/i],
  ['ghost', /shade|wraith|ghast|djinn|horror|voidfiend|ferryman|nereza|herald|xyron|oracle|choir/i],
  ['golem', /golem|sentinel|scarecrow|elemental|revenant|arbiter|colossus|golm|kragmar|warden|obelisk|keeper|star eater|brute|guard|aurel/i],
  ['quad', /boar|rat|hound|wolf|ram|doe|goat|icefang|matriarch|fang/i],
  ['seraph', /seraph|malzor|cantor|seraphim|apostle|hand/i],
];
export function archetypeOf(name) {
  for (const [a, re] of ARCH_RULES) if (re.test(name)) return a;
  return 'humanoid';
}

const NAME_COLORS = [
  [/copper/i, '#c8783a'], [/ember|cinder|flame|lava|molten|char|scorch|magma|golm|kragmar/i, '#e0602a'], [/frost|ice|snow|rime|glacial|icefang|veylthra/i, '#9fd4f0'],
  [/void|abyss|null|rift|eclipse|black|malzor|xyron|star/i, '#8a4ad8'], [/sand|dune|sun|mirage|dust|bone nomad|khar/i, '#d8b068'],
  [/crystal|arcane|ether|halo|rune|lumen|celest/i, '#a0a8ff'], [/bog|mire|marsh|swamp|coffin|grave|rot|blight/i, '#6a8a6a'],
  [/forest|briar|vine|moss|thorn|root|sap|bloom|bramble|doe/i, '#5aa048'], [/boar|rat|hound|wolf|ram/i, '#8a6a4a'],
  [/bandit|thug|raider|garrick/i, '#a03030'], [/skeleton|bone/i, '#e0dcc8'], [/crow|raven/i, '#2a2a3a'], [/slime/i, '#6ad0a0'],
];
export function monsterColor(name, fallback = '#8a7a6a') {
  for (const [re, c] of NAME_COLORS) if (re.test(name)) return c;
  return fallback;
}

/** Draw a monster at feet position. m: { name, arch, color, size, dir(-1|1), t, atk(0..1|-1), boss, eliteGlow } */
export function drawMonster(ctx, x, y, m) {
  const s = m.size || 1;
  const c = m.color;
  const dark = shade(c, -0.35), light = shade(c, 0.3);
  const t = m.t || 0;
  const lunge = m.atk >= 0 ? Math.sin(m.atk * Math.PI) : 0;
  ctx.save();
  ctx.translate(x, y);
  shadow(ctx, 0, 0, 14 * s, m.arch === 'ghost' || m.arch === 'flyer' ? 0.18 : 0.3);
  ctx.scale(s * (m.dir || 1), s);
  if (m.flash) ctx.filter = 'brightness(2.6)';
  ctx.lineWidth = 1.6 / s + 0.4; ctx.strokeStyle = OUT;
  const bob = Math.sin(t * 3) * 1.2;
  ctx.translate(lunge * 6, 0);

  if (m.aura) {
    ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(t * 3) * 0.1;
    const g = ctx.createRadialGradient(0, -14, 2, 0, -14, 30);
    g.addColorStop(0, m.aura); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -14, 30, 0, TAU); ctx.fill(); ctx.restore();
  }

  switch (m.arch) {
    case 'quad': {
      const leg = m.moving ? Math.sin(t * 12) * 3 : 0;
      ctx.fillStyle = dark;
      for (const [lx, sg] of [[-9, 1], [-4, -1], [5, 1], [10, -1]]) { rr(ctx, lx + leg * sg * 0.5, -8, 3.5, 8, 1.5); ctx.fill(); }
      ell(ctx, 0, -12 + bob * 0.3, 14, 8, c, OUT);
      ell(ctx, 0, -9, 10, 4, light);
      ell(ctx, 13, -15 + bob * 0.3, 7, 6, c, OUT);
      poly(ctx, [16, -14, 23, -12, 16, -9], shade(c, -0.1), OUT);
      if (/boar/i.test(m.name)) { poly(ctx, [18, -11, 22, -16, 20, -10], '#f4f0e0'); }
      if (/ram|goat|doe/i.test(m.name)) { ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(11, -21, 4, Math.PI, TAU * 0.9); ctx.stroke(); }
      else poly(ctx, [10, -20, 12, -26, 14, -20], dark, OUT);
      poly(ctx, [-13, -14, -21, -18 + Math.sin(t * 6) * 2, -14, -10], dark, OUT);
      ctx.fillStyle = m.eye || '#ffdd44'; ctx.fillRect(15, -17, 2.2, 2.2);
      break;
    }
    case 'bug': {
      const leg = Math.sin(t * 14) * 2;
      ctx.strokeStyle = dark; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 6, -8); ctx.lineTo(i * 8 - 4, -2 + (i % 2 ? leg : -leg)); ctx.lineTo(i * 9 - 6, 0); ctx.moveTo(i * 6, -8); ctx.lineTo(i * 8 + 4, -2 - (i % 2 ? leg : -leg)); ctx.lineTo(i * 9 + 6, 0); ctx.stroke(); }
      ctx.strokeStyle = OUT; ctx.lineWidth = 1.5;
      ell(ctx, -5, -10, 11, 8, c, OUT);
      ell(ctx, 9, -10, 6, 5.5, dark, OUT);
      ctx.strokeStyle = light; ctx.beginPath(); ctx.moveTo(-5, -18); ctx.lineTo(-5, -2); ctx.stroke();
      if (/scorpion/i.test(m.name) || /khar/i.test(m.name)) { ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, -10); ctx.quadraticCurveTo(-22, -30, -8, -30 + lunge * 6); ctx.stroke(); poly(ctx, [-8, -32, -3, -28, -8, -26], '#f0e0a0'); }
      if (/queen|velkra/i.test(m.name)) { poly(ctx, [4, -16, 7, -24, 10, -16, 13, -24, 15, -15], '#e8c860', OUT); }
      ctx.fillStyle = m.eye || '#ff4040'; ctx.fillRect(11, -12, 2, 2); ctx.fillRect(13, -9, 2, 2);
      break;
    }
    case 'flyer': {
      const flap = Math.sin(t * 14) * 0.8;
      ctx.translate(0, -26 + bob * 2);
      poly(ctx, [0, 0, -20, -10 - flap * 10, -10, 2], dark, OUT);
      poly(ctx, [0, 0, 20, -10 - flap * 10, 10, 2], dark, OUT);
      ell(ctx, 0, 0, 7, 9, c, OUT);
      ell(ctx, 0, -8, 5, 5, c, OUT);
      poly(ctx, [0, -7, 6, -6, 0, -4], '#e8b040');
      ctx.fillStyle = m.eye || '#ffdd44'; ctx.fillRect(1, -10, 2, 2);
      if (/drake|wyrm/i.test(m.name)) { poly(ctx, [0, 8, -4, 20, 4, 20], c, OUT); }
      break;
    }
    case 'serpent': {
      ctx.lineCap = 'round';
      const seg = 7;
      for (let i = seg; i >= 0; i--) {
        const px = -18 + i * 5, py = -6 + Math.sin(t * 5 + i * 0.9) * 3 - (i === seg ? 8 + lunge * 6 : 0);
        ell(ctx, px, py, 5 + i * 0.3, 5 + i * 0.3, i % 2 ? c : dark, OUT);
      }
      ctx.fillStyle = m.eye || '#ffdd44'; ctx.fillRect(18, -17 - lunge * 6, 2, 2);
      if (/khar|tyrant/i.test(m.name)) poly(ctx, [14, -22, 18, -32, 22, -22], '#f0e0a0', OUT);
      break;
    }
    case 'blob': {
      const sq = Math.sin(t * 5) * 0.08;
      const glow = /wisp|sprite|lumen|ether|glowcap|bloom/i.test(m.name);
      if (glow) {
        ctx.translate(0, -18 + bob * 2);
        ctx.save(); ctx.shadowColor = light; ctx.shadowBlur = 16; ell(ctx, 0, 0, 8, 8, light); ctx.restore();
        ell(ctx, 0, 0, 5, 5, '#ffffff');
        for (let i = 0; i < 3; i++) { const a = t * 3 + (i * TAU) / 3; ell(ctx, Math.cos(a) * 12, Math.sin(a) * 5, 2, 2, light); }
      } else {
        ctx.save(); ctx.globalAlpha = 0.92;
        ctx.beginPath(); ctx.ellipse(0, -8, 12 * (1 + sq), 10 * (1 - sq), 0, Math.PI, 0); ctx.lineTo(12 * (1 + sq), 0); ctx.lineTo(-12 * (1 + sq), 0); ctx.closePath();
        ctx.fillStyle = c; ctx.fill(); ctx.stroke(); ctx.restore();
        ell(ctx, -4, -12, 3, 2.2, 'rgba(255,255,255,.55)');
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(2, -9, 2, 3); ctx.fillRect(7, -9, 2, 3);
      }
      break;
    }
    case 'plant': {
      const sway = Math.sin(t * 2) * 0.08;
      ctx.rotate(sway);
      ctx.fillStyle = '#5a3a24';
      rr(ctx, -6, -8, 4, 8, 1); ctx.fill(); rr(ctx, 2, -8, 4, 8, 1); ctx.fill();
      rr(ctx, -8, -30, 16, 24, 5); ctx.fillStyle = '#6a4a2a'; ctx.fill(); ctx.stroke();
      ell(ctx, 0, -34, 14, 10, c, OUT);
      ell(ctx, -8, -30, 7, 6, shade(c, 0.1), OUT);
      ell(ctx, 8, -31, 7, 6, shade(c, -0.1), OUT);
      ctx.strokeStyle = '#4a2e1a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-16 - lunge * 4, -14); ctx.moveTo(8, -20); ctx.lineTo(16 + lunge * 6, -16); ctx.stroke();
      ctx.fillStyle = m.eye || '#ffe060'; ctx.fillRect(-4, -22, 2.5, 2.5); ctx.fillRect(2, -22, 2.5, 2.5);
      if (m.boss) { for (let i = 0; i < 5; i++) poly(ctx, [-12 + i * 6, -40, -10 + i * 6, -50, -8 + i * 6, -40], '#8a2a4a', OUT); }
      break;
    }
    case 'ghost': {
      ctx.translate(0, -8 + bob * 2);
      ctx.save(); ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(-10, -30); ctx.quadraticCurveTo(0, -46, 10, -30);
      for (let i = 0; i <= 4; i++) ctx.lineTo(10 - i * 5, -2 + (i % 2 ? -4 : 0) + Math.sin(t * 6 + i) * 2);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -40, 0, 0); g.addColorStop(0, c); g.addColorStop(1, rgba(c, 0.1));
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
      ctx.save(); ctx.shadowColor = m.eye || '#aef'; ctx.shadowBlur = 8;
      ctx.fillStyle = m.eye || '#e0f8ff'; ctx.fillRect(-5, -30, 3, 3); ctx.fillRect(2, -30, 3, 3); ctx.restore();
      ctx.strokeStyle = shade(c, -0.2); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(-15 - lunge * 4, -14); ctx.moveTo(8, -22); ctx.lineTo(16 + lunge * 6, -14); ctx.stroke();
      if (/lantern|nereza|ferryman/i.test(m.name)) { ctx.save(); ctx.shadowColor = '#9fffd0'; ctx.shadowBlur = 12; ell(ctx, 17 + lunge * 6, -12, 3.5, 4.5, '#b0ffd8'); ctx.restore(); }
      if (m.boss) poly(ctx, [-9, -40, -5, -50, 0, -42, 5, -50, 9, -40], '#e8e0ff', OUT);
      break;
    }
    case 'golem': {
      const hot = /ember|cinder|lava|molten|golm|kragmar|flame|revenant/i.test(m.name);
      ctx.fillStyle = dark;
      rr(ctx, -9, -10, 7, 10, 2); ctx.fill(); ctx.stroke(); rr(ctx, 2, -10, 7, 10, 2); ctx.fill(); ctx.stroke();
      rr(ctx, -13, -34, 26, 26, 5); ctx.fillStyle = c; ctx.fill(); ctx.stroke();
      rr(ctx, -7, -44, 14, 11, 3); ctx.fillStyle = shade(c, 0.1); ctx.fill(); ctx.stroke();
      rr(ctx, -21, -32 + lunge * 2, 8, 20, 3); ctx.fillStyle = dark; ctx.fill(); ctx.stroke();
      rr(ctx, 13, -32 - lunge * 8, 8, 20, 3); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.shadowColor = hot ? '#ffa040' : (m.eye || '#8ff'); ctx.shadowBlur = 10;
      ctx.fillStyle = hot ? '#ffb040' : (m.eye || '#bff'); ctx.fillRect(-4, -40, 3, 3); ctx.fillRect(1, -40, 3, 3);
      if (hot) { ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, -30); ctx.lineTo(-2, -22); ctx.lineTo(4, -28); ctx.lineTo(8, -16); ctx.stroke(); }
      ctx.restore();
      if (/arbiter|halo|sentinel|warden|aurel/i.test(m.name)) { ctx.save(); ctx.strokeStyle = '#f0e8a0'; ctx.lineWidth = 2; ctx.shadowColor = '#fff4b0'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.ellipse(0, -52, 11, 3.5, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      break;
    }
    case 'seraph': {
      const flap = Math.sin(t * 3) * 0.15;
      ctx.translate(0, -4 + bob);
      ctx.save(); ctx.rotate(-flap);
      poly(ctx, [-4, -30, -28, -44, -34, -20, -22, -12, -8, -18], m.wing || '#2a1a3a', OUT);
      ctx.restore(); ctx.save(); ctx.rotate(flap);
      poly(ctx, [4, -30, 28, -44, 34, -20, 22, -12, 8, -18], m.wing || '#2a1a3a', OUT);
      ctx.restore();
      poly(ctx, [-8, -32, 8, -32, 11, 0, -11, 0], c, OUT);
      ctx.fillStyle = '#e8c860'; ctx.fillRect(-11, -4, 22, 2);
      ell(ctx, 0, -38, 8, 8, '#d8d0e8', OUT);
      ctx.fillStyle = '#e0e0f0'; ctx.fillRect(-8, -44, 16, 5);
      ctx.save(); ctx.shadowColor = '#ff60ff'; ctx.shadowBlur = 8; ctx.fillStyle = '#ffb0ff'; ctx.fillRect(-4, -39, 2, 2); ctx.fillRect(2, -39, 2, 2); ctx.restore();
      if (m.boss) {
        ctx.save(); ctx.lineWidth = 3; ctx.shadowColor = '#b060ff'; ctx.shadowBlur = 16;
        ctx.strokeStyle = '#1a0a2a'; ctx.beginPath(); ctx.arc(0, -52, 11, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -52, 13, 0, TAU); ctx.stroke(); ctx.restore();
      }
      ctx.strokeStyle = '#e8c860'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, -22); ctx.lineTo(22 + lunge * 8, -40); ctx.stroke();
      break;
    }
    default: { // humanoid
      const look = {
        body: c, trim: m.trim || shade(c, 0.35), metal: '#a0a0a8', hair: m.hair || '#2a1a14',
        skin: /skeleton|bone/i.test(m.name) ? '#e8e4d4' : /troll|giant/i.test(m.name) ? '#8ab0c0' : /cultist|acolyte|priest|nomad|apostle/i.test(m.name) ? '#c8b0a0' : '#d8b090',
        hat: /cultist|acolyte|priest|witch|nomad|apostle|ferry/i.test(m.name) ? 'hood' : /knight|guard|warden|sentry/i.test(m.name) ? 'helm' : 'none',
        robe: /priest|acolyte|witch|cultist|apostle|bishop|veylthra|lady/i.test(m.name), weapon: m.weapon || (/archer/i.test(m.name) ? 'bow' : /priest|acolyte|witch|bishop|lady/i.test(m.name) ? 'staff' : /thug|garrick|raider|miner/i.test(m.name) ? 'axe' : 'sword'),
        cape: m.boss ? shade(c, -0.3) : null,
      };
      ctx.scale(m.dir || 1, 1); // undo the mirror; drawHero handles facing
      ctx.scale(1 / s, 1 / s);
      ctx.restore(); ctx.save(); ctx.translate(x, y);
      if (m.flash) ctx.filter = 'brightness(2.6)';
      drawHero(ctx, 0, 0, 'npc', look, m.dir < 0 ? 1 : 2, { walk: t * 6, moving: m.moving, attack: m.atk, time: t }, s, { noShadow: true });
      break;
    }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ props (cached sprites)
const propCache = new Map();

/** Returns { c: canvas, ax, ay, r (collision radius px), light?: {r, color} } */
export function getProp(type, theme, variant = 0) {
  const key = `${type}|${theme.liq}|${variant}`;
  if (propCache.has(key)) return propCache.get(key);
  const R = rng(hashStr(key));
  let w = 96, h = 128;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const ax = w / 2, ay = h - 12;
  ctx.translate(ax, ay);
  ctx.lineWidth = 1.5; ctx.strokeStyle = OUT;
  let r = 0, light = null, flat = false;
  const g0 = theme.ground[0];
  switch (type) {
    case 'oak': case 'bigtree': {
      const big = type === 'bigtree' ? 1.35 : 1;
      shadow(ctx, 0, 0, 20 * big, 0.3);
      rr(ctx, -5 * big, -30 * big, 10 * big, 30 * big, 3); ctx.fillStyle = '#6a4424'; ctx.fill(); ctx.stroke();
      const leaf = mix(theme.ground[1], '#2f6a2a', 0.5);
      const blobs = [[0, -60, 26], [-18, -48, 18], [18, -48, 18], [-8, -72, 17], [10, -70, 16]];
      for (const [bx, by, br] of blobs) ell(ctx, bx * big, by * big, br * big, br * big * 0.9, shade(leaf, -0.15), OUT);
      for (const [bx, by, br] of blobs) ell(ctx, bx * big - 3, by * big - 4, br * big * 0.7, br * big * 0.6, leaf);
      for (let i = 0; i < 8; i++) ell(ctx, R.range(-24, 24) * big, R.range(-80, -40) * big, 4, 3, shade(leaf, 0.25));
      if (R() < 0.3) for (let i = 0; i < 4; i++) ell(ctx, R.range(-20, 20), R.range(-70, -44), 2.2, 2.2, '#e84a4a');
      r = 10 * big;
      break;
    }
    case 'pine': case 'snowpine': {
      shadow(ctx, 0, 0, 16, 0.3);
      rr(ctx, -4, -16, 8, 16, 2); ctx.fillStyle = '#5a3a24'; ctx.fill();
      const col = '#2e5a3a';
      for (let i = 0; i < 4; i++) {
        const yy = -14 - i * 18, ww = 26 - i * 5;
        poly(ctx, [-ww, yy, ww, yy, 0, yy - 30], shade(col, -0.05 * i), OUT);
        if (type === 'snowpine') poly(ctx, [-ww * 0.6, yy - 10, ww * 0.6, yy - 10, 0, yy - 30], '#f4f8fc');
      }
      r = 9;
      break;
    }
    case 'deadtree': {
      shadow(ctx, 0, 0, 14, 0.3);
      ctx.strokeStyle = theme.liquid === 'void' ? '#1a1224' : '#3a2e26'; ctx.lineCap = 'round';
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(2, -46); ctx.stroke();
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) { const yy = -18 - i * 7; const d = i % 2 ? 1 : -1; ctx.beginPath(); ctx.moveTo(1, yy); ctx.quadraticCurveTo(d * 14, yy - 6, d * R.range(18, 26), yy - R.range(10, 18)); ctx.stroke(); }
      if (theme.liquid === 'water' && R() < 0.5) { ctx.fillStyle = 'rgba(120,150,110,.6)'; for (let i = 0; i < 4; i++) ctx.fillRect(R.range(-18, 14), R.range(-44, -20), 2, R.range(8, 16)); }
      r = 7;
      break;
    }
    case 'palm': {
      shadow(ctx, 0, 0, 14);
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(8, -30, 4, -60); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; poly(ctx, [4, -60, 4 + Math.cos(a) * 28, -60 + Math.sin(a) * 12 + 6, 4 + Math.cos(a + 0.3) * 16, -58 + Math.sin(a) * 6], '#4a8a3a', OUT); }
      r = 6;
      break;
    }
    case 'cactus': {
      shadow(ctx, 0, 0, 12);
      const col = '#4a8a4a';
      rr(ctx, -6, -44, 12, 44, 6); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
      rr(ctx, -18, -32, 8, 18, 4); ctx.fill(); ctx.stroke(); rr(ctx, -14, -18, 10, 6, 3); ctx.fill();
      rr(ctx, 10, -38, 8, 16, 4); ctx.fill(); ctx.stroke(); rr(ctx, 5, -26, 10, 6, 3); ctx.fill();
      ctx.fillStyle = shade(col, 0.3); ctx.fillRect(-1, -40, 2, 36);
      if (R() < 0.4) ell(ctx, 0, -46, 4, 3, '#ff7ab0');
      r = 8;
      break;
    }
    case 'bush': {
      const leaf = mix(theme.ground[1], '#2f6a2a', 0.4);
      shadow(ctx, 0, 0, 14, 0.25);
      for (const [bx, by, br] of [[-8, -10, 10], [8, -10, 10], [0, -16, 11]]) ell(ctx, bx, by, br, br * 0.85, shade(leaf, -0.1), OUT);
      ell(ctx, -2, -16, 7, 5, shade(leaf, 0.12));
      if (R() < 0.5) for (let i = 0; i < 4; i++) ell(ctx, R.range(-14, 14), R.range(-22, -6), 2, 2, R.pick(['#ff6a8a', '#ffd84a', '#ffffff']));
      r = 0;
      break;
    }
    case 'rock': case 'stalagmite': case 'spire': {
      const col = type === 'rock' ? mix(theme.wall, '#8a8a8a', 0.5) : shade(theme.wall, 0.25);
      if (type === 'rock') {
        shadow(ctx, 0, 0, 16);
        poly(ctx, [-16, 0, -14, -12, -4, -20, 10, -18, 17, -6, 14, 0], col, OUT);
        poly(ctx, [-10, -12, -4, -18, 8, -16, 2, -10], shade(col, 0.2));
        if (theme.liquid === 'ice') poly(ctx, [-12, -12, -4, -20, 10, -18, 6, -14], '#f4f8fc');
        r = 13;
      } else {
        const hgt = type === 'spire' ? R.range(50, 70) : R.range(34, 50);
        shadow(ctx, 0, 0, 14);
        poly(ctx, [-13, 0, -6, -hgt * 0.6, 0, -hgt, 5, -hgt * 0.5, 13, 0], col, OUT);
        poly(ctx, [-6, -hgt * 0.6, 0, -hgt, 0, -4, -8, -4], shade(col, 0.15));
        if (theme.liquid === 'lava') { ctx.strokeStyle = '#ff7a2a'; ctx.beginPath(); ctx.moveTo(2, -hgt * 0.8); ctx.lineTo(-2, -hgt * 0.4); ctx.lineTo(3, -8); ctx.stroke(); }
        r = 10;
      }
      break;
    }
    case 'stump': {
      shadow(ctx, 0, 0, 10);
      rr(ctx, -9, -10, 18, 10, 3); ctx.fillStyle = '#6a4424'; ctx.fill(); ctx.stroke();
      ell(ctx, 0, -10, 9, 3.5, '#b08a5a', OUT);
      r = 8;
      break;
    }
    case 'mushroom': case 'glowshroom': {
      const glow = type === 'glowshroom';
      const cap = glow ? R.pick(['#50e0c0', '#a070ff', '#60a0ff']) : R.pick(['#d04a3a', '#c8904a']);
      for (let i = 0; i < (glow ? 3 : 2); i++) {
        const mx = R.range(-12, 12), sz = R.range(0.7, 1.3), hh = 14 * sz;
        rr(ctx, mx - 2.5 * sz, -hh, 5 * sz, hh, 2); ctx.fillStyle = '#e8dcc8'; ctx.fill(); ctx.stroke();
        ctx.save(); if (glow) { ctx.shadowColor = cap; ctx.shadowBlur = 14; }
        ctx.beginPath(); ctx.ellipse(mx, -hh, 10 * sz, 7 * sz, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = cap; ctx.fill(); ctx.stroke(); ctx.restore();
        ell(ctx, mx - 3 * sz, -hh - 3 * sz, 2, 1.5, 'rgba(255,255,255,.7)');
      }
      if (glow) light = { r: 110, color: cap };
      r = 0;
      break;
    }
    case 'crystal': case 'voidcrystal': {
      const col = type === 'voidcrystal' ? '#a050ff' : theme.liquid === 'chasm' ? '#9fb0ff' : R.pick(['#60e0ff', '#a070ff', '#60ffb0']);
      shadow(ctx, 0, 0, 12);
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 16;
      for (const [cx, hh, ww, rot] of [[0, 44, 9, 0], [-10, 28, 7, -0.35], [10, 32, 7, 0.3]]) {
        ctx.save(); ctx.translate(cx, 0); ctx.rotate(rot);
        poly(ctx, [-ww, 0, -ww, -hh * 0.7, 0, -hh, ww, -hh * 0.7, ww, 0], col, OUT);
        poly(ctx, [-ww * 0.3, -2, -ww * 0.3, -hh * 0.7, 0, -hh * 0.95, ww * 0.2, -hh * 0.7], shade(col, 0.45));
        ctx.restore();
      }
      ctx.restore();
      light = { r: 130, color: col };
      r = 10;
      break;
    }
    case 'lantern': case 'brazier': {
      if (type === 'lantern') {
        ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-1.5, -40, 3, 40);
        ctx.fillRect(-1.5, -40, 10, 2.5);
        ctx.save(); ctx.shadowColor = '#b0ffd8'; ctx.shadowBlur = 16; rr(ctx, 4, -38, 8, 11, 2); ctx.fillStyle = theme.liquid === 'water' && theme.dark > 0.3 ? '#a0ffd0' : '#ffd070'; ctx.fill(); ctx.restore();
        light = { r: 150, color: theme.dark > 0.3 ? '#90ffc8' : '#ffc860' };
        r = 4;
      } else {
        shadow(ctx, 0, 0, 10);
        poly(ctx, [-10, -18, 10, -18, 6, 0, -6, 0], '#4a3a30', OUT);
        ctx.save(); ctx.shadowColor = '#ff8a2a'; ctx.shadowBlur = 18;
        poly(ctx, [-8, -18, -4, -32, 0, -24, 4, -36, 8, -18], '#ffa030'); ctx.restore();
        light = { r: 170, color: '#ff8a3a' };
        r = 8;
      }
      break;
    }
    case 'grave': {
      shadow(ctx, 0, 0, 10);
      rr(ctx, -8, -22, 16, 22, 7); ctx.fillStyle = '#7a8078'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a504a'; ctx.fillRect(-1, -17, 2, 10); ctx.fillRect(-4, -14, 8, 2);
      r = 7;
      break;
    }
    case 'pillar': case 'obelisk': {
      const col = type === 'obelisk' ? '#b89a6a' : theme.liquid === 'chasm' ? '#e4e0f0' : '#d8c8a0';
      shadow(ctx, 0, 0, 14);
      if (type === 'obelisk') {
        poly(ctx, [-9, 0, -7, -70, 0, -80, 7, -70, 9, 0], col, OUT);
        ctx.save(); ctx.shadowColor = '#ffd060'; ctx.shadowBlur = 10; ctx.fillStyle = '#ffe08a'; ctx.fillRect(-2, -60, 4, 30); ctx.restore();
      } else {
        const broken = R() < 0.4, hh = broken ? R.range(30, 50) : 70;
        rr(ctx, -12, -6, 24, 6, 1); ctx.fillStyle = shade(col, -0.15); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col; ctx.fillRect(-9, -hh, 18, hh - 6); ctx.strokeRect(-9, -hh, 18, hh - 6);
        ctx.fillStyle = shade(col, -0.12); for (let i = -6; i <= 6; i += 4) ctx.fillRect(i, -hh + 4, 1.5, hh - 12);
        if (!broken) { rr(ctx, -13, -hh - 6, 26, 7, 1); ctx.fillStyle = shade(col, 0.1); ctx.fill(); ctx.stroke(); }
        else poly(ctx, [-9, -hh, -3, -hh - 6, 3, -hh + 2, 9, -hh - 3, 9, -hh, -9, -hh], col);
      }
      r = 10;
      break;
    }
    case 'arch': {
      w = 96;
      const col = '#d8d0e8';
      ctx.fillStyle = col;
      ctx.fillRect(-36, -70, 12, 70); ctx.strokeRect(-36, -70, 12, 70);
      ctx.fillRect(24, -70, 12, 70); ctx.strokeRect(24, -70, 12, 70);
      ctx.beginPath(); ctx.arc(0, -70, 36, Math.PI, 0); ctx.arc(0, -70, 24, 0, Math.PI, true); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.shadowColor = '#a0c0ff'; ctx.shadowBlur = 12; ctx.fillStyle = '#c0d8ff'; ctx.fillRect(-2, -104, 4, 6); ctx.restore();
      r = 0;
      break;
    }
    case 'statue': {
      shadow(ctx, 0, 0, 14);
      rr(ctx, -14, -12, 28, 12, 2); ctx.fillStyle = '#a8a4b8'; ctx.fill(); ctx.stroke();
      poly(ctx, [-8, -12, 8, -12, 6, -48, -6, -48], '#c8c4d8', OUT);
      ell(ctx, 0, -54, 7, 7, '#c8c4d8', OUT);
      poly(ctx, [-6, -44, -24, -60, -18, -36], '#b8b4c8', OUT); poly(ctx, [6, -44, 24, -60, 18, -36], '#b8b4c8', OUT);
      r = 12;
      break;
    }
    case 'icespike': {
      shadow(ctx, 0, 0, 12);
      ctx.save(); ctx.shadowColor = '#bfe8ff'; ctx.shadowBlur = 8;
      poly(ctx, [-10, 0, -4, -40, 2, 0], '#bfe4f8', OUT); poly(ctx, [-2, 0, 6, -54, 12, 0], '#d8f0ff', OUT); poly(ctx, [6, 0, 14, -28, 18, 0], '#a8d8f0', OUT);
      ctx.restore();
      r = 10;
      break;
    }
    case 'rift': {
      ctx.save(); ctx.shadowColor = '#c060ff'; ctx.shadowBlur = 22;
      poly(ctx, [0, -70, 10, -44, 6, -20, 12, -4, 0, 0, -8, -18, -4, -40], '#2a0050', '#e0a0ff', 2);
      ctx.restore();
      poly(ctx, [0, -60, 5, -40, 2, -20, -3, -36], '#b060ff');
      light = { r: 160, color: '#b060ff' };
      r = 8;
      break;
    }
    case 'fence': {
      ctx.fillStyle = '#8a6a44';
      for (let i = -36; i <= 36; i += 12) { ctx.fillRect(i - 2, -18, 4, 18); ctx.strokeRect(i - 2, -18, 4, 18); }
      ctx.fillRect(-38, -14, 76, 3); ctx.fillRect(-38, -7, 76, 3);
      r = 0;
      break;
    }
    // ------------- flat decals (baked into ground chunks)
    case 'flowers': flat = true;
      for (let i = 0; i < 7; i++) { const fx = R.range(-18, 18), fy = R.range(-12, 0); ctx.fillStyle = shade(theme.ground[1], -0.2); ctx.fillRect(fx, fy, 1.2, 4); ell(ctx, fx + 0.5, fy, 2.2, 2.2, R.pick(['#ff7aa0', '#ffe060', '#ffffff', '#b08aff', '#ff9a4a'])); }
      break;
    case 'reeds': flat = true;
      ctx.strokeStyle = '#6a8a4a'; ctx.lineWidth = 1.6;
      for (let i = 0; i < 9; i++) { const fx = R.range(-16, 16); ctx.beginPath(); ctx.moveTo(fx, 0); ctx.quadraticCurveTo(fx + R.range(-4, 4), -12, fx + R.range(-6, 6), -R.range(14, 24)); ctx.stroke(); }
      ctx.fillStyle = '#6a4a2a'; for (let i = 0; i < 3; i++) rr(ctx, R.range(-12, 12), -R.range(16, 24), 3, 7, 1.5), ctx.fill();
      break;
    case 'bones': flat = true;
      ctx.fillStyle = '#e8e0cc';
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(R.range(-14, 14), R.range(-8, 0)); ctx.rotate(R.range(0, 3)); rr(ctx, -6, -1, 12, 2.5, 1); ctx.fill(); ctx.restore(); }
      ell(ctx, R.range(-6, 6), -4, 4, 3.5, '#e8e0cc');
      break;
    case 'crack': flat = true;
      ctx.save(); ctx.shadowColor = '#ff6a1f'; ctx.shadowBlur = 8; ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); let px = -20, py = -4; ctx.moveTo(px, py); for (let i = 0; i < 6; i++) { px += R.range(4, 9); py += R.range(-5, 5); ctx.lineTo(px, py); } ctx.stroke(); ctx.restore();
      break;
    case 'rune': flat = true;
      ctx.save(); ctx.shadowColor = '#8ab0ff'; ctx.shadowBlur = 10; ctx.strokeStyle = '#a8c4ff'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(0, -6, 20, 9, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(0, -12); ctx.lineTo(10, -6); ctx.lineTo(0, 0); ctx.closePath(); ctx.stroke(); ctx.restore();
      break;
    case 'rubble': flat = true;
      for (let i = 0; i < 6; i++) { const col = shade(theme.wall, R.range(0, 0.4)); poly(ctx, (() => { const bx = R.range(-18, 18), by = R.range(-10, 0), s = R.range(3, 6); return [bx - s, by, bx, by - s, bx + s, by, bx, by + s * 0.5]; })(), col, OUT, 1); }
      break;
    case 'dune': flat = true;
      ctx.fillStyle = 'rgba(160,110,50,.25)'; ctx.beginPath(); ctx.ellipse(0, -4, 34, 9, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,200,.4)'; ctx.beginPath(); ctx.ellipse(0, -2, 30, 7, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      break;
    case 'root': flat = true;
      ctx.strokeStyle = theme.liquid === 'water' && theme.dark < 0.3 ? '#5a3a24' : '#4a3040'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-30, -2); ctx.bezierCurveTo(-10, -18, 10, 8, 30, -6); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, -6); ctx.quadraticCurveTo(4, -16, 14, -18); ctx.stroke();
      break;
  }
  const out = { c, ax, ay, r, light, flat, w: c.width, h: c.height };
  propCache.set(key, out);
  return out;
}

// ------------------------------------------------------------------ buildings
const buildingCache = new Map();
/** Village building sprite (tile-aligned footprint w×h px). */
export function getBuilding(kind, w, h, roof, label) {
  const key = `${kind}|${w}|${h}|${roof}`;
  if (buildingCache.has(key)) return buildingCache.get(key);
  const H = h + 90;
  const c = makeCanvas(w + 20, H);
  const ctx = c.getContext('2d');
  ctx.translate(10, 0);
  const wallH = Math.min(70, h * 0.55);
  const baseY = H - 6;
  ctx.lineWidth = 2; ctx.strokeStyle = OUT;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(6, baseY - h * 0.35, w, h * 0.35);
  // walls (front)
  const wallTop = baseY - wallH;
  const wallCol = kind === 'chapel' ? '#e8e4dc' : kind === 'tent' ? roof : '#d8c4a0';
  ctx.fillStyle = wallCol; ctx.fillRect(0, wallTop, w, wallH); ctx.strokeRect(0, wallTop, w, wallH);
  if (kind !== 'tent') {
    ctx.fillStyle = '#8a6a44';
    for (let x = 0; x <= w; x += w / Math.max(2, Math.round(w / 60))) ctx.fillRect(x - 3, wallTop, 6, wallH);
    ctx.fillRect(0, wallTop, w, 5);
  }
  // door
  const dw = 22, dh = 34;
  rr(ctx, w / 2 - dw / 2, baseY - dh, dw, dh, 8); ctx.fillStyle = '#5a3a20'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e8c060'; ctx.fillRect(w / 2 + 5, baseY - dh / 2, 3, 3);
  // windows
  for (const wx of [w * 0.2, w * 0.8]) {
    if (w < 120 && wx !== w * 0.2) continue;
    rr(ctx, wx - 9, wallTop + 16, 18, 16, 2); ctx.fillStyle = '#ffe8a0'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = OUT; ctx.fillRect(wx - 0.75, wallTop + 16, 1.5, 16); ctx.fillRect(wx - 9, wallTop + 23, 18, 1.5);
  }
  // roof
  const roofTop = wallTop - Math.min(80, h * 0.6);
  if (kind === 'tent') {
    poly(ctx, [-6, wallTop + 4, w / 2, roofTop, w + 6, wallTop + 4], roof, OUT, 2);
    ctx.strokeStyle = shade(roof, -0.3); for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(w / 2, roofTop); ctx.lineTo((w * i) / 4, wallTop + 4); ctx.stroke(); }
  } else {
    poly(ctx, [-8, wallTop + 6, 14, roofTop, w - 14, roofTop, w + 8, wallTop + 6], roof, OUT, 2);
    ctx.strokeStyle = shade(roof, -0.25); ctx.lineWidth = 1.5;
    for (let y = roofTop + 10; y < wallTop; y += 10) { const t = (y - roofTop) / (wallTop + 6 - roofTop); ctx.beginPath(); ctx.moveTo(14 - 22 * t, y); ctx.lineTo(w - 14 + 22 * t, y); ctx.stroke(); }
    poly(ctx, [10, roofTop, w - 10, roofTop, w - 14, roofTop + 5, 14, roofTop + 5], shade(roof, 0.2));
    if (kind === 'chapel') { ctx.fillStyle = '#e8c060'; ctx.fillRect(w / 2 - 2, roofTop - 34, 4, 30); ctx.fillRect(w / 2 - 10, roofTop - 26, 20, 4); }
    if (kind === 'smith') { ctx.fillStyle = '#5a5a5a'; ctx.fillRect(w - 40, roofTop - 20, 14, 30); }
    if (kind === 'hall') { ctx.fillStyle = '#c8a040'; ctx.fillRect(w / 2 - 1.5, roofTop - 30, 3, 30); poly(ctx, [w / 2 + 1.5, roofTop - 30, w / 2 + 24, roofTop - 24, w / 2 + 1.5, roofTop - 18], '#2c4f9e', OUT); }
  }
  const out = { c, ox: 10, oy: baseY, w, h, H };
  buildingCache.set(key, out);
  return out;
}

// ------------------------------------------------------------------ icons
const iconCache = new Map();
function iconCanvas(key, draw, size = 48) {
  if (iconCache.has(key)) return iconCache.get(key);
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const url = c.toDataURL();
  iconCache.set(key, url);
  return url;
}

const SLOT_GLYPH = {
  Head: (ctx) => { ctx.beginPath(); ctx.arc(24, 26, 12, Math.PI, 0); ctx.lineTo(36, 34); ctx.lineTo(12, 34); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(16, 26, 16, 3); },
  Chest: (ctx) => { poly(ctx, [14, 12, 20, 10, 24, 14, 28, 10, 34, 12, 38, 22, 33, 24, 33, 38, 15, 38, 15, 24, 10, 22], ctx.fillStyle, OUT); },
  Gloves: (ctx) => { rr(ctx, 16, 14, 16, 20, 5); ctx.fill(); ctx.stroke(); rr(ctx, 14, 30, 20, 8, 2); ctx.fill(); ctx.stroke(); },
  Legs: (ctx) => { poly(ctx, [15, 10, 33, 10, 34, 38, 26, 38, 24, 20, 22, 38, 14, 38], ctx.fillStyle, OUT); },
  Boots: (ctx) => { poly(ctx, [16, 10, 26, 10, 26, 30, 36, 32, 36, 38, 16, 38], ctx.fillStyle, OUT); },
  Cape: (ctx) => { poly(ctx, [16, 10, 32, 10, 38, 38, 24, 34, 10, 38], ctx.fillStyle, OUT); },
  Necklace: (ctx) => { ctx.lineWidth = 2.5; ctx.strokeStyle = ctx.fillStyle; ctx.beginPath(); ctx.arc(24, 18, 11, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = OUT; poly(ctx, [24, 27, 29, 32, 24, 38, 19, 32], '#7fe0ff', OUT); },
  Ring: (ctx) => { ctx.lineWidth = 4; ctx.strokeStyle = ctx.fillStyle; ctx.beginPath(); ctx.arc(24, 28, 9, 0, TAU); ctx.stroke(); ctx.lineWidth = 1.5; poly(ctx, [24, 12, 29, 17, 24, 22, 19, 17], '#ff5a8a', OUT); },
};
const CLASS_WEAPON_ICON = { Knight: 'sword', Berserker: 'axe', Assassin: 'dagger', Ranger: 'bow', Mage: 'staff', Priest: 'mace' };

export function itemIcon(item) {
  const png = itemPng(item) || (item?.slot ? slotPng(item.slot) : null);
  if (png) return png;
  const key = `${item.slot}|${item.cls}|${item.rarity}|${item.kind || ''}|${item.id || ''}`;
  return iconCanvas(key, (ctx, S) => {
    ctx.lineWidth = 1.5; ctx.strokeStyle = OUT;
    const rc = item.color || '#aaa';
    if (item.kind === 'potion' || item.kind === 'flask') {
      const liquid = item.id === 'POT_MP_S' ? '#3c7cf0' : item.id === 'FLASK_POWER' ? '#ff8a2a' : item.id === 'FOOD' ? '#c8904a' : '#e03a3a';
      if (item.id === 'FOOD') { ell(ctx, 24, 30, 14, 8, '#e8dcc8', OUT); ell(ctx, 24, 27, 11, 5, liquid); return; }
      rr(ctx, 20, 8, 8, 8, 2); ctx.fillStyle = '#c8a070'; ctx.fill(); ctx.stroke();
      ell(ctx, 24, 28, 12, 12, 'rgba(230,240,255,.5)', OUT);
      ctx.beginPath(); ctx.arc(24, 28, 10, 0.1, Math.PI - 0.1); ctx.closePath(); ctx.fillStyle = liquid; ctx.fill();
      ell(ctx, 19, 23, 2.5, 3.5, 'rgba(255,255,255,.7)');
      return;
    }
    if (item.kind === 'material' || item.kind === 'quest' || item.kind === 'scroll') {
      const col = item.id === 'MAT_COPPER' ? '#d0803a' : item.id === 'MAT_IRON' ? '#9aa0aa' : item.id === 'MAT_SKYIRON' ? '#a0d8ff' : item.id === 'MAT_HERB' ? '#5ac04a' : item.id === 'MAT_VOID' ? '#a050ff' : item.kind === 'scroll' ? '#e8dcb0' : '#c070ff';
      if (item.kind === 'scroll') { rr(ctx, 12, 12, 24, 26, 3); ctx.fillStyle = col; ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#8a6a3a'; for (let y = 18; y < 34; y += 5) { ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(32, y); ctx.stroke(); } return; }
      if (item.id === 'MAT_HERB') { for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(24, 36); ctx.rotate(-0.5 + i * 0.5); ell(ctx, 0, -12, 5, 11, shade(col, i * 0.1), OUT); ctx.restore(); } return; }
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 8;
      poly(ctx, [14, 34, 12, 22, 20, 12, 30, 14, 36, 26, 30, 36], col, OUT);
      ctx.restore();
      poly(ctx, [18, 22, 22, 15, 28, 17, 24, 24], shade(col, 0.4));
      return;
    }
    ctx.fillStyle = shade(rc, -0.1);
    if (item.slot === 'MainHand') {
      ctx.translate(24, 40); ctx.rotate(0.75);
      drawWeapon(ctx, CLASS_WEAPON_ICON[item.cls] || 'sword', { trim: rc, metal: '#d0d4dc', body: rc }, 0);
    } else if (SLOT_GLYPH[item.slot]) {
      ctx.fillStyle = mix(rc, '#8a8a90', 0.35);
      SLOT_GLYPH[item.slot](ctx);
    }
  });
}

const SKILL_GLYPHS = {
  dash: (ctx, c) => { poly(ctx, [10, 30, 26, 30, 26, 22, 40, 34, 26, 46, 26, 38, 10, 38], c, OUT); },
  shield: (ctx, c) => { poly(ctx, [12, 10, 36, 10, 36, 26, 24, 40, 12, 26], c, OUT); },
  aoe: (ctx, c) => { ctx.strokeStyle = c; ctx.lineWidth = 3; for (const r of [6, 12, 18]) { ctx.beginPath(); ctx.arc(24, 24, r, 0, TAU); ctx.stroke(); } },
  cone: (ctx, c) => { ctx.beginPath(); ctx.moveTo(8, 38); ctx.arc(8, 38, 34, -1.3, -0.25); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); },
  strike: (ctx, c) => { ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(10, 38); ctx.lineTo(38, 10); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(14, 34); ctx.lineTo(34, 14); ctx.stroke(); },
  bolt: (ctx, c) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 10; ell(ctx, 30, 18, 8, 8, c); ctx.restore(); ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, 40); ctx.lineTo(24, 24); ctx.stroke(); },
  buff: (ctx, c) => { poly(ctx, [24, 6, 30, 20, 44, 22, 32, 30, 36, 44, 24, 36, 12, 44, 16, 30, 4, 22, 18, 20], c, OUT); },
  heal: (ctx, c) => { ctx.fillStyle = c; ctx.fillRect(19, 8, 10, 32); ctx.fillRect(8, 19, 32, 10); ctx.strokeRect(19, 8, 10, 32); },
  chain: (ctx, c) => { ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(6, 30); ctx.lineTo(18, 14); ctx.lineTo(28, 30); ctx.lineTo(42, 12); ctx.stroke(); for (const [x, y] of [[6, 30], [18, 14], [28, 30], [42, 12]]) ell(ctx, x, y, 3.5, 3.5, '#fff'); },
  ground: (ctx, c) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 8; for (let i = 0; i < 5; i++) { const x = 10 + i * 7; poly(ctx, [x, 8 + i * 3, x + 4, 8 + i * 3, x - 2, 30 + i * 2], c); } ctx.restore(); ell(ctx, 24, 38, 16, 5, rgba(c, 0.6)); },
  stealth: (ctx, c) => { ctx.globalAlpha = 0.7; ell(ctx, 24, 18, 8, 8, c); poly(ctx, [14, 26, 34, 26, 38, 44, 10, 44], c); ctx.globalAlpha = 1; },
  mark: (ctx, c) => { ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(24, 24, 14, 0, TAU); ctx.moveTo(24, 4); ctx.lineTo(24, 44); ctx.moveTo(4, 24); ctx.lineTo(44, 24); ctx.stroke(); },
  taunt: (ctx, c) => { poly(ctx, [10, 18, 22, 18, 34, 8, 34, 40, 22, 30, 10, 30], c, OUT); },
  leap: (ctx, c) => { ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(6, 40); ctx.quadraticCurveTo(24, -4, 42, 40); ctx.stroke(); poly(ctx, [36, 34, 44, 42, 34, 44], c); },
  ultimate: (ctx, c) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 14; poly(ctx, [24, 4, 29, 19, 44, 24, 29, 29, 24, 44, 19, 29, 4, 24, 19, 19], c, OUT); ctx.restore(); ell(ctx, 24, 24, 5, 5, '#fff'); },
};

export function skillIcon(skill, classColor, element) {
  const png = skillPng(skill);
  if (png) return png;
  const key = `skill|${skill.id}`;
  return iconCanvas(key, (ctx, S) => {
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, shade(classColor, -0.55)); g.addColorStop(1, shade(classColor, -0.2));
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.lineWidth = 1.5; ctx.strokeStyle = OUT;
    (SKILL_GLYPHS[skill.glyph] || SKILL_GLYPHS.strike)(ctx, element || shade(classColor, 0.45));
  });
}

export function monsterPortrait(m) {
  const key = `mp|${m.name}|${m.color}`;
  return iconCanvas(key, (ctx, S) => {
    const g = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.7);
    g.addColorStop(0, shade(m.color, -0.2)); g.addColorStop(1, '#120e16');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    const sc = m.arch === 'golem' || m.arch === 'seraph' ? 0.62 : 0.8;
    drawMonster(ctx, S / 2, S * 0.88, { ...m, size: sc, dir: 1, t: 0.5, atk: -1, flash: false, aura: null });
  }, 64);
}

export function heroPortrait(cls, look) {
  const key = `hp|${cls}|${JSON.stringify(look)}`;
  return iconCanvas(key, (ctx, S) => {
    const g = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.7);
    g.addColorStop(0, shade(look.body, 0.1)); g.addColorStop(1, '#120e16');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    drawHero(ctx, S / 2, S * 1.25, cls, look, 0, { walk: 0, attack: -1, time: 0 }, 1.25, { noShadow: true });
  }, 64);
}
