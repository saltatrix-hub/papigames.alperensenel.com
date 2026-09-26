/** Assassin pack under assets/assassin/01_BASE/Full. Game dir 0=down … 3=up. */

const DIR_FILE = ['front', 'left', 'right', 'back'];
const imgs = [null, null, null, null];

export function preloadAssassin() {
  if (typeof Image === 'undefined') return;
  DIR_FILE.forEach((name, i) => {
    const img = new Image();
    img.onload = () => { imgs[i] = img; };
    img.src = `assets/assassin/01_BASE/Full/${name}.png`;
  });
}

export function drawAssassin(ctx, x, y, dir, anim, scale = 1, opts = {}) {
  const img = imgs[dir] || imgs[0];
  if (!img) return false;
  const h = 86 * scale;
  const w = img.width * (h / img.height);
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
    ctx.ellipse(0, 3, 18 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
  }
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') preloadAssassin();
