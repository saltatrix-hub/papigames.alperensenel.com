# ASTRAYA character asset production spec

Status: pipeline defined. Knight is the only class wired into the running renderer. Production art for hit, death, tier-5/10 weapons, and every skill effect is not in the repo.

The GDD sheet `design/class_sprite_spec.csv` asks for 96×96 and 8 directions. The playable client does not use that size. This spec follows the renderer that already ships.

## 1. Classes

Knight, Berserker, Assassin, Ranger, Mage, Priest.

Only Knight reads `js/data/characterVisuals.js`. The other five still use the static class kits in `js/render/lpc.js`. Assassin also has a separate static 4-direction pack under `assets/assassin/`; that pack is not part of this layered pipeline.

## 2. Animation states

Common, required later for every class: idle, walk, hit, death.

| Class | Combat states still required |
| --- | --- |
| Knight | sword slash, shield stance, shield attack, heavy sword attack, skill cast |
| Berserker | axe slash, heavy axe, overhead smash, rage, skill cast |
| Assassin | dagger slash, dual-dagger combo, stab, dash attack, skill cast |
| Ranger | bow idle, bow draw, arrow release, multi-shot, skill cast |
| Mage | spell cast, staff action, projectile cast, area cast, skill cast |
| Priest | holy cast, staff/mace action, heal cast, support cast, skill cast |

What the current LPC compositor can already play: walk-cycle (idle + walk) and one combat group per class (Knight/Berserker/Assassin slash, Ranger bow, Mage/Priest spellcast). Hit and death sheets do not exist.

## 3. Frame counts

Targets when new sheets are drawn. Do not redraw a state when a compatible LPC sheet already exists.

| State | Frames per direction | Existing LPC |
| --- | --- | --- |
| Idle | 4 | Walk sheet column 0 is used. No separate idle strip. |
| Walk | 8 | Walk sheet has 9 columns. Column 0 is idle. Columns 1–8 walk. |
| Basic melee | 6–8 | Slash sheet has 6 columns. |
| Bow | 8–13 | Bow sheet has 13 columns. |
| Spell cast | 7–8 | Spell sheet has 7 columns. Thrust sheet has 8. |
| Hit | 3–4 | Missing. |
| Death | 6–8 | Missing. One shared direction is acceptable for the first death sheet. |

## 4. Directions

Mandatory four directions. Game index order:

| Game dir | Facing | LPC row |
| --- | --- | --- |
| 0 | down / front | 2 |
| 1 | left | 1 |
| 2 | right | 3 |
| 3 | up / back | 0 |

LPC files store rows as up, left, down, right. `DIR_ROW` in `js/render/lpc.js` is `[2, 1, 3, 0]`.

Eight directions from the GDD are not implemented. Do not author 8-direction sheets until the renderer grows a diagonal index.

## 5. Sprite dimensions

| | Value |
| --- | --- |
| Source frame | 64×64 |
| Sheet layout | horizontal frames, 4 rows |
| Walk sheet | 576×256 (9×4) |
| Slash sheet | 384×256 (6×4) |
| Bow sheet | 832×256 (13×4) |
| Spell sheet | 448×256 (7×4) |
| Thrust sheet | 512×256 (8×4) |
| Drawn scale | `scale * 1.15` in world space |
| World hero scale | 1.2, so about 88px tall on screen |

`assets/sprites/lpc/slash192/WEAPON_longsword.png` is a 192px grid. It is not wired. Do not drop it into the 64px compositor.

## 6. Layer order

Bottom to top, for a Knight validation frame:

1. body
2. feet (`plateFeet`)
3. legs (`plateLegs`)
4. gloves
5. torso / armor
6. arms / shoulders
7. helmet
8. shield, walk only
9. weapon, slash only

Cape, hair, costume, and combat VFX sit outside this Knight slice. Skill effects are never a layer inside the character sheet.

## 7. Naming

Logical id, not a loose filename:

`{class}_{role}_t{tier}`

Examples: `knight_sword_t01`, `knight_armor_t05`, `knight_helmet_t10`, `knight_shield_t01`.

When a new sheet is exported as frames instead of an LPC strip:

`{class}_{role}_t{tier}_{action}_{direction}_{frame}`

Examples: `knight_sword_t05_attack_right_04.png`, `knight_armor_t01_walk_down_03.png`.

Directions in file names: `down`, `left`, `right`, `up`.

Effects:

`{class}_{effect}_{frame}`

Example: `knight_sword_arc_00.png`.

Tiers in this milestone: `t01`, `t05`, `t10`. Adding `t15` is a new manifest entry, not a renderer branch.

## 8. Equipment visual rules

Flow:

equipped item → `item.visualId` or `knight_{role}_tXX` from ilvl → `CHARACTER_VISUALS` → LPC layer keys → `drawLpcHero`

`js/data/characterVisuals.js` does not read `atk`, `def`, `hp`, affixes, or enhancement. `sumEquipment` does not read `visualId`.

Ilvl bands, only if `visualId` is absent: 1–4 → t01, 5–9 → t05, 10+ → t10.

A missing visual falls back to that role's t01. An unknown class falls back to the old class kit.

OffHand is not a stat slot. A shield visual can be attached with `eq.OffHand.visualId` without entering `GEAR_SLOTS`.

To change a look without a new `if` in the renderer, add a manifest entry and set `item.visualId`.

## 9. Weapon rules

Weapons are their own sheets, aligned to the same 64×64 grid and the same four rows as the body. A walk weapon and a slash weapon are different files. Knight idle currently has no sword sheet, so the blade appears only during slash.

Do not reuse the dagger sheet as a finished longsword. The current `knight_sword_t01` entry is marked `temporary-lpc` for that reason.

## 10. Skill effect rules

Effects live in `js/data/effectVisuals.js` and `assets/effects/`. They are not frames inside body or weapon sheets. No effect PNG has been drawn. Playback is intentionally not connected.

## 11. Sheet layout

One PNG per layer per animation group. Columns are frames. Rows are directions in LPC order: up, left, down, right. Transparent background. No baked equipment combinations.

## 12. Left / right

Left and right are separate rows. Do not mirror the whole knight. Weapons, shields, and shoulder plates are asymmetric. A future one-sided cape may be mirrored only after that layer is checked. The renderer does not flip LPC frames.

## 13. Export

- PNG, 64×64 cells, no padding between cells
- Same pixel size and row order for every layer that composites together
- Filter: nearest when drawn
- Do not premultiply against a background color

## 14. Transparency

Background alpha 0. No colored backdrop, no white matte, no drop shadow baked into the cell. The renderer draws its own ground shadow.

## 15. Anchor

Cell origin is the top-left of the 64×64 frame. Feet sit on the bottom of the cell. The compositor draws the cell at `(-32, -54)` in character space, then the bake canvas places the feet at `(48, 70)` inside a 96×84 cache. New layers must use that same feet line. Weapon grips must match the LPC hand in each column. Do not add a per-item pixel offset in the renderer.

## 16. Class checklists

Status words: Ready = sheet exists and is wired. Temporary = a different LPC sheet stands in and is labeled. Missing = not drawn. Not started = class not on this pipeline.

### Knight

| Need | Status |
| --- | --- |
| 4 directions | Ready, via LPC rows |
| Idle | Ready, walk column 0 |
| Walk | Ready, walk columns 1–8 |
| Sword attack | Temporary. Slash plays, but the weapon cell is the dagger sheet |
| Sword t01 / t05 / t10 | t01 temporary dagger. t05 missing. t10 missing. No idle sword. |
| Shield t01 / t05 / t10 | t01 walk-only shield cutout. Hidden during slash. t05 missing. t10 missing. |
| Helmet t01 / t05 / t10 | t01 plate helmet ready. t05 chain hood temporary. t10 missing. |
| Armor t01 / t05 / t10 | t01 plate torso+arms ready. t05 chain torso temporary. t10 missing. |
| Shield stance, shield attack, heavy attack | Missing |
| Hit, death | Missing |
| Skill effects sword_arc, shield_burst, ground_impact | Missing |

### Berserker

| Need | Status |
| --- | --- |
| 4-direction walk and slash body | Not started on the manifest. Class kit still uses leather + dagger. |
| Axe t01 / t05 / t10 | Missing |
| Heavy axe, smash, rage | Missing |
| Hit, death | Missing |
| Effects heavy_slash, rage_aura, ground_smash | Missing |

### Assassin

| Need | Status |
| --- | --- |
| Layered LPC pipeline | Not started |
| Static 4-direction full character | Separate pack in `assets/assassin/`. No walk cycle, no equipment swap. |
| Dagger tiers, dual combo, stab, dash | Missing as layered sheets |
| Hit, death | Missing |
| Effects dark_slash, dash_smoke, poison_hit | Missing |

### Ranger

| Need | Status |
| --- | --- |
| Layered pipeline | Not started. Class kit uses bow sheets. |
| Bow t01 / t05 / t10 | Missing as separate tier sheets. One LPC bow exists inside the class kit. |
| Draw, release, multi-shot | Not split into manifest states |
| Hit, death | Missing |
| Effects arrow_trail, multishot, wind_arrow | Missing |

### Mage

| Need | Status |
| --- | --- |
| Layered pipeline | Not started. Class kit uses spellcast robe. |
| Staff tiers | Missing. One LPC staff exists on the thrust sheet and is not the mage kit weapon. |
| Projectile cast, area cast | Missing as separate sheets |
| Hit, death | Missing |
| Effects fire_projectile, frost_burst, arcane_explosion | Missing |

### Priest

| Need | Status |
| --- | --- |
| Layered pipeline | Not started. Class kit uses spellcast robe. |
| Mace / tome tiers | Missing |
| Heal cast, support cast | Missing as separate sheets |
| Hit, death | Missing |
| Effects heal_glow, holy_circle, light_pillar | Missing |

## How to add a sword without editing the renderer

1. Export `walkcycle` and `slash` 64×64 sheets with the four LPC rows.
2. Register the layer key in `LAYERS` only if the file is new.
3. Add `knight_sword_t15` to `CHARACTER_VISUALS` with `walk` and `slash` key lists.
4. Set `item.visualId = 'knight_sword_t15'` on the gear instance.

No item-id branch belongs in `drawLpcHero`.
