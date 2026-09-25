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
    walk: ['body', 'shoes', 'pants', 'leather', 'chainHood'],
    act: 'slash', actKeys: ['body', 'shoes', 'pants', 'leather', 'chainHood', 'dagger'],
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
  for (const key of keys) {
    const path = group[key];
    const img = path && sheets.get(path);
    if (!img) continue;
    ctx.drawImage(img, col * S, row * S, S, S, -S / 2, -S + 10, S, S);
  }
  ctx.restore();
}

if (typeof window !== 'undefined') preloadLpc();
