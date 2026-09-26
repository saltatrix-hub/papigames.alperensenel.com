/** LPC walk / combat compositor (wulax, CC-BY-SA 3.0). Sheets are 64×64, 4 rows: up, left, down, right. */

const BASE = 'assets/sprites/lpc';
const sheets = new Map();
let ready = false;

const DIR_ROW = [2, 1, 3, 0]; // our 0=down 1=left 2=right 3=up → LPC row

const LAYERS = {
  walk: {
    body: 'walkcycle/BODY_male.png',
    plateFeet: 'walkcycle/FEET_plate_armor_shoes.png',
    shoes: 'walkcycle/FEET_shoes_brown.png',
    plateLegs: 'walkcycle/LEGS_plate_armor_pants.png',
    pants: 'walkcycle/LEGS_pants_greenish.png',
    robeLegs: 'walkcycle/LEGS_robe_skirt.png',
    plateTorso: 'walkcycle/TORSO_plate_armor_torso.png',
    plateArms: 'walkcycle/TORSO_plate_armor_arms_shoulders.png',
    leather: 'walkcycle/TORSO_leather_armor_torso.png',
    leatherShoulders: 'walkcycle/TORSO_leather_armor_shoulders.png',
    chain: 'walkcycle/TORSO_chain_armor_torso.png',
    robe: 'walkcycle/TORSO_robe_shirt_brown.png',
    gloves: 'walkcycle/HANDS_plate_armor_gloves.png',
    helm: 'walkcycle/HEAD_plate_armor_helmet.png',
    hood: 'walkcycle/HEAD_robe_hood.png',
    hat: 'walkcycle/HEAD_leather_armor_hat.png',
    chainHood: 'walkcycle/HEAD_chain_armor_hood.png',
    hair: 'walkcycle/HEAD_hair_blonde.png',
    belt: 'walkcycle/BELT_leather.png',
    quiver: 'walkcycle/BEHIND_quiver.png',
  },
  slash: {
    body: 'slash/BODY_human.png',
    plateFeet: 'slash/FEET_plate_armor_shoes.png',
    shoes: 'slash/FEET_shoes_brown.png',
    plateLegs: 'slash/LEGS_plate_armor_pants.png',
    pants: 'slash/LEGS_pants_greenish.png',
    robeLegs: 'slash/LEGS_robe_skirt.png',
    plateTorso: 'slash/TORSO_plate_armor_torso.png',
    plateArms: 'slash/TORSO_plate_armor_arms_shoulders.png',
    leather: 'slash/TORSO_leather_armor_torso.png',
    leatherShoulders: 'slash/TORSO_leather_armor_shoulders.png',
    chain: 'slash/TORSO_chain_armor_torso.png',
    robe: 'slash/TORSO_robe_shirt_brown.png',
    gloves: 'slash/HANDS_plate_armor_gloves.png',
    helm: 'slash/HEAD_plate_armor_helmet.png',
    hood: 'slash/HEAD_robe_hood.png',
    hat: 'slash/HEAD_leather_armor_hat.png',
    chainHood: 'slash/HEAD_chain_armor_hood.png',
    hair: 'slash/HEAD_hair_blonde.png',
    belt: 'slash/BELT_leather.png',
    dagger: 'slash/WEAPON_dagger.png',
  },
  bow: {
    body: 'bow/BODY_animation.png',
    shoes: 'bow/FEET_shoes_brown.png',
    pants: 'bow/LEGS_pants_greenish.png',
    leather: 'bow/TORSO_leather_armor_torso.png',
    leatherShoulders: 'bow/TORSO_leather_armor_shoulders.png',
    hat: 'bow/HEAD_leather_armor_hat.png',
    hair: 'bow/HEAD_hair_blonde.png',
    belt: 'bow/BELT_leather.png',
    bow: 'bow/WEAPON_bow.png',
    arrow: 'bow/WEAPON_arrow.png',
  },
  spell: {
    body: 'spellcast/BODY_male.png',
    shoes: 'spellcast/FEET_shoes_brown.png',
    robeLegs: 'spellcast/LEGS_robe_skirt.png',
    robe: 'spellcast/TORSO_robe_shirt_brown.png',
    hood: 'spellcast/HEAD_robe_hood.png',
    hair: 'spellcast/HEAD_hair_blonde.png',
    belt: 'spellcast/BELT_rope.png',
  },
  thrust: {
    body: 'thrust/BODY_animation.png',
    shoes: 'thrust/FEET_shoes_brown.png',
    robeLegs: 'thrust/LEGS_robe_skirt.png',
    robe: 'thrust/TORSO_robe_shirt_brown.png',
    hood: 'thrust/HEAD_robe_hood.png',
    hair: 'thrust/HEAD_hair_blonde.png',
    staff: 'thrust/WEAPON_staff.png',
  },
};

const COLS = { walk: 9, slash: 6, bow: 13, spell: 7, thrust: 8 };

const KITS = {
  Knight: {
    walk: ['body', 'plateFeet', 'plateLegs', 'plateTorso', 'plateArms', 'gloves', 'helm'],
    act: 'slash', actKeys: ['body', 'plateFeet', 'plateLegs', 'plateTorso', 'plateArms', 'gloves', 'helm', 'dagger'],
  },
  Berserker: {
    walk: ['body', 'shoes', 'pants', 'leather', 'leatherShoulders', 'hair'],
    act: 'slash', actKeys: ['body', 'shoes', 'pants', 'leather', 'leatherShoulders', 'hair', 'dagger'],
  },
  Assassin: {
    walk: ['body', 'shoes', 'pants', 'leather', 'chainHood', 'belt'],
    act: 'slash', actKeys: ['body', 'shoes', 'pants', 'leather', 'chainHood', 'belt', 'dagger'],
  },
  Ranger: {
    walk: ['quiver', 'body', 'shoes', 'pants', 'leather', 'leatherShoulders', 'hat'],
    act: 'bow', actKeys: ['body', 'shoes', 'pants', 'leather', 'leatherShoulders', 'hat', 'bow', 'arrow'],
  },
  Mage: {
    walk: ['body', 'shoes', 'robeLegs', 'robe', 'hood'],
    act: 'spell', actKeys: ['body', 'shoes', 'robeLegs', 'robe', 'hood'],
  },
  Priest: {
    walk: ['body', 'shoes', 'robeLegs', 'robe', 'hair'],
    act: 'spell', actKeys: ['body', 'shoes', 'robeLegs', 'robe', 'hair'],
  },
  npc: {
    walk: ['body', 'shoes', 'pants', 'leather', 'hair'],
    act: 'walk', actKeys: ['body', 'shoes', 'pants', 'leather', 'hair'],
  },
};

function allPaths() {
  const out = new Set();
  for (const group of Object.values(LAYERS)) for (const p of Object.values(group)) out.add(p);
  return [...out];
}

export function preloadLpc() {
  if (typeof Image === 'undefined') return;
  const paths = allPaths();
  let left = paths.length;
  for (const path of paths) {
    const img = new Image();
    img.onload = () => { sheets.set(path, img); if (--left <= 0) ready = true; };
    img.onerror = () => { if (--left <= 0) ready = sheets.size > 8; };
    img.src = BASE + '/' + path;
  }
}

export function lpcReady() { return ready; }

const baked = new Map();
const BAKE_W = 96;
const BAKE_H = 84;
const BAKE_OX = 48;
const BAKE_OY = 70;

function bakeFrame(cls, act, keys, group, col, row) {
  const key = `${cls}|${act}|${col}|${row}`;
  const hit = baked.get(key);
  if (hit) return hit;
  if (!ready) return null;
  const S = 64;
  const c = document.createElement('canvas');
  c.width = BAKE_W;
  c.height = BAKE_H;
  const b = c.getContext('2d');
  b.imageSmoothingEnabled = false;
  b.translate(BAKE_OX, BAKE_OY);
  const cloth = CLOTH_FILTER[cls] || {};
  for (const layer of keys) {
    const path = group[layer];
    const img = path && sheets.get(path);
    if (!img) continue;
    b.filter = cloth[layer] || 'none';
    b.drawImage(img, col * S, row * S, S, S, -S / 2, -S + 10, S, S);
  }
  b.filter = 'none';
  if (cls === 'Assassin') {
    const dagger = sheets.get(group.dagger || LAYERS.slash.dagger);
    if (dagger) {
      b.drawImage(dagger, 0, row * S, S, S, -S / 2 - 10, -S + 14, S, S);
      b.save();
      b.scale(-1, 1);
      b.drawImage(dagger, 0, row * S, S, S, -S / 2 - 10, -S + 14, S, S);
      b.restore();
    }
    b.fillStyle = 'rgba(8, 6, 14, 0.92)';
    b.fillRect(-9, -40, 18, 6);
    b.fillStyle = '#c9a23a';
    b.fillRect(-7, -39, 2, 2);
    b.fillRect(5, -39, 2, 2);
  }
  baked.set(key, c);
  return c;
}

function frameCol(anim, cols, attacking, act) {
  if (attacking) {
    const t = Math.max(0, Math.min(0.999, anim.attack));
    return Math.floor(t * cols);
  }
  if (anim.moving) return 1 + (Math.floor((anim.walk || 0) * 1.6) % 8);
  if (act === 'walk') return 0;
  return 0;
}

export function drawLpcHero(ctx, x, y, cls, look, dir, anim, scale = 1, opts = {}) {
  const kit = KITS[cls] || KITS.npc;
  const attacking = anim.attack >= 0 && kit.act !== 'walk';
  const act = attacking ? kit.act : 'walk';
  const keys = attacking ? kit.actKeys : kit.walk;
  const group = LAYERS[act];
  const cols = COLS[act];
  const row = DIR_ROW[dir] ?? 2;
  const col = frameCol(anim, cols, attacking, act);
  const S = 64;
  const sc = scale * 1.15;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  if (!opts.noShadow) {
    ctx.beginPath(); ctx.ellipse(0, 4, 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fill();
  }
  if (opts.mount) ctx.translate(0, -10);
  const frame = bakeFrame(cls, act, keys, group, col, row);
  if (frame) {
    ctx.drawImage(frame, -BAKE_OX, -BAKE_OY);
    ctx.restore();
    return;
  }
  for (const key of keys) {
    const path = group[key];
    const img = path && sheets.get(path);
    if (!img) continue;
    ctx.drawImage(img, col * S, row * S, S, S, -S / 2, -S + 10, S, S);
  }
  ctx.restore();
}

const CLOTH_FILTER = {
  Assassin: {
    shoes: 'brightness(0.25)',
    pants: 'brightness(0.18) saturate(0.2)',
    leather: 'brightness(0.16) saturate(0.15) hue-rotate(250deg)',
    chainHood: 'brightness(0.14) saturate(0.2) hue-rotate(260deg)',
    belt: 'brightness(0.3) sepia(1)',
    dagger: 'brightness(0.85)',
  },
  Berserker: {
    leather: 'sepia(0.8) saturate(1.6) brightness(0.8)',
    leatherShoulders: 'sepia(0.5) saturate(0.6) brightness(1.15)',
    pants: 'sepia(0.4) brightness(0.7)',
    shoes: 'brightness(0.55)',
  },
  Mage: {
    robe: 'hue-rotate(210deg) saturate(1.35) brightness(0.85)',
    robeLegs: 'hue-rotate(210deg) saturate(1.2) brightness(0.8)',
    hood: 'hue-rotate(220deg) saturate(1.1) brightness(0.7)',
  },
  Priest: {
    robe: 'sepia(0.35) brightness(1.35) saturate(0.7)',
    robeLegs: 'sepia(0.2) brightness(1.25)',
    belt: 'sepia(1) saturate(2)',
  },
  Ranger: {
    leather: 'hue-rotate(70deg) saturate(1.15)',
    leatherShoulders: 'hue-rotate(40deg) saturate(0.8)',
    hat: 'hue-rotate(50deg) saturate(0.9) brightness(0.85)',
    pants: 'hue-rotate(70deg) saturate(0.8) brightness(0.85)',
  },
};

export function prebakeKit(cls) {
  const kit = KITS[cls];
  if (!kit || !ready) return false;
  const jobs = [['walk', kit.walk]];
  if (kit.act && kit.act !== 'walk') jobs.push([kit.act, kit.actKeys]);
  const queue = [];
  for (const [act, keys] of jobs) {
    const group = LAYERS[act];
    const cols = COLS[act];
    for (let row = 0; row < 4; row++) for (let col = 0; col < cols; col++) queue.push([cls, act, keys, group, col, row]);
  }
  const step = () => {
    for (let i = 0; i < 8 && queue.length; i++) bakeFrame(...queue.pop());
    if (queue.length) requestAnimationFrame(step);
  };
  step();
  return true;
}

if (typeof window !== 'undefined') preloadLpc();
