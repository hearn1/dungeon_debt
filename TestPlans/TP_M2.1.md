# TP_M2.1 - Run state bootstrap and header shell

## Happy path

- [ ] Step 1. Open the Unity project and let scripts compile.
      Expected: The Unity Console shows no compile errors and no new warnings from this slice.
      Actual: pass

- [ ] Step 2. Open `Assets/Scenes/Main.unity`.
      Expected: The scene opens with one Canvas and one EventSystem.
      Actual: pass

- [ ] Step 3. Press Play.
      Expected: The Dungeon Debt screen appears with a top run header, Start Run button, Restart Sandbox button, status text, and combat log area.
      Actual: pass

- [ ] Step 4. Click Start Run.
      Expected: The header shows Round 1, Gold 10, Debt 0, and Morale 30; status changes to show the combat sandbox is running.
      Actual: pass

- [ ] Step 5. Wait for the combat log to finish streaming.
      Expected: The combat log fills with the M1.3 sandbox combat, a win/loss result appears, and Restart Sandbox becomes clickable.
      Actual: pass

## Fresh-run checks

- [ ] Step 6. Click Restart Sandbox after the first combat completes.
      Expected: The header resets to Round 1, Gold 10, Debt 0, and Morale 30; the previous log clears before the sandbox combat streams again.
      Actual: pass

- [ ] Step 7. Stop Play mode, press Play again, then click Start Run.
      Expected: The header again starts at Round 1, Gold 10, Debt 0, and Morale 30 with no duplicated header objects visible.
      Actual: pass

## State checks

- [ ] Step 8. Inspect `Assets/Scripts/Core/GameState.cs`.
      Expected: The `GameState` enum exists and includes `MainMenu`, `StartRun`, and the later planned M2/MVP states.
      Actual: pass

- [ ] Step 9. Inspect `Assets/Scripts/Core/GameManager.cs`.
      Expected: `GameManager` owns the current `GameState`, exposes `ChangeState(GameState)`, and `StartRun()` routes through `ChangeState(GameState.StartRun)`.
      Actual: pass

- [ ] Step 10. Inspect `Assets/Scripts/Run/RunManager.cs`.
      Expected: `RunManager.InitializeRun()` creates a fresh `RunState` with `Round = 1`, `Gold = GameRules.StartingGold`, `Debt = GameRules.StartingDebt`, and `Morale = GameRules.StartingMorale`.
      Actual: pass

## Edge cases

- [ ] Step 11. Click Start Run once and do not click anything else while the combat log streams.
      Expected: Start Run and Restart Sandbox are disabled during streaming, preventing overlapping sandbox runs.
      Actual: pass

- [ ] Step 12. After combat completes, click Restart Sandbox several times, waiting for each stream to complete.
      Expected: Each fresh run still shows Round 1, Gold 10, Debt 0, and Morale 30; only one header is visible.
      Actual: pass

## Rule checks

- [ ] Step 13. Search `Assets/Scripts` for `UnityEngine.Random`.
      Expected: No matches are found.
      Actual: pass

- [ ] Step 14. Search the project for new `Resources`, `StreamingAssets`, `Tests`, or `Editor` folders under `Assets`.
      Expected: None exist.
      Actual: pass

- [ ] Step 15. Inspect the scene input objects.
      Expected: Interaction is still through uGUI Button `onClick`; no new project-authored `.inputactions` files were added.
      Actual: pass

- [ ] Step 16. Inspect the M2.1 code paths.
      Expected: No reward, upkeep, interest, loss screen, shop, payroll, formation editing, rival, save/load, or persistence behavior was added.
      Actual: pass

## Regression checks

- [ ] Step 17. Re-run the M1.3 start/restart combat flow from this scene.
      Expected: The sandbox combat still resolves through `CombatManager.StartCombat(...)`, streams log lines, shows a result, and can restart.
      Actual: pass

- [ ] Step 18. Inspect `Assets/Scripts/Combat/CombatManager.cs`.
      Expected: `StartCombat(...)` remains scene-independent and has no UI references.
      Actual: unsure how to validate

- [ ] Step 19. Watch the Unity Console through one Start Run and one Restart Sandbox flow.
      Expected: No errors or new warnings appear.
      Actual: pass

## Observable invariants

- [ ] Step 20. Observe the header before clicking Start Run.
      Expected: Placeholder header values are shown; no negative resource values appear.
      Actual: pass

- [ ] Step 21. Observe the header after every Start Run or Restart Sandbox click.
      Expected: Starting values always match `GameRules`: Gold 10, Debt 0, Morale 30.
      Actual: pass

- [ ] Step 22. Observe the UI during repeated restarts.
      Expected: Header text stays in one top bar and does not overlap the title, buttons, or combat log.
      Actual: pass

- [ ] Step 23. Observe the combat log order.
      Expected: Log lines stream in the same deterministic order as M1.3 for the sandbox encounter.
      Actual: pass
