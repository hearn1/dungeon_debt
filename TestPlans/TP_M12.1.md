# TP_M12.1 - Debt status + Shop repayment

Manual Unity Editor test plan for slice **M12.1**. Run at 1920x1080 / 16:9 in Play mode.

This plan verifies that debt has clear status labels and that the Shop Pay Debt action converts gold into debt reduction at 1:1, capped by `GameRules.DebtPaymentCap`.

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, set Game view to 1920x1080 / 16:9, and press Play.
      Expected: Main menu appears cleanly; Console has no new errors before starting.
      Actual:

- [ ] Step 2. Start a fresh run and inspect the run header during Scout.
      Expected: Debt readout includes a status label, such as `Debt 0 (Stable)`.
      Actual:

- [ ] Step 3. Reach the Shop with 0 debt.
      Expected: Shop footer includes a Pay Debt control labeled `No Debt`, and it is disabled.
      Actual:

### Temporary setup: debt repayment happy path

For steps 4-8, temporarily edit `DungeonDebt/Assets/Scripts/Core/GameRules.cs` before entering Play mode:

```csharp
public const int StartingGold = 10;
public const int StartingDebt = 6;
```

This is test-only setup. Revert both constants before moving to the next scenario.

- [ ] Step 4. Start a fresh run and reach the Shop.
      Expected: Header shows `Debt 6 (Strained)`, and Shop shows `Pay Debt (3g)`.
      Actual:

- [ ] Step 5. Click Pay Debt once.
      Expected: Gold decreases by 3, debt decreases by 3, header updates immediately to `Debt 3 (Stable)`, and Shop updates without changing phase.
      Actual:

- [ ] Step 6. Inspect hire and reroll affordances after the payment.
      Expected: Hire/reroll buttons now evaluate against the reduced gold total; anything no longer affordable is disabled or shows its normal need-gold state.
      Actual:

- [ ] Step 7. Click Pay Debt again.
      Expected: Debt reaches 0, gold decreases by the remaining 3, and Pay Debt changes to `No Debt` and disables.
      Actual:

- [ ] Step 8. Revert `StartingGold` and `StartingDebt` in `GameRules.cs` to their pre-test values.
      Expected: The constants are back to normal before continuing.
      Actual:

## Edge cases

### Temporary setup: payment cap and limited resources

For each step below, edit only the two `GameRules.cs` constants named in that step, enter Play mode, start a fresh run, reach Shop, click Pay Debt once, record the result, stop Play mode, and revert or update the constants for the next step.

- [ ] Step 9. Set `StartingGold = 10` and `StartingDebt = 10`.
      Expected: Pay Debt pays exactly 3 gold/debt because debt and gold are both above `DebtPaymentCap`.
      Actual:

- [ ] Step 10. Set `StartingGold = 10` and `StartingDebt = 2`.
      Expected: Pay Debt pays exactly 2 and then disables as `No Debt`.
      Actual:

- [ ] Step 11. Set `StartingGold = 2` and `StartingDebt = 10`.
      Expected: Pay Debt pays exactly 2 and then disables as `Need Gold`.
      Actual:

- [ ] Step 12. Set `StartingGold = 0` and `StartingDebt = 5`.
      Expected: Pay Debt is disabled as `Need Gold`.
      Actual:

- [ ] Step 13. Set `StartingGold = 5` and `StartingDebt = 0`.
      Expected: Pay Debt is disabled as `No Debt`.
      Actual:

- [ ] Step 14. Revert `StartingGold` and `StartingDebt` in `GameRules.cs` to their pre-test values.
      Expected: The constants are back to normal before continuing.
      Actual:

### Temporary setup: debt status boundaries

For each boundary below, set `StartingDebt` in `GameRules.cs`, start a fresh run, inspect the run header in Scout or Shop, then stop Play mode before the next value. Revert `StartingDebt` afterward.

- [ ] Step 15. Check `StartingDebt = 0` and `StartingDebt = 5`.
      Expected: Both display `Stable`.
      Actual:

- [ ] Step 16. Check `StartingDebt = 6` and `StartingDebt = 11`.
      Expected: Both display `Strained`.
      Actual:

- [ ] Step 17. Check `StartingDebt = 12` and `StartingDebt = 19`.
      Expected: Both display `Dangerous`.
      Actual:

- [ ] Step 18. Check `StartingDebt = 20`.
      Expected: Header displays `Critical`; debt defeat behavior remains tied to the existing loss check when the run evaluates after combat/upkeep.
      Actual:

- [ ] Step 19. Revert `StartingDebt` in `GameRules.cs` to its pre-test value.
      Expected: The constant is back to normal before continuing.
      Actual:

## Observable invariants

- [ ] Step 20. Pay Debt never reduces gold below 0.
      Actual:

- [ ] Step 21. Pay Debt never reduces debt below 0.
      Actual:

- [ ] Step 22. Pay Debt never pays more than `GameRules.DebtPaymentCap` in one click.
      Actual:

- [ ] Step 23. Pay Debt changes only gold and debt; round, morale, party, offers, and selected phase remain unchanged.
      Actual:

- [ ] Step 24. Reward Summary debt warning copy is general.
      Expected: It mentions high debt, interest pressure, and debt-scaling threats in general; it does not name a specific fight or encounter.
      Actual:

## Regression checks

These are included because M12.1 touches `ShopManager`, `ShopPanelView`, `MainMenuPanel`, `RunHeaderView`, and `RewardSummaryView`, which are shared by shop spending, header refresh, and round-end economy display.

- [ ] Step 25. With normal constants restored, complete one regular full round from Scout -> Shop -> Payroll -> Formation -> Combat -> Reward -> Rival Update -> next Scout.
      Expected: State flow is unchanged; the reward screen appears before Rival Update and Continue advances normally.
      Actual:

- [ ] Step 26. In a normal Shop, hire a hero, fire a hero, and reroll if affordable.
      Expected: Existing hire/fire/reroll behavior still works, and the run header refreshes after each spending/refund action.
      Actual:

- [ ] Step 27. Reach or force the Debt Wraith encounter with a known debt value and observe combat log scaling.
      Expected: Debt Wraith still scales attack from current debt using the existing divisor; the new warning/status UI did not change its mechanics.
      Actual:

- [ ] Step 28. If a run reaches debt defeat during testing, inspect the end screen.
      Expected: Debt defeat still occurs at the existing debt limit and no wording implies debt loss has been removed.
      Actual:
