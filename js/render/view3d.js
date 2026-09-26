import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { clone as cloneSkinned } from '../vendor/SkeletonUtils.js';

const S = 1 / 48;
const loader = new GLTFLoader();
const models = new Map();

const CAST = {
  Knight: { file: 'Knight.glb', show: ['1H_Sword', 'Rectangle_Shield', 'Knight_Helmet', 'Knight_Cape'], idle: 'Idle', walk: 'Walking_A', attack: '1H_Melee_Attack_Slice_Diagonal' },
  Berserker: { file: 'Barbarian.glb', show: ['2H_Axe', 'Barbarian_Cape'], idle: '2H_Melee_Idle', walk: 'Walking_A', attack: '2H_Melee_Attack_Chop' },
  Assassin: { file: 'Rogue.glb', show: ['Knife', 'Knife_Offhand', 'Rogue_Cape'], idle: 'Idle', walk: 'Walking_A', attack: 'Dualwield_Melee_Attack_Slice' },
  Ranger: { file: 'Rogue_Hooded.glb', show: ['2H_Crossbow', 'Rogue_Cape'], idle: 'Idle', walk: 'Walking_A', attack: '2H_Ranged_Shoot' },
  Mage: { file: 'Mage.glb', show: ['2H_Staff', 'Mage_Hat', 'Mage_Cape'], idle: 'Idle', walk: 'Walking_A', attack: 'Spellcast_Shoot' },
  Priest: { file: 'Mage.glb', show: ['1H_Wand', 'Spellbook_open', 'Mage_Hat', 'Mage_Cape'], idle: 'Idle', walk: 'Walking_A', attack: 'Spellcasting' },
  Guard: { file: 'Knight.glb', show: ['1H_Sword', 'Badge_Shield', 'Knight_Helmet'], idle: 'Idle', walk: 'Walking_A', attack: '1H_Melee_Attack_Stab' },
  npc: { file: 'Rogue.glb', show: ['Rogue_Cape'], idle: 'Idle', walk: 'Walking_A', attack: 'Idle' },
};

const BODY = /Body|Head|Leg|Arm|Cape|Helmet|Hat|Hood/;

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

function applyLoadout(model, show) {
  const allow = new Set(show);
  model.traverse((o) => {
    if (!o.isMesh) return;
    const n = o.name || '';
    if (BODY.test(n)) o.visible = true;
    else o.visible = allow.has(n);
  });
}

function tintModel(model, hex) {
  const tint = new THREE.Color(hex);
  model.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) if (m.color) m.color.multiply(tint);
  });
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

function bakeGround(map) {
  const tw = Math.min(1024, Math.max(256, map.W * 8));
  const th = Math.min(1024, Math.max(256, map.H * 8));
  const cv = document.createElement('canvas');
  cv.width = tw; cv.height = th;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(tw, th);
  const d = img.data;
  const theme = map.theme;
  const grass = theme.ground.map((h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  });
  const hex = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const path = hex(theme.path);
  const water = hex(theme.liq);
  const deep = hex(theme.liqDeep);
  const stone = hex(theme.wall);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const wx = ((x + 0.5) / tw) * map.pw;
      const wy = ((y + 0.5) / th) * map.ph;
      const liq = map.sampleField(map.liq, wx, wy);
      const road = map.sampleField(map.road, wx, wy);
      const wall = map.sampleField(map.wall, wx, wy);
      const plaza = map.sampleField(map.plaza, wx, wy);
      const n = hash(x, y);
      let r, g, b;
      if (liq > 0.55) {
        const k = Math.min(1, (liq - 0.55) / 0.4);
        r = water[0] + (deep[0] - water[0]) * k;
        g = water[1] + (deep[1] - water[1]) * k;
        b = water[2] + (deep[2] - water[2]) * k;
      } else if (wall > 0.62) {
        r = stone[0] * (0.85 + n * 0.2);
        g = stone[1] * (0.85 + n * 0.2);
        b = stone[2] * (0.85 + n * 0.2);
      } else if (road < 28 || plaza < 36) {
        const k = 0.9 + n * 0.15;
        r = path[0] * k; g = path[1] * k; b = path[2] * k;
      } else {
        const c = grass[n < 0.33 ? 0 : n < 0.66 ? 1 : 2];
        const k = 0.92 + n * 0.16;
        r = c[0] * k; g = c[1] * k; b = c[2] * k;
      }
      const i = (y * tw + x) * 4;
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = 8;
  return tex;
}

function markerMesh(o) {
  const color = {
    portal: '#7ec8ff', dungeon: '#e07040', waystone: '#f0d78a', chest: '#c9a15a',
    gather: '#6dce7a', craft: '#8a5a3a', rune: '#b070ff', arena: '#d070ff',
  }[o.type] || '#ffd76a';
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.28, roughness: 0.5 });
  let mesh;
  if (o.type === 'portal' || o.type === 'dungeon' || o.type === 'arena') {
    mesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.08, 8, 24), mat);
    mesh.position.y = 1.25;
  } else if (o.type === 'waystone') {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 2.2, 6), mat);
    mesh.position.y = 1.1;
  } else if (o.type === 'chest') {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.45), mat);
    mesh.position.y = 0.28;
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

function makeLabel() {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 64;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(2.4, 0.6, 1);
  sp.userData.cv = cv;
  sp.userData.key = '';
  return sp;
}

function writeLabel(sp, name, hp, maxHp, color) {
  const key = `${name}|${Math.round((hp / Math.max(1, maxHp)) * 20)}|${color}`;
  if (sp.userData.key === key) return;
  sp.userData.key = key;
  const cv = sp.userData.cv;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 256, 64);
  g.font = '700 26px Source Sans 3, sans-serif';
  g.textAlign = 'center';
  g.lineWidth = 4;
  g.strokeStyle = 'rgba(8,6,12,0.85)';
  g.strokeText(name, 128, 28);
  g.fillStyle = color;
  g.fillText(name, 128, 28);
  if (maxHp > 1 && hp < maxHp) {
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(48, 40, 160, 8);
    g.fillStyle = hp / maxHp < 0.35 ? '#ff5a4a' : '#5dff8a';
    g.fillRect(48, 40, 160 * Math.max(0, hp / maxHp), 8);
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
    this.scene.add(new THREE.HemisphereLight('#fff0d4', '#1c2830', 0.55));
    this.sun = new THREE.DirectionalLight('#fff4dc', 1.75);
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
    const tex = bakeGround(map);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(map.pw * S, map.ph * S),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set((map.pw * S) / 2, 0, (map.ph * S) / 2);
    ground.receiveShadow = true;
    this.staticGroup.add(ground);
    this.addBuildings(map, pal);
    this.addNature(map, pal);
    this.objStamp = '';
  }

  addBuildings(map, pal) {
    const wallMat = new THREE.MeshStandardMaterial({ color: pal.wall, roughness: 0.86 });
    const roofMat = new THREE.MeshStandardMaterial({ color: pal.roof, roughness: 0.7 });
    const trimMat = new THREE.MeshStandardMaterial({ color: pal.trim, roughness: 0.5, metalness: 0.05 });
    const doorMat = new THREE.MeshStandardMaterial({ color: '#3a2a22', roughness: 0.8 });
    for (const b of map.buildings) {
      const width = Math.max(2.2, b.w * S);
      const depth = Math.max(2.4, b.w * S * 0.55);
      const height = Math.min(3.4, Math.max(2.2, width * 0.38));
      const cx = (b.x + b.w / 2) * S;
      const front = b.y * S;
      const cz = front - depth / 2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
      body.position.set(cx, height / 2, cz);
      body.castShadow = true;
      body.receiveShadow = true;
      this.staticGroup.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.62, 1.15, 4), roofMat);
      roof.position.set(cx, height + height * 0.18, cz);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      this.staticGroup.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(width * 0.22, height * 0.42, 0.08), doorMat);
      door.position.set(cx, height * 0.21, front + 0.02);
      this.staticGroup.add(door);
      const win = new THREE.Mesh(new THREE.BoxGeometry(width * 0.16, height * 0.16, 0.06), trimMat);
      win.position.set(cx - width * 0.28, height * 0.62, front + 0.02);
      this.staticGroup.add(win);
      const win2 = win.clone();
      win2.position.x = cx + width * 0.28;
      this.staticGroup.add(win2);
    }
  }

  addNature(map, pal) {
    const trees = [];
    const rocks = [];
    for (const p of map.props) {
      if (/oak|bigtree|pine|snowpine|palm|deadtree/.test(p.type)) trees.push(p);
      else if (/rock|stalagmite|icespike|crystal|voidcrystal/.test(p.type)) rocks.push(p);
    }
    if (trees.length) {
      const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.18, 1.1, 6), new THREE.MeshStandardMaterial({ color: '#6b4630', roughness: 0.9 }), trees.length);
      const leaf = new THREE.InstancedMesh(new THREE.ConeGeometry(0.85, 1.8, 7), new THREE.MeshStandardMaterial({ color: pal.leaf, roughness: 0.8 }), trees.length);
      trunk.castShadow = leaf.castShadow = true;
      trunk.receiveShadow = leaf.receiveShadow = true;
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      const pos = new THREE.Vector3();
      trees.forEach((p, i) => {
        const sc = /pine|snowpine|deadtree/.test(p.type) ? 1.35 : /bigtree/.test(p.type) ? 1.7 : 1.15;
        pos.set(p.x * S, 0.55 * sc, p.y * S);
        s.set(sc, sc, sc);
        m.compose(pos, q, s);
        trunk.setMatrixAt(i, m);
        pos.y = 1.5 * sc;
        m.compose(pos, q, s);
        leaf.setMatrixAt(i, m);
      });
      this.staticGroup.add(trunk);
      this.staticGroup.add(leaf);
    }
    if (rocks.length) {
      const mesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.45, 0), new THREE.MeshStandardMaterial({ color: '#8a8078', roughness: 0.95 }), rocks.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      const pos = new THREE.Vector3();
      rocks.forEach((p, i) => {
        const sc = 0.6 + hash(p.x, p.y) * 0.9;
        pos.set(p.x * S, 0.25 * sc, p.y * S);
        q.setFromEuler(new THREE.Euler(0, hash(p.y, p.x) * 6, 0));
        s.set(sc, sc * 0.7, sc);
        m.compose(pos, q, s);
        mesh.setMatrixAt(i, m);
      });
      this.staticGroup.add(mesh);
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
    const label = makeLabel();
    label.position.y = 2.15;
    root.add(label);
    this.scene.add(root);
    const rec = { root, label, kind, mixer: null, action: null, clip: '', ready: false, disposed: false };
    const spec = kind === 'monster' ? specFor(e.boss ? 'Berserker' : /mage|cult|witch|priest/i.test(e.name || '') ? 'Mage' : 'Assassin')
      : kind === 'npc' ? specFor(/guard|captain|soldier|watch|knight|marshal/i.test(`${e.title} ${e.name}`) ? 'Guard' : /priest|sister|mina/i.test(`${e.title} ${e.name}`) ? 'Priest' : 'npc')
      : specFor(e.cls);
    rec.spec = spec;
    loadModel(spec.file).then((gltf) => {
      if (rec.disposed) return;
      const model = cloneSkinned(gltf.scene);
      uniqueMats(model);
      applyLoadout(model, spec.show);
      if (kind === 'monster') tintModel(model, e.color || '#c45050');
      const sc = (kind === 'monster' ? (e.size || 1) * (e.boss ? 1.35 : 1) : 1) * gltf.userData.scale;
      model.scale.setScalar(sc);
      model.position.y = -gltf.userData.foot * sc;
      root.add(model);
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
    writeLabel(rec.label, name, e.hp ?? 1, e.maxHp ?? 1, color);
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
    const clipName = dead ? 'Death_A' : attacking ? rec.spec.attack : moving ? rec.spec.walk : rec.spec.idle;
    this.play(rec, clipName, dead || attacking);
    rec.mixer.update(dt);
  }

  play(rec, name, once) {
    if (rec.clip === name) return;
    const clip = rec.clips[name] || rec.clips.Idle || rec.clips['2H_Melee_Idle'];
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

  syncFx(w) {
    const need = (w.projectiles?.length || 0) + (w.rings?.length || 0);
    while (this.fx.length < need) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#fff' }),
      );
      this.scene.add(mesh);
      this.fx.push(mesh);
    }
    let n = 0;
    for (const p of w.projectiles || []) {
      const mesh = this.fx[n++];
      mesh.visible = true;
      mesh.geometry.dispose();
      mesh.geometry = new THREE.SphereGeometry(0.14, 8, 8);
      mesh.material.color.set(p.color || '#fff');
      mesh.position.set(p.x * S, 1.1, p.y * S);
      mesh.rotation.set(0, 0, 0);
      mesh.scale.setScalar(1);
    }
    for (const r of w.rings || []) {
      const mesh = this.fx[n++];
      mesh.visible = true;
      const k = r.t / r.dur;
      const rad = Math.max(0.2, r.r * S * (0.3 + k * 0.7));
      mesh.geometry.dispose();
      mesh.geometry = new THREE.RingGeometry(rad * 0.86, rad, 20);
      mesh.material.color.set(r.color || '#fff');
      mesh.material.transparent = true;
      mesh.material.opacity = 0.85 * (1 - k);
      mesh.position.set(r.x * S, 0.06, r.y * S);
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.setScalar(1);
    }
    for (let i = n; i < this.fx.length; i++) this.fx[i].visible = false;

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
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !opts.bg });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  if (opts.bg) scene.background = new THREE.Color(opts.bg);
  const camera = new THREE.PerspectiveCamera(30, canvas.width / Math.max(1, canvas.height), 0.05, 40);
  scene.add(new THREE.HemisphereLight('#fff6ea', '#243040', 0.85));
  const key = new THREE.DirectionalLight('#fff8ee', 1.8);
  key.position.set(-2.2, 4.2, 3.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9ec4ff', 0.45);
  rim.position.set(3, 2, -2);
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

function showBust(canvas, cls, spin) {
  if (!canvas) return;
  const b = bustFor(canvas, { bg: canvas.id === 'preview' ? '#101620' : null });
  const now = performance.now();
  const dt = Math.min(0.05, (now - b.last) / 1000);
  b.last = now;
  if (b.cls !== cls) {
    b.cls = cls;
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
      model.scale.setScalar(gltf.userData.scale);
      model.position.y = -gltf.userData.foot * gltf.userData.scale;
      b.holder.add(model);
      b.mixer = new THREE.AnimationMixer(model);
      const clip = gltf.animations.find((a) => a.name === spec.idle) || gltf.animations.find((a) => a.name === 'Idle');
      if (clip) b.mixer.clipAction(clip).play();
    }).catch((err) => console.warn('bust', err));
  }
  if (spin) b.holder.rotation.y = Math.sin(now / 900) * 0.7 + 0.4;
  if (b.mixer) b.mixer.update(dt);
  const lookY = canvas.id === 'portrait' || canvas.id === 'dlg-face' ? 1.35 : 0.95;
  b.camera.position.set(1.5, lookY + 0.7, 3.1);
  b.camera.lookAt(0, lookY, 0);
  b.renderer.render(b.scene, b.camera);
}

export function tickPreview(canvas, cls) {
  showBust(canvas, cls, true);
}

export function paintBust(canvas, cls) {
  showBust(canvas, cls, false);
}
