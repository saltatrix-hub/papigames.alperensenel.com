class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#070b16');

    const barBg = this.add.rectangle(width / 2, height / 2 + 40, 420, 16, 0x1e293b).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 210, height / 2 + 40, 4, 12, 0xd4af37).setOrigin(0, 0.5);
    const label = this.add
      .text(width / 2, height / 2 - 10, 'Loading Astraya art…', {
        fontFamily: 'Cinzel, serif',
        fontSize: '22px',
        color: '#e8d5a3'
      })
      .setOrigin(0.5);

    this.load.on('progress', (v) => {
      bar.width = Math.max(4, 420 * v);
      label.setText(`Loading Astraya art… ${Math.floor(v * 100)}%`);
    });

    // Concept art
    this.load.image('art_world', 'assets/concept/world_map_concept.png');
    this.load.image('art_classes', 'assets/concept/classes_turnaround_concept.png');
    this.load.image('art_monsters', 'assets/concept/monster_boss_concept.png');
    this.load.image('art_overview', 'assets/concept/project_asset_overview.png');
    this.load.image('art_equipment', 'assets/concept/class_equipment_atlas.png');
    this.load.image('art_costume', 'assets/concept/costume_cosmetic_concept.png');
    this.load.image('art_dungeon_ui', 'assets/concept/dungeon_ui_concept.png');

    // Map blockouts
    this.load.image('map_dawnwatch', 'assets/maps/Dawnwatch_Village_blockout.png');
    this.load.image('map_verdant', 'assets/maps/Verdant_Trail_blockout.png');
    this.load.image('map_moonfen', 'assets/maps/Moonfen_Marsh_blockout.png');
    this.load.image('map_ashen', 'assets/maps/Ashen_Wastes_blockout.png');
    this.load.image('map_services', 'assets/maps/Dawnwatch_Main_Village_services.png');

    // Tile sheets (384x192 → 8×4 of 48px)
    this.load.spritesheet('tiles_grass', 'assets/tiles/grass_forest_tiles.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('tiles_desert', 'assets/tiles/desert_tiles.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('tiles_lava', 'assets/tiles/lava_tiles.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('tiles_snow', 'assets/tiles/snow_tiles.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('tiles_stone', 'assets/tiles/stone_dungeon_tiles.png', {
      frameWidth: 48,
      frameHeight: 48
    });
  }

  create() {
    AstrayaAssets.generate(this);
    this.extractClassPortraits();
    this.scene.start('Title');
  }

  extractClassPortraits() {
    const names = Object.keys(ASTRAYA.CLASSES);
    const src = this.textures.get('art_classes').getSourceImage();
    const cellW = Math.floor(src.width / 3);
    const cellH = Math.floor(src.height / 2);
    names.forEach((name, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const canvas = document.createElement('canvas');
      canvas.width = cellW;
      canvas.height = Math.floor(cellH * 0.7);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        src,
        col * cellW,
        row * cellH,
        cellW,
        canvas.height,
        0,
        0,
        cellW,
        canvas.height
      );
      if (this.textures.exists(`portrait_${name}`)) this.textures.remove(`portrait_${name}`);
      this.textures.addCanvas(`portrait_${name}`, canvas);
    });
  }
}

class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#070b16');

    const bg = this.add.image(width / 2, height / 2, 'art_world').setDisplaySize(width, height);
    bg.setAlpha(0.42);
    this.add.rectangle(width / 2, height / 2, width, height, 0x050814, 0.45);

    for (let i = 0; i < 40; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 1.8),
        0xe2e8f0,
        Phaser.Math.FloatBetween(0.15, 0.7)
      );
      this.tweens.add({
        targets: s,
        alpha: 0.05,
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .text(width / 2, 120, ASTRAYA.LORE.title, {
        fontFamily: 'Cinzel Decorative, Cinzel, serif',
        fontSize: '84px',
        color: '#f5e6c8',
        stroke: '#3b2a12',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 198, ASTRAYA.LORE.subtitle, {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#c4b5fd'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 255, ASTRAYA.LORE.blurb, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '15px',
        color: '#e2e8f0',
        align: 'center',
        wordWrap: { width: 700 }
      })
      .setOrigin(0.5);

    const save = AstrayaSave.load();
    this.makeBtn(width / 2, 360, 'Begin Journey', () => this.scene.start('CharacterSelect'));
    if (save) {
      this.makeBtn(width / 2, 425, `Continue — ${save.name} · Lv.${save.level} ${save.className}`, () => {
        this.registry.set('player', save);
        this.scene.start('World');
      });
    }
    this.makeBtn(width / 2, save ? 490 : 425, 'Codex', () => this.showCodex());

    // concept thumbnails
    const thumbs = [
      { key: 'art_classes', x: 180 },
      { key: 'art_monsters', x: 640 },
      { key: 'art_overview', x: 1100 }
    ];
    thumbs.forEach((t) => {
      const img = this.add.image(t.x, 620, t.key).setDisplaySize(260, 150).setAlpha(0.9);
      img.setStrokeStyle?.(2, 0xd4af37);
      this.add.rectangle(t.x, 620, 264, 154).setStrokeStyle(1, 0xd4af37, 0.7).setFillStyle();
    });

    this.add
      .text(width / 2, height - 28, 'WASD move · Left click attack · 1–4 skills · E interact · I inventory · H heal · M map', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '13px',
        color: '#94a3b8'
      })
      .setOrigin(0.5);
  }

  makeBtn(x, y, label, onClick) {
    const bg = this.add
      .rectangle(x, y, Math.max(280, label.length * 10 + 40), 48, 0x1e293b, 0.92)
      .setStrokeStyle(2, 0xd4af37)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x334155, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1e293b, 0.92));
    bg.on('pointerdown', onClick);
  }

  showCodex() {
    const panel = this.add.rectangle(640, 360, 900, 520, 0x0f172a, 0.97).setStrokeStyle(2, 0x7c3aed);
    const art = this.add.image(640, 300, 'art_world').setDisplaySize(820, 360).setAlpha(0.95);
    const close = this.add
      .text(640, 560, '[ Close ]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#facc15'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => {
      panel.destroy();
      art.destroy();
      close.destroy();
    });
  }
}

class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b1020');
    this.selected = 'Knight';
    this.heroName = 'Auren';

    this.add.image(640, 360, 'art_classes').setDisplaySize(1280, 720).setAlpha(0.28);
    this.add.rectangle(640, 360, 1280, 720, 0x070b16, 0.55);

    this.add
      .text(640, 40, 'Choose Your Path', {
        fontFamily: 'Cinzel Decorative, Cinzel, serif',
        fontSize: '40px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5);

    this.nameText = this.add
      .text(640, 84, `Name: ${this.heroName}  (click to edit)`, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '17px',
        color: '#94a3b8'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.nameText.on('pointerdown', () => {
      const n = window.prompt('Hero name', this.heroName);
      if (n && n.trim()) {
        this.heroName = n.trim().slice(0, 16);
        this.nameText.setText(`Name: ${this.heroName}  (click to edit)`);
      }
    });

    // Class panels cropped from turnaround sheet (3 cols × 2 rows)
    this.cards = [];
    const names = Object.keys(ASTRAYA.CLASSES);

    names.forEach((name, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 220 + col * 420;
      const y = 250 + row * 210;

      const bg = this.add
        .rectangle(x, y, 380, 180, 0x111827, 0.88)
        .setStrokeStyle(2, name === this.selected ? 0xd4af37 : 0x334155)
        .setInteractive({ useHandCursor: true });

      const portrait = this.add.image(x - 110, y, `portrait_${name}`).setDisplaySize(150, 150);

      const title = this.add
        .text(x + 70, y - 48, name, {
          fontFamily: 'Cinzel, serif',
          fontSize: '24px',
          color: '#f8fafc'
        })
        .setOrigin(0.5);

      const cfg = ASTRAYA.CLASSES[name];
      this.add
        .text(x + 70, y - 12, cfg.role, {
          fontFamily: 'Source Sans 3, sans-serif',
          fontSize: '14px',
          color: '#a5b4fc'
        })
        .setOrigin(0.5);
      this.add
        .text(x + 70, y + 28, `${cfg.resource} · ${cfg.primary}/${cfg.secondary}`, {
          fontFamily: 'Source Sans 3, sans-serif',
          fontSize: '13px',
          color: '#94a3b8'
        })
        .setOrigin(0.5);
      this.add.image(x + 70, y + 62, `player_${name}`).setScale(1.6);

      bg.on('pointerdown', () => {
        this.selected = name;
        this.cards.forEach((c) => c.bg.setStrokeStyle(2, c.name === name ? 0xd4af37 : 0x334155));
        this.updateDetail();
      });
      this.cards.push({ name, bg, portrait });
    });

    this.detail = this.add
      .text(640, 580, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '14px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: 980 }
      })
      .setOrigin(0.5);
    this.updateDetail();

    const start = this.add
      .rectangle(640, 640, 240, 50, 0x1e293b)
      .setStrokeStyle(2, 0xd4af37)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(640, 640, 'Enter Astraya', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5);
    start.on('pointerdown', () => {
      AstrayaSave.clear();
      const state = AstrayaSave.defaultState(this.selected, this.heroName);
      state.hp = AstrayaSave.stats(state).maxHp;
      state.resource = AstrayaSave.stats(state).maxRes;
      AstrayaSave.save(state);
      this.registry.set('player', state);
      this.scene.start('World');
    });

    this.add
      .text(80, 640, '← Title', {
        fontFamily: 'Cinzel, serif',
        fontSize: '16px',
        color: '#94a3b8'
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Title'));
  }

  updateDetail() {
    const c = ASTRAYA.CLASSES[this.selected];
    const skills = c.skills.map((s) => s.name).join(' · ');
    this.detail.setText(`${c.identity}\nSkills: ${skills}`);
  }
}
