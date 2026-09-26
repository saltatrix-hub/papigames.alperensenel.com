/** Volume-shaded 3/4 figures. Feet sit on the foreshortened ground. */

const PAL = {
  Knight: { cloth: '#3d4d6e', metal: '#e4eaf2', dark: '#1c2433', trim: '#2f6fd0', hair: '#1a2744', skin: '#f0c2a0', weapon: '#f4f7fb', accent: '#c9a24a' },
  Berserker: { cloth: '#7a2c24', metal: '#b7bcc2', dark: '#2a100e', trim: '#e24a32', hair: '#2a140e', skin: '#e8b098', weapon: '#d5d8dc', accent: '#e8c878' },
  Assassin: { cloth: '#2a2a36', metal: '#6a6a78', dark: '#101014', trim: '#c03048', hair: '#14141c', skin: '#e0b098', weapon: '#d8dce4', accent: '#888' },
  Ranger: { cloth: '#2d5a38', metal: '#c4a060', dark: '#142418', trim: '#d8b46a', hair: '#1c3020', skin: '#f0c8a8', weapon: '#c4a060', accent: '#8d5a28' },
  Mage: { cloth: '#2a3878', metal: '#e4cc74', dark: '#14182e', trim: '#7aa0ff', hair: '#1a2044', skin: '#f0c2a0', weapon: '#b8d4ff', accent: '#9ec0ff' },
  Priest: { cloth: '#f6f3ea', metal: '#e6cc74', dark: '#c8c2b4', trim: '#3c4e90', hair: '#f7f4ee', skin: '#f6d4b8', weapon: '#f0d878', accent: '#ffe9a0' },
  npc: { cloth: '#6a5344', metal: '#d0b898', dark: '#3a2a20', trim: '#8a6848', hair: '#3a2418', skin: '#f0c2a0', weapon: '#c8b090', accent: '#a08060' },
  Guard: { cloth: '#3e4a44', metal: '#c5ccd0', dark: '#1c2420', trim: '#6a7a4a', hair: '#1a201c', skin: '#e8c0a0', weapon: '#d8dce0', accent: '#b9a06a' },
};

