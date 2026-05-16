# TP_M11.2 - Cut Wages rule alignment and first economy retest

Manual Unity Editor test plan for slice **M11.2**. Run at 1920x1080 / 16:9 in Play mode.

This plan verifies that Cut Wages now reduces **total upkeep once** by `GameRules.CutWagesUpkeepReduction`, while still applying the per-hero attack penalty for combat. Use the visible Reward Summary plus the TSV written by `BalanceRunLogger` as the numeric source of truth.

For targeted math checks, prefer heroes without upkeep-changing effects: Squire, Warrior, Knight, Golem, Ninja, Ranger, Priest, Bard, and Enchanter. Avoid Treasurer and Apprentice in the targeted math parties unless you explicitly include their effects in the expected total.

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, set Game view to 1920x1080 / 16:9, and press Play.
      Expected: Main menu appears cleanly; Console has no new errors before starting.
      Actual:

- [ ] Step 2. Start a fresh run and note the Console path printed by `Balance log started: <path>`.
      Expected: A new balance TSV file is created for this run.
      Actual:

- [ ] Step 3. Build or keep a **1-hero** party with no upkeep-reduction hero, choose Cut Wages, complete the round, and inspect Reward Summary.
      Expected: `Upkeep due` equals `max(0, that hero's upkeep - 3)`, not `max(0, hero upkeep - 3)` repeated against multiple heroes. The payroll line says total upkeep is reduced.
      Actual:

- [ ] Step 4. Open the TSV for the same run and inspect that completed round.
      Expected: `PayrollAction` is `CutWages`, `UpkeepDue` matches the Reward Summary, and the `Party` column still shows normal per-hero upkeep values rather than each hero's upkeep being permanently reduced by 3.
      Actual:

- [ ] Step 5. In a fresh or continuing run, build a **3-hero** party with no upkeep-reduction hero, choose Cut Wages, complete the round, and inspect Reward Summary.
      Expected: `Upkeep due` equals `max(0, sum of the 3 heroes' upkeep - 3)`. It is not reduced by 9.
      Actual:

- [ ] Step 6. Open the TSV for the same completed round.
      Expected: `UpkeepDue` matches the Reward Summary and the party summary does not show per-hero Cut Wages upkeep reductions.
      Actual:

- [ ] Step 7. In a fresh or continuing run, build a **5-hero** party with no upkeep-reduction hero, choose Cut Wages, complete the round, and inspect Reward Summary.
      Expected: `Upkeep due` equals `max(0, sum of the 5 heroes' upkeep - 3)`. It is not reduced by 15.
      Actual:

- [ ] Step 8. Open the TSV for the same completed round.
      Expected: `UpkeepDue` matches the Reward Summary and the party summary does not show per-hero Cut Wages upkeep reductions.
      Actual:

- [ ] Step 9. With a comparable party size, choose Standard Pay for one completed round.
      Expected: `Upkeep due` equals the normal total after hero and encounter modifiers, with no Cut Wages reduction.
      Actual:

## Edge cases

- [ ] Step 10. Use Cut Wages with a low-upkeep party whose total upkeep is less than 3.
      Expected: `Upkeep due` is 0, not negative, in both Reward Summary and the TSV.
      Actual:

- [ ] Step 11. Use Cut Wages on a round with Tax Collector or Dungeon Auditor upkeep pressure if naturally reached.
      Expected: Encounter upkeep is included, then Cut Wages reduces the final total by 3 once; minimum remains 0.
      Actual:

- [ ] Step 12. Use Cut Wages with at least one 0-attack or 1-attack hero if available.
      Expected: Attack penalty does not drop any hero below 0 attack during combat, and the combat resolves without errors.
      Actual:

- [ ] Step 13. Use Take Loan for one completed round.
      Expected: Loan behavior is unchanged: +5 gold immediately and +6 debt reflected in the run state/logged economy.
      Actual:

- [ ] Step 14. Use Promise Victory Bonus for one completed round.
      Expected: Victory Bonus behavior is unchanged from pre-slice behavior for attack, gold, and loss debt.
      Actual:

## Short retest runs

### Run A - Cut Wages-heavy

```text
Balance log path:
Rounds played:
Final observed gold / debt / morale:
Party and tiers:
Rounds where Cut Wages was chosen:
Did any Cut Wages round show per-hero upkeep reduction? Yes / No:
Balance notes:
```

- [ ] Step 15. Start a fresh run and play at least 4 completed rounds, choosing Cut Wages whenever it is strategically plausible.
      Expected: Each Cut Wages row reduces total upkeep by 3 once. Debt and interest observations are no longer distorted by per-hero upkeep reductions.
      Actual:

### Run B - Standard Pay / loan mix

```text
Balance log path:
Rounds played:
Final observed gold / debt / morale:
Party and tiers:
Rounds where Standard Pay was chosen:
Rounds where Take Loan was chosen:
Balance notes:
```

- [ ] Step 16. Start a fresh run and play at least 4 completed rounds, preferring Standard Pay and Take Loan rather than Cut Wages.
      Expected: Standard Pay and loan rows remain consistent with M11.1 behavior, giving a useful comparison against the Cut Wages-heavy run.
      Actual:

## Observable invariants

- [ ] Step 17. Every completed round produces exactly one TSV row.
      Actual:

- [ ] Step 18. Reward Summary `Upkeep due`, `Upkeep paid`, `Upkeep shortfall`, and interest fields match the TSV row for that round.
      Actual:

- [ ] Step 19. Cut Wages summary text says total upkeep is reduced, not per-hero upkeep.
      Actual:

- [ ] Step 20. Cut Wages combat attack penalties are temporary; later rounds start from normal tier-adjusted attack unless another payroll action modifies combat.
      Actual:

- [ ] Step 21. No Reward Summary or TSV row shows negative upkeep, negative paid upkeep, or negative shortfall.
      Actual:

## Regression checks

These are included because M11.2 touches `PayrollManager.Apply`, `PayrollManager.ApplyPostCombat`, and `RunManager.CalculateTotalUpkeep`, which are shared by all payroll and round-end economy behavior.

- [ ] Step 22. Complete one normal full round from Scout -> Shop -> Payroll -> Formation -> Combat -> Reward -> Rival Update -> next Scout.
      Expected: State flow is unchanged; the reward screen appears before Rival Update and Continue advances normally.
      Actual:

- [ ] Step 23. Compare one Standard Pay row and one Cut Wages row from similar party sizes.
      Expected: The only payroll-specific economy difference is the one-time Cut Wages total-upkeep reduction; other reward, morale, interest, and state-flow behavior remains normal.
      Actual:

- [ ] Step 24. If a run reaches defeat or victory during the short retests, inspect the final TSV row and end screen.
      Expected: Final `NextState`/end reason and end-screen result are still consistent with morale, debt, or final boss outcome.
      Actual:
