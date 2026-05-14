# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M5.1 — Payroll action data + payroll panel shell

**Milestone:** M5 — Payroll Actions
**Slice goal:** Add a Payroll state between Formation and Combat. Build the 4 payroll action definitions in `DataRepository` per `IMPLEMENTATION_PLAN.md` §8, and a `PayrollPanelView` that displays the 4 cards, lets the player select one, and applies the selection's **pre-combat** numeric effects on Continue. Post-combat consequences (e.g. Victory Bonus's debt-on-loss) are deferred to M5.2.

### Acceptance criteria

1. `GameManager.ContinueFromFormation()` transitions to `GameState.Payroll` (not directly to Combat). A new `ContinueFromPayroll()` transitions to `GameState.Combat`.
2. `DataRepository.AllPayrollActions` exposes the 4 payroll actions from `IMPLEMENTATION_PLAN.md` §8 (Loan, Cut Wages, Victory Bonus, Skip Payroll) with id/name/description. All tunable values pull from existing `GameRules` constants (`LoanGoldGain`, `LoanDebtCost`, `VictoryBonusGoldCost`, `VictoryBonusAttackBuff`, `CutWagesUpkeepReduction`, `CutWagesAttackPenalty`).
3. `PayrollPanelView` shows the 4 cards on the same screen region used by the Shop/Formation panels. Clicking a card selects it (highlight); the panel writes `RunState.SelectedPayrollAction` and enables a Continue button. Re-clicking the selected card cancels selection.
4. On Continue, `PayrollManager.Apply(runState, actionId)` applies pre-combat numeric effects:
   - **Loan:** `Gold += LoanGoldGain`, `Debt += LoanDebtCost`.
   - **Cut Wages:** For each party hero, `UpkeepThisRound = max(0, UpkeepThisRound - CutWagesUpkeepReduction)` and `Attack = max(0, Attack - CutWagesAttackPenalty)`.
   - **Victory Bonus:** `Gold -= VictoryBonusGoldCost` (clamped at 0); for each party hero, `Attack += VictoryBonusAttackBuff`. The loss-debt consequence is **deferred to M5.2**.
   - **Skip Payroll:** No-op.
5. No new combat or hero-effect logic, no scout/rival, no save/load. Existing Shop → Formation → Payroll → Combat → Reward flow works end-to-end. M1–M4 behavior preserved.

### Files Claude Code may create

```
DungeonDebt/Assets/Scripts/Run/PayrollManager.cs
DungeonDebt/Assets/Scripts/UI/PayrollPanelView.cs
DungeonDebt/Assets/Scripts/UI/PayrollCardView.cs
TestPlans/TP_M5.1.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
```

- `GameManager.cs` — change `ContinueFromFormation()` to transition to `Payroll`; add `ContinueFromPayroll()` → `Combat`; ensure `PayrollManager` is held as a serialized field and instantiated via `EnsureManagers()`.
- `DataRepository.cs` — add the 4 `PayrollActionDefinition` entries plus `AllPayrollActions` immutable list.
- `MainMenuPanel.cs` — build `PayrollPanelView` in `BuildUi`; wire its select/continue handlers; route Payroll state in `HandleStateChanged`; hide it on all other states.

### Files Claude Code does NOT create or modify

- Scout, rival, save/load logic.
- `GameRules.cs` (all constants needed already exist).
- `CombatManager.cs`, `HeroEffects.cs`, encounter content, hero/enemy definitions.
- `ShopManager.cs`, `ShopPanelView.cs`, `ShopOfferView.cs`, `HeroCardView.cs`, `FormationPanelView.cs`, `FormationSlotView.cs`.
- `RunManager.cs` (unless adding a small accessor — flag at plan time if needed).
- Any imported sprites, fonts, audio, animation assets.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/`.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 5 — payroll-related constants.
- `IMPLEMENTATION_PLAN.md` Section 8 — payroll actions, pre-combat vs post-combat effects.
- `IMPLEMENTATION_PLAN.md` Section 10 — `PayrollPanelView`, `PayrollCardView` responsibilities.
- `IMPLEMENTATION_PLAN.md` Section 11 — Milestone 5 acceptance criteria.
- `GAME_DESIGN.md` — payroll-choice section, to confirm intent of each action.

### Notes from previous slice

- M4.1 added Shop → Formation → Combat routing with click-to-swap reorder. `RunManager.SwapPartySlots` resorts `Party` by `FormationSlot` after swap. Combat targeting (`FindTarget`) is already frontline-first leftmost from earlier work — no change in M4.1.
- `GameManager.ContinueFromFormation()` currently transitions Formation → Combat. **This slice changes it to Formation → Payroll**, and adds `ContinueFromPayroll()` → Combat.
- `RunState.SelectedPayrollAction` (a `PayrollActionId?` property) already exists from M1.1 and is currently always null. M5.1 starts using it.
- Per-round shop refresh still deferred to M6. Payroll appears once per run on the same flow as Shop/Formation in this slice.
- No open regressions block M5.1 (REGRESSIONS.md Open section is empty as of 2026-05-14).

### Test plan output

Claude Code creates `TestPlans/TP_M5.1.md` covering:

- **Happy path:** Start Run → Shop → hire 3 heroes → Continue → Formation → Continue → Payroll panel shows 4 cards → select Loan → Continue → Combat runs; reward summary reflects extra gold and added debt from Loan.
- **Per-action pre-combat effect checks:** one scenario each for Loan, Cut Wages, Victory Bonus, Skip Payroll. For each, capture pre-Continue and post-Continue values of `Gold`, `Debt`, each hero's `Attack` and `UpkeepThisRound`, and verify they match the expected formula from `GameRules`.
- **Selection edge cases:** click card A, click card B (A deselects, B selects); click A then A again (deselects); attempt Continue with no card selected (Continue should be disabled until a card is chosen).
- **Rule checks:** no `UnityEngine.Random`; panels driven by `MainMenuPanel`/state; payroll numbers come from `GameRules` (no magic 5/6/3/1 in `PayrollManager`); `SelectedPayrollAction` is written exactly once per Payroll visit; no out-of-scope additions.
- **Regression checks:** M4.1 click-to-swap still works; M3.2 hire/fire/reroll still works; M2.x reward/upkeep math still correct; M2.3 victory/defeat end screens still reachable.
- **Observable invariants:** `RunState.SelectedPayrollAction` is non-null before Combat starts in M5.1; per-hero `Attack` and `UpkeepThisRound` are always ≥ 0 after any payroll application; `Gold` is never negative.

Every temporary setup step must include exact file/method/value changes to make the scenario testable, then instruct the tester to revert those temporary changes before continuing.

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
