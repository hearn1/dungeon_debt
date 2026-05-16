# TP_M18.2 - Relic/upgrade variants for player-side status access

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` in Unity and press Play.
      Expected: Main menu appears with no Console errors.
      Actual:

- [ ] Step 2. Start a Standard Contract run and play to an eligible relic reward after a won rival or boss-style fight.
      Expected: The relic reward screen appears through the existing reward flow, offers up to 3 unowned relics, and may include the new status relics without adding a new screen.
      Actual:

- [ ] Step 3. If `Shield Clause` is offered, select it and continue to the next combat with at least one hero in slot 0 or 1.
      Expected: The leftmost living frontline hero starts combat with blue `G`; the combat log includes `Shield Clause grants Guarded`, and the first incoming hit against that hero consumes Guarded.
      Actual:

- [ ] Step 4. If `Red Ink Brand` is offered, select it and continue to the next combat.
      Expected: The first hero-side attack that applies the relic to a surviving target logs `Red Ink Brand applies Marked`; enemy attacks do not apply Marked from this relic.
      Actual:

- [ ] Step 5. If `Caustic Writ` is offered, select it and continue to the next combat with at least one Damage-role hero.
      Expected: Damage-role hero attacks apply orange `B` to surviving targets; non-Damage heroes do not apply Burned from this relic.
      Actual:

- [ ] Step 6. If `Toxic Collateral` is offered, select it and continue to the next combat with at least one Damage-role hero.
      Expected: Damage-role hero attacks apply green `P` to surviving targets; non-Damage heroes do not apply Poisoned from this relic.
      Actual:

- [ ] Step 7. Upgrade a Knight to Silver by hiring a duplicate Knight, then enter combat.
      Expected: The Silver Knight starts combat with blue `G`; the combat log includes `Knight starts Guarded (Silver upgrade)`, and Guarded is consumed on the first incoming hit against the Knight.
      Actual:

- [ ] Step 8. Upgrade Ninja, Wizard, or Enchanter to Silver by hiring duplicates, then enter combat with those heroes attacking surviving targets.
      Expected: Silver Ninja applies green `P`, Silver Wizard applies orange `B`, and Silver Enchanter applies gray `W` after damage lands; Bronze versions do not apply these upgrade statuses.
      Actual:

## Edge cases

### Temporary diagnostic scaffold - forced M18.2 relic choices

Use this scaffold only for steps 7-10, then revert it before continuing.

- [ ] Step 9. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `TryPreparePendingRelicReward`, immediately after `ClearPendingRelicReward();`, temporarily add:

```csharp
_currentRunState.PendingRelicChoices.Add(RelicId.ShieldClause);
_currentRunState.PendingRelicChoices.Add(RelicId.RedInkBrand);
_currentRunState.PendingRelicChoices.Add(RelicId.CausticWrit);
_currentRunState.PendingRelicNextState = nextState;
_currentRunState.HasPendingRelicReward = true;
return true;
```

      Expected: Unity recompiles with no Console errors.
      Actual:

- [ ] Step 10. Win the next eligible relic fight and inspect the relic reward screen.
      Expected: The three forced M18.2 relic choices appear using the existing relic reward panel and active relic text.
      Actual:

- [ ] Step 11. Select one forced relic, then reach the next relic reward opportunity.
      Expected: The selected relic is stored on `RunState.ActiveRelics`, appears in the header/summary active relic list, and is not offered again.
      Actual:

- [ ] Step 12. Revert the temporary `RunManager.cs` scaffold from step 9 and let Unity recompile.
      Expected: Relic rewards return to normal random unowned choices; no temporary forced choices remain.
      Actual:

### Temporary diagnostic scaffold - all new status relics active

Use this scaffold only for steps 11-17, then revert it before marking this test complete.

- [ ] Step 13. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `InitializeRun(DifficultyPresetId presetId)`, immediately before `_currentRunState = runState;`, temporarily add:

```csharp
runState.ActiveRelics.Add(RelicId.ShieldClause);
runState.ActiveRelics.Add(RelicId.RedInkBrand);
runState.ActiveRelics.Add(RelicId.CausticWrit);
runState.ActiveRelics.Add(RelicId.ToxicCollateral);
```

      Expected: Unity recompiles with no Console errors, and a fresh run starts with the four M18.2 relics visible in the active relic header.
      Actual:

- [ ] Step 14. Start a fresh run with the scaffold active, hire or keep at least one frontline hero, and enter Round 1 combat.
      Expected: Before the first replayed attack, the leftmost living frontline hero card already shows `G`.
      Actual:

- [ ] Step 15. Watch the first player-side attack in the same combat.
      Expected: If the target survives, it gains `M`; the log text names `Red Ink Brand`. No enemy attack uses this relic.
      Actual:

- [ ] Step 16. Watch a Damage-role hero attack a surviving target.
      Expected: The same surviving target can gain `B` and `P` from `Caustic Writ` and `Toxic Collateral`; duplicate statuses do not stack or spam extra indicators.
      Actual:

- [ ] Step 17. Watch a Tank, Support, or Economy hero attack a surviving target.
      Expected: That attack can use `Red Ink Brand` if it is the first eligible hero-side attack, but it does not apply Burned or Poisoned from the Damage-role relics.
      Actual:

- [ ] Step 18. Let an afflicted enemy attack after receiving Burned or Poisoned.
      Expected: Burned/Poisoned timing matches M18.1: the afflicted unit's attack happens first, then Burned/Poisoned damage and poison growth resolve afterward.
      Actual:

- [ ] Step 19. Revert the temporary `RunManager.cs` scaffold from step 13 and let Unity recompile.
      Expected: New runs no longer start with forced relics; no temporary diagnostic code remains.
      Actual:

## Observable invariants

- [ ] Step 20. Watch combat-start and on-attack status relics during replay.
      Expected: Combat-start statuses appear in the initial card state; attack-applied statuses appear only after damage lands and only on surviving targets.
      Actual:

- [ ] Step 21. Watch status indicators on cards with portraits, HP bars, Veteran progress, acting outlines, and hit flashes.
      Expected: Status indicators stay readable and do not obscure existing combat UI elements.
      Actual:

- [ ] Step 22. Watch multiple relic/status applications in one combat.
      Expected: Existing `CombatStatusState` behavior prevents duplicate status entries; no status stacks or durations are introduced.
      Actual:

- [ ] Step 23. Complete at least one status-relic or status-upgrade combat.
      Expected: Combat remains deterministic and synchronous; turn order remains player left-to-right, then enemy left-to-right.
      Actual:

## Regression checks

- [ ] Step 24. Prior relic reward routing at risk: M18.2 adds new relic ids to `DataRepository.AllRelics`. Win an eligible relic fight after owning at least one relic.
      Expected: Relic offers still contain only unowned relics, and selecting one resumes the original next state.
      Actual:

- [ ] Step 25. Prior active relic visibility at risk: RunHeader/RewardSummary now have more possible relic names. Own several relics, including at least one new status relic.
      Expected: Active relic names remain visible and do not hide round, gold, debt, morale, or reward summary text.
      Actual:

- [ ] Step 26. Prior relic effects at risk: `CombatManager` now has relic status hooks near existing relic stat effects. With Blade Charter, Iron Oath, Camp Rations, and Guild Dividend active or naturally selected, verify their old behavior.
      Expected: Damage-role attack bonus, Tank health bonus, all-hero health bonus, and +1 reward gold still work.
      Actual:

- [ ] Step 27. Prior M18.1 enemy statuses at risk: player-side relic/status-upgrade code now shares the attack-status timing path. Reach Round 2, Round 5, and Round 7.
      Expected: Goblin/Tax/Frugal Archer still apply Weakened on attack, Backline Bat/Auditor still apply Burned on attack, and Debt Wraith/Treasure Leech still apply Poisoned on attack.
      Actual:

- [ ] Step 28. Prior Silver Knight behavior at risk: Silver Knight now receives a status in the existing Knight combat-start hook. Use a Silver Knight against a backline-targeting enemy.
      Expected: Silver Knight still has two redirects, and Guarded does not prevent redirect logging or backline protection.
      Actual:

- [ ] Step 29. Prior Silver hero behavior at risk: Wizard/Ninja/Enchanter now apply statuses from the post-damage survivor hook. Use Silver versions of these heroes in combat.
      Expected: Wizard scaling, Ninja lowest-HP targeting/loot, and Silver Enchanter all-Damage buff still work while their attack statuses apply only to surviving targets.
      Actual:

- [ ] Step 30. Prior replay/card refresh at risk: status relics and Silver upgrades add new `StatusChange` events before and after attacks. Watch one full combat replay.
      Expected: HP bars, status letters, death cards, and combat log lines stay in sync throughout the replay.
      Actual:
