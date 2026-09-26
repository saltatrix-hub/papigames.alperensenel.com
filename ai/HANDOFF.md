# Latest AI Developer Handoff

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
