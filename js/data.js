/** Astraya game data — derived from ASTRAYA Master GDD */
window.ASTRAYA = window.ASTRAYA || {};

ASTRAYA.XP_TABLE = [
  0, 120, 440, 1010, 1860, 3020, 4510, 6370, 8610, 11250, 14320,
  17830, 21800, 26250, 31190, 36640, 42610, 49120, 56180, 63800, 72000
];

ASTRAYA.CLASSES = {
  Knight: {
    role: 'Tank',
    resource: 'Valor',
    primary: 'VIT',
    secondary: 'STR',
    color: 0x3a6fd8,
    accent: 0xd4af37,
    identity: 'Threat, block, guard links, party mitigation',
    base: { hp: 140, atk: 12, def: 10, spd: 145, resource: 100 },
    growth: { hp: 22, atk: 2.2, def: 2.4, resource: 6 },
    skills: [
      { id: 'shield_rush', name: 'Shield Rush', key: '1', level: 1, cd: 8, cost: 20, range: 1.2, range: 90, kind: 'dash', desc: 'Gap closer + stun' },
      { id: 'bulwark', name: 'Bulwark Stance', key: '2', level: 3, cd: 20, cost: 0, power: 0, range: 0, kind: 'buff', desc: '-20% damage taken' },
      { id: 'radiant_slash', name: 'Radiant Slash', key: '3', level: 8, cd: 6, cost: 22, power: 1.45, range: 70, kind: 'cone', desc: 'Frontal cleave' },
      { id: 'last_bastion', name: 'Last Bastion', key: '4', level: 10, cd: 90, cost: 0, power: 0, range: 0, kind: 'ult', desc: 'Cannot die briefly' }
    ]
  },
  Berserker: {
    role: 'Tank / DPS',
    resource: 'Rage',
    primary: 'STR',
    secondary: 'VIT',
    color: 0xb91c1c,
    accent: 0x1a1a1a,
    identity: 'Rage, cleave, lifesteal, stance swap',
    base: { hp: 130, atk: 16, def: 7, spd: 155, resource: 100 },
    growth: { hp: 18, atk: 3.0, def: 1.6, resource: 5 },
    skills: [
      { id: 'savage_cleave', name: 'Savage Cleave', key: '1', level: 1, cd: 4, cost: 10, power: 1.35, range: 70, kind: 'cone', desc: 'Frontal AoE + bleed' },
      { id: 'blood_crash', name: 'Blood Crash', key: '2', level: 7, cd: 8, cost: 20, power: 1.7, range: 60, kind: 'strike', desc: 'Heavy strike' },
      { id: 'whirlwind', name: 'Whirlwind Carve', key: '3', level: 10, cd: 14, cost: 30, power: 2.2, range: 90, kind: 'aoe', desc: 'Spin AoE' },
      { id: 'execution', name: 'Execution Storm', key: '4', level: 12, cd: 28, cost: 60, power: 3.2, range: 100, kind: 'aoe', desc: 'Execute AoE' }
    ]
  },
  Assassin: {
    role: 'Mobility + DPS',
    resource: 'Focus',
    primary: 'AGI',
    secondary: 'DEX',
    color: 0x7c3aed,
    accent: 0x111111,
    identity: 'Stealth, poison, backstab, combo burst',
    base: { hp: 100, atk: 18, def: 5, spd: 185, resource: 100 },
    growth: { hp: 14, atk: 3.2, def: 1.2, resource: 7 },
    skills: [
      { id: 'shadow_jab', name: 'Shadow Jab', key: '1', level: 1, cd: 3, cost: 15, power: 1.1, range: 55, kind: 'strike', desc: 'Double strike' },
      { id: 'vanish', name: 'Vanish', key: '2', level: 4, cd: 22, cost: 30, power: 0, range: 0, kind: 'stealth', desc: 'Stealth 4s' },
      { id: 'backstab', name: 'Backstab', key: '3', level: 6, cd: 6, cost: 20, power: 1.9, range: 55, kind: 'strike', desc: 'Guaranteed crit' },
      { id: 'shadowstep', name: 'Shadowstep', key: '4', level: 12, cd: 12, cost: 22, power: 1.0, range: 160, kind: 'blink', desc: 'Teleport behind' }
    ]
  },
  Ranger: {
    role: 'Ranged DPS',
    resource: 'Focus',
    primary: 'DEX',
    secondary: 'AGI',
    color: 0x059669,
    accent: 0x78350f,
    identity: 'Kiting, mark, traps, volley',
    base: { hp: 105, atk: 15, def: 6, spd: 170, resource: 100 },
    growth: { hp: 15, atk: 2.8, def: 1.3, resource: 7 },
    skills: [
      { id: 'quick_shot', name: 'Quick Shot', key: '1', level: 1, cd: 2, cost: 12, power: 1.05, range: 220, kind: 'projectile', desc: 'Fast shot' },
      { id: 'rolling_escape', name: 'Rolling Escape', key: '2', level: 4, cd: 10, cost: 18, power: 0, range: 80, kind: 'roll', desc: 'Dodge roll' },
      { id: 'piercing', name: 'Piercing Arrow', key: '3', level: 9, cd: 8, cost: 20, power: 1.75, range: 240, kind: 'line', desc: 'Line pierce' },
      { id: 'volley', name: 'Volley', key: '4', level: 13, cd: 12, cost: 25, power: 1.85, range: 200, kind: 'ground', desc: 'Ground AoE' }
    ]
  },
  Mage: {
    role: 'Ranged AoE DPS',
    resource: 'Mana',
    primary: 'INT',
    secondary: 'SPI',
    color: 0x2563eb,
    accent: 0xc0c0c0,
    identity: 'Element combos, burst AoE, control',
    base: { hp: 90, atk: 20, def: 4, spd: 150, resource: 120 },
    growth: { hp: 12, atk: 3.5, def: 1.0, resource: 10 },
    skills: [
      { id: 'arc_bolt', name: 'Arc Bolt', key: '1', level: 1, cd: 2, cost: 18, power: 1.15, range: 210, kind: 'projectile', desc: 'Basic spell' },
      { id: 'flame_sigil', name: 'Flame Sigil', key: '2', level: 4, cd: 8, cost: 26, power: 1.45, range: 180, kind: 'ground', desc: 'Ground burn' },
      { id: 'frost_needle', name: 'Frost Needle', key: '3', level: 7, cd: 6, cost: 20, power: 1.4, range: 210, kind: 'projectile', desc: 'Slow shot' },
      { id: 'meteor', name: 'Meteor Shard', key: '4', level: 10, cd: 16, cost: 45, power: 2.35, range: 200, kind: 'ground', desc: 'Large AoE' }
    ]
  },
  Priest: {
    role: 'Support',
    resource: 'Faith',
    primary: 'SPI',
    secondary: 'INT',
    color: 0xf5f0e6,
    accent: 0xd4af37,
    identity: 'AoE healing, buffs, holy utility',
    base: { hp: 110, atk: 11, def: 6, spd: 155, resource: 120 },
    growth: { hp: 16, atk: 2.0, def: 1.4, resource: 10 },
    skills: [
      { id: 'sacred_spark', name: 'Sacred Spark', key: '1', level: 1, cd: 2, cost: 16, power: 1.0, range: 200, kind: 'projectile', desc: 'Holy projectile' },
      { id: 'minor_mend', name: 'Minor Mend', key: '2', level: 3, cd: 4, cost: 20, power: 1.2, range: 0, kind: 'heal', desc: 'Self heal' },
      { id: 'halo_pulse', name: 'Halo Pulse', key: '3', level: 9, cd: 10, cost: 26, power: 1.45, range: 90, kind: 'aoe', desc: 'AoE holy damage' },
      { id: 'sanctuary', name: 'Sanctuary Field', key: '4', level: 13, cd: 20, cost: 30, power: 0, range: 0, kind: 'hot', desc: 'Heal over time' }
    ]
  }
};

