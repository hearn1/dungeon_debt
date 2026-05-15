# TP_M7.1 - Rival State and Leaderboard Loop

Manual Unity Editor test plan for slice M7.1.

No temporary diagnostic scaffold is required for the core scenarios because `RivalLeaderboardView` displays the plain C# rival state directly.

---

## Happy Path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` and enter Play Mode.
      Expected: The main menu appears with no Console errors.
      Actual: pass

- [ ] Step 2. Click Start Run.
      Expected: The run enters Scout for Round 1; the compact rival leaderboard is visible and does not cover the Scout Continue button.
      Actual: pass

- [ ] Step 3. Inspect the compact leaderboard.
      Expected: Exactly 4 rows appear: You, Greedy Guild, Frugal Guild, Carry Guild. Rivals start at Morale 30, Debt 0, Payroll 10/6/8, and statuses Dangerous/Safe/Scaling.
      Actual: pass

- [ ] Step 4. Continue through Scout -> Shop -> Formation -> Payroll -> Combat -> Reward.
      Expected: The normal M6 round flow still works; Reward Summary appears after combat and shows reward/upkeep/economy math.
      Actual: pass

- [ ] Step 5. Click Continue on Reward Summary.
      Expected: The game enters RivalUpdate, the full leaderboard is visible, and a Continue to Scout button appears.
      Actual: pass

- [ ] Step 6. Inspect the RivalUpdate leaderboard after Round 1.
      Expected: Greedy Guild is Morale 30 / Debt 4 / Payroll 12; Frugal Guild is 30 / 0 / 7; Carry Guild is 30 / 1 / 9.
      Actual:pass

- [ ] Step 7. Click Continue to Scout.
      Expected: The game advances to Round 2 Scout; the compact leaderboard remains visible and shows the Round 1 rival updates.
      Actual: pass

---

## Edge Cases

- [ ] Step 8. Complete Round 2 and stop on the RivalUpdate screen.
      Expected: Greedy Guild is Morale 30 / Debt 11 / Payroll 14; Frugal Guild is 30 / 0 / 8; Carry Guild is 30 / 4 / 11.
      Actual: pass

- [ ] Step 9. Complete Round 3 and stop on the RivalUpdate screen.
      Expected: Carry payroll growth used the odd-round +1 value; Greedy Guild is Morale 28 / Debt 19 / Payroll 16; Frugal Guild is 30 / 0 / 9; Carry Guild is 30 / 8 / 12.
      Actual: pass

- [ ] Step 10. Check leaderboard sorting on the Round 3 RivalUpdate screen.
      Expected: Rows are sorted by morale descending; Greedy Guild appears below the 30-morale rows after its morale drops to 28. Ties keep a stable order.
      Actual: pass

- [ ] Step 11. Continue from Round 3 RivalUpdate to Round 4 Scout.
      Expected: Round increments once, Scout loads the Round 4 Tax Collector encounter, and rivals do not advance a second time while entering Scout.
      Actual: pass

- [ ] Step 12. Complete a full run through Round 10 with any viable party.
      Expected: A terminal Victory or Defeat screen appears after Round 10 resolution instead of routing to RivalUpdate or Round 11.
      Actual: pass

---

## Rule Checks

- [ ] Step 13. Source-check `DungeonDebt/Assets/Scripts/Run/RivalManager.cs`.
      Expected: Rival updates are deterministic scripted math; there is no `UnityEngine.Random`, shop simulation, online ghost, replay, account, save/load, event bus, DI container, or service locator code.
      Actual: pass

- [ ] Step 14. Source-check `DungeonDebt/Assets/Scripts/Core/GameRules.cs`.
      Expected: Rival numeric tuning lives in named `GameRules` constants rather than magic numbers in `RivalManager`.
      Actual: pass

- [ ] Step 15. Source-check `DungeonDebt/Assets/Scripts/Core/DataRepository.cs`.
      Expected: Rounds 3/6/9 still use the existing Slime placeholder enemy teams; M7.1 did not add scripted ghost combat teams.
      Actual: pass

- [ ] Step 16. Source-check the project tree.
      Expected: No `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folder was created by this slice.
      Actual: pass

---

## Regression Checks

- [ ] Step 17. During Round 2 Goblin Thieves, allow or observe combat through Reward Summary.
      Expected: Existing M6.2 encounter effects still resolve and reward/upkeep summary still appears.
      Actual: pass

- [ ] Step 18. During Round 4 Tax Collector, reach Reward Summary.
      Expected: Tax Collector upkeep modifier still appears in the economy math; RivalUpdate happens only after clicking Continue from Reward Summary.
      Actual: pass

- [ ] Step 19. Run Shop -> Formation -> Payroll on any post-RivalUpdate round.
      Expected: Shop offers, formation swapping, payroll selection, and combat start still function after returning from RivalUpdate.
      Actual: pass

- [ ] Step 20. Restart from an end screen or with the restart button.
      Expected: A fresh run starts with exactly 3 rivals reset to the original starting values.
      Actual: pass

---

## Observable Invariants

- [ ] Step 21. Observe every Scout and RivalUpdate screen reached in this test.
      Expected: The leaderboard always shows exactly 4 rows: player plus 3 rivals.
      Actual: pass

- [ ] Step 22. Observe every non-Scout, non-RivalUpdate screen reached in this test.
      Expected: The rival leaderboard is hidden and does not obscure Shop, Formation, Payroll, Combat, Reward, Victory, or Defeat controls.
      Actual: pass

- [ ] Step 23. Observe rival values over multiple RivalUpdate screens.
      Expected: Rival payroll and debt never display negative numbers; morale never displays below 0.
      Actual: pass

- [ ] Step 24. Observe the Run Header after each RivalUpdate Continue.
      Expected: Round increases by exactly 1 and stays within 1-10 during normal play.
      Actual: pass

- [ ] Step 25. Observe Console throughout the test.
      Expected: No new errors or warnings are logged by this slice.
      Actual: pass

Regression: bought 2 characters day 1. Put in position F0 and B3. bought 2 more on day 2. 2 characters were both in b3 (order/placement might be slightly off, but the stacking was on B3)