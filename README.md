# ASTRAYA

Top-down 2D MMORPG client for **Astraya** — built from the Master Game Design Document.

## Play

Open `index.html` via any static server (GitHub Pages, or locally):

```bash
npx --yes serve .
```

Then open the printed local URL.

## Features

- Six classes from the GDD: Knight, Berserker, Assassin, Ranger, Mage, Priest
- Three launch regions: Dawnwatch Village → Verdant Trail → Moonfen Marsh
- Main quest chain (prologue through Grave-Mother Nereza)
- Skill hotkeys, potions, inventory, NPC services, portals, bosses
- Browser save (`localStorage`)

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Left click | Basic attack |
| 1–4 | Class skills |
| E | Interact (NPC / portal) |
| H | Health potion |
| I | Inventory |

## Design data

`design/` contains the production design pack (CSV/JSON/maps/concept art) without the large master PDF. The Markdown master GDD is included.

## Tech

Phaser 3 · vanilla JS · procedural placeholder sprites aligned to GDD identity.
