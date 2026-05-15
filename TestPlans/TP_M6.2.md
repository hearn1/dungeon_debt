# TP_M6.2 — Encounter and hero effects wired into combat / reward / upkeep

Slice: **M6.2**
Milestone: **M6 — Full 10-Round Run**
Brief: `NEXT_SESSION.md` (as captured before this slice).

This plan exercises every encounter mechanic added in M6.2 plus every named `HeroEffectId`. Several scenarios add a **Temporary diagnostic scaffold** subsection. Every diagnostic scaffold must be reverted before the slice is marked complete — the explicit revert step is the final checkbox in each affected scenario.

Run all scenarios in the order listed. Where a scenario requires a non-default party, hire-and-fire via the in-run Shop is fine; the diagnostic scaffolds tell you which heroes to build around.

Treasure Leech note: under the MVP combat win rule, the player only wins after all enemies are dead. That means a Treasure Leech alive at combat end implies a combat loss, usually by turn limit. The reward drain is still valid, but the observable outcome is `LossReward - 4 = 0`, not a win with `Gold gained: +4`.

---

## A. Happy path — full 10-round sweep with effects layered in

Use a balanced party (e.g., Warrior + Knight + Wizard + Ranger + Priest) for the first pass.

- [ ] Step 1. Launch the Editor, press Play, click **Start Run**, hire any 5 heroes you can afford in Round 1, Continue through Formation → Skip Payroll → Combat → Reward Summary.
      Expected: Combat resolves with normal log lines. Reward Summary shows `Gold gained: +8` (win) or `+4` (loss). No new errors in Console.
      Actual:
- [ ] Step 2. Continue through Round 2 (Goblin Thieves).
      Expected: If combat lasts past combat round 3 with a Goblin Thief still alive, the combat log contains a `escapes with the gold` line and the Reward Summary's `Gold gained` is `+5` on a win (8 − 3). If both Thieves die by/at end of round 3, `Gold gained` is `+8`.
      Actual:
- [ ] Step 3. Continue through Round 3 (Greedy Guild Ghost — Slime placeholders).
      Expected: Same baseline reward math as Round 1. (Rival bonus is M7 scope.)
      Actual:
- [ ] Step 4. Continue through Round 4 (Tax Collector).
      Expected: Reward Summary `Upkeep due` is the party-upkeep sum **+ 2** compared to Rounds 1/3. Sample: 5-hero party with 12 base upkeep should show 14 here.
      Actual:
- [ ] Step 5. Continue through Round 5 (Backline Bat).
      Expected: On combat round 2, log includes one `Backline Bat attacks <backline hero>` line where `<backline hero>` is the lowest-HP hero currently in slots 2–4 (ties: leftmost). If no backline hero is alive on round 2, falls back to normal frontline targeting.
      Actual:
- [ ] Step 6. Continue through Round 6 (Carry Guild Ghost — Slime placeholders).
      Expected: Same baseline reward math.
      Actual:
- [ ] Step 7. Continue through Round 7 (Debt Wraith). Observe debt before combat.
      Expected: First log line for the Wraith reads `Debt Wraith scales to <X> attack (debt <D>).` with `X = 1 + (D / 3)` (integer division).
      Actual:
- [ ] Step 8. Continue through Round 8 (Treasure Leech).
      Expected: If the Leech is killed and the player wins, Reward Summary shows `Gold gained: +8`. If the Leech is alive at combat end, the combat is a loss under the MVP win rule, and Reward Summary shows `Gold gained: +0` (4 − 4, clamped at 0).
      Actual:
- [ ] Step 9. Continue through Round 9 (Frugal Guild Ghost — Slime placeholders).
      Expected: Same baseline reward math.
      Actual:
- [ ] Step 10. Continue through Round 10 (Dungeon Auditor).
      Expected: Reward Summary `Upkeep due` includes **+3** vs. a non-encounter round. Combat log includes `Dungeon Auditor audits <hero> for 1.` for every living player hero at the end of combat rounds 3, 6, and/or 9 (whichever the fight reaches). On a final-boss win → Victory screen.
      Actual:

---

## B. Goblin Thief steal — isolation

### Temporary diagnostic scaffold

1. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `ApplyPostCombatResult`, add immediately above `_currentRunState.Gold += rewardGold;`:
   ```csharp
   UnityEngine.Debug.Log($"[DIAG-Goblin] PlayerWon={combatResult.PlayerWon} stoleFlag={combatResult.SurvivorFlags.GetValueOrDefault(\"goblinStoleGold\")} rewardGold={rewardGold}");
   ```
2. Look for `[DIAG-Goblin]` lines in the Unity Console after Round 2 combat.
3. The final scenario checkbox reverts this edit.

- [ ] Step 1. Build a slow / low-damage party (e.g., 5 × Squire). Force the goblin fight to drag past combat round 3.
      Expected: Console line shows `stoleFlag=True` and `rewardGold=5` on a win, or `rewardGold=1` on a loss.
      Actual:
- [ ] Step 2. Reload the run; build a stronger party (e.g., 2 × Wizard + Ranger + Warrior + Squire) that kills both Goblin Thieves on combat round 1 or 2.
      Expected: Console line shows `stoleFlag=False` and `rewardGold=8`.
      Actual:
- [ ] Step 3. **Revert the diagnostic scaffold.** Save the file. Confirm Unity recompiles without errors.
      Expected: `RunManager.cs` no longer contains any `[DIAG-Goblin]` lines.
      Actual:

---

## C. Tax Collector upkeep — isolation

- [ ] Step 1. Reach Round 4. Note party-upkeep sum from the previous round's Reward Summary (`Upkeep due` minus any payroll modifier).
      Expected: Round 4 `Upkeep due` equals previous round's party upkeep + 2 (with no payroll modifier active in either round).
      Actual:
- [ ] Step 2. From the same save state, choose `Cut Wages` in Round 4 Payroll.
      Expected: Round 4 `Upkeep due` equals max(0, party upkeep − 3) + 2 (Cut Wages reduction stacks with Tax Collector encounter modifier).
      Actual:

---

## D. Backline Bat targeting — isolation

- [ ] Step 1. Reach Round 5. Place a Wizard in slot 2 (lowest-HP backline), Ranger in slot 3, Priest in slot 4. Tanks in slots 0–1.
      Expected: On combat round 2, the Bat attacks the Wizard (lowest backline HP). Log line: `Backline Bat attacks Wizard for 3.` (or similar depending on damage reduction / payroll).
      Actual:
- [ ] Step 2. Reload. Move the Wizard to slot 4 and Priest to slot 2. Re-run.
      Expected: On combat round 2, the Bat attacks the Priest (now lowest backline HP). If two backline heroes share the lowest HP, the leftmost slot wins the tie.
      Actual:
- [ ] Step 3. Reload. Use a 2-hero formation in slots 0–1 only (no backline).
      Expected: On combat round 2, the Bat falls back to normal frontline targeting (no override). No NRE in the log or Console.
      Actual:

---

## E. Debt Wraith scaling — isolation

### Temporary diagnostic scaffold

