# TP_M1.3 - Combat sandbox UI wiring

Manual test plan for slice **M1.3 - Combat sandbox UI wiring**. Run these in the Unity Editor after opening the `DungeonDebt` project.

Fill in `Actual:` for each step. A step passes when `Actual` matches `Expected`.

---

## Happy path

- [ ] Step 1. Open Unity Hub and launch the `DungeonDebt` project. Wait for script compilation to finish.
      Expected: Unity opens the project, scripts compile, and the Console shows zero errors and zero new warnings.
      Actual: pass

- [ ] Step 2. Open `Assets/Scenes/Main.unity`.
      Expected: The scene opens without errors and contains the existing `Canvas` and `EventSystem`.
      Actual: pass

- [ ] Step 3. Press Play.
      Expected: The Game view shows a minimal combat sandbox UI with `Dungeon Debt`, a status line, a Start Combat button, a combat log area, an empty result line, and a disabled Restart button.
      Actual: pass

- [ ] Step 4. Click Start Combat once.
      Expected: Start Combat becomes disabled, the status changes to `Combat running...`, and combat log lines begin appearing within 1 second.
      Actual: pass 

- [ ] Step 5. Wait for log playback to finish.
      Expected: Log lines remain readable and ordered, the status changes to `Combat complete`, a visible final result line appears, and Restart becomes enabled.
      Actual: pass

## Restart checks

- [ ] Step 6. Record or visually compare the first complete combat log, then click Restart.
      Expected: The old log clears immediately, Start Combat remains disabled, Restart becomes disabled during playback, and the same fixed combat begins again.
      Actual: pass

- [ ] Step 7. Wait for the restarted combat to finish.
      Expected: The second complete log has the same number of lines and identical text in the same order as the first run.
      Actual: pass

- [ ] Step 8. Click Restart a second time after completion.
      Expected: Only one new playback starts, no duplicate log lines appear, and exactly one final result line is visible at the end.
      Actual: pass

## UI state checks

- [ ] Step 9. During log playback, try clicking Start Combat repeatedly.
      Expected: Start Combat is disabled and does not start extra overlapping combats.
      Actual: pass


- [ ] Step 10. During log playback, try clicking Restart.
      Expected: Restart is disabled until the current playback completes.
      Actual: pass


- [ ] Step 11. Inspect the Game view at 1920x1080.
      Expected: Title, buttons, status, log text, and result text do not overlap and remain comfortably readable.
      Actual: pass


## Edge cases

- [ ] Step 12. Stop Play mode while the combat log is still streaming.
      Expected: Play mode exits cleanly, with no Console errors from a stopped coroutine or destroyed UI object.
      Actual: pass


- [ ] Step 13. Press Play again after stopping mid-stream.
      Expected: The UI starts fresh with an empty log, Start Combat enabled, Restart disabled, and status `Ready`.
      Actual: pass


- [ ] Step 14. Let a full combat complete, stop Play mode, then press Play again.
      Expected: No stale log or result text carries over from the previous Play session.
      Actual: pass


## Rule checks

- [ ] Step 15. Inspect `Assets/Scripts/UI/MainMenuPanel.cs`.
      Expected: Button input is wired through uGUI `Button.onClick`, and the UI calls `DataRepository.CreateSandboxRun()`, `DataRepository.SandboxEncounter`, and `CombatManager.StartCombat(...)`.
      Actual: pass

- [ ] Step 16. Inspect `Assets/Scripts/UI/CombatLogView.cs`.
      Expected: It only streams already-resolved log lines for display; it does not simulate combat.
      Actual: pass

- [ ] Step 17. Search `Assets/Scripts/` for `UnityEngine.Random`, `Random.Range`, `async`, and `await`.
      Expected: No matches appear in the M1.3 UI scripts or the M1.2 resolver files.
      Actual: pass

- [ ] Step 18. Inspect `Assets/`.
      Expected: No `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders exist.
      Actual: pass

- [ ] Step 19. Inspect `Assets/`.
      Expected: No new `.inputactions` assets, imported sprites, audio, animations, tweens, particles, VFX, shop/payroll/formation/economy/rival files, or Unity Test Framework assets were created by this slice.
      Actual: pass

## Regression checks

- [ ] Step 20. Inspect `Assets/Scripts/Core/DataRepository.cs`.
      Expected: `CreateSandboxRun()` still supplies the fixed sandbox party, and `SandboxEncounter` still supplies the fixed encounter.
      Actual: skipped unsure how to validate

- [ ] Step 21. Inspect `Assets/Scripts/Combat/CombatManager.cs`.
      Expected: `StartCombat(...)` still resolves synchronously into a `CombatResult` and does not depend on scene objects.
      Actual: skipped unsure how to validate

- [ ] Step 22. Run one full sandbox combat through the UI.
      Expected: The Console remains clean, and the UI shows the same final result line every run.
      Actual: pass

- [ ] Step 23. Stop Play mode and run `git status --short` from the repo root.
      Expected: Only the planned M1.3 files, `Main.unity`, `TestPlans/TP_M1.3.md`, and the user-requested `PROGRESS.md` bookkeeping update are changed or untracked.
      Actual: pass

## Observable invariants

- [ ] Step 24. Watch any full log playback from start to finish.
      Expected: Log lines appear in chronological order, and no dead unit attacks after its death line.
      Actual: Appears to pass - hard to tell because this appears to have multiple slimes and cant tell difference


- [ ] Step 25. Watch the final seconds of any full log playback.
      Expected: Exactly one final result line is visible in the result area for that run.
      Actual: pass


- [ ] Step 26. Restart after any completed run.
      Expected: No old log lines remain after restart clears the log.
      Actual: [ass]


- [ ] Step 27. Compare two restarted runs.
      Expected: Restart produces identical log text because the sandbox combat uses no randomness.
      Actual: pass


- [ ] Step 28. Inspect the UI state after combat completes.
      Expected: Start Combat remains unavailable, Restart is available, and the final win/loss state is visible.
      Actual: pass

