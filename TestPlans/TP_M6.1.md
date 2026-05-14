# TP_M6.1 — Scout panel and encounter list wiring

**Slice goal:** After StartRun and after each round-advance, the next state is `Scout`. Scout panel shows the round's encounter name, type, scout text, and reward. `DataRepository.Encounters` holds all 10 encounters. Plain DPS combat — no encounter behavioral effects yet (deferred to M6.2).

Steps are checkboxes. Fill `Actual:` only if the result differs from `Expected:`.

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` and press Play.
      Expected: Title "Dungeon Debt" visible. Status "Ready". Start Run button enabled. No Scout, Shop, Formation, or Payroll panels visible.
      Actual:

- [ ] Step 2. Click **Start Run**.
      Expected: Scout panel appears. Title reads "Round 1 — Slimes". Type label reads "Dungeon". Scout text reads "Simple enemies. Win by having enough basic stats." Reward line reads "Reward: 8 gold". Continue button visible (label "Continue to Shop"). Run header shows Round 1, Gold 10, Debt 0, Morale 30.
      Actual: pass

- [ ] Step 3. Click Continue on the Scout panel.
      Expected: Shop panel appears with 3 hero offers. Scout panel is hidden. Status reads "Shop. Hire heroes, then Continue."
      Actual: pass

- [ ] Step 4. Hire any 2–3 heroes you can afford. Click Continue from Shop.
      Expected: Formation panel appears.
      Actual: pass

- [ ] Step 5. Click Continue from Formation.
      Expected: Payroll panel appears.
      Actual: pass

- [ ] Step 6. Pick "Skip Payroll" and click Continue.
      Expected: Combat resolves. Combat log streams enemy names from the Round 1 encounter (Slimes only — three Slime entries; no Cave Bat, no Training Dummy).
      Actual: pass

- [ ] Step 7. When combat finishes, click Continue on the Reward Summary.
      Expected: Scout panel reappears with **Round 2 — Goblin Thieves**. Type "Dungeon". Scout text "If a Goblin Thief survives past combat round 3, lose 3 gold." Reward "Reward: 8 gold". Run header shows Round 2.
      Actual: pass

- [ ] Step 8. Click Continue → progress Shop → Formation → Payroll → Combat → Reward → Continue.
      Expected: Scout panel reappears with **Round 3 — Greedy Guild Ghost**. Type "Rival Ghost". Scout text "A reckless rival guild with expensive heroes. Strong now, but drowning in debt."
      Actual: pass

---

## Full 10-round sweep

Goal: confirm Scout fires every round 1–10 with the right encounter, encounters are visibly varied, and a Round-10 win lands on Victory.

Temporary diagnostic scaffold (recommended for survival):

1. In `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, change `StartingGold` to a generous value (e.g. `60`) so you can keep hiring through 10 rounds.
2. **Revert** `StartingGold` back to its committed value before marking this slice complete (see Step 24).

- [ ] Step 9. Apply the `StartingGold = 60` diagnostic edit and enter Play mode.
      Expected: Run header shows Gold 60 on Round 1.
      Actual: pass

- [ ] Step 10. Play Round 1 (Scout → Shop → hire to 5 → Formation → Payroll Skip → Combat → Reward → Continue).
      Expected: Scout for Round 2 appears next. Encounter is "Goblin Thieves" with 2 Goblin Thief enemies in combat log.
      Actual: pass

- [ ] Step 11. Play Round 2 the same way.
      Expected: Scout for Round 3 appears. Name "Greedy Guild Ghost". Type "Rival Ghost". 3 Slime enemies in combat (R3 is a placeholder per M6.1).
      Actual: pass

- [ ] Step 12. Play Round 3.
      Expected: Scout for Round 4. Name "Tax Collector". Type "Dungeon". Combat shows 1 Tax Collector enemy.
      Actual: pass

- [ ] Step 13. Play Round 4.
      Expected: Scout for Round 5. Name "Backline Bat". Combat shows 1 Backline Bat + 1 Slime.
      Actual: pass

- [ ] Step 14. Play Round 5.
      Expected: Scout for Round 6. Name "Carry Guild Ghost". Type "Rival Ghost". 3 Slime placeholder enemies.
      Actual: pass

- [ ] Step 15. Play Round 6.
      Expected: Scout for Round 7. Name "Debt Wraith". Combat shows 1 Debt Wraith (1 attack / 10 HP — note attack is **not** scaling with debt yet).
      Actual: pass

