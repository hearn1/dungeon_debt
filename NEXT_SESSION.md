# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.1 - Combat view rebuild kickoff

**Milestone:** M10 - Combat view rebuild
**Slice goal:** Start the M10 combat presentation rebuild by adding a visible combat unit-card panel for player/enemy units, fed by already-resolved combat data, while keeping the existing synchronous combat resolver and text log behavior unchanged.

### Background

M8 made hero/enemy/shop/formation cards readable. M9 completed Bronze->Silver tiering, Silver shop offers, per-hero Silver bonuses, and upgrade delta previews. M10 consumes that work in combat presentation: combat should no longer be text-only forever, but this first slice should be a careful UI foundation rather than a rewrite of combat math.

Per `IMPLEMENTATION_PLAN.md` §15 Milestone 10:

- Unit-card combat panel shows each combatant as a card with HP information, role color, and tier badge where applicable.
- Turn highlighting and step-by-step HP bar replay are in scope for M10, but can be sliced after the static panel foundation if needed.
- Combat log remains available as a secondary pane.
- Combat resolver remains synchronous and deterministic.

### Acceptance Criteria (draft - finalize during Orient/Plan)

1. Combat view shows player and enemy combatants as visible cards/panels during the Combat state, separate from the existing text log.
2. Each player combat card shows hero name, tier badge for Bronze/Silver, ATK, and HP/max HP. Each enemy combat card shows enemy name, ATK, and HP/max HP.
3. The new view is populated from combat-start/combat-result data without changing combat resolution rules, target rules, rewards, upkeep, or hero effects.
4. Existing `CombatLogView` remains visible and continues to stream the full resolved log.
5. No tweens, particles, audio, new combat states, new statuses, or behavior changes.

### Files Claude Code May Create / Modify

```
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs          - new reusable uGUI card for one combat unit snapshot.
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs             - if needed: host player/enemy combat card rows beside/above the existing log.
DungeonDebt/Assets/Scripts/UI/CombatLogView.cs               - only if needed to fit beside the new panel; keep log behavior intact.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs               - only if current scene bootstrap still owns combat UI layout creation.
DungeonDebt/Assets/Scripts/UI/UIManager.cs                   - only if combat panel visibility is currently routed there.
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs           - only if a read-only combat snapshot is needed; do not change resolver behavior.
DungeonDebt/Assets/Scripts/Data/CombatResult.cs              - only if needed to carry final/start snapshots for UI display.
TestPlans/TP_M10.1.md
```

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden folders.
- `GameRules.cs` tuning, hero/enemy data, shop, payroll, reward, upkeep, or rival logic.
- Any combat math, targeting, hero effects, reward logic, or run flow behavior unless explicitly confirmed during Plan.
- Gold tier, traits/factions/synergies, equipment, audio/VFX, tweens, particles.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session unless user asks.

### Relevant Context To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` §15 Milestone 10.
- `CLAUDE.md` §Scope control and §Architectural rules.
- Latest `PROGRESS.md` entries for M9.3, M9.2, M9.1.
- `CombatManager.cs`, `CombatResult.cs`, `CombatLogView.cs`, and the UI script that currently constructs/shows combat UI.
- `HeroCardView.cs` and `EnemyCardView.cs` for visual conventions worth reusing without creating nested cards.

### Test Plan Output

Create `TestPlans/TP_M10.1.md` covering:

- **Happy path:** Start a run, enter combat, see player/enemy combat cards plus the existing log; log still streams to completion.
- **Edge cases:** Empty party combat, empty enemy encounter if easy to trigger with a temporary scaffold, dead/damaged units after combat result, Silver hero tier badge in combat.
- **Observable invariants:** combat log remains complete; cards do not overlap; no gameplay numbers change; player cards show tier while enemy cards do not.
- **Regression checks:** Include only seams touched in the final plan, especially any `CombatResult` or `CombatManager` data-shape changes if they happen.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
