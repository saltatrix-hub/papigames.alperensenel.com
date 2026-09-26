# ASTRAYA Architecture Decisions

## ADR-001 — Preserve current client architecture

Date: 2026-09-26

Decision:
Continue using the existing Vanilla ES module + Canvas 2D architecture for current client work.

Reason:
The game is already playable and major gameplay systems are implemented. Introducing a framework or build system during equipment-visual work would increase risk without solving the immediate problem.

Status: Active

---

## ADR-002 — Reuse LPC compositor

Date: 2026-09-26

Decision:
Use `js/render/lpc.js` as the base for modular character equipment visuals instead of replacing it with a separate character renderer.

Reason:
It already provides layered sprites, four directional rows, animation groups and frame baking.

Status: Active

---

## ADR-003 — Separate gameplay equipment from visual mapping

Date: 2026-09-26

Decision:
Gameplay gear instances remain owned by the item/equipment systems. Rendering should consume a small visual descriptor derived from equipped items.

Preferred direction:

`equipped item -> visual id / descriptor -> LPC layer selection -> renderer`

Avoid:
- putting stat calculation in renderer code
- checking dozens of concrete item IDs directly throughout drawing functions
- creating one complete character sprite sheet for every possible equipment combination

Status: Active

---

## ADR-004 — Backward-compatible fallback

Date: 2026-09-26

Decision:
If an equipped item has no dedicated visual mapping, the renderer must fall back to the current class kit.

Reason:
The design pack contains far more items than final visual assets. Missing art must not break the playable game.

Status: Active

---

## ADR-005 — Knight visual ids, no mirrored directions

Date: 2026-09-26

Decision:
Character looks are selected by visual id (`knight_armor_t01`, and so on), not by item stat fields and not by item-id branches in the renderer. Left and right stay as separate LPC rows. Do not mirror weapon or shield layers.

Reason:
The existing compositor already has four directional rows. Mirroring would break asymmetric plate and weapons. A manifest keeps new tiers out of `drawLpcHero`.

Status: Active

---

## ADR-006 — Skill effects stay outside character sheets

Date: 2026-09-26

Decision:
Skill effects are registered in `js/data/effectVisuals.js` and will live under `assets/effects/`. They are not extra cells in body or weapon sheets. Playback waits until the PNG exists.

Reason:
Baking effects into equipment sheets would force a new character export for every skill.

Status: Active

---

## ADR-007 — Overnight agents work only on isolated branches

Date: 2026-09-26

Decision:
The OpenAI director/reviewer and Cursor implementation loop may run unattended only
on a newly created `ai/nightly-*` branch. It must not merge to `main`. Every Cursor
commit is checked by deterministic static-client validation, and the reviewer must
receive the actual patch rather than relying on the implementer's summary.

Generated images remain review candidates by default. The loop stops on a human/art
blocker or after its configured task and fix limits.

Director/reviewer inference defaults to the local Codex CLI authenticated through the
user's ChatGPT account. The Platform API is reserved for optional image-candidate
generation, so exhausted image/API credit does not disable code direction or review.

Reason:
This keeps unattended iteration recoverable and prevents summaries or attractive but
misaligned sprite output from being treated as proof of correctness.

Status: Active
