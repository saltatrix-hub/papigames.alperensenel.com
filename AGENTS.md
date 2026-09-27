# ASTRAYA Agent Instructions

ASTRAYA is a top-down 2D MMORPG-style browser game.

## Current stack

- Vanilla JavaScript ES modules
- Canvas 2D rendering
- Web Audio
- Static browser client
- No runtime npm dependency
- No backend in the current playable client
- LocalStorage save system
- GitHub Pages deployment

## Source of truth

Before changing gameplay or architecture, read:

1. `README.md`
2. `ai/PROJECT_STATE.md`
3. `ai/TASKS.md`
4. `ai/DECISIONS.md`
5. Relevant files under `design/`
6. `design/ASTRAYA_MASTER_GAME_DESIGN_DOCUMENT.md` when game-design intent is unclear

Do not duplicate the GDD into new files. Reference the existing design pack.

## Important existing areas

- `js/game/` — game state, combat, entities, items, quests, skills, stats, world
- `js/render/` — renderer, procedural sprites, LPC layered character compositor
- `js/ui/` — HUD and menus
- `js/world/` — maps and map generation
- `js/data/` — generated/runtime game data
- `assets/sprites/lpc/` — LPC animation layers
- `design/` — master design data and technical specifications

## Workflow

For every implementation task:

1. Read the current task and project state.
2. Inspect existing code before writing new code.
3. Reuse or extend existing systems instead of creating parallel replacements.
4. Keep changes small and reviewable.
5. Preserve the current Vanilla ES module architecture unless an explicit architecture task says otherwise.
6. Do not introduce a framework, bundler, backend, database, or package dependency without an explicit decision recorded in `ai/DECISIONS.md`.
7. Test the feature manually or with an existing tool/script when possible.
8. Check browser console errors and imports.
9. Update `ai/PROJECT_STATE.md` when project state changes.
10. Update `ai/TASKS.md` when work starts or finishes.
11. Record important architectural decisions in `ai/DECISIONS.md`.
12. Record unresolved regressions in `ai/BUGS.md`.
13. Update `ai/HANDOFF.md` at the end of a meaningful work unit.

## Completion rule

Never mark a task DONE if:

- the implementation is incomplete,
- the page does not load,
- ES module imports are broken,
- the browser console has new errors caused by the change,
- the requested gameplay behavior is not actually connected to the running game.

## Sprite / equipment rule

ASTRAYA already has an LPC layered compositor in `js/render/lpc.js`.

Do not replace it blindly.

Character visual equipment should evolve toward data-driven layered equipment:

- body
- legs
- feet
- torso / armor
- arms / shoulders
- gloves
- head / helmet / hood / hair
- back / cape / quiver
- main-hand weapon
- off-hand weapon
- effects

Every visible equipment solution must support the four gameplay directions:

- down/front
- left
- right
- up/back

Animation compatibility must be considered for:

- walk
- slash / melee
- bow
- spellcast
- thrust

Item stats and item visuals should be related by IDs/data, not hardcoded together inside the renderer.

## Safety for existing systems

Do not delete working gameplay systems just to simplify a task.

Do not rewrite `game.js`, `renderer.js`, `sprites.js`, `lpc.js`, or `ui.js` wholesale unless explicitly requested.

Prefer focused modules and small integration changes.
