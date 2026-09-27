# ASTRAYA Project State

Last reviewed: 2026-09-26

## Product

ASTRAYA is a browser MMORPG client. The world is an isometric 3D scene; combat, quests, inventory, and saves are the existing simulation.

The playable site is deployed as a static client. Local module URL is `js/main.js?v=town22` (thin damage bars, signature skills, character creator, ranger hood, priest hat). That build is not published.

## Current technology

- Vanilla JavaScript ES modules
- Three.js r170 world view (vendored, no build step)
- Canvas 2D for the minimap and item icons
- Web Audio
- Static HTML/CSS/JS
- LocalStorage saves
- No production backend in the current client
- No runtime npm dependency / build step

## Major existing systems

### Game
- Six classes: Knight, Berserker, Assassin, Ranger, Mage, Priest
- Level progression
- Stats
- Skills and passives
- Combat
- NPCs and monsters
- Quests
- Regions / world
- Dungeons / raid concepts
- Party companions
- Arena simulation
- Mount state
- Achievements / play statistics

### Economy / items
- Inventory
- Storage
- Equipment slots
- Generated gear instances
- Item rarity
- Affixes
- Enhancement
- Loot
- Crafting
- Merchant pricing
- Auction simulation
- Crystal/cosmetic shop concepts

### Rendering
- Three.js world view with KayKit heroes, medieval buildings, named NPC loadouts, creature monsters, and skill effects
- Procedural fallback hero rendering
- LPC layered character rendering
- LPC four-direction animation rows
- Walk and combat animation groups
- Prebaked layered frames

## Important implementation facts

`js/game/game.js`
- owns main runtime state
- creates / loads the player
- stores equipped items in `game.eq`
- saves equipment to LocalStorage
- recalculates player stats from equipment

`js/game/items.js`
- defines gear slots
- creates gear instances
- calculates equipment stats
- handles inventory and loot systems

`js/render/lpc.js`
- already composites character layers
- supports 4 directions
- plays data-driven class actions: slash, bow, and spellcast
- accepts one shared `{ walk, attack, action }` descriptor for every playable class

`js/render/sprites.js`
- includes a procedural fallback character renderer
- contains class weapon/silhouette rendering logic

## Current visual-equipment limitation

All six classes are now on the same data-driven base-animation path:

class + equipped item → `visualId` or class default → `js/data/characterVisuals.js` → LPC layer keys + action group → `drawLpcHero`

Stats stay in `sumEquipment`. Knight/Berserker/Assassin fallbacks use slash, Ranger
uses bow, and Mage/Priest use spellcast. Assassin keeps its dedicated chibi renderer
and dual-dagger attack as the current art-direction reference; its walk is still a
motion treatment over static directional art, not a full frame-authored walk cycle.

Production gaps: Knight longsword candidate sheets now exist but are not promoted;
slash shield, tier-10 armor/helmet, hit, death, and every skill-effect PNG remain
missing. See `design/CHARACTER_ASSET_PRODUCTION_SPEC.md`.

## Current priority

Finish the five missing class identities in the same chibi/modular art direction as
the Assassin pack. Existing `assets/art/class_*_sheet.jpg` files define each class's
identity; `assets/assassin/` defines the target chibi rendering and modular export
structure. Approve four-direction class turnarounds before producing equipment layers
or animation sheets. Generated art remains candidate-only until human review.

The modular equipment goal is unchanged:

- 4 directions
- walking animations
- class combat animations
- existing item/stat behavior
- existing save/load compatibility

## AI collaboration automation

An opt-in local overnight orchestrator lives under
`astraya-ai-orchestrator/astraya-ai-orchestrator/`.

- ChatGPT-authenticated Codex selects and reviews one bounded task at a time.
- Cursor Agent CLI performs implementation work on an isolated nightly branch.
- The reviewer receives the actual commit patch and deterministic validation output.
- `tools/validate_static_client.py` checks JavaScript syntax and relative ES module paths.
- Generated art remains a candidate unless explicitly promoted.
- Automatic merge to `main` is not allowed.

Cursor Agent CLI and Codex CLI are authenticated. Platform API credit is required only
for optional image-candidate generation, not for task direction or code review.
