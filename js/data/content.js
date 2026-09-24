// Hand-authored narrative + presentation layer on top of the GDD tables.
// IDs, levels, objective types, monsters and bosses come from GDD (js/data/gdd.js).

export const REGION_ORDER = ['MAP_DAW', 'MAP_VER', 'MAP_MOO', 'MAP_ASH', 'MAP_IRO', 'MAP_SUN', 'MAP_CEL', 'MAP_FRO', 'MAP_ABY'];

// Theme palettes drive terrain synthesis, props, lighting, particles and ambient music.
export const THEMES = {
  dawn: {
    ground: ['#6fa84a', '#5d9640', '#82b85a'], detail: '#9bcf6a', path: '#c8a36a', pathEdge: '#a8844f',
    liquid: 'water', liq: '#3d86b8', liqDeep: '#285f8f', shore: '#e3d39b', wall: '#4d6b3a',
    dark: 0.0, fog: null, particles: 'leaves', props: { oak: 5, bush: 5, flowers: 7, rock: 2, fence: 0, pine: 1, stump: 1 },
  },
  forest: {
    ground: ['#4c8a3c', '#3f7a33', '#5e9c48'], detail: '#7bbd55', path: '#9f8656', pathEdge: '#7d6840',
    liquid: 'water', liq: '#3a8a8f', liqDeep: '#276a70', shore: '#6f8f4a', wall: '#2e5328',
    dark: 0.12, fog: null, particles: 'fireflies', props: { oak: 7, bigtree: 4, bush: 6, flowers: 5, mushroom: 2, rock: 2, stump: 2, root: 2 },
  },
  swamp: {
    ground: ['#46584a', '#3b4d41', '#52664f'], detail: '#6c7f5a', path: '#5f5a44', pathEdge: '#4a4535',
    liquid: 'water', liq: '#2f4f4a', liqDeep: '#1f3834', shore: '#4e5f45', wall: '#26332b',
    dark: 0.38, fog: '#9fc0b0', particles: 'wisps', props: { deadtree: 6, reeds: 7, lantern: 2, grave: 3, mushroom: 3, rock: 2, bones: 1 },
  },
  ash: {
    ground: ['#4a403d', '#3d3432', '#5a4c46'], detail: '#6e5a50', path: '#6d6058', pathEdge: '#524640',
    liquid: 'lava', liq: '#ff6a1f', liqDeep: '#c2300f', shore: '#2b2220', wall: '#2a2220',
    dark: 0.3, fog: '#ff8a50', particles: 'embers', props: { spire: 5, rock: 6, deadtree: 2, bones: 2, brazier: 2, crack: 4 },
  },
  cave: {
    ground: ['#3d3446', '#342c3d', '#473d50'], detail: '#5b4d63', path: '#5d5260', pathEdge: '#463e4a',
    liquid: 'water', liq: '#2f5d7a', liqDeep: '#1e3f57', shore: '#2a2330', wall: '#1d1822',
    dark: 0.62, fog: null, particles: 'spores', props: { crystal: 6, glowshroom: 6, root: 4, stalagmite: 5, rock: 3 },
  },
  desert: {
    ground: ['#dcb877', '#d2ab66', '#e6c68a'], detail: '#c49a58', path: '#b88f5a', pathEdge: '#a07a48',
    liquid: 'water', liq: '#3ea0b0', liqDeep: '#2a7a8a', shore: '#7fae5a', wall: '#a8804a',
    dark: 0.0, fog: '#f0d8a0', particles: 'dust', props: { cactus: 5, pillar: 3, dune: 4, rock: 3, bones: 2, palm: 1, obelisk: 1 },
  },
  sky: {
    ground: ['#c9c6d8', '#b7b3ca', '#d8d6e6'], detail: '#9f9ab8', path: '#e8e2cf', pathEdge: '#bfb79c',
    liquid: 'chasm', liq: '#6a7bd6', liqDeep: '#2b2f6e', shore: '#8e89a8', wall: '#6d6890',
    dark: 0.08, fog: '#b8c8ff', particles: 'motes', props: { pillar: 6, rune: 3, arch: 2, crystal: 2, statue: 2, rubble: 4 },
  },
  snow: {
    ground: ['#e6eef5', '#d6e2ec', '#f2f7fb'], detail: '#bccfdf', path: '#b9c6d2', pathEdge: '#98a8b8',
    liquid: 'ice', liq: '#8cc4e6', liqDeep: '#5d9ccc', shore: '#cfe3f0', wall: '#7f93a8',
    dark: 0.1, fog: '#ffffff', particles: 'snow', props: { snowpine: 8, rock: 4, icespike: 3, bush: 1, stump: 1 },
  },
  void: {
    ground: ['#2d2438', '#241d2e', '#382c46'], detail: '#4c3a60', path: '#4a3f5a', pathEdge: '#352c42',
    liquid: 'void', liq: '#8a3cff', liqDeep: '#2a0a52', shore: '#1a1422', wall: '#140f1b',
    dark: 0.5, fog: '#b070ff', particles: 'voidsparks', props: { voidcrystal: 6, spire: 4, rift: 2, deadtree: 2, rubble: 3, bones: 2 },
  },
};

