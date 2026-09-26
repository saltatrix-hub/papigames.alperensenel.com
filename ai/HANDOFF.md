# Latest AI Developer Handoff

## 2026-09-26 — AI collaboration setup

The current mixed Knight/Assassin workspace was preserved in commit `6b02878` on
`codex/ai-collaboration-setup`. Intentional Assassin asset deletions were retained.

Cursor Agent CLI is installed. The overnight orchestrator now points at the correct
repository root, invokes Cursor in non-interactive force mode under explicit deny
rules, runs `tools/validate_static_client.py`, and sends the full latest commit diff
plus validation output to the OpenAI reviewer.

Validation passed for 26 JavaScript files. The remaining setup blocker is Cursor CLI
authentication. After login, the first run should use two tasks, no automatic push,
and no automatic asset promotion.

---

Status: Knight visual pipeline ready for review. Other classes were not implemented.

## Summary

The character asset pipeline is now specified and Knight is the only class on it. Equipped Knight items resolve to a visual id, then to LPC layer keys, then to the existing compositor. Item stats are not read by that resolver. Missing production art is listed instead of being replaced with unrelated drawings.

Hit, death, skill-effect playback, and Berserker / Assassin / Ranger / Mage / Priest were not started.

## Files changed

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

Draw one real 64×64 Knight longsword sheet pair (walk-cycle and slash, four LPC rows) and point `knight_sword_t01` at those files so the dagger stand-in can be removed.

Stop here. Do not start Berserker.
