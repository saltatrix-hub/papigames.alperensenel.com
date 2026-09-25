/** Maps gear / consumables / skills onto 7Soul (CC0) 496 RPG icons. */
export const ICONS = 'assets/sprites/icons/';

const R = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4, Mythic: 5 };

const WEP = {
  Knight: { p: 'W_Sword', d: 3, max: 22, gold: 'W_Gold_Sword.png' },
  Berserker: { p: 'W_Axe', d: 3, max: 14, gold: 'W_Gold_Axe.png' },
  Assassin: { p: 'W_Dagger', d: 3, max: 21, gold: 'W_Gold_Dagger.png' },
  Ranger: { p: 'W_Bow', d: 2, max: 17, gold: 'W_Gold_Bow.png' },
  Mage: { p: 'W_Staff', d: 2, max: 8 },
  Priest: { p: 'W_Mace', d: 3, max: 14, gold: 'W_Gold_Mace.png' },
};

const SLOTS = {
  Head: ['C_Elm01.png', 'C_Elm03.png', 'C_Elm04.png', 'C_Hat01.png', 'C_Hat02.png'],
  Chest: ['A_Armour01.png', 'A_Armour02.png', 'A_Armour03.png', 'A_Armor04.png', 'A_Armor05.png', 'A_Clothing01.png'],
  Gloves: ['W_Fist001.png', 'W_Fist002.png', 'W_Fist003.png', 'W_Fist004.png', 'W_Fist005.png'],
  Legs: ['A_Clothing01.png', 'A_Clothing02.png', 'A_Armour02.png'],
  Boots: ['A_Shoes01.png', 'A_Shoes02.png', 'A_Shoes03.png', 'A_Shoes04.png', 'A_Shoes05.png', 'A_Shoes06.png', 'A_Shoes07.png'],
  Cape: ['A_Clothing02.png', 'A_Armor05.png'],
  Necklace: ['Ac_Necklace01.png', 'Ac_Necklace02.png', 'Ac_Necklace03.png', 'Ac_Necklace04.png', 'Ac_Necklace05.png', 'Ac_Necklace06.png', 'Ac_Necklace07.png', 'Ac_Necklace08.png'],
  Ring: ['Ac_Ring01.png', 'Ac_Ring02.png', 'Ac_Medal01.png', 'Ac_Medal02.png', 'Ac_Medal03.png'],
};

const MAT = {
  MAT_COPPER: 'E_Metal01.png', MAT_IRON: 'E_Metal05.png', MAT_SKYIRON: 'I_Crystal01.png',
  MAT_HERB: 'I_Leaf.png', MAT_VOID: 'I_Crystal03.png',
  POT_HP_S: 'P_Red01.png', POT_MP_S: 'P_Blue01.png', FLASK_POWER: 'P_Orange01.png',
  SCROLL_PROTECT: 'I_Scroll.png', FOOD: 'I_C_Meat.png',
};

const GLYPH = {
  dash: 'S_Wind01.png', shield: 'S_Holy01.png', aoe: 'S_Fire01.png', cone: 'S_Fire03.png',
  strike: 'S_Sword01.png', bolt: 'S_Magic01.png', buff: 'S_Buff01.png', heal: 'S_Holy03.png',
  chain: 'S_Thunder01.png', ground: 'S_Earth01.png', stealth: 'S_Shadow01.png',
  mark: 'S_Bow01.png', taunt: 'S_Physic01.png', leap: 'S_Wind03.png', ultimate: 'S_Holy10.png',
};

function file(name) { return name ? ICONS + name : null; }

function pick(list, seed = 0) {
  if (!list?.length) return null;
  return list[Math.abs(seed | 0) % list.length];
}

export function itemPng(item) {
  if (!item) return null;
  if (MAT[item.id]) return file(MAT[item.id]);
  if (item.kind === 'potion' || item.kind === 'flask') {
    if (item.id === 'POT_MP_S') return file('P_Blue01.png');
    if (item.id === 'FLASK_POWER') return file('P_Orange01.png');
    if (item.id === 'FOOD') return file('I_C_Meat.png');
    return file('P_Red01.png');
  }
  if (item.kind === 'scroll') return file('I_Scroll.png');
  if (item.kind === 'quest') return file('I_Key01.png');
  if (item.kind === 'material') return file('E_Metal01.png');
  const r = R[item.rarity] || 0;
  if (item.slot === 'MainHand') {
    const spec = WEP[item.cls] || WEP.Knight;
    if (r >= 4 && spec.gold) return file(spec.gold);
    const n = Math.min(spec.max, 1 + r * 3);
    return file(spec.p + String(n).padStart(spec.d, '0') + '.png');
  }
  if (SLOTS[item.slot]) return file(pick(SLOTS[item.slot], r + (item.ilvl || 0) + (item.id || '').length));
  return null;
}

export function skillPng(skill) {
  if (!skill) return null;
  return file(GLYPH[skill.glyph] || 'S_Sword01.png');
}

export function slotPng(slot) {
  return file(SLOTS[slot]?.[0] || (slot === 'MainHand' ? 'W_Sword001.png' : 'A_Armour01.png'));
}
