# AI Collaboration Workspace

This folder is the shared project memory used by ChatGPT and Cursor.

It does **not** replace the ASTRAYA GDD in `design/`.

## Files

- `PROJECT_STATE.md` — concise description of what currently exists
- `TASKS.md` — current implementation queue
- `DECISIONS.md` — architecture decisions and constraints
- `BUGS.md` — unresolved regressions / technical issues
- `HANDOFF.md` — latest developer-agent handoff for review

## Recommended loop

1. Alperen describes the desired feature to ChatGPT.
2. ChatGPT turns it into a scoped implementation task.
3. The task is added to `TASKS.md` or given to Cursor Agent.
4. Cursor reads `AGENTS.md`, this folder, and relevant code.
5. Cursor implements and tests.
6. Cursor updates `HANDOFF.md`.
7. ChatGPT reviews the changed code / commit / PR.
8. Fixes are sent back to Cursor.
9. After approval, the next task starts.

## Cursor starting prompt

Use:

> Read `AGENTS.md` and everything in `ai/`. Then inspect the existing code relevant to the current IN PROGRESS task in `ai/TASKS.md`. Do not rewrite working systems. Implement the smallest complete solution, verify it in the running game, and update `ai/HANDOFF.md`, `ai/PROJECT_STATE.md`, and `ai/TASKS.md`.
