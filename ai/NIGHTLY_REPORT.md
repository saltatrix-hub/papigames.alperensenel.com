# ASTRAYA Nightly Report

Run: 20260926-114830

## Branch `ai/nightly-20260926-114830`
- `Define the Knight t01 longsword asset queue` → **PASS** — The commit satisfies the assigned task. It adds exactly one Knight t01 sword-sheet requirement and one active queue job, specifies separate walk and slash PNG paths, exact sheet and 64×64 cell dimensions, frame counts and usage, all four authored LPC row directions without mirroring, transparent output, feet and per-frame hand/grip alignment, and candidate-only human-review gates. The dagger stand-in remains explicitly unresolved, no artwork or renderer/gameplay code was changed, item stats remain separate from visuals, no other class was started, and TASKS/HANDOFF accurately reflect the next state and documented checks. Deterministic validation exited 0. The diff shows no main-branch operation or secret changes.
- Director stopped: The exact machine-readable asset requirement and queue already exist. The next dependency is genuine candidate artwork plus human validation; assigning unrelated code work or inventing placeholder art would violate the current Knight-first priority and promotion gate.

Completed task count: **1**

## Manual asset candidate pass

- Generated a transparent 9×4 Knight t01 walk longsword candidate with the built-in image tool.
- Derived the 6×4 slash candidate from the existing transparent LPC 192px longsword source.
- Normalized both sheets to exact 64×64 cells with nearest-neighbor scaling.
- Dimension and alpha checks passed: walk 576×256 RGBA; slash 384×256 RGBA.
- AI slash generations were rejected for adding a translucent gray glow/background.
- Queue state is `candidate`; production promotion and manifest rewiring remain blocked pending human review.
