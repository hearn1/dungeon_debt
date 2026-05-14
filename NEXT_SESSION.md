# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: R002 — Round-advance routes through Shop → Formation → Payroll → Combat

**Milestone:** Regression fix (blocks M6 entry)
**Slice goal:** Fix the round-advance loop so that after the player clicks Continue on the Reward Summary, a not-yet-ended run routes back through `Shop → Formation → Payroll → Combat` instead of jumping straight to `Combat`. This unblocks M5.2 acceptance criterion 5 (multi-round flow), enables real multi-round economy testing for the first time, and lets M6 land on a working loop.

### Background

`GameManager.ContinueAfterReward` currently calls `RunManager.EvaluateNextState()`, which returns `GameState.Combat` whenever no end condition is met, then `ChangeState(Combat)` jumps directly there. The round-advance routing was wired in M2.3 (before Shop/Formation/Payroll states existed) and never updated when M3.2/M4.1/M5.1 added those states. Symptom: rounds 2–10 reuse the round-1 party, formation, and an empty payroll selection without ever showing the in-between panels.

See `REGRESSIONS.md` R002 for the full repro and notes.

### Acceptance criteria

1. **Continue from Reward Summary on a continuing run goes to Shop, not Combat.** When `EvaluateNextState` would otherwise return `GameState.Combat` (i.e. no morale/debt/round-10 end condition), `ContinueAfterReward` instead transitions to `GameState.Shop` after `AdvanceRound`. Victory/Defeat transitions are unchanged.
2. **All in-between states fire in order.** A successful round 1 → round 2 path enters, in order: `Shop`, `Formation`, `Payroll`, `Combat`, `Reward`, `Upkeep`, then on Continue advances to round 2's `Shop`. Each panel is visible and interactable on each visit.
3. **`SelectedPayrollAction` is null at every Payroll-state entry.** The existing safety nets in `MainMenuPanel.HandleStateChanged` Payroll branch and `GameManager.ContinueAfterReward` continue to enforce this; verify nothing leaks across rounds.
4. **Per-hero `Attack`/`UpkeepThisRound` are at base when Round 2's Payroll panel renders.** Direct cross-round verification of M5.2 AC2, which was previously only observable via the in-combat revert log.
5. **No new shop refresh, no new encounters, no scout, no rival.** The shop offers may be either the round-1 leftovers or freshly regenerated — pick one at plan time and document. Per-round shop refresh per `IMPLEMENTATION_PLAN.md` §6 / M6 is **out of scope** unless trivial.
6. **End conditions still fire.** Morale ≤ 0 → Defeat; Debt ≥ DebtLimit → Defeat; Round 10 win → Victory. Existing M2.3 end-screen flow is preserved.

### Files Claude Code may create

```
TestPlans/TP_R002.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
```

- `RunManager.cs` — change `EvaluateNextState` so the "continue run" branch returns `GameState.Shop` instead of `GameState.Combat`. Keep `AdvanceRound` semantics; consider whether it should run before or after the `Shop` transition.
- `GameManager.cs` — adjust `ContinueAfterReward` to call `AdvanceRound` and route to the new state. Confirm the `SelectedPayrollAction = null` clear still happens once per round.
- `MainMenuPanel.cs` — verify `HandleStateChanged` Shop / Formation / Payroll branches behave correctly on **re-entry** (panels were originally written for a single first-round visit). In particular, confirm `_shopPanelView.Show()` / `_formationPanelView.Show()` work after combat without stale state, and that `_combatLogView.Clear()` happens at the right point.

### Files Claude Code does NOT create or modify

- `PayrollManager.cs`, `PayrollPanelView.cs`, `PayrollCardView.cs` — payroll logic is final from M5.1/M5.2.
- `CombatManager.cs`, `HeroEffects.cs` — combat unchanged.
- `DataRepository.cs`, `GameRules.cs` — no new data or constants needed.
- `ShopManager.cs`, `ShopPanelView.cs`, `ShopOfferView.cs`, `HeroCardView.cs` — shop logic unchanged unless re-entry exposes a real bug.
- `FormationPanelView.cs`, `FormationSlotView.cs`, `RewardSummaryView.cs`, `RunHeaderView.cs`, `EndScreenView.cs`, `CombatLogView.cs` — UI views unchanged unless re-entry exposes a real bug.
- Scout / rival / save-load / per-round shop refresh / new encounters / new hero defs.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/`.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Open questions to resolve at plan time

1. **Where `AdvanceRound` is called.** Today it runs inside `ContinueAfterReward` only when `EvaluateNextState` returns `Combat`. After the fix, should it run before transitioning to `Shop` (so the Shop header shows the new round number) or be deferred to the actual Combat entry? Recommendation: keep it where it is, just change the target state — round number bumps as soon as the player commits to "continuing the run."
2. **Shop offer state on round-N entry.** Three options:
   - (a) Re-use `_shopManager.CurrentOffers` from round 1 (no per-round refresh).
   - (b) Call `_shopManager.GenerateOffers()` again on each `Shop` state entry. `GameManager.ChangeState` already does this on every `Shop` entry today — so unless we change anything, the offers will refresh automatically each round, which is functionally equivalent to (b).
   - Recommendation: **accept (b) as the natural consequence of existing `ChangeState(Shop)` behavior**, document it in the test plan, and explicitly defer "should reroll cost reset, should party persist" to M6.
3. **Diagnostic scaffold.** R002 is mostly UI-state observable, so the test plan probably doesn't need a `Debug.Log` probe. If one is needed, plan it up front with explicit revert steps (per `SESSION_PROTOCOL.md` §Step 6).

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` §11 — Milestones 5/6 acceptance criteria, particularly "10-round run with all encounters and hero effects."
- `IMPLEMENTATION_PLAN.md` §6 — Shop per-round semantics (to confirm what we're explicitly *not* doing yet).
- `REGRESSIONS.md` R002 — the regression entry itself.
- `PROGRESS.md` last 2-3 entries (M5.2, M5.1, M4.1) for the recent state-routing context.

### Notes from previous slice (M5.2)

- M5.2 implementation is correct and shipped Partial: AC1, AC3, AC4 all pass. AC2 is satisfied at the revert site (observed via downstream UI in B.3, C.4, F.2). AC5 was the only criterion not met, blocked by R002.
- Q2(a) Victory Bonus card disable when underfunded is in and verified (Scenario D pass).
- DIAG.1/DIAG.2 `Debug.Log` scaffolds in TP_M5.2 were planned but not added by the tester; downstream UI signals confirmed the same behavior. Future test plans should either gate the dependent steps on a "scaffold added?" check or rely on UI-observable signals.
- After R002 ships, re-run TP_M5.2 step A.5 (and the second half of F.2) to close out M5.2 AC5.

### Test plan output

Claude Code creates `TestPlans/TP_R002.md` covering:

- **Happy path:** Run round 1 with any payroll action → Continue from Reward → confirm Shop visible with Round 2 in header → Continue → Formation visible → Continue → Payroll visible → Continue → Combat → Reward.
- **Round 1 → Round 10 sweep:** play out a full 10-round run (forced wins via `GameRules` if needed for speed) and confirm all in-between panels appear each round; final round-10 win still triggers Victory end screen.
- **Cross-round payroll/stat checks:** Round 1 Cut Wages → at Round 2 Payroll panel, hero cards (or a one-line debug probe) show base `Attack`/`UpkeepThisRound`; `SelectedPayrollAction` is null on Round 2 Payroll entry.
- **End conditions still fire:** force defeat by morale (temporary `GameRules.DungeonLossMorale = 30`), force defeat by debt (temporary `GameRules.DebtLimit = 1`), force victory at Round 10 (temporary `GameRules.FinalRound = 1`). Each with explicit revert checkboxes.
- **Rule checks:** no `UnityEngine.Random`, no magic numbers in routing logic, panels still don't show/hide themselves, single `RunState` instance persists across rounds.
- **Regression checks:** rerun TP_M5.2 A.5 and second half of F.2 (now reachable); rerun TP_M5.1 selection edge cases on round 2; rerun TP_M4.1 swap on round 2; rerun TP_M3.2 hire/fire/reroll on round 2.
- **Observable invariants:** every state transition is one of MainMenu → StartRun → Shop → Formation → Payroll → Combat → Reward → Upkeep → (Shop|Victory|Defeat); `RunState.Round` increments by exactly 1 per Continue-from-Reward; combat log is cleared between rounds.

Every temporary setup step (forced loss, forced victory, low morale) must include exact file/method/value changes and an explicit revert checkbox.

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
