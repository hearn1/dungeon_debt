# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M8.2 - Formation card adoption

**Milestone:** M8 - Card readability pass
**Slice goal:** Adopt the M8.1 `HeroCardView` inside `FormationPanelView` / `FormationSlotView` so the formation lineup shares the readability pass (role band, role badge, prominent Upkeep, wrapped blurb, empty reserved tier slot). Drag/click slot semantics, frontline/backline distinction, and combat targeting remain unchanged.

### Background

M8.1 (2026-05-15) introduced reusable `HeroCardView` and `EnemyCardView` plus a role color palette + Bronze badge color in `GameRules`. Shop and Scout now render through them. Formation was deliberately deferred so the foundation slice could land cleanly. M8.2 closes the loop on milestone M8 by bringing Formation into the same visual language.

### Acceptance Criteria

1. Each occupied formation slot renders its hero through `HeroCardView` (or a thin wrapper that hosts it), showing role band, role badge, ATK/HP, prominent Upkeep, blurb, and the empty reserved tier-slot.
2. Empty formation slots still render a clearly empty-looking placeholder distinguishable from an occupied card. Frontline vs backline remains visually obvious (existing labelling, color, or layout cue).
3. Drag/click slot reassignment, frontline/backline targeting, and any existing slot affordances continue to work exactly as before. No combat-side changes.
4. Bronze->Silver tier visuals remain a reserved empty slot (no tier glyph, no Bronze fill). Tier logic stays an M9 concern.
5. No `UnityEngine.Random`, no tween/animation, no audio/VFX, no forbidden folders.

### Files Claude Code May Create

```
TestPlans/TP_M8.2.md
```

(May add a `FormationCardView` thin wrapper if it's the cleanest way to compose `HeroCardView` inside the existing slot.)

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/FormationSlotView.cs   - host HeroCardView for occupied slots; keep empty-slot placeholder.
DungeonDebt/Assets/Scripts/UI/FormationPanelView.cs  - pass through font/data so slots can build the new view; tweak slot sizing if needed.
```

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - still forbidden.
- `CombatManager`, `CombatLogger`, `HeroEffects`, `HeroDefinition`, `HeroInstance`, `EnemyDefinition` - out of scope.
- `ShopOfferView`, `ShopPanelView`, `ScoutPanelView`, `EnemyCardView`, `HeroCardView` (beyond an additive parameter if strictly needed) - already settled in M8.1.
- Any tier enum/field/logic - that is M9.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session unless user asks.

### Relevant Context To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` §15 (Phase 2 plan) and §10 (existing UI panel layout).
- `CLAUDE.md` §Scope control Phase 2 carve-out.
- `PROGRESS.md` latest entry (M8.1).
- `SESSION_PROTOCOL.md` step 6 - test plan now defaults to Happy path / Edge cases / Observable invariants only; no Rule checks; Regression checks opt-in.
- Existing `FormationSlotView.cs`, `FormationPanelView.cs`, and the M8.1 `HeroCardView.cs` to confirm the API for hosting it.

### Test Plan Output

`TestPlans/TP_M8.2.md` covering:

- **Happy path:** Formation panel shows occupied slots as full hero cards (role band, badge, ATK/HP, Upkeep, blurb, empty tier slot). Empty slots render as obvious placeholders.
- **Edge cases:** longest-name hero in a slot; lowest-stat (Apprentice) in a slot; full 5/5 party with one of each role visible at once; partial party (e.g. 2 occupied, 3 empty) renders cleanly.
- **Observable invariants:** 5 slots always present (2 frontline + 3 backline); occupied slots never overlap; an empty slot never renders hero data; frontline/backline visual distinction is preserved.

(Per updated `SESSION_PROTOCOL.md` step 6, omit Rule checks. Add a short Regression check only if the slice's diff plausibly threatens drag/click reassignment or frontline targeting - and if so, name the exact at-risk seam.)

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
