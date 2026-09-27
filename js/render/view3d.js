import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { clone as cloneSkinned } from '../vendor/SkeletonUtils.js';
import { clamp, lerp, smooth, valueNoise, hash2, hexToRgb } from '../core/util.js';
import { CLASS_KIT } from '../game/stats.js';

const S = 1 / 48;
const loader = new GLTFLoader();
const models = new Map();

const CAST = {
  Knight: {
    file: 'Knight.glb', show: ['1H_Sword', 'Rectangle_Shield', 'Knight_Helmet', 'Knight_Cape'],
    idle: 'Idle', walk: 'Walking_A', attack: '1H_Melee_Attack_Slice_Diagonal',
    dye: [
      { test: /Cape/i, color: '#c4324a', amount: 0.62, shadow: 0.46, hi: 0.78, rough: 0.64 },
      { test: /Helmet|Shield|Sword/i, color: '#eef3f8', amount: 0.14, shadow: 0.84, hi: 0.92, metal: 0.72, rough: 0.26 },
    ],
  },
  Berserker: {
    file: 'Barbarian.glb', show: ['2H_Axe', 'Barbarian_Hat', 'Barbarian_Cape'],
    idle: '2H_Melee_Idle', walk: 'Walking_A', attack: '2H_Melee_Attack_Chop',
    dye: [
      { test: /Axe/i, color: '#e7edf5', amount: 0.12, shadow: 0.8, hi: 0.92, metal: 0.8, rough: 0.22 },
    ],
  },
  Assassin: {
    file: 'Rogue.glb', show: ['Knife', 'Knife_Offhand', 'Rogue_Cape'],
    idle: 'Idle', walk: 'Walking_A', attack: 'Dualwield_Melee_Attack_Slice',
    dye: [
      { test: /Cape/i, color: '#1a2233', amount: 0.9, shadow: 0.42, hi: 0.72, rough: 0.58 },
      { test: /Body|Arm|Leg/i, color: '#222a3c', amount: 0.88, shadow: 0.44, hi: 0.68, rough: 0.42 },
      { test: /Knife/i, color: '#f4f7fb', amount: 0.34, shadow: 0.64, hi: 0.86, metal: 0.88, rough: 0.16 },
    ],
  },
  Ranger: {
    file: 'Mage.glb', show: ['Mage_Cape'],
    idle: 'Idle', walk: 'Walking_A', attack: '2H_Ranged_Shoot',
    gear: {
      file: 'Rogue_Hooded.glb', node: '2H_Crossbow', slot: 'handslot.r',
      dye: { color: '#f8f1df', amount: 0.62, shadow: 0.48, hi: 0.7, metal: 0.28, rough: 0.42 },
    },
    hood: { color: '#24362c', amount: 0.84, shadow: 0.42, hi: 0.66, rough: 0.72, keepFace: true },
    dye: [
      { test: /Body|Leg/i, color: '#e2b03a', amount: 0.78, shadow: 0.5, hi: 0.58, rough: 0.52 },
      { test: /Cape/i, color: '#fff4e4', amount: 0.58, shadow: 0.62, hi: 0.55, rough: 0.58 },
      { test: /Arm/i, color: '#f0d09a', amount: 0.48, shadow: 0.6, hi: 0.6, rough: 0.55 },
    ],
  },
  Mage: {
    file: 'Mage.glb', show: ['2H_Staff', 'Mage_Hat', 'Mage_Cape'],
    idle: 'Idle', walk: 'Walking_A', attack: 'Spellcast_Shoot',
    dye: [
      { test: /Cape|Hat/i, color: '#5c3ec8', amount: 0.42, shadow: 0.55, hi: 0.72, rough: 0.52 },
      { test: /Body|Leg/i, color: '#6a4ad4', amount: 0.36, shadow: 0.58, hi: 0.74, rough: 0.5 },
      { test: /Staff/i, color: '#efe6ff', amount: 0.22, shadow: 0.72, hi: 0.86, metal: 0.4, rough: 0.3 },
    ],
  },
  Priest: {
    file: 'Mage.glb', show: ['Spellbook_open', 'Mage_Cape', 'Mage_Hat'],
    idle: 'Idle', walk: 'Walking_A', attack: 'Spellcasting',
    hood: { color: '#f7f3ea', amount: 0.92, shadow: 0.58, hi: 0.5, rough: 0.62, keepFace: true },
    dye: [
      { test: /Body|Leg|Arm|Cape/i, color: '#f6f1e6', amount: 0.74, shadow: 0.58, hi: 0.48, rough: 0.56 },
      { test: /Hat/i, color: '#f7f3e8', amount: 0.62, shadow: 0.5, hi: 0.58, rough: 0.46 },
      { test: /Spellbook/i, color: '#fff8ee', amount: 0.5, shadow: 0.7, hi: 0.58, rough: 0.42 },
    ],
  },
  Guard: { file: 'Knight.glb', show: ['1H_Sword', 'Badge_Shield', 'Knight_Helmet', 'Knight_Cape'], idle: 'Idle', walk: 'Walking_A', attack: '1H_Melee_Attack_Stab' },
  npc: { file: 'Rogue.glb', show: ['Rogue_Cape'], idle: 'Idle', walk: 'Walking_A', attack: 'Idle' },
};

const MONSTERS = {
  mage: { file: 'skeletons/Skeleton_Mage.glb', attack: 'Spellcasting', right: 'skeletons/weapons/Skeleton_Staff.gltf' },
  rogue: { file: 'skeletons/Skeleton_Rogue.glb', attack: '1H_Melee_Attack_Stab', right: 'skeletons/weapons/Skeleton_Blade.gltf' },
  minion: { file: 'skeletons/Skeleton_Minion.glb', attack: '1H_Melee_Attack_Slice_Diagonal', right: 'skeletons/weapons/Skeleton_Axe.gltf' },
  warrior: {
    file: 'skeletons/Skeleton_Warrior.glb',
    attack: '1H_Melee_Attack_Slice_Diagonal',
    right: 'skeletons/weapons/Skeleton_Blade.gltf',
    left: 'skeletons/weapons/Skeleton_Shield_Large_A.gltf',
  },
};

function loadModel(file) {
  if (!models.has(file)) {
    models.set(file, new Promise((resolve, reject) => {
      loader.load(`assets/models/${file}`, (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        gltf.userData.foot = box.min.y;
        gltf.userData.scale = 1.72 / Math.max(0.001, box.max.y - box.min.y);
        resolve(gltf);
      }, undefined, reject);
    }));
  }
  return models.get(file);
}

function npcSpec(e) {
  const blob = `${e.service || ''} ${e.title || ''} ${e.name || ''}`.toLowerCase();
  const look = (file, show, idle = 'Idle', attack = 'Idle') => ({ file, show, idle, walk: 'Walking_A', attack, death: 'Death_A', scale: 1 });
  if (/mayor|elric|muhtar|chieftain|ingrid/.test(blob)) return look('Knight.glb', ['Knight_Cape', 'Badge_Shield']);
  if (/scout|lysa|izci|envoy|tovi/.test(blob)) return look('Rogue_Hooded.glb', ['2H_Crossbow', 'Rogue_Cape'], 'Idle', '2H_Ranged_Shoot');
  if (/miner|brom/.test(blob)) return look('Barbarian.glb', ['1H_Axe', 'Barbarian_Round_Shield'], 'Idle', '1H_Melee_Attack_Chop');
  if (/smith|rowan|demirci|forge|dorn|craft/.test(blob)) return look('Barbarian.glb', ['1H_Axe', 'Barbarian_Hat'], 'Idle', '1H_Melee_Attack_Chop');
  if (/healer|mina|şifacı|priestess|pilgrim|maelis|oracle|veya/.test(blob)) return look('Mage.glb', ['1H_Wand', 'Spellbook_open', 'Mage_Hat', 'Mage_Cape'], 'Idle', 'Spellcasting');
  if (/druid|ysolde|seer|nahla/.test(blob)) return look('Mage.glb', ['2H_Staff', 'Mage_Cape'], 'Idle', 'Spellcast_Shoot');
  if (/warden|faelan|kael|legion|varra/.test(blob)) return look('Knight.glb', ['1H_Sword', 'Spike_Shield', 'Knight_Helmet', 'Knight_Cape'], 'Idle', '1H_Melee_Attack_Stab');
  if (/keeper|orsin/.test(blob)) return look('Rogue_Hooded.glb', ['1H_Crossbow', 'Rogue_Cape'], 'Idle', '1H_Ranged_Shoot');
  if (/archive|seraphel|runes|ilven/.test(blob)) return look('Mage.glb', ['Spellbook', 'Mage_Hat'], 'Idle', 'Spellcast_Shoot');
  if (/caravan|sahir/.test(blob)) return look('Rogue.glb', ['Knife', 'Rogue_Cape'], 'Idle', 'Dualwield_Melee_Attack_Slice');
  if (/broker|mirr|endgame/.test(blob)) return look('Rogue_Hooded.glb', ['Knife_Offhand', 'Rogue_Cape']);
  const byService = {
    trainer: look('Knight.glb', ['2H_Sword', 'Knight_Helmet', 'Knight_Cape'], 'Idle', '2H_Melee_Attack_Slice'),
    alchemy: look('Mage.glb', ['Spellbook', 'Mage_Hat', 'Mage_Cape'], 'Idle', 'Spellcast_Shoot'),
    auction: look('Rogue.glb', ['Throwable', 'Rogue_Cape']),
    storage: look('Barbarian.glb', ['Mug', 'Barbarian_Cape']),
    guild: look('Knight.glb', ['1H_Sword', 'Round_Shield', 'Knight_Helmet'], 'Idle', '1H_Melee_Attack_Stab'),
    stable: look('Rogue_Hooded.glb', ['Rogue_Cape']),
    stylist: look('Mage.glb', ['Mage_Hat', 'Mage_Cape']),
    shop: look('Rogue.glb', ['Knife', 'Rogue_Cape']),
    smith: look('Barbarian.glb', ['1H_Axe', 'Barbarian_Hat'], 'Idle', '1H_Melee_Attack_Chop'),
    healer: look('Mage.glb', ['1H_Wand', 'Spellbook_open', 'Mage_Hat', 'Mage_Cape'], 'Idle', 'Spellcasting'),
    bounty: look('Rogue.glb', ['1H_Crossbow', 'Rogue_Cape'], 'Idle', '1H_Ranged_Shoot'),
    faction: look('Knight.glb', ['Spike_Shield', 'Knight_Helmet', 'Knight_Cape']),
    dungeon: look('Rogue_Hooded.glb', ['Knife', 'Knife_Offhand', 'Rogue_Cape'], 'Idle', 'Dualwield_Melee_Attack_Slice'),
    craft: look('Barbarian.glb', ['1H_Axe', 'Barbarian_Cape'], 'Idle', '1H_Melee_Attack_Chop'),
    lore: look('Knight.glb', ['Knight_Cape', 'Badge_Shield']),
  };
  return byService[e.service] || byService.shop;
}

function specFor(kind) {
  return CAST[kind] || CAST.npc;
}

function uniqueMats(model) {
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (Array.isArray(o.material)) o.material = o.material.map((m) => m.clone());
    else if (o.material) o.material = o.material.clone();
  });
}

const OPTIONAL = /Sword|Shield|Axe|Staff|Wand|Crossbow|Knife|Dagger|Spellbook|Mug|Throwable|Helmet|Hat|Cape/;

function applyLoadout(model, show) {
  const allow = new Set(show || []);
  model.traverse((o) => {
    if (!o.isMesh) return;
    const n = o.name || '';
    o.visible = OPTIONAL.test(n) && !/Skeleton_/.test(n) ? allow.has(n) : true;
  });
}

function monsterSpec(e) {
  const name = `${e.name || ''} ${e.arch || ''}`;
  const beast = [
    { test: /\b(boar|pig)s?\b/i, file: 'creatures/pig.glb', attack: 'Headbutt', scale: 1.2 },
    { test: /\brats?\b|\bmouse\b/i, file: 'creatures/rat.glb', attack: 'Attack', scale: 0.55 },
    { test: /\b(wolf|hound)s?\b/i, file: 'creatures/wolf.glb', attack: 'Attack', scale: 1.05 },
    { test: /\b(ram|goat|doe|deer|stag)s?\b/i, file: 'creatures/stag.glb', attack: 'Attack_Headbutt', scale: 1.12 },
    { test: /\b(crow|hawk|vulture|harpy|bird)s?\b/i, file: 'creatures/crow.glb', attack: 'Idle', scale: 0.72, hover: true },
    { test: /\bslimes?\b/i, file: 'creatures/slime.glb', attack: 'Attack', scale: 0.85 },
    { test: /\b(wisp|sprite|djinn)s?\b/i, file: 'creatures/slime.glb', attack: 'Idle', scale: 0.48, glow: '#e4d2ff', hover: true },
    { test: /\b(snake|wyrm|worm)s?\b/i, file: 'creatures/snake.glb', attack: 'Attack', scale: 0.95 },
    { test: /\bdrakes?\b/i, file: 'creatures/snake.glb', attack: 'Attack', scale: 1.5 },
    { test: /\b(entling|mossling|rootling|briar|bramble|fungal|resin|vine)\b/i, file: 'creatures/stag.glb', attack: 'Attack_Headbutt', scale: 0.9, tint: '#6f9a45' },
    { test: /\b(spider|beetle|scorpion|crab|leech|creeper|stalker)s?\b/i, file: 'creatures/spider.glb', attack: 'Attack', scale: 0.85 },
  ].find((row) => row.test.test(name));
  if (beast) {
    return { show: [], idle: 'Idle', walk: 'Walk', death: 'Death', scale: 1, ...beast };
  }
  const role = [
    { test: /scarecrow|ferryman/i, cls: 'Rogue', scale: 1.05 },
    { test: /knight|warden|sentinel|sentry|guard|arbiter/i, cls: 'Knight' },
    { test: /archer|scout/i, cls: 'Ranger' },
    { test: /witch|priest|cultist|acolyte|keeper|apostle/i, cls: 'Mage' },
    { test: /golem|troll|giant|elemental|brute/i, cls: 'Berserker', scale: 1.35 },
    { test: /raider|thug|bandit|miner|nomad/i, cls: 'Berserker' },
  ].find((row) => row.test.test(name));
  if (role) {
    if (role.cls === 'Ranger') {
      return {
        file: 'Rogue_Hooded.glb', show: ['2H_Crossbow', 'Rogue_Cape'],
        idle: 'Idle', walk: 'Walking_A', attack: '2H_Ranged_Shoot', death: 'Death_A', scale: 1,
      };
    }
    return { ...specFor(role.cls), scale: role.scale || 1, death: 'Death_A' };
  }
  const undead = /skeleton|revenant|wraith|shade|fiend|seraph|halo|void|null|abyss|rift|eater|ghast|ghost|lich|malzor/i.test(name);
  const base = { show: [], idle: 'Idle', walk: 'Walking_A', attack: '1H_Melee_Attack_Slice_Diagonal', death: 'Death_A', scale: 1 };
  if (!undead) return { ...specFor(e.boss ? 'Berserker' : 'Rogue'), death: 'Death_A', scale: e.boss ? 1.2 : 1 };
  const pick = /mage|cult|witch|priest|shaman|lich/i.test(name) ? MONSTERS.mage
    : /rogue|assassin|thief/i.test(name) ? MONSTERS.rogue
    : ((e.size || 1) < 0.85 && !e.boss) ? MONSTERS.minion
    : MONSTERS.warrior;
  return { ...base, ...pick };
}

function findClip(clips, name) {
  if (!clips || !name) return null;
  if (clips[name]) return clips[name];
  const want = name.toLowerCase();
  let fuzzy = null;
  for (const key of Object.keys(clips)) {
    const tail = key.split('|').pop().toLowerCase();
    if (tail === want) return clips[key];
    if (!fuzzy && (tail.endsWith('_' + want) || tail.endsWith(want))) fuzzy = clips[key];
  }
  return fuzzy;
}

function polishMats(model) {
  model.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const n = o.name || '';
    for (const m of mats) {
      if (!m.color) continue;
      if ('envMapIntensity' in m) m.envMapIntensity = 1.2;
      if (/Eye/i.test(n)) {
        m.emissive = new THREE.Color('#ffe7b0');
        m.emissiveIntensity = 0.9;
      } else if (/Sword|Axe|Shield|Helmet|Knife|Blade|Staff|Wand/i.test(n)) {
        if ('metalness' in m) m.metalness = Math.max(m.metalness || 0, 0.55);
        if ('roughness' in m) m.roughness = Math.min(m.roughness ?? 1, 0.34);
      } else if (/Cape|Hat|Hood|Cloak/i.test(n)) {
        if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.4, 0.78);
        if ('metalness' in m) m.metalness = Math.min(m.metalness || 0, 0.04);
      }
    }
  });
}

function holdWeapon(model, file, slotName) {
  if (!file) return;
  const slot = model.getObjectByName(slotName) || model.getObjectByName(slotName.replace(/\./g, ''));
  if (!slot) return;
  loadModel(file).then((gltf) => {
    const w = gltf.scene.clone(true);
    w.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
    });
    polishMats(w);
    slot.add(w);
  }).catch((err) => console.warn('weapon', file, err));
}

function studioEnv(renderer) {
  const room = new THREE.Scene();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const add = (color, x, y, z, s) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(s);
    room.add(mesh);
  };
  add('#fff6e4', 0, 8, 0, 5);
  add('#ffc48a', -7, 3, 5, 3.2);
  add('#7eafdf', 7, 4, -3, 2.6);
  add('#6d8f52', 0, -1, 8, 6);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  geo.dispose();
  return tex;
}

function fxMat(color) {
  return new THREE.MeshBasicMaterial({
    color: color || '#ffffff',
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

const dyeCache = new Map();

function dyeMap(src, rule) {
  const img = src && src.image;
  if (!img || !img.width) return null;
  const amount = rule.amount ?? 0.75;
  const shadow = rule.shadow ?? 0.38;
  const contrast = rule.contrast ?? 0.9;
  const lift = rule.lift ?? 0.04;
  const hi = rule.hi ?? 0.7;
    const key = `${src.uuid}|${rule.color}|${amount}|${shadow}|${contrast}|${lift}|${hi}|${rule.mask ? 1 : 0}|${rule.keepFace ? 1 : 0}`;
  const hit = dyeCache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, cv.width, cv.height);
  const px = image.data;
  const n = parseInt(String(rule.color).slice(1), 16);
  const tr = (n >> 16) & 255;
  const tg = (n >> 8) & 255;
  const tb = n & 255;
  const span = Math.max(0.08, hi - lift);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (rule.keepFace) {
      const warm = r > 80 && r > g + 6 && r > b;
      const eyeWhite = lum > 0.82 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
      if (warm || eyeWhite) continue;
    }
    const t = Math.min(1, Math.max(0, (lum - lift) / span));
    let fold = shadow + (1 - shadow) * Math.pow(t, contrast);
    if (rule.mask) {
      const skin = r > 90 && r > g + 8 && r > b ? 1 : 0;
      const bright = Math.min(1, Math.max(0, (lum - 0.28) / 0.4));
      fold *= 1 - Math.max(skin, bright * 0.85) * 0.7;
    }
    px[i] = Math.min(255, (r + (tr - r) * amount) * fold);
    px[i + 1] = Math.min(255, (g + (tg - g) * amount) * fold);
    px[i + 2] = Math.min(255, (b + (tb - b) * amount) * fold);
  }
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = src.colorSpace;
  tex.flipY = src.flipY;
  tex.wrapS = src.wrapS;
  tex.wrapT = src.wrapT;
  tex.repeat.copy(src.repeat);
  tex.offset.copy(src.offset);
  tex.anisotropy = src.anisotropy || 4;
  tex.needsUpdate = true;
  dyeCache.set(key, tex);
  return tex;
}

function dyeLook(model, rules) {
  if (!rules) return;
  model.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const rule = rules.find((r) => r.test.test(o.name || ''));
    if (!rule) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) costumeMat(m, rule);
  });
}

function costumeMat(mat, rule) {
  if (mat.map) {
    const dyed = dyeMap(mat.map, rule);
    if (dyed) mat.map = dyed;
  } else if (mat.color) {
    mat.color.set(rule.color);
  }
  if (mat.map && mat.color) mat.color.set('#ffffff');
  if (mat.emissive) {
    mat.emissive.set('#000000');
    mat.emissiveIntensity = 0;
  }
  if (rule.rough != null && 'roughness' in mat) mat.roughness = rule.rough;
  if (rule.metal != null && 'metalness' in mat) mat.metalness = rule.metal;
  mat.needsUpdate = true;
}

function pinGear(model, gear) {
  if (!gear) return;
  const slot = model.getObjectByName(gear.slot) || model.getObjectByName(gear.slot.replace(/\./g, ''));
  if (!slot) return;
  loadModel(gear.file).then((gltf) => {
    const src = gltf.scene.getObjectByName(gear.node);
    if (!src) return;
    const part = src.clone(true);
    part.traverse((o) => {
      if (!o.isMesh) return;
      o.visible = true;
      o.castShadow = true;
      o.receiveShadow = true;
      if (o.material) o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
    });
    if (gear.dye) {
      part.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) costumeMat(m, gear.dye);
      });
    }
    slot.add(part);
  }).catch((err) => console.warn('gear', err));
}

function appearanceOf(cls, look) {
  const base = (cls && CLASS_KIT[cls] && CLASS_KIT[cls].look) || {};
  if (!look && !base.skin) return null;
  return {
    hair: look?.hair || base.hair || '#6a3a1a',
    skin: look?.skin || base.skin || '#f2d0b0',
    eye: look?.eye || base.eye || '#2f6fbe',
    brow: look?.brow || base.brow || '#3a2414',
    height: look?.height || 1,
  };
}

function paintTex(src, fn) {
  const img = src && src.image;
  if (!img || !img.width) return null;
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, cv.width, cv.height);
  fn(image.data);
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = src.colorSpace;
  tex.flipY = src.flipY;
  tex.wrapS = src.wrapS;
  tex.wrapT = src.wrapT;
  tex.repeat.copy(src.repeat);
  tex.offset.copy(src.offset);
  tex.needsUpdate = true;
  return tex;
}

function rgbOf(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function tintBands(mesh, face) {
  const mat = mesh.material;
  if (!mat?.map) return;
  const skin = rgbOf(face.skin), hair = rgbOf(face.hair), eye = rgbOf(face.eye), brow = rgbOf(face.brow);
  const tex = paintTex(mat.map, (px) => {
    for (let i = 0; i < px.length; i += 4) {
      const lum = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
      const target = lum > 0.62 ? skin : lum > 0.42 ? hair : lum > 0.28 ? brow : eye;
      const shade = lum > 0.62 ? 0.72 + lum * 0.35 : 0.42 + lum * 0.7;
      px[i] = target[0] * shade;
      px[i + 1] = target[1] * shade;
      px[i + 2] = target[2] * shade;
    }
  });
  if (!tex) return;
  mat.map = tex;
  if (mat.color) mat.color.set('#ffffff');
  mat.needsUpdate = true;
}

function shiftWarm(mesh, face) {
  const mat = mesh.material;
  if (!mat?.map) return;
  const skin = rgbOf(face.skin), hair = rgbOf(face.hair);
  const tex = paintTex(mat.map, (px) => {
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if (!(r > 80 && r > g + 6 && r > b)) continue;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const target = lum > 0.48 ? skin : hair;
      const shade = 0.55 + lum * 0.5;
      px[i] = target[0] * shade;
      px[i + 1] = target[1] * shade;
      px[i + 2] = target[2] * shade;
    }
  });
  if (!tex) return;
  mat.map = tex;
  if (mat.color) mat.color.set('#ffffff');
  mat.needsUpdate = true;
}

function dressFace(model, face) {
  if (!face) return;
  model.traverse((o) => {
    if (!o.isMesh || !/Head/i.test(o.name || '') || /Hood/i.test(o.name || '')) return;
    tintBands(o, face);
  });
}

function attachHood(model, rule, face) {
  loadModel('Rogue_Hooded.glb').then((gltf) => {
    if (!model.parent) return;
    const rig = cloneSkinned(gltf.scene);
    uniqueMats(rig);
    const hood = rig.getObjectByName('Rogue_Head_Hooded');
    if (!hood) return;
    const bones = new Map();
    model.traverse((o) => { if (o.isBone) bones.set(o.name, o); });
    const mapped = hood.skeleton.bones.map((b) => bones.get(b.name));
    if (mapped.some((b) => !b)) {
      console.warn('hood bones', hood.skeleton.bones.filter((b) => !bones.has(b.name)).map((b) => b.name).slice(0, 6));
      return;
    }
    hood.removeFromParent();
    hood.bind(new THREE.Skeleton(mapped, hood.skeleton.boneInverses), hood.bindMatrix);
    hood.castShadow = true;
    hood.frustumCulled = false;
    const mats = Array.isArray(hood.material) ? hood.material : [hood.material];
    for (const m of mats) if (m) costumeMat(m, rule);
    if (face) shiftWarm(hood, face);
    model.traverse((o) => {
      if (o.isMesh && /Head/i.test(o.name || '') && o !== hood) o.visible = false;
    });
    model.add(hood);
  }).catch((err) => console.warn('hood', err));
}

function tintModel(model, hex) {
  const tint = new THREE.Color(hex);
  model.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) if (m.color) m.color.multiply(tint);
  });
}

function fitFootprint(gltf, targetWidth) {
  const model = gltf.scene.clone(true);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const sc = targetWidth / Math.max(size.x, size.z, 0.001);
  model.scale.setScalar(sc);
  const cx = (box.min.x + box.max.x) / 2;
  model.position.set(-cx * sc, -box.min.y * sc, -box.max.z * sc);
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry = o.geometry.clone();
    o.castShadow = true;
    o.receiveShadow = true;
  });
  return model;
}

function buildingFile(b) {
  const label = b.label || '';
  if (b.kind === 'tent') return 'medieval/props/tent.gltf';
  if (b.kind === 'smith' || /blacksmith/i.test(label)) return 'medieval/buildings/building_blacksmith_green.gltf';
  if (b.kind === 'chapel' || /chapel/i.test(label)) return 'medieval/buildings/building_church_green.gltf';
  if (/class hall/i.test(label)) return 'medieval/buildings/building_barracks_green.gltf';
  if (/guild/i.test(label)) return 'medieval/buildings/building_castle_green.gltf';
  if (/auction|market/i.test(label)) return 'medieval/buildings/building_market_green.gltf';
  if (/inn|storage/i.test(label)) return 'medieval/buildings/building_tavern_green.gltf';
  if (/stable/i.test(label)) return 'medieval/buildings/building_archeryrange_green.gltf';
  if (/stylist/i.test(label)) return 'medieval/buildings/building_home_A_green.gltf';
  if (/alchem/i.test(label)) return 'medieval/buildings/building_home_B_green.gltf';
  if (b.kind === 'hall') return 'medieval/buildings/building_barracks_green.gltf';
  return hash(b.x, b.y) > 0.5 ? 'medieval/buildings/building_home_A_green.gltf' : 'medieval/buildings/building_home_B_green.gltf';
}

function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function palette(theme) {
  if (theme.liquid === 'lava') return { wall: '#6a5048', roof: '#3a2824', trim: '#ff6a1f', leaf: '#5a4038', sky: '#6a4030' };
  if (theme.liquid === 'void') return { wall: '#3a2c4a', roof: '#1a1024', trim: '#b070ff', leaf: '#3a2850', sky: '#1a1028' };
  if (theme.liquid === 'ice') return { wall: '#d5dee6', roof: '#6a7e90', trim: '#8cc4e6', leaf: '#eef4f8', sky: '#d5e6f2' };
  if (theme.liquid === 'chasm') return { wall: '#cfc8dc', roof: '#6a6490', trim: '#9eb0ff', leaf: '#b7b3ca', sky: '#c5c8e6' };
  if (theme.dark > 0.25) return { wall: '#4a4038', roof: '#2a2420', trim: '#6a5848', leaf: '#3e4a38', sky: '#2a2824' };
  if (theme.ground[0][1] === 'd') return { wall: '#e6d2a8', roof: '#b56a3a', trim: '#c9a15a', leaf: '#7fa85a', sky: '#f0e0b8' };
  return { wall: '#e6d4b4', roof: '#8e3b34', trim: '#c4a36a', leaf: '#3f7a33', sky: '#9ec8ea' };
}

function mixRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function pave(wx, wy, size, rgb) {
  const row = Math.floor(wy / size);
  const sx = wx + ((row & 1) ? size * 0.5 : 0);
  const col = Math.floor(sx / size);
  const u = sx / size - col;
  const v = wy / size - row;
  const edge = Math.min(u, 1 - u, v, 1 - v);
  const tone = 0.8 + hash2(col, row, 11) * 0.24;
  const mortar = smooth(clamp(edge / 0.11, 0, 1));
  const k = lerp(0.52, tone, mortar);
  return [rgb[0] * k, rgb[1] * k, rgb[2] * k];
}

function bakeGround(map) {
  const tw = Math.max(512, Math.min(2048, Math.round(map.pw / 2.15)));
  const th = Math.max(384, Math.round(tw * map.ph / map.pw));
  const cv = document.createElement('canvas');
  cv.width = tw; cv.height = th;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(tw, th);
  const d = img.data;
  const roughCv = document.createElement('canvas');
  roughCv.width = tw; roughCv.height = th;
  const rimg = roughCv.getContext('2d').createImageData(tw, th);
  const rdta = rimg.data;
  const theme = map.theme;
  const grass = theme.ground.map(hexToRgb);
  const detail = hexToRgb(theme.detail || theme.ground[2]);
  const path = hexToRgb(theme.path);
  const pathEdge = hexToRgb(theme.pathEdge || theme.path);
  const water = hexToRgb(theme.liq);
  const deep = hexToRgb(theme.liqDeep);
  const shore = hexToRgb(theme.shore || theme.path);
  const rock = hexToRgb(theme.wall);
  const plaza = hexToRgb(map.plazaColor || '#b9ad98');
  const floorCol = map.floor ? hexToRgb(map.floorColor || theme.ground[0]) : null;
  for (let y = 0; y < th; y++) {
    const wy = ((y + 0.5) / th) * map.ph;
    for (let x = 0; x < tw; x++) {
      const wx = ((x + 0.5) / tw) * map.pw;
      let col;
      let rough = 0.96;
      if (floorCol) {
        const tx = (wx / 48) | 0, ty = (wy / 48) | 0;
        const inside = tx >= 0 && ty >= 0 && tx < map.W && ty < map.H && map.floor[ty * map.W + tx];
        if (inside) {
          const grout = (wx % 48 < 3) || (wy % 48 < 3);
          const grain = 0.9 + valueNoise(wx / 18, wy / 18, 4) * 0.14;
          const k = (grout ? 0.7 : 1) * grain;
          col = [floorCol[0] * k, floorCol[1] * k, floorCol[2] * k];
          rough = grout ? 0.94 : 0.8;
        } else {
          const band = (Math.floor(wy / 14) & 1) ? 0.84 : 1;
          const grain = 0.78 + valueNoise(wx / 16, wy / 16, 8) * 0.26;
          col = [rock[0] * grain * band, rock[1] * grain * band, rock[2] * grain * band];
          rough = 0.9;
        }
      } else {
        const gn = map.gn ? map.sampleField(map.gn, wx, wy) : 0.5;
        const t1 = clamp((gn - 0.35) * 3.2, 0, 1);
        const t2 = clamp((gn - 0.62) * 4, 0, 1);
        col = mixRgb(mixRgb(grass[1], grass[0], t1), grass[2], t2);
        const patch = valueNoise(wx / 110, wy / 110, 2);
        const streak = valueNoise(wx / 16, wy / 42, 5);
        const k = 0.88 + (patch - 0.5) * 0.26 + (streak - 0.5) * 0.14;
        col = [col[0] * k, col[1] * k, col[2] * k];
        if (hash2((wx / 64) | 0, (wy / 64) | 0, 7) > 0.82 && valueNoise(wx / 8, wy / 8, 9) > 0.66) {
          col = mixRgb(col, detail, 0.62);
        }
        const road = map.sampleField(map.road, wx, wy);
        const plazaD = map.sampleField(map.plaza, wx, wy);
        const onPlaza = plazaD < road;
        const distP = onPlaza ? plazaD : road;
        const pathAmt = 1 - smooth(clamp((distP + 8) / 38, 0, 1));
        if (pathAmt > 0.015) {
          const center = distP < -8;
          const base = onPlaza ? plaza : (center ? path : pathEdge);
          let paved = pave(wx, wy, onPlaza ? 26 : 18, base);
          if (!onPlaza && distP > -4) {
            const dirt = [pathEdge[0] * 0.7, pathEdge[1] * 0.62, pathEdge[2] * 0.52];
            paved = mixRgb(paved, dirt, smooth(clamp((distP + 4) / 24, 0, 1)));
          }
          col = mixRgb(col, paved, pathAmt);
          rough = lerp(rough, onPlaza ? 0.82 : 0.74, pathAmt);
        }
        const wall = map.sampleField(map.wall, wx, wy);
        const wallAmt = smooth(clamp((wall - 0.4) / 0.3, 0, 1));
        if (wallAmt > 0.02) {
          const band = (Math.floor(wy / 18) & 1) ? 0.86 : 1;
          const grain = 0.78 + valueNoise(wx / 22, wy / 22, 8) * 0.3;
          col = mixRgb(col, [rock[0] * grain * band, rock[1] * grain * band, rock[2] * grain * band], wallAmt);
          rough = lerp(rough, 0.9, wallAmt);
        }
      }
      const liq = map.sampleField(map.liq, wx, wy);
      const wet = smooth(clamp((liq - 0.4) / 0.16, 0, 1));
      if (wet > 0.02) {
        const depth = clamp((liq - 0.5) * 2.2, 0, 1);
        let liquid = mixRgb(water, deep, depth);
        const shoreAmt = 1 - smooth(clamp((liq - 0.42) / 0.1, 0, 1));
        liquid = mixRgb(liquid, shore, shoreAmt * 0.8);
        const ripple = 0.5 + 0.5 * Math.sin(wx * 0.04 + wy * 0.018);
        liquid = [liquid[0] + ripple * 12, liquid[1] + ripple * 14, liquid[2] + ripple * 16];
        col = mixRgb(col, liquid, wet);
        rough = lerp(rough, 0.22, wet);
      }
      const i = (y * tw + x) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      const rb = rough * 255;
      rdta[i] = rb; rdta[i + 1] = rb; rdta[i + 2] = rb; rdta[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  roughCv.getContext('2d').putImageData(rimg, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = 8;
  const roughTex = new THREE.CanvasTexture(roughCv);
  roughTex.colorSpace = THREE.NoColorSpace;
  roughTex.magFilter = THREE.LinearFilter;
  roughTex.minFilter = THREE.LinearMipmapLinearFilter;
  roughTex.anisotropy = 8;
  return { map: tex, roughnessMap: roughTex };
}

function sitMarker(file, height) {
  const group = new THREE.Group();
  loadModel(file).then((gltf) => {
    if (!group.parent) return;
    const model = gltf.scene.clone(true);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const sc = height / Math.max(size.y, 0.001);
    model.scale.setScalar(sc);
    model.position.set(
      -((box.min.x + box.max.x) / 2) * sc,
      -box.min.y * sc,
      -((box.min.z + box.max.z) / 2) * sc,
    );
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry = o.geometry.clone();
      o.castShadow = true;
      o.receiveShadow = true;
    });
    group.add(model);
  }).catch((err) => console.warn('marker', file, err));
  return group;
}

function scatterNature(view, file, points, height, tint) {
  if (!points.length) return;
  const generation = view.mapId;
  loadModel(file).then((gltf) => {
    if (view.mapId !== generation || !view.staticGroup.parent) return;
    const root = gltf.scene;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    const fit = height / Math.max(size.y, 0.001);
    const midX = (box.min.x + box.max.x) / 2;
    const midZ = (box.min.z + box.max.z) / 2;
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const pos = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    root.traverse((o) => {
      if (!o.isMesh) return;
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      geo.translate(-midX, -box.min.y, -midZ);
      geo.scale(fit, fit, fit);
      const mat = o.material.clone();
      if (tint && mat.color) mat.color.set(tint);
      const mesh = new THREE.InstancedMesh(geo, mat, points.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      points.forEach((p, i) => {
        const sc = p.sc || 1;
        pos.set(p.x * S, 0, p.y * S);
        q.setFromAxisAngle(up, hash(p.x, p.y) * Math.PI * 2);
        s.set(sc, sc, sc);
        m4.compose(pos, q, s);
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
      view.staticGroup.add(mesh);
    });
  }).catch((err) => console.warn('nature', file, err));
}

function markerMesh(o) {
  if (o.type === 'chest') return sitMarker('dungeon/chest.glb', 0.9);
  if (o.type === 'waystone') return sitMarker('dungeon/column.glb', 2.15);
  const color = {
    portal: '#7ec8ff', dungeon: '#e07040', waystone: '#f0d78a', chest: '#c9a15a',
    gather: '#6dce7a', craft: '#8a5a3a', rune: '#b070ff', arena: '#d070ff',
  }[o.type] || '#ffd76a';
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.28, roughness: 0.5 });
  let mesh;
  if (o.type === 'portal' || o.type === 'dungeon' || o.type === 'arena') {
    mesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.08, 8, 24), mat);
    mesh.position.y = 1.25;
  } else if (o.type === 'craft') {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.7, 0.6), mat);
    mesh.position.y = 0.35;
  } else {
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), mat);
    mesh.position.y = 0.85;
  }
  mesh.castShadow = true;
  return mesh;
}