1. In `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, **temporarily** change `StartingDebt = 0` to `StartingDebt = 9`.
2. The final scenario checkbox reverts this edit.

- [ ] Step 1. Start a fresh run. Burn through to Round 7 without paying off the loan / without taking new debt. The Reward Summary header should show Debt ≈ 9 entering Round 7's combat.
      Expected: Combat log opens with `Debt Wraith scales to 4 attack (debt 9).` (1 + 9/3 = 4).
      Actual:
- [ ] Step 2. Reload. Change `StartingDebt` to `0`. Reach Round 7 with debt 0.
      Expected: Combat log opens with `Debt Wraith scales to 1 attack (debt 0).` (1 + 0/3 = 1).
      Actual:
- [ ] Step 3. **Revert the `GameRules.StartingDebt` edit back to `0`.** Save. Confirm Unity recompiles without errors.
      Expected: `GameRules.StartingDebt` is `0`.
      Actual:

---

## F. Treasure Leech — isolation

- [ ] Step 1. Reach Round 8. Use a party that can kill the Leech (12 HP) before combat ends.
      Expected: Reward Summary `Gold gained: +8`. No `treasureLeechSurvived` deduction.
      Actual:
- [ ] Step 2. Reload. Use a low-damage party that lets the Leech survive.
      Expected: Combat ends as a loss because the Leech survived. Reward Summary shows `Gold gained: +0` (4 − 4 = 0, clamped at 0).
      Actual:

---

## G. Dungeon Auditor — isolation

### Temporary diagnostic scaffold

1. In `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs`, inside the `OnEndOfCombatRound` Auditor branch, immediately after the `if (encounter != null && ... combatRound % GameRules.AuditorDamageEvery == 0)` opening, add at the top of that block:
   ```csharp
   UnityEngine.Debug.Log($"[DIAG-Auditor] combatRound={combatRound} damage={GameRules.AuditorDamage}");
   ```
2. The final scenario checkbox reverts this edit.

- [ ] Step 1. Reach Round 10. Use any party. Let the fight reach at least combat round 3.
      Expected: Console shows one `[DIAG-Auditor] combatRound=3 damage=1` line per multiple-of-3 combat round. Combat log shows `Dungeon Auditor audits <hero> for 1.` for each living hero at end of round 3, in leftmost-slot order. Any hero whose HP hits 0 from this damage logs a death line immediately after their audit line.
      Actual:
- [ ] Step 2. From Step 1's run, verify Reward Summary `Upkeep due` equals party upkeep + 3 (Auditor encounter modifier).
      Expected: +3 added to base party upkeep, regardless of payroll choice.
      Actual:
- [ ] Step 3. **Revert the diagnostic scaffold.** Save. Confirm Unity recompiles without errors.
      Expected: `HeroEffects.cs` no longer contains `[DIAG-Auditor]` lines.
      Actual:

---

## H. Hero effect coverage — per `HeroEffectId`

For each item, build a small party that puts the effect on display and run **one** combat.

- [ ] Step 1. **`None` (Warrior / Squire).** Hire only Warriors and Squires; run any combat.
      Expected: No special log lines beyond plain attacks and deaths.
      Actual:
- [ ] Step 2. **`KnightRedirect`.** Hire a Knight (slot 0) plus a Wizard in slot 2. Reach Round 5 (Backline Bat).
      Expected: On combat round 2, log shows `Knight redirects the hit from Wizard.` exactly once. Subsequent backline hits this combat (e.g., once the frontline is dead) are not redirected.
      Actual:
- [ ] Step 3. **`GolemArmor`.** Hire a Golem and place in slot 0. Run any combat against an enemy with attack ≥ 2.
      Expected: Each attack against the Golem deals one less damage than the enemy's attack stat (e.g., Cave Bat 2 → 1; Slime 1 → 0).
      Actual:
- [ ] Step 4. **`WizardScaling` (full-upkeep fallback).** Run Round 1 with party-upkeep ≤ starting gold so upkeep is fully paid. On Round 2's combat log, look for `Wizard gains +1 attack (full upkeep paid).` Then deliberately overspend in Round 2 (e.g., hire-and-fire to force shortfall) so upkeep cannot be fully paid; Round 3 should NOT show the buff line.
      Expected: Round 2 shows the buff line; Round 3 does not. Wizard's damage-per-attack in Round 2's log is `BaseAttack + 1`.
      Actual:
- [ ] Step 5. **`NinjaLowestTarget`.** Hire a Ninja. Run a combat where enemies have different HP.
      Expected: Ninja targets the lowest-HP living enemy each turn (tie → leftmost slot). On each kill, log shows `Ninja loots +1 gold.` and the Run Header gold ticks up.
      Actual:
- [ ] Step 6. **`RangerBackline`.** Place a Ranger in slot 2 or beyond.
      Expected: Ranger attacks normally from the backline. No special log line (this is no-op flavor per §7 first-pass).
      Actual:
- [ ] Step 7. **`PriestHeal`.** Hire a Priest. Reach any combat that lasts ≥ 2 combat rounds with a frontline hero taking damage.
      Expected: At the end of each combat round, log shows `Priest heals <hero> for N.` where N ≤ 2 and target is the leftmost living frontline (or the Priest if no frontline survives). Healing never exceeds the target's MaxHealth.
      Actual:
- [ ] Step 8. **`BardGoldOnWin`.** Hire a Bard. Win any combat.
      Expected: Combat log includes `Bard sings for +2 gold.` Run Header gold reflects the +2 (in addition to the round's `WinReward`).
      Actual:
- [ ] Step 9. **`EnchanterAdjacent`.** Hire Enchanter (slot 1) and Wizard (slot 2). Run any combat.
      Expected: Log shows `Enchanter enchants Wizard (+1 attack).` once at combat start. Wizard's damage-per-attack in the log is `BaseAttack + 1`. If a non-Damage-role hero is adjacent instead, no buff line.
      Actual:
- [ ] Step 10. **`TreasurerUpkeepReduce`.** Hire a Treasurer alongside a high-upkeep hero (e.g., Golem upkeep 6).
      Expected: Reward Summary `Upkeep due` equals (sum of base upkeeps) − 2. The hero with the highest base upkeep had its upkeep reduced by 2.
      Actual:
- [ ] Step 11. **`ApprenticeWizardSupport`.** Hire a Wizard (upkeep 5) and an Apprentice.
      Expected: Reward Summary `Upkeep due` equals (sum of base upkeeps) − 1. If both Treasurer and Apprentice are present, Apprentice applies first (Wizard from 5 → 4), then Treasurer picks highest remaining (e.g., Golem 6 → 4 if Wizard now lower).
      Actual:

---

## I. Rule checks

- [ ] Step 1. Source search: `UnityEngine.Random` — should appear 0 times in `DungeonDebt/Assets/Scripts/**`.
      Expected: 0 occurrences.
      Actual:
- [ ] Step 2. Every new numeric tunable from this slice is referenced from `GameRules`, not inlined.
      Expected: `TaxCollectorUpkeep`, `AuditorUpkeep`, `AuditorDamageEvery`, `AuditorDamage`, `DebtWraithDebtDivisor`, `GoblinThiefStealRound`, `GoblinThiefStealGold`, `TreasureLeechStealGold` are all defined in `GameRules.cs` and referenced (not magic-numbered) in `HeroEffects.cs` and `RunManager.cs`.
      Actual:
- [ ] Step 3. `HeroEffects.cs` is a static class with one method per hook, keyed by enum switches (no subclasses, no virtuals).
      Expected: Confirmed by reading the file.
      Actual:
- [ ] Step 4. `EnemyDefinition.Attack` for `DebtWraith` is still `1` in `DataRepository.cs` (the run-time scaling mutates `CombatUnit.Attack`, not the definition).
      Expected: `DebtWraith` constructor still passes `1` as attack.
      Actual:
- [ ] Step 5. `DataRepository.AllPayrollActions`, `AllHeroes`, `AllEnemies`, `Encounters` are still read-only.
      Expected: All still `IReadOnlyList`-typed.
      Actual:

---

## J. Regression checks

- [ ] Step 1. **TP_M6.1 sweep.** Scout panel still renders the right name/type/scout text for every round; ContinueFromScout still routes to Shop.
      Expected: Behavior identical to TP_M6.1 happy path.
      Actual:
- [ ] Step 2. **TP_R002 round-advance routing.** After Reward Summary, Continue still routes to Shop (Round N+1), not Combat.
      Expected: Shop → Formation → Payroll → Combat → Reward → Shop loop intact.
      Actual:
- [ ] Step 3. **TP_M5.2 payroll line items.** Reward Summary still shows the `Loan / Cut Wages / Victory Bonus` summary line for non-StandardPay choices. Cut Wages reduces party upkeep by 3 before Tax Collector / Auditor encounter modifier is added.
      Expected: Same line items as M5.2; encounter modifier stacks additively after Cut Wages.
      Actual:
- [ ] Step 4. **TP_M4.1 formation swap.** Click-to-swap between two occupied slots still works on the Formation panel.
      Expected: Heroes swap; Continue still routes to Payroll.
      Actual:
- [ ] Step 5. **TP_M3.2 shop math.** Hire/Fire/Reroll gold math unchanged.
      Expected: Hire cost = `BaseUpkeep + 2`; Fire refund = 1; Reroll cost = 2; party cap = 5.
      Actual:

---

## K. Observable invariants

- [ ] Inv 1. After every combat that triggers a steal/leech flag, `result.SurvivorFlags["goblinStoleGold"]` or `["treasureLeechSurvived"]` is `true`; on combats where the flag's enemy was killed, the flag is absent or `false`.
      Actual:
- [ ] Inv 2. `LatestRewardGold` is never negative.
      Actual:
- [ ] Inv 3. `LatestTotalUpkeep` is never negative after encounter modifiers are applied.
      Actual:
- [ ] Inv 4. Auditor periodic damage never leaves a hero with HP > 0 but the death log line still printed (i.e., the death log only fires when `CurrentHealth == 0`).
      Actual:
- [ ] Inv 5. `Knight redirects the hit from <X>.` appears at most once per combat.
      Actual:
- [ ] Inv 6. `FullUpkeepPaidLastRound` is `true` immediately after any round where `upkeepShortfall == 0`, and `false` otherwise. Round 1's combat never triggers Wizard scaling (initial flag is `false`).
      Actual:

---

## Diagnostic scaffold revert checklist

Before marking this slice complete, confirm:

- [ ] `RunManager.cs` contains no `[DIAG-Goblin]` lines.
- [ ] `GameRules.cs` has `StartingDebt = 0`.
- [ ] `HeroEffects.cs` contains no `[DIAG-Auditor]` lines.
- [ ] Unity compiles with no new errors or warnings.
