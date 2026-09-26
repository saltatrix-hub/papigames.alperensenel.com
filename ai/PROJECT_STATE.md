# ASTRAYA Project State

Last reviewed: 2026-09-26

## Product

ASTRAYA is currently a browser-based, top-down 2D MMORPG-style game client / single-player MMO simulation based on the master GDD.

The playable site is deployed as a static client.

## Current technology

- Vanilla JavaScript ES modules
- Canvas 2D
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
- Canvas renderer
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
- contains class-specific static visual kits
- currently chooses many visual layers primarily by class kit rather than equipped item ID

`js/render/sprites.js`
- includes a procedural fallback character renderer
- contains class weapon/silhouette rendering logic

## Current visual-equipment limitation

Knight is on a data-driven visual path:

equipped item → `visualId` or ilvl tier → `js/data/characterVisuals.js` → LPC layer keys → `drawLpcHero`

Stats stay in `sumEquipment`. Other classes still use the static LPC class kits. Assassin also has a separate static 4-direction pack that is not part of this pipeline.

Production gaps (no fake art was added): Knight longsword sheets, slash shield, tier-10 armor/helmet, hit, death, and every skill-effect PNG. See `design/CHARACTER_ASSET_PRODUCTION_SPEC.md`.

## Current priority

Knight visual pipeline is in review. Do not start the other five classes until that review accepts the sword-sheet follow-up.

The modular equipment goal is unchanged:

- 4 directions
- walking animations
- class combat animations
- existing item/stat behavior
- existing save/load compatibility
