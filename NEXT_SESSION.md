# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M9.1 - Bronze->Silver tiering foundation

**Milestone:** M9 - Bronze->Silver tiering
**Slice goal:** Introduce a per-hero `Tier` (Bronze default, Silver upgradeable), wire duplicate-hire of a Bronze hero already in the party to merge into Silver, surface the tier in the `HeroCardView` reserved tier slot, and apply the M9 per-hero Silver bonus during the run/combat math. Shop offers may surface Silver heroes per `IMPLEMENTATION_PLAN.md` §15 Milestone 9.

### Background

M8.1 introduced `HeroCardView` + the role color palette + a reserved empty tier slot, plus an unused `GameRules.BronzeBadgeColor`. M8.2 propagated `HeroCardView` to Formation with live instance values for ATK / `UpkeepThisRound`. M9 is where the reserved tier slot stops being decorative and tier starts driving real numbers.

CLAUDE.md §Scope control Phase 2 carve-out: tiering is Bronze->Silver only, **no Gold tier**, and tiering does **not** introduce equipment, traits, factions, or synergies. Per-hero Silver bonus only.

### Acceptance Criteria (draft - finalize during Orient/Plan)

1. A `HeroTier` enum (`Bronze`, `Silver`) exists; `HeroInstance` exposes a `Tier` field defaulting to `Bronze`.
2. Hiring a Bronze hero whose `HeroDefinition` is already in the party merges into Silver (no extra party slot is consumed; gold cost behavior per `IMPLEMENTATION_PLAN.md` §15).
3. `HeroCardView` fills the reserved tier slot with a Bronze badge (using `GameRules.BronzeBadgeColor`) for Bronze and a distinguishable Silver badge for Silver. Empty slots and definition-only Refresh paths still leave the tier slot reserved/empty per M8.1.
4. Silver heroes apply the M9 per-hero Silver bonus in combat / upkeep math (`HeroEffects` and/or `RunManager`), tuned via constants in `GameRules`.
5. No Gold tier. No equipment, traits, factions, or synergies. No new `HeroEffectId` values unless required by a single Silver bonus hook; no `UnityEngine.Random`, tweens, audio/VFX, forbidden folders.

### Files Claude Code May Create / Modify

```
DungeonDebt/Assets/Scripts/Data/GameEnums.cs            - add HeroTier enum.
DungeonDebt/Assets/Scripts/Data/HeroInstance.cs         - add Tier field, default Bronze.
DungeonDebt/Assets/Scripts/Run/ShopManager.cs           - duplicate-hire merge into Silver; offer-pool semantics may change to allow Silver offers.
DungeonDebt/Assets/Scripts/Core/DataRepository.cs       - Silver offer surfacing if pool-driven.
DungeonDebt/Assets/Scripts/Core/GameRules.cs            - Silver bonus tunables, Silver badge color.
DungeonDebt/Assets/Scripts/UI/HeroCardView.cs           - fill reserved tier slot per Tier.
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs OR
DungeonDebt/Assets/Scripts/Run/RunManager.cs            - apply Silver bonus.
TestPlans/TP_M9.1.md
```

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden folders.
- Anything Gold-tier, equipment, trait, faction, or synergy related.
- `CombatManager.cs`, `CombatLogger.cs`, `EnemyDefinition.cs`, `EncounterDefinition.cs` unless a Silver hook strictly requires it (raise as a planning question if so).
- `PROGRESS.md` / `REGRESSIONS.md` mid-session unless user asks.

### Relevant Context To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` §15 (Phase 2 plan) and §7 (hero list) - especially the Silver bonus spec.
- `CLAUDE.md` §Scope control Phase 2 carve-out (Bronze->Silver only, no Gold).
- `PROGRESS.md` latest entries (M8.1, M8.2).
- `HeroCardView.cs` (M8.1) - tier slot is already rendered as a faintly filled outlined rect; M9.1 will add a glyph/fill keyed off Tier.
- `ShopManager.cs` - current hire flow + the `Party.Count` -> first-empty-slot fix from R003.

### Test Plan Output

`TestPlans/TP_M9.1.md` covering:

- **Happy path:** Hire a Bronze hero. Hire the same hero again -> merges to Silver in the same slot; card shows Silver badge; per-hero Silver bonus applies in next combat / upkeep math.
- **Edge cases:** merge attempt when target is already Silver (no-op or refund - per design); merge attempt when party is full; merge attempt when offer pool happens to surface a Silver hero directly.
- **Observable invariants:** party size never grows from a merge; tier slot is always visibly filled (Bronze or Silver) on every occupied card; empty slots still show the reserved-but-empty look.

(Per `SESSION_PROTOCOL.md` step 6: omit Rule checks. Include Regression checks only if the slice's diff plausibly threatens upkeep math, combat resolution, or shop hire flow - and if so, name the exact at-risk seam.)

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
