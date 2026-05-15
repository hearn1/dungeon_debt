# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.2 - Combat replay and visual feasibility prototype

**Milestone:** M10 - Combat view rebuild
**Slice goal:** Prototype live combat replay visuals on top of the M10.1 formation-style combat board, enough to decide whether uGUI can carry M10's attack/take-damage presentation or whether the combat view needs a planned GameObject-based representation.

### Background

M10.1 replaced text-only combat with a static combat board. The board now shows fixed formation lanes:

- `Enemy Back`
- `Enemy Front`
- `Hero Front`
- `Hero Back`

The board is still fed by already-resolved combat data. It shows placeholder unit tiles with names, HP bars, hero tier-colored borders, enemy accent bands, and red dead-state styling. The combat log remains below the board as a smaller secondary pane.

M10.2 should test the next risk before investing further: can the current uGUI board support clear, simple replay visuals, or should M10 pivot to a more game-object-like combat representation for unit sprites, attack motion, damage feedback, and live HP changes?

Per `IMPLEMENTATION_PLAN.md` section 15 Milestone 10:

- Turn highlighting and step-by-step HP bar replay are in scope for M10.
- `CombatLogView` remains available as a secondary pane.
- Combat resolver remains synchronous and deterministic.
- Combat math changes, tween animation libraries, particles, VFX, audio, and new combat states are out of scope.

### Acceptance Criteria (draft - finalize during Orient/Plan)

1. Combat replay updates unit HP bars during the log/replay sequence instead of only showing start and final HP.
2. At least one simple attack/take-damage visual prototype is visible during replay, such as acting-unit highlight plus target flash, using uGUI-safe placeholder feedback only.
3. The resolved combat log remains visible and still reaches the same final result; replay visuals do not change combat math, targeting, rewards, upkeep, hero effects, or run flow.
4. The slice ends with an explicit feasibility note: continue with the current uGUI combat board for M10, or stop and plan a GameObject/sprite representation refactor before deeper animation work.
5. No DOTween/LeanTween, imported art, particles, audio, new combat states, new statuses, or broad combat architecture refactor unless the user explicitly confirms a plan change.

### Files Claude Code May Create / Modify

```
DungeonDebt/Assets/Scripts/Data/CombatResult.cs              - likely: add structured replay events/snapshots for UI replay, while preserving LogLines.
DungeonDebt/Assets/Scripts/Data/CombatReplayEvent.cs         - if needed: plain C# event data for attacks, deaths, heals, and messages.
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs           - likely: emit replay events alongside existing log lines; do not change resolver decisions.
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs            - only if needed to keep log text and replay events aligned.
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs             - likely: expose card lookup/update/highlight methods for replay.
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs          - likely: support HP updates, acting/target highlighting, and dead-state refresh.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs               - likely: coordinate replay timing with the existing combat log flow.
DungeonDebt/Assets/Scripts/UI/CombatLogView.cs               - only if needed to coordinate line-by-line replay timing; keep log readable.
TestPlans/TP_M10.2.md
```

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden folders.
- Hero/enemy data, shop, payroll, reward, upkeep, rival logic, or economy tuning.
- `HeroEffects.cs` unless a replay-event hook is explicitly required and confirmed during Plan.
- Gold tier, equipment, traits/factions/synergies, imported sprite sets, audio/VFX, particles, DOTween/LeanTween.
- A full GameObject/sprite combat refactor in this slice unless the Plan checkpoint explicitly changes scope.
- `REGRESSIONS.md` mid-session unless a new regression is being filed at session end.

### Relevant Context To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` section 15 Milestone 10.
- `IMPLEMENTATION_PLAN.md` section 6 combat flow and section 10 combat panel/log guidance.
- `CLAUDE.md` Scope control, Architectural rules, and Common pitfalls.
- Latest `PROGRESS.md` entries for M10.1 and M9.3.
- `CombatManager.cs`, `CombatLogger.cs`, `CombatResult.cs`.
- `CombatPanelView.cs`, `CombatUnitCardView.cs`, `CombatLogView.cs`, `MainMenuPanel.cs`.
- `FormationPanelView.cs` only as visual/layout reference; do not change formation behavior.

### Test Plan Output

Create `TestPlans/TP_M10.2.md` covering:

- **Happy path:** Start a run, enter combat, see HP bars update during replay, with acting/target feedback visible and log still readable.
- **Edge cases:** empty party combat, empty enemy encounter with temporary scaffold if needed, deaths, heals, multi-hit/redirect-like cases if reachable, and Silver hero tier border surviving replay.
- **Observable invariants:** replay ends at the same final HP/dead states as the resolved result; no card overlap; combat log still reaches the final result; no gameplay numbers change.
- **Regression checks:** focus on `CombatResult`/`CombatManager` replay data-shape changes, `CombatLogView` timing if touched, and `MainMenuPanel` state routing.
- **Feasibility note:** include a final section stating whether uGUI is sufficient for the next M10 slice or whether a planned GameObject/sprite refactor should be proposed before continuing.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
