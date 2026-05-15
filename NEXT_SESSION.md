# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M7.1 - Rival state and leaderboard loop

**Milestone:** M7 - Rival Ghosts (first slice)
**Slice goal:** Add the local scripted rival state, per-round rival update loop, and visible player-plus-rivals leaderboard without replacing the Round 3/6/9 placeholder ghost fights yet.

### Background

M6.2 completed the encounter and hero effect layer for the 10-round run. M7 now adds the offline scripted rival pressure described in `IMPLEMENTATION_PLAN.md` §9. This first M7 slice should make rivals exist, advance deterministically after each player round, and show in the UI during Scout / RivalUpdate. It should not yet implement the scripted ghost combat teams or rival ghost reward/morale modifiers; those are a later M7 slice.

### Acceptance Criteria

1. **Rival initialization.** Starting a run initializes exactly 3 rivals in `RunState.Rivals`: Greedy Guild, Frugal Guild, and Carry Guild with the stats from `IMPLEMENTATION_PLAN.md` §9.
2. **Rival update state.** After the player's Reward/Upkeep math, continuing a non-terminal round enters `GameState.RivalUpdate`, calls `RivalManager.AdvanceRivals(run)`, then lets the user continue to the next Scout.
3. **Scripted rival math.** Rival payroll/debt/morale update deterministically per §9: Greedy +2 payroll plus even-round debt creep, Frugal +1 payroll and debt reduction when applicable, Carry alternating +1/+2 payroll by round.
4. **Leaderboard display.** A `RivalLeaderboardView` shows 4 rows: player plus 3 rivals, sorted by morale descending, with columns Guild / Morale / Debt / Payroll / Status.
5. **Scout integration.** The leaderboard is visible during Scout in a compact or unobtrusive form and updates after each RivalUpdate. It must not obscure Scout, Shop, Formation, Payroll, Combat, Reward, Victory, or Defeat controls.
6. **Scope preserved.** Rounds 3/6/9 may still use the existing Slime placeholder encounters; no online ghosts, real multiplayer, rival shop simulation, accounts, save/load, or new architecture.

### Files Claude Code May Create

```
DungeonDebt/Assets/Scripts/Run/RivalManager.cs
DungeonDebt/Assets/Scripts/UI/RivalLeaderboardView.cs
TestPlans/TP_M7.1.md
```

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
  - Add read-only rival profile data if needed, using the existing `RivalGuildState` shape and §9 values.

DungeonDebt/Assets/Scripts/Core/GameManager.cs
  - Wire `RivalManager`, route continuing rounds through `RivalUpdate`, and add Continue-from-RivalUpdate handling.

DungeonDebt/Assets/Scripts/Run/RunManager.cs
  - Initialize rivals at run start and route `EvaluateNextState()` to `RivalUpdate` for non-terminal rounds.

DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
  - Build and wire `RivalLeaderboardView`; show it during Scout and RivalUpdate only, unless existing UI patterns suggest a cleaner narrow integration.

DungeonDebt/Assets/Scripts/Data/RivalGuildState.cs
  - Only modify if existing fields are insufficient for §9 scripted updates; do not add persistence or dynamic team data.
```

### Files Claude Code Does NOT Create or Modify

- `CombatManager.cs`, `HeroEffects.cs` - M6.2 combat/effect behavior should remain unchanged.
- `ShopManager.cs`, `PayrollManager.cs`, `FormationPanelView.cs` - not part of the rival state/leaderboard slice.
- `EncounterManager.cs`, `ScoutPanelView.cs` - avoid changes unless a tiny display refresh hook is necessary and called out in the plan.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session.

### Open Questions To Resolve At Plan Time

1. **Leaderboard placement.** `IMPLEMENTATION_PLAN.md` says Scout should show a compact leaderboard and RivalUpdate should show the full leaderboard. Decide whether M7.1 uses one reusable view with a compact flag or one simple full view shown in both states for MVP.
2. **Round update timing.** Recommended: after Reward Summary Continue, `RunManager.EvaluateNextState()` returns `RivalUpdate` for non-terminal rounds; `RivalUpdate` advances rivals for the just-finished round, then Continue increments the player round and enters Scout.
3. **Rival profile storage.** Recommended: keep static profile construction in `DataRepository` or `RivalManager.InitializeRivals()` with hardcoded values from §9; do not add JSON, ScriptableObjects, or dynamic rival team data.
4. **Carry payroll growth.** Confirm implementation uses +1 on odd finished rounds, +2 on even finished rounds as specified in §9.

### Relevant Plan Sections To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` §3 - `RivalUpdate` state timing and UI behavior.
- `IMPLEMENTATION_PLAN.md` §4 - `RivalGuildState` and `RunState.Rivals`.
- `IMPLEMENTATION_PLAN.md` §9 - rival profile values, scripted update rules, leaderboard sorting.
- `IMPLEMENTATION_PLAN.md` §10 - `RivalLeaderboardView` display requirements.
- `IMPLEMENTATION_PLAN.md` §11 Milestone 7 - required behavior and out-of-scope notes.
- `GAME_DESIGN.md` Rival Update Phase and Rival Guild Ghost System - design intent for local scripted rivals.
- `CLAUDE.md` scope control - no real multiplayer, online ghosts, accounts, save/load, or larger architecture.

### Notes From Previous Slice (M6.2)

- Encounter and hero effects are now wired through `HeroEffects`, `CombatManager`, `RunManager`, and `DataRepository`.
- `TP_M6.2.md` was corrected for Treasure Leech: because combat wins require all enemies dead, a surviving Leech means combat loss and drains the 4-gold loss reward to 0.
- `GameRules.StartingGold` is restored to 10.
- `dotnet build DungeonDebt.sln` passed with 0 warnings and 0 errors after the M6.2 correction.
- Rounds 3/6/9 are still `EncounterType.RivalGhost` but currently use Slime placeholder enemy teams. Keep that as-is in M7.1 unless the user explicitly changes scope.

### Test Plan Output

Claude Code creates `TestPlans/TP_M7.1.md` covering:

- **Happy path:** Start Run -> Scout shows leaderboard -> complete Round 1 -> Reward Continue enters RivalUpdate -> rivals advance -> Continue enters Round 2 Scout with updated leaderboard.
- **Per-rival math:** Verify Greedy, Frugal, and Carry payroll/debt/morale changes over at least 3 rounds, including Carry alternating +1/+2.
- **Leaderboard sorting:** Player and rivals display as 4 rows sorted by morale descending; ties are deterministic and visually stable.
- **State routing:** Terminal outcomes still go to Victory/Defeat instead of RivalUpdate.
- **Rule checks:** No `UnityEngine.Random`; no new data files, ScriptableObjects, Resources, Tests, Editor folder, online/real multiplayer code, or event bus/DI/service locator.
- **Regression checks:** M6.2 effects still trigger; Scout -> Shop -> Formation -> Payroll -> Combat -> Reward remains intact; Reward Summary still displays payroll/economy math.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
