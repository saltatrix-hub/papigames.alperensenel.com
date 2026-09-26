/** Full-body class sheets plus the first helmet, chest, and weapon from each page. */

const GEAR = [0, 3, 1, 2]; // game dir (front, left, right, back) -> sheet order

const PACKS = {
  Knight: {
    src: 'assets/knight/sheet.png',
    neck: 0.4,
    grip: 0.96,
    wscale: 0.68,
    hand: 0.18,
    cuts: [[29, 25, 163, 285], [518, 24, 157, 286], [194, 25, 155, 285], [356, 24, 161, 285]],
    helm: [[23, 334, 117, 144], [147, 340, 111, 136], [257, 337, 111, 138], [367, 336, 122, 139]],
    chest: [[16, 496, 128, 168], [155, 498, 88, 158], [252, 496, 124, 162], [381, 498, 93, 158]],
    weapon: [[16, 681, 63, 180], [143, 681, 53, 177], [250, 681, 64, 183], [378, 681, 46, 180]],
    offhand: [[79, 752, 64, 124], [196, 756, 54, 125], [314, 753, 55, 125], [424, 760, 43, 117]],
  },
  Berserker: {
    src: 'assets/berserker/sheet.png',
    neck: 0.47,
    grip: 0.94,
    wscale: 0.62,
    hand: 0.2,
    cuts: [[14, 11, 181, 302], [507, 12, 156, 301], [187, 11, 154, 302], [335, 11, 177, 302]],
    helm: [[13, 334, 121, 137], [140, 335, 116, 141], [260, 330, 119, 146], [378, 335, 121, 141]],
    chest: [[13, 484, 135, 184], [151, 485, 94, 181], [247, 488, 117, 173], [368, 487, 112, 181]],
    weapon: [[21, 678, 124, 182], [157, 679, 88, 181], [258, 678, 110, 182], [380, 678, 83, 182]],
  },
  Ranger: {
    src: 'assets/ranger/sheet.png',
    neck: 0.42,
    grip: 0.5,
    wscale: 0.58,
    hand: 0.26,
    cuts: [[17, 19, 174, 299], [516, 17, 171, 301], [186, 17, 170, 301], [360, 17, 156, 299]],
    helm: [[20, 341, 121, 135], [143, 341, 115, 131], [257, 341, 112, 129], [368, 341, 117, 131]],
    chest: [[19, 494, 121, 167], [144, 494, 92, 167], [247, 493, 120, 169], [380, 494, 91, 165]],
    weapon: [[21, 675, 71, 216], [122, 675, 63, 216], [231, 675, 71, 216], [353, 675, 65, 216]],
  },
  Mage: {
    src: 'assets/mage/sheet.png',
    neck: 0.41,
    grip: 0.7,
    wscale: 0.58,
    hand: 0.22,
    cuts: [[19, 10, 169, 307], [527, 14, 165, 302], [189, 10, 157, 307], [357, 14, 161, 301]],
    helm: [[24, 336, 113, 128], [148, 336, 108, 128], [255, 335, 121, 132], [377, 336, 114, 128]],
    chest: [[13, 478, 128, 171], [142, 480, 98, 168], [246, 478, 126, 173], [379, 479, 108, 169]],
    weapon: [[22, 663, 91, 218], [142, 662, 88, 220], [263, 665, 85, 217], [379, 667, 87, 215]],
  },
  Priest: {
    src: 'assets/priest/sheet.png',
    neck: 0.42,
    grip: 0.7,
    wscale: 0.55,
    hand: 0.22,
    cuts: [[19, 20, 174, 295], [522, 23, 155, 292], [194, 23, 154, 292], [353, 20, 170, 294]],
    helm: [[20, 338, 125, 131], [151, 339, 106, 131], [256, 338, 129, 132], [384, 339, 112, 131]],
    chest: [[24, 501, 129, 179], [159, 497, 83, 183], [250, 497, 134, 183], [392, 498, 91, 162]],
    weapon: [[23, 674, 93, 206], [131, 677, 80, 203], [229, 678, 93, 203], [354, 679, 90, 200]],
  },
};

const state = {};

function slice(img, rect) {
  const [x, y, w, h] = rect;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
  return c;
}

function sliceSet(img, rects) {
  return rects ? rects.map((rect) => slice(img, rect)) : null;
}

export function preloadClassSheets() {
  if (typeof Image === 'undefined') return;
  for (const cls of Object.keys(PACKS)) {
    const pack = PACKS[cls];
    const img = new Image();
    img.onload = () => {
      state[cls] = {
        body: sliceSet(img, pack.cuts),
        helm: sliceSet(img, pack.helm),
        chest: sliceSet(img, pack.chest),
        weapon: sliceSet(img, pack.weapon),
        offhand: sliceSet(img, pack.offhand),
      };
    };
    img.src = pack.src;
  }
}

function blit(ctx, img, k, ax, ay, mode) {
  if (!img) return;
  const w = img.width * k;
  const h = img.height * k;
  const x = ax - w / 2;
  const y = mode === 'top' ? ay : mode === 'mid' ? ay - h / 2 : ay - h;
  ctx.drawImage(img, x, y, w, h);
}

export function drawClassSheet(ctx, x, y, cls, dir, anim, scale = 1, opts = {}) {
  const pack = state[cls];
  const spec = PACKS[cls];
  if (!pack || !spec) return false;
  const i = pack.body[dir] ? dir : 0;
  const img = pack.body[i];
  if (!img) return false;
  const g = GEAR[i];
  const h = 72 * scale;
  const k = h / img.height;
  const walk = anim?.walk || 0;
  const attacking = anim?.attack >= 0;
  const t = attacking ? Math.max(0, Math.min(0.999, anim.attack)) : -1;
  const bob = anim?.moving ? Math.abs(Math.sin(walk * 2)) * 2.2 * scale : Math.sin((anim?.time || 0) * 2) * 0.6 * scale;
  const punch = attacking ? Math.sin(t * Math.PI) : 0;
  const lx = dir === 1 ? -punch * 12 * scale : dir === 2 ? punch * 12 * scale : 0;
  const ly = dir === 0 ? punch * 7 * scale : dir === 3 ? -punch * 9 * scale : 0;
  const neckY = -h * (1 - spec.neck);
  const handSign = dir === 1 ? -1 : 1;
  const handX = handSign * spec.hand * h;
  const handY = -0.36 * h;

  ctx.save();
  ctx.translate(x + lx, y + ly - bob);
  ctx.rotate((dir === 1 ? -1 : dir === 2 ? 1 : 0) * punch * 0.08);
  ctx.imageSmoothingEnabled = true;
  if (!opts.noShadow) {
    ctx.beginPath();
    ctx.ellipse(0, 3, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
  }
  ctx.drawImage(img, -img.width * k / 2, -h, img.width * k, h);
  blit(ctx, pack.chest[g], k, 0, neckY, 'top');
  if (pack.offhand) blit(ctx, pack.offhand[g], k * 0.82, -handSign * 0.22 * h, -0.46 * h, 'mid');
  blit(ctx, pack.helm[g], k, 0, neckY, 'bottom');
  const weapon = pack.weapon[g];
  if (weapon) {
    const wk = k * spec.wscale;
    ctx.save();
    ctx.translate(handX, handY);
    if (attacking && spec.grip > 0.8) ctx.rotate(handSign * Math.sin(t * Math.PI) * 1.15);
    const ww = weapon.width * wk;
    const wh = weapon.height * wk;
    ctx.drawImage(weapon, -ww / 2, -spec.grip * wh, ww, wh);
    ctx.restore();
  }
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') preloadClassSheets();
