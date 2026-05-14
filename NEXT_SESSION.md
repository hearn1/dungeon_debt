# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M1.2 - Combat repository and resolver scaffold

**Milestone:** M1 - Combat Sandbox
**Slice goal:** Add the first hardcoded combat data and a pure synchronous combat resolver that can resolve one fixed encounter into a `CombatResult`. **No UI, no scene wiring, no shop, no payroll, no formation editing, and no run economy systems yet.**

This slice builds on M1.1's plain C# data model. It should stay inside `Core/` and `Combat/`, plus the manual test plan.

### Acceptance criteria

1. `GameRules.cs` exists and contains the M1 numeric constants needed by this slice, including `CombatTurnLimit`.
2. `DataRepository.cs` exists as a read-only static repository with only the initial sandbox data: 4-5 heroes, 2-3 enemies, and one hardcoded sandbox encounter.
3. `CombatManager.StartCombat(RunState run, EncounterDefinition encounter)` resolves combat synchronously and deterministically into a `CombatResult`.
4. `CombatLogger` records ordered attack, death, turn-limit, and final result lines; repeated runs with the same inputs produce identical logs.
5. `HeroEffects.cs` exists as a static no-op/stub hook surface only; no extra hero effects, UI behavior, scene edits, prefabs, shop, payroll, formation editing, or run economy systems are introduced.

### Files Claude Code creates

```
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
TestPlans/TP_M1.2.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Data/CombatUnit.cs
```

Only modify `CombatUnit.cs` if the resolver needs a minimal data-field adjustment to implement the plan cleanly, such as damage reduction support for the existing combat formula. If this becomes more than a small compatibility adjustment, stop and ask before proceeding.

### Files Claude Code does NOT create or modify

- Any UI script or panel, including `UI/CombatLogView.cs` and `UI/MainMenuPanel.cs`.
- Any scene, prefab, Canvas, or EventSystem file.
- Any manager outside the current slice, including `GameManager`, `RunManager`, `ShopManager`, `PayrollManager`, `EncounterManager`, or `RivalManager`.
- Any shop, payroll, reward, upkeep, debt, morale, rival update, save/load, or formation-editing behavior.
- Any `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders.
- Any Unity Test Framework, NUnit, PlayMode, or EditMode test assets.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 1 - Technical Assumptions
- `IMPLEMENTATION_PLAN.md` Section 2 - Project Folder Structure
- `IMPLEMENTATION_PLAN.md` Section 4 - Data Model
- `IMPLEMENTATION_PLAN.md` Section 5 - MVP Rule Definitions
- `IMPLEMENTATION_PLAN.md` Section 6 - Combat System Plan
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 1
- `IMPLEMENTATION_PLAN.md` Section 12 - Recommended Script List
- `GAME_DESIGN.md` Auto-Combat Phase and MVP Hero Roster only as needed for combat data names/stats

### Test plan output

Claude Code creates `TestPlans/TP_M1.2.md` covering at minimum:

- **Happy path:** Open Unity, let scripts compile, and confirm the Console has zero errors and zero new warnings.
- **Combat checks:** Resolve the hardcoded sandbox run/encounter through the new resolver and verify the result has ordered log lines, at least one attack line, death lines when enemies die, and a final win/loss line.
- **Determinism checks:** Run the same combat twice with the same hardcoded data and verify the log lines match exactly.
- **Edge cases:** Empty player party immediately loses, empty enemy list immediately wins, and very tanky units hit the turn limit and produce the turn-limit loss line.
- **Rule checks:** No `UnityEngine.Random`, no coroutines or async simulation, no UI/scene/prefab changes, no forbidden folders, and no combat hot-path LINQ.
- **Regression checks:** M1.1 data model files still compile, `Main.unity` still opens, Canvas/EventSystem remain intact, and the Console remains clean.

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action - what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
