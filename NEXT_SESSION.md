# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M2.2 - Post-combat resource math and reward summary shell

**Milestone:** M2 - Run State and Resources
**Slice goal:** Add the first post-combat economy step for the sandbox run: after the existing combat resolves, apply win/loss reward, upkeep shortfall, debt interest, and morale loss to `RunState`, then show the math in a visible `RewardSummaryView`. **No full 10-round loop, victory/defeat screens, shop, payroll choices, formation editing, scout panel, rivals, save/load, or new combat rules yet.**

This slice builds directly on M2.1. The run header already displays round/gold/debt/morale after `RunManager.InitializeRun()`. M2.2 should make one completed sandbox combat update those resources in a testable way and refresh the header.

### Acceptance criteria

1. After sandbox combat finishes, `RunManager` applies post-combat resource math to the current `RunState`: reward gold, party upkeep, shortfall converted to debt, interest, and morale loss on defeat.
2. `RewardSummaryView` displays the result of that math clearly enough to verify gold gained, upkeep paid/shortfall, interest paid or added to debt, morale change, and final gold/debt/morale.
3. `RunHeaderView` refreshes after post-combat math and matches the final values shown in `RewardSummaryView`.
4. Numeric rules come from `GameRules` and existing `HeroInstance.UpkeepThisRound`; no new magic numbers are introduced in logic files.
5. Existing M1.3/M2.1 start and restart sandbox flow remains usable, deterministic, and scene-independent at the combat resolver level.

### Files Claude Code creates

```
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
TestPlans/TP_M2.2.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
DungeonDebt/Assets/Scripts/UI/CombatLogView.cs
DungeonDebt/Assets/Scripts/Data/RunState.cs
```

- Modify `RunManager.cs` to calculate and apply one post-combat economy result for the current run.
- Modify `GameManager.cs` only if a small state transition hook is needed for `Reward`.
- Modify `MainMenuPanel.cs` only to call the new post-combat step after log streaming completes and render the summary.
- Modify `RunHeaderView.cs` only if it needs a tiny refresh/formatting adjustment for post-combat values.
- Modify `CombatLogView.cs` only if callback timing needs a compatibility adjustment.
- Modify `RunState.cs` only if storing the latest summary values is cleaner than passing them directly to the view.

### Files Claude Code does NOT create or modify

- `EndScreenView.cs` or any victory/defeat UI.
- Any shop, payroll-choice, formation-editing, scout, rival, save/load, or persistence behavior.
- Any hero/enemy/effect data beyond what already exists for M1.
- Any new combat targeting, damage, status, crit, dodge, type, animation, audio, tween, particle, or VFX behavior.
- Any imported sprites, fonts, audio, animation assets, or prefab polish.
- Any `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders.
- Any Unity Test Framework, NUnit, PlayMode, or EditMode test assets.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 1 - Technical Assumptions
- `IMPLEMENTATION_PLAN.md` Section 2 - Project Folder Structure
- `IMPLEMENTATION_PLAN.md` Section 3 - Core Game State Machine, especially `Combat`, `Reward`, and `Upkeep`
- `IMPLEMENTATION_PLAN.md` Section 4 - `RunState` and `CombatResult`
- `IMPLEMENTATION_PLAN.md` Section 5 - MVP Rule Definitions, especially rewards, morale damage, interest formula, and upkeep rule
- `IMPLEMENTATION_PLAN.md` Section 10 - `RunHeaderView` and `RewardSummaryView`
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 2
- `IMPLEMENTATION_PLAN.md` Section 12 - Recommended Script List for `GameManager`, `RunManager`, `RunHeaderView`, and panel scripts
- `GAME_DESIGN.md` Player Resources, Reward Phase, and Upkeep Phase only as needed for resource labels and expectations

### Notes from previous slice

- M2.1 added `GameState`, `GameManager`, `RunManager.InitializeRun()`, and `RunHeaderView`.
- The existing sandbox UI still uses legacy uGUI `Text` because TMP Essentials/font assets are not available in the fresh project. Continue using uGUI and do not add imported font assets or `Resources/`.
- M2.1 left the sandbox combat path intact. The start button initializes a fresh run and then runs the sandbox combat; Restart Sandbox also initializes a fresh run.
- Manual test observation on M2.1 step 22 found tight spacing between `Dungeon Debt` and `Ready`; this was fixed by moving the status, buttons, and combat log down together in `MainMenuPanel.cs`.

### Test plan output

Claude Code creates `TestPlans/TP_M2.2.md` covering at minimum:

- **Happy path:** Open Unity, press Play, click Start Run, wait for combat, confirm reward/upkeep/interest summary appears and header matches final resources.
- **Fresh-run checks:** Restart Sandbox and confirm the run starts from M2.1 values before applying a fresh post-combat summary.
- **Math checks:** Verify win reward uses `GameRules.WinReward`, loss reward uses `GameRules.LossReward`, upkeep uses `HeroInstance.UpkeepThisRound`, shortfall adds debt, and interest uses `ceil(debt / 3.0)`.
- **Rule checks:** single scene, uGUI only, mouse-only button `onClick`, no new Input System action assets, no `UnityEngine.Random`, no shop/payroll/formation/scout/rival/end-screen behavior, no forbidden folders.
- **Regression checks:** M1.3 combat log still streams; M2.1 header still initializes at round 1/gold 10/debt 0/morale 30 before post-combat math; `CombatManager.StartCombat(...)` remains scene-independent.
- **Observable invariants:** Summary values and header values match, resources never update before combat completes, restarting does not duplicate summary/header UI objects, and the combat log remains readable.

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action - what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