export const REGION_META = {
  MAP_DAW: { theme: 'dawn', tr: 'Dawnwatch Köyü', sub: 'Güvenli merkez · pastoral kıyı', map: [0.215, 0.37], village: true },
  MAP_VER: { theme: 'forest', tr: 'Verdant Patikası', sub: 'Orman ve çayırlar', map: [0.33, 0.22] },
  MAP_MOO: { theme: 'swamp', tr: 'Moonfen Bataklığı', sub: 'Bataklık · ölümsüzler', map: [0.29, 0.47] },
  MAP_ASH: { theme: 'ash', tr: 'Ashen Çorakları', sub: 'Volkanik çorak topraklar', map: [0.685, 0.37] },
  MAP_IRO: { theme: 'cave', tr: 'Ironroot Derinlikleri', sub: 'Yeraltı kök mağaraları', map: [0.5, 0.56] },
  MAP_SUN: { theme: 'desert', tr: 'Sunscar Çölü', sub: 'Çöl ve gömülü tapınaklar', map: [0.655, 0.25] },
  MAP_CEL: { theme: 'sky', tr: 'Celestine Harabeleri', sub: 'Gökyüzü harabeleri · arkan', map: [0.5, 0.31] },
  MAP_FRO: { theme: 'snow', tr: 'Frostpeak Yaylaları', sub: 'Kar ve dağ geçitleri', map: [0.52, 0.1] },
  MAP_ABY: { theme: 'void', tr: 'Abyss Kapısı', sub: 'Boşluk yozlaşması · endgame', map: [0.8, 0.54] },
};

// Region → dungeon instance names (GDD §12). Dawnwatch hosts the prologue seal chamber.
export const REGION_DUNGEONS = {
  MAP_DAW: ['Forgotten Seal Chamber'],
  MAP_VER: ['Rootbound Den'],
  MAP_MOO: ['Blackfen Ossuary'],
  MAP_ASH: ['Emberforge Bastion'],
  MAP_IRO: ['Hive of Ironroot'],
  MAP_SUN: ['Temple of Shifting Sand'],
  MAP_CEL: ['Celestine Vault'],
  MAP_FRO: ['Frostveil Citadel'],
  MAP_ABY: ['Abyss Gate Breach', 'Eclipse Cathedral', 'Citadel of Second Dawn'],
};
export const EXTRA_DUNGEONS = {
  'Forgotten Seal Chamber': { name: 'Forgotten Seal Chamber', level: 8, players: 4, boss: 'Seal Warden Aurel', mechanics: ['Seal runes', 'adds'] },
};

export const GARRICK = { id: 'BOSS_00', name: 'Garrick the Red', region: 'Dawnwatch Village', level: 10, type: 'World Boss', abilities: ['Cleaver slam', 'Thug call', 'War cry', 'Enrage'] };

// Named NPCs: GDD named NPCs for Dawnwatch/Abyss + authored chapter leads elsewhere.
export const STORY_NPCS = {
  MAP_DAW: [
    { id: 'NPC_DW_ELRIC', name: 'Mayor Elric', role: 'Mayor/Story', look: { body: '#7a4a2a', trim: '#e0c070', hair: '#d8d8d8', hat: 'none' } },
    { id: 'NPC_DW_ROWAN', name: 'Smith Rowan', role: 'Blacksmith', look: { body: '#5a3a24', trim: '#8a8a8a', hair: '#3a2414', hat: 'none', apron: true } },
    { id: 'NPC_DW_MINA', name: 'Priestess Mina', role: 'Healer', look: { body: '#f2ede0', trim: '#d4a93a', hair: '#e8c890', hat: 'hood' } },
    { id: 'NPC_DW_LYSA', name: 'Scout Lysa', role: 'Story/Scout', look: { body: '#3f6a3a', trim: '#a07a48', hair: '#b8542a', hat: 'hood' } },
  ],
  MAP_VER: [
    { id: 'NPC_VT_FAELAN', name: 'Warden Faelan', role: 'Story/Warden', look: { body: '#2f5a2a', trim: '#b89a50', hair: '#6a4a2a', hat: 'hood' } },
    { id: 'NPC_VT_YSOLDE', name: 'Druid Ysolde', role: 'Story/Druid', look: { body: '#6a8a3a', trim: '#e0d080', hair: '#e0e0c0', hat: 'none' } },
  ],
  MAP_MOO: [
    { id: 'NPC_MF_ORSIN', name: 'Lantern-keeper Orsin', role: 'Story/Keeper', look: { body: '#3a4a5a', trim: '#e8c060', hair: '#9a9a9a', hat: 'hood' } },
    { id: 'NPC_MF_MAELIS', name: 'Sister Maelis', role: 'Story/Pilgrim', look: { body: '#d8d0c0', trim: '#6a5a8a', hair: '#2a2a3a', hat: 'hood' } },
  ],
  MAP_ASH: [
    { id: 'NPC_AW_VARRA', name: 'Commander Varra', role: 'Story/Legion', look: { body: '#7a2a20', trim: '#c0a060', hair: '#1a1a1a', hat: 'helm' } },
    { id: 'NPC_AW_DORN', name: 'Forgemaster Dorn', role: 'Story/Forge', look: { body: '#4a3020', trim: '#ff8a40', hair: '#8a4a20', hat: 'none', apron: true } },
  ],
  MAP_IRO: [
    { id: 'NPC_IR_KAEL', name: 'Rootwarden Kael', role: 'Story/Warden', look: { body: '#4a3a2a', trim: '#6ad0a0', hair: '#2a4a3a', hat: 'hood' } },
    { id: 'NPC_IR_BROM', name: 'Miner Brom', role: 'Story/Miner', look: { body: '#6a5a3a', trim: '#ffd060', hair: '#a06a3a', hat: 'helm' } },
  ],
  MAP_SUN: [
    { id: 'NPC_SS_SAHIR', name: 'Caravan Master Sahir', role: 'Story/Caravan', look: { body: '#c08a3a', trim: '#6a2a8a', hair: '#1a1a1a', hat: 'turban' } },
    { id: 'NPC_SS_NAHLA', name: 'Seer Nahla', role: 'Story/Seer', look: { body: '#3a5a8a', trim: '#e0c060', hair: '#1a1a2a', hat: 'hood' } },
  ],
  MAP_CEL: [
    { id: 'NPC_CR_SERAPHEL', name: 'Archivist Seraphel', role: 'Story/Archive', look: { body: '#5a5aa0', trim: '#e0e0ff', hair: '#f0f0f0', hat: 'none' } },
    { id: 'NPC_CR_ILVEN', name: 'Runesmith Ilven', role: 'Story/Runes', look: { body: '#3a6a8a', trim: '#80e0ff', hair: '#c0a080', hat: 'none' } },
  ],
  MAP_FRO: [
    { id: 'NPC_FP_INGRID', name: 'Chieftain Ingrid', role: 'Story/Chieftain', look: { body: '#5a6a7a', trim: '#e0e8f0', hair: '#e8d8a0', hat: 'fur' } },
    { id: 'NPC_FP_TOVI', name: 'Envoy Tovi', role: 'Story/Envoy', look: { body: '#6a4a3a', trim: '#b0d0e0', hair: '#c05a2a', hat: 'fur' } },
  ],
  MAP_ABY: [
    { id: 'NPC_AB_VEYA', name: 'Oracle Veya', role: 'Raid/Story', look: { body: '#2a2040', trim: '#c080ff', hair: '#e0e0ff', hat: 'hood' } },
    { id: 'NPC_AB_MIRR', name: 'Shade Broker Mirr', role: 'Endgame Vendor', look: { body: '#1a1a24', trim: '#80ffd0', hair: '#303040', hat: 'hood' } },
  ],
};

// Personal names for GDD's generic service NPCs ("Verdant NPC 3" → "Bram, Auctioneer").
export const NPC_NAMES = {
  MAP_DAW: ['Hilda', 'Odo', 'Marta', 'Pell', 'Gisela', 'Bertram'],
  MAP_VER: ['Bram', 'Lirien', 'Oswin', 'Tamsin', 'Corwen', 'Elowen'],
  MAP_MOO: ['Morrow', 'Ilse', 'Garrow', 'Wren', 'Selka', 'Haskel'],
  MAP_ASH: ['Kassa', 'Torvik', 'Ember', 'Ragn', 'Solvei', 'Drago'],
  MAP_IRO: ['Gilda', 'Nuri', 'Hobb', 'Tessa', 'Dunmore', 'Pip'],
  MAP_SUN: ['Farid', 'Zahra', 'Omar', 'Layla', 'Kasim', 'Amira'],
  MAP_CEL: ['Aelis', 'Corvin', 'Isolde', 'Theron', 'Lumen', 'Vesper'],
  MAP_FRO: ['Bjorn', 'Sigrid', 'Halvar', 'Astrid', 'Eirik', 'Freya'],
  MAP_ABY: ['Nyx', 'Corrin', 'Vael', 'Seren', 'Morn', 'Isk'],
};

export const ROLE_TR = {
  'Blacksmith': 'Demirci', 'Alchemist': 'Simyacı', 'General Merchant': 'Tüccar', 'Storage': 'Depocu',
  'Auctioneer': 'Mezatçı', 'Guild Registrar': 'Lonca Kâtibi', 'Class Trainer': 'Sınıf Eğitmeni', 'Stablemaster': 'Ahır Ustası',
  'Stylist': 'Stilist', 'Healer': 'Şifacı', 'Event Manager': 'Etkinlik Yöneticisi', 'Faction Officer': 'Fraksiyon Subayı',
  'Bounty Board Keeper': 'Ödül Panosu', 'Dungeon Guide': 'Zindan Rehberi', 'Craft Master': 'Zanaat Ustası', 'Mayor/Story': 'Muhtar',
  'Story/Scout': 'İzci', 'Raid/Story': 'Kâhin', 'Endgame Vendor': 'Gölge Tüccarı',
};
export const ROLE_SERVICE = {
  'Blacksmith': 'smith', 'Alchemist': 'alchemy', 'General Merchant': 'shop', 'Storage': 'storage', 'Auctioneer': 'auction',
  'Guild Registrar': 'guild', 'Class Trainer': 'trainer', 'Stablemaster': 'stable', 'Stylist': 'stylist', 'Healer': 'healer',
  'Event Manager': 'bounty', 'Faction Officer': 'faction', 'Bounty Board Keeper': 'bounty', 'Dungeon Guide': 'dungeon',
  'Craft Master': 'craft', 'Mayor/Story': 'lore', 'Endgame Vendor': 'endgame',
};