function makeLabel(fixed) {
  const cv = document.createElement('canvas');
  cv.width = fixed ? 512 : 256;
  cv.height = fixed ? 128 : 64;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  if (fixed) mat.sizeAttenuation = false;
  const sp = new THREE.Sprite(mat);
  sp.scale.set(fixed ? 0.34 : 2.4, fixed ? 0.085 : 0.6, 1);
  if (fixed) sp.center.set(0.5, 0);
  sp.userData.cv = cv;
  sp.userData.key = '';
  return sp;
}

function writeLabel(sp, name, hp, maxHp, color, role) {
  const job = role || '';
  const key = `${name}|${job}|${Math.round((hp / Math.max(1, maxHp)) * 20)}|${color}`;
  if (sp.userData.key === key) return;
  sp.userData.key = key;
  const cv = sp.userData.cv;
  const w = cv.width;
  const h = cv.height;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, w, h);
  g.textAlign = 'center';
  g.lineWidth = Math.max(4, h * 0.06);
  g.strokeStyle = 'rgba(8,6,12,0.9)';
  if (job) {
    const nameSize = Math.round(h * 0.34);
    const jobSize = Math.round(h * 0.26);
    const jobY = h * 0.92;
    const nameY = jobY - Math.round(jobSize * 0.72);
    g.font = `700 ${nameSize}px Source Sans 3, sans-serif`;
    g.strokeText(name, w / 2, nameY);
    g.fillStyle = color;
    g.fillText(name, w / 2, nameY);
    g.font = `600 ${jobSize}px Source Sans 3, sans-serif`;
    g.lineWidth = Math.max(3, h * 0.04);
    g.strokeText(job, w / 2, jobY);
    g.fillStyle = '#ffe08a';
    g.fillText(job, w / 2, jobY);
  } else {
    const showBar = maxHp > 1 && hp < maxHp;
    const nameY = showBar ? h * 0.8 : h * 0.9;
    g.font = `700 ${Math.round(h * 0.42)}px Source Sans 3, sans-serif`;
    g.strokeText(name, w / 2, nameY);
    g.fillStyle = color;
    g.fillText(name, w / 2, nameY);
    if (showBar) {
      const bw = Math.round(w * 0.16);
      const bh = Math.max(3, Math.round(h * 0.028));
      const x = (w - bw) / 2;
      const y = Math.round(h * 0.9);
      g.fillStyle = 'rgba(0,0,0,0.55)';
      g.fillRect(x, y, bw, bh);
      g.fillStyle = hp / maxHp < 0.35 ? '#ff5a4a' : '#5dff8a';
      g.fillRect(x, y, bw * Math.max(0, hp / maxHp), bh);
    }
  }
  sp.material.map.needsUpdate = true;
}

export class WorldView {
  constructor(canvas) {
    this.canvas = canvas;
    this.S = S;
    this.pitch = 42 * Math.PI / 180;
    this.yaw = -48 * Math.PI / 180;
    this.dist = 36;
    this.distMin = 16;
    this.distMax = 64;
    this.pitchMin = 24 * Math.PI / 180;
    this.pitchMax = 68 * Math.PI / 180;
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? 1.1 : 1 / 1.1;
      if (e.shiftKey) {
        const dir = e.deltaY > 0 ? -1 : 1;
        this.pitch = Math.min(this.pitchMax, Math.max(this.pitchMin, this.pitch + dir * 0.06));
      } else {
        this.dist = Math.min(this.distMax, Math.max(this.distMin, this.dist * step));
      }
      this.aim();
    }, { passive: false });
    this.focusX = 0;
    this.focusY = 0;
    this.mapId = '';
    this.actors = new Map();
    this.floats = [];
    this.fx = [];
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
    this.scene.environment = studioEnv(this.renderer);
    this.scene.add(new THREE.HemisphereLight('#fff3dc', '#243848', 0.9));
    this.sun = new THREE.DirectionalLight('#fff6e2', 2.25);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 70;
    this.sun.shadow.camera.left = -22;
    this.sun.shadow.camera.right = 22;
    this.sun.shadow.camera.top = 22;
    this.sun.shadow.camera.bottom = -22;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.fill = new THREE.DirectionalLight('#ffc9a2', 0.48);
    this.rim = new THREE.DirectionalLight('#9ec8ff', 0.72);
    this.scene.add(this.fill);
    this.scene.add(this.rim);
    this.renderer.toneMappingExposure = 1.22;
    this.staticGroup = new THREE.Group();
    this.scene.add(this.staticGroup);
    this.markerGroup = new THREE.Group();
    this.scene.add(this.markerGroup);
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.hit = new THREE.Vector3();
    this.ndc = new THREE.Vector2();
    this.last = performance.now();
    this.moveRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.42, 24),
      new THREE.MeshBasicMaterial({ color: '#ffe08a', side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    );
    this.moveRing.rotation.x = -Math.PI / 2;
    this.moveRing.visible = false;
    this.scene.add(this.moveRing);
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.cssW = w;
    this.cssH = h;
  }

  follow(target, dt, map) {
    const k = 1 - Math.pow(0.0008, dt || 0.016);
    this.focusX += (target.x - this.focusX) * k;
    this.focusY += (target.y - this.focusY) * k;
    if (map) {
      const m = 120;
      this.focusX = Math.min(Math.max(this.focusX, m), Math.max(m, map.pw - m));
      this.focusY = Math.min(Math.max(this.focusY, m), Math.max(m, map.ph - m));
    }
    this.aim();
  }

  snap(target) {
    this.focusX = target.x;
    this.focusY = target.y;
    this.aim();
  }

  aim() {
    const tx = this.focusX * S;
    const tz = this.focusY * S;
    const dist = this.dist;
    const flat = Math.cos(this.pitch) * dist;
    this.camera.position.set(
      tx + Math.sin(this.yaw) * flat,
      Math.sin(this.pitch) * dist,
      tz + Math.cos(this.yaw) * flat,
    );
    this.camera.lookAt(tx, 1.15, tz);
    if (this.scene.fog) {
      this.scene.fog.near = this.dist * 0.85;
      this.scene.fog.far = this.dist * 3.4;
    }
    const span = Math.max(24, this.dist * 1.15);
    this.sun.shadow.camera.left = -span;
    this.sun.shadow.camera.right = span;
    this.sun.shadow.camera.top = span;
    this.sun.shadow.camera.bottom = -span;
    this.sun.shadow.camera.far = this.dist * 3.5;
    this.sun.shadow.camera.updateProjectionMatrix();
    this.sun.position.set(tx - Math.sin(this.yaw) * 12, 14, tz - Math.cos(this.yaw) * 8);
    this.sun.target.position.set(tx, 0, tz);
    this.sun.target.updateMatrixWorld();
    this.fill.position.set(tx + 12, 7, tz + 4);
    this.rim.position.set(tx - 9, 6, tz - 11);
  }

  screenToWorld(sx, sy) {
    this.ndc.set((sx / this.cssW) * 2 - 1, -(sy / this.cssH) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, this.hit)) return { x: this.focusX, y: this.focusY };
    return { x: this.hit.x / S, y: this.hit.z / S };
  }

  worldToScreen(x, y) {
    this.hit.set(x * S, 0, y * S).project(this.camera);
    return { x: (this.hit.x * 0.5 + 0.5) * this.cssW, y: (-this.hit.y * 0.5 + 0.5) * this.cssH };
  }

  render(game) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const w = game.world;
    const map = w?.map;
    if (!map) return;
    if (this.mapId !== map.id) this.buildMap(map);
    this.syncActors(w, dt);
    this.syncMarkers(w);
    this.syncFx(w);
    if (game.moveTo) {
      this.moveRing.visible = true;
      this.moveRing.position.set(game.moveTo.x * S, 0.05, game.moveTo.y * S);
    } else this.moveRing.visible = false;
    this.renderer.render(this.scene, this.camera);
  }

  buildMap(map) {
    this.mapId = map.id;
    for (const rec of this.actors.values()) this.dropActor(rec);
    this.actors.clear();
    this.scene.remove(this.staticGroup);
    this.staticGroup.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    this.staticGroup = new THREE.Group();
    this.scene.add(this.staticGroup);
    const pal = palette(map.theme);
    this.scene.background = new THREE.Color(pal.sky);
    this.scene.fog = new THREE.Fog(pal.sky, 16, 48);
    const baked = bakeGround(map);
    const maxA = this.renderer.capabilities.getMaxAnisotropy();
    baked.map.anisotropy = maxA;
    baked.roughnessMap.anisotropy = maxA;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(map.pw * S, map.ph * S),
      new THREE.MeshStandardMaterial({ map: baked.map, roughnessMap: baked.roughnessMap, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set((map.pw * S) / 2, 0, (map.ph * S) / 2);
    ground.receiveShadow = true;
    this.staticGroup.add(ground);
    this.addBuildings(map);
    this.addNature(map);
    this.objStamp = '';
  }

  addBuildings(map) {
    for (const b of map.buildings) {
      const width = Math.max(b.kind === 'tent' ? 2.4 : 3.4, b.w * S);
      const anchor = new THREE.Group();
      anchor.position.set((b.x + b.w / 2) * S, 0, b.y * S);
      this.staticGroup.add(anchor);
      loadModel(buildingFile(b)).then((gltf) => {
        if (!anchor.parent) return;
        anchor.add(fitFootprint(gltf, width));
      }).catch((err) => console.warn('building', err));
    }
  }

  addNature(map) {
    const buckets = {};
    const put = (key, p, sc) => {
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push({ x: p.x, y: p.y, sc });
    };
    for (const p of map.props) {
      const t = p.type || '';
      if (/snowpine/.test(t)) put('snow', p, 1.05);
      else if (/deadtree/.test(t)) put('dead', p, 0.95 + hash(p.x, p.y) * 0.25);
      else if (/bigtree/.test(t)) put('big', p, 1.05 + hash(p.y, p.x) * 0.2);
      else if (/pine/.test(t)) put('oak', p, 1.18);
      else if (/oak|palm/.test(t)) put('oak', p, 0.88 + hash(p.x, p.y) * 0.32);
      else if (/voidcrystal|crystal/.test(t)) put('crystal', p, 0.75 + hash(p.x, p.y) * 0.4);
      else if (/icespike|stalagmite/.test(t)) put('spire', p, 0.85 + hash(p.x, p.y) * 0.35);
      else if (/rock/.test(t)) put(hash(p.x, p.y) > 0.5 ? 'rock' : 'rockb', p, 0.7 + hash(p.y, p.x) * 0.55);
      else if (/fence/.test(t)) put('fence', p, 0.95);
      else if (/lantern/.test(t)) put('flag', p, 1);
      else if (/brazier/.test(t)) put('barrel', p, 0.85);
      else if (/pillar/.test(t)) put('pillar', p, 1);
    }
    const specs = {
      oak: ['medieval/nature/tree_single_A.gltf', 3.5],
      big: ['medieval/nature/tree_single_B.gltf', 4.4],
      dead: ['medieval/nature/tree_single_A_cut.gltf', 2.6, '#c4b09a'],
      snow: ['medieval/nature/tree_single_B.gltf', 3.8, '#e7f2f8'],
      rock: ['medieval/nature/rock_single_A.gltf', 1.25],
      rockb: ['medieval/nature/rock_single_B.gltf', 1.15],
      spire: ['medieval/nature/rock_single_C.gltf', 1.45],
      crystal: ['medieval/nature/rock_single_C.gltf', 1.1, '#d9c6ff'],
      fence: ['medieval/props/resource_lumber.gltf', 1.15],
      flag: ['medieval/props/flag_green.gltf', 2.05],
      barrel: ['medieval/props/barrel.gltf', 0.72],
      pillar: ['dungeon/column.glb', 2.4],
    };
    for (const key of Object.keys(buckets)) {
      const row = specs[key];
      if (row) scatterNature(this, row[0], buckets[key], row[1], row[2]);
    }
  }

  syncMarkers(w) {
    const stamp = `${w.map.id}:${w.objects.length}`;
    if (this.objStamp !== stamp) {
      this.objStamp = stamp;
      this.scene.remove(this.markerGroup);
      this.markerGroup = new THREE.Group();
      this.scene.add(this.markerGroup);
      this.markers = [];
      for (const o of w.objects) {
        const mesh = markerMesh(o);
        mesh.position.set(o.x * S, 0, o.y * S);
        mesh.visible = !o.hidden;
        this.markerGroup.add(mesh);
        this.markers.push(mesh);
      }
    } else if (this.markers) {
      w.objects.forEach((o, i) => { if (this.markers[i]) this.markers[i].visible = !o.hidden; });
    }
  }

  syncActors(w, dt) {
    const list = [];
    for (const h of w.heroes) list.push([h, 'hero']);
    for (const h of w.ghosts || []) list.push([h, 'hero']);
    for (const n of w.npcs) list.push([n, 'npc']);
    for (const m of w.monsters) list.push([m, 'monster']);
    const seen = new Set();
    for (const [e, kind] of list) {
      seen.add(e);
      let rec = this.actors.get(e);
      if (!rec) {
        rec = this.spawn(e, kind);
        this.actors.set(e, rec);
      }
      this.place(rec, e, kind, dt);
    }
    for (const [e, rec] of this.actors) {
      if (!seen.has(e)) {
        this.dropActor(rec);
        this.actors.delete(e);
      }
    }
  }

  spawn(e, kind) {
    const root = new THREE.Group();
    const label = makeLabel(true);
    label.position.y = 1.82;
    root.add(label);
    this.scene.add(root);
    const rec = { root, label, kind, mixer: null, action: null, clip: '', ready: false, disposed: false };
    const spec = kind === 'monster' ? monsterSpec(e)
      : kind === 'npc' ? npcSpec(e)
      : specFor(e.cls);
    rec.spec = spec;
    const shade = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 16),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }),
    );
    shade.rotation.x = -Math.PI / 2;
    shade.position.y = 0.03;
    root.add(shade);
    loadModel(spec.file).then((gltf) => {
      if (rec.disposed) return;
      const model = cloneSkinned(gltf.scene);
      uniqueMats(model);
      applyLoadout(model, spec.show);
      polishMats(model);
      dyeLook(model, spec.dye);
      pinGear(model, spec.gear);
      const face = kind === 'hero' ? appearanceOf(e.cls, e.look) : null;
      if (face) dressFace(model, face);
      if (spec.hood) attachHood(model, spec.hood, face || appearanceOf(e.cls, null));
      if (spec.tint) tintModel(model, spec.tint);
      if (spec.glow) {
        model.traverse((o) => {
          if (!o.isMesh || !o.material || !o.material.emissive) return;
          o.material.emissive = new THREE.Color(spec.glow);
          o.material.emissiveIntensity = 0.7;
        });
      }
      const tall = kind === 'hero' ? (appearanceOf(e.cls, e.look)?.height || 1) : 1;
      const sc = (kind === 'monster' ? (e.size || 1) * (e.boss ? 1.35 : 1) : 1) * gltf.userData.scale * (spec.scale || 1) * tall;
      model.scale.setScalar(sc);
      model.position.y = -gltf.userData.foot * sc;
      model.userData.baseY = model.position.y;
      root.add(model);
      model.updateMatrixWorld(true);
      const top = new THREE.Box3().setFromObject(model).max.y - rec.root.position.y;
      if (Number.isFinite(top)) rec.label.position.y = top + 0.04;
      if (kind === 'monster' && (spec.right || spec.left)) {
        holdWeapon(model, spec.right, 'handslot.r');
        holdWeapon(model, spec.left, 'handslot.l');
      }
      rec.mixer = new THREE.AnimationMixer(model);
      rec.clips = {};
      for (const c of gltf.animations) rec.clips[c.name] = c;
      rec.model = model;
      rec.ready = true;
    }).catch((err) => console.warn('model', spec.file, err));
    return rec;
  }

  place(rec, e, kind, dt) {
    rec.root.position.set(e.x * S, (e.z || 0) * S, e.y * S);
    const face = e.dir === 1 ? -Math.PI / 2 : e.dir === 2 ? Math.PI / 2 : e.dir === 3 ? Math.PI : 0;
    let d = face - rec.root.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    rec.root.rotation.y += d * Math.min(1, dt * 12);
    const name = e.name || '';
    const color = kind === 'monster' ? (e.boss ? '#ff8a55' : '#ffd0d0') : kind === 'npc' ? '#ffe8b0' : '#e8eef7';
    const job = kind === 'npc' ? (e.title || '') : '';
    writeLabel(rec.label, name, e.hp ?? 1, e.maxHp ?? 1, color, job);
    if (!rec.ready) return;
    const stealth = e.buffs?.some((b) => b.stealth);
    rec.model.traverse((o) => {
      if (o.isMesh && o.material && !Array.isArray(o.material)) {
        o.material.transparent = !!stealth;
        o.material.opacity = stealth ? 0.35 : 1;
      }
    });
    const dead = !!e.dead;
    const attacking = !dead && e.atkAnim >= 0;
    const moving = !dead && !!e.moving;
    if (rec.model && rec.spec?.hover) {
      const base = rec.model.userData.baseY || 0;
      rec.model.position.y = base + Math.sin(performance.now() / 280) * 0.12;
    }
    const deadClip = rec.spec?.death || 'Death_A';
    const clipName = dead ? deadClip : attacking ? rec.spec.attack : moving ? rec.spec.walk : rec.spec.idle;
    this.play(rec, clipName, dead || attacking);
    rec.mixer.update(dt);
  }

  play(rec, name, once) {
    if (rec.clip === name) return;
    const clip = findClip(rec.clips, name) || findClip(rec.clips, rec.spec?.idle) || findClip(rec.clips, 'Idle') || rec.clips['2H_Melee_Idle'];
    if (!clip) return;
    const next = rec.mixer.clipAction(clip);
    next.reset().fadeIn(0.1).play();
    if (once) {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
    } else next.setLoop(THREE.LoopRepeat, Infinity);
    if (rec.action) rec.action.fadeOut(0.1);
    rec.action = next;
    rec.clip = name;
  }

  dropActor(rec) {
    rec.disposed = true;
    this.scene.remove(rec.root);
  }

  claimFx(kind, make) {
    if (!this.fxPools) this.fxPools = {};
    const list = this.fxPools[kind] || (this.fxPools[kind] = []);
    const i = this.fxCursor[kind] || 0;
    this.fxCursor[kind] = i + 1;
    let mesh = list[i];
    if (!mesh) {
      mesh = make();
      this.scene.add(mesh);
      list[i] = mesh;
    }
    mesh.visible = true;
    return mesh;
  }

  syncFx(w) {
    this.fxCursor = {};
    for (const p of w.parts || []) {
      const mesh = this.claimFx('spark', () => new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), fxMat('#fff')));
      const k = p.t / p.dur;
      mesh.material.color.set(p.color || '#fff');
      mesh.material.opacity = 0.95 * (1 - k);
      mesh.position.set(p.x * S, 0.4 + (1 - k) * 0.9, p.y * S);
      mesh.scale.setScalar(Math.max(0.35, (p.size || 3) / 7));
    }
    for (const r of w.rings || []) {
      const mesh = this.claimFx('ring', () => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.78, 1, 32), fxMat('#fff'));
        m.rotation.x = -Math.PI / 2;
        return m;
      });
      const k = r.t / r.dur;
      const rad = Math.max(0.25, r.r * S * (0.25 + k * 0.85));
      mesh.material.color.set(r.color || '#fff');
      mesh.material.opacity = 0.9 * (1 - k);
      mesh.position.set(r.x * S, 0.08, r.y * S);
      mesh.scale.set(rad, rad, 1);
    }
    for (const s of w.slashes || []) {
      const arc = Math.max(0.35, ((s.arc || 90) * Math.PI) / 180);
      const mesh = this.claimFx('slash', () => {
        const g = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 1, 1, 16, -0.5, 1), fxMat('#fff'));
        ring.rotation.x = -Math.PI / 2;
        ring.name = 'arc';
        g.add(ring);
        return g;
      });
      const ring = mesh.getObjectByName('arc');
      if (ring.userData.arc !== arc) {
        ring.geometry.dispose();
        ring.geometry = new THREE.RingGeometry(0.55, 1, 1, Math.max(10, Math.round(arc * 12)), -arc / 2, arc);
        ring.userData.arc = arc;
      }
      const k = s.t / s.dur;
      ring.material.color.set(s.color || '#fff6d0');
      ring.material.opacity = 0.95 * (1 - k);
      mesh.position.set(s.x * S, 0.12, s.y * S);
      mesh.rotation.y = -(s.ang || 0);
      mesh.scale.setScalar(Math.max(0.4, s.r * S) * (0.72 + k * 0.4));
    }
    for (const b of w.beams || []) {
      const mesh = this.claimFx('beam', () => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), fxMat('#fff')));
      const x1 = b.x1 * S, z1 = b.y1 * S, x2 = b.x2 * S, z2 = b.y2 * S;
      const len = Math.max(0.2, Math.hypot(x2 - x1, z2 - z1));
      const k = b.t / b.dur;
      mesh.material.color.set(b.color || '#fff');
      mesh.material.opacity = 0.9 * (1 - k);
      mesh.position.set((x1 + x2) / 2, 1.2, (z1 + z2) / 2);
      mesh.scale.set(Math.max(0.08, (b.w || 8) * S * 2.2), 0.16, len);
      mesh.rotation.set(0, Math.PI / 2 - Math.atan2(z2 - z1, x2 - x1), 0);
    }
    for (const p of w.projectiles || []) {
      const bolt = p.kind === 'arrow' || p.kind === 'knife';
      const mesh = this.claimFx(bolt ? 'bolt' : 'orb', () => {
        if (bolt) {
          const g = new THREE.Group();
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.62, 7), fxMat('#fff'));
          cone.rotation.x = Math.PI / 2;
          cone.name = 'tip';
          g.add(cone);
          return g;
        }
        return new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), fxMat('#fff'));
      });
      const mat = mesh.material || mesh.getObjectByName('tip').material;
      mat.color.set(p.color || '#fff');
      mat.opacity = 0.95;
      mesh.position.set(p.x * S, bolt ? 1.05 : 1.2, p.y * S);
      if (bolt) {
        const ang = Math.atan2(p.vy || 0, p.vx || 1);
        mesh.rotation.y = Math.PI / 2 - ang;
        mesh.scale.setScalar(p.kind === 'knife' ? 0.7 : 1);
      } else {
        mesh.rotation.set(0, 0, 0);
        mesh.scale.setScalar(1 + Math.sin((p.t || 0) * 18) * 0.18);
      }
    }
    for (const z of w.zones || []) {
      const mesh = this.claimFx('zone', () => {
        const g = new THREE.Group();
        const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 28), fxMat('#fff'));
        disc.rotation.x = -Math.PI / 2;
        disc.name = 'disc';
        const edge = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 32), fxMat('#fff'));
        edge.rotation.x = -Math.PI / 2;
        edge.position.y = 0.02;
        edge.name = 'edge';
        g.add(disc, edge);
        return g;
      });
      const pulse = 0.85 + Math.sin((z.t || 0) * 6) * 0.15;
      mesh.position.set(z.x * S, 0.05, z.y * S);
      mesh.scale.setScalar(Math.max(0.4, z.r * S));
      const disc = mesh.getObjectByName('disc');
      const edge = mesh.getObjectByName('edge');
      disc.material.color.set(z.color || '#fff');
      edge.material.color.set(z.color || '#fff');
      disc.material.opacity = 0.22 * pulse;
      edge.material.opacity = 0.8;
    }
    for (const t of w.telegraphs || []) {
      const k = Math.min(1, t.e / Math.max(0.001, t.t));
      const color = t.color || '#ff8040';
      if (t.shape === 'line') {
        const mesh = this.claimFx('tellLine', () => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), fxMat('#ff8040')));
        const len = Math.max(0.4, (t.len || 80) * S);
        const ang = t.ang || 0;
        mesh.material.color.set(color);
        mesh.material.opacity = 0.22 + k * 0.6;
        mesh.scale.set(Math.max(0.2, (t.w || 36) * S), 0.05, len);
        mesh.position.set(t.x * S + Math.cos(ang) * len / 2, 0.07, t.y * S + Math.sin(ang) * len / 2);
        mesh.rotation.set(0, Math.PI / 2 - ang, 0);
      } else if (t.shape === 'cone') {
        const arc = Math.max(0.35, ((t.arc || 90) * Math.PI) / 180);
        const mesh = this.claimFx('tellCone', () => {
          const g = new THREE.Group();
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.15, 1, 1, 16, -0.5, 1), fxMat('#ff8040'));
          ring.rotation.x = -Math.PI / 2;
          ring.name = 'arc';
          g.add(ring);
          return g;
        });
        const ring = mesh.getObjectByName('arc');
        if (ring.userData.arc !== arc) {
          ring.geometry.dispose();
          ring.geometry = new THREE.RingGeometry(0.08, 1, 1, Math.max(10, Math.round(arc * 10)), -arc / 2, arc);
          ring.userData.arc = arc;
        }
        ring.material.color.set(color);
        ring.material.opacity = 0.2 + k * 0.55;
        mesh.position.set(t.x * S, 0.07, t.y * S);
        mesh.rotation.y = -(t.ang || 0);
        mesh.scale.setScalar(Math.max(0.4, (t.r || 60) * S));
      } else {
        const mesh = this.claimFx(t.shape === 'ring' ? 'tellRing' : 'tellDisc', () => {
          const geo = t.shape === 'ring'
            ? new THREE.RingGeometry(0.72, 1, 32)
            : new THREE.CircleGeometry(1, 28);
          const m = new THREE.Mesh(geo, fxMat('#ff8040'));
          m.rotation.x = -Math.PI / 2;
          return m;
        });
        mesh.material.color.set(color);
        mesh.material.opacity = t.shape === 'ring' ? 0.35 + k * 0.5 : 0.16 + k * 0.4;
        mesh.position.set(t.x * S, 0.06, t.y * S);
        mesh.scale.setScalar(Math.max(0.3, (t.r || 40) * S));
      }
    }
    for (const m of w.meteors || []) {
      const mesh = this.claimFx('meteor', () => new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), fxMat('#ffb060')));
      const k = m.t / m.dur;
      mesh.material.color.set(m.color || '#ffb060');
      mesh.material.opacity = 0.95;
      mesh.position.set(m.x * S, 7 * (1 - k) + 0.35, m.y * S);
      mesh.scale.setScalar((m.scale || 1) * (0.7 + k * 0.5));
      const mark = this.claimFx('meteorMark', () => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 24), fxMat('#ffb060'));
        ring.rotation.x = -Math.PI / 2;
        return ring;
      });
      mark.material.color.set(m.color || '#ffb060');
      mark.material.opacity = 0.35 + k * 0.5;
      mark.position.set(m.x * S, 0.06, m.y * S);
      mark.scale.setScalar(0.6 + k * 1.1);
    }
    if (this.fxPools) {
      for (const kind of Object.keys(this.fxPools)) {
        const used = this.fxCursor[kind] || 0;
        const list = this.fxPools[kind];
        for (let i = used; i < list.length; i++) list[i].visible = false;
      }
    }

    const floats = w.floats || [];
    while (this.floats.length < floats.length) {
      const sp = makeLabel();
      sp.scale.set(1.6, 0.4, 1);
      this.scene.add(sp);
      this.floats.push(sp);
    }
    for (let i = 0; i < this.floats.length; i++) {
      const sp = this.floats[i];
      const f = floats[i];
      if (!f) { sp.visible = false; continue; }
      sp.visible = true;
      const k = f.t / f.dur;
      writeLabel(sp, f.text, 1, 1, f.color || '#fff');
      sp.position.set(f.x * S, 1.8 + k * 1.6, f.y * S);
      sp.material.opacity = k > 0.7 ? (1 - k) / 0.3 : 1;
    }
  }
}

const busts = new WeakMap();

function bustFor(canvas, opts) {
  let b = busts.get(canvas);
  if (b) return b;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !opts.bg, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  const scene = new THREE.Scene();
  if (opts.bg) scene.background = new THREE.Color(opts.bg);
  const camera = new THREE.PerspectiveCamera(30, canvas.width / Math.max(1, canvas.height), 0.05, 40);
  scene.environment = studioEnv(renderer);
  scene.add(new THREE.HemisphereLight('#fff6ea', '#4a5c74', 1.2));
  const key = new THREE.DirectionalLight('#fffaf2', 2.35);
  key.position.set(-0.8, 3.4, 4.4);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#ffe6c8', 0.85);
  fill.position.set(2.6, 1.6, 3.4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#d5e4ff', 0.7);
  rim.position.set(-3.2, 2.4, -1.6);
  scene.add(rim);
  const holder = new THREE.Group();
  scene.add(holder);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.3, 24),
    new THREE.MeshStandardMaterial({ color: '#1a2030', roughness: 0.8 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  renderer.setSize(canvas.width, canvas.height, false);
  b = { renderer, scene, camera, holder, cls: '', mixer: null, last: performance.now(), token: 0 };
  busts.set(canvas, b);
  return b;
}

function showBust(canvas, cls, spin, look) {
  if (!canvas) return;
  const b = bustFor(canvas, { bg: canvas.id === 'preview' || canvas.dataset.bust === 'card' ? '#243044' : null });
  const now = performance.now();
  const dt = Math.min(0.05, (now - b.last) / 1000);
  b.last = now;
  const face = appearanceOf(cls, look);
  const lookKey = face ? `${face.hair}|${face.skin}|${face.eye}|${face.brow}|${face.height}` : '';
  if (b.cls !== cls || b.lookKey !== lookKey) {
    b.cls = cls;
    b.lookKey = lookKey;
    b.token++;
    const token = b.token;
    const spec = specFor(cls);
    while (b.holder.children.length) b.holder.remove(b.holder.children[0]);
    b.mixer = null;
    loadModel(spec.file).then((gltf) => {
      if (b.token !== token) return;
      const model = cloneSkinned(gltf.scene);
      uniqueMats(model);
      applyLoadout(model, spec.show);
      polishMats(model);
      dyeLook(model, spec.dye);
      pinGear(model, spec.gear);
      dressFace(model, face);
      if (spec.hood) attachHood(model, spec.hood, face);
      const tall = face?.height || 1;
      model.scale.setScalar(gltf.userData.scale * tall);
      model.position.y = -gltf.userData.foot * gltf.userData.scale * tall;
      b.holder.add(model);
      b.mixer = new THREE.AnimationMixer(model);
      const clip = gltf.animations.find((a) => a.name === spec.idle) || gltf.animations.find((a) => a.name === 'Idle');
      if (clip) b.mixer.clipAction(clip).play();
    }).catch((err) => console.warn('bust', err));
  }
  if (spin) b.holder.rotation.y = Math.sin(now / 900) * 0.7 + 0.4;
  if (b.mixer) b.mixer.update(dt);
  const card = canvas.dataset.bust === 'card';
  const lookY = card ? 1.12 : (canvas.id === 'portrait' || canvas.id === 'dlg-face' ? 1.35 : 0.95);
  if (card) {
    b.camera.position.set(0.9, 1.62, 2.75);
    b.camera.lookAt(0, 1.05, 0);
  } else {
    b.camera.position.set(1.5, lookY + 0.7, 3.1);
    b.camera.lookAt(0, lookY, 0);
  }
  b.renderer.render(b.scene, b.camera);
}

export function tickPreview(canvas, cls, look) {
  showBust(canvas, cls, true, look);
}

export function paintBust(canvas, cls, look) {
  showBust(canvas, cls, false, look);
}
