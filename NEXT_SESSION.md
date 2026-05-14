# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M2.3 - Round advance, run loss checks, and end-screen shell

**Milestone:** M2 - Run State and Resources
**Slice goal:** Add the next run-state step after the M2.2 reward/upkeep summary: let the player continue from the summary, check morale/debt/final-round outcomes, advance the round for another repeated sandbox fight when the run continues, and show a minimal `EndScreenView` for victory/defeat. **No shop, payroll choices, formation editing, scout panel, rivals, save/load, new encounters, imported assets, or new combat rules yet.**

This slice builds directly on M2.2. The sandbox now initializes a current `RunState`, runs deterministic combat, applies post-combat resource math, refreshes the header, and shows the result in `RewardSummaryView`. M2.3 should make that summary lead somewhere: either another sandbox round using the same repeated encounter, or a minimal end screen when M2 loss/victory conditions are met.

### Acceptance criteria

1. After a completed reward summary, a visible Continue/Next Round action advances through `RunManager` and `GameManager.ChangeState(...)` rather than directly mutating state from UI code.
2. Continuing checks M2 run outcomes: `Morale <= 0` triggers Defeat, `Debt >= GameRules.DebtLimit` triggers Defeat, and winning after round 10 triggers Victory.
3. If no end condition is met, the run advances to the next round, `RunHeaderView` refreshes to the new round/resources, and the same sandbox combat flow remains usable for the next repeated encounter.
4. `EndScreenView` displays a minimal victory/defeat result with reason and final round/gold/debt/morale, plus a mouse-only uGUI button to return to a fresh start/restart state.
5. Existing M2.2 reward summary behavior remains intact: summary appears only after combat streaming completes, final header values match summary values, and combat resolver code stays scene-independent.

### Files Claude Code creates

```
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs
TestPlans/TP_M2.3.md
```

Unity may also create:

```
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs.meta
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
DungeonDebt/Assets/Scripts/Data/RunState.cs
```

- Modify `RunManager.cs` to evaluate end conditions and advance the run round after the post-combat summary.
- Modify `GameManager.cs` only for small state-transition helpers or state ownership needed by continue/end-screen flow.
- Modify `MainMenuPanel.cs` to add a Continue/Next Round action, show/hide the minimal end screen, and keep the current runtime-built uGUI approach.
- Modify `RunHeaderView.cs` only if a tiny refresh/formatting adjustment is needed for advanced rounds.
- Modify `RewardSummaryView.cs` only if it needs a continue callback/button surface or small text adjustment.
- Modify `RunState.cs` only if storing the latest end reason/outcome is cleaner than passing it directly to the view.

### Files Claude Code does NOT create or modify

- Any shop, payroll-choice, formation-editing, scout, rival, save/load, or persistence behavior.
- Any new encounter list beyond repeating the existing sandbox encounter for M2 run-state testing.
- Any hero/enemy/effect data beyond what already exists for M1/M2 sandbox work.
- Any new combat targeting, damage, status, crit, dodge, type, animation, audio, tween, particle, or VFX behavior.
- Any imported sprites, fonts, audio, animation assets, or prefab polish.
- Any `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders.
- Any Unity Test Framework, NUnit, PlayMode, or EditMode test assets.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 1 - Technical Assumptions
- `IMPLEMENTATION_PLAN.md` Section 2 - Project Folder Structure
- `IMPLEMENTATION_PLAN.md` Section 3 - Core Game State Machine, especially `Reward`, `Upkeep`, `Victory`, and `Defeat`
- `IMPLEMENTATION_PLAN.md` Section 4 - `RunState` and `CombatResult`
- `IMPLEMENTATION_PLAN.md` Section 5 - MVP Rule Definitions, especially run win/loss checks and debt limit
- `IMPLEMENTATION_PLAN.md` Section 10 - `RunHeaderView`, `RewardSummaryView`, and `EndScreenView`
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 2
- `IMPLEMENTATION_PLAN.md` Section 12 - Recommended Script List for `GameManager`, `RunManager`, `RunHeaderView`, and panel scripts
- `GAME_DESIGN.md` Player Resources, Win and Loss Conditions, Reward Phase, and Upkeep Phase only as needed for labels and expectations

### Notes from previous slice

- M2.2 added `RewardSummaryView`, post-combat economy math, and summary storage fields on `RunState`.
- The sandbox combat now uses the current `RunState` prepared by `RunManager.PrepareSandboxRun()`, so the header, combat, and reward summary all refer to the same run.
- `GameRules.InterestDebtDivisor` was added with explicit confirmation to avoid hardcoding the interest divisor in logic.
- The existing sandbox UI still uses legacy uGUI `Text` because TMP Essentials/font assets are not available in the fresh project. Continue using uGUI and do not add imported font assets or `Resources/`.
- `TestPlans/TP_M2.2.md` passed for core user-visible behavior; temporary setup math/edge scenarios were skipped because the plan did not say exactly how to force loss/debt/high-upkeep cases. Make any M2.3 temporary setup steps explicit.

### Test plan output

Claude Code creates `TestPlans/TP_M2.3.md` covering at minimum:

- **Happy path:** Open Unity, press Play, click Start Run, wait for combat/summary, click Continue/Next Round, confirm round advances and another sandbox combat can run.
- **End-screen checks:** Verify minimal Victory and Defeat screens can be reached through explicitly described temporary setup steps, and display final round/gold/debt/morale plus a reason.
- **Loss-condition checks:** Verify morale defeat, debt-limit defeat, and round-10 victory logic with exact setup instructions.
- **Rule checks:** single scene, uGUI only, mouse-only button `onClick`, no new Input System action assets, no `UnityEngine.Random`, no shop/payroll/formation/scout/rival behavior, no forbidden folders.
- **Regression checks:** M1.3 combat log still streams; M2.1 header still initializes correctly; M2.2 reward summary still appears only after combat finishes and matches the header.
- **Observable invariants:** continuing applies exactly once, round number advances by 1 only when no end condition is met, end screens do not mutate resources after display, restarting creates a fresh run, and no duplicate runtime UI objects appear.

Every temporary setup step must include exact file/method/value changes to make the scenario testable, then instruct the tester to revert those temporary changes before continuing.

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action - what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
