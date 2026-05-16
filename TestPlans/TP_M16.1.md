# TP_M16.1 - Relic rewards after boss wins

Manual Unity Editor test plan for M16.1. Run in `Assets/Scenes/Main.unity`.

## Temporary diagnostic scaffold

Relic choices and combat unit stats live in plain C# objects, so use temporary Console logs for the targeted scenarios below.

Add these logs only while testing this plan, then remove them before the slice is marked complete:

1. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `TryPreparePendingRelicReward`, immediately after `_currentRunState.HasPendingRelicReward = true;`, add:

```csharp
UnityEngine.Debug.Log("[M16.1] Relic choices: " + string.Join(", ", _currentRunState.PendingRelicChoices) + " -> " + nextState);
```

2. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `SelectPendingRelic`, immediately after `_currentRunState.ActiveRelics.Add(relicId);`, add:

```csharp
UnityEngine.Debug.Log("[M16.1] Selected relic: " + relicId);
```

3. In `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs`, inside `BuildPlayerUnits`, immediately after `playerUnits.Add(unit);`, add:

```csharp
UnityEngine.Debug.Log("[M16.1] Player " + unit.DisplayName + " role " + hero.Definition.Role + " ATK " + unit.Attack + " HP " + unit.MaxHealth);
```

4. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `ApplyPostCombatResult`, immediately after `rewardGold += relicRewardGold;`, add:

```csharp
UnityEngine.Debug.Log("[M16.1] Reward " + rewardGold + " relicGold " + relicRewardGold);
```

- [ ] Step 1. Add the temporary diagnostic scaffold above and let Unity recompile.
      Expected: Console has no compile errors; no `[M16.1]` lines appear until combat/reward/relic selection happens.
      Actual:

## Happy path

- [ ] Step 2. Start a Standard Contract run and play normally until winning round 3 `Greedy Guild Ghost`.
      Expected: Reward Summary appears first as usual; clicking Continue opens `Choose a Relic` before the Rival Update screen.
      Actual:

- [ ] Step 3. On the relic screen, inspect the choices and Console.
      Expected: Up to 3 choices are shown; Console logs the same pending choices; no duplicate choices appear in the same offer.
      Actual:

- [ ] Step 4. Select any relic.
      Expected: Console logs the selected relic, the header immediately shows `Relics: <selected name>`, and the run proceeds to Rival Update.
      Actual:

- [ ] Step 5. Continue into the next round and complete any later combat.
      Expected: Reward Summary lists active relic names; if `Guild Dividend` is active, it shows `Relic bonus: +1 gold` and the reward diagnostic has `relicGold 1`.
      Actual:

## Edge cases

- [ ] Step 6. Win a non-boss dungeon encounter such as round 4 `Tax Collector`.
      Expected: Reward Summary Continue routes normally to Rival Update; no `Choose a Relic` panel appears and no relic-choice diagnostic logs.
      Actual:

- [ ] Step 7. Continue winning eligible boss-style encounters after selecting a relic.
      Expected: Previously selected relics never appear in later offers; each selected relic is added once to the header and Reward Summary names.
      Actual:

- [ ] Step 8. If all 4 relics are owned, win another eligible boss-style encounter.
      Expected: Reward Summary Continue skips the relic screen and routes exactly as before because no unowned choices remain.
      Actual:

- [ ] Step 9. Temporarily force a defeat-after-reward case by setting a run near the debt or morale limit before an eligible win resolves.
      Expected: Reward Summary Continue goes to Defeat first; no relic reward appears after debt/morale defeat.
      Actual:

- [ ] Step 10. Select `Blade Charter` in a test run, or temporarily add `runState.ActiveRelics.Add(RelicId.BladeCharter);` in `RunManager.InitializeRun` after `FullUpkeepPaidLastRound = false;`, then enter combat with a Damage-role hero.
      Expected: `[M16.1] Player ... role Damage` shows attack exactly +1 above the same hero's normal/preset-scaled attack; non-Damage heroes do not gain this attack bonus.
      Actual:

- [ ] Step 11. Select `Iron Oath`, or temporarily seed it as in Step 10, then enter combat with a Tank-role hero.
      Expected: Tank-role heroes show +1 max HP; non-Tank heroes do not gain this specific HP bonus.
      Actual:

- [ ] Step 12. Select `Camp Rations`, or temporarily seed it as in Step 10, then enter combat with any party.
      Expected: Every player hero shows +1 max HP.
      Actual:

- [ ] Step 13. If any temporary seeded relic line was added in `RunManager.InitializeRun`, remove it and let Unity recompile.
      Expected: Console has no compile errors and future new runs do not start with pre-owned relics.
      Actual:

## Observable invariants

- [ ] Step 14. Inspect all relic reward panels encountered in the run.
      Expected: Each visible choice has a name and effect text; hidden extra slots are not clickable.
      Actual:

- [ ] Step 15. Inspect active relic displays after each selection.
      Expected: Header and Reward Summary use display names (`Blade Charter`, `Iron Oath`, `Camp Rations`, `Guild Dividend`), not enum identifiers.
      Actual:

- [ ] Step 16. Inspect combat and reward after relics are active.
      Expected: Relics never permanently mutate hero definitions; bonuses appear in combat/reward calculations only.
      Actual:

- [ ] Step 17. Watch Console during all scenarios.
      Expected: No runtime exceptions, no `UnityEngine.Random` use, and no unexpected diagnostic spam beyond the temporary `[M16.1]` logs.
      Actual:

## Regression checks

These checks target prior behavior at risk because the diff touches `GameManager.ContinueAfterReward`, `RunManager.ApplyPostCombatResult`/`EvaluateNextState` routing, and `CombatManager` player unit construction.

- [ ] Step 18. Lose any non-eligible combat or hit a debt/morale defeat after Reward Summary.
      Expected: Defeat routing still happens from Reward Summary Continue with no relic screen.
      Actual:

- [ ] Step 19. Win Act 1 round 10.
      Expected: Reward Summary -> Relic Reward if unowned relics remain -> Act 1 Clear screen; Continue to Act 2 still works afterward.
      Actual:

- [ ] Step 20. Win Act 2 round 13.
      Expected: Reward Summary -> Relic Reward if unowned relics remain -> Act 2 Complete screen.
      Actual:

- [ ] Step 21. In Standard Contract with no seeded relics, enter round 1 combat.
      Expected: Player/enemy stats match pre-M16.1 Standard values; relic stat bonuses are absent until a relic is active.
      Actual:

- [ ] Step 22. Remove the four temporary diagnostic logs from the scaffold and let Unity recompile.
      Expected: Console has no compile errors and no new `[M16.1]` diagnostic lines in later play.
      Actual:
