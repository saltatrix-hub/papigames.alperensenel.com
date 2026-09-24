/** Procedural pixel textures for Astraya */
window.AstrayaAssets = {
  generate(scene) {
    this.makeTiles(scene);
    this.makeCharacters(scene);
    this.makeMonsters(scene);
    this.makeFx(scene);
    this.makeUi(scene);
  },

  gfx(scene, key, w, h, draw) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  },

  makeTiles(scene) {
    const themes = {
      pastoral: { g: 0x3d6b3a, d: 0x2f5230, a: 0x8fbc5a, p: 0xc2a56a },
      forest: { g: 0x245c2e, d: 0x1a3f22, a: 0x166534, p: 0x6b8f4e },
      marsh: { g: 0x2f3e2e, d: 0x1f2a1e, a: 0x6d28d9, p: 0x4a5d3a }
    };
    Object.entries(themes).forEach(([name, c]) => {
      this.gfx(scene, `tile_${name}`, 48, 48, (g) => {
        g.fillStyle(c.g, 1);
        g.fillRect(0, 0, 48, 48);
        g.fillStyle(c.d, 0.35);
        g.fillRect(4, 8, 10, 6);
        g.fillRect(28, 30, 12, 5);
        g.fillStyle(c.a, 0.25);
        g.fillCircle(36, 12, 4);
        g.fillCircle(12, 36, 3);
      });
      this.gfx(scene, `path_${name}`, 48, 48, (g) => {
        g.fillStyle(c.p, 1);
        g.fillRect(0, 0, 48, 48);
        g.fillStyle(0x000000, 0.08);
        g.fillRect(8, 10, 6, 4);
        g.fillRect(30, 28, 8, 3);
      });
      this.gfx(scene, `water_${name}`, 48, 48, (g) => {
        g.fillStyle(0x1e4a66, 1);
        g.fillRect(0, 0, 48, 48);
        g.fillStyle(0x3a7ca5, 0.5);
        g.fillRect(0, 12, 48, 8);
        g.fillStyle(0x7dd3fc, 0.25);
        g.fillRect(0, 28, 48, 4);
      });
    });

    this.gfx(scene, 'tree', 40, 56, (g) => {
      g.fillStyle(0x5b3a1a, 1);
      g.fillRect(16, 34, 8, 20);
      g.fillStyle(0x1f6b2e, 1);
      g.fillCircle(20, 22, 16);
      g.fillStyle(0x2f8f3f, 1);
      g.fillCircle(12, 26, 10);
      g.fillCircle(28, 26, 10);
    });

    this.gfx(scene, 'house', 64, 56, (g) => {
      g.fillStyle(0x6b4f2e, 1);
      g.fillRect(8, 24, 48, 30);
      g.fillStyle(0x8b1e1e, 1);
      g.fillTriangle(4, 26, 32, 4, 60, 26);
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(28, 34, 10, 14);
      g.fillStyle(0x93c5fd, 1);
      g.fillRect(14, 32, 10, 10);
    });

    this.gfx(scene, 'ruin', 48, 40, (g) => {
      g.fillStyle(0x6b7280, 1);
      g.fillRect(4, 10, 40, 28);
      g.fillStyle(0x4b5563, 1);
      g.fillRect(10, 0, 8, 18);
      g.fillRect(30, 4, 8, 14);
      g.fillStyle(0x7c3aed, 0.55);
      g.fillCircle(24, 28, 5);
    });

    this.gfx(scene, 'portal', 48, 64, (g) => {
      g.fillStyle(0x1e1b4b, 1);
      g.fillEllipse(24, 32, 28, 48);
      g.fillStyle(0x7c3aed, 0.7);
      g.fillEllipse(24, 32, 18, 36);
      g.fillStyle(0xe9d5ff, 0.85);
      g.fillEllipse(24, 32, 8, 18);
    });

    this.gfx(scene, 'shadow', 28, 12, (g) => {
      g.fillStyle(0x000000, 0.28);
      g.fillEllipse(14, 6, 26, 10);
    });
  },

  makeCharacters(scene) {
    const classes = ASTRAYA.CLASSES;
    Object.entries(classes).forEach(([name, cfg]) => {
      this.gfx(scene, `player_${name}`, 32, 40, (g) => {
        g.fillStyle(cfg.color, 1);
        g.fillCircle(16, 10, 8);
        g.fillStyle(0xf5d0a9, 1);
        g.fillCircle(16, 10, 6);
        g.fillStyle(cfg.color, 1);
        g.fillRoundedRect(8, 18, 16, 14, 3);
        g.fillStyle(cfg.accent, 1);
        g.fillRect(10, 20, 12, 3);
        g.fillStyle(0x1f2937, 1);
        g.fillRect(10, 32, 5, 8);
        g.fillRect(17, 32, 5, 8);
        // class accent mark
        g.fillStyle(cfg.accent, 1);
        if (name === 'Knight') g.fillRect(22, 20, 6, 10);
        if (name === 'Berserker') g.fillTriangle(24, 18, 30, 28, 18, 28);
        if (name === 'Assassin') {
          g.fillStyle(0x111111, 1);
          g.fillRect(10, 8, 12, 3);
        }
        if (name === 'Ranger') {
          g.lineStyle(2, cfg.accent, 1);
          g.strokeCircle(26, 24, 5);
        }
        if (name === 'Mage') {
          g.fillStyle(0x93c5fd, 1);
          g.fillCircle(26, 16, 4);
        }
        if (name === 'Priest') {
          g.fillStyle(0xfacc15, 1);
          g.fillCircle(16, 4, 3);
        }
      });
    });

    this.gfx(scene, 'npc_base', 28, 36, (g) => {
      g.fillStyle(0xf5d0a9, 1);
      g.fillCircle(14, 9, 7);
      g.fillStyle(0x64748b, 1);
      g.fillRoundedRect(7, 16, 14, 12, 3);
      g.fillStyle(0x1f2937, 1);
      g.fillRect(9, 28, 4, 7);
      g.fillRect(15, 28, 4, 7);
    });
  },

  makeMonsters(scene) {
    const shapes = {
      boar: (g, c) => {
        g.fillStyle(c, 1);
        g.fillEllipse(18, 18, 28, 18);
        g.fillCircle(30, 14, 8);
        g.fillStyle(0xf8fafc, 1);
        g.fillRect(32, 12, 4, 2);
        g.fillRect(32, 16, 4, 2);
      },
      rat: (g, c) => {
        g.fillStyle(c, 1);
        g.fillEllipse(16, 18, 22, 12);
        g.fillCircle(28, 16, 6);
        g.fillStyle(0xf87171, 1);
        g.fillCircle(30, 14, 1.5);
      },
      humanoid: (g, c) => {
        g.fillStyle(c, 1);
        g.fillCircle(16, 8, 7);
        g.fillRoundedRect(8, 15, 16, 14, 2);
        g.fillRect(10, 29, 5, 7);
        g.fillRect(17, 29, 5, 7);
      },
      wolf: (g, c) => {
        g.fillStyle(c, 1);
        g.fillEllipse(18, 18, 30, 14);
        g.fillTriangle(28, 10, 36, 16, 28, 20);
        g.fillStyle(0xf87171, 1);
        g.fillCircle(32, 14, 1.5);
      },
      plant: (g, c) => {
        g.fillStyle(0x5b3a1a, 1);
        g.fillRect(14, 20, 8, 14);
        g.fillStyle(c, 1);
        g.fillCircle(18, 14, 12);
        g.fillStyle(0x86efac, 0.7);
        g.fillCircle(12, 12, 5);
      },
      skeleton: (g, c) => {
        g.fillStyle(c, 1);
        g.fillCircle(16, 8, 7);
        g.fillRect(12, 15, 8, 12);
        g.fillStyle(0x0f172a, 1);
        g.fillCircle(13, 8, 1.5);
        g.fillCircle(19, 8, 1.5);
      },
      shade: (g, c) => {
        g.fillStyle(c, 0.85);
        g.fillEllipse(16, 18, 22, 28);
        g.fillStyle(0xe9d5ff, 0.9);
        g.fillCircle(16, 12, 4);
      },
      boss: (g, c) => {
        g.fillStyle(c, 1);
        g.fillEllipse(28, 30, 48, 36);
        g.fillCircle(28, 14, 14);
        g.fillStyle(0xfbbf24, 1);
        g.fillCircle(22, 12, 2);
        g.fillCircle(34, 12, 2);
        g.fillStyle(0x7c3aed, 0.8);
        g.fillCircle(28, 28, 6);
      }
    };

    const map = {
      field_boar: ['boar', 0x8b5a2b],
      thistle_rat: ['rat', 0x6b7280],
      bandit_scout: ['humanoid', 0x7f1d1d],
      garrick_thug: ['humanoid', 0x991b1b],
      garrick: ['boss', 0xdc2626],
      forest_wolf: ['wolf', 0x4b5563],
      briar_entling: ['plant', 0x365314],
      vine_stalker: ['plant', 0x3f6212],
      thorn_archer: ['humanoid', 0x14532d],
      thornmaw: ['boss', 0x15803d],
      bog_skeleton: ['skeleton', 0xd6d3d1],
      mire_horror: ['shade', 0x5b21b6],
      lantern_shade: ['shade', 0x7c3aed],
      nereza: ['boss', 0x4c1d95]
    };

    Object.entries(map).forEach(([id, [shape, color]]) => {
      const size = shape === 'boss' ? 56 : 36;
      this.gfx(scene, `mob_${id}`, size, size, (g) => shapes[shape](g, color));
    });
  },

  makeFx(scene) {
    this.gfx(scene, 'slash', 48, 24, (g) => {
      g.fillStyle(0xfef3c7, 0.9);
      g.fillTriangle(0, 12, 48, 2, 48, 22);
    });
    this.gfx(scene, 'bolt', 16, 8, (g) => {
      g.fillStyle(0x93c5fd, 1);
      g.fillRoundedRect(0, 1, 16, 6, 3);
      g.fillStyle(0xffffff, 0.8);
      g.fillRect(2, 3, 8, 2);
    });
    this.gfx(scene, 'arrow', 18, 6, (g) => {
      g.fillStyle(0xd6d3d1, 1);
      g.fillRect(0, 2, 12, 2);
      g.fillStyle(0xb45309, 1);
      g.fillTriangle(12, 0, 18, 3, 12, 6);
    });
    this.gfx(scene, 'spark', 10, 10, (g) => {
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(5, 5, 4);
    });
    this.gfx(scene, 'heal_cross', 16, 16, (g) => {
      g.fillStyle(0x4ade80, 1);
      g.fillRect(6, 2, 4, 12);
      g.fillRect(2, 6, 12, 4);
    });
    this.gfx(scene, 'marker_quest', 16, 20, (g) => {
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0x111827, 1);
      g.fillRect(6, 4, 4, 6);
      g.fillCircle(8, 13, 1.5);
    });
  },

  makeUi(scene) {
    this.gfx(scene, 'pixel', 4, 4, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 4, 4);
    });
  }
};
