# TP_M7.3 - M7 Closeout Smoke Test

Manual Unity Editor test plan for slice M7.3.

This is a short closeout pass because M7.1, R003, and M7.2 were already tested and no runtime code changed in M7.3. The goal is to confirm the M7 milestone still hangs together end-to-end, not to repeat every prior test.

No temporary diagnostic scaffold is required.

---

## Happy Path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity`, enter Play Mode, and click Start Run.
      Expected: Round 1 Scout appears with no Console errors, and the compact leaderboard shows exactly 4 rows: You, Greedy Guild, Frugal Guild, Carry Guild.
      Actual: Pass

- [ ] Step 2. Play through Round 1 to Reward Summary, then click Continue.
      Expected: RivalUpdate appears before Round 2 Scout, shows the full leaderboard, and Continue advances to Round 2 Scout exactly once.
      Actual: pass

- [ ] Step 3. Advance to Round 3 Scout and enter combat.
      Expected: Scout shows `Greedy Guild Ghost`; Combat Log uses `Greedy Tank`, `Greedy Tank`, and `Greedy Carry`, not Slimes.
      Actual:pass

- [ ] Step 4. Continue the same run far enough to spot-check Round 6 and Round 9 Scouts/Combat Logs.
      Expected: Round 6 uses `Carry Protector` / `Carry Champion`; Round 9 uses `Frugal Guard`, `Frugal Archer`, and `Frugal Healer`.
      Actual: pass

- [ ] Step 5. Complete Round 10 or stop once the terminal state is reached.
      Expected: The run ends in Victory or Defeat; it never advances to Round 11 or a terminal RivalUpdate.
      Actual: pass

---

## Edge Cases

- [ ] Step 6. In a fresh run, hire no heroes and reach the Round 3 ghost fight.
      Expected: Combat immediately logs `Player has no living heroes.` Reward Summary shows ghost loss behavior: `Gold gained: +4` and `Morale change: -8`.
      Actual: was able to do on day 1

- [ ] Step 7. In any normal non-ghost dungeon fight, observe a win or loss Reward Summary.
      Expected: Normal fights still use normal reward/morale math: win +8 gold, loss +4 gold and -6 morale.
      Actual: pass

---

## Rule Checks

- [ ] Step 8. Source-search `DungeonDebt/Assets/Scripts/**` for `UnityEngine.Random`.
      Expected: 0 occurrences.
      Actual: pass

- [ ] Step 9. Source-check the project tree.
      Expected: No `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folder exists.
      Actual: pass

---

## Regression Checks

- [ ] Step 10. Move heroes to non-contiguous formation slots, then hire another hero in a later Shop.
      Expected: The new hire fills the first empty slot and no two heroes stack in one visible Formation slot.
      Actual: pass

- [ ] Step 11. Observe one Scout leaderboard and one RivalUpdate leaderboard.
      Expected: Scout uses compact leaderboard; RivalUpdate uses full leaderboard; neither obscures required controls.
      Actual: pass

---

## Observable Invariants

- [ ] Inv 1. Every visible leaderboard has exactly 4 rows.
      Actual: pass

- [ ] Inv 2. Ghost fight rewards/morale follow `GameRules`: ghost win +10 gold, ghost loss +4 gold and -8 morale.
      Actual: pass

- [ ] Inv 3. Console remains free of new errors and warnings throughout the smoke test.
      Actual: pass
