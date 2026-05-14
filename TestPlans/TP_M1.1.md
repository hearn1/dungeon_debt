# TP_M1.1 - Combat data model

Manual test plan for slice **M1.1 - Combat data model**. Run these in order after Claude Code has created the data model files.

Fill in `Actual:` for each step. A step passes when `Actual` matches `Expected`.

---

## Happy path

- [ ] Step 1. Open Unity Hub and launch the `DungeonDebt` project. Wait for script compilation to finish.
      Expected: Unity opens the project, scripts compile, and the Console shows zero errors and zero new warnings.
      Actual:No errors or warnings - pass

- [ ] Step 2. In the Unity Project window, expand `Assets/Scripts/Data/`.
      Expected: `HeroDefinition.cs`, `HeroInstance.cs`, `EnemyDefinition.cs`, `EncounterDefinition.cs`, `RivalGuildState.cs`, `RunState.cs`, `CombatUnit.cs`, `CombatResult.cs`, `PayrollActionDefinition.cs`, `ShopOffer.cs`, and `GameEnums.cs` are present.
      Actual: All present - pass

- [ ] Step 3. Open each new data model file in the editor.
      Expected: Every file contains exactly one project-authored type except `GameEnums.cs`, which contains the six planned enums from `IMPLEMENTATION_PLAN.md` Section 4.
      Actual: All correct - pass

## Edge cases

- [ ] Step 4. In a temporary scratch context, instantiate one `HeroDefinition`, one `HeroInstance`, one `EnemyDefinition`, and one `CombatUnit` linked to the hero.
      Expected: The objects compile and construct successfully; `HeroInstance` starts with health, attack, and upkeep copied from its definition.
      Actual: Skipped - temporary scratch context instruction unclear.

- [ ] Step 5. In a temporary scratch context, instantiate an enemy-side `CombatUnit` with `SourceHero` set to null and a hero-side `CombatUnit` with `SourceEnemy` set to null.
      Expected: Both null links are accepted intentionally, matching the data model plan.
      Actual: Pass

- [ ] Step 6. In a temporary scratch context, instantiate `RunState` and `CombatResult` without passing constructor arguments.
      Expected: `Party`, `Rivals`, `Encounters`, `LogLines`, `SurvivorFlags`, and `DeadHeroes` are initialized and can accept entries without null-reference errors.
      Actual: Skipped - temporary scratch context instruction unclear.

- [ ] Step 7. In a temporary scratch context, set `RunState.SelectedPayrollAction` to null, then to `PayrollActionId.StandardPay`.
      Expected: Both assignments compile, confirming this round's payroll action is intentionally nullable.
      Actual: Skipped - temporary scratch context instruction unclear.

- [ ] Step 8. Instantiate one `EncounterDefinition` with `rivalGuildId` set to null, and one with a non-null rival guild id.
      Expected: Both construct successfully, confirming dungeon encounters and rival ghost encounters are both representable.
      Actual: Skipped - temporary scratch context instruction unclear.

## Rule checks

- [ ] Step 9. Search `DungeonDebt/Assets/Scripts/Data/` for `MonoBehaviour`, `ScriptableObject`, `UnityEngine.Random`, `UnityEngine`, `Resources`, `async`, and `await`.
      Expected: No matches appear in the new data model source files.
      Actual: PAss

- [ ] Step 10. Inspect `DungeonDebt/Assets/`.
      Expected: No folder named `Resources`, `StreamingAssets`, `Tests`, or `Editor` exists anywhere under `Assets/`.
      Actual: Pass

- [ ] Step 11. Inspect `DungeonDebt/Assets/Scripts/Core/`, `Run/`, `Combat/`, and `UI/`.
      Expected: No manager, UI, combat simulation, static repository data, or behavior scripts were added by this slice.
      Actual: Pass

- [ ] Step 12. Inspect the definition classes.
      Expected: `HeroDefinition`, `EnemyDefinition`, `EncounterDefinition`, and `PayrollActionDefinition` expose get-only properties initialized through constructors.
      Actual: Pass

## Regression checks

- [ ] Step 13. Open `Assets/Scenes/Main.unity`.
      Expected: The scene opens without errors, and the Console remains clean.
      Actual: Pass

- [ ] Step 14. With `Main.unity` open, inspect the Hierarchy.
      Expected: The M0.1 scene structure is unchanged: root objects are still `Canvas` and `EventSystem`.
      Actual: Pass

- [ ] Step 15. Select the `Canvas` and inspect the Canvas Scaler.
      Expected: UI Scale Mode is still `Scale With Screen Size`, Reference Resolution is still 1920x1080, and Match is still 0.5.
      Actual: Pass

- [ ] Step 16. Run a project file search for project-authored `.cs` files outside `DungeonDebt/Assets/Scripts/Data/`.
      Expected: No project-authored C# files exist outside the planned `Data/` folder.
      Actual: Pass

## Observable invariants

- [ ] Step 17. Try to assign a new value to `HeroDefinition.BaseAttack` or `EnemyDefinition.Health` from a temporary scratch context.
      Expected: The assignment does not compile because definition properties are immutable after construction.
      Actual: Skipped - temporary scratch context instruction unclear.

- [ ] Step 18. Create a `CombatUnit` with `CurrentHealth` greater than 0, then set `CurrentHealth` to 0.
      Expected: `IsAlive` is true before setting health to 0, then false afterward.
      Actual: Skipped - temporary scratch context instruction unclear.

- [ ] Step 19. Create an `EncounterDefinition` from a source enemy list, then mutate the original source list.
      Expected: The encounter's `Enemies` collection does not change, because the definition copied the list during construction.
      Actual:Skipped - temporary scratch context instruction unclear.

- [ ] Step 20. Run `git status --short` from the repo root.
      Expected: This slice added only the planned data model files and `TestPlans/TP_M1.1.md`; pre-existing unrelated changes, if any, are still separate.
      Actual: Pass
