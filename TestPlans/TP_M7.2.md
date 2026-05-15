# TP_M7.2 - Scripted Rival Ghost Teams and Modifiers

Manual Unity Editor test plan for slice M7.2.

No temporary diagnostic scaffold is required. The ghost encounter names, ghost enemy names, reward gold, morale changes, and leaderboard values are visible through Scout, Combat Log, Reward Summary, and RivalUpdate. Source checks cover static data fields that are not displayed directly.

---

## Happy Path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` and enter Play Mode.
      Expected: The main menu appears with no Console errors or warnings.
      Actual: pass

- [ ] Step 2. Click Start Run and advance to Round 3 Scout through the existing run flow.
      Expected: The flow reaches Scout for Round 3 without skipping Shop, Formation, Payroll, Combat, Reward, or RivalUpdate.
      Actual: pass

- [ ] Step 3. Inspect Round 3 Scout.
      Expected: Scout shows `Round 3 - Greedy Guild Ghost`, type `Rival Ghost`, and the Greedy Guild scout text.
      Actual: pass

- [ ] Step 4. Continue into Round 3 Combat and inspect the Combat Log.
      Expected: The enemy side uses `Greedy Tank`, `Greedy Tank`, and `Greedy Carry`; no `Slime` enemies appear in this ghost fight.
      Actual: pass

- [ ] Step 5. Win the Round 3 ghost fight.
      Expected: Reward Summary shows `Combat: Win`, `Gold gained: +10`, and `Morale change: 0`.
      Actual: pass

- [ ] Step 6. Advance to Round 6 Scout.
      Expected: Scout shows `Round 6 - Carry Guild Ghost`, type `Rival Ghost`, and the Carry Guild scout text.
      Actual: pass

- [ ] Step 7. Continue into Round 6 Combat and inspect the Combat Log.
      Expected: The enemy side uses `Carry Protector`, `Carry Protector`, and `Carry Champion`; the champion has visibly high damage in combat log outcomes.
      Actual: pass

- [ ] Step 8. Advance to Round 9 Scout.
      Expected: Scout shows `Round 9 - Frugal Guild Ghost`, type `Rival Ghost`, and the Frugal Guild scout text.
      Actual: pass

- [ ] Step 9. Continue into Round 9 Combat and inspect the Combat Log.
      Expected: The enemy side uses `Frugal Guard`, `Frugal Guard`, `Frugal Archer`, and `Frugal Healer`; when a frontline ghost is damaged and alive at round end, `Frugal Healer heals ... for 2.` appears.
      Actual: pass

---

## Edge Cases

- [ ] Step 10. Start a fresh run, hire no heroes, and advance to Round 3.
      Expected: The player can reach Round 3 with morale remaining after earlier losses.
      Actual: pass

- [ ] Step 11. Enter Round 3 Combat with no heroes.
      Expected: Combat immediately logs `Player has no living heroes.` and Reward Summary shows `Combat: Loss`, `Gold gained: +4`, and `Morale change: -8`.
      Actual: pass

- [ ] Step 12. Start another fresh run and intentionally lose a normal dungeon fight.
      Expected: Reward Summary shows normal dungeon loss math: `Gold gained: +4` and `Morale change: -6`.
      Actual: pass

- [ ] Step 13. During a Frugal Guild Ghost fight, observe a round where both Frugal Guards are dead but Frugal Healer is alive.
      Expected: If healing triggers with no living frontline allies, the healer heals itself, never a dead unit.
      Actual: pass

- [ ] Step 14. Complete any ghost fight where all enemies are killed before the turn limit.
      Expected: The fight is a win and applies the +2 rival win bonus exactly once.
      Actual: pass

---

## Rule Checks

- [ ] Step 15. Source-check `DungeonDebt/Assets/Scripts/Core/DataRepository.cs`.
      Expected: Rounds 3, 6, and 9 are `EncounterType.RivalGhost`, have non-null rival guild ids `greedy`, `carry`, and `frugal`, and use ghost-specific enemy definitions instead of Slimes.
      Actual: pass

- [ ] Step 16. Source-check `DungeonDebt/Assets/Scripts/Core/GameRules.cs`.
      Expected: `RivalWinBonus`, `RivalLossMorale`, and the shared heal amount are named constants; no new tuning numbers are hidden in reward or combat logic.
      Actual: pass

- [ ] Step 17. Source-check `DungeonDebt/Assets/Scripts/Run/RunManager.cs`.
      Expected: Rival ghost wins add `GameRules.RivalWinBonus`; rival ghost losses use `GameRules.RivalLossMorale`; normal dungeon losses still use `GameRules.DungeonLossMorale`.
      Actual: pass

- [ ] Step 18. Source-check `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs`.
      Expected: Priest and Frugal Healer both call the shared leftmost-frontline heal helper; no coroutine, random, event bus, DI, or service locator was added.
      Actual: pass

- [ ] Step 19. Source-check the project tree.
      Expected: No `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folder exists.
      Actual: pass

- [ ] Step 20. Source-check changed files.
      Expected: No `UnityEngine.Random` usage was added.
      Actual: pass

---

## Regression Checks

- [ ] Step 21. Re-run the R003 formation placement check after moving heroes to non-contiguous slots and hiring later heroes.
      Expected: New hires fill the first empty formation slot and no two heroes stack in the same slot.
      Actual: pass

- [ ] Step 22. Re-run the M7.1 Scout leaderboard check on a fresh run.
      Expected: Scout shows a compact leaderboard with You, Greedy Guild, Frugal Guild, and Carry Guild.
      Actual: pass

- [ ] Step 23. Complete one round and stop on RivalUpdate.
      Expected: The full leaderboard appears, rival scripted stats advance once, and Continue advances to the next Scout.
      Actual: pass

- [ ] Step 24. Complete Round 2 Goblin Thieves.
      Expected: Goblin steal behavior and reward drain still work when thieves survive past combat round 3.
      Actual: pass

- [ ] Step 25. Complete Round 4 Tax Collector.
      Expected: Tax Collector upkeep modifier still appears in the Reward Summary economy math.
      Actual: pass

- [ ] Step 26. Complete a normal non-ghost dungeon win.
      Expected: Reward Summary shows `Gold gained: +8`, not +10.
      Actual: pass

---

## Observable Invariants

- [ ] Step 27. Observe every Scout screen reached during the test.
      Expected: Round number, encounter name, encounter type, scout text, and base reward all match the loaded encounter.
      Actual: pass

- [ ] Step 28. Observe every ghost Combat Log reached during the test.
      Expected: Ghost enemy display names match the current rival guild and never show the old Slime placeholder team.
      Actual: pass

- [ ] Step 29. Observe every Reward Summary reached during the test.
      Expected: Rival ghost wins show +10 gold; rival ghost losses show -8 morale; non-ghost rewards and morale use normal dungeon rules.
      Actual: pass

- [ ] Step 30. Observe every RivalUpdate screen reached during the test.
      Expected: Player ghost fight results do not directly mutate rival morale, debt, payroll, or status outside the normal scripted rival advance.
      Actual: pass

- [ ] Step 31. Observe Console throughout the test.
      Expected: No new errors or warnings are logged by this slice.
      Actual: pass
