# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M5.2 — Victory Bonus loss-debt, payroll revert after combat, and reward summary payroll line

**Milestone:** M5 — Payroll Actions
**Slice goal:** Finish the payroll action consequences M5.1 deferred. Apply Victory Bonus's `+VictoryBonusDebtOnLoss` debt on combat loss, revert per-combat `Attack` and `UpkeepThisRound` deltas at the end of combat so payroll effects don't accumulate across rounds, and surface the selected payroll action and its numeric effect in `RewardSummaryView`.

### Acceptance criteria

1. **Victory Bonus loss-debt.** After combat resolves, if `RunState.SelectedPayrollAction == PromiseVictoryBonus` and `CombatResult.PlayerWon == false`, then `RunState.Debt += GameRules.VictoryBonusDebtOnLoss` (currently `5`). The increment happens in `RunManager.ApplyPostCombatResult` (or a small helper it calls) **before** interest is computed, so it correctly feeds the interest formula in the same round.
2. **Per-combat attack/upkeep revert.** After combat resolves, every party hero's `Attack` is reset to `Definition.BaseAttack` and `UpkeepThisRound` is reset to `Definition.BaseUpkeep`. This guarantees Cut Wages and Victory Bonus deltas do not persist into the next round's payroll choice. (Cut Wages's gold/debt-side effects, of which there are none, are unaffected; Loan and Skip Payroll already do not mutate hero stats.)
3. **`RewardSummaryView` shows payroll line items.** After combat, the reward summary panel displays one extra line per non-`StandardPay` payroll action that fired this round, summarising the numeric effect actually applied. Minimum content per action:
   - **Take Loan:** `Loan: +X gold, +Y debt` (using actual values, sourced from `GameRules`).
   - **Cut Wages:** `Cut Wages: per-hero upkeep −3 (min 0), attack −1 (min 0)`.
   - **Victory Bonus (win):** `Victory Bonus: −3 gold, +1 attack per hero` and on loss additionally `+5 debt (loss penalty)`.
   - **Skip Payroll:** no line.
4. **Selected payroll action survives until the reward summary is rendered, then is cleared.** `RunState.SelectedPayrollAction` must still be readable inside `ApplyPostCombatResult` and during the reward-summary `Refresh`. After the user clicks Continue on the reward summary (i.e., on transition out of the `Upkeep` state), `SelectedPayrollAction` is cleared to null so the next round starts clean.
5. **No new combat or hero-effect logic, no scout/rival, no save/load.** Existing Shop → Formation → Payroll → Combat → Reward → next-round flow continues to work end-to-end; M1–M4 behavior preserved; M5.1 selection UI and pre-combat application unchanged.

### Files Claude Code may create

```
TestPlans/TP_M5.2.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Run/PayrollManager.cs
DungeonDebt/Assets/Scripts/Data/RunState.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
```

- `RunManager.cs` — in `ApplyPostCombatResult`, before the upkeep/interest math, call a new `ApplyPayrollPostCombat(runState, combatResult)` helper that handles Victory Bonus loss-debt; after the math is done, call `RevertPerCombatHeroStats(runState)` to restore `Attack`/`UpkeepThisRound` from `Definition`. Persist the line-item strings needed by the reward summary onto `RunState` (see below).
- `PayrollManager.cs` — add `ApplyPostCombat(RunState, CombatResult)` and `RevertPerCombatHeroStats(RunState)`, or extend `Apply` with companion methods so the post-combat logic lives next to the pre-combat logic. Decide at plan time.
- `RunState.cs` — add `LatestPayrollSummary` (string or small struct) and `LatestVictoryBonusLossDebt` (int) fields so the reward summary can render without re-deriving math.
- `RewardSummaryView.cs` — render the payroll line items beneath the existing reward / upkeep / interest section.
- `GameManager.cs` — in `ContinueAfterReward` (or wherever the Upkeep → next-state transition happens), clear `RunState.SelectedPayrollAction = null` once the reward summary has been dismissed.

### Files Claude Code does NOT create or modify

- `PayrollPanelView.cs`, `PayrollCardView.cs` — M5.1 UI is final for this slice.
- `DataRepository.cs` — payroll action definitions are final.
- `CombatManager.cs`, `HeroEffects.cs` — combat resolver and effect hooks are untouched; payroll post-combat math runs in `RunManager` after combat has resolved.
- `GameRules.cs` — `VictoryBonusDebtOnLoss = 5` already exists.
- `ShopManager.cs`, `ShopPanelView.cs`, `ShopOfferView.cs`, `HeroCardView.cs`, `FormationPanelView.cs`, `FormationSlotView.cs`.
- Scout / rival / save-load / encounter content / hero definitions.
- Any imported sprites, fonts, audio, animation assets.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/`.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Open questions to resolve at plan time

1. **Where the Victory Bonus loss-debt is recorded.** Inside `ApplyPostCombatResult` directly, or via a new `PayrollManager.ApplyPostCombat` called by `ApplyPostCombatResult`? The brief leans toward the latter so payroll logic stays in `PayrollManager`, but `ApplyPostCombatResult` already does the gold/debt/morale math — keeping it all in one method may read more cleanly. Pick one with explicit rationale.
2. **UX gap from M5.1 testing:** Victory Bonus is selectable even when `RunState.Gold < VictoryBonusGoldCost`. Decide whether to:
   - (a) Disable the Victory Bonus card on the panel when gold < cost (small UI change, requires `PayrollPanelView.Refresh` to take `RunState`).
   - (b) Show a "Can't afford" sublabel but keep it selectable (current clamp-to-0 behavior stands).
   - (c) Leave it for M5.3 / polish pass.
   Recommend (a) at plan time unless the user prefers otherwise.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` §5 — upkeep / interest formulas, payroll constants including `VictoryBonusDebtOnLoss`.
- `IMPLEMENTATION_PLAN.md` §8 — payroll actions, post-combat consequences.
- `IMPLEMENTATION_PLAN.md` §10 — `RewardSummaryView` responsibilities ("clearly reports payroll effects").
- `IMPLEMENTATION_PLAN.md` §11 — Milestone 5 acceptance criteria (the four manual test steps map almost 1:1 onto M5.2 scenarios now that M5.1 is in).
- `GAME_DESIGN.md` — payroll-choice section, confirm intent of loss-debt and per-combat-only effects.

### Notes from previous slice

- M5.1 added the Payroll state, the 4 payroll cards, click-to-select-with-cancel, and `PayrollManager.Apply` for **pre-combat** effects only. `ContinueFromFormation` -> Payroll, `ContinueFromPayroll` -> Combat. `RunState.SelectedPayrollAction` is now written on each card click and read on Continue.
- M5.1 did **not** revert per-hero `Attack`/`UpkeepThisRound` after combat — Cut Wages and Victory Bonus mutations persist across rounds today. M5.2 must fix this (acceptance criterion 2).
- M5.1 did **not** apply Victory Bonus loss-debt — explicitly deferred. M5.2 implements it (acceptance criterion 1).
- M5.1 verification relied on a temporary `Debug.Log` pair in `PayrollManager.Apply` because Unity's Inspector Debug mode only shows Unity-serializable fields and our plain C# `RunState` is not. The scaffold was reverted before slice completion. `SESSION_PROTOCOL.md` step 6 now documents this pattern so M5.2 can plan diagnostics up front. Either add `[System.Serializable]` to `RunState` / `HeroInstance` so they show in Inspector Debug, or plan a Debug.Log scaffold from the start of the test plan.
- Test plan Step 14 ("Gold < VictoryBonusGoldCost") was only exercised at the boundary (`Gold == cost`). Add an explicit `Gold = cost - 1` row to TP_M5.2.
- No open regressions (`REGRESSIONS.md` Open section is empty as of 2026-05-14).

### Test plan output

Claude Code creates `TestPlans/TP_M5.2.md` covering:

- **Happy path:** Run a complete two-round loop where round 1 uses Cut Wages and round 2 uses Skip Payroll. Verify per-hero `Attack`/`UpkeepThisRound` are back at base before the round 2 payroll panel renders.
- **Victory Bonus on win:** PRE Gold = ≥3; pick Victory Bonus; win combat. POST: gold -3, no debt change, attack reverted to base after reward summary clears.
- **Victory Bonus on loss:** force a defeat-or-turn-limit combat (temporary `GameRules` edits permitted, with explicit revert steps); pick Victory Bonus; expect `Debt += 5` plus normal upkeep/interest math, and attack reverted after combat.
- **Victory Bonus underfunded (Gold < cost − 1):** verify the chosen UX from open question 2 (disable, label, or clamp).
- **Cut Wages persistence check:** before M5.2 this drifted across rounds; after M5.2, run round 1 with Cut Wages and confirm round 2's payroll panel shows base `Attack`/`UpkeepThisRound`.
- **Reward summary content:** for each non-StandardPay action, verify the new line(s) appear and are numerically correct.
- **Rule checks:** no `UnityEngine.Random`; payroll numbers from `GameRules`; `SelectedPayrollAction` cleared exactly once per round after Continue from reward summary; no out-of-scope additions.
- **Regression checks:** M5.1 selection edge cases still work; M4.1 click-to-swap; M3.2 hire/fire/reroll; M2.x reward/upkeep/interest math (with payroll line items added beneath, not replacing).
- **Observable invariants:** after `ApplyPostCombatResult`, every hero's `Attack == Definition.BaseAttack` and `UpkeepThisRound == Definition.BaseUpkeep`; `RunState.Debt` is non-negative; `RunState.SelectedPayrollAction` is null at the start of every Payroll state visit.

Every temporary setup step (forced loss, low gold, low morale) must include exact file/method/value changes and an explicit revert checkbox.

### Diagnostic scaffold guidance for this slice

Per the new `SESSION_PROTOCOL.md` §Step 6, decide at plan time how the tester will observe `RunState.Debt`, hero `Attack`/`UpkeepThisRound`, and `LatestVictoryBonusLossDebt`. Two options:

- (a) Add `[System.Serializable]` to `RunState` and `HeroInstance` (and `[SerializeField] private RunState _currentRunState` to `RunManager`) so Inspector Debug mode can show them. This is a real code change with no functional impact; needs explicit user approval.
- (b) Plan a temporary `Debug.Log` pair around `ApplyPayrollPostCombat` and `RevertPerCombatHeroStats`, with explicit revert steps in the test plan. M5.1 used this approach successfully.

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