- [ ] Step 16. Play Round 7.
      Expected: Scout for Round 8. Name "Treasure Leech". Combat shows 1 Treasure Leech + 1 Slime.
      Actual: pass

- [ ] Step 17. Play Round 8.
      Expected: Scout for Round 9. Name "Frugal Guild Ghost". Type "Rival Ghost".
      Actual: pass

- [ ] Step 18. Play Round 9.
      Expected: Scout for Round 10. Name "Dungeon Auditor". Type "Final Boss". Scout text "Final boss. Damages your party and adds debt pressure." Combat shows 1 Dungeon Auditor (3 atk / 20 HP).
      Actual: pass

- [ ] Step 19. Play Round 10 to a win.
      Expected: Reward Summary appears. Continue routes to the **Victory** end screen (not Scout). LatestEndReason is "Final round cleared."
      Actual: pass

- [ ] Step 20. Note the **distinct encounter names** observed in Scout across the sweep.
      Expected: At least 5 distinct names seen (Slimes, Goblin Thieves, Greedy Guild Ghost, Tax Collector, Backline Bat, Carry Guild Ghost, Debt Wraith, Treasure Leech, Frugal Guild Ghost, Dungeon Auditor).
      Actual: pass

---

## Encounter data checks

- [ ] Step 21. Open `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` in your editor.
      Expected: `EncounterDefinitions` static list has exactly 10 entries with `Round` values 1..10 in order. Each entry has `EncounterType` matching §8: R3/R6/R9 = `RivalGhost`, R10 = `FinalBoss`, all others = `Dungeon`.
      Actual: pass

- [ ] Step 22. Spot-check encounter stats in source.
      Expected: R1 Slimes — `BaseGoldReward = GameRules.WinReward` (8), enemies `{Slime, Slime, Slime}`. R4 Tax Collector — single `TaxCollector` enemy (1 atk / 8 HP). R10 Dungeon Auditor — single `DungeonAuditor` enemy (3 atk / 20 HP).
      Actual: pass

- [ ] Step 23. Confirm placeholder roster for rival ghost rounds.
      Expected: R3/R6/R9 each have `Enemies = { Slime, Slime, Slime }` (per Open Question 4 — Slime placeholder; real rival teams in M7).
      Actual: pass

- [ ] Step 24. **Revert** the `StartingGold` diagnostic from Step 9.
      Expected: `GameRules.StartingGold` is back to the value committed in main.
      Actual: pass

---

## State machine checks

- [ ] Step 25. Re-enter Play mode after Step 24's revert. Click Start Run.
      Expected: First post-`StartRun` state is `Scout` (not `Shop`). Scout panel is visible on Round 1.
      Actual: pass

- [ ] Step 26. Progress one round to Reward, click Continue on Reward Summary.
      Expected: State goes Reward → Upkeep (internally) → **Scout** (not Shop). Run header shows Round 2.
      Actual: pass

- [ ] Step 27. In source, confirm `GameManager.ContinueAfterReward` routes the "continue run" branch through `Scout`, not `Shop`.
      Expected: `if (nextState == GameState.Shop) { _runManager.AdvanceRound(); nextState = GameState.Scout; }` — round advances and state is rerouted to Scout.
      Actual: pass

- [ ] Step 28. In source, confirm `GameManager.ChangeState` calls `_encounterManager.LoadEncounter(round)` on entry to `Scout`.
      Expected: A `_currentState == GameState.Scout` branch exists before the `Shop` branch and invokes `LoadEncounter(runState.Round)`.
      Actual: pass

---

## Rule checks

- [ ] Step 29. `grep -n "UnityEngine.Random" DungeonDebt/Assets/Scripts/Run/EncounterManager.cs DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs`.
      Expected: No matches. EncounterManager.LoadEncounter is a deterministic index lookup; no RNG.
      Actual: pass

- [ ] Step 30. Confirm no encounter or enemy behavioral effects fire in combat.
      Expected: Combat log shows no Goblin Thief gold steal, no Tax Collector upkeep adjustment, no Backline Bat targeting override, no Debt Wraith scaling, no Treasure Leech reward reduction, no Dungeon Auditor periodic damage. Combat is a plain DPS race. Reward gold is the base `WinReward` / `LossReward`.
      Actual: pass

- [ ] Step 31. Confirm `ScoutPanelView` does not show or hide itself.
      Expected: All `Show()` / `Hide()` calls on `_scoutPanelView` originate in `MainMenuPanel.HandleStateChanged` / `ResetUi` / `RunSandboxCombat`. The view's own code only toggles `gameObject.SetActive` in response to a public `Show()` / `Hide()` call.
      Actual: pass

- [ ] Step 32. Confirm `DataRepository.Encounters` is exposed as a read-only collection.
      Expected: Field type is `IReadOnlyList<EncounterDefinition>` and the backing list is wrapped in `ReadOnlyCollection<EncounterDefinition>`.
      Actual: pass

- [ ] Step 33. Open `Assets/Scripts/Run/EncounterManager.cs` and confirm it derives from `MonoBehaviour` and is initialized via `GameManager.EnsureManagers`.
      Expected: `EncounterManager : MonoBehaviour`. `GameManager.EnsureManagers` constructs or finds it and calls `_encounterManager.Initialize(_runManager)`.
      Actual: pass

---

## Regression checks (re-run from prior slices)

- [ ] Step 34. **TP_R002 Scenario A** — Continue from Reward Summary still progresses the run (now via Scout).
      Expected: Round 1 Reward → Continue → **Scout for Round 2** (previously Shop for Round 2). Continue on Scout → Shop for Round 2. The Shop/Formation/Payroll/Combat cycle still works for Round 2 unchanged.
      Actual: pass

- [ ] Step 35. **TP_M5.2 / R002 AC5** — Multi-round economy still updates.
      Expected: After clearing Round 1 with a 2–3 hero party, Round 2's Run header shows updated Gold (= prior gold + 8 reward − upkeep − interest). Debt and Morale unchanged unless thresholds hit. Per-round economy math from M2.2 is intact.
      Actual: pass

- [ ] Step 36. **TP_M4.1 happy path** — Formation panel still allows click-to-swap.
      Expected: Selecting two occupied slots swaps them; party order in subsequent combat reflects the swap.
      Actual: pass

- [ ] Step 37. **TP_M5.1 payroll select** — All 4 payroll cards still render; selecting a card enables Continue.
      Expected: Cards visible; Continue from Payroll disabled until a card is selected; selection persists into Combat (per M5.2).
      Actual: pass

- [ ] Step 38. **TP_M3.2 hire/fire/reroll** — Shop still works.
      Expected: 3 offers visible; Hire deducts gold; Fire refunds 1 gold; Reroll costs 2 gold and refreshes all 3 slots.
      Actual: pass

- [ ] Step 39. **Defeat by morale** — End screen still fires.
      Expected: If morale ≤ 0 after Reward+Upkeep, `ContinueAfterReward` returns `Defeat` (not Scout); EndScreenView "Defeat" variant appears. LatestEndReason reads "Morale exhausted."
      Actual: pass

---

## Observable invariants

- [ ] Step 40. `RunState.Round` increments by exactly 1 after each successful round-advance.
      Expected: Round goes 1 → 2 → 3 → … → 10 with no skips or repeats. After a Round-10 win, the next state is `Victory` and `Round` stays at 10.
      Actual: pass

- [ ] Step 41. `RunState.CurrentEncounter` is non-null whenever the run is past `StartRun` and before `Victory`/`Defeat`.
      Expected: `CurrentEncounter` is set on Scout entry and remains set through Shop, Formation, Payroll, Combat, Reward, Upkeep. It is re-assigned (not cleared) on the next Scout entry.
      Actual: pass

- [ ] Step 42. `CurrentEncounter.Round` always equals `RunState.Round` during Shop/Formation/Payroll/Combat.
      Expected: No round-mismatch between the loaded encounter and the run's current round.
      Actual: pass

- [ ] Step 43. Scout text shown in UI matches `IMPLEMENTATION_PLAN.md` §8 / `GAME_DESIGN.md` scout text lines.
      Expected: Each of the 10 encounters shows the exact scout text string from the design doc — no paraphrasing.
      Actual: pass

- [ ] Step 44. Continue button label on Scout reads "Continue to Shop".
      Expected: Constant label across all 10 rounds.
      Actual: pass

- [ ] Step 45. Only one of {Scout, Shop, Formation, Payroll} panel is `activeSelf == true` at any given time outside Combat/Reward/Upkeep.
      Expected: No double-rendered panels during state transitions.
      Actual: pass
