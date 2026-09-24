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

    // Exact Concept Gallery / Six Paths sheets
    this.load.image('art_world', 'assets/concept/world_map_concept.png');
    this.load.image('art_classes', 'assets/concept/classes_turnaround_concept.png');
    this.load.image('art_monsters', 'assets/concept/monster_boss_concept.png');
    this.load.image('art_overview', 'assets/concept/project_asset_overview.png');
    this.load.image('art_equipment', 'assets/concept/class_equipment_atlas.png');
    this.load.image('art_costume', 'assets/concept/costume_cosmetic_concept.png');
    this.load.image('art_dungeon_ui', 'assets/concept/dungeon_ui_concept.png');

    // Class panels cropped 1:1 from Six Paths sheet
    ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest'].forEach((n) => {
      this.load.image(`portrait_${n}`, `assets/portraits/${n}.png`);
      this.load.image(`sprite_${n}`, `assets/sprites/classes/${n}.png`);
      this.load.image(`strip_${n}`, `assets/sprites/classes/${n}_strip.png`);
    });

    // Mob / boss crops from monster concept sheet
    const mobs = [
      'field_boar',
      'thistle_rat',
      'bandit_scout',
      'garrick_thug',
      'forest_wolf',
      'briar_entling',
      'vine_stalker',
      'thorn_archer',
      'bog_skeleton',
      'mire_horror',
      'lantern_shade'
    ];
    mobs.forEach((id) => this.load.image(`sprite_mob_${id}`, `assets/sprites/mobs/${id}.png`));
    ['garrick', 'thornmaw', 'nereza', 'khar', 'icefang', 'golm', 'malzor'].forEach((id) =>
      this.load.image(`sprite_boss_${id}`, `assets/sprites/bosses/${id}.png`)
    );

    // Maps + tiles
    this.load.image('map_dawnwatch', 'assets/maps/Dawnwatch_Village_blockout.png');
    this.load.image('map_verdant', 'assets/maps/Verdant_Trail_blockout.png');
    this.load.image('map_moonfen', 'assets/maps/Moonfen_Marsh_blockout.png');
    this.load.image('map_ashen', 'assets/maps/Ashen_Wastes_blockout.png');
    this.load.image('map_services', 'assets/maps/Dawnwatch_Main_Village_services.png');

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
    this.scene.start('Title');
  }
}

