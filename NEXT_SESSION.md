# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M8.1 - Card readability foundation

**Milestone:** M8 - Card readability pass
**Slice goal:** Introduce reusable `HeroCardView` and `EnemyCardView` components with role color, prominent upkeep, effect blurb, and a reserved (empty) tier-badge slot - and use them in Shop and Scout. Formation card adoption is deferred to M8.2.

### Background

Phase 2 begins. M1-M7 are complete; M7.3 closeout signed off on 2026-05-15. The Phase 2 plan lives in `IMPLEMENTATION_PLAN.md` §15. CLAUDE.md was amended at the end of the planning session to add a Phase 2 carve-out for trivial UI art and Bronze->Silver tiering.

M8.1 is the foundation slice for the card readability pass. It must produce **reusable** card views, not a one-off shop panel. Combat unit cards belong to M10. Tiering logic belongs to M9 - this slice only reserves the visual slot.

### Acceptance Criteria

1. `HeroCardView` renders a hero (Bronze tier) with: role color band/badge, name, Atk/HP/Upkeep stat block, effect blurb, and a reserved tier-badge area in a fixed corner that is visibly present but empty.
2. `EnemyCardView` renders an enemy with: name, Atk/HP stat block, effect blurb, and an encounter-role hint where applicable.
3. `GameRules` exposes a role color palette (Tank, Damage, Support, Economy) and a Bronze-tier badge color, consumed by both views.
4. The Shop panel renders each shop offer using `HeroCardView`. The Scout panel renders the upcoming enemy (single representative or list) using `EnemyCardView`. Formation panel may continue to use its existing slot view this slice.
5. No tiering merge logic, no HP bars, no combat view changes, no tween animation, no audio/VFX, no forbidden folders.

### Files Claude Code May Create

```
DungeonDebt/Assets/Scripts/UI/EnemyCardView.cs
TestPlans/TP_M8.1.md
```

`HeroCardView.cs` already exists from M3.2 - **modify it in place** to add the role badge, prominent upkeep, effect blurb, and reserved tier-badge slot. Do not create a parallel/replacement file. Only create from scratch if the existing file is genuinely missing.

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/HeroCardView.cs          - existing card extended with role color, upkeep prominence, blurb, reserved tier-badge slot
DungeonDebt/Assets/Scripts/Core/GameRules.cs           - role color palette + Bronze badge color (see C# note below)
DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs         - host or compose HeroCardView
DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs         - adapt offer rendering pipeline if needed
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs        - render enemy preview via EnemyCardView
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs         - only as needed for wiring
```

If a small placeholder sprite set helps the cards read cleaner, files under `DungeonDebt/Assets/Art/` may also be added (kept trivial per CLAUDE.md §Scope control carve-out).

**C# note on role colors:** `UnityEngine.Color` is a struct and **cannot** be declared `const` in C#. Use `public static readonly Color TankColor = new Color(...)` (or a `GetRoleColor(HeroRole)` helper) in `GameRules`. Do not attempt `const Color` - it will not compile.

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - still forbidden.
- `CombatManager`, `CombatLogger`, `HeroEffects`, `HeroDefinition`, `HeroInstance` - out of scope for M8.1.
- `FormationPanelView` / `FormationSlotView` - Formation card adoption is deferred to M8.2.
- Any tiering-related field, enum, or logic - that is M9.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session unless the user explicitly asks for end-of-session doc updates.

### Relevant Context To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` §15 (entire Phase 2 plan), §10 (existing UI panel layout).
- `CLAUDE.md` §Scope control Phase 2 carve-out, and §Core tech decisions (placeholder-art line).
- `PROGRESS.md` latest entries (M7.3, M7.2, R003, M7.1).
- Existing `ShopOfferView.cs`, `ShopPanelView.cs`, `ScoutPanelView.cs`, any pre-existing `HeroCardView` reference in `MainMenuPanel.cs`.
- `DataRepository.cs` for the 12 hero stat references the cards must render correctly.

### Test Plan Output

Claude Code creates `TestPlans/TP_M8.1.md` covering:

- **Happy path:** Open Shop -> 3 offers render as cards with role color, stats, blurb, empty tier-badge slot visible. Scout -> enemy preview renders as enemy card.
- **Edge cases:** heroes with "No effect." blurb (Warrior, Squire), longest hero name, longest effect blurb wrap, low-stat heroes (Apprentice), high-HP hero (Golem).
- **Rule checks:** no `UnityEngine.Random`; no tiering logic introduced; no combat view changes; no forbidden folders; any sprite added under `Assets/Art/` is trivial and placeholder.
- **Regression checks:** M1.3 combat log streams; M3.2 Hire/Fire/Reroll still works; M6.1 Scout flow routes through all 10 encounters; M7 leaderboard panels intact on Scout and RivalUpdate.
- **Observable invariants:** every hero card shows exactly one role badge, one stat block, one (empty) tier-badge slot; enemy cards never overflow panel bounds; no card displays negative stats.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
