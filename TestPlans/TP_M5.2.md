# TP_M5.2 — Victory Bonus loss-debt, post-combat hero-stat revert, and payroll line items

**Slice:** M5.2
**Milestone:** M5 — Payroll Actions

This plan exercises the M5.2 acceptance criteria:

1. Victory Bonus on combat loss adds `GameRules.VictoryBonusDebtOnLoss` to `RunState.Debt` **before** interest is computed.
2. Per-hero `Attack` and `UpkeepThisRound` are reverted to base after every combat.
3. `RewardSummaryView` shows one extra line per non-StandardPay payroll action (with a Victory-Bonus-loss penalty sub-line).
4. `RunState.SelectedPayrollAction` survives through reward summary, then clears on Continue.
5. M1–M5.1 flow preserved.

---

## Diagnostic scaffold (used by several scenarios)

`RunState`, `HeroInstance.Attack`, `HeroInstance.UpkeepThisRound`, and `LatestVictoryBonusLossDebt` are plain C# fields and not visible in the Unity Inspector. Use these temporary `Debug.Log` lines to observe them. **Add them once before scenario A and remove them as the very last step of this test plan.**

- [ ] **DIAG.1 — Add post-combat probe.** In `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs`, at the **top** of `ApplyPostCombat`, immediately after the early-return `if` for null inputs, add:
      ```csharp
      UnityEngine.Debug.Log("[M5.2] PRE  ApplyPostCombat selected=" + (runState.SelectedPayrollAction.HasValue ? runState.SelectedPayrollAction.Value.ToString() : "null") + " won=" + combatResult.PlayerWon + " gold=" + runState.Gold + " debt=" + runState.Debt);
      ```
      And at the **end** of `ApplyPostCombat` (just before the closing `}` of the method), add:
      ```csharp
      UnityEngine.Debug.Log("[M5.2] POST ApplyPostCombat debt=" + runState.Debt + " VBLossDebt=" + runState.LatestVictoryBonusLossDebt + " summary=" + runState.LatestPayrollSummary);
      ```
- [ ] **DIAG.2 — Add revert probe.** In `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs`, at the **end** of `RevertPerCombatHeroStats`, add:
      ```csharp
      UnityEngine.Debug.Log("[M5.2] POST Revert party stats:");
      for (int j = 0; j < runState.Party.Count; j++) { HeroInstance h = runState.Party[j]; UnityEngine.Debug.Log("  - " + h.Definition.DisplayName + " Atk=" + h.Attack + "/" + h.Definition.BaseAttack + " Up=" + h.UpkeepThisRound + "/" + h.Definition.BaseUpkeep); }
      ```
      Expected: Unity recompiles cleanly with no new warnings.
      Actual:

---

## Scenario A — Happy path: two-round Cut Wages then Skip Payroll

- [ ] A.1. Press Play. Click Start Run. Expected: Shop panel; Round 1 in header; gold = `GameRules.StartingGold`.
      Actual: pass
- [ ] A.2. Hire any 2–3 heroes. Continue → Formation. Continue → Payroll.
      Expected: Payroll panel shows 4 cards; Continue disabled; Console PRE log not yet emitted.
      Actual:  pass
- [ ] A.3. Click **Cut Wages**. Continue → Combat plays out → Reward Summary appears.
      Expected: Reward Summary body contains a line `Cut Wages: per-hero upkeep -3 (min 0), attack -1 (min 0)` between "Morale change" and "Upkeep due". DIAG.1 PRE shows `selected=CutWages`. DIAG.2 POST shows every hero's `Atk == BaseAtk` and `Up == BaseUp`.
      Actual: no console logs but see cut wages in reward
- [ ] A.4. Click Continue on Reward Summary.
      Expected: round advances to 2, returns to Combat **OR** routes through Shop again (per current flow). Confirm header shows Round 2 once next Payroll panel is visible. (Current sandbox loop bypasses Shop between rounds — go with that.)
      Actual: pass
- [ ] A.5. When Payroll panel re-appears for Round 2, click **Skip Payroll**, Continue.
      Expected: every hero card / DIAG.2 logs show `Atk == BaseAtk` and `Up == BaseUp` *before* Skip Payroll fires (i.e. at the start of Round 2). Reward Summary contains **no** payroll line (StandardPay omitted).
      Actual: Blocked - payroll panel never re-appears. per above it says sandbox loop bypasses shop between rounds

## Scenario B — Victory Bonus on win

- [ ] B.1. Start a fresh Run. Hire 2 heroes (verify `Gold ≥ 3` after hires; if not, fire and rehire to keep gold ≥ 3). Continue to Payroll.
      Actual: pass
- [ ] B.2. Click **Victory Bonus**. Note `Gold` in header. Continue → Combat → win.
      Expected: DIAG.1 PRE shows `selected=PromiseVictoryBonus won=True`. POST shows `debt` unchanged and `VBLossDebt=0`. Reward Summary contains line `Victory Bonus: -3 gold, +1 attack per hero` and **no** loss-penalty sub-line.
      Actual: pass
- [ ] B.3. Click Continue.
      Expected: DIAG.2 POST log shows every hero `Atk == BaseAtk` (the +1 buff is reverted). Header gold reflects the `-3` cost from pre-combat Apply plus the win reward.
      Actual: pass

## Scenario C — Victory Bonus on loss (forced loss)

- [ ] C.1. **Temporary edit:** in `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, change `CombatTurnLimit = 10` to `CombatTurnLimit = 1`. Save. Wait for Unity recompile.
      Expected: clean recompile.
      Actual: pass
- [ ] C.2. Start a fresh Run. Hire 1–2 cheap heroes so combat will hit the turn limit before clearing the encounter (verify `Gold ≥ 3` after hires). Continue to Payroll.
      Actual: pass
- [ ] C.3. Click **Victory Bonus**. Note `Gold` and `Debt` in header. Continue → Combat resolves as a loss/turn-limit.
      Expected: Reward Summary "Combat: Loss". Body contains:
      ```
      Victory Bonus: -3 gold, +1 attack per hero
      +5 debt (loss penalty)
      ```
      DIAG.1 POST shows `VBLossDebt=5` and `debt` increased by 5 (plus any upkeep shortfall). Final Debt in summary reflects loss-penalty *before* interest was charged: interest line should equal `ceil((PreCombatDebt + 5 + UpkeepShortfall) / 3)`.
      Actual: pass
- [ ] C.4. Click Continue.
      Expected: DIAG.2 POST shows every hero `Atk == BaseAtk`.
      Actual: pass
- [ ] C.5. **Revert** `CombatTurnLimit` back to `10`. Save. Verify recompile clean.
      Actual: pass

## Scenario D — Victory Bonus underfunded (Gold < cost) — Q2(a) UI disable

- [ ] D.1. **Temporary edit:** in `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, change `StartingGold = 10` to `StartingGold = 2` (one below `VictoryBonusGoldCost = 3`). Save.
      Actual: pass
- [ ] D.2. Start a fresh Run. Skip the shop (Continue with empty party is fine, or hire nothing). Continue to Payroll.
      Expected: header Gold = 2. Victory Bonus card is visibly **disabled / darker** and clicks on it do not change selection. Other 3 cards remain selectable.
      Actual: pass
- [ ] D.3. Select **Take Loan** (or Skip Payroll). Continue.
      Expected: combat proceeds normally; no NullReferenceException; Reward Summary shows the Loan or no line as applicable.
      Actual: pass
- [ ] D.4. **Revert** `StartingGold` back to `10`. Save. Verify recompile clean.
      Actual: pass

## Scenario E — Take Loan reward summary line

- [ ] E.1. Start a fresh Run. Hire 1 hero. Continue to Payroll. Click **Take Loan**, Continue, win or lose combat.
      Expected: Reward Summary contains line `Loan: +5 gold, +6 debt`. Header gold and debt reflect both the pre-combat loan deltas and the post-combat reward/upkeep/interest math.
      Actual: pass

## Scenario F — Cut Wages persistence regression check

- [ ] F.1. Start a fresh Run. Hire 2+ heroes whose `BaseAttack ≥ 2` (Knight, Brawler, Ranger — anything not Apprentice). Note their base attack.
      Actual: pass
- [ ] F.2. Continue to Payroll. Cut Wages → Continue → resolve combat → Continue past Reward.
      Expected: at start of next round's Payroll panel (or if going back through Shop, at the next Formation panel's hero cards), every hero's `Attack` and `UpkeepThisRound` is back at base. Verify via DIAG.2 POST log from the previous round (revert was the last log line of that round).
      Actual: pass

## Rule checks

- [ ] R.1. Source-grep `UnityEngine.Random` across `Assets/Scripts/Run/`, `Assets/Scripts/Combat/`, `Assets/Scripts/Core/`. Expected: zero matches.
      Actual: pass
- [ ] R.2. Source-grep magic numbers `5`, `3`, `1` in `PayrollManager.ApplyPostCombat`. Expected: only `GameRules.*` references; no bare numeric literals for payroll values.
      Actual: pass
- [ ] R.3. Open `RewardSummaryView.cs`. Expected: payroll line text is sourced from `runState.LatestPayrollSummary`, not hardcoded.
      Actual: pass
- [ ] R.4. Open `GameManager.ContinueAfterReward`. Expected: `runState.SelectedPayrollAction = null` is set exactly once, after `EvaluateNextState`.
      Actual: pass
- [ ] R.5. Run two consecutive rounds with **no** payroll action change between them (Skip Payroll twice). Expected: Reward Summary in both rounds omits the payroll line; no leftover Cut Wages or Victory Bonus text appears.
      Actual: pass

## Regression checks (M1–M5.1)

- [ ] RG.1. **M5.1 selection:** click a card, click again to cancel; Continue button disables/enables accordingly.
      Actual: pass
- [ ] RG.2. **M4.1 click-to-swap:** in Formation, click two slots to swap; same-slot click cancels; click on empty-then-empty no-ops.
      Actual: pass
- [ ] RG.3. **M3.2 hire/fire/reroll:** in Shop, Hire deducts gold, Fire refunds 1, Reroll costs 2.
      Actual: pass
- [ ] RG.4. **M2.x reward/upkeep/interest math:** with Skip Payroll on a winning combat, Reward Summary shows `Gold gained: +8`, then upkeep, then interest, then `Final` line. Numbers match a hand calc.
      Actual: pass
- [ ] RG.5. **M1.3 combat log:** combat log streams lines and is scrollable.
      Actual: pass

## Observable invariants

- [ ] INV.1. After every `ApplyPostCombatResult`, every hero's `Attack == Definition.BaseAttack` and `UpkeepThisRound == Definition.BaseUpkeep` (verified by DIAG.2 across all scenarios).
      Actual: pass
- [ ] INV.2. `RunState.Debt ≥ 0` at the end of every `ApplyPostCombatResult`.
      Actual: pass
- [ ] INV.3. `RunState.SelectedPayrollAction == null` at the start of every Payroll-state entry (already enforced in `MainMenuPanel.HandleStateChanged` and now also after Continue from Reward Summary).
      Actual: pass
- [ ] INV.4. `RunState.LatestPayrollSummary` is `string.Empty` after a Skip-Payroll combat and non-empty after Loan / Cut Wages / Victory Bonus.
      Actual: pass
- [ ] INV.5. On a Victory-Bonus win, `RunState.LatestVictoryBonusLossDebt == 0`. On a Victory-Bonus loss, it equals `GameRules.VictoryBonusDebtOnLoss` (5).
      Actual: pass
- [ ] INV.6. `RunState.LatestPayrollSummary` for Victory-Bonus-loss contains exactly two lines (the action line and the loss-penalty sub-line).
      Actual: pass

---

## Revert diagnostic scaffold (final step)

- [ ] DIAG.REVERT — Remove the three `Debug.Log` blocks added in DIAG.1 and DIAG.2 from `PayrollManager.cs`. Verify Unity recompiles clean and there are no `[M5.2]` log lines on a fresh combat run.
      Actual: they dont look to be added. i did not update
