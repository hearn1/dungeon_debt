# TP_M2.2 - Post-combat resource math and reward summary shell

## Happy path

- [ ] Step 1. Open the Unity project and let scripts compile.
      Expected: The Unity Console shows no compile errors and no new warnings from this slice.
      Actual: pass

- [ ] Step 2. Open `Assets/Scenes/Main.unity`.
      Expected: The scene opens with the existing single Canvas and EventSystem.
      Actual: pass

- [ ] Step 3. Press Play.
      Expected: The Dungeon Debt screen appears with the top run header, Start Run button, Restart Sandbox button, combat log area, and a Reward Summary panel.
      Actual: pass

- [ ] Step 4. Click Start Run.
      Expected: The header shows Round 1, Gold 10, Debt 0, and Morale 30 before post-combat math is applied; the reward summary is still in its placeholder state while combat streams.
      Actual: pass

- [ ] Step 5. Wait for the combat log to finish streaming.
      Expected: The result appears, Restart Sandbox becomes clickable, and the Reward Summary panel updates with combat result, gold gained, morale change, upkeep, interest, and final resources.
      Actual: pass

- [ ] Step 6. Compare the final header to the Reward Summary final line.
      Expected: Header Gold, Debt, and Morale exactly match the Reward Summary final Gold, Debt, and Morale values.
      Actual: pass

## Fresh-run checks

- [ ] Step 7. Click Restart Sandbox after the first summary appears.
      Expected: The combat log clears, the reward summary returns to its placeholder text while combat streams, and the header resets to Round 1, Gold 10, Debt 0, and Morale 30 before the new summary is applied.
      Actual: pass

- [ ] Step 8. Wait for the restarted combat to complete.
      Expected: The same deterministic combat result and same post-combat resource summary appear again.
      Actual: pass

- [ ] Step 9. Stop Play mode, press Play again, and click Start Run.
      Expected: The first run of the new Play session starts from Round 1, Gold 10, Debt 0, and Morale 30 with no duplicated header, combat log, or reward summary objects visible.
      Actual: pass

## Math checks

- [ ] Step 10. For the default sandbox win, calculate the visible math.
      Expected: Reward Summary shows Gold gained +8, Upkeep due 11, Upkeep paid 11, Upkeep shortfall 0, Interest charged 0, and Final Gold 7 / Debt 0 / Morale 30.
      Actual: pass

- [ ] Step 11. Temporarily force a sandbox loss by making the sandbox party unable to win, then enter Play mode and click Start Run.
      Expected: Reward Summary uses `GameRules.LossReward` (+4) and applies `GameRules.DungeonLossMorale` (-6 morale), while still calculating upkeep and interest afterward.
      Actual: unsure how to set/test

- [ ] Step 12. Temporarily set the current run debt to 9 before applying post-combat math, then complete a sandbox combat.
      Expected: Interest charged is 3, matching `ceil(9 / 3.0)`, and that interest is paid from gold if gold is available.
      Actual: unsure how to set/test

- [ ] Step 13. Temporarily make sandbox party upkeep exceed available post-reward gold, then complete a sandbox combat.
      Expected: Reward Summary shows partial upkeep paid, the unpaid shortfall added to debt, and interest charged from the resulting debt.
      Actual: unsure how to set/test

## Edge cases

- [ ] Step 14. Click Start Run once and do not click anything else while the combat log streams.
      Expected: Start Run and Restart Sandbox remain disabled until streaming completes, so resources do not update before combat finishes.
      Actual: pass

- [ ] Step 15. Repeatedly click Restart Sandbox, waiting for each combat stream and summary to complete.
      Expected: Each run starts fresh, applies exactly one summary, and never stacks duplicate summary text or UI panels.
      Actual: pass

- [ ] Step 16. Inspect the summary after a run with zero debt.
      Expected: Interest charged, interest paid, and interest to debt are all 0.
      Actual: unsure how to set/test

## Rule checks

- [ ] Step 17. Search `Assets/Scripts` for `UnityEngine.Random` and `Random.Range`.
      Expected: No matches are found.
      Actual: pass

- [ ] Step 18. Search the project for new `Resources`, `StreamingAssets`, `Tests`, or `Editor` folders under `Assets`.
      Expected: None exist.
      Actual: pass

- [ ] Step 19. Inspect the scene input objects.
      Expected: Interaction is still through uGUI Button `onClick`; no new project-authored `.inputactions` files were added.
      Actual: pass

- [ ] Step 20. Inspect `Assets/Scripts/Run/RunManager.cs` and `Assets/Scripts/Core/GameRules.cs`.
      Expected: Reward, morale loss, upkeep, and interest rules come from `GameRules` and `HeroInstance.UpkeepThisRound`; no new numeric tuning values are hardcoded in run logic.
      Actual: pass

- [ ] Step 21. Inspect project files added or changed by this slice.
      Expected: No shop, payroll-choice, formation-editing, scout, rival, end-screen, save/load, combat targeting, combat damage, animation, audio, tween, particle, or VFX behavior was added.
      Actual: pass

## Regression checks

- [ ] Step 22. Re-run the M1.3 start/restart combat flow from this scene.
      Expected: The sandbox combat still resolves through `CombatManager.StartCombat(...)`, streams log lines in order, shows a result, and can restart.
      Actual: pass

- [ ] Step 23. Inspect `Assets/Scripts/Combat/CombatManager.cs`.
      Expected: `StartCombat(...)` remains scene-independent and has no UI references.
      Actual: pass

- [ ] Step 24. Watch the header at the beginning of Start Run and Restart Sandbox.
      Expected: The M2.1 header still initializes at Round 1, Gold 10, Debt 0, and Morale 30 before post-combat values appear.
      Actual: pass

- [ ] Step 25. Watch the Unity Console through one Start Run and one Restart Sandbox flow.
      Expected: No errors or new warnings appear.
      Actual: pass

## Observable invariants

- [ ] Step 26. Observe the header and Reward Summary after combat completes.
      Expected: Header final resources and Reward Summary final resources always match.
      Actual: pass

- [ ] Step 27. Observe the UI before combat completes.
      Expected: Reward/upkeep/interest values do not apply until the combat log finishes streaming.
      Actual: pass

- [ ] Step 28. Observe summary values across repeated restarts.
      Expected: No resource value becomes negative in the header or Reward Summary.
      Actual: pass

- [ ] Step 29. Observe the combat log during and after summary display.
      Expected: Combat log lines remain readable and in deterministic order; the summary panel does not cover the log text.
      Actual: pass

- [ ] Step 30. Observe the reward summary panel after each completed run.
      Expected: It always includes combat result, reward gold, payroll effect, morale change, upkeep paid/shortfall, interest paid/added to debt, and final resources.
      Actual: pass
