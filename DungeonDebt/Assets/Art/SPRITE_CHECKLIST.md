# SPRITE_CHECKLIST.md

The exact PNG asset list for the M10 combat-view sprite pipeline. Produced by slice **M10.3** (planning, no code). The user supplies these PNGs; **M10.4** wires base sprites onto cards via `SpriteCatalog`; **M10.5** adds the shared-effect motion.

This is presentation art only. Nothing here changes stats, tiers, effects, shop, or any gameplay rule. The roster is locked (`IMPLEMENTATION_PLAN.md` §7 heroes, `DataRepository.AllEnemies` enemies) — do not add or rename entries.

---

## Canonical format rules (apply to every PNG below)

- **Format:** `.png`, 32-bit RGBA, **transparent background** (no white/colored fill behind the subject).
- **Canvas:** square, **256 × 256 px**. Unity import as `Sprite (2D and UI)`; the combat card scales it down — do not pre-shrink.
- **Framing:** subject centered, roughly fills 80–90% of the canvas, consistent visual weight across the set (a Slime and a Dungeon Auditor should read at the same card size).
- **Orientation — base unit sprites:** authored **facing right**. Heroes are shown on the right side of the board facing left and enemies on the left facing right; the combat view handles any horizontal flip at display time, so author every unit one way (facing right) for consistency.
- **Orientation — effect sprites:** authored **travelling left → right** (origin at left edge, impact/point at right edge). The M10.5 motion code positions and flips per source→target direction; author one canonical direction only.
- **No baked-in:** drop shadows tied to a background, frame borders, text, HP bars, or tier badges — the card UI draws those. One single static image per file (no sprite sheets, no animation frames).
- **Naming:** exactly the lowercase stable id below + `.png`. No spaces, no caps, no version suffixes. The id is what `SpriteCatalog` keys on.

---

## 1. Hero base sprites — REQUIRED (12)

Path: `Assets/Art/Units/Heroes/<id>.png`

| # | id | Hero | Role |
|--:|----|------|------|
| 1 | `warrior` | Warrior | Tank |
| 2 | `knight` | Knight | Tank |
| 3 | `golem` | Golem | Tank |
| 4 | `wizard` | Wizard | Damage |
| 5 | `ninja` | Ninja | Damage |
| 6 | `ranger` | Ranger | Damage |
| 7 | `priest` | Priest | Support |
| 8 | `bard` | Bard | Support |
| 9 | `enchanter` | Enchanter | Support |
| 10 | `squire` | Squire | Tank |
| 11 | `treasurer` | Treasurer | Economy |
| 12 | `apprentice` | Apprentice | Economy |

## 2. Enemy base sprites — REQUIRED (16)

Path: `Assets/Art/Units/Enemies/<id>.png`

Enumerated from `DataRepository.AllEnemies` (the full roster, including rival-ghost units and the unused-but-defined `training_dummy`).

| # | id | Enemy |
|--:|----|-------|
| 1 | `slime` | Slime |
| 2 | `training_dummy` | Training Dummy |
| 3 | `cave_bat` | Cave Bat |
| 4 | `goblin_thief` | Goblin Thief |
| 5 | `tax_collector` | Tax Collector |
| 6 | `backline_bat` | Backline Bat |
| 7 | `debt_wraith` | Debt Wraith |
| 8 | `treasure_leech` | Treasure Leech |
| 9 | `dungeon_auditor` | Dungeon Auditor |
| 10 | `greedy_tank` | Greedy Tank |
| 11 | `greedy_carry` | Greedy Carry |
| 12 | `carry_protector` | Carry Protector |
| 13 | `carry_carry` | Carry Champion |
| 14 | `frugal_guard` | Frugal Guard |
| 15 | `frugal_archer` | Frugal Archer |
| 16 | `frugal_healer` | Frugal Healer |

## 3. Shared combat-effect sprites — REQUIRED (5, hard cap)

Path: `Assets/Art/Effects/<id>.png`

This set is **shared and capped at 5**. Every attacking unit and every visible hero effect reuses one of these by category (mapping table in `IMPLEMENTATION_PLAN.md` §15, M10 "Effect-category mapping"). There are intentionally **no** per-hero or per-enemy attack sprites.

| # | id | Used for | Authoring note |
|--:|----|----------|----------------|
| 1 | `melee_stab` | All basic melee attacks (default for any attacker) | A thrust/slash, point toward the right edge. **Replaces** the M10.2 `Assets/Art/Combat/sword.png` — see migration note below. |
| 2 | `arrow` | Ranger, Frugal Archer attacks | Projectile pointing right. |
| 3 | `fireball` | Wizard attacks | Projectile/orb travelling right. |
| 4 | `heal` | Priest heal, Frugal Healer heal | A rising/cross motif, centered (it plays on the target, not travelling). |
| 5 | `enchant` | Enchanter `OnCombatStart` Damage-ally buff | A buff sparkle/glyph, centered (plays on the buffed ally). |

### Migration note for the existing sword

M10.2 added `Assets/Art/Combat/sword.png` wired through a single `_swordSprite` field on `MainMenuPanel`. Under this pipeline that art becomes the **generic `melee_stab` effect**, not a Warrior-only asset. Action for the user: provide it (or a replacement) as `Assets/Art/Effects/melee_stab.png` per the rules above. **M10.5** repoints the code from the `_swordSprite` field to `SpriteCatalog`'s `melee_stab` entry and the old `Assets/Art/Combat/` path is retired then. Do not delete `sword.png` yet — M10.4/M10.5 handle the cutover so combat doesn't regress mid-milestone.

---

## Deferred — NOT required, out of MVP unless re-ratified

Per `IMPLEMENTATION_PLAN.md` §15 and `CLAUDE.md` §Scope control Phase 2 carve-out 3:

- Per-hero-unique attack art (e.g. a Warrior-specific vs Knight-specific swing).
- Per-enemy-unique attack art.
- Per-effect-unique art beyond the 5 shared categories above.
- Multi-frame / sprite-sheet / rigged animation, idle/hit/death pose variants.
- Tier-variant art (Silver-tier alternate sprites) — tier is shown via the card badge, not the base sprite.

If any deferred item is wanted later it requires a fresh scope amendment before art or code.

---

## Summary

| Set | Count | Path | Status |
|-----|------:|------|--------|
| Hero base | 12 | `Assets/Art/Units/Heroes/` | Required (M10.4) |
| Enemy base | 16 | `Assets/Art/Units/Enemies/` | Required (M10.4) |
| Shared effects | 5 | `Assets/Art/Effects/` | Required (M10.5) |
| **Total required** | **33** | | |
| Per-unit / per-effect unique art | — | — | Deferred, out of MVP |