ASTRAYA.REGIONS = {
  dawnwatch: {
    id: 'dawnwatch',
    name: 'Dawnwatch Village',
    minLevel: 1,
    theme: 'pastoral',
    colors: { ground: 0x3d6b3a, path: 0xc2a56a, water: 0x3a7ca5, accent: 0x8fbc5a },
    spawn: { x: 640, y: 520 },
    portals: [
      { to: 'verdant', x: 1180, y: 360, label: 'Verdant Trail', requireLevel: 5 }
    ],
    npcs: [
      { id: 'elder_mira', name: 'Elder Mira', role: 'Story', x: 620, y: 420, color: 0xf0d9a0, questGiver: true },
      { id: 'blacksmith', name: 'Borin Anvil', role: 'Blacksmith', x: 420, y: 480, color: 0xb87333 },
      { id: 'merchant', name: 'Lina Market', role: 'Merchant', x: 780, y: 460, color: 0x4ade80 },
      { id: 'healer', name: 'Sister Calen', role: 'Healer', x: 540, y: 620, color: 0xfde68a }
    ],
    monsters: [
      { id: 'field_boar', name: 'Field Boar', level: 1, hp: 80, atk: 8, xp: 28, gold: [2, 6], color: 0x8b5a2b, count: 6 },
      { id: 'thistle_rat', name: 'Thistle Rat', level: 2, hp: 100, atk: 10, xp: 36, gold: [3, 8], color: 0x6b7280, count: 5 },
      { id: 'bandit_scout', name: 'Bandit Scout', level: 5, hp: 160, atk: 16, xp: 55, gold: [6, 14], color: 0x7f1d1d, count: 4 },
      { id: 'garrick_thug', name: 'Garrick Thug', level: 8, hp: 240, atk: 22, xp: 80, gold: [10, 20], color: 0x991b1b, count: 3, elite: true }
    ],
    boss: { id: 'garrick', name: 'Garrick the Red', level: 10, hp: 900, atk: 28, xp: 400, gold: [80, 120], color: 0xdc2626, x: 200, y: 200 }
  },
  verdant: {
    id: 'verdant',
    name: 'Verdant Trail',
    minLevel: 5,
    theme: 'forest',
    colors: { ground: 0x245c2e, path: 0x6b8f4e, water: 0x2a6f7a, accent: 0x166534 },
    spawn: { x: 120, y: 400 },
    portals: [
      { to: 'dawnwatch', x: 60, y: 400, label: 'Dawnwatch', requireLevel: 1 },
      { to: 'moonfen', x: 1180, y: 640, label: 'Moonfen Marsh', requireLevel: 12 }
    ],
    npcs: [
      { id: 'ranger_kael', name: 'Ranger Kael', role: 'Story', x: 280, y: 320, color: 0x86efac, questGiver: true },
      { id: 'herbalist', name: 'Willow Softleaf', role: 'Herbalist', x: 500, y: 520, color: 0xa3e635 }
    ],
    monsters: [
      { id: 'forest_wolf', name: 'Forest Wolf', level: 5, hp: 170, atk: 18, xp: 60, gold: [8, 16], color: 0x4b5563, count: 7 },
      { id: 'briar_entling', name: 'Briar Entling', level: 6, hp: 200, atk: 20, xp: 70, gold: [10, 18], color: 0x365314, count: 5 },
      { id: 'vine_stalker', name: 'Vine Stalker', level: 8, hp: 260, atk: 24, xp: 90, gold: [12, 22], color: 0x3f6212, count: 4 },
      { id: 'thorn_archer', name: 'Thorn Archer', level: 11, hp: 300, atk: 28, xp: 110, gold: [14, 26], color: 0x14532d, count: 3, ranged: true }
    ],
    boss: { id: 'thornmaw', name: 'Thornmaw', level: 20, hp: 2200, atk: 40, xp: 900, gold: [200, 320], color: 0x15803d, x: 1000, y: 180 }
  },
  moonfen: {
    id: 'moonfen',
    name: 'Moonfen Marsh',
    minLevel: 12,
    theme: 'marsh',
    colors: { ground: 0x2f3e2e, path: 0x4a5d3a, water: 0x1e3a4c, accent: 0x6d28d9 },
    spawn: { x: 140, y: 200 },
    portals: [
      { to: 'verdant', x: 60, y: 180, label: 'Verdant Trail', requireLevel: 5 }
    ],
    npcs: [
      { id: 'lantern_priest', name: 'Priest Orwen', role: 'Story', x: 360, y: 280, color: 0xc4b5fd, questGiver: true }
    ],
    monsters: [
      { id: 'bog_skeleton', name: 'Bog Skeleton', level: 12, hp: 320, atk: 30, xp: 120, gold: [16, 30], color: 0xd6d3d1, count: 6 },
      { id: 'mire_horror', name: 'Mire Horror', level: 14, hp: 380, atk: 34, xp: 140, gold: [18, 34], color: 0x5b21b6, count: 4 },
      { id: 'lantern_shade', name: 'Lantern Shade', level: 16, hp: 420, atk: 36, xp: 160, gold: [20, 40], color: 0x7c3aed, count: 3, elite: true }
    ],
    boss: { id: 'nereza', name: 'Grave-Mother Nereza', level: 30, hp: 3500, atk: 48, xp: 1500, gold: [300, 450], color: 0x4c1d95, x: 980, y: 560 }
  }
};

