# Unit Visual Catalog

This document records the first 3D / 2.5D visual-catalog pass for board units.

## Recommendation

Wire hero role placeholders first. Heroes appear in both Formation and Combat, so
role placeholders give the broadest visual coverage without requiring final art
for every unit. The current first pass uses colored pawn-style board markers with
existing PNG portraits inset as fallback detail.

Recommended first group:

- `hero-tank`
- `hero-damage`
- `hero-support`
- `hero-economy`

Opponent families are also cataloged, but can remain grouped placeholders until a
later art pass:

- `enemy-slime`
- `enemy-goblin`
- `enemy-bat`
- `enemy-rival`
- `enemy-boss`
- `enemy-default`

## Repo Paths

Catalog metadata lives in:

```text
web/src/ui/UnitVisualCatalog.js
```

Existing PNG fallback assets remain in:

```text
web/assets/heroes/<heroId>.png
web/assets/heroes/role-<role>.png
web/assets/enemies/<enemyId>.png
web/assets/enemies/enemy-default.png
web/assets/effects/<id-or-role>.png
```

If future model or sprite-sheet files are added, place them under a dedicated
asset subfolder, then add catalog metadata without changing combat data:

```text
web/assets/units/heroes/<heroId>/
web/assets/units/enemies/<enemyId>/
web/assets/units/fallback/
```

Do not add visual asset fields to `HeroDefinition`, `EnemyDefinition`, or
encounter data. Board visuals are presentation lookup data, not game data.

## Lookup Order

Hero visuals:

```text
hero id -> hero role group -> hero fallback placeholder -> PNG portrait fallback
```

Opponent visuals:

```text
opponent id family -> opponent default placeholder -> neutral fallback placeholder -> PNG portrait fallback
```

Unknown or missing inputs:

```text
neutral fallback placeholder -> assets/enemies/enemy-default.png
```

Missing files must never break Formation or Combat. A missing custom visual should
leave the unit on a safe placeholder marker and keep the existing PNG fallback
path available.

## Visual States

Every catalog result exposes fallback states:

- `idle`: bob
- `move`: translate
- `attack`: lunge
- `hit`: flash
- `death`: fade
- `cast`: pulse
- `passive`: glow

Replay events drive these states in `CombatPanel`; the combat resolver does not
know about visuals.

## Licensing

Keep the locked license floor from `IMPLEMENTATION_PLAN.md`:

- CC0 is accepted.
- CC BY is accepted with credit in `web/ATTRIBUTION.md`.
- CC BY-SA, Non-Commercial, unclear, and paid assets are rejected unless the plan
  is explicitly updated first.

This first pass adds no external art and requires no new attribution.
