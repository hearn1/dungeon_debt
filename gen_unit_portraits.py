"""
Generate Dungeon Debt hero/enemy portraits from the Kenney Tiny Dungeon pack.

Kenney Tiny Dungeon is released under Creative Commons Zero (CC0 1.0):
    https://kenney.nl/assets/tiny-dungeon
CC0 places the work in the public domain — crediting Kenney is optional.

This script downloads the pack (if needed), maps each unit id to a 16x16 source
tile, scales it to 128x128 with nearest-neighbour sampling, applies an optional
subtle multiply tint for per-unit variety, and writes the portrait PNGs into
web/assets/heroes and web/assets/enemies.

Run from repo root:  python gen_unit_portraits.py

This supersedes the original procedural gen_portraits.py (Pillow placeholder art).
"""
import io
import os
import urllib.request
import zipfile

from PIL import Image

PACK_URL = (
    "https://kenney.nl/media/pages/assets/tiny-dungeon/"
    "f8422efb44-1674742415/kenney_tiny-dungeon.zip"
)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".kenney_tiny_dungeon")
ASSETS = os.path.join(HERE, "web", "assets")
OUT = 128


def ensure_pack():
    tiles_dir = os.path.join(CACHE, "Tiles")
    if os.path.isdir(tiles_dir):
        return tiles_dir
    os.makedirs(CACHE, exist_ok=True)
    print("Downloading Kenney Tiny Dungeon (CC0)...")
    data = urllib.request.urlopen(PACK_URL).read()
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        zf.extractall(CACHE)
    return tiles_dir


def tint(img, factor, strength=0.55):
    if factor is None:
        return img
    fr, fg, fb = factor
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            nr = int(r * (1 - strength) + int(r * fr) * strength)
            ng = int(g * (1 - strength) + int(g * fg) * strength)
            nb = int(b * (1 - strength) + int(b * fb) * strength)
            px[x, y] = (min(nr, 255), min(ng, 255), min(nb, 255), a)
    return img


def emit(tiles_dir, rel, idx, factor=None):
    src = os.path.join(tiles_dir, f"tile_{idx:04d}.png")
    img = tint(Image.open(src).convert("RGBA"), factor).resize((OUT, OUT), Image.NEAREST)
    dst = os.path.join(ASSETS, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, "PNG")
    print("  wrote", rel, "<- tile", idx)


# tint factors
RED = (1.25, 0.7, 0.6); GREEN = (0.7, 1.2, 0.75); TEAL = (0.6, 1.1, 1.1)
BLUE = (0.7, 0.85, 1.3); PURPLE = (1.05, 0.7, 1.25); GOLD = (1.25, 1.05, 0.55)
BROWN = (1.0, 0.82, 0.6); SLATE = (0.85, 0.9, 1.0); DARK = (0.6, 0.6, 0.7)
DUSK = (0.85, 0.75, 1.05)

# id -> (Tiny Dungeon tile index, optional tint)
HEROES = {
    "warrior": (100, None), "knight": (96, None), "squire": (97, None),
    "golem": (124, None), "wizard": (84, None), "ninja": (98, DARK),
    "ranger": (111, None), "priest": (99, None), "bard": (88, GREEN),
    "enchanter": (112, PURPLE), "treasurer": (85, GOLD), "apprentice": (84, TEAL),
    "role-tank": (96, None), "role-damage": (87, RED),
    "role-support": (99, None), "role-economy": (85, GOLD),
}
ENEMIES = {
    "slime": (108, None), "training_dummy": (123, None), "cave_bat": (122, DUSK),
    "goblin_thief": (109, None), "tax_collector": (98, PURPLE),
    "backline_bat": (122, BLUE), "debt_wraith": (121, BLUE),
    "treasure_leech": (110, GOLD), "dungeon_auditor": (98, SLATE),
    "greedy_tank": (96, GREEN), "greedy_carry": (87, GREEN),
    "carry_protector": (96, TEAL), "carry_carry": (100, TEAL),
    "frugal_guard": (97, BROWN), "frugal_archer": (111, BROWN),
    "frugal_healer": (99, BROWN), "imp": (120, None), "soul_broker": (121, PURPLE),
    "gloom_bat": (122, DARK), "hoard_fiend": (120, GOLD),
    "brimstone_brute": (109, RED), "infernal_auditor": (120, DARK),
    "enemy-default": (109, None),
}

if __name__ == "__main__":
    tiles_dir = ensure_pack()
    for hid, (idx, f) in HEROES.items():
        emit(tiles_dir, f"heroes/{hid}.png", idx, f)
    for eid, (idx, f) in ENEMIES.items():
        emit(tiles_dir, f"enemies/{eid}.png", idx, f)
    print(f"Done. {len(HEROES) + len(ENEMIES)} portraits from Kenney Tiny Dungeon (CC0).")
