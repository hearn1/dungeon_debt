# TP_M1.2 - Combat repository and resolver scaffold

Manual test plan for slice **M1.2 - Combat repository and resolver scaffold**. Run these after Claude Code has created the repository and resolver files.

For scratch-code steps, use a temporary probe script under `DungeonDebt/Assets/Scripts/Combat/`, run it in the Unity Editor, then delete the probe script and its `.meta` file before the final git status check. Do not keep the probe in the project.

Fill in `Actual:` for each step. A step passes when `Actual` matches `Expected`.

---

## Happy path

- [ ] Step 1. Open Unity Hub and launch the `DungeonDebt` project. Wait for script compilation to finish.
      Expected: Unity opens the project, scripts compile, and the Console shows zero errors and zero new warnings.
      Actual: pass

- [ ] Step 2. In the Unity Project window, expand `Assets/Scripts/Core/` and `Assets/Scripts/Combat/`.
      Expected: `GameRules.cs`, `DataRepository.cs`, `CombatManager.cs`, `CombatLogger.cs`, and `HeroEffects.cs` are present.
      Actual: pass

- [ ] Step 3. Inspect `DataRepository.cs`.
      Expected: It exposes only the sandbox data for this slice: 4-5 heroes, 2-3 enemies, and one sandbox encounter.
      Actual: pass

## Combat checks

- [ ] Step 4. Use a temporary probe script to call `new CombatManager().StartCombat(DataRepository.CreateSandboxRun(), DataRepository.SandboxEncounter)` once and print each `CombatResult.LogLines` entry to the Console.
      Expected: The Console prints ordered combat lines with at least one attack line, at least one death line, and a final `Player wins!` or `Player loses.` line.
      Actual: skipped - unclear how to create and run probe script

- [ ] Step 5. In the same probe, inspect the returned `CombatResult`.
      Expected: `PlayerWon` is true for the sandbox encounter, `CombatRoundsElapsed` is greater than 0 and no more than `GameRules.CombatTurnLimit`, and `DeadHeroes` contains no null entries.
      Actual: unclear how to create and run probe script

## Determinism checks

- [ ] Step 6. In the temporary probe, run the sandbox combat twice by creating two fresh runs with `DataRepository.CreateSandboxRun()`, then compare every log line by index.
      Expected: Both results have the same number of log lines, and every line matches exactly.
      Actual: unclear how to create and run probe script

- [ ] Step 7. Repeat Step 6 after reopening the scene or pressing Play again.
      Expected: The same hardcoded combat still produces identical ordered logs.
      Actual: unclear how to create and run probe script

## Edge cases

- [ ] Step 8. In the temporary probe, pass a `RunState` with an empty `Party` and `DataRepository.SandboxEncounter` to `StartCombat`.
      Expected: The result immediately loses, `CombatRoundsElapsed` is 0, and the final log line is `Player loses.`
      Actual: unclear how to create and run probe script

- [ ] Step 9. In the temporary probe, create an `EncounterDefinition` with an empty enemy list and pass it with `DataRepository.CreateSandboxRun()` to `StartCombat`.
      Expected: The result immediately wins, `CombatRoundsElapsed` is 0, and the final log line is `Player wins!`
      Actual: unclear how to create and run probe script

- [ ] Step 10. In the temporary probe, create one low-attack hero and one high-health zero-attack enemy so both sides survive through the turn limit.
      Expected: The result loses after `GameRules.CombatTurnLimit` rounds and includes `Combat lost (turn limit).`
      Actual: unclear how to create and run probe script

## Rule checks

- [ ] Step 11. Search `DungeonDebt/Assets/Scripts/Core/` and `DungeonDebt/Assets/Scripts/Combat/` for `UnityEngine.Random`, `Random.Range`, `StartCoroutine`, `IEnumerator`, `async`, and `await`.
      Expected: No matches appear in the new M1.2 source files.
      Actual: pass

- [ ] Step 12. Search `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` for `.Where`, `.Select`, `.OrderBy`, `.First`, and `.Any`.
      Expected: No matches appear, confirming the combat hot path avoids LINQ.
      Actual: pass

- [ ] Step 13. Inspect `GameRules.cs`.
      Expected: M1 numeric constants used by this slice live in `GameRules`, including `CombatTurnLimit`.
      Actual: pass

- [ ] Step 14. Inspect `HeroEffects.cs`.
      Expected: It is a static no-op hook surface only; it does not implement non-stub hero effects.
      Actual: pass

- [ ] Step 15. Inspect `DungeonDebt/Assets/`.
      Expected: No folder named `Resources`, `StreamingAssets`, `Tests`, or `Editor` exists anywhere under `Assets/`.
      Actual: pass

## Regression checks

- [ ] Step 16. Open `Assets/Scenes/Main.unity`.
      Expected: The scene opens without errors, and the Console remains clean.
      Actual: pass

- [ ] Step 17. With `Main.unity` open, inspect the Hierarchy.
      Expected: The M1.0 scene structure is unchanged: root objects are still `Canvas` and `EventSystem`.
      Actual: pass

- [ ] Step 18. Inspect `DungeonDebt/Assets/Scripts/Data/`.
      Expected: The M1.1 data model files are still present and compile without new errors or warnings.
      Actual: pass

- [ ] Step 19. Delete the temporary probe script and its `.meta` file, then let Unity recompile.
      Expected: The Console remains clean after the scratch probe is removed.
      Actual: unclear how to create and run probe script

## Observable invariants

- [ ] Step 20. Inspect a sandbox combat log from Step 4.
      Expected: Attack and death lines appear in chronological order, and no dead unit attacks after its death line.
      Actual: unclear how to create and run probe script

- [ ] Step 21. Inspect targeting in a sandbox combat log.
      Expected: Units attack the leftmost living frontline enemy before targeting backline slots.
      Actual: unclear how to create and run probe script

- [ ] Step 22. Inspect `CombatResult.SurvivorFlags` from the sandbox result.
      Expected: Each enemy id represented in the encounter has a survived flag and no lookup throws a null-reference error.
      Actual: unclear how to create and run probe script

- [ ] Step 23. Run `git status --short` from the repo root after deleting any temporary probe files.
      Expected: Only the planned M1.2 source files and `TestPlans/TP_M1.2.md` are newly added or modified.
      Actual: pass