class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#070b16');

    // Exact world map concept (same file as Concept Gallery)
    this.add.image(width / 2, height / 2, 'art_world').setDisplaySize(width, height).setAlpha(0.55);
    this.add.rectangle(width / 2, height / 2, width, height, 0x050814, 0.4);

    this.add
      .text(width / 2, 88, ASTRAYA.LORE.title, {
        fontFamily: 'Cinzel Decorative, Cinzel, serif',
        fontSize: '72px',
        color: '#f5e6c8',
        stroke: '#3b2a12',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 152, ASTRAYA.LORE.subtitle, {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#c4b5fd'
      })
      .setOrigin(0.5);

    const save = AstrayaSave.load();
    this.makeBtn(width / 2, 220, 'Begin Journey', () => this.scene.start('CharacterSelect'));
    if (save) {
      this.makeBtn(width / 2, 280, `Continue — ${save.name} · Lv.${save.level} ${save.className}`, () => {
        this.registry.set('player', save);
        this.scene.start('World');
      });
    }
    this.makeBtn(width / 2, save ? 340 : 280, 'Codex Art', () => this.showCodex());

    // Same three gallery images used on the site
    const thumbs = [
      { key: 'art_classes', x: 220, label: 'Six Paths' },
      { key: 'art_monsters', x: 640, label: 'Monsters' },
      { key: 'art_overview', x: 1060, label: 'Overview' }
    ];
    thumbs.forEach((t) => {
      this.add.image(t.x, 520, t.key).setDisplaySize(340, 220);
      this.add.rectangle(t.x, 520, 344, 224).setStrokeStyle(2, 0xd4af37).setFillStyle();
      this.add
        .text(t.x, 650, t.label, {
          fontFamily: 'Cinzel, serif',
          fontSize: '14px',
          color: '#f5e6c8'
        })
        .setOrigin(0.5);
    });

    this.add
      .text(width / 2, height - 24, 'WASD · Click · 1–4 skills · E · I · H · M map · F fullscreen', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '13px',
        color: '#94a3b8'
      })
      .setOrigin(0.5);
  }

  makeBtn(x, y, label, onClick) {
    const bg = this.add
      .rectangle(x, y, Math.max(280, label.length * 10 + 40), 46, 0x1e293b, 0.92)
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
    const keys = ['art_world', 'art_classes', 'art_monsters', 'art_equipment', 'art_costume', 'art_dungeon_ui'];
    let idx = 0;
    const panel = this.add.rectangle(640, 360, 1180, 680, 0x0f172a, 0.98).setStrokeStyle(2, 0xd4af37);
    const art = this.add.image(640, 340, keys[0]).setDisplaySize(1080, 560);
    const caption = this.add
      .text(640, 650, 'Concept Gallery — click image to cycle · [Close]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '16px',
        color: '#facc15'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const hit = this.add.rectangle(640, 340, 1080, 560, 0x000000, 0.001).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      idx = (idx + 1) % keys.length;
      art.setTexture(keys[idx]);
    });
    caption.on('pointerdown', () => {
      panel.destroy();
      art.destroy();
      caption.destroy();
      hit.destroy();
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
    const names = Object.keys(ASTRAYA.CLASSES);

    // Exact same sheet as site "Six Paths"
    const sheet = this.add.image(640, 360, 'art_classes').setDisplaySize(1180, 620);
    this.add.rectangle(640, 360, 1184, 624).setStrokeStyle(2, 0xd4af37).setFillStyle();

    // Clickable 3x2 hit zones matching the sheet layout
    this.highlights = [];
    names.forEach((name, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cellW = 1180 / 3;
      const cellH = 620 / 2;
      const x = 640 - 590 + cellW * col + cellW / 2;
      const y = 360 - 310 + cellH * row + cellH / 2;
      const zone = this.add
        .rectangle(x, y, cellW - 8, cellH - 8, 0xd4af37, 0)
        .setStrokeStyle(3, name === this.selected ? 0xfacc15 : 0x000000, name === this.selected ? 1 : 0)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.selectClass(name));
      this.highlights.push({ name, zone });
    });

    this.add
      .text(640, 28, 'SIX PATHS — Select Your Class', {
        fontFamily: 'Cinzel Decorative, Cinzel, serif',
        fontSize: '28px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5);

    this.nameText = this.add
      .text(200, 680, `Name: ${this.heroName} (edit)`, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '16px',
        color: '#e2e8f0'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.nameText.on('pointerdown', () => {
      const n = window.prompt('Hero name', this.heroName);
      if (n && n.trim()) {
        this.heroName = n.trim().slice(0, 16);
        this.nameText.setText(`Name: ${this.heroName} (edit)`);
      }
    });

    this.detail = this.add
      .text(640, 680, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '14px',
        color: '#cbd5e1',
        align: 'center'
      })
      .setOrigin(0.5);

    const start = this.add
      .rectangle(1080, 680, 220, 44, 0x1e293b)
      .setStrokeStyle(2, 0xd4af37)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(1080, 680, 'Enter Astraya', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
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
      .text(60, 28, '← Title', {
        fontFamily: 'Cinzel, serif',
        fontSize: '16px',
        color: '#94a3b8'
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Title'));

    this.selectClass('Knight');
  }

  selectClass(name) {
    this.selected = name;
    this.highlights.forEach((h) => {
      const on = h.name === name;
      h.zone.setStrokeStyle(3, on ? 0xfacc15 : 0x000000, on ? 1 : 0);
      h.zone.setFillStyle(0xd4af37, on ? 0.08 : 0);
    });
    const c = ASTRAYA.CLASSES[name];
    this.detail.setText(`${name} — ${c.role} · ${c.identity}`);
  }
}
