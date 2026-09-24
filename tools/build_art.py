"""Builds web-ready art from the GDD concept pack.

Usage: python tools/build_art.py [path/to/ASTRAYA_2D_MMO_COMPLETE_PROJECT]
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "ASTRAYA_2D_MMO_COMPLETE_PROJECT"
CONCEPT = SRC / "12_ASSETS" / "Concept_Art"
OUT = ROOT / "assets" / "art"
OUT.mkdir(parents=True, exist_ok=True)

CONCEPTS = [
    "world_map_concept", "classes_turnaround_concept", "monster_boss_concept",
    "dungeon_ui_concept", "costume_cosmetic_concept", "class_equipment_atlas",
    "project_asset_overview",
]

# Class sheet is a 3x2 grid; each class panel's front view sits in the left third.
CLASS_GRID = [["Knight", "Berserker", "Assassin"], ["Ranger", "Mage", "Priest"]]
FULL_BOX = (0.0, 0.15, 0.36, 0.83)   # front figure, relative to panel
FACE_BOX = (0.12, 0.15, 0.29, 0.31)  # head/shoulders, relative to panel


def crop_rel(im, px, py, pw, ph, box):
    x0, y0, x1, y1 = box
    return im.crop((int(px + x0 * pw), int(py + y0 * ph), int(px + x1 * pw), int(py + y1 * ph)))


def main():
    for name in CONCEPTS:
        im = Image.open(CONCEPT / f"{name}.png").convert("RGB")
        im.save(OUT / f"{name}.jpg", "JPEG", quality=84, optimize=True, progressive=True)

    sheet = Image.open(CONCEPT / "classes_turnaround_concept.png").convert("RGB")
    pw, ph = sheet.width / 3, sheet.height / 2
    for r, row in enumerate(CLASS_GRID):
        for c, cls in enumerate(row):
            px, py = c * pw, r * ph
            panel = sheet.crop((int(px), int(py), int(px + pw), int(py + ph)))
            panel.save(OUT / f"class_{cls.lower()}_sheet.jpg", "JPEG", quality=86, optimize=True)
            full = crop_rel(sheet, px, py, pw, ph, FULL_BOX)
            full.save(OUT / f"class_{cls.lower()}_full.jpg", "JPEG", quality=88, optimize=True)
            face = crop_rel(sheet, px, py, pw, ph, FACE_BOX)
            side = max(face.size)
            face = face.resize((side, side), Image.LANCZOS).resize((128, 128), Image.LANCZOS)
            face.save(OUT / f"class_{cls.lower()}_face.jpg", "JPEG", quality=90, optimize=True)
    print("art written to", OUT)


if __name__ == "__main__":
    main()