function blob(ctx, x, y, rx, ry, light, mid, dark) {
  const g = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.45, rx * 0.15, x, y, Math.max(rx, ry));
  g.addColorStop(0, light);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function plate(ctx, x, y, w, h, r, light, mid, dark) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, light);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function drawFigure3D(ctx, x, y, cls, dir = 0, anim = {}, scale = 1) {
  const pal = PAL[cls] || PAL.npc;
  const back = dir === 3;
  const side = dir === 1 ? -1 : dir === 2 ? 1 : 0;
  const walk = anim.moving ? Math.sin((anim.walk || 0) * 2) : 0;
  const atk = anim.attack >= 0 ? Math.sin(Math.min(0.999, anim.attack) * Math.PI) : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.beginPath();
  ctx.ellipse(2, 4, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (cls === 'Mage' || cls === 'Priest' || cls === 'Ranger') cape(ctx, pal, side, back);

  const hip = -22;
  plate(ctx, -7 + walk * 4, hip, 8, 22, 4, pal.metal, pal.cloth, pal.dark);
  plate(ctx, 1 - walk * 4, hip, 8, 22, 4, pal.metal, pal.cloth, pal.dark);
  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.ellipse(-3 + walk * 4, -2, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(5 - walk * 4, -2, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  plate(ctx, -16, -58, 32, 38, 10, pal.metal, pal.cloth, pal.dark);
  ctx.fillStyle = pal.trim;
  ctx.beginPath();
  ctx.roundRect(-4, -50, 8, 18, 3);
  ctx.fill();
  blob(ctx, -12, -50, 8, 6, pal.metal, pal.cloth, pal.dark);
  blob(ctx, 12, -50, 8, 6, pal.metal, pal.cloth, pal.dark);

  arm(ctx, pal, -20, -50, walk * 4, side < 0);
  arm(ctx, pal, 13, -50, -walk * 4 - atk * 6, side > 0);

  weapon(ctx, pal, cls, side, atk, back);

  const hx = side * 3;
  const hy = -78;
  if (cls === 'Knight') helm(ctx, pal, hx, hy, side, back);
  else {
    blob(ctx, hx, hy, 16, 17, '#fff6ee', pal.skin, '#c48a68');
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.ellipse(hx, hy - 4, 16, 12, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (cls === 'Ranger') hood(ctx, '#245c32', '#163c22', hx, hy);
    if (cls === 'Mage') hood(ctx, '#24306e', '#141a3a', hx, hy);
    if (cls === 'Priest') hood(ctx, '#f7f4ee', '#d8d2c4', hx, hy);
    if (cls === 'Berserker') {
      ctx.fillStyle = '#8a2420';
      ctx.beginPath();
      ctx.moveTo(hx - 14, hy - 2);
      ctx.lineTo(hx - 8, hy - 18);
      ctx.lineTo(hx, hy - 4);
      ctx.lineTo(hx + 8, hy - 18);
      ctx.lineTo(hx + 14, hy - 2);
      ctx.fill();
    }
    if (!back) face(ctx, hx + side * 3, hy + 2, cls === 'Assassin');
  }
  ctx.restore();
}

function arm(ctx, pal, x, y, swing, forward) {
  ctx.save();
  ctx.translate(x + 4, y + swing);
  plate(ctx, -4, 0, 8, 18, 4, pal.metal, pal.cloth, pal.dark);
  blob(ctx, 0, 20, 4.5, 4, '#fff0e4', pal.skin, '#c48a68');
  ctx.restore();
  if (forward) {
    ctx.globalAlpha = 1;
  }
}

function helm(ctx, pal, x, y, side, back) {
  blob(ctx, x, y, 16, 17, '#ffffff', pal.metal, '#8a93a0');
  ctx.fillStyle = pal.trim;
  ctx.fillRect(x - 2, y - 22, 4, 10);
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.arc(x, y - 20, 3, 0, Math.PI * 2);
  ctx.fill();
  if (!back) {
    ctx.fillStyle = '#12151c';
    ctx.beginPath();
    ctx.roundRect(x - 7 + side * 3, y - 2, 14, 7, 2);
    ctx.fill();
    ctx.fillStyle = '#9ec0ff';
    ctx.fillRect(x - 5 + side * 3, y - 1, 4, 3);
    ctx.fillRect(x + 1 + side * 3, y - 1, 4, 3);
  }
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function hood(ctx, light, dark, x, y) {
  const g = ctx.createLinearGradient(x - 16, y - 16, x + 16, y + 8);
  g.addColorStop(0, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 18, 16, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.quadraticCurveTo(x + 16, y + 10, x, y + 8);
  ctx.quadraticCurveTo(x - 16, y + 10, x - 16, y);
  ctx.fill();
}

function face(ctx, x, y, mask) {
  if (mask) {
    ctx.fillStyle = '#1a1a22';
    ctx.beginPath();
    ctx.roundRect(x - 8, y + 2, 16, 8, 3);
    ctx.fill();
    return;
  }
  ctx.fillStyle = '#1a1418';
  ctx.beginPath();
  ctx.ellipse(x - 4, y, 1.8, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 4, y, 1.8, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function cape(ctx, pal, side, back) {
  ctx.fillStyle = back ? pal.trim : pal.dark;
  ctx.beginPath();
  ctx.moveTo(-10, -52);
  ctx.quadraticCurveTo(-22 + side * 4, -20, -14, 2);
  ctx.lineTo(14, 2);
  ctx.quadraticCurveTo(22 + side * 4, -20, 10, -52);
  ctx.fill();
}

function weapon(ctx, pal, cls, side, atk, back) {
  ctx.save();
  const sign = side || 1;
  ctx.translate(sign * 18, -40 - atk * 8);
  ctx.rotate(sign * (0.15 + atk * 0.9));
  ctx.lineCap = 'round';
  if (cls === 'Berserker') {
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(-2, -6, 4, 28);
    ctx.fillStyle = pal.weapon;
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.lineTo(14, -18);
    ctx.lineTo(4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-3, -8, 6, 4);
  } else if (cls === 'Ranger') {
    ctx.strokeStyle = pal.weapon;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-2, -6, 18, -1.15, 1.15);
    ctx.stroke();
    ctx.strokeStyle = '#f4efe4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -24);
    ctx.lineTo(-2, 12);
    ctx.stroke();
  } else if (cls === 'Mage' || cls === 'Priest') {
    ctx.fillStyle = '#6a5030';
    ctx.fillRect(-2, -8, 4, 36);
    ctx.fillStyle = pal.weapon;
    ctx.beginPath();
    ctx.arc(0, -16, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-2, -18, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (cls === 'npc') {
    ctx.fillStyle = pal.cloth;
    ctx.beginPath();
    ctx.roundRect(-5, -2, 10, 12, 3);
    ctx.fill();
  } else if (cls === 'Guard') {
    ctx.fillStyle = '#6a5030';
    ctx.fillRect(-2, -28, 4, 40);
    ctx.fillStyle = pal.weapon;
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.lineTo(6, -30);
    ctx.lineTo(0, -42);
    ctx.fill();
  } else if (cls === 'Assassin') {
    ctx.fillStyle = pal.weapon;
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(-4, -20);
    ctx.lineTo(-1, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, 4);
    ctx.lineTo(5, -20);
    ctx.lineTo(8, 4);
    ctx.fill();
  } else {
    ctx.fillStyle = '#8a7040';
    ctx.fillRect(-3, -4, 6, 8);
    ctx.fillStyle = pal.weapon;
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.lineTo(-2, -36);
    ctx.lineTo(2, -36);
    ctx.lineTo(3, -4);
    ctx.fill();
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-7, -6, 14, 3);
    if (!back) {
      ctx.save();
      ctx.translate(-26, 6);
      ctx.rotate(-0.2);
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(16, -6);
      ctx.lineTo(14, 8);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = pal.metal;
      ctx.beginPath();
      ctx.arc(7, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

export function drawMonster3D(ctx, x, y, m) {
  const s = m.size || 1;
  const back = m.dir === 3;
  const side = m.dir === 1 ? -1 : m.dir === 2 ? 1 : 0;
  const bob = m.moving ? Math.sin((m.t || 0) * 8) * 3 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  blob(ctx, 0, -22 + bob, 18, 16, '#ffffff', m.color, '#140c10');
  blob(ctx, side * 4, -46 + bob, 13, 12, '#ffffff', m.color, '#140c10');
  ctx.fillStyle = '#1a1014';
  ctx.beginPath();
  ctx.moveTo(-8, -54 + bob);
  ctx.lineTo(-4, -66 + bob);
  ctx.lineTo(0, -52 + bob);
  ctx.moveTo(2, -52 + bob);
  ctx.lineTo(6, -66 + bob);
  ctx.lineTo(12, -54 + bob);
  ctx.fill();
  if (!back) {
    ctx.fillStyle = m.eye || '#ffe08a';
    ctx.beginPath();
    ctx.arc(-4 + side * 4, -46 + bob, 2.2, 0, Math.PI * 2);
    ctx.arc(5 + side * 4, -46 + bob, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (m.boss) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -34 + bob, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
