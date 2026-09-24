/** Save + stats helpers */
window.AstrayaSave = {
  KEY: 'astraya_save_v1',

  defaultState(className, heroName) {
    const cls = ASTRAYA.CLASSES[className];
    return {
      name: heroName || 'Wanderer',
      className,
      level: 1,
      xp: 0,
      gold: 20,
      region: 'dawnwatch',
      x: null,
      y: null,
      questId: 'MQ_01_01',
      questProgress: 0,
      completedQuests: [],
      inventory: [
        { id: 'potion_hp', name: 'Health Potion', qty: 3, type: 'consumable' },
        { id: 'starter_weapon', name: `${className} Starter`, qty: 1, type: 'gear' }
      ],
      skillCd: {},
      buffs: {},
      flags: {},
      kills: {},
      createdAt: Date.now()
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save(state) {
    localStorage.setItem(this.KEY, JSON.stringify(state));
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  stats(state) {
    const cls = ASTRAYA.CLASSES[state.className];
    const lv = state.level;
    const maxHp = Math.floor(cls.base.hp + cls.growth.hp * (lv - 1) + lv * 18);
    const atk = Math.floor(cls.base.atk + cls.growth.atk * (lv - 1));
    const def = Math.floor(cls.base.def + cls.growth.def * (lv - 1));
    const maxRes = Math.floor(cls.base.resource + cls.growth.resource * (lv - 1));
    const spd = cls.base.spd + Math.min(40, lv);
    return { maxHp, atk, def, maxRes, spd };
  },

  xpToLevel(level) {
    if (level >= ASTRAYA.XP_TABLE.length) return 999999;
    return ASTRAYA.XP_TABLE[level] - (ASTRAYA.XP_TABLE[level - 1] || 0);
  },

  addXp(state, amount) {
    state.xp += amount;
    let leveled = false;
    while (state.level < 20) {
      const need = this.xpToLevel(state.level);
      const totalAtLevel = ASTRAYA.XP_TABLE[state.level - 1] || 0;
      const into = state.xp - totalAtLevel;
      if (into >= need) {
        state.level += 1;
        leveled = true;
      } else break;
    }
    return leveled;
  },

  currentQuest(state) {
    return ASTRAYA.QUESTS.find((q) => q.id === state.questId) || null;
  }
};
