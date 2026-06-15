"""
Generate Act 1 hero and enemy portrait PNGs for Dungeon Debt.
Output: 128×128 RGBA PNGs with transparent background.
Run from repo root: python gen_portraits.py
"""

from PIL import Image, ImageDraw
import math
import os

SIZE = 128
HALF = SIZE // 2


def make_canvas():
    return Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))


def circle(draw, cx, cy, r, fill, outline=None, width=2):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline, width=width)


def dark_bg(draw, color, rim=None):
    """Filled circle background + optional lighter rim."""
    circle(draw, HALF, HALF, 60, color)
    if rim:
        circle(draw, HALF, HALF, 60, None, outline=rim, width=4)


# ---------------------------------------------------------------------------
# HEROES
# ---------------------------------------------------------------------------

def warrior():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (90, 20, 20, 255), rim=(200, 60, 60, 255))
    # helm: rounded top
    circle(d, HALF, 50, 28, (200, 60, 60, 255))
    # visor bar
    d.rectangle([HALF - 22, 54, HALF + 22, 64], fill=(60, 10, 10, 255))
    # chin guard
    d.rounded_rectangle([HALF - 18, 62, HALF + 18, 80], radius=4, fill=(170, 45, 45, 255))
    # cheekguards
    d.rounded_rectangle([HALF - 28, 56, HALF - 18, 76], radius=5, fill=(170, 45, 45, 255))
    d.rounded_rectangle([HALF + 18, 56, HALF + 28, 76], radius=5, fill=(170, 45, 45, 255))
    # crest
    d.polygon([(HALF, 18), (HALF - 8, 35), (HALF + 8, 35)], fill=(220, 90, 90, 255))
    return img


def knight():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (20, 40, 90, 255), rim=(80, 130, 220, 255))
    # shield body
    d.polygon([
        (HALF, 28), (HALF + 28, 42), (HALF + 28, 78), (HALF, 95), (HALF - 28, 78), (HALF - 28, 42)
    ], fill=(60, 110, 200, 255), outline=(120, 170, 255, 255), width=2)
    # cross on shield
    d.rectangle([HALF - 3, 38, HALF + 3, 88], fill=(200, 220, 255, 255))
    d.rectangle([HALF - 18, 58, HALF + 18, 64], fill=(200, 220, 255, 255))
    return img


def wizard():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (35, 10, 70, 255), rim=(150, 80, 220, 255))
    # tall pointed hat
    d.polygon([(HALF, 14), (HALF - 22, 72), (HALF + 22, 72)], fill=(100, 40, 180, 255))
    # hat brim
    d.ellipse([HALF - 30, 68, HALF + 30, 82], fill=(80, 30, 150, 255))
    # face
    circle(d, HALF, 90, 20, (200, 170, 130, 255))
    # eyes — glowing
    circle(d, HALF - 7, 88, 4, (180, 100, 255, 255))
    circle(d, HALF + 7, 88, 4, (180, 100, 255, 255))
    # star on hat
    for i in range(5):
        angle = math.pi / 2 + i * 2 * math.pi / 5
        angle2 = angle + math.pi / 5
        x1 = HALF + math.cos(angle) * 10
        y1 = 44 - math.sin(angle) * 10
        x2 = HALF + math.cos(angle2) * 5
        y2 = 44 - math.sin(angle2) * 5
    # simple star: 5-pointed
    pts = []
    for i in range(5):
        a = math.pi / 2 + i * 2 * math.pi / 5
        pts.append((HALF + math.cos(a) * 11, 44 - math.sin(a) * 11))
        a2 = a + math.pi / 5
        pts.append((HALF + math.cos(a2) * 5, 44 - math.sin(a2) * 5))
    d.polygon(pts, fill=(220, 180, 80, 255))
    return img


