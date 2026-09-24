import { Input } from './core/input.js';
import { audio } from './core/audio.js';
import { Game, loadSettings } from './game/game.js';
import { Renderer } from './render/renderer.js';
import { UI } from './ui/ui.js';

const canvas = document.getElementById('world');
const input = new Input(canvas);
const renderer = new Renderer(canvas, null);
const ui = new UI();
const game = new Game(ui, input, renderer);
renderer.game = game;
try { ui.bind(game, input, renderer); } catch (err) { console.error('ui.bind', err); window.__bindErr = String(err && err.stack || err); }
window.astraya = { game, ui, renderer, input };

window.addEventListener('resize', () => renderer.resize());
window.addEventListener('pointermove', (e) => {
  input.mouse.overUI = !!e.target.closest('[data-ui], .panel, .dlg, .dock, .slot, .class-card, .btn, .ghost, .cell, .eq-slot, .map-card, .util, .slot-key, input, button');
});

document.getElementById('btn-fs-title')?.addEventListener('click', toggleFs);
document.getElementById('btn-menu')?.addEventListener('click', () => ui.open('settings'));
document.getElementById('btn-respawn')?.addEventListener('click', () => game.respawn());

function toggleFs() {
  const el = document.documentElement;
  if (!document.fullscreenElement) el.requestFullscreen?.();
  else document.exitFullscreen?.();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  try {
    if (game.running) {
      game.update(dt);
      renderer.render();
      ui.tick(dt);
      audio.update(game.player?.inCombat > 0);
    } else {
      ui.tickTitle(dt);
    }
  } catch (err) {
    console.error(err);
    window.__loopErr = String(err && err.stack || err);
  }
  input.endFrame();
  requestAnimationFrame(frame);
}

const settings = loadSettings();
audio.init();
audio.setVolumes(settings.sfx * settings.master, settings.music * settings.master);
requestAnimationFrame(frame);
canvas.focus();