// Chapter narrative. Each chapter maps 1:1 to GDD main quest IDs MQ_0X_01..08 with the GDD objective order:
// Talk, Kill, Collect, Investigate, Defend, Escort, Activate, Boss.
// mob: index into that region's GDD monster list. giver: STORY_NPCS index for the region.
export const CHAPTERS = {
  MAP_DAW: {
    title: 'Prologue — Embers at Dawn', short: 'Şafaktaki Közler',
    intro: 'Dawnwatch çevresindeki hayvanlar saldırganlaşıyor, toprağın altında mor damarlar parlıyor.',
    steps: [
      { t: 'Şafakta Uyanış', g: 0, d: 'Ah, sonunda uyandın! Dün gece köyün kenarında baygın bulundun. Ben Muhtar Elric. Tam zamanında geldin — Dawnwatch’ın yardıma ihtiyacı var.', obj: { talk: 0 } },
      { t: 'Azgın Yaban Domuzları', g: 0, d: 'Tarlalardaki yaban domuzları birden çıldırdı. Gözleri mor parlıyor! Doğu tarlalarına git ve onları durdur.', obj: { kill: 0, n: 6 } },
      { t: 'Mor Damar Örnekleri', g: 1, d: 'Domuzların etinde tuhaf kristaller buldum. Dikenli sıçanlar da aynı şeyi taşıyor olmalı. Bana o kristallerden getir, inceleyeyim.', obj: { collect: 1, n: 5, item: 'Mor Kristal Parçası' } },
      { t: 'Terk Edilmiş Değirmen', g: 3, d: 'İzlerini sürdüm; kristaller eski değirmenden yayılıyor. Oraya git ve ne olduğunu araştır. Dikkatli ol, kargalar orayı mesken tuttu.', obj: { investigate: 'mill', mob: 2 } },
      { t: 'Çiftliği Savun', g: 0, d: 'Garrick’in haydut gözcüleri erzak arabamıza saldırıyor! Arabayı korumazsak kış boyunca aç kalırız.', obj: { defend: 'farm', mob: 4, waves: 3 } },
      { t: 'Lysa’nın Keşfi', g: 3, d: 'Değirmenin altında bir geçit buldum — eski mühür odasına iniyor olabilir. Beni oraya kadar koru, haydutlar yolda pusu kurmuş olabilir.', obj: { escort: 3, mob: 5 } },
      { t: 'Unutulmuş Mühür', g: 3, d: 'Mühür odasının girişindeki üç rün sönmüş. Onları yeniden etkinleştirirsen kapıyı mühürleyebiliriz. Korkuluklar gibi canlanan şeylere dikkat et!', obj: { activate: 3, mob: 6 } },
      { t: 'Kızıl Garrick', g: 0, d: 'Her şeyin arkasında Kızıl Garrick var; mor kristalleri kült adına topluyor. Kuzeydoğudaki kampına git ve ona son ver!', obj: { boss: true } },
    ],
    outro: 'Garrick’in üzerinden kült mührü taşıyan bir mektup çıktı: “Dikenler uyanacak.” Verdant Patikası seni bekliyor.',
  },
  MAP_VER: {
    title: 'Chapter I — The Briar Wakes', short: 'Diken Uyanıyor',
    intro: 'Ormanın koruyucusu Thornmaw yozlaşmış; doğa ruhları öfkeli.',
    steps: [
      { t: 'Ormanın Muhafızı', g: 0, d: 'Dawnwatch’tan gelen yolcu, demek sensin. Ben Muhafız Faelan. Orman hastalandı; ağaçlar bile artık fısıldamıyor, çığlık atıyor.', obj: { talk: 0 } },
      { t: 'Kurt Sürüsü', g: 0, d: 'Orman kurtları sürüler hâlinde patikayı kesiyor. Yolu temizle ki erzak kervanları geçebilsin.', obj: { kill: 0, n: 8 } },
      { t: 'Bozulmuş Tohumlar', g: 1, d: 'Diken fidanlarının kalbinde bozulmuş tohumlar var. Onları topla; saflaştırma ritüeli için gerekiyor.', obj: { collect: 1, n: 6, item: 'Bozulmuş Tohum' } },
      { t: 'Kült İzleri', g: 0, d: 'İzciler ormanın derinliklerinde terk edilmiş bir kamp gördü. Kült sembolleri varmış. Git ve araştır.', obj: { investigate: 'camp', mob: 2 } },
      { t: 'Kadim Kökü Savun', g: 1, d: 'Kült kadim köke saldırıyor! O kök bu ormanın kalbi. Ritüeli bitirene kadar onu korumalısın!', obj: { defend: 'root', mob: 2, waves: 3 } },
      { t: 'Ruh Korusu', g: 1, d: 'Beni ruh korusuna götür. Orada doğa ruhlarıyla konuşabilirim — ama yol tehlikeli.', obj: { escort: 1, mob: 4 } },
      { t: 'Totemleri Uyandır', g: 1, d: 'Üç ruh totemini etkinleştir. Ruhlar sakinleşirse Thornmaw’ın gücü zayıflar.', obj: { activate: 3, mob: 5 } },
      { t: 'Thornmaw', g: 0, d: 'Thornmaw zayıfladı ama hâlâ öfkeli. Batı korusundaki arenasında onu yen ve ormanı özgürleştir!', obj: { boss: true } },
    ],
    outro: 'Thornmaw’ın kökleri arasında kült fenerleri buldun. İzler güneydeki Moonfen Bataklığı’na çıkıyor.',
  },
  MAP_MOO: {
    title: 'Chapter II — Lanterns in the Mire', short: 'Bataklıktaki Fenerler',
    intro: 'Ruh fenerleri, kayıp hacılar ve Nereza kültü: Abyss enerjisi ruhları yakıt gibi tüketiyor.',
    steps: [
      { t: 'Fener Bekçisi', g: 0, d: 'Fenerlerim sönüyor, yolcu. Her sönen fener bir ruhun kaybolması demek. Ben Orsin; bu bataklığın son bekçisiyim.', obj: { talk: 0 } },
      { t: 'Batak İskeletleri', g: 0, d: 'İskeletler çamurdan kalkıyor ve hacı yolunu kesiyor. Onları geri gömmelisin.', obj: { kill: 0, n: 8 } },
      { t: 'Çalınan Ruhlar', g: 0, d: 'Batak sülükleri ruh özünü emiyor. Onları yen ve çalınan ruh özlerini geri getir.', obj: { collect: 2, n: 5, item: 'Ruh Özü' } },
      { t: 'Kayıp Hacılar', g: 1, d: 'Hacı kardeşlerim kayboldu. Son görüldükleri kampı araştır; bir iz bırakmış olmalılar.', obj: { investigate: 'pilgrims', mob: 3 } },
      { t: 'Fener Yolu', g: 0, d: 'Kült, fener yolundaki son sunağa saldırıyor. Sunak düşerse bataklık tamamen karanlığa gömülür!', obj: { defend: 'lantern', mob: 1, waves: 3 } },
      { t: 'Hacıların Dönüşü', g: 1, d: 'Hayatta kalan hacıları güvenli kampa götürmeme yardım et. Ferryman’lar bizi izliyor.', obj: { escort: 1, mob: 4 } },
      { t: 'Fenerleri Yak', g: 0, d: 'Üç kadim feneri yeniden yakarsan ruhlar yolunu bulur ve Nereza’nın gücü kesilir.', obj: { activate: 3, mob: 6 } },
      { t: 'Grave-Mother Nereza', g: 0, d: 'Nereza kendi kriptinde ruhları yiyor. Onu durdur — ağıdına kulak verme!', obj: { boss: true } },
    ],
    outro: 'Nereza düşerken fısıldadı: “Lejyon demirleri kapı için dövülüyor...” Ashen Çorakları’nda ocaklar yeniden yanıyor.',
  },
  MAP_ASH: {
    title: 'Chapter III — Ashes of the Legion', short: 'Lejyonun Külleri',
    intro: 'Eski lejyon kaleleri yeniden yanıyor; Forge-Eater Golm kapı için silah üretiyor.',
    steps: [
      { t: 'Lejyon Komutanı', g: 0, d: 'Lejyonun son sancağı benimle, yabancı. Ben Komutan Varra. Atalarımın ocakları şimdi kült için yanıyor.', obj: { talk: 0 } },
      { t: 'Kül Akıncıları', g: 0, d: 'Kül akıncıları ikmal hatlarımızı yağmalıyor. Onları püskürt.', obj: { kill: 0, n: 8 } },
      { t: 'Lejyon Mühürleri', g: 1, d: 'Kor golemlerin içine lejyon mühürleri yerleştirilmiş. Mühürleri geri al; onlarla ocakları kapatabiliriz.', obj: { collect: 2, n: 5, item: 'Lejyon Mührü' } },
      { t: 'Dövme Harabeleri', g: 1, d: 'Eski dövme harabelerinde kültün ne ürettiğini öğrenmeliyiz. Git ve araştır.', obj: { investigate: 'forge', mob: 3 } },
      { t: 'Karakol Kuşatması', g: 0, d: 'Kor tazıları karakolumuza saldırıyor! Sancağı ayakta tut!', obj: { defend: 'outpost', mob: 1, waves: 3 } },
      { t: 'Ustanın Yolu', g: 1, d: 'Beni ana ocağa kadar koru. Oradaki körükleri söndürme bilgisini sadece ben biliyorum.', obj: { escort: 1, mob: 4 } },
      { t: 'Ocakları Söndür', g: 1, d: 'Üç lav bacasını kapat. Golm’un gücünü besleyen ateş bunlar.', obj: { activate: 3, mob: 5 } },
      { t: 'Forge-Eater Golm', g: 0, d: 'Golm ocağın kalbinde bekliyor. Zırhını kır, onu kendi ateşinde erit!', obj: { boss: true } },
    ],
    outro: 'Golm’un kalıntıları arasında kök ağına saplanmış demir kazıklar buldun. Mühürler yeraltından kesiliyor: Ironroot.',
  },
  MAP_IRO: {
    title: 'Chapter IV — Beneath Root and Stone', short: 'Kök ve Taşın Altında',
    intro: 'Mühürleri bağlayan yaşayan kök ağı kesiliyor; Hive Queen bu bozulmadan güçleniyor.',
    steps: [
      { t: 'Kök Muhafızı', g: 0, d: 'Kökler acı çekiyor, hissedebiliyorum. Ben Kael. Bu mağaralar mühürlerin damarları — ve biri onları kesiyor.', obj: { talk: 0 } },
      { t: 'Mağara Sürüngenleri', g: 0, d: 'Mağara sürüngenleri madenci tünellerini istila etti. Tünelleri temizle.', obj: { kill: 0, n: 8 } },
      { t: 'Kök Özü', g: 0, d: 'Kökçükler kesilen köklerin özünü taşıyor. Onları topla; ağı iyileştirmek için gerekli.', obj: { collect: 2, n: 5, item: 'Kök Özü' } },
      { t: 'Kesik Kök', g: 1, d: 'Ana kökün kesildiği yeri buldum ama yaklaşamadım. Git ve kimin yaptığını öğren.', obj: { investigate: 'severed', mob: 3 } },
      { t: 'Maden Kampı', g: 1, d: 'Kitin avcıları kampımıza saldırıyor! Madencileri koru!', obj: { defend: 'mine', mob: 1, waves: 3 } },
      { t: 'Kristal Madenleri', g: 1, d: 'Beni kristal madenlerinden geçir. Kovana giden gizli yolu biliyorum.', obj: { escort: 1, mob: 4 } },
      { t: 'Kökleri Bağla', g: 0, d: 'Üç kök düğümünü yeniden bağla. Ağ canlanırsa Kraliçe gücünü kaybeder.', obj: { activate: 3, mob: 5 } },
      { t: 'Hive Queen Velkra', g: 0, d: 'Velkra kovanın derinliğinde yumurtalarını koruyor. Onu durdur!', obj: { boss: true } },
    ],
    outro: 'Velkra’nın kovanında çöl kumu vardı. Kült, Sunscar Çölü’nde gömülü bir şey arıyor: Solar Keystone.',
  },
  MAP_SUN: {
    title: 'Chapter V — Kingdom of Sand', short: 'Kum Krallığı',
    intro: 'Kumların altında Solar Keystone bulunur — Abyss Gate’i kapatabilecek anahtarların ilki.',
    steps: [
      { t: 'Kervan Ustası', g: 0, d: 'Hoş geldin, gezgin! Ben Sahir. Kervanlarım kayboluyor ve yıldızlar yanlış yerde parlıyor. Kötü alametler...', obj: { talk: 0 } },
      { t: 'Kum Akıncıları', g: 0, d: 'Kum akıncıları kuyuları ele geçirdi. Suyu geri al!', obj: { kill: 0, n: 8 } },
      { t: 'Güneş Parçaları', g: 1, d: 'Serap avcıları Güneş Taşı’nın parçalarını taşıyor. Parçaları toplarsak Keystone’un yerini bulabilirim.', obj: { collect: 2, n: 5, item: 'Güneş Parçası' } },
      { t: 'Gömülü Tapınak', g: 1, d: 'Kumlar gömülü bir tapınağı açığa çıkardı. Duvarlarındaki yazıları araştır.', obj: { investigate: 'temple', mob: 3 } },
      { t: 'Kervanı Koru', g: 0, d: 'Akrep devleri kervanımı kuşattı! Develerimi ve yükümü koru!', obj: { defend: 'caravan', mob: 1, waves: 3 } },
      { t: 'Kâhinin Yolculuğu', g: 1, d: 'Beni dikilitaşa götür. Keystone’un şarkısını orada duyabilirim.', obj: { escort: 1, mob: 4 } },
      { t: 'Güneş Dikilitaşları', g: 1, d: 'Üç güneş dikilitaşını hizala. Keystone’un mezarı açılacak.', obj: { activate: 3, mob: 5 } },
      { t: 'Dune Tyrant Khar', g: 0, d: 'Keystone’u Dune Tyrant Khar koruyor! Kumların altından çıkmadan önce hazırlan!', obj: { boss: true } },
    ],
    outro: 'Solar Keystone elinde parlıyor. Taşın ışığı gökyüzündeki harabeleri gösteriyor: Celestine arşivleri.',
  },
  MAP_CEL: {
    title: 'Chapter VI — Songs of the Celestine', short: 'Celestine’in Şarkıları',
    intro: 'Göksel arşivlerde Second Dawn kehaneti çözülür; Malzor’un gerçek planı açığa çıkar.',
    steps: [
      { t: 'Arşivci', g: 0, d: 'Keystone’u getirdin... Kehanet doğruymuş. Ben Seraphel, bu arşivlerin son bekçisi. Vakit daralıyor.', obj: { talk: 0 } },
      { t: 'Arkan Nöbetçiler', g: 0, d: 'Arkan nöbetçiler bozuldu; artık herkese saldırıyorlar. Arşiv yolunu aç.', obj: { kill: 0, n: 8 } },
      { t: 'Dağılmış Sayfalar', g: 0, d: 'Kehanetin sayfaları düşmüş yardımcıların elinde. Sayfaları topla.', obj: { collect: 1, n: 5, item: 'Arşiv Sayfası' } },
      { t: 'Kehanet Duvarı', g: 1, d: 'Kehanet duvarında tutulmanın tarihi yazılı. Git ve oku.', obj: { investigate: 'mural', mob: 2 } },
      { t: 'Arşivi Savun', g: 0, d: 'Hale hayaletleri arşive saldırıyor! Kehanet yok olmamalı!', obj: { defend: 'archive', mob: 2, waves: 3 } },
      { t: 'Kırık Köprüler', g: 1, d: 'Beni kırık köprülerin ötesine götür; rün ocağı orada.', obj: { escort: 1, mob: 4 } },
      { t: 'Rün Sütunları', g: 1, d: 'Üç rün sütununu etkinleştir; Hakem’in kafesi açılacak.', obj: { activate: 3, mob: 5 } },
      { t: 'Arbiter of Halos', g: 0, d: 'Hakem kehaneti koruyor ama artık Malzor’a hizmet ediyor. Onu yen!', obj: { boss: true } },
    ],
    outro: 'Kehanet çözüldü: Abyss Gate göksel tutulmada açılacak. Frostpeak’teki son koruyucu mühür saldırı altında!',
  },
  MAP_FRO: {
    title: 'Chapter VII — Crown of Winter', short: 'Kışın Tacı',
    intro: 'Son koruyucu mühür saldırıya uğrar; oyuncu tüm fraksiyonları ittifak altında birleştirir.',
    steps: [
      { t: 'Kabile Reisi', g: 0, d: 'Güneyliler buraya pek gelmez. Ama gözlerinde Keystone’un ışığını görüyorum. Ben Ingrid. Konuşalım.', obj: { talk: 0 } },
      { t: 'Ayaz Kurtları', g: 0, d: 'Ayaz kurtları köylerimizi kuşattı. Sürüleri dağıt.', obj: { kill: 0, n: 8 } },
      { t: 'Buz Kalpleri', g: 1, d: 'Buz trollerinin kalpleri mühür büyüsünü taşıyor. Topla; mührü güçlendireceğiz.', obj: { collect: 1, n: 5, item: 'Buz Kalbi' } },
      { t: 'Tapınak Tırmanışı', g: 0, d: 'Tapınağa giden yolda kült izleri var. Araştır.', obj: { investigate: 'temple', mob: 2 } },
      { t: 'Son Mühür', g: 0, d: 'Karla bağlı şövalyeler mühre saldırıyor! Mühür düşerse kapı açılır!', obj: { defend: 'seal', mob: 3, waves: 3 } },
      { t: 'İttifak Elçisi', g: 1, d: 'Beni ittifak zirvesine götür. Tüm fraksiyonlar orada toplanıyor.', obj: { escort: 1, mob: 4 } },
      { t: 'İttifak İşaretleri', g: 0, d: 'Üç işaret ateşini yak. Tüm Astraya ittifakın doğduğunu görecek.', obj: { activate: 3, mob: 5 } },
      { t: 'Icefang Matriarch', g: 0, d: 'Buzdiş Matriarkı mührün son bekçisi ama zihni zehirlenmiş. Onu yen ve mührü kurtar!', obj: { boss: true } },
    ],
    outro: 'İttifak kuruldu. Gökyüzü kararıyor — tutulma başladı. Abyss Gate açılıyor.',
  },
  MAP_ABY: {
    title: 'Chapter VIII — Eclipse of Astraya', short: 'Astraya’nın Tutulması',
    intro: 'Kapı açılır. Savunma etkinlikleri, rift kapatma ve Eclipse Cathedral raid zinciri başlar.',
    steps: [
      { t: 'Kâhin Veya', g: 0, d: 'Seni bekliyordum, Şafak Taşıyıcı. Ben Veya. Kapı açıldı; Malzor Eclipse Katedrali’nde tutulmayı tamamlamak üzere.', obj: { talk: 0 } },
      { t: 'Boşluk Tazıları', g: 0, d: 'Boşluk tazıları ittifak kampına sızıyor. Onları geri püskürt.', obj: { kill: 0, n: 8 } },
      { t: 'Boşluk Közleri', g: 0, d: 'Voidfiend’lerin taşıdığı közler riftleri besliyor. Topla ve yok edelim.', obj: { collect: 1, n: 5, item: 'Void Ember' } },
      { t: 'Rift Kalbi', g: 0, d: 'En büyük riftin kalbini araştır. Malzor’un zayıflığı orada olmalı.', obj: { investigate: 'rift', mob: 2 } },
      { t: 'Kapı Kampı', g: 0, d: 'Düşmüş melekler ittifak kampına saldırıyor! Hattı tut!', obj: { defend: 'gatecamp', mob: 2, waves: 3 } },
      { t: 'Kâhinin Yürüyüşü', g: 0, d: 'Beni rift kalbine götür. Keystone’u orada uyandıracağım.', obj: { escort: 0, mob: 3 } },
      { t: 'Rift Çapaları', g: 0, d: 'Üç rift çapasını kapat. Katedralin kalkanı düşecek.', obj: { activate: 3, mob: 5 } },
      { t: 'Eclipse Seraph Malzor', g: 0, d: 'Katedralin kapıları açık. Malzor seni bekliyor. Astraya’nın kaderi senin elinde, Şafak Taşıyıcı.', obj: { raid: 'Eclipse Cathedral' } },
    ],
    outro: '“Kapı kapandı... fakat gök hatırladı.” Malzor yenildi, ama göksel savaş bitmedi.',
  },
};

// Side quest flavour (GDD side quest types per region).
export const SIDE_TEMPLATES = {
  Kill: (m) => ({ t: `${m} Temizliği`, d: `${m} sürüleri yolları tehlikeli hâle getirdi. Onları azalt.` }),
  Collect: (mat) => ({ t: 'Toplayıcının Sepeti', d: `Atölyelerimizde ${mat} tükendi. Bölgedeki kaynaklardan toplayıp getir.` }),
  Delivery: (npc) => ({ t: 'Acil Teslimat', d: `Bu paketi ${npc} kişisine götürür müsün? Çok önemli.` }),
  Craft: () => ({ t: 'Simya Dersi', d: 'Kendi iksirini yapmayı öğrenmelisin. Bir Zanaat/Simya tezgâhında 2 Can İksiri üret.' }),
  Explore: () => ({ t: 'Haritacının İsteği', d: 'Haritam eksik. Bölgedeki üç önemli noktayı keşfet ve bana anlat.' }),
  Bounty: (m) => ({ t: `Ödül Avı: ${m}`, d: `Elit ${m} yaratıkları için ödül konuldu. Üç tanesini avla.` }),
  Event: () => ({ t: 'Bölge Nöbeti', d: 'Gözcüler bir saldırı dalgası bildiriyor. Nöbet noktasını savun.' }),
  MiniBoss: (m) => ({ t: `Adı Konmuş Tehdit`, d: `${m} adında dev bir yaratık görüldü. Onu bul ve yok et.` }),
};

export const MINIBOSS_EPITHETS = ['Kadim', 'Kızıl', 'Yaralı', 'Kör', 'Demir Dişli', 'Kara', 'Uluyan', 'Yaşlı', 'Lanetli'];

// Dungeon/raid bosses per instance (GDD §12). Eclipse Cathedral is a 6-boss raid wing.
export const RAID_WINGS = {
  'Eclipse Cathedral': ['Choir Warden Lucent', 'Penitent Colossus', 'Twin Heralds of Dusk', 'Nave Devourer', 'High Cantor Seris', 'Eclipse Seraph Malzor'],
  'Citadel of Second Dawn': ['Oracle of Yesterday', 'Oracle of Tomorrow', 'Twin Oracles'],
};

export const CLASS_TR = {
  Knight: { tr: 'Şövalye', blurb: 'Kule kalkanı ve kılıçla ön safları tutan, grubunu koruyan zırhlı tank.' },
  Berserker: { tr: 'Berserker', blurb: 'Öfkeyle beslenen, dev baltasıyla etrafını biçen yarı tank yarı yıkıcı.' },
  Assassin: { tr: 'Suikastçı', blurb: 'Gölgelerde kaybolan, zehir ve arkadan vuruşlarla hedefini eriten hızlı katil.' },
  Ranger: { tr: 'Korucu', blurb: 'Uzaktan ok yağdıran, tuzak kuran ve sürekli hareket eden avcı.' },
  Mage: { tr: 'Büyücü', blurb: 'Ateş, buz ve yerçekimini birleştiren yıkıcı alan hasarı ustası.' },
  Priest: { tr: 'Rahip', blurb: 'Kutsal ışıkla iyileştiren, güçlendiren ve düşmanlarını yakan destek.' },
};

