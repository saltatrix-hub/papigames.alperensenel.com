class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this.invOpen = false;
    const w = this.scale.width;

    this.panel = this.add.rectangle(0, 0, w, 78, 0x070b16, 0.82).setOrigin(0).setScrollFactor(0).setDepth(10);
    this.hpBarBg = this.add.rectangle(24, 22, 220, 14, 0x3f1d1d).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);
    this.hpBar = this.add.rectangle(24, 22, 220, 14, 0xdc2626).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12);
    this.resBarBg = this.add.rectangle(24, 42, 220, 10, 0x1e3a5f).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);
    this.resBar = this.add.rectangle(24, 42, 220, 10, 0x3b82f6).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12);
    this.xpBarBg = this.add.rectangle(24, 58, 220, 6, 0x312e81).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);
    this.xpBar = this.add.rectangle(24, 58, 220, 6, 0xa78bfa).setOrigin(0, 0.5).setScrollFactor(0).setDepth(12);

    this.info = this.add
      .text(260, 16, '', {
        fontFamily: 'Cinzel, serif',
        fontSize: '16px',
        color: '#f5e6c8'
      })
      .setScrollFactor(0)
      .setDepth(12);

    this.questBox = this.add
      .text(w - 24, 12, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '13px',
        color: '#e2e8f0',
        align: 'right',
        backgroundColor: '#00000055',
        padding: { x: 8, y: 6 }
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(12);

    this.skillHints = this.add
      .text(24, this.scale.height - 58, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '13px',
        color: '#cbd5e1',
        backgroundColor: '#00000066',
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0)
      .setDepth(12);

    this.toast = this.add
      .text(w / 2, 100, '', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#fde68a',
        stroke: '#000',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(50);

    this.dialog = this.add
      .text(w / 2, this.scale.height - 120, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '15px',
        color: '#f8fafc',
        align: 'center',
        backgroundColor: '#0f172acc',
        padding: { x: 16, y: 12 },
        wordWrap: { width: 780 }
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(50);

    this.invPanel = this.add.rectangle(w / 2, 360, 420, 320, 0x0f172a, 0.96).setStrokeStyle(2, 0xd4af37).setScrollFactor(0).setDepth(40).setVisible(false);
    this.invText = this.add
      .text(w / 2, 360, '', {
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '15px',
        color: '#e2e8f0',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41)
      .setVisible(false);

    this.game.events.off('astraya-hud');
    this.game.events.off('astraya-toast');
    this.game.events.off('astraya-dialog');
    this.game.events.off('astraya-toggle-inv');
    this.game.events.on('astraya-hud', () => this.refresh());
    this.game.events.on('astraya-toast', (msg) => this.showToast(msg));
    this.game.events.on('astraya-dialog', (msg) => this.showDialog(msg));
    this.game.events.on('astraya-toggle-inv', () => this.toggleInv());

    this.refresh();
  }

  getState() {
    const world = this.scene.get('World');
    return world?.state || AstrayaSave.load();
  }

  refresh() {
    const state = this.getState();
    if (!state) return;
    const stats = AstrayaSave.stats(state);
    const cls = ASTRAYA.CLASSES[state.className];
    const hpPct = Phaser.Math.Clamp(state.hp / stats.maxHp, 0, 1);
    const resPct = Phaser.Math.Clamp(state.resource / stats.maxRes, 0, 1);
    const prev = ASTRAYA.XP_TABLE[state.level - 1] || 0;
    const next = ASTRAYA.XP_TABLE[state.level] || prev + 1;
    const xpPct = Phaser.Math.Clamp((state.xp - prev) / (next - prev || 1), 0, 1);

    this.hpBar.width = 220 * hpPct;
    this.resBar.width = 220 * resPct;
    this.resBar.setFillStyle(cls.color, 1);
    this.xpBar.width = 220 * xpPct;

    const region = ASTRAYA.REGIONS[state.region];
    this.info.setText(
      `${state.name} · Lv.${state.level} ${state.className}\n${region?.name || ''} · ${state.gold}g · HP ${Math.ceil(state.hp)}/${stats.maxHp} · ${cls.resource} ${Math.ceil(state.resource)}/${stats.maxRes}`
    );

    const quest = AstrayaSave.currentQuest(state);
    if (quest) {
      this.questBox.setText(
        `${quest.chapter}\n${quest.title}\n${quest.desc}\nProgress: ${state.questProgress}/${quest.objective.count}`
      );
    } else {
      this.questBox.setText('All current chapter quests complete.\nExplore Astraya.');
    }

    const skills = cls.skills
      .map((s, i) => {
        const locked = state.level < s.level ? '🔒' : '';
        const cd = (state.skillCd?.[s.id] || 0) > this.time.now ? '…' : '';
        return `[${i + 1}] ${locked}${s.name}${cd}`;
      })
      .join('   ');
    this.skillHints.setText(`${skills}\nE interact · H potion · I inventory · Click attack`);

    if (this.invOpen) this.renderInv(state);
  }

  showToast(msg) {
    this.toast.setText(msg).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 500 });
  }

  showDialog(msg) {
    this.dialog.setText(msg).setAlpha(1);
    this.tweens.killTweensOf(this.dialog);
    this.tweens.add({ targets: this.dialog, alpha: 0, delay: 4200, duration: 600 });
  }

  toggleInv() {
    this.invOpen = !this.invOpen;
    this.invPanel.setVisible(this.invOpen);
    this.invText.setVisible(this.invOpen);
    if (this.invOpen) this.renderInv(this.getState());
  }

  renderInv(state) {
    const lines = (state.inventory || [])
      .map((i) => `• ${i.name} ×${i.qty}`)
      .join('\n');
    this.invText.setText(`INVENTORY\n\n${lines || 'Empty'}\n\nGold: ${state.gold}\nCompleted quests: ${state.completedQuests.length}\n\n[I] close`);
  }
}
