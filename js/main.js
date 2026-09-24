const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#070b16',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [BootScene, TitleScene, CharacterSelectScene, WorldScene, HUDScene]
};

function refreshGameScale() {
  const game = window.astrayaGame;
  if (!game) return;
  game.scale.resize(1280, 720);
  game.scale.refresh();
}

function toggleFullscreen() {
  const stage = document.getElementById('play');
  if (!stage) return;
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  if (!active) {
    const req = stage.requestFullscreen || stage.webkitRequestFullscreen;
    if (req) req.call(stage);
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
  }
}

window.addEventListener('load', () => {
  window.astrayaGame = new Phaser.Game(config);

  const root = document.getElementById('game-root');
  if (root) {
    root.focus({ preventScroll: true });
    root.addEventListener('pointerdown', () => root.focus({ preventScroll: true }));
  }

  const btn = document.getElementById('btn-fullscreen');
  if (btn) btn.addEventListener('click', toggleFullscreen);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      toggleFullscreen();
    }
  });

  ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => {
    document.addEventListener(ev, () => {
      requestAnimationFrame(refreshGameScale);
      setTimeout(refreshGameScale, 120);
    });
  });

  window.addEventListener('resize', () => refreshGameScale());
});