export const RARITY = {
  Common: { tr: 'Sıradan', color: '#c8c8c8' },
  Uncommon: { tr: 'Nadir Olmayan', color: '#5fd35f' },
  Rare: { tr: 'Nadir', color: '#4aa3ff' },
  Epic: { tr: 'Destansı', color: '#b36bff' },
  Legendary: { tr: 'Efsanevi', color: '#ff9a2e' },
  Mythic: { tr: 'Mitik', color: '#ff4f6d' },
};
export const SLOT_TR = {
  MainHand: 'Silah', Head: 'Kafa', Chest: 'Göğüs', Gloves: 'Eldiven', Legs: 'Bacak', Boots: 'Çizme', Cape: 'Pelerin', Necklace: 'Kolye', Ring: 'Yüzük',
};

export const TIPS = [
  'Sol tık ile saldırırsın; yetenekler 1–8 tuşlarındadır.',
  'Shift ile yuvarlanarak telegraf edilmiş kırmızı alanlardan kaç.',
  'Lonca Kâtibi’nden en fazla 3 yoldaş kiralayabilirsin (GDD: 4 kişilik parti).',
  'Demirci ekipmanını +10’a kadar güçlendirebilir; yüksek seviyelerde Koruma Parşömeni kullan.',
  'Astral Kristaller yalnızca kozmetik ve kolaylık ürünleri alır — güç satılmaz.',
  'Bossların ilk yetenek paketini öğren: kırmızı daireler kaçılabilir saldırılardır.',
  'Dünya haritası (M) ile açılmış bölgeler arasında seyahat edebilirsin.',
  'Ayarlar menüsünden XP hızını değiştirebilirsin.',
];