def ninja():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (20, 20, 30, 255), rim=(80, 80, 100, 255))
    # head wrap
    circle(d, HALF, 54, 30, (40, 40, 50, 255))
    # forehead band
    d.rectangle([HALF - 30, 44, HALF + 30, 56], fill=(30, 30, 40, 255))
    # eye slit — narrow and sharp
    d.rectangle([HALF - 22, 56, HALF + 22, 63], fill=(10, 10, 15, 255))
    # glowing eyes
    circle(d, HALF - 8, 59, 3, (200, 50, 50, 255))
    circle(d, HALF + 8, 59, 3, (200, 50, 50, 255))
    # chin wrap
    d.rectangle([HALF - 28, 68, HALF + 28, 84], fill=(35, 35, 48, 255))
    # shuriken accent top-right
    cx, cy = HALF + 20, HALF - 18
    for angle in [0, 90, 180, 270]:
        a = math.radians(angle)
        pts = [
            (cx + math.cos(a) * 8, cy + math.sin(a) * 8),
            (cx + math.cos(a + 2.2) * 3, cy + math.sin(a + 2.2) * 3),
            (cx + math.cos(a + math.pi) * 8, cy + math.sin(a + math.pi) * 8),
            (cx + math.cos(a - 2.2) * 3, cy + math.sin(a - 2.2) * 3),
        ]
        d.polygon(pts, fill=(180, 180, 200, 255))
    return img


def priest():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (50, 40, 10, 255), rim=(220, 190, 80, 255))
    # hood / cowl
    d.polygon([
        (HALF, 16), (HALF + 36, 55), (HALF + 30, 95),
        (HALF - 30, 95), (HALF - 36, 55)
    ], fill=(200, 170, 60, 255))
    # inner hood shadow
    d.polygon([
        (HALF, 24), (HALF + 24, 56), (HALF + 20, 88),
        (HALF - 20, 88), (HALF - 24, 56)
    ], fill=(80, 60, 15, 255))
    # face
    circle(d, HALF, 68, 18, (200, 170, 130, 255))
    # golden cross on chest
    d.rectangle([HALF - 2, 88, HALF + 2, 105], fill=(220, 190, 80, 255))
    d.rectangle([HALF - 10, 94, HALF + 10, 98], fill=(220, 190, 80, 255))
    # holy glow behind head
    circle(d, HALF, 64, 22, None, outline=(220, 200, 100, 150), width=3)
    return img


def bard():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (10, 55, 40, 255), rim=(60, 180, 130, 255))
    # floppy hat
    d.polygon([(HALF, 14), (HALF - 32, 58), (HALF + 32, 58)], fill=(40, 150, 100, 255))
    d.ellipse([HALF - 36, 52, HALF + 36, 66], fill=(30, 120, 80, 255))
    # feather in hat
    d.polygon([(HALF + 20, 28), (HALF + 38, 14), (HALF + 32, 44)], fill=(200, 220, 50, 255))
    # face
    circle(d, HALF, 82, 20, (200, 170, 130, 255))
    # lute shape
    circle(d, HALF - 30, 88, 12, (160, 110, 50, 255))
    d.rectangle([HALF - 30, 72, HALF - 27, 90], fill=(100, 70, 30, 255))
    # strings
    for x in [HALF - 34, HALF - 30, HALF - 26]:
        d.line([(x, 76), (x, 100)], fill=(220, 200, 150, 200), width=1)
    return img


# ---------------------------------------------------------------------------
# ENEMIES
# ---------------------------------------------------------------------------

def slime():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (15, 55, 15, 255), rim=(60, 200, 60, 255))
    # blob body
    d.ellipse([HALF - 38, HALF - 10, HALF + 38, HALF + 48], fill=(60, 190, 60, 255))
    # highlight dome
    d.ellipse([HALF - 34, HALF - 6, HALF + 34, HALF + 30], fill=(80, 220, 80, 220))
    # top bubble
    d.ellipse([HALF - 18, HALF - 26, HALF + 18, HALF + 2], fill=(70, 210, 70, 255))
    # eyes
    circle(d, HALF - 10, HALF + 8, 6, (20, 20, 20, 255))
    circle(d, HALF + 10, HALF + 8, 6, (20, 20, 20, 255))
    circle(d, HALF - 8, HALF + 6, 2, (240, 240, 240, 255))
    circle(d, HALF + 12, HALF + 6, 2, (240, 240, 240, 255))
    # drip
    d.polygon([(HALF + 25, HALF + 40), (HALF + 30, HALF + 56), (HALF + 20, HALF + 40)], fill=(50, 180, 50, 255))
    return img


def goblin_thief():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (40, 30, 10, 255), rim=(180, 120, 40, 255))
    # green goblin skin head
    circle(d, HALF, 56, 28, (80, 160, 40, 255))
    # big ears
    circle(d, HALF - 32, 54, 12, (70, 140, 35, 255))
    circle(d, HALF + 32, 54, 12, (70, 140, 35, 255))
    # pointy hat (stolen)
    d.polygon([(HALF, 16), (HALF - 18, 42), (HALF + 18, 42)], fill=(80, 50, 20, 255))
    d.rectangle([HALF - 20, 38, HALF + 20, 46], fill=(60, 35, 10, 255))
    # beady eyes
    circle(d, HALF - 10, 52, 5, (255, 200, 0, 255))
    circle(d, HALF + 10, 52, 5, (255, 200, 0, 255))
    circle(d, HALF - 9, 52, 2, (0, 0, 0, 255))
    circle(d, HALF + 11, 52, 2, (0, 0, 0, 255))
    # snout / mouth
    d.ellipse([HALF - 10, 60, HALF + 10, 72], fill=(60, 130, 30, 255))
    d.arc([HALF - 8, 62, HALF + 8, 72], 0, 180, fill=(30, 80, 10, 255), width=2)
    # coin bag
    circle(d, HALF + 22, 90, 14, (200, 160, 30, 255))
    circle(d, HALF + 22, 90, 10, (220, 180, 50, 255))
    d.line([(HALF + 22, 76), (HALF + 22, 72)], fill=(150, 100, 20, 255), width=3)
    return img


def tax_collector():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (35, 20, 55, 255), rim=(180, 100, 220, 255))
    # tall top hat
    d.rectangle([HALF - 18, 18, HALF + 18, 56], fill=(50, 30, 80, 255), outline=(120, 70, 170, 255), width=2)
    d.rectangle([HALF - 24, 52, HALF + 24, 60], fill=(80, 50, 120, 255))
    # face — pale and stern
    circle(d, HALF, 72, 22, (210, 185, 170, 255))
    # stern eyes
    d.line([(HALF - 14, 68), (HALF - 6, 68)], fill=(40, 20, 60, 255), width=3)
    d.line([(HALF + 6, 68), (HALF + 14, 68)], fill=(40, 20, 60, 255), width=3)
    circle(d, HALF - 10, 70, 3, (60, 30, 90, 255))
    circle(d, HALF + 10, 70, 3, (60, 30, 90, 255))
    # thin moustache
    d.arc([HALF - 12, 76, HALF, 84], 0, 180, fill=(80, 50, 30, 255), width=2)
    d.arc([HALF, 76, HALF + 12, 84], 0, 180, fill=(80, 50, 30, 255), width=2)
    # scroll / ledger
    d.rounded_rectangle([HALF - 32, 86, HALF - 8, 110], radius=3, fill=(220, 200, 160, 255))
    for y in [92, 97, 102, 107]:
        d.line([(HALF - 28, y), (HALF - 12, y)], fill=(80, 60, 40, 180), width=1)
    # coin stack
    for i in range(3):
        d.ellipse([HALF + 10, 100 - i * 6, HALF + 30, 108 - i * 6], fill=(220, 180, 30, 255), outline=(180, 140, 20, 255), width=1)
    return img


def backline_bat():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (20, 10, 35, 255), rim=(120, 60, 180, 255))
    # wings spread wide (dark purple)
    wing_color = (60, 30, 100, 255)
    wing_mem = (45, 20, 75, 200)
    # left wing
    d.polygon([
        (HALF, 58), (HALF - 16, 48), (HALF - 46, 32), (HALF - 56, 54),
        (HALF - 42, 66), (HALF - 20, 72)
    ], fill=wing_color)
    # left membrane
    d.polygon([
        (HALF - 16, 48), (HALF - 46, 32), (HALF - 56, 54), (HALF - 42, 66)
    ], fill=wing_mem)
    # right wing
    d.polygon([
        (HALF, 58), (HALF + 16, 48), (HALF + 46, 32), (HALF + 56, 54),
        (HALF + 42, 66), (HALF + 20, 72)
    ], fill=wing_color)
    # right membrane
    d.polygon([
        (HALF + 16, 48), (HALF + 46, 32), (HALF + 56, 54), (HALF + 42, 66)
    ], fill=wing_mem)
    # body
    d.ellipse([HALF - 14, 52, HALF + 14, 86], fill=(50, 25, 80, 255))
    # ears
    d.polygon([(HALF - 10, 52), (HALF - 18, 34), (HALF - 2, 46)], fill=(80, 40, 120, 255))
    d.polygon([(HALF + 10, 52), (HALF + 18, 34), (HALF + 2, 46)], fill=(80, 40, 120, 255))
    # face
    circle(d, HALF, 62, 12, (70, 40, 100, 255))
    circle(d, HALF - 5, 60, 3, (220, 100, 255, 255))
    circle(d, HALF + 5, 60, 3, (220, 100, 255, 255))
    d.arc([HALF - 6, 64, HALF + 6, 72], 0, 180, fill=(200, 100, 200, 255), width=1)
    return img


def debt_wraith():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (15, 25, 40, 255), rim=(80, 130, 180, 255))
    # flowing spectral form — gradient-like using concentric ellipses
    for i in range(5):
        alpha = 120 - i * 18
        r = 40 - i * 6
        w = 30 - i * 4
        d.ellipse([HALF - w, 70 + i * 4, HALF + w, 115 - i * 2],
                  fill=(100, 150, 200, alpha))
    # ghostly head — translucent
    circle(d, HALF, 52, 26, (140, 180, 220, 200))
    # hollow black eye sockets
    circle(d, HALF - 9, 48, 7, (10, 15, 30, 240))
    circle(d, HALF + 9, 48, 7, (10, 15, 30, 240))
    # glowing pupils
    circle(d, HALF - 9, 48, 3, (60, 120, 220, 255))
    circle(d, HALF + 9, 48, 3, (60, 120, 220, 255))
    # wispy tendrils
    for ox in [-18, -6, 6, 18]:
        d.line([(HALF + ox, 78), (HALF + ox + 4, 110)],
               fill=(100, 150, 200, 120), width=2)
    # torn mouth
    d.arc([HALF - 12, 58, HALF + 12, 72], 180, 360, fill=(30, 60, 100, 255), width=2)
    return img


def treasure_leech():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (50, 40, 10, 255), rim=(200, 170, 30, 255))
    # worm/leech body — segmented curve
    seg_color = (180, 140, 20, 255)
    seg_dark = (140, 110, 15, 255)
    # body segments along a curve
    positions = [(68, 84), (74, 70), (76, 56), (72, 44), (64, 34), (56, 30), (48, 32)]
    widths =    [18, 17, 16, 15, 14, 12, 10]
    for i, (x, y) in enumerate(positions):
        w = widths[i]
        d.ellipse([x - w, y - w // 2, x + w, y + w // 2], fill=seg_color if i % 2 == 0 else seg_dark)
    # mouth end (greedy sucker)
    circle(d, 56, 30, 14, (160, 100, 10, 255))
    # concentric mouth rings
    for r, col in [(10, (80, 50, 5, 255)), (6, (200, 50, 30, 255)), (3, (240, 20, 20, 255))]:
        circle(d, 56, 30, r, col)
    # small teeth
    for angle in range(0, 360, 45):
        a = math.radians(angle)
        tx = 56 + math.cos(a) * 9
        ty = 30 + math.sin(a) * 9
        d.polygon([(tx, ty),
                   (tx + math.cos(a) * 4, ty + math.sin(a) * 4),
                   (tx + math.cos(a + 0.5) * 2, ty + math.sin(a + 0.5) * 2)],
                  fill=(220, 200, 180, 255))
    # gold coin being sucked
    circle(d, 46, 22, 9, (220, 185, 30, 255), outline=(180, 150, 20, 255), width=2)
    # tail tip
    d.polygon([(72, 90), (80, 100), (60, 96)], fill=(160, 120, 15, 255))
    return img


def dungeon_auditor():
    img = make_canvas()
    d = ImageDraw.Draw(img)
    dark_bg(d, (15, 30, 50, 255), rim=(60, 100, 160, 255))
    # robed figure: dark blue robe
    d.polygon([
        (HALF - 8, 68), (HALF - 28, 108), (HALF + 28, 108), (HALF + 8, 68)
    ], fill=(30, 60, 100, 255))
    d.ellipse([HALF - 20, 65, HALF + 20, 78], fill=(30, 60, 100, 255))  # shoulder blend
    # head — hooded and shadowed
    circle(d, HALF, 54, 22, (40, 75, 120, 255))
    # face — pale, stern
    circle(d, HALF, 56, 16, (190, 170, 155, 255))
    # pince-nez glasses
    d.arc([HALF - 14, 52, HALF - 4, 60], 0, 360, fill=(180, 160, 80, 255), width=2)
    d.arc([HALF + 4, 52, HALF + 14, 60], 0, 360, fill=(180, 160, 80, 255), width=2)
    d.line([(HALF - 4, 56), (HALF + 4, 56)], fill=(180, 160, 80, 255), width=1)
    # frown
    d.arc([HALF - 8, 62, HALF + 8, 72], 180, 360, fill=(80, 60, 50, 255), width=2)
    # large ledger / scroll
    d.rounded_rectangle([HALF - 30, 76, HALF + 8, 108], radius=4, fill=(210, 190, 155, 255))
    # ruled lines
    for y in [83, 89, 95, 101]:
        d.line([(HALF - 26, y), (HALF + 4, y)], fill=(80, 60, 40, 150), width=1)
    # quill
    d.line([(HALF + 8, 72), (HALF + 22, 92)], fill=(220, 200, 180, 255), width=2)
    d.polygon([(HALF + 8, 72), (HALF + 4, 68), (HALF + 14, 70)], fill=(240, 230, 200, 255))
    return img


# ---------------------------------------------------------------------------
# OUTPUT
# ---------------------------------------------------------------------------

PORTRAITS = {
    "web/assets/heroes/warrior.png":        warrior,
    "web/assets/heroes/knight.png":         knight,
    "web/assets/heroes/wizard.png":         wizard,
    "web/assets/heroes/ninja.png":          ninja,
    "web/assets/heroes/priest.png":         priest,
    "web/assets/heroes/bard.png":           bard,
    "web/assets/enemies/slime.png":         slime,
    "web/assets/enemies/goblin_thief.png":  goblin_thief,
    "web/assets/enemies/tax_collector.png": tax_collector,
    "web/assets/enemies/backline_bat.png":  backline_bat,
    "web/assets/enemies/debt_wraith.png":   debt_wraith,
    "web/assets/enemies/treasure_leech.png": treasure_leech,
    "web/assets/enemies/dungeon_auditor.png": dungeon_auditor,
}

if __name__ == "__main__":
    for path, fn in PORTRAITS.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img = fn()
        img.save(path, "PNG")
        print(f"  wrote {path}")
    print("Done. 13 portraits generated.")
