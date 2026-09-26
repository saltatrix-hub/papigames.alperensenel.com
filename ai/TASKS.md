# ASTRAYA Tasks

## IN PROGRESS

### VIS-CLASS-IDENTITY-001 — Five missing Assassin-style chibi class packs

- [x] Confirm the Assassin pack as the shared chibi/modular style reference.
- [x] Map existing class identity sheets for Knight, Berserker, Ranger, Mage, and Priest.
- [x] Define swappable slots: body, hair, helmet, armor, weapons/offhand, back/wing/cape, costume.
- [x] Record class palettes, weapons, layer order, and production order in `design/class_chibi_asset_plan.json`.
- [ ] Generate four-direction full-character candidates for the five missing classes.
- [ ] Human-review class identity, silhouette, proportions, palette, and common feet pivot.
- [ ] Split approved designs into modular equipment layers.
- [ ] Produce and validate walk/basic-attack sheets from the approved modular designs.

### VIS-CLASS-ANIM-001 — Six-class runtime walk + basic attack baseline

- [x] Preserve Assassin's chibi renderer and dual-dagger attack as the running reference.
- [x] Put all six classes on the shared visual resolver as a compatible fallback path.
- [x] Assign class-correct attack groups: slash, bow, or spellcast.
- [x] Add a browser animation matrix covering four directions for walk and attack.
- [x] Restore the canonical Assassin reference pack without the old duplicate hierarchy.
- [ ] After VIS-CLASS-IDENTITY-001 approval, produce replacement walk and attack sheets for each class.
- [ ] Human-review feet anchors, direction rows, silhouettes, hand grips, and motion arcs.
- [ ] Promote only reviewed sheets and replace temporary weapons.

### OPS-AI-001 — Safe ChatGPT/Cursor overnight loop

- [x] Preserve the current mixed asset work in a checkpoint branch.
- [x] Install Cursor Agent CLI.
- [x] Give the reviewer the full commit diff and deterministic validation output.
- [x] Add a no-dependency static-client validator.
- [x] Authenticate Cursor Agent CLI.
- [x] Use the local ChatGPT-authenticated Codex CLI when Platform API credit is unavailable.
- [x] Run a bounded no-push, no-asset-promotion dry run. One task completed after
  two reviewer-directed fix rounds; the configured second task was intentionally not
  started after proving the complete loop.

Knight candidate-art validation is still waiting for review.

## TODO

### VIS-KNIGHT-SWORD-001 — Replace the dagger stand-in
- [x] Machine-readable production requirement + asset queue for `knight_sword_t01` walk/slash sheets (`design/character_asset_requirements.json`, `ai/ASSET_QUEUE.json`).
- [x] Produce 64×64 walk and slash candidate sheets (4 LPC rows) under `assets/generated_candidates/`.
- [ ] Human-review grip alignment, direction rows, walk motion, and slash arcs in an LPC overlay/in-game preview. Dagger stand-in remains until both pass.
- [ ] Point `knight_sword_t01` at the validated sheets (manifest rewire blocked until then).

### VIS-EQUIP-002 — Visual equipment registry
All six base class looks now resolve through `js/data/characterVisuals.js`. Tiered
equipment variants beyond the existing Knight slice are still missing.

### VIS-EQUIP-003 — Armor tiers
Support visible armor progression for selected level / equipment tiers.

### VIS-EQUIP-004 — Weapons and offhands
Connect MainHand / future offhand visual data to appropriate action animations.

### VIS-EQUIP-005 — Helmets / hoods / hair rules
Define clipping and replacement rules for head layers.

### VIS-EQUIP-006 — Cosmetics
Allow costume visuals to override normal gear visuals without changing combat stats.

### VIS-EQUIP-007 — Asset validation
Add a lightweight validator that reports missing layer files or invalid visual mappings.

## LATER

- backend / real multiplayer architecture
- authentication
- authoritative server
- persistent database
- networking
- party multiplayer
- trading / auction backend

These are intentionally not part of the current visible-equipment milestone.

## DONE

- Base gameplay item/equipment state exists.
- Four-direction LPC renderer exists.
- Class-specific LPC visual kits exist.
- VIS-EQUIP-001 Knight slice: visual id → LPC layers, stats untouched, missing art listed.
- Six-class base animation resolver: walk + class-correct basic attack, four directions.
