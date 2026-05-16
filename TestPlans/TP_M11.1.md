# TP_M11.1 - Economy and balance baseline run matrix

Manual Unity Editor observation plan for slice **M11.1**. Run at 1920x1080 / 16:9 in Play mode.

This is a balance-data collection slice. A lightweight `BalanceRunLogger` writes one TSV row at the end of each completed round, after reward/upkeep/interest math and before the next state advances. The log is the primary source for numeric round-end data; manual notes are still needed for archetype intent, shop decisions, substitutions, pivots, and invalid-run reasons.

Do not edit gameplay tuning constants, scene files, prefabs, art, or design docs while running this plan.

---

## Logger instructions

- On every fresh run, the Unity Console prints `Balance log started: <path>`.
- The log file is written under `Application.persistentDataPath/BalanceLogs/` with a name like `balance_run_yyyyMMdd_HHmmss.tsv`.
- Each row captures: run id, timestamp, round, encounter, payroll action, combat result, reward, morale change, upkeep due/paid/shortfall, interest, ending gold/debt/morale, next state/end reason, party summary, and rival summary.
- Copy the log path into the run summary. After each run, either attach the TSV file or paste its rows into this plan before asking Codex to synthesize findings.

## Recording rules

- Use one fresh run per archetype: Balanced, Aggressive, Economy/Support.
- Play naturally within the archetype priorities. Do not make an obviously bad choice just to satisfy the script.
- Record every major deviation, forced substitute, failed shop search, and pivot in the manual notes.
- If a run is derailed by a bug, unclear rule, impossible archetype setup, or tester mistake, stop using it as balance data and fill out **Incomplete / Invalid Run**.
- If a run ends before round 10, record the loss state and skip the remaining manual notes for that run.
- Do not restart a valid run just because the shop RNG was unfriendly; bad offer luck is part of the observation unless it makes the archetype impossible to attempt.

## Archetype rules

### Run A - Balanced party

Intent: build a mixed party that can answer most fights without overcommitting to either debt or low payroll.

Shopping priorities:
1. Maintain at least one Tank and one Damage hero by round 2 if offers allow.
2. Add one Support or Economy hero before round 5 if doing so does not bankrupt the party.
3. Prefer affordable upgrades over expensive new hires once the party has 4-5 heroes.
4. Avoid stacking only high-upkeep heroes unless combat losses force a power spike.

Payroll tendencies:
- Use Standard Pay when stable.
- Use Promise Victory Bonus for likely close rival/final fights.
- Use Take Loan only if a hire or reroll clearly fixes the next encounter.
- Use Cut Wages only when avoiding an immediate debt spiral is worth the attack penalty.

### Run B - Aggressive party

Intent: prioritize early wins and high damage, accepting higher upkeep and measured debt risk.

Shopping priorities:
1. Prioritize Damage heroes: Ninja, Wizard, Ranger.
2. Add enough frontline to keep carries alive, but do not overbuy pure economy support early.
3. Reroll more aggressively than the Balanced run when looking for damage or upgrades.
4. Upgrade damage carries when duplicate offers appear.

Payroll tendencies:
- Use Promise Victory Bonus for tempo fights, rival ghosts, and any fight where +1 attack likely changes the result.
- Use Take Loan to secure a strong hire or reroll chain.
- Avoid Cut Wages unless the run would otherwise lose to debt/upkeep immediately.

### Run C - Economy/support party

Intent: test whether sustain, gold generation, and upkeep reduction can survive without overloading on carries.

Shopping priorities:
1. Prioritize Bard, Treasurer, Priest, Enchanter, Apprentice.
2. Add just enough Tank/Damage to avoid repeated combat losses.
3. Prefer cheap bodies and upgrades that reduce upkeep pressure.
4. Do not force a 5/5 party if payroll would become the main failure point.

Payroll tendencies:
- Use Standard Pay when the support engine is stable.
- Use Cut Wages to test whether upkeep relief can save the run without causing a loss.
- Use Take Loan sparingly, mainly to secure Bard/Treasurer/Priest/critical stabilizers.
- Use Promise Victory Bonus when a low-damage support party needs a temporary kill-speed boost.

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, set Game view to 1920x1080 / 16:9, then press Play.
      Expected: Main menu appears cleanly; Console has no new errors before starting the matrix.
      Actual:

- [ ] Step 2. Start **Run A - Balanced party**.
      Expected: The Console prints `Balance log started: <path>`.
      Actual:

### Run A - Balanced party

```text
Balance log path:
Final result:
Round reached:
Ending gold / debt / morale:
Final party and tiers:
Silver hires/upgrades total:
Primary win/loss reason:
Main pressure point:
Was this run valid balance data? Yes / No:
If no, why:

Manual notes by round:
Round 1:
Round 2:
Round 3:
Round 4:
Round 5:
Round 6:
Round 7:
Round 8:
Round 9:
Round 10:

Paste TSV rows or attach the log:
```

- [ ] Step 3. Play Run A until victory, defeat, or invalidation.
      Expected: The TSV has one row per completed round. Manual notes explain shop choices, substitutes, pivots, and archetype deviations.
      Actual:

- [ ] Step 4. Stop Play mode. Start **Run B - Aggressive party**.
      Expected: The Console prints a new `Balance log started: <path>` and Run A state is not carried forward.
      Actual:

### Run B - Aggressive party

```text
Balance log path:
Final result:
Round reached:
Ending gold / debt / morale:
Final party and tiers:
Silver hires/upgrades total:
Primary win/loss reason:
Main pressure point:
Was this run valid balance data? Yes / No:
If no, why:

Manual notes by round:
Round 1:
Round 2:
Round 3:
Round 4:
Round 5:
Round 6:
Round 7:
Round 8:
Round 9:
Round 10:

Paste TSV rows or attach the log:
```

- [ ] Step 5. Play Run B until victory, defeat, or invalidation.
      Expected: The TSV has one row per completed round. Manual notes explain damage-priority shopping, debt risks, reroll pressure, and forced pivots.
      Actual:

- [ ] Step 6. Stop Play mode. Start **Run C - Economy/support party**.
      Expected: The Console prints a new `Balance log started: <path>` and Run B state is not carried forward.
      Actual:

### Run C - Economy/support party

```text
Balance log path:
Final result:
Round reached:
Ending gold / debt / morale:
Final party and tiers:
Silver hires/upgrades total:
Primary win/loss reason:
Main pressure point:
Was this run valid balance data? Yes / No:
If no, why:

Manual notes by round:
Round 1:
Round 2:
Round 3:
Round 4:
Round 5:
Round 6:
Round 7:
Round 8:
Round 9:
Round 10:

Paste TSV rows or attach the log:
```

- [ ] Step 7. Play Run C until victory, defeat, or invalidation.
      Expected: The TSV has one row per completed round. Manual notes explain support/economy shopping, stabilizer purchases, sustain failures/successes, and forced pivots.
      Actual:

## Edge cases

- [ ] Step 8. During any run, if a shop offers no on-plan hero, choose the best available substitute and record the reason.
      Expected: The run remains valid if the substitute is a reasonable archetype-preserving or survival-preserving choice.
      Actual:

- [ ] Step 9. During any run, if a payroll choice is forced by immediate debt/upkeep danger rather than archetype preference, record it.
      Expected: The run remains valid if the forced choice is explained in the manual notes; the logger captures the chosen payroll action and resulting economy state.
      Actual:

- [ ] Step 10. During any run, if Silver offers appear repeatedly or rarely, record whether they changed hire timing, party shape, or debt risk.
      Expected: Silver variance is captured as a balance observation rather than corrected through test setup.
      Actual:

- [ ] Step 11. During any run, if the archetype collapses before it can form its intended core, record whether the cause was shop variance, combat weakness, upkeep pressure, debt/interest pressure, morale pressure, or tester error.
      Expected: Valid early losses still produce useful pressure data; invalid runs are moved to the invalid-run section.
      Actual:

## Incomplete / Invalid Run

Use this section for any run that should not count as balance data.

```text
Run label:
Balance log path, if any:
Round where invalidated:
Reason category: Bug / unclear rule / impossible archetype setup / UI or tester mistake / other
What happened:
Why the data should be excluded:
Can the same archetype be rerun without source changes? Yes / No
If no, what blocks it:
Potential regression to file? Yes / No
Notes:
```

- [ ] Step 12. If a run is invalidated, stop using its later results as balance data and fill the invalid-run record above.
      Expected: The final M11.1 summary clearly separates valid balance observations from invalid/incomplete runs.
      Actual:

## Observation synthesis

Fill this after all three runs are complete or marked incomplete.

```text
Cross-run observations:
1.
2.
3.

Balance hypotheses for M11.2:
1. Hypothesis:
   Evidence:
   Tuning target constants/files:

2. Hypothesis:
   Evidence:
   Tuning target constants/files:

3. Hypothesis:
   Evidence:
   Tuning target constants/files:

4. Hypothesis:
   Evidence:
   Tuning target constants/files:

5. Hypothesis:
   Evidence:
   Tuning target constants/files:

6. Hypothesis:
   Evidence:
   Tuning target constants/files:

Recommended M11.2 first tuning target:
Reason:
Suggested files/constants to inspect first:
```

## Observable invariants

- [ ] Step 13. Each fresh run creates a distinct TSV log file and prints its path in the Unity Console.
      Actual:

- [ ] Step 14. Each valid completed round produces exactly one TSV row.
      Actual:

- [ ] Step 15. TSV row values for reward/upkeep/interest/final resources match the visible Reward Summary and Run Header for the same round.
      Actual:

- [ ] Step 16. Manual notes capture decisions the logger cannot infer: shop offers/actions, archetype substitutions, forced pivots, and invalid-run reasons.
      Actual:

- [ ] Step 17. The completed synthesis identifies 3-6 concrete M11.2 balance hypotheses tied to constants or files.
      Actual:

## Regression checks

These are included because M11.1 now touches `RunManager.InitializeRun` and `GameManager.ContinueAfterReward`, which are shared run-flow seams.

- [ ] Step 18. Complete one full round from Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> Rival Update -> next Scout.
      Expected: The normal state flow is unchanged; the logger row appears without blocking Continue or skipping Rival Update.
      Actual:

- [ ] Step 19. End a run by victory, morale defeat, debt defeat, or final boss defeat if naturally reached during the matrix.
      Expected: The final completed-round row includes `NextState` as `Victory` or `Defeat` and an end reason; the end screen still appears normally.
      Actual:
