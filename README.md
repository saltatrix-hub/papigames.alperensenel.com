# ASTRAYA

PAPI Games · top-down 2D MMORPG client, built from the master game design document.

**Play:** [papigames.alperensenel.com](https://papigames.alperensenel.com)

Nine celestial seals hold the Abyss at bay. You wake in Dawnwatch Village as the earth begins to glow violet. Six classes. Level 1–100. Nine regions. The Second Dawn.

## Play

Open `index.html` via any static server (GitHub Pages, or `npx serve`). The browser client is self-contained — no backend.

- **WASD / arrows** move · **left click** attack · **right click** move / interact
- **1–8** skills · **Q / F** potions · **Shift** roll · **E** interact · **R** mount · **Tab** cycle target
- **C** character · **I** inventory · **K** skills · **J** quests · **M** map · **P** party · **O** settings

Three local save slots (right-click a slot to delete). Settings include XP rate for a shorter campaign.

## From the GDD

The client simulates the production design pack as a single-player MMO:

- Classes: Knight, Berserker, Assassin, Ranger, Mage, Priest — GDD skills, passives, resources
- Regions: Dawnwatch → Verdant Trail → Moonfen Marsh → Ashen Wastes → Ironroot Depths → Sunscar Desert → Celestine Ruins → Frostpeak Highlands → Abyss Gate
- Main story (Talk / Kill / Collect / Investigate / Defend / Escort / Activate / Boss) plus side quests
- Inventory, enhancement +1..+10, crafting, auction house, crystal shop (cosmetics only)
- Dungeons, raid wing (Eclipse Cathedral), 3v3 arena from level 30
- Companion hire (4-player party fantasy)

Design tables live in `design/`. Concept art is in `assets/art/`. HUD / inventory / storage frames are Kenney’s UI Pack RPG Expansion (CC0, [kenney.nl](https://kenney.nl)).

## Stack

Vanilla ES modules, Canvas 2D, Web Audio. No build step, no npm runtime dependency.