ASTRAYA.QUESTS = [
  {
    id: 'MQ_01_01',
    chapter: 'Prologue — Embers at Dawn',
    title: 'Awakening in Dawnwatch',
    region: 'dawnwatch',
    level: 1,
    type: 'Talk',
    desc: 'Speak with Elder Mira about the violet veins under the soil.',
    objective: { kind: 'talk', target: 'elder_mira', count: 1 },
    rewards: { xp: 80, gold: 25 },
    next: 'MQ_01_02'
  },
  {
    id: 'MQ_01_02',
    chapter: 'Prologue — Embers at Dawn',
    title: 'Cull the Field Boars',
    region: 'dawnwatch',
    level: 1,
    type: 'Kill',
    desc: 'Corrupted beasts threaten the farms. Slay 5 Field Boars.',
    objective: { kind: 'kill', target: 'field_boar', count: 5 },
    rewards: { xp: 140, gold: 40 },
    next: 'MQ_01_03'
  },
  {
    id: 'MQ_01_03',
    chapter: 'Prologue — Embers at Dawn',
    title: 'Thistle Trouble',
    region: 'dawnwatch',
    level: 2,
    type: 'Kill',
    desc: 'Clear Thistle Rats nesting near the south path.',
    objective: { kind: 'kill', target: 'thistle_rat', count: 4 },
    rewards: { xp: 180, gold: 50 },
    next: 'MQ_01_04'
  },
  {
    id: 'MQ_01_04',
    chapter: 'Prologue — Embers at Dawn',
    title: 'Bandit Signs',
    region: 'dawnwatch',
    level: 4,
    type: 'Kill',
    desc: 'Bandit Scouts carry Abyss-touched brands. Defeat 3 of them.',
    objective: { kind: 'kill', target: 'bandit_scout', count: 3 },
    rewards: { xp: 260, gold: 70 },
    next: 'MQ_01_05'
  },
  {
    id: 'MQ_01_05',
    chapter: 'Prologue — Embers at Dawn',
    title: 'Garrick the Red',
    region: 'dawnwatch',
    level: 8,
    type: 'Boss',
    desc: 'Confront Garrick the Red in the north ruins and end his raids.',
    objective: { kind: 'kill', target: 'garrick', count: 1 },
    rewards: { xp: 600, gold: 200 },
    next: 'MQ_02_01'
  },
  {
    id: 'MQ_02_01',
    chapter: 'Chapter I — The Briar Wakes',
    title: 'Into Verdant Trail',
    region: 'verdant',
    level: 5,
    type: 'Talk',
    desc: 'Travel to Verdant Trail and report to Ranger Kael.',
    objective: { kind: 'talk', target: 'ranger_kael', count: 1 },
    rewards: { xp: 200, gold: 60 },
    next: 'MQ_02_02'
  },
  {
    id: 'MQ_02_02',
    chapter: 'Chapter I — The Briar Wakes',
    title: 'Wolves of the Briar',
    region: 'verdant',
    level: 5,
    type: 'Kill',
    desc: 'The forest wolves are restless. Slay 6 Forest Wolves.',
    objective: { kind: 'kill', target: 'forest_wolf', count: 6 },
    rewards: { xp: 320, gold: 90 },
    next: 'MQ_02_03'
  },
  {
    id: 'MQ_02_03',
    chapter: 'Chapter I — The Briar Wakes',
    title: 'Root Corruption',
    region: 'verdant',
    level: 6,
    type: 'Kill',
    desc: 'Destroy Briar Entlings feeding on sealed roots.',
    objective: { kind: 'kill', target: 'briar_entling', count: 4 },
    rewards: { xp: 380, gold: 110 },
    next: 'MQ_02_04'
  },
  {
    id: 'MQ_02_04',
    chapter: 'Chapter I — The Briar Wakes',
    title: 'Thornmaw Awakens',
    region: 'verdant',
    level: 12,
    type: 'Boss',
    desc: 'Face Thornmaw, the corrupted forest guardian.',
    objective: { kind: 'kill', target: 'thornmaw', count: 1 },
    rewards: { xp: 1200, gold: 350 },
    next: 'MQ_03_01'
  },
  {
    id: 'MQ_03_01',
    chapter: 'Chapter II — Lanterns in the Mire',
    title: 'Lanterns in the Mire',
    region: 'moonfen',
    level: 12,
    type: 'Talk',
    desc: 'Find Priest Orwen among the marsh lanterns.',
    objective: { kind: 'talk', target: 'lantern_priest', count: 1 },
    rewards: { xp: 400, gold: 120 },
    next: 'MQ_03_02'
  },
  {
    id: 'MQ_03_02',
    chapter: 'Chapter II — Lanterns in the Mire',
    title: 'Bones in the Bog',
    region: 'moonfen',
    level: 12,
    type: 'Kill',
    desc: 'Put down 5 Bog Skeletons rising from the mire.',
    objective: { kind: 'kill', target: 'bog_skeleton', count: 5 },
    rewards: { xp: 500, gold: 150 },
    next: 'MQ_03_03'
  },
  {
    id: 'MQ_03_03',
    chapter: 'Chapter II — Lanterns in the Mire',
    title: 'Silence the Grave-Mother',
    region: 'moonfen',
    level: 16,
    type: 'Boss',
    desc: 'Defeat Grave-Mother Nereza before the cult feeds another seal.',
    objective: { kind: 'kill', target: 'nereza', count: 1 },
    rewards: { xp: 2000, gold: 500 },
    next: null
  }
];

ASTRAYA.LORE = {
  title: 'ASTRAYA',
  subtitle: 'Nine Seals. One Continent. The Second Dawn.',
  blurb:
    'A thousand years ago the Second Dawn sealed Astraya from the Abyss with nine celestial seals. Now violet veins pulse beneath Dawnwatch, and a cult frets the seals from within. Choose your path and defend the light.'
};
