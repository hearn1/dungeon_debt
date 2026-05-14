# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M2.1 - Run state bootstrap and header shell

**Milestone:** M2 - Run State and Resources
**Slice goal:** Introduce the minimal run lifecycle shell: a `GameState` enum, `GameManager` state owner, `RunManager.InitializeRun()`, and a visible run header that shows round/gold/debt/morale after starting a run. **No reward math, upkeep math, interest, loss screens, shop, payroll, formation editing, rivals, save/load, or new combat rules yet.**

This slice builds on the completed M1 combat sandbox UI and the existing `RunState`/`GameRules` data. It should make the first M2 resource state visible and verifiable without implementing the full M2 post-combat economy loop.

### Acceptance criteria

1. `Main.unity` still opens as one scene with the existing Canvas/EventSystem and a start button.
2. Clicking the start button initializes a fresh `RunState` through `RunManager.InitializeRun()` with `Round = 1`, `Gold = GameRules.StartingGold`, `Debt = GameRules.StartingDebt`, and `Morale = GameRules.StartingMorale`.
3. `GameManager` owns the current `GameState`, exposes `ChangeState(GameState)`, and state changes go through that method.
4. `RunHeaderView` displays the current round, gold, debt, and morale from the initialized `RunState`.
5. The existing M1.3 sandbox combat path remains usable enough to verify the resolver still runs, but no reward/upkeep/interest/loss-condition math is added in this slice.

### Files Claude Code creates

```
DungeonDebt/Assets/Scripts/Core/GameState.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
TestPlans/TP_M2.1.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scenes/Main.unity
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
DungeonDebt/Assets/Scripts/UI/CombatLogView.cs
```

- Modify `Main.unity` only to attach/wire the new `GameManager`/`RunManager`/header shell on the existing Canvas if needed.
- Modify `MainMenuPanel.cs` only enough to route the start button through `GameManager`/`RunManager` and refresh the header.
- Modify `CombatLogView.cs` only if the M1.3 UI needs a tiny compatibility adjustment for the new shell.

### Files Claude Code does NOT create or modify

- `RewardSummaryView.cs`, `EndScreenView.cs`, or any defeat/victory UI.
- Any shop, payroll, formation-editing, scout, reward, upkeep, interest, debt-loss, morale-loss, rival, save/load, or persistence behavior.
- Any hero/enemy/effect data beyond what already exists for M1.
- Any imported sprites, audio, animation assets, tweens, particles, or VFX.
- Any `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders.
- Any Unity Test Framework, NUnit, PlayMode, or EditMode test assets.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 1 - Technical Assumptions
- `IMPLEMENTATION_PLAN.md` Section 2 - Project Folder Structure
- `IMPLEMENTATION_PLAN.md` Section 3 - Core Game State Machine, especially `MainMenu` and `StartRun`
- `IMPLEMENTATION_PLAN.md` Section 4 - `RunState`
- `IMPLEMENTATION_PLAN.md` Section 5 - MVP Rule Definitions, starting resource constants only
- `IMPLEMENTATION_PLAN.md` Section 10 - `RunHeaderView`
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 2
- `IMPLEMENTATION_PLAN.md` Section 12 - Recommended Script List for `GameManager`, `RunManager`, and `RunHeaderView`
- `GAME_DESIGN.md` Player Resources only as needed for starting gold/debt/morale labels

### Notes from previous slice

- M1.3 completed the combat sandbox UI and made the M1 resolver testable through Play mode.
- The M1.3 UI originally attempted TextMeshPro, but TMP text rendered invisible in this fresh project because TMP font assets/imported Essentials were unavailable. The generated sandbox labels now use legacy uGUI `Text` as a narrow testability deviation. Continue using uGUI. Do not add imported font assets or `Resources/` for M2.1 unless the plan is explicitly updated.
- The user reported most `TP_M1.3.md` checks passed after the text fix. Steps 20-21 were skipped as unclear source-inspection checks; step 24 was marked "appears to pass" because repeated Slime names make individual unit identity hard to distinguish.

### Test plan output

Claude Code creates `TestPlans/TP_M2.1.md` covering at minimum:

- **Happy path:** Open Unity, let scripts compile, open `Main.unity`, press Play, click the start button, and confirm the run header shows round 1, gold 10, debt 0, morale 30.
- **Fresh-run checks:** Stop and restart Play mode, then start again and confirm the header resets to the same starting values.
- **State checks:** Confirm `GameManager.ChangeState(GameState)` is the state transition path and `GameManager` owns the current state.
- **Rule checks:** single scene, uGUI only, mouse-only button `onClick`, no new Input System action assets, no `UnityEngine.Random`, no reward/upkeep/interest/loss-condition math, no forbidden folders.
- **Regression checks:** M1.3 Start/Restart combat UI still runs the fixed sandbox combat; `CombatManager.StartCombat(...)` remains scene-independent; Console remains clean.
- **Observable invariants:** Header values never show negative numbers in this slice, starting values match `GameRules`, and starting a fresh run does not duplicate header UI objects.

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action - what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
