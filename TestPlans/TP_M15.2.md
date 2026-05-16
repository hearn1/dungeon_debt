# TP_M15.2 - Combat HP/damage multipliers

Manual Unity Editor test plan for M15.2. Run in `Assets/Scenes/Main.unity`.

## Temporary diagnostic scaffold

`CombatUnit` is plain C#, so built combat stats are easiest to verify through temporary Console output.

Add these temporary logs before running the scenarios:

1. In `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs`, inside `BuildPlayerUnits`, immediately after `playerUnits.Add(unit);`, add:

```csharp
UnityEngine.Debug.Log("[M15.2] Player " + unit.DisplayName + " ATK " + unit.Attack + " HP " + unit.MaxHealth);
```

2. In `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs`, inside `BuildEnemyUnits`, immediately after `enemyUnits.Add(unit);`, add:

```csharp
UnityEngine.Debug.Log("[M15.2] Enemy " + unit.DisplayName + " ATK " + unit.Attack + " HP " + unit.MaxHealth);
```

3. In `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs`, inside the Debt Wraith block in `OnCombatStart`, immediately after `unit.Attack = wraithAttack;`, add:

```csharp
UnityEngine.Debug.Log("[M15.2] Debt Wraith scaled ATK " + unit.Attack + " from base " + wraithBaseAttack);
```

- [ ] Step 1. Add the temporary diagnostic scaffold above and let Unity recompile.
      Expected: Console has no compile errors; no `[M15.2]` lines appear until combat starts.
      Actual:

## Happy path

- [ ] Step 2. Start an `Apprentice Ledger` run, hire at least one hero, continue through Formation and Payroll into round 1 Combat.
      Expected: Player diagnostic lines show hero HP scaled up with ceiling math, e.g. Warrior HP 8 -> 10; hero attack remains unchanged; Slime HP/attack remain 4/1 and 1-damage enemies do not fall to 0.
      Actual:

- [ ] Step 3. Observe the round 1 combat unit panel during the Apprentice combat.
      Expected: Player unit HP bars/text match the diagnostic scaled max HP; enemy attacks in the log remain readable and nonzero for 1-attack enemies.
      Actual:

- [ ] Step 4. Start a `Standard Contract` run, hire the same available hero shape as closely as the shop allows, and enter round 1 Combat.
      Expected: Diagnostic lines show legacy unscaled stats: Warrior 2 ATK / 8 HP, Squire 1 ATK / 4 HP, Slime 1 ATK / 4 HP, etc.; combat log shape matches the pre-M15.2 Standard behavior for equivalent parties.
      Actual:

- [ ] Step 5. Start a `Predatory Interest` run, hire at least one hero, and enter round 1 Combat.
      Expected: Player diagnostic lines show unchanged hero stats; enemy lines show HP and damage scaled up with ceiling math, e.g. Slime HP 4 -> 5 and ATK 1 -> 2.
      Actual:

## Edge cases

- [ ] Step 6. In an Apprentice run, progress to or temporarily inspect a fight with 1-attack enemies.
      Expected: Enemy damage multiplier x0.85 uses ceiling/min-positive scaling, so 1-attack enemies remain ATK 1 rather than ATK 0.
      Actual:

- [ ] Step 7. In a Predatory run, progress to round 7 `Debt Wraith` with any debt amount, or temporarily set debt before that combat.
      Expected: Console includes `[M15.2] Debt Wraith scaled ATK ...`; the Wraith's debt-derived attack is also multiplied by Predatory enemy damage instead of reverting to the unscaled debt formula.
      Actual:

- [ ] Step 8. In Standard Contract, inspect any hero/enemy with x1.0 multipliers.
      Expected: Ceiling scaling at x1.0 returns exactly the original integer stat; no HP or attack is rounded above or below legacy values.
      Actual:

- [ ] Step 9. Complete a combat on Apprentice, continue through Reward/Upkeep/Rival Update into the next Shop, then enter the next combat with at least one surviving party member.
      Expected: The next combat's player diagnostic lines still show scaled Apprentice max HP; no hero reverts to legacy max HP between rounds.
      Actual:

## Observable invariants

- [ ] Step 10. During all tested combats, inspect combat cards and log output.
      Expected: No combat unit displays negative HP, and HP never exceeds the scaled max shown for that unit.
      Actual:

- [ ] Step 11. Compare unit order in the combat panel and attack log across presets.
      Expected: Presets change stats only; player and enemy turn order remains left-to-right by formation slot.
      Actual:

- [ ] Step 12. Inspect Console during preset combat tests.
      Expected: No runtime exceptions, no `UnityEngine.Random`-related behavior, and no unexpected diagnostic spam beyond the temporary `[M15.2]` lines.
      Actual:

- [ ] Step 13. Inspect Standard Contract reward/upkeep/interest after one completed combat.
      Expected: Economy values still follow M15.1 Standard behavior; M15.2 stat scaling does not change starting gold, debt, morale, interest divisor, debt limit, or reward/upkeep math.
      Actual:

## Regression checks

These checks target behavior at risk because the diff touches `CombatManager` unit construction, `HeroEffects` Debt Wraith attack recompute, and post-combat hero health restore.

- [ ] Step 14. In Standard Contract, run round 1 with a simple hired party.
      Expected: Standard combat uses the same HP/damage numbers and deterministic log ordering as before M15.2 for an equivalent party.
      Actual:

- [ ] Step 15. In any preset, choose `Cut Wages` or `Promise Victory Bonus` before combat.
      Expected: Payroll attack changes are applied first to `HeroInstance.Attack`, then the preset hero damage multiplier is applied at combat construction; Standard remains unchanged.
      Actual:

- [ ] Step 16. In a fight with a Priest or Frugal Healer, observe end-of-round healing.
      Expected: Healing is still capped by the scaled `CombatUnit.MaxHealth`; no unit heals past the scaled cap.
      Actual:

- [ ] Step 17. Remove the three temporary diagnostic logs added in the scaffold and let Unity recompile.
      Expected: Console has no compile errors and no new `[M15.2]` diagnostic lines in later play.
      Actual:
