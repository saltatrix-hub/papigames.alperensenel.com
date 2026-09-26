/** Full-body class sheets. Cuts are the uncropped top-row figures: front, left, right, back. */

const PACKS = {
  Knight: {
    src: 'assets/knight/sheet.png',
    cuts: [
      [29, 25, 163, 285],
      [518, 24, 157, 286],
      [194, 25, 155, 285],
      [356, 24, 161, 285],
    ],
  },
  Berserker: {
    src: 'assets/berserker/sheet.png',
    cuts: [
      [14, 11, 181, 302],
      [507, 12, 156, 301],
      [187, 11, 154, 302],
      [335, 11, 177, 302],
    ],
  },
  Ranger: {
    src: 'assets/ranger/sheet.png',
    cuts: [
      [17, 19, 174, 299],
      [516, 17, 171, 301],
      [186, 17, 170, 301],
      [360, 17, 156, 299],
    ],
  },
  Mage: {
    src: 'assets/mage/sheet.png',
    cuts: [
      [19, 10, 169, 307],
      [527, 14, 165, 302],
      [189, 10, 157, 307],
      [357, 14, 161, 301],
    ],
  },
  Priest: {
    src: 'assets/priest/sheet.png',
    cuts: [
      [19, 20, 174, 295],
      [522, 23, 155, 292],
      [194, 23, 154, 292],
      [353, 20, 170, 294],
    ],
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

export function preloadClassSheets() {
  if (typeof Image === 'undefined') return;
  for (const cls of Object.keys(PACKS)) {
    const pack = PACKS[cls];
    const img = new Image();
    img.onload = () => {
      state[cls] = pack.cuts.map((rect) => slice(img, rect));
    };
    img.src = pack.src;
  }
}

export function drawClassSheet(ctx, x, y, cls, dir, anim, scale = 1, opts = {}) {
  const bodies = state[cls];
  if (!bodies) return false;
  const i = bodies[dir] ? dir : 0;
  const img = bodies[i];
  if (!img) return false;
  const h = 72 * scale;
  const k = h / img.height;
  const walk = anim?.walk || 0;
  const attacking = anim?.attack >= 0;
  const t = attacking ? Math.max(0, Math.min(0.999, anim.attack)) : -1;
  const bob = anim?.moving ? Math.abs(Math.sin(walk * 2)) * 2.2 * scale : Math.sin((anim?.time || 0) * 2) * 0.6 * scale;
  const punch = attacking ? Math.sin(t * Math.PI) : 0;
  const lx = dir === 1 ? -punch * 12 * scale : dir === 2 ? punch * 12 * scale : 0;
  const ly = dir === 0 ? punch * 7 * scale : dir === 3 ? -punch * 9 * scale : 0;

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
  ctx.drawImage(img, -img.width * k / 2, -img.height * k, img.width * k, img.height * k);
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') preloadClassSheets();
