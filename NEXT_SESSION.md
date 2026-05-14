# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M1.3 - Combat sandbox UI wiring

**Milestone:** M1 - Combat Sandbox
**Slice goal:** Wire the M1.2 combat resolver into the existing single scene with a minimal uGUI combat sandbox: a Start Combat button, readable streaming combat log, final result line, and Restart button. **No shop, payroll, formation editing, run economy, rewards, upkeep, rivals, save/load, or extra hero/enemy effects yet.**

This slice builds on M1.2's static sandbox data and pure synchronous resolver. The simulation must remain in `CombatManager`; UI scripts only present the result and raise button-click actions.

### Acceptance criteria

1. `Main.unity` opens with a minimal combat sandbox UI on the existing Canvas: title/status text, Start Combat button, combat log area, and Restart button hidden or disabled until combat completes.
2. Clicking Start Combat uses `DataRepository.CreateSandboxRun()`, `DataRepository.SandboxEncounter`, and `CombatManager.StartCombat(...)` to run the fixed sandbox combat.
3. `CombatLogView` streams the already-resolved `CombatResult.LogLines` to the UI in order with a small readable delay; the combat simulation itself is still synchronous and does not use coroutines.
4. The final UI state clearly shows the win/loss result and enables Restart; clicking Restart clears the old log and re-runs the same fixed combat with identical log text.
5. No out-of-scope systems are introduced: no shop, payroll, formation editing, rewards, upkeep, debt, morale, rivals, imported art, save/load, or extra hero/enemy effects.

### Files Claude Code creates

```
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
DungeonDebt/Assets/Scripts/UI/CombatLogView.cs
TestPlans/TP_M1.3.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scenes/Main.unity
```

Modify `Main.unity` only to wire the existing Canvas/EventSystem into the minimal M1.3 combat sandbox UI. Keep the scene single-scene, uGUI-only, mouse-only, and 1920x1080 reference resolution.

### Files Claude Code does NOT create or modify

- Any run/economy manager, including `GameManager`, `RunManager`, `ShopManager`, `PayrollManager`, `EncounterManager`, or `RivalManager`.
- Any shop, payroll, reward, upkeep, debt, morale, rival update, save/load, or formation-editing behavior.
- Any data model or resolver files from M1.1/M1.2 unless a compile-breaking issue is discovered. If that happens, stop and ask before expanding scope.
- Any prefab files unless Unity requires a generated `.meta` for the new scripts.
- Any imported sprites, audio, animation assets, tweens, particles, or VFX.
- Any `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders.
- Any Unity Test Framework, NUnit, PlayMode, or EditMode test assets.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 1 - Technical Assumptions
- `IMPLEMENTATION_PLAN.md` Section 2 - Project Folder Structure
- `IMPLEMENTATION_PLAN.md` Section 6 - Combat System Plan
- `IMPLEMENTATION_PLAN.md` Section 10 - UI Architecture and screen layout, especially `CombatLogView` and `MainMenuPanel`
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 1
- `IMPLEMENTATION_PLAN.md` Section 12 - Recommended Script List
- `GAME_DESIGN.md` Auto-Combat Phase only as needed for log presentation expectations

### Notes from previous slice

- M1.2 created `GameRules`, `DataRepository`, `CombatManager`, `CombatLogger`, and `HeroEffects`.
- The user reported the M1.2 manual test plan as all passed or skipped; probe-script steps were skipped because the instructions for creating and running the probe were unclear.
- M1.3 should make the combat resolver testable through the actual scene UI, so avoid probe-script test steps unless the exact script body and placement are included.

### Test plan output

Claude Code creates `TestPlans/TP_M1.3.md` covering at minimum:

- **Happy path:** Open Unity, let scripts compile, open `Main.unity`, click Start Combat, watch the log stream, and confirm final result appears.
- **Restart checks:** Click Restart and verify the previous log clears, the same fixed combat runs again, and the log text matches the first run exactly.
- **UI state checks:** Start Combat is not spam-clickable during log playback, Restart is unavailable until combat completes, and the final win/loss state is visible.
- **Rule checks:** uGUI only, mouse-only button `onClick`, no new Input System action assets, no `UnityEngine.Random`, no async simulation, no UI script performing combat logic, no forbidden folders.
- **Regression checks:** M1.1 data model and M1.2 resolver files still compile, `DataRepository.CreateSandboxRun()` still supplies the fixed party, `CombatManager.StartCombat(...)` still resolves without scene dependencies, and Console remains clean.
- **Observable invariants:** Log lines appear in order, one final result line appears per run, Restart produces identical text, no old log lines remain after restart, and no UI text overlaps at 1920x1080.

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action - what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
