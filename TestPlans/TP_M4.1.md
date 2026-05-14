# TP_M4.1 — Formation editing UI (click-to-swap reorder, frontline targeting)

Manual test plan for slice **M4.1**. Run in the Unity Editor (Play mode) unless otherwise noted.

Each step is a checkbox with three fields: Action, Expected, Actual.

---

## Happy path

- [ ] Step 1. Open `DungeonDebt/Assets/Scenes/Main.unity` and press Play.
      Expected: Title "Dungeon Debt" visible, status "Ready", Start Run button enabled, no Formation panel visible, no Shop panel visible, no end-screen overlay.
      Actual: pass

- [ ] Step 2. Click **Start Run**.
      Expected: Shop panel appears with 3 offers and status "Shop. Hire heroes, then Continue." Run header shows Round 1.
      Actual:

- [ ] Step 3. Hire 3 heroes (use Reroll if you need different roles). Note the names and the order you hired them in.
      Expected: Party section in the shop lists exactly 3 heroes in hire order. Gold deducted correctly per offer.
      Actual: pass

- [ ] Step 4. Click **Continue** on the shop panel.
      Expected: Shop panel hides. Formation panel appears with the title "Formation — click two slots to swap", a hint line, a Frontline header above 2 slots in a centered top row, and a Backline header above 3 slots in a centered bottom row (trapezoid). The 3 hired heroes occupy slots 0, 1, 2 in hire order. Slots 3 and 4 show "(empty)". Status reads "Formation. Click two slots to swap, then Continue."
      Actual: pass

- [ ] Step 5. Click slot 0 (top-left, first frontline).
      Expected: Slot 0 gets a yellow/gold highlight border. No swap occurs yet.
      Actual: pass

- [ ] Step 6. Click slot 2 (bottom-left, first backline).
      Expected: Slots 0 and 2 swap contents instantly. The hero previously in slot 0 now appears in slot 2, and vice versa. Highlight is cleared. No errors in Console.
      Actual: pass

- [ ] Step 7. Click **Continue to Combat** on the formation panel.
      Expected: Formation panel hides. Combat begins. The combat log streams attack lines. After combat, the reward summary appears with Continue button.
      Actual: pass

- [ ] Step 8. In the combat log, verify the first enemy attacks were directed at frontline heroes (slots 0–1).
      Expected: The first attacker on the enemy side hits a hero who is in slot 0 or slot 1 — not a hero in slots 2–4. If both frontline slots happen to be empty (only 1 hire chose to put themself in frontline), backline is targeted.
      Actual: pass

---

## Click-to-swap edge cases

- [ ] Step 9. Restart (click Restart Sandbox) and hire 2 heroes only this run. Reach Formation. Confirm both heroes are in slots 0 and 1, and slots 2–4 are empty.
      Expected: Top row has 2 occupied frontline slots; bottom row has 3 empty backline slots.
      Actual: pass

- [ ] Step 10. Click slot 0 (occupied), then click slot 3 (empty backline).
      Expected: Hero from slot 0 moves into slot 3. Slot 0 becomes "(empty)". Slot 3 now shows the hero. Highlight cleared.
      Actual: pass

- [ ] Step 11. Click slot 4 (empty backline) first, then click slot 1 (occupied).
      Expected: Clicking empty slot 4 first does **nothing** — no highlight appears, no error, no swap. Clicking slot 1 selects it (highlights). State remains: slot 1 occupied with highlight, slot 4 empty unhighlighted.
      Actual: pass

- [ ] Step 12. With slot 1 highlighted from Step 11, click slot 1 again.
      Expected: Highlight clears. No swap occurs. No error.
      Actual: pass

- [ ] Step 13. Click slot 3 (now occupied per Step 10), then click slot 3 again.
      Expected: Highlight appears on first click. Highlight clears on the second click of the same slot. No swap.
      Actual: pass

- [ ] Step 14. Click slot 3 (occupied), then click slot 1 (occupied).
      Expected: Swap of two occupied slots — heroes exchange positions. Highlight clears.
      Actual: pass

---

## Frontline targeting (deliberate ordering)

- [ ] Step 15. Restart. In Shop, hire one tank-style hero with high HP (e.g. Knight, Golem, or Guard) and one glass-cannon (e.g. Mage, Rogue, or Ninja). Hire any third hero too. Continue to Formation.
      Expected: All 3 heroes present, in hire order, in slots 0/1/2.
      Actual: pass

- [ ] Step 16. Use click-to-swap to put the **tank** in slot 0 and the **glass cannon** in slot 2 (backline). Confirm by reading the slot cards.
      Expected: Tank visible in slot 0 (frontline). Glass cannon visible in slot 2 (backline). Third hero in slot 1.
      Actual: pass

- [ ] Step 17. Continue to Combat. Watch the first enemy attack lines in the log.
      Expected: The first enemy attack targets the **tank** (slot 0). The glass cannon is **not** hit until both frontline heroes (slots 0 and 1) are dead.
      Actual: pass

- [ ] Step 18. Restart and rebuild the same party but swap the tank into slot 2 and the glass cannon into slot 0. Continue to Combat.
      Expected: This time enemy attacks target the **glass cannon** (slot 0) first, not the tank. Targeting follows the formation, not hire order.
      Actual: pass

---

## Rule checks

- [ ] Step 19. With Unity Editor open, in `Assets/Scripts/UI/FormationPanelView.cs` and `Assets/Scripts/UI/FormationSlotView.cs`, search for `UnityEngine.Random`.
      Expected: Zero matches. Formation has no randomness.
      Actual: pass

- [ ] Step 20. Search for `gameObject.SetActive` calls in `FormationPanelView.cs`.
      Expected: Only the panel's own `Show()` / `Hide()` set its own active state. `MainMenuPanel.HandleStateChanged` is what calls these in response to `GameState` transitions — the panel does not self-toggle from inside event handlers or `Update`.
      Actual: pass

- [ ] Step 21. Open `FormationPanelView.cs` and `FormationSlotView.cs` and search for hardcoded `2`, `3`, or `5` in slot-count contexts.
      Expected: No magic numbers for party size or frontline/backline counts. Code uses `GameRules.MaxPartySize`, `GameRules.FrontlineSlots`, `GameRules.BacklineSlots`. (Numeric layout constants like padding, gap, label heights are fine.)
      Actual: pass

- [ ] Step 22. Open `RunManager.cs` and review `SwapPartySlots`.
      Expected: Method bounds-checks slot indices against `GameRules.MaxPartySize`, treats out-of-bounds and `a == b` as no-ops, and re-sorts `Party` by `FormationSlot` afterwards.
      Actual: pass

- [ ] Step 23. Confirm `CombatManager.cs` was not modified beyond verification — no behavior changes, frontline-first targeting logic in `FindTarget` is unchanged from M3.2.
      Expected: `git diff` for `Assets/Scripts/Combat/CombatManager.cs` shows zero changes.
      Actual: pass

- [ ] Step 24. Confirm no out-of-scope additions: no payroll, scout, rival, save/load, animations beyond a color highlight, no tweens.
      Expected: No new files outside `FormationPanelView.cs`, `FormationSlotView.cs`, and `TP_M4.1.md`.
      Actual: pass

---

## Regression checks

- [ ] Step 25. Restart. In Shop, hire one hero, then Reroll once.
      Expected: 2 gold deducted; offers refresh; party-member hero is excluded from the new offer pool. (M3.2 shop behavior intact.)
      Actual: pass

- [ ] Step 26. Continue same run: hire 2 more (3 total), fire one of them.
      Expected: Fired hero removed; 1 gold refunded; party size now 2. (M3.2 hire/fire intact.)
      Actual: pass

- [ ] Step 27. Continue from Shop. In Formation, do not change anything. Continue to Combat. Let combat resolve.
      Expected: Reward summary appears with reward/upkeep/interest/morale math from M2.2; numbers update the run header. (M2.x flow intact.)
      Actual: pass

- [ ] Step 28. Click Continue on the reward summary.
      Expected: Round advances and combat re-runs (sandbox flow). If you survive to round 10 or hit the loss conditions, the end-screen appears (M2.3 flow intact).
      Actual: pass

- [ ] Step 29. Temporarily edit `GameRules.cs` to set `StartingGold = 100` and `StartingMorale = 6`. Run a deliberately bad run: hire 5 expensive heroes, walk into combat with no good ordering, and let losses pile up.
      Expected: End-screen appears with "Run lost." status and "Morale exhausted." or "Debt limit reached." as the reason. **Revert `GameRules.cs` to `StartingGold = 10` and `StartingMorale = 30` before continuing.**
      Actual: pass

---

## Observable invariants

- [ ] Step 30. After any swap, every `HeroInstance.FormationSlot` in `RunState.Party` equals the visible slot index its card sits in. Verify by reading the slot label (e.g. "F0", "B2") and the hero card displayed there.
      Expected: Every occupied slot's visible position matches its hero's `FormationSlot`. (Inspect via debugger or printed in console if needed.)
      Actual: pass

- [ ] Step 31. `RunState.Party.Count` is unchanged before vs. after any swap.
      Expected: Same party size before and after reorder.
      Actual: pass

- [ ] Step 32. No slot index outside `[0, GameRules.MaxPartySize)` ever appears in `HeroInstance.FormationSlot` after a swap.
      Expected: All FormationSlot values are in `{0,1,2,3,4}` at all times.
      Actual: pass

- [ ] Step 33. The Formation panel is hidden during MainMenu, StartRun, Shop, Combat, Reward/Upkeep streaming, and end-screens.
      Expected: The panel is only visible while `GameState == Formation`.
      Actual: pass

- [ ] Step 34. Clicking an empty slot when no slot is selected is a no-op (no error, no highlight).
      Expected: Console clean.
      Actual: pass

- [ ] Step 35. Clicking the same slot twice cancels the selection without changing party order.
      Expected: No swap, no error, party unchanged.
      Actual: pass
