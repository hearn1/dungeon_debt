# TP_M2.3 — Round advance, run loss checks, and end-screen shell

Manual test plan for slice **M2.3**. Run all steps in the Unity Editor (Play mode) from `Assets/Scenes/Main.unity`. Each step is a checkbox; fill in **Actual** as you go.

Several scenarios require temporary code changes. Each temporary edit lists the exact file, line, and value to change, then asks you to revert before continuing.

---

## Happy path — round advance with default settings

- [ ] Step 1. Open `Assets/Scenes/Main.unity`, press Play.
      Expected: Header reads `Round -`, `Gold -`, `Debt -`, `Morale -`. Status reads `Ready`. No Reward Summary text, no end screen visible. Start Run is enabled; Restart Sandbox is disabled.
      Actual: pass

- [ ] Step 2. Click **Start Run**.
      Expected: Header refreshes to `Round 1`, `Gold 10`, `Debt 0`, `Morale 30`. Status reads `Combat running...`. Combat log streams lines.
      Actual: pass

- [ ] Step 3. Wait for the combat log to finish streaming.
      Expected: Status reads `Combat complete. Press Continue.` Reward Summary fills in with combat result, gold gained, upkeep, interest, morale change, and final values. A **Continue** button appears inside the Reward Summary panel. Header values match the `Final:` line in the summary. Restart Sandbox is enabled.
      Actual: pass

- [ ] Step 4. Click the **Continue** button on the Reward Summary.
      Expected: Reward Summary clears. Combat log clears. Header now shows `Round 2` with the gold/debt/morale carried over from step 3. Combat begins streaming again. No end screen.
      Actual: pass

- [ ] Step 5. Wait for round 2 combat to finish, then click **Continue** once more (advancing to round 3).
      Expected: Header shows `Round 3`. Each Continue advances the round by exactly 1. Resources reflect another round of post-combat math (no resets).
      Actual: pass

- [ ] Step 6. Click **Restart Sandbox**.
      Expected: A fresh run begins: header back to `Round 1`, `Gold 10`, `Debt 0`, `Morale 30`. Combat streams. Reward Summary repopulates.
      Actual: pass

---

## End-screen — Victory

This scenario uses a temporary edit to make round 1 the final round.

- [ ] Step 7. Open `DungeonDebt/Assets/Scripts/Core/GameRules.cs`. Change `public const int FinalRound = 10;` to `public const int FinalRound = 1;`. Save. Wait for Unity to recompile. Press Play.
      Expected: Project compiles cleanly. Play mode starts.
      Actual: pass

- [ ] Step 8. Click **Start Run**, wait for combat to finish (a player win in the sandbox), then click **Continue**.
      Expected: The end screen appears centered. Title reads `Victory` (green). Reason reads `Final round cleared.` Stats show `Final round: 1`, plus `Gold`, `Debt`, `Morale` matching the values shown in the Reward Summary just before Continue was clicked. A **New Run** button is visible. The Reward Summary panel is no longer showing its body content.
      Actual: pass

- [ ] Step 9. Click **New Run** on the end screen.
      Expected: The end screen hides. A new sandbox run starts: `Round 1`, fresh resources, combat streams.
      Actual: pass

- [ ] Step 10. Stop Play. Revert `GameRules.cs` `FinalRound` back to `10`. Save. Wait for recompile.
      Expected: File matches its pre-step-7 state.
      Actual: pass

---

## End-screen — Defeat by morale exhaustion

- [ ] Step 11. Open `GameRules.cs`. Change `public const int StartingMorale = 30;` to `public const int StartingMorale = 0;`. Save. Wait for recompile. Press Play.
      Expected: Compile clean. Play mode starts.
      Actual: pass

- [ ] Step 12. Click **Start Run**.
      Expected: Header shows `Morale 0`. Combat streams.
      Actual: pass

- [ ] Step 13. After combat completes, click **Continue**.
      Expected: End screen shows `Defeat` (red). Reason reads `Morale exhausted.` Stats show `Final round: 1` and the final gold/debt/morale (morale should still be 0 since the player won the sandbox, so no morale change was applied).
      Actual: pass

- [ ] Step 14. Stop Play. Revert `StartingMorale` back to `30`. Save. Wait for recompile.
      Expected: File restored.
      Actual: pass

---

## End-screen — Defeat by debt limit

- [ ] Step 15. Open `GameRules.cs`. Change `public const int StartingDebt = 0;` to `public const int StartingDebt = 25;`. Save. Wait for recompile. Press Play.
      Expected: Compile clean. Play mode starts.
      Actual: pass

- [ ] Step 16. Click **Start Run**.
      Expected: Header shows `Debt 25`. Combat streams.
      Actual: pass

- [ ] Step 17. After combat completes, click **Continue**.
      Expected: End screen shows `Defeat`. Reason reads `Debt limit reached.` Stats show `Debt` at the post-interest value (>= 25). `Final round: 1`.
      Actual: pass

- [ ] Step 18. Click **New Run** on the end screen.
      Expected: A new run starts; the end screen hides. Note that with the temporary edit still in place, Debt will again be 25.
      Actual: pass

- [ ] Step 19. Stop Play. Revert `StartingDebt` back to `0`. Save. Wait for recompile.
      Expected: File restored.
      Actual: pass

---

## Rule checks

- [ ] Step 20. Open `MainMenuPanel.cs`, `RewardSummaryView.cs`, `EndScreenView.cs`, `RunManager.cs`, `GameManager.cs`. Search each file for `UnityEngine.Random`.
      Expected: Zero matches in any of these files.
      Actual: psdd

- [ ] Step 21. Search the whole `DungeonDebt/Assets/Scripts/` folder for `.inputactions` files and for `using UnityEngine.InputSystem;`.
      Expected: No `.inputactions` files are authored. The only `InputSystem` usage (if any) is on the auto-created `EventSystem` GameObject in the scene, not in project scripts.
      Actual: pass

- [ ] Step 22. Confirm the project still contains only the single scene `Assets/Scenes/Main.unity`.
      Expected: One scene file. No new scenes were added.
      Actual: pass

- [ ] Step 23. Confirm no `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folder exists under `DungeonDebt/Assets/`.
      Expected: None of those folders exist.
      Actual: pass

- [ ] Step 24. Confirm the Continue and New Run buttons are uGUI `Button` components driven by `onClick`, not by any new Input System action asset.
      Expected: Reading `RewardSummaryView.CreateButton` and `EndScreenView.CreateButton` shows standard `UnityEngine.UI.Button` + `onClick.AddListener` wiring.
      Actual: pass

- [ ] Step 25. Confirm that `MainMenuPanel` does not mutate `_currentRunState` directly (no assignments to its `Round`, `Gold`, `Debt`, `Morale`, or `LatestEndReason` from UI code).
      Expected: All run-state advancement goes through `GameManager.ContinueAfterReward` and `RunManager.AdvanceRound` / `RunManager.EvaluateNextState`.
      Actual: pass

---

## Regression checks

- [ ] Step 26. (M1.3) Start a fresh run and confirm the combat log still streams lines progressively (not all at once).
      Expected: Log lines appear with a perceptible delay; final result line appears last.
      Actual: pass

- [ ] Step 27. (M2.1) After clicking Start Run on a fresh play session, header shows `Round 1`, `Gold 10`, `Debt 0`, `Morale 30` before any combat starts streaming.
      Expected: Header initializes from `RunManager.InitializeRun()` defaults.
      Actual: pass

- [ ] Step 28. (M2.2) After combat finishes, the Reward Summary appears only after streaming completes (not mid-stream). The final values in the Reward Summary match the header values exactly.
      Expected: No mismatch between header and `Final:` line.
      Actual: pass

- [ ] Step 29. (M2.2) `CombatManager.StartCombat` is unchanged — combat is still resolved synchronously into a `CombatResult` before any log streaming begins.
      Expected: Inspecting `MainMenuPanel.RunSandboxCombat` shows `CombatResult result = new CombatManager().StartCombat(...)` is called before `_combatLogView.StreamLines(...)`.
      Actual: pass

---

## Observable invariants

- [ ] Step 30. Continue applies exactly once per click — the round number advances by at most 1 when continuing without an end condition.
      Expected: No round number jumps by 2+ on a single Continue press.
      Actual: pass

- [ ] Step 31. End screens do not mutate resources after display — gold, debt, and morale shown on the end screen match the values on the Reward Summary just before Continue was pressed.
      Expected: Side-by-side comparison shows identical numbers.
      Actual: pass

- [ ] Step 32. Restarting (via Restart Sandbox or New Run) always produces a fresh run with `Round 1` and the starting resources from `GameRules` (when no temporary edits are in place).
      Expected: Numbers match `GameRules.StartingGold/StartingDebt/StartingMorale`.
      Actual: pass

- [ ] Step 33. No duplicate runtime UI objects appear after multiple Restart/New Run/Continue cycles. Inspect the Canvas Hierarchy in the Editor after 5–6 cycles.
      Expected: Single `EndScreenPanel`, single `RewardSummaryPanel`, single `CombatLogPanel` under the Canvas.
      Actual: pass

- [ ] Step 34. When the end screen is visible, the Reward Summary's Continue button is not visible (the summary has been cleared).
      Expected: Continue button hidden in Victory/Defeat state.
      Actual: pass
