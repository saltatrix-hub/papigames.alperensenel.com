# ASTRAYA Tasks

## IN PROGRESS

### OPS-AI-001 — Safe ChatGPT/Cursor overnight loop

- [x] Preserve the current mixed asset work in a checkpoint branch.
- [x] Install Cursor Agent CLI.
- [x] Give the reviewer the full commit diff and deterministic validation output.
- [x] Add a no-dependency static-client validator.
- [x] Authenticate Cursor Agent CLI.
- [x] Use the local ChatGPT-authenticated Codex CLI when Platform API credit is unavailable.
- [ ] Run a two-task, no-push, no-asset-promotion dry run.

Knight validation is still waiting for review.

## TODO

### VIS-KNIGHT-SWORD-001 — Replace the dagger stand-in
Draw 64×64 walk and slash longsword sheets (4 LPC rows) and point `knight_sword_t01` at them.

### VIS-EQUIP-002 — Visual equipment registry
Knight registry exists in `js/data/characterVisuals.js`. Other classes are not in it yet.

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
- VIS-EQUIP-001 Knight slice: visual id → LPC layers, stats untouched, missing art listed. Other classes not migrated.
