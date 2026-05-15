# TP_M10.1 - Combat View Rebuild Kickoff

Manual Unity Editor test plan for M10.1. Test in Play mode from `Assets/Scenes/Main.unity`.

## Happy Path

- [ ] Step 1. Enter Play mode.
      Expected: Main screen shows `Dungeon Debt`, `Start Run`, and no combat unit cards.
      Actual:

- [ ] Step 2. Click `Start Run`, then click through Scout to Shop.
      Expected: Scout and Shop behave as before; the combat unit-card panel is not visible.
      Actual:

- [ ] Step 3. Hire at least one hero, continue through Formation, choose a payroll action, and continue to Combat.
      Expected: During Combat, a new `Combat` panel appears above the smaller combat log with rows for `Enemy Back`, `Enemy Front`, `Hero Front`, and `Hero Back`.
      Actual:

- [ ] Step 4. Inspect player combat cards while the log streams.
      Expected: Each player card shows hero name, `HP current/max` inside the HP bar, a role-colored left band, and a Bronze/Silver tier-colored border.
      Actual:

- [ ] Step 5. Inspect enemy combat cards while the log streams.
      Expected: Each enemy card shows enemy name, `HP current/max` inside the HP bar, and a red enemy accent; enemies do not show a tier border.
      Actual:

- [ ] Step 6. Let the combat log finish streaming.
      Expected: The full combat log still streams in order and ends with the same win/loss text as before; the combat cards update to final HP/dead state.
      Actual:

- [ ] Step 7. Continue from Reward/Rival Update into the next round.
      Expected: The combat unit-card panel hides outside Combat, and Scout/Shop/Formation/Payroll panels remain usable.
      Actual:

## Edge Cases

- [ ] Step 8. Start a fresh run, hire no heroes, continue through Shop, Formation, Payroll, and into Combat.
      Expected: Combat shows an empty Heroes row, an Enemies row, and the log reports the player has no living heroes before resolving as a loss.
      Actual:

### Temporary diagnostic scaffold: empty enemy encounter

Add this only for Step 9, then revert it before Step 10.

In `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs`, in `RunSandboxCombat`, immediately after the encounter assignment ending at line 237, add:

```csharp
        encounter = new EncounterDefinition(
            1,
            EncounterType.Dungeon,
            "Diagnostic Empty Encounter",
            "No enemies.",
            "Empty enemy diagnostic",
            new System.Collections.Generic.List<EnemyDefinition>(),
            GameRules.WinReward,
            EncounterEffectId.None,
            null);
        Debug.Log("M10.1 diagnostic: forced empty enemy encounter.");
```

- [ ] Step 9. With the scaffold active, start a run, hire any hero, and enter Combat.
      Expected: Unity Console logs the diagnostic message; Combat shows player cards and an empty Enemies row; the log reports the enemy side has no living units and resolves as a win.
      Actual:

- [ ] Step 10. Revert the temporary diagnostic scaffold added for Step 9.
      Expected: `MainMenuPanel.cs` is back to its pre-scaffold state before continuing testing.
      Actual:

- [ ] Step 11. Create or hire a Silver hero, then enter Combat.
      Expected: The Silver hero's combat card shows a Silver-colored tier border; Bronze heroes show a Bronze-colored tier border.
      Actual:

- [ ] Step 12. Run a combat where at least one unit dies.
      Expected: After the log finishes, the dead unit's card shows `HP 0/max`, a depleted HP bar, and a red dead-state background; no card text overlaps.
      Actual:

## Observable Invariants

- [ ] Step 13. Observe several combats with different party sizes.
      Expected: Player and enemy cards stay within their rows and do not overlap the combat log, reward summary, or buttons.
      Actual:

- [ ] Step 14. Compare the combat-log attack values with the visible combat result.
      Expected: The log remains the source of truth for attack values, including payroll and Silver stat changes; placeholder unit cards do not show a separate ATK lane.
      Actual:

- [ ] Step 15. Watch the log from first line to final result.
      Expected: The combat log remains complete and scrollable; adding cards does not truncate the log.
      Actual:

- [ ] Step 16. Leave Combat through Reward/Upkeep/Rival Update.
      Expected: Combat cards do not remain visible in non-Combat states.
      Actual:

- [ ] Step 17. Inspect player and enemy tier treatment.
      Expected: Player cards show tier-colored borders; enemy cards do not show tier borders.
      Actual:

## Regression Checks

These checks cover the `CombatResult`/`CombatManager` snapshot seam and the `MainMenuPanel` combat layout seam touched by this slice.

- [ ] Step 18. Run the same first-round party/payroll setup twice.
      Expected: Combat log order, win/loss result, rewards, upkeep, interest, and morale changes match between runs.
      Actual:

- [ ] Step 19. Trigger a known enemy effect, such as Goblin Thief or Debt Wraith, in a later round.
      Expected: The enemy effect still appears in the log and post-combat resource math behaves as before; combat cards are presentation-only.
      Actual:

- [ ] Step 20. Restart the run from the `Restart Sandbox` button after combat completes.
      Expected: Old combat cards and log text clear before the new run flow starts.
      Actual:
