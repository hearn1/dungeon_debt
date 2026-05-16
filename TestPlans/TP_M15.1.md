# TP_M15.1 - Difficulty presets: data model + MainMenu selection + run-scoped economy

Manual Unity Editor test plan for slice **M15.1**. Run at 1920x1080 / 16:9 in Play mode.

This plan verifies that three run-contract presets (Apprentice Ledger / Standard Contract / Predatory Interest) are selectable on the pre-run screen, that the selected preset sets starting gold/debt/morale and run-scoped interest divisor / debt limit, that the preset name shows in the run header, and that **Standard Contract reproduces today's exact economy** (legacy behavior unchanged). The four combat HP/damage multipliers are intentionally **carried on `RunState` but not applied** this slice (M15.2 applies them) - this is verified as "stored, not affecting combat", not as a gap.

Locked preset values under test:

| Preset | Start Gold | Start Debt | Start Morale | Interest Divisor | Debt Limit |
|---|---:|---:|---:|---:|---:|
| Apprentice Ledger | 20 | 0 | 36 | 4 | 24 |
| Standard Contract | 15 | 0 | 30 | 3 | 20 |
| Predatory Interest | 12 | 0 | 30 | 2 | 18 |

---

## Temporary diagnostic scaffold (required for economy/multiplier observation)

`RunState.InterestDivisor`, `RunState.DebtLimit`, and the four multiplier fields are plain C# (not Inspector-visible). Add this scaffold before the scenarios that need it and revert it at the end.

- [ ] Step S1. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, at the end of `InitializeRun(DifficultyPresetId presetId)` (immediately before `return _currentRunState;`), add:
      ```
      UnityEngine.Debug.Log($"[M15.1] preset={runState.DifficultyDisplayName} G={runState.Gold} D={runState.Debt} M={runState.Morale} IntDiv={runState.InterestDivisor} DebtLim={runState.DebtLimit} HHP={runState.HeroHealthMultiplier} HDM={runState.HeroDamageMultiplier} EHP={runState.EnemyHealthMultiplier} EDM={runState.EnemyDamageMultiplier}");
      ```
      Expected: File compiles; Console will print one `[M15.1]` line each time a run initializes.
      Actual:

- [ ] Step S2 (revert - do not skip). After all scenarios below are complete, delete the Step S1 `Debug.Log` line and confirm the project compiles with no `[M15.1]` logs remaining.
      Expected: Scaffold removed; `git diff` shows no diagnostic line; slice is clean.
      Actual:

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, set Game view to 1920x1080 / 16:9, press Play.
      Expected: Clean pre-run menu: title, "Ready", Start Run / Restart Sandbox row, then a centered "Run Contract" caption with three buttons (Apprentice Ledger / Standard Contract / Predatory Interest). "Standard Contract" is highlighted, the other two dimmed. The combat log panel and Reward Summary panel are NOT visible on this screen and do not overlap the selector. Console has no new errors.
      Actual:

- [ ] Step 2. Without changing the selection, click Start Run and read the run header.
      Expected: Header round cell reads `Act 1 - Round 1/10 - Standard Contract`. `[M15.1]` log: `preset=Standard Contract G=15 D=0 M=30 IntDiv=3 DebtLim=20 HHP=1 HDM=1 EHP=1 EDM=1`.
      Actual:

- [ ] Step 3. Let the run end (win or lose). On the end screen the action button reads **Main Menu** (Defeat / Act 2 Complete) - not "New Run". The end screen is clean (no combat log / Reward Summary panels behind it) and the Run Contract selector is NOT on the end screen. Click **Main Menu**.
      Expected: Returns to the clean main menu (title, "Ready", Start Run / Restart, Run Contract selector). Standard is still highlighted (selection persisted). Header is reset (`Act 1 - Round -/10`, Gold/Debt/Morale `-`). No new run started yet.
      Actual:

- [ ] Step 4. On the main menu click the `Apprentice Ledger` button, then click Start Run.
      Expected: Apprentice highlights on click; after Start Run the header reads `Act 1 - Round 1/10 - Apprentice Ledger`. `[M15.1]` log: `preset=Apprentice Ledger G=20 D=0 M=36 IntDiv=4 DebtLim=24 HHP=1.25 HDM=1 EHP=1 EDM=0.85`.
      Actual:

- [ ] Step 5. End that run, click **Main Menu**, click `Predatory Interest`, then Start Run.
      Expected: Header reads `Act 1 - Round 1/10 - Predatory Interest`. `[M15.1]` log: `preset=Predatory Interest G=12 D=0 M=30 IntDiv=2 DebtLim=18 HHP=1 HDM=1 EHP=1.2 EDM=1.2`. This confirms the selection is set on the main menu each run and persists between visits.
      Actual:

## Edge cases

### Standard Contract == legacy economy (regression-critical)

- [ ] Step 6. Start a Standard Contract run. Take the **Take Loan** payroll action on round 1 so debt becomes 6, then lose the round's upkeep to keep debt > 0. Reach the next Reward/Upkeep summary.
      Expected: Interest charged = `ceil(Debt / 3)` exactly as in the pre-M15.1 build (e.g. Debt 6 -> 2; Debt 7 -> 3). No change from legacy numbers.
      Actual:

- [ ] Step 7. Continue a Standard run and deliberately accrue debt toward 20 (repeated unpaid upkeep / loans).
      Expected: The run ends in Defeat with reason "Debt limit reached." the first time debt reaches **20** - identical to the pre-M15.1 threshold.
      Actual:

### Apprentice / Predatory debt-limit boundary

- [ ] Step 8. Start an **Apprentice Ledger** run. Accrue debt and watch the `[M15.1]` `DebtLim=24` value; push debt to 23 then 24.
      Expected: Run does **not** defeat at debt 20; Defeat with "Debt limit reached." occurs only when debt first reaches **24**.
      Actual:

- [ ] Step 9. Start a **Predatory Interest** run. Accrue debt toward the limit.
      Expected: Defeat with "Debt limit reached." occurs when debt first reaches **18** (earlier than Standard's 20). Interest charged uses divisor 2 (e.g. Debt 6 -> 3, Debt 7 -> 4) - noticeably harsher than Standard.
      Actual:

### Combat multipliers carried but NOT applied (by design this slice)

- [ ] Step 10. Start an **Apprentice Ledger** run (HHP=1.25, EDM=0.85 in the log) and play one combat against the round-1 encounter. Note hero max HP and enemy damage in the combat log. End the run, click **Main Menu**, select **Standard Contract**, Start Run, and fight the same round-1 encounter.
      Expected: Hero max HP and enemy damage numbers are **identical** between Apprentice and Standard (multipliers are stored on `RunState` but not read by `CombatManager` in M15.1). Any difficulty difference is economy-only this slice. This confirms the intended M15.1 deferral, not a bug.
      Actual:

## Observable invariants

- [ ] Inv 1. The main menu always shows exactly three Run Contract buttons with exactly one highlighted; the end screen never shows the selector.
      Actual:

- [ ] Inv 2. The Run Contract selector is visible only on the main menu (never during Scout / Shop / Formation / Payroll / Combat / Rival Update / Victory / Defeat); the combat log + Reward Summary panels are never visible on the main menu or end screen.
      Actual:

- [ ] Inv 3. The header round cell always ends with ` - <preset name>` for the selected preset during an active run; never blank or "- ".
      Actual:

- [ ] Inv 4. Starting gold/debt/morale and the `[M15.1]` IntDiv/DebtLim values always match the locked table for the chosen preset; Standard always equals 15 / 0 / 30 / 3 / 20.
      Actual:

- [ ] Inv 5. All four multiplier values logged are within their locked set ({1, 1.25} HHP, {1} HDM, {1, 1.2} EHP, {0.85, 1, 1.2} EDM); never 0 or negative.
      Actual:

## Regression checks

The diff changes `RunManager` interest math (`InterestDebtDivisor` -> `RunState.InterestDivisor`), the debt-defeat check (`GameRules.DebtLimit` -> `RunState.DebtLimit`), and the `GameManager.StartRun` -> `RunManager.InitializeRun` start path. Prior interest and debt-defeat behavior is the specific behavior at risk.

- [ ] Reg 1. Steps 6 and 7 above (Standard interest values and debt-defeat at 20) pass unchanged versus the pre-M15.1 build. If either differs, the run-scoped redirection regressed legacy balance.
      Actual:

- [ ] Reg 2. Full Standard run start path: Start Run -> Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> Rival Update advances exactly as before; no extra screen, no double-init, no Console error on `InitializeRun(DifficultyPresetId)`.
      Actual:

- [ ] Reg 3 (menu refactor). During Combat the unit panel and streaming combat log appear and the log scrolls; during Reward / Upkeep the Reward Summary panel shows reward/upkeep/interest as before. (Confirms hiding the log + reward panels on menu/end did not break their in-combat/in-reward visibility.)
      Actual:

- [ ] Reg 4 (end-of-run flow). End screen button reads **Main Menu** on Defeat and Act 2 Complete, and **Continue to Act 2** on Act 1 clear (unchanged). Main Menu returns to the menu without starting a run; Continue to Act 2 still advances the same run into Act 2 (party/gold/debt carried). Restart Sandbox (top chrome) still immediately restarts with the last selected preset.
      Actual:
