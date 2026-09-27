# Latest AI Developer Handoff

Devam notu: her işten sonra `EN SON YAPILANLAR.txt` güncellenir (oyun kökü ve tasarım klasörü). Sonraki oturum önce o dosyayı okur.

## 2026-09-27 — Published to main

All local work through `town22` is merged into `main` and pushed, which deploys GitHub Pages. The nightly branch `ai/nightly-20260926-114830` is the second parent of the merge. `Astraya 3D/` and `EN SON YAPILANLAR.txt` stay local and untracked.

## 2026-09-27 — Damage bar, signature skills, creator, hoods

The overhead HP bar that appears while hurt is a short thin strip under the name. Each class has two signature skills pinned to the front of the hotbar: Şafak Mızrağı / Yemin Halkası, Kızıl Tırpan / Kemik Çatlağı, Gölge Çiçeği / Ay Dilimi, Rüzgâr Yarığı / Giz Perdesi, Yıldız Mührü / Buz Aynası, Altın Hale / Günah Alevi. The title screen picks hair, brows, skin, eye color, and height, and the bust preview follows. Ranger wears a green stealth hood. Priest wears a white cowl and a priest hat. Faces stay visible. Module URL is `js/main.js?v=town22`. Not published.

## 2026-09-26 — Ground texture

The world ground is no longer per-pixel noise. Grass uses broad patches and fine streaks, roads and plazas are cobbles with a dirt shoulder, and water has a shore plus a soft ripple. A roughness map keeps grass matte, stone a little harder, and water shiny. Module URL is `js/main.js?v=town20`. Not published.

## 2026-09-26 — Names sit on the characters

Nameplates anchor to the top of each model instead of a fixed height of 2.35. The name and job are drawn at the bottom of the label, so the gap between the head and the text is gone. Module URL is `js/main.js?v=town19`. Not published.

## 2026-09-26 — Real minimap, quest right-click, sharp class cards

The HUD minimap draws `map.minimap` (ground, water, roads, plazas, buildings) and keeps player, NPC, monster, and quest markers on top. Right-click on the tracker or the quest journal walks to the step target: talk NPCs are approached, kill steps chase the nearest living mob and auto-attack, other steps walk to the object or the portal toward that region. Title class cards are 480×360 3D busts of the live costumes, not the 128px JPEGs. Module URL is `js/main.js?v=town18`. Not published.

## 2026-09-26 — Environment models

Cone trees and dodecahedron rocks are replaced with KayKit medieval trees, rocks, log piles, flags, and barrels (CC0). Roads read as a worn stone center with a dark dirt edge. Chests use a chest model and waystones use a stone column. Module URL is `js/main.js?v=town16`. Not published.

## 2026-09-26 — Faces restored, horror wash removed

Class previews no longer bleach or black out the face. Knight, berserker, ranger, mage, and priest keep their painted skin and hair. The assassin uses the unhooded rogue: a visible face, a dark suit, a cape, and two knives. The character-select light hits the face. Module URL is `js/main.js?v=town15`. Not published.

## 2026-09-26 — Premium class costumes

The six class models keep their KayKit folds and get a real palette instead of a flat color wash. Knight is silver plate with a crimson cape. Berserker keeps the fur hat and great axe. Assassin is a black hooded suit with a darkened face, cape, and knives. Ranger is a gold dress with pale skin, a white cape, and a crossbow. Mage stays violet with the pointed hat and staff. Priest is a clean white robe and book, with no mage hat. Module URL is `js/main.js?v=town13`. Not published. There is no separate female mesh; the ranger uses the mage body in the princess colors.

## 2026-09-26 — Class looks and tight NPC jobs

NPC job text sits on the line directly under the name. Assassin is a black hooded male with a cape and a covered face. Ranger wears a pale gold dress, white skin, and a crossbow. Priest is a white robe with a book and no mage hat. Module URL is `js/main.js?v=town7`. Not published.

## 2026-09-26 — NPC job under the name

NPC nameplates draw the Turkish role under the name: Demirci, Depocu, Tüccar, Şifacı, and the rest. Monsters and the player keep a single line. Module URL is `js/main.js?v=town4`. Not published.

## 2026-09-26 — Medieval buildings

Village and camp buildings use KayKit medieval models (CC0) instead of box houses. Dawnwatch maps each service to its own building: barracks, blacksmith, cottage, market, tavern, castle, church, archery yard, and a second cottage. Camp hubs use the medieval tent. Doors face the plaza. Module URL is `js/main.js?v=town3`. Not published.

## 2026-09-26 — Unique NPCs, mobs outside the village

