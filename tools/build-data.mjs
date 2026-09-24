// Converts the GDD design pack (design/*.csv|json|md) into js/data/gdd.js.
// Run: node tools/build-data.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const D = join(ROOT, 'design');

const read = (p) => readFileSync(join(D, p), 'utf8').replace(/^\uFEFF/, '');

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const csv = (p) => parseCSV(read(p));
const num = (v) => (v === '' || v == null ? 0 : Number(v));

// ---------- Classes ----------
const CLASS_IDS = ['Knight', 'Berserker', 'Assassin', 'Ranger', 'Mage', 'Priest'];
const summary = Object.fromEntries(csv('03_CLASSES/class_summary.csv').map((r) => [r.class, r]));
const classes = {};
for (const id of CLASS_IDS) {
  const cfg = JSON.parse(read(`03_CLASSES/${id}/class_config.json`));
  const ranked = csv(`03_CLASSES/${id}/skills_ranked.csv`);
  const passives = csv(`03_CLASSES/${id}/passives.csv`);
  const skillIds = [...new Set(ranked.map((r) => r.skill_id))];
  const skills = skillIds.map((sid) => {
    const ranks = ranked.filter((r) => r.skill_id === sid);
    const r1 = ranks[0];
    return {
      id: sid,
      name: r1.name,
      unlock: num(r1.unlock_level),
      type: r1.type,
      desc: r1.description,
      hitbox: r1.hitbox,
      cc: r1.cc_status,
      threat: r1.threat,
      pvp: r1.pvp_rule,
      ranks: ranks.map((r) => ({ coef: num(r.power_coefficient), cd: num(r.cooldown_s), cost: num(r.resource_cost) })),
    };
  });
  classes[id] = {
    id,
    role: cfg.role,
    resource: cfg.resource,
    weapon: cfg.weapon,
    armor: cfg.armor,
    primary: cfg.primary,
    secondary: cfg.secondary,
    color: cfg.color,
    identity: cfg.identity || summary[id]?.identity,
    skills,
    passives: passives.map((p) => ({
      id: p.passive_id || p.id,
      name: p.name || p.passive,
      unlock: num(p.unlock_level || p.unlock),
      effect: p.effect,
    })),
  };
}

// ---------- Progression ----------
const levels = csv('02_GAME_DESIGN/level_1_100.csv').map((r) => ({
  level: num(r.level),
  xpNext: num(r.xp_to_next),
  total: num(r.cumulative_xp),
  stat: num(r.stat_points),
  skill: num(r.skill_points),
  mastery: num(r.mastery_points),
  tier: r.target_gear_tier,
  unlock: r.major_unlock,
}));

// ---------- Regions ----------
const regionRows = csv('05_WORLD_MAPS/regions.csv');
const mapFiles = Object.fromEntries(
  readdirSync(join(D, '05_WORLD_MAPS'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const j = JSON.parse(read(`05_WORLD_MAPS/${f}`));
      return [j.name, j];
    }),
);
const regions = regionRows.map((r) => {
  const m = mapFiles[r.region] || {};
  return {
    id: m.map_id,
    name: r.region,
    min: num(r.min_level),
    max: num(r.max_level),
    theme: r.theme,
    content: r.content,
    boss: r.boss,
    map: {
      sizeTiles: m.size_tiles, tilePx: m.tile_size_px, layers: m.layers, safeHubs: m.safe_hubs,
      farmSlots: m.farm_slots, eliteZones: m.elite_zones, gatherNodes: m.gather_nodes,
      questNpcs: m.quest_npcs, dungeonEntries: m.dungeon_entries, worldBossArena: m.world_boss_arena,
    },
  };
});

// ---------- Monsters / Bosses ----------
const monsters = csv('07_MONSTERS_BOSSES/monsters.csv').map((r) => ({
  id: r.monster_id || r.id,
  name: r.name || r.monster,
  region: r.region,
  level: num(r.level),
  tier: r.tier,
  hp: num(r.base_hp),
  atk: num(r.base_attack),
  xpMult: num(r.xp_multiplier || r.xp_x || r.xp_mult),
  loot: r.loot_table,
  ai: r.ai_profile || r.ai,
}));
const bosses = csv('07_MONSTERS_BOSSES/bosses.csv').map((r) => ({
  id: r.boss_id, name: r.name, region: r.region, level: num(r.level), type: r.type,
  abilities: r.ability_package.split(',').map((s) => s.trim()),
}));

// Smoothed per-level averages of the GDD monster curves (normal tier), used to
// normalise individual HP/ATK values into solo-playable encounter numbers.
const curve = (key) => {
  const out = [0];
  for (let L = 1; L <= 100; L++) {
    let w = 0, s = 0;
    for (const m of monsters) {
      const d = Math.abs(m.level - L);
      if (d > 6) continue;
      const k = 1 / (1 + d);
      s += m[key] * k; w += k;
    }
    out.push(w ? Math.round(s / w) : out[L - 1]);
  }
  return out;
};

// ---------- Items ----------
const items = csv('08_ITEMS_LOOT/items.csv').map((r) => ({
  id: r.item_id, name: r.name, cls: r.class_restriction, slot: r.slot, rarity: r.rarity,
  req: num(r.required_level), atk: num(r.attack), def: num(r.defense), affix: r.affix_pool, asset: r.asset_key,
}));
const materials = csv('08_ITEMS_LOOT/materials_consumables.csv').map((r) => ({ id: r.id, name: r.name, type: r.type, source: r.source }));

// ---------- NPCs / Quests ----------
const npcs = csv('06_NPCS/npcs.csv').map((r) => ({ id: r.npc_id, name: r.name, region: r.region, role: r.role, tier: r.service_or_quest_tier }));
const mainQuests = csv('04_QUESTS/main_story_quests.csv').map((r) => ({
  id: r.quest_id, chapter: r.chapter, region: r.region, level: num(r.level), type: r.objective_type, prereq: r.prerequisite,
}));
const sideQuests = csv('04_QUESTS/side_quests.csv').map((r) => ({
  id: r.quest_id, region: r.region, level: num(r.level), type: r.objective_type,
}));

// ---------- Economy ----------
const recipes = csv('09_CRAFTING_ECONOMY/crafting_recipes.csv').map((r) => ({
  id: r.recipe_id, name: r.name, profession: r.profession, level: num(r.required_level), gold: num(r.gold_cost),
}));
const shop = csv('11_CASH_SHOP/cash_shop_catalog.csv').map((r) => ({
  id: r.shop_id, name: r.name, category: r.category, price: num(r.astral_crystal_price), policy: r.power_policy, duration: r.duration,
}));

// ---------- Dungeons (from master GDD table) ----------
const md = read('ASTRAYA_MASTER_GAME_DESIGN_DOCUMENT.md');
const dungeonBlock = md.split('| Instance | Lvl | Players | Final Boss | Mechanics |')[1].split('\n\n')[0];
const dungeons = dungeonBlock
  .split('\n')
  .filter((l) => l.startsWith('|') && !l.startsWith('| ---'))
  .map((l) => l.split('|').slice(1, -1).map((s) => s.trim()))
  .map(([name, lvl, players, boss, mech]) => ({ name, level: num(lvl), players: num(players), boss, mechanics: mech.split(',').map((s) => s.trim()) }));

const statusBlock = md.split('| Status | Effect | PvP Rule |')[1].split('\n\n')[0];
const statuses = statusBlock
  .split('\n')
  .filter((l) => l.startsWith('|') && !l.startsWith('| ---'))
  .map((l) => l.split('|').slice(1, -1).map((s) => s.trim()))
  .map(([name, effect, pvp]) => ({ name, effect, pvp }));

const data = {
  generated: new Date().toISOString().slice(0, 10),
  classes, levels, regions, monsters, bosses, items, materials, npcs, mainQuests, sideQuests,
  recipes, shop, dungeons, statuses,
  curves: { hp: curve('hp'), atk: curve('atk') },
};

const out = `// AUTO-GENERATED by tools/build-data.mjs from design/ — do not edit by hand.\nexport const GDD = ${JSON.stringify(data)};\n`;
writeFileSync(join(ROOT, 'js', 'data', 'gdd.js'), out);
console.log(`gdd.js: ${CLASS_IDS.length} classes, ${monsters.length} monsters, ${items.length} items, ${dungeons.length} dungeons, ${(out.length / 1024).toFixed(0)} KB`);
