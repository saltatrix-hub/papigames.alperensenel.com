/** Assassin body from the reorganized pack: 05_COSTUMES/Ninja_Costume, four directions. */

const DIR_FILE = ['front', 'left', 'right', 'back']; // game 0=down 1=left 2=right 3=up
const imgs = [null, null, null, null];
const feet = [null, null, null, null];

function measure(img) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (data[(y * img.width + x) * 4 + 3] < 24) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxY <= minY) return { x: img.width / 2, y: img.height - 1, h: img.height };
  return { x: (minX + maxX) / 2, y: maxY, h: maxY - minY };
}

export function preloadAssassin() {
  if (typeof Image === 'undefined') return;
  DIR_FILE.forEach((name, i) => {
    const img = new Image();
    img.onload = () => { feet[i] = measure(img); imgs[i] = img; };
    img.src = `assets/assassin/05_COSTUMES/Ninja_Costume/${name}.png`;
  });
}

export function drawAssassin(ctx, x, y, dir, anim, scale = 1, opts = {}) {
  const i = imgs[dir] ? dir : 0;
  const img = imgs[i];
  const foot = feet[i];
  if (!img || !foot) return false;
  const h = 96 * scale;
  const k = h / foot.h;
  const walk = anim?.walk || 0;
  const bob = anim?.moving ? Math.abs(Math.sin(walk * 2)) * 2.4 * scale : Math.sin((anim?.time || 0) * 2) * scale;
  const lunge = anim?.attack >= 0 ? Math.sin(Math.min(1, anim.attack) * Math.PI) * 10 * scale : 0;
  const lx = dir === 1 ? -lunge : dir === 2 ? lunge : 0;
  const ly = dir === 0 ? lunge * 0.35 : dir === 3 ? -lunge * 0.35 : 0;
  ctx.save();
  ctx.translate(x + lx, y + ly - bob);
  ctx.imageSmoothingEnabled = true;
  if (!opts.noShadow) {
    ctx.beginPath();
    ctx.ellipse(0, 3, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
  }
  ctx.drawImage(img, -foot.x * k, -foot.y * k, img.width * k, img.height * k);
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') preloadAssassin();
