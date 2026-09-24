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
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, TitleScene, CharacterSelectScene, WorldScene, HUDScene]
};

window.addEventListener('load', () => {
  window.astrayaGame = new Phaser.Game(config);
});
