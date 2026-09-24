class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    AstrayaAssets.generate(this);
    this.cameras.main.setBackgroundColor('#0b1020');
    const t = this.add
      .text(640, 360, 'Forging the Seals…', {
        fontFamily: 'Cinzel, serif',
        fontSize: '28px',
        color: '#e8d5a3'
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: t,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.scene.start('Title')
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

    // starfield
    for (let i = 0; i < 80; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 2),
        0xe2e8f0,
        Phaser.Math.FloatBetween(0.2, 0.9)
      );
      this.tweens.add({
        targets: s,
        alpha: 0.1,
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1
      });
    }

    // aurora bands
    const g = this.add.graphics();
    g.fillStyle(0x1e3a5f, 0.35);
    g.fillEllipse(width * 0.3, height * 0.7, 700, 220);
    g.fillStyle(0x4c1d95, 0.22);
    g.fillEllipse(width * 0.7, height * 0.75, 600, 200);

    this.add
      .text(width / 2, 150, ASTRAYA.LORE.title, {
        fontFamily: 'Cinzel Decorative, Cinzel, serif',
        fontSize: '84px',
        color: '#f5e6c8',
        stroke: '#3b2a12',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 230, ASTRAYA.LORE.subtitle, {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#c4b5fd'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 300, ASTRAYA.LORE.blurb, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '16px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: 720 }
      })
      .setOrigin(0.5);

    const save = AstrayaSave.load();
    this.makeBtn(width / 2, 420, 'Begin Journey', () => this.scene.start('CharacterSelect'));
    if (save) {
      this.makeBtn(width / 2, 490, `Continue — ${save.name} · Lv.${save.level} ${save.className}`, () => {
        this.registry.set('player', save);
        this.scene.start('World');
      });
    }
    this.makeBtn(width / 2, save ? 560 : 490, 'Codex', () => this.showCodex());

    this.add
      .text(width / 2, height - 36, 'WASD move · Left click attack · 1–4 skills · E interact · I inventory · H heal', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '14px',
        color: '#64748b'
      })
      .setOrigin(0.5);
  }

  makeBtn(x, y, label, onClick) {
    const bg = this.add
      .rectangle(x, y, Math.max(280, label.length * 10 + 40), 48, 0x1e293b, 0.92)
      .setStrokeStyle(2, 0xd4af37)
      .setInteractive({ useHandCursor: true });
    const txt = this.add
      .text(x, y, label, {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x334155, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1e293b, 0.92));
    bg.on('pointerdown', onClick);
    return { bg, txt };
  }

  showCodex() {
    const panel = this.add.rectangle(640, 360, 760, 420, 0x0f172a, 0.96).setStrokeStyle(2, 0x7c3aed);
    const regions = Object.values(ASTRAYA.REGIONS)
      .map((r) => `• ${r.name} (Lv.${r.minLevel}+)`)
      .join('\n');
    const classes = Object.entries(ASTRAYA.CLASSES)
      .map(([n, c]) => `• ${n} — ${c.role}`)
      .join('\n');
    const body = this.add
      .text(
        640,
        360,
        `REGIONS\n${regions}\n\nCLASSES\n${classes}\n\nCampaign follows the Master GDD: Dawnwatch → Verdant → Moonfen,\nbosses Garrick, Thornmaw, and Grave-Mother Nereza.`,
        {
          fontFamily: 'Source Sans 3, sans-serif',
          fontSize: '16px',
          color: '#e2e8f0',
          align: 'center',
          lineSpacing: 4
        }
      )
      .setOrigin(0.5);
    const close = this.add
      .text(640, 540, '[ Close ]', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#facc15'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => {
      panel.destroy();
      body.destroy();
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

    this.add
      .text(640, 48, 'Choose Your Path', {
        fontFamily: 'Cinzel Decorative, Cinzel, serif',
        fontSize: '42px',
        color: '#f5e6c8'
      })
      .setOrigin(0.5);

    this.nameText = this.add
      .text(640, 100, `Name: ${this.heroName}  (click to edit)`, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '18px',
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

    this.cards = [];
    const names = Object.keys(ASTRAYA.CLASSES);
    names.forEach((name, i) => {
      const x = 140 + (i % 3) * 340;
      const y = 220 + Math.floor(i / 3) * 200;
      this.makeCard(x, y, name);
    });

    this.detail = this.add
      .text(640, 560, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '15px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: 900 }
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

  makeCard(x, y, name) {
    const cfg = ASTRAYA.CLASSES[name];
    const bg = this.add
      .rectangle(x, y, 300, 160, 0x111827, 0.95)
      .setStrokeStyle(2, name === this.selected ? 0xd4af37 : 0x334155)
      .setInteractive({ useHandCursor: true });
    const sprite = this.add.image(x - 100, y, `player_${name}`).setScale(2.2);
    const title = this.add
      .text(x + 20, y - 40, name, {
        fontFamily: 'Cinzel, serif',
        fontSize: '22px',
        color: '#f8fafc'
      })
      .setOrigin(0.5);
    const role = this.add
      .text(x + 20, y - 8, cfg.role, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '14px',
        color: '#a5b4fc'
      })
      .setOrigin(0.5);
    const res = this.add
      .text(x + 20, y + 24, `${cfg.resource} · ${cfg.primary}/${cfg.secondary}`, {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '13px',
        color: '#94a3b8'
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => {
      this.selected = name;
      this.cards.forEach((c) => c.bg.setStrokeStyle(2, c.name === name ? 0xd4af37 : 0x334155));
      this.updateDetail();
    });
    this.cards.push({ name, bg, sprite, title, role, res });
  }

  updateDetail() {
    const c = ASTRAYA.CLASSES[this.selected];
    const skills = c.skills.map((s) => s.name).join(' · ');
    this.detail.setText(`${c.identity}\nSkills: ${skills}`);
  }
}