Each NPC uses its own KayKit loadout (body plus hat, cape, weapon, or shield). Dawnwatch spawns one named person per role: Mayor Elric, Smith Rowan, Priestess Mina, Scout Lysa, and one each of trainer, alchemist, auctioneer, storage, guild, stable, stylist, and merchant. Other regions spawn each story NPC once and one NPC per service. Hats, helmets, and capes stay hidden unless that loadout lists them.

Village monster farms start further down the east road. Spawns inside 27 tiles of the Dawnwatch fountain are rejected, so boars and other mobs are not beside the houses. Ambient heroes stand on the road out of town, not in the plaza.

Module URL is `js/main.js?v=town1`. Not published.

## 2026-09-26 — Astraya 3D folder

`Astraya 3D/` is a full copy of the client. Same combat, quests, classes, and story. The world view uses a side-isometric camera (42° above the horizon, 48° from the side) and CC0 KayKit models: green medieval buildings, trees, rocks, props, dungeon chests, and skeleton monsters. Character glTF files stay in `assets/models/`. Served locally from that folder on port 8795.

WASD and arrows move relative to that camera. Up goes into the screen, down comes toward the camera, left and right strafe across the screen. Click-to-move stays in world space. The mouse wheel dollies the camera in and out. Shift plus the wheel raises and lowers the camera pitch.

Published to `main` and `gh-pages` as `c09bd02`. Live site: https://papigames.alperensenel.com/ — hard refresh with Ctrl+F5. Module URL is `js/main.js?v=cam3`.

## 2026-09-26 — Isometric 3D world

The world canvas is a Three.js scene: pitched camera, directional light, soft shadows, baked ground, block buildings, and KayKit characters (Knight, Barbarian, Mage, Rogue, Rogue Hooded) for the six classes. Click-to-move uses a ground-plane ray. Title preview and the HUD portrait use the same models.

Files: `js/render/view3d.js`, `js/render/renderer.js`, `js/vendor/`, `assets/models/`, `index.html`, `js/ui/ui.js`.

Known limits: environment is stylized block geometry, not a hand-built Lost Ark map. Monsters are chosen from the creature name: Field Boar is a pig, rats, wolves, stags, spiders, slimes, snakes, and crows use their own models. Bandits, knights, witches, and similar roles use the class characters. Nameplates stay a fixed screen size and are larger. Crow model is CC-BY 3.0 via Poly Pizza. Module URL is `js/main.js?v=look8`. Not published yet.

## 2026-09-26 — Class identity scope clarified

The intended art sequence is now explicit:

1. Use the existing Assassin chibi pack as the style/modularity benchmark.
2. Create matching four-direction chibi identities for Knight, Berserker, Ranger,
   Mage, and Priest, using the existing `assets/art/class_*_sheet.jpg` identity art.
3. After human approval, split each into body, hair, helmet, armor, main/offhand,
   back/wing/cape, and costume layers.
4. Only then author walk and basic-attack animation sheets.

The machine-readable plan is `design/class_chibi_asset_plan.json`. The runtime
LPC animation baseline remains useful as a playable fallback while production art is
created. Built-in image generation is currently blocked by account usage quota, so no
new class PNG was falsely marked complete.

---

## 2026-09-26 — Six-class animation baseline

The user explicitly expanded the visual milestone from Knight-only to all six classes.
Every playable class now resolves through `js/data/characterVisuals.js` and the existing
four-direction LPC compositor:

- Knight, Berserker, Assassin: slash
- Ranger: bow
- Mage, Priest: spellcast

Assassin keeps its dedicated chibi renderer as the running visual reference. Its
current directional art has an expanded dual-dagger attack treatment, but walking is
still motion applied to static direction art rather than a full authored walk sheet.
The shared LPC descriptor remains its fallback. The canonical Assassin source/reference
folders are present; the old duplicate `Base/Equipment/SOURCE_SHEETS` hierarchy was
not restored.

`tools/character_animation_preview.html` renders all six classes, all four directions,
walk and basic attack side by side. It loaded in a real browser with no console errors.
`design/class_animation_matrix.json` records the production targets for Assassin-style
replacement art. Those replacement sheets do not exist yet and must remain candidates
until human visual review.

The first built-in image-generation attempt for the Berserker four-direction style
reference was rejected by the service with `usage_limit_reached`. No partial or fake
art was committed. Resume candidate generation after the image quota resets; the
runtime LPC baseline does not depend on that external step.

Validation:

- `python tools/validate_static_client.py` — PASS (26 JavaScript files)
- Node resolver check — all six classes returned non-empty walk/attack layers and the
  expected slash/bow/spell action
- Browser preview — all class/direction cells rendered; no console warnings/errors

---

## 2026-09-26 — Knight longsword candidates generated

Two non-production candidates now exist under `assets/generated_candidates/`:

- Walk: built-in image generation with LPC references, normalized to 576×256
  (9×4 cells at 64×64).
- Slash: nearest-neighbor derivation from the existing transparent LPC
  `slash192/WEAPON_longsword.png`, normalized to 384×256 (6×4 cells at 64×64).

Both files are RGBA with transparent pixels and pass exact dimension checks. Two
AI-generated slash attempts added a gray translucent backdrop; one rejected example
is retained under `assets/generated_candidates/rejected/` for audit.

The queue is `candidate`, not `promoted`. Human review is still required for grip
alignment, row direction, frame timing, silhouette, and slash arcs. Production target
paths and `CHARACTER_VISUALS.knight_sword_t01` remain unchanged; the dagger fallback
is still active.

---

## 2026-09-26 — VIS-KNIGHT-SWORD-001 requirement queue

Task completed: created the production requirement and one active asset-queue job for missing `knight_sword_t01` walk-cycle and slash longsword PNG sheets. No artwork generated. No renderer, manifest, or gameplay files changed. The temporary dagger stand-in is still in use and is not marked resolved.

### Files changed

- `design/character_asset_requirements.json` — requirement `REQ-KNIGHT-SWORD-T01-SHEETS`
- `ai/ASSET_QUEUE.json` — single active job `JOB-KNIGHT-SWORD-T01-SHEETS`
- `ai/TASKS.md` — checklist progress for VIS-KNIGHT-SWORD-001
- `ai/HANDOFF.md` — this handoff

### Behavior added

- Walk target: `assets/characters/knight/weapons/knight_sword_t01_walk.png` at 576×256 (9×4 of 64×64)
- Slash target: `assets/characters/knight/weapons/knight_sword_t01_slash.png` at 384×256 (6×4 of 64×64)
- Rows: `up`, `left`, `down`, `right`; mirroring prohibited
- Transparent PNG, existing LPC feet line, per-frame sword-grip alignment
- Generated output marked `unvalidated_candidate` requiring human visual review
- Queue records temporary dagger stand-in; manifest rewire blocked until both sheets validate

### Tests / checks

- JSON parse of both new files (stdlib `json`) — OK
- `python tools/validate_static_client.py` — PASS (26 JavaScript files)

### Known problems / blockers

- Production longsword PNGs do not exist yet.
- `knight_sword_t01` still maps slash to the temporary dagger layer.
- Manifest rewiring must wait until both candidate sheets pass human visual review.

### Recommended next task

Generate candidate PNGs for the two target paths in `JOB-KNIGHT-SWORD-T01-SHEETS` (or hand-author them), then run human visual review against `REQ-KNIGHT-SWORD-T01-SHEETS`. Do not rewire `characterVisuals.js` and do not start another class.

---

## 2026-09-26 — AI collaboration setup

The current mixed Knight/Assassin workspace was preserved in commit `6b02878` on
`codex/ai-collaboration-setup`. Intentional Assassin asset deletions were retained.

Cursor Agent CLI is installed. The overnight orchestrator now points at the correct
repository root, invokes Cursor in non-interactive force mode under explicit deny
rules, runs `tools/validate_static_client.py`, and sends the full latest commit diff
plus validation output to the OpenAI reviewer.

Validation passed for 26 JavaScript files. Cursor Agent CLI and Codex CLI are both
authenticated. A structured Codex smoke test returned valid schema-constrained JSON
through the stored ChatGPT login. The first run is limited to two tasks, no automatic
push, and no automatic asset promotion.

The first end-to-end task completed on `ai/nightly-20260926-112423`. Codex selected
the Knight t01 longsword requirement queue, Cursor implemented it, and Codex rejected
two incomplete validator designs before issuing PASS. The accepted nightly branch is
at commit `424b17e`; it was not pushed and was not merged into this setup branch.

Dry-run fixes retained in the setup branch:

- Windows resolves the full `agent.cmd` path.
- Project `.cursor/cli.json` uses the project-only permission schema.
- Large Codex prompts use stdin to avoid the Windows command-length limit.
- Cursor tasks use an ignored workspace prompt file to avoid `.cmd` argument loss.
- Reviews can resume against a specific commit.

---

Status: Knight visual pipeline ready for review. Other classes were not implemented.

## Summary

The character asset pipeline is now specified and Knight is the only class on it. Equipped Knight items resolve to a visual id, then to LPC layer keys, then to the existing compositor. Item stats are not read by that resolver. Missing production art is listed instead of being replaced with unrelated drawings.

Hit, death, skill-effect playback, and Berserker / Assassin / Ranger / Mage / Priest were not started.

## Files changed (prior Knight slice)

- `js/data/characterVisuals.js` — Knight visual manifest and resolver
- `js/data/effectVisuals.js` — effect ids, all marked missing
- `js/render/lpc.js` — optional `opts.visual` layer list; walk-cycle shield key
- `js/render/renderer.js` — player Knight passes the resolved visual into `drawHero`
- `js/ui/ui.js` — portrait uses the same visual id
- `design/CHARACTER_ASSET_PRODUCTION_SPEC.md` — six-class production spec and checklists
- `assets/characters/knight/README.txt` — points at LPC sources, no new PNGs
- `assets/effects/README.txt` — effects are not drawn
- `ai/PROJECT_STATE.md`
- `ai/TASKS.md`
- `ai/DECISIONS.md`
- `ai/HANDOFF.md`

## Existing assets reused

LPC 64×64 sheets already in `assets/sprites/lpc/`:

- Walk and slash: `BODY_male` / `BODY_human`, plate feet, plate legs, plate gloves, plate torso, plate arms, plate helmet, chain torso, chain hood
- Walk only: `walkcycle/WEAPON_shield_cutout_body.png`
- Slash only: `slash/WEAPON_dagger.png` as a temporary sword cell

Not used: `slash192/WEAPON_longsword.png` (192px grid, wrong size).

The separate `assets/assassin/` pack was left as-is. It is not part of this pipeline.

## Missing assets

Knight:

- Real longsword sheets at 64×64 for walk and slash (`knight_sword_t01` is the dagger sheet)
- `knight_sword_t05`, `knight_sword_t10`
- Slash-cycle shield (walk shield disappears during the attack)
- `knight_shield_t05`, `knight_shield_t10`
- Dedicated tier-5 plate armor and helmet (chain torso / chain hood are labeled stand-ins)
- `knight_armor_t10`, `knight_helmet_t10`
- Shield stance, shield attack, heavy attack
- Hit and death
- `knight_sword_arc`, `knight_shield_burst`, `knight_ground_impact`

Every other class still needs its own layered sheets, tier weapons, hit, death, and the effects named in `js/data/effectVisuals.js`. No effect PNG exists.

## Knight validation

Checked in the running client at `http://127.0.0.1:8791/`:

- Page loads. `window.__bindErr` and `window.__loopErr` stayed null after starting a Knight and after setting `eq.Chest.visualId` / `eq.Head.visualId`.
- Chest `atk` stayed 0 when the visual id changed, so the look path did not write stats.
- Resolver unit check: t01 walk includes `plateTorso` and `shield`; slash includes `dagger`. Swapping armor/helmet visual ids removes `plateTorso`, adds `chain` and `chainHood`, and changes the cache id. A t10 sword id falls back to the t01 dagger keys. Mage returns null.

Directions and animations that the wired layers support:

- Down, left, right, up — existing LPC rows, not a new mirror
- Idle — walk sheet column 0
- Walk — walk sheet columns 1–8
- Sword attack — slash sheet, 6 frames, dagger art

Not checked as separate animations because the sheets do not exist: hit, death, shield bash, heavy swing.

## Equipment change

`resolveCharacterVisual('Knight', eq)` reads `item.visualId` when present. Otherwise it maps ilvl to t01 / t05 / t10. The renderer only receives `{ id, walk, slash }`. Adding a sword means a new manifest entry plus `item.visualId`. No `if (item.id === ...)` belongs in `drawLpcHero`.

OffHand is visual-only. It is not in `GEAR_SLOTS`, so a shield does not add defense unless a real item already does.

## Architecture

equipped item → visual id → `CHARACTER_VISUALS` → LPC layer keys → bake cache id → `drawLpcHero`

Skill effects stay in `EFFECT_VISUALS`. They are not composited into the character bake. Playback is not connected, because the files are missing.

## Known limitations

- Attack weapon art is a dagger, labeled temporary.
- Shield is walk-only.
- Tier 5 armor/helmet are chain stand-ins, labeled temporary.
- Tier 10 pieces fall back to tier 1.
- Other classes are unchanged.
- Portrait refreshes when the visual id changes. It still shows the down-facing idle frame only.

## Verification

- [x] page loads
- [x] no new console/import errors on load or after a Knight start
- [x] four directions use the existing LPC row map
- [x] walk and idle use the walk sheet
- [x] slash attack still runs
- [x] equipment stats unchanged when visual id changes
- [ ] save/load of `visualId` not separately tested (the field is optional and is not stripped if present on the item object)

## Review notes for ChatGPT

`opts.visual` forces the slash group even though Knight already used slash. The bake cache key includes the visual id, so old class-kit frames are not reused for a geared Knight. Assassin still returns early in `drawHero` and never reaches this path.

## Next recommended task

Generate/validate the two `knight_sword_t01` candidate sheets listed in `ai/ASSET_QUEUE.json`. Do not rewire the dagger stand-in until both pass human review. Do not start Berserker.
