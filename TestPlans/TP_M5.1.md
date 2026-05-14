# TP_M5.1 — Payroll action data + payroll panel shell

**Slice:** M5.1
**Milestone:** M5 — Payroll Actions
**Built against:** `GameRules` constants `LoanGoldGain=5`, `LoanDebtCost=6`, `VictoryBonusGoldCost=3`, `VictoryBonusAttackBuff=1`, `CutWagesUpkeepReduction=3`, `CutWagesAttackPenalty=1`.

How to test: open `DungeonDebt/Assets/Scenes/Main.unity` in the Unity Editor and press Play. For steps that require a temporary `GameRules` or `DataRepository` edit, the step says so explicitly and the next step instructs you to revert it. Always revert temporary edits before proceeding to the next scenario.

---

## Happy path

- [ ] Step 1. Press Play. Click **Start Run**.
      Expected: Shop panel appears. Header shows `Round 1`, `Gold 10`, `Debt 0`, `Morale 30`.
      Actual: pass

- [ ] Step 2. Hire 3 heroes whose total `HireCost` ≤ 10 (e.g. Warrior + Squire + Bard, or any combination that fits). Click **Continue**.
      Expected: Formation panel appears with the 3 hired heroes occupying slots 0–2.
      Actual: Mostly pass(could only afford 2 not 3)

- [ ] Step 3. Click **Continue** on the Formation panel (no swap needed).
      Expected: **Payroll** panel appears (not Combat). Title reads "Payroll — choose one action for this fight". Four cards visible: Take Loan, Cut Wages, Promise Victory Bonus, Skip Payroll. Continue button is **disabled**. Status text says "Payroll. Choose one action, then Continue."
      Actual: pass

- [ ] Step 4. Click the **Take Loan** card.
      Expected: Take Loan card gains a yellow highlight border. Continue button becomes **enabled**.
      Actual: pass

- [ ] Step 5. Note the current `Gold` and `Debt` values from the header. Click **Continue to Combat**.
      Expected: Combat plays out. After the streamed log, the Reward Summary appears. The header reflects `Gold = (previous_gold + 5 + WinReward_or_LossReward − totalUpkeep − interest)` and `Debt` is `(previous_debt + 6 + any_shortfall + interest_added)`. The +5 / +6 from Loan must be visibly applied.
      Actual: pass

---

## Per-action pre-combat effect checks

Each scenario starts from a fresh **Start Run**. Before clicking the card, record the values listed in "Pre-Continue snapshot"; after clicking Continue, before combat ends, the values should have changed as listed (the reward summary and post-combat math obscure the pre-combat effect, so verify by stepping into Unity's pause mode or by adding a temporary `Debug.Log` in `PayrollManager.Apply` — if you add a log, revert it after these scenarios).

### Loan

- [ ] Step 6. Start Run → Shop → Hire any 2 heroes you can afford → Continue → Formation → Continue.
      Expected: Payroll panel visible.
      Actual: pass

- [ ] Step 7. Pre-Continue snapshot. Open the Inspector on the GameManager GameObject, find `RunManager → CurrentRunState`. Note `Gold` and `Debt` (call these `G0` and `D0`). Note each hero's `Attack` and `UpkeepThisRound` (call these `A_i` and `U_i`).
      Expected: Values are readable in the Inspector.
      Actual: pass

- [ ] Step 8. Click the **Take Loan** card. Pause the editor (Ctrl-Shift-P) the moment you click **Continue to Combat**, then inspect `RunManager → CurrentRunState` again.
      Expected: `Gold == G0 + 5`. `Debt == D0 + 6`. Each hero's `Attack == A_i`. Each hero's `UpkeepThisRound == U_i`. (Loan touches gold/debt only.)
      Actual: Pass logs: [PAYROLL PRE] action=TakeLoan Gold=0 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:12)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[0]=Bard Atk=1 Upk=3
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[1]=Apprentice Atk=1 Upk=1
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] action=TakeLoan Gold=5 Debt=6
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:66)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[0]=Bard Atk=1 Upk=3
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[1]=Apprentice Atk=1 Upk=1
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)



- [ ] Step 9. Unpause and let combat resolve.
      Expected: No crash; reward summary appears.
      Actual: Pass

### Cut Wages

- [ ] Step 10. Start Run → Shop → Hire 2–3 heroes whose `UpkeepThisRound` are mixed (include one whose `UpkeepThisRound` is ≤ 2 so we can test the per-hero floor at 0) → Continue → Continue → Payroll panel visible.
      Expected: Payroll panel visible. Note each hero's `Attack` (`A_i`) and `UpkeepThisRound` (`U_i`), and current `Gold`/`Debt`.
      Actual: pass

- [ ] Step 11. Click **Cut Wages** then **Continue to Combat**. Pause before combat finishes streaming.
      Expected: For each hero, `Attack == max(0, A_i − 1)` and `UpkeepThisRound == max(0, U_i − 3)`. Specifically, any hero whose `U_i` was ≤ 3 should now show `UpkeepThisRound == 0` (not negative). Any hero whose `A_i` was 0 (Treasurer) stays at 0. `Gold` and `Debt` are unchanged from pre-Continue.
      Actual: pass logs:
      [PAYROLL PRE] action=CutWages Gold=1 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:12)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[0]=Treasurer Atk=0 Upk=2
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[1]=Ranger Atk=3 Upk=3
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] action=CutWages Gold=1 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:66)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[0]=Treasurer Atk=0 Upk=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[1]=Ranger Atk=2 Upk=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

### Victory Bonus

- [ ] Step 12. Start Run → Shop → Hire ≥ 1 hero, keep ≥ 3 gold in your pocket → Continue → Continue → Payroll panel visible. Note `Gold` (`G0`) and each hero's `Attack` (`A_i`).
      Expected: Payroll panel visible.
      Actual: pass

- [ ] Step 13. Click **Promise Victory Bonus** then **Continue to Combat**. Pause.
      Expected: `Gold == G0 − 3`. Each hero's `Attack == A_i + 1`. `UpkeepThisRound` unchanged. `Debt` unchanged. (Loss-debt is deferred to M5.2 and should NOT trigger here even on combat loss.)
      Actual: pass
      [PAYROLL PRE] action=PromiseVictoryBonus Gold=3 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:12)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[0]=Wizard Atk=3 Upk=5
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] action=PromiseVictoryBonus Gold=0 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:66)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[0]=Wizard Atk=4 Upk=5
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

- [ ] Step 14. Pre-Continue gold-clamp check. Temporarily edit `GameRules.cs` to set `StartingGold = 1`. Save, re-enter Play, Start Run → quickly continue out of Shop with 0 hires (or hire only a 1-gold offer if available) so you reach Payroll with `Gold ≤ 2`. Note `Gold` (`G0`). Click Promise Victory Bonus → Continue. Pause.
      Expected: `Gold == 0` (clamped at 0, never negative). `Debt` unchanged. Each hero `Attack == A_i + 1`.
      Actual: CONDITIONAL pass - we should likely disable if the player doesnt have the 3 gold
      [PAYROLL PRE] action=PromiseVictoryBonus Gold=3 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:12)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[0]=Wizard Atk=3 Upk=5
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] action=PromiseVictoryBonus Gold=0 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:66)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[0]=Wizard Atk=4 Upk=5
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

- [ ] Step 15. Revert `GameRules.StartingGold` back to `10`. Save.
      Expected: File reverted. Future runs see Gold 10.
      Actual: pass

### Skip Payroll

- [ ] Step 16. Start Run → Shop → Hire any heroes → Continue → Continue → Payroll panel visible. Note all hero `Attack`, `UpkeepThisRound`, and current `Gold`/`Debt`.
      Expected: Payroll panel visible.
      Actual: pass

- [ ] Step 17. Click **Skip Payroll** then **Continue to Combat**. Pause before combat finishes.
      Expected: All hero `Attack` and `UpkeepThisRound` unchanged. `Gold` unchanged. `Debt` unchanged.
      Actual: pass
      [PAYROLL PRE] action=StandardPay Gold=0 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:12)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[0]=Treasurer Atk=0 Upk=2
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL PRE] hero[1]=Knight Atk=1 Upk=4
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:16)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] action=StandardPay Gold=0 Debt=0
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:66)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[0]=Treasurer Atk=0 Upk=2
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)

[PAYROLL POST] hero[1]=Knight Atk=1 Upk=4
UnityEngine.Debug:Log (object)
PayrollManager:Apply (RunState,PayrollActionId) (at Assets/Scripts/Run/PayrollManager.cs:70)
GameManager:ContinueFromPayroll () (at Assets/Scripts/Core/GameManager.cs:91)
MainMenuPanel:HandlePayrollContinue () (at Assets/Scripts/UI/MainMenuPanel.cs:158)
PayrollPanelView:HandleContinueClicked () (at Assets/Scripts/UI/PayrollPanelView.cs:101)
UnityEngine.EventSystems.EventSystem:Update () (at ./Library/PackageCache/com.unity.ugui@473409526770/Runtime/UGUI/EventSystem/EventSystem.cs:515)



---

## Selection edge cases

- [ ] Step 18. Reach the Payroll panel via any path. With no selection made, attempt to click **Continue to Combat**.
      Expected: Continue button is visually disabled and clicking does nothing.
      Actual: pass

- [ ] Step 19. Click the Take Loan card.
      Expected: Take Loan highlighted, Continue button becomes enabled.
      Actual: pass

- [ ] Step 20. Click the Cut Wages card.
      Expected: Take Loan loses its highlight, Cut Wages gains it. Continue still enabled. `RunState.SelectedPayrollAction` (visible in Inspector on RunManager) equals `CutWages`.
      Actual: pass

- [ ] Step 21. Click Cut Wages a second time.
      Expected: Cut Wages highlight disappears. Continue button becomes disabled. `RunState.SelectedPayrollAction` is null in the Inspector.
      Actual: pass

- [ ] Step 22. Click Skip Payroll, then click Skip Payroll again.
      Expected: First click highlights and enables Continue; second click clears highlight and disables Continue. `RunState.SelectedPayrollAction` ends at null.
      Actual: pass

---

## Rule checks

- [ ] Step 23. Search the project for `UnityEngine.Random` in `Assets/Scripts/Run/PayrollManager.cs`, `Assets/Scripts/UI/PayrollPanelView.cs`, `Assets/Scripts/UI/PayrollCardView.cs`.
      Expected: Zero matches in any of these three files.
      Actual: pass

- [ ] Step 24. Open `PayrollManager.cs`. Confirm every numeric value used in `Apply` is `GameRules.<Constant>` — no literal integers in arithmetic (clamping to 0 is allowed; the digit 0 may appear).
      Expected: All payroll numbers come from `GameRules.LoanGoldGain`, `GameRules.LoanDebtCost`, `GameRules.CutWagesUpkeepReduction`, `GameRules.CutWagesAttackPenalty`, `GameRules.VictoryBonusGoldCost`, `GameRules.VictoryBonusAttackBuff`. No magic 5/6/3/1.
      Actual: pass

- [ ] Step 25. Open `MainMenuPanel.cs`. Confirm the Payroll panel `Show()` / `Hide()` calls are driven only from `HandleStateChanged` and `ResetUi` / `RunSandboxCombat` — i.e. the panel does not toggle its own visibility.
      Expected: `PayrollPanelView` does not contain `gameObject.SetActive(true)` outside of `Show()` and the parameterless `Hide()` paths.
      Actual: pass

- [ ] Step 26. Reach Payroll, click any card, click Continue. Watch the `RunState.SelectedPayrollAction` Inspector field across the click sequence.
      Expected: It is null on entry to Payroll state, gets set exactly once per click, ends non-null before Combat begins.
      Actual: pass

- [ ] Step 27. Search `DataRepository.cs` for the four payroll display names ("Take Loan", "Cut Wages", "Promise Victory Bonus", "Skip Payroll").
      Expected: All four present; `AllPayrollActions` is a `ReadOnlyCollection<PayrollActionDefinition>`.
      Actual: pass

---

## Regression checks (pull from prior slices)

- [ ] Step 28. (M3.2) Start a Run. In the Shop, Hire one hero, Fire one hero (refund 1 gold), Reroll once (-2 gold). Confirm the gold deltas match.
      Expected: Hire deducts `BaseUpkeep + 2`; Fire refunds 1; Reroll deducts 2. Reroll replaces all 3 offer slots.
      Actual: pass

- [ ] Step 29. (M4.1) From Shop continue to Formation. Click an occupied slot, then click an empty slot. Confirm the hero moves. Click an occupied slot then itself; confirm selection clears.
      Expected: Click-to-swap still functions.
      Actual: pass

- [ ] Step 30. (M2.x) Run a full Shop → Formation → Payroll → Combat → Reward cycle. Pick **Skip Payroll** so payroll math doesn't mask the regression check. Confirm the Reward Summary shows reward gold, total upkeep, shortfall (if any), and interest as before M5.1.
      Expected: Reward summary panel numbers obey the rules from M2.2 / M2.3.
      Actual: pass

- [ ] Step 31. (M2.3) Force a Defeat. Temporarily edit `GameRules.cs` to set `StartingMorale = 1`. Run a full cycle and lose combat (e.g., hire only a Squire vs Sandbox). Confirm the End Screen still shows with reason "Morale exhausted." Click **New Run**; runs reset cleanly.
      Expected: End screen path still works through Payroll.
      Actual: pass

- [ ] Step 32. Revert `GameRules.StartingMorale` back to `30`. Save.
      Expected: File reverted.
      Actual: pass

---

## Observable invariants

- [ ] Step 33. Throughout every Payroll → Combat transition above, `RunState.SelectedPayrollAction` is non-null at the moment `GameState.Combat` is entered (M5.1 acceptance criterion 5).
      Expected: True in all scenarios above.
      Actual: pass

- [ ] Step 34. After any `PayrollManager.Apply`, every hero's `Attack ≥ 0` and `UpkeepThisRound ≥ 0`.
      Expected: True; in particular, Cut Wages on Treasurer (Attack 0) leaves Attack at 0, not −1.
      Actual: pass

- [ ] Step 35. `RunState.Gold` is never negative after any `PayrollManager.Apply` (Victory Bonus clamps gold at 0).
      Expected: True.
      Actual: pass

- [ ] Step 36. Entering the Payroll state always resets `SelectedPayrollAction` to null first (Continue button starts disabled on every visit).
      Expected: True.
      Actual: pass

- [ ] Step 37. Only one of the four cards is highlighted at any time.
      Expected: True; switching selection clears the previous highlight before applying the new one.
      Actual: pass

- [ ] Step 38. The Payroll panel only appears on `GameState.Payroll`; it is hidden during MainMenu, Shop, Formation, Combat, Reward, Victory, and Defeat.
      Expected: True.
      Actual: pass
