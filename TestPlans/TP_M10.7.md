# TP_M10.7 — Combat-screen layout pass (v2 footer-card + combat-only relayout)

Manual Unity Editor test plan for slice **M10.7**. Run at 1920×1080 / 16:9 (Game view set to 1920×1080 or "Fixed Resolution 1920×1080"). No diagnostic scaffold is required — every check is observable in the Game view.

**Final dimensions chosen (record for PROGRESS):** `CombatScreenTopOffset = 64` (combat panel grows 510→826px tall; bottom edge unchanged so the scrolling log does not move). `CardWidth=200, CardHeight=176, CardGap=22, RowGap=8`. 176 < the ideal 208 because the scrolling combat log is preserved unchanged and the top reclaim is bounded; 176 is the largest 4-row fit (bottom of row 4 = 56 + 4·176 + 5·8 = 800 ≤ 826).

---

## Happy path

- [ ] Step 1. Press Play. Click **Start Run**. Progress through Scout → Shop (hire 2–3 heroes) → Formation → Payroll → Continue into Combat.
      Expected: The combat screen shows four rows of **large portrait cards** (~200×176, clearly bigger than the old small cards). Each card is a portrait: the unit art (or placeholder box if no sprite) fills the upper area; a fixed-height **footer band** runs along the bottom of every card with a slim role-coloured top edge, a slightly darker background, and the HP track inside it.
      Actual:

- [ ] Step 2. Observe a hero card whose sprite resolves (e.g. one of the standard heroes).
      Expected: No unit name text is shown (M10.6 behaviour preserved); the footer holds only the HP track + HP text under the role-accent edge. Portrait fills the area above the footer.
      Actual:

- [ ] Step 3. Observe the top of the combat screen.
      Expected: The persistent run header remains readable (Round / Gold / Debt / Morale do not overlap any combat controls). The big "Dungeon Debt" title and the Start Run / Restart Sandbox row are NOT visible (occluded by the enlarged combat panel). A thin **compact combat header** strip appears in the upper-right combat area below the run header, showing the status text ("Combat running..." then "Combat complete. Press Continue.") and a **Restart** button.
      Actual:

- [ ] Step 4. Let the combat replay run to completion. Watch HP bars and the combat log on the bottom strip.
      Expected: HP bars deplete step-by-step in sync with the streaming log; the log strip still streams and auto-scrolls; status updates to "Combat complete. Press Continue." in the compact header.
      Actual:

- [ ] Step 5. Click **Continue** on the Reward Summary (right panel).
      Expected: Flow advances to the next round's Shop. The compact combat header disappears; the normal big title, status text, and Start/Restart row are visible again and correctly positioned.
      Actual:

- [ ] Step 6. Click the compact header **Restart** button mid-combat (start a new run, enter combat, click it before the replay finishes).
      Expected: The run restarts exactly as the old Restart Sandbox button did (fresh run from the beginning).
      Actual:

## Edge cases

- [ ] Step 7. Enter a combat where one side has only frontline units (e.g. a small early encounter) so some card slots are empty.
      Expected: Empty slots render as cleared cards (no footer, no role band, transparent) — no stray footer strip or accent line on empty slots; nothing overlaps the title region from below.
      Actual:

- [ ] Step 8. Find a unit with no resolved sprite (placeholder box) during combat.
      Expected: The unit **name** is shown (centred) inside the footer band as the fallback, above the HP track; footer bg + role-accent edge still present.
      Actual:

- [ ] Step 9. Drive a unit to low HP and to death during combat.
      Expected: HP fill switches colour at the 50% threshold; at 0 HP the card shows the dead-state red tint; footer band stays legible (HP shows 0, not negative).
      Actual:

- [ ] Step 10. Trigger acting + hit-flash + heal/enchant effects (support-heavy party: Priest/Enchanter present).
      Expected: Acting outline (4 edge strips), hit-flash overlay, and the shared effect sprite all render correctly at the new card size; the role-accent footer edge is not confused with the acting outline.
      Actual:

## Observable invariants

- [ ] Step 11. Throughout combat: no card displays negative HP; HP text never exceeds max.
      Actual:

- [ ] Step 12. Throughout combat: nothing clips or overflows the 1920×1080 screen — the run header, all four card rows, the panel "Combat" title + row labels, the compact combat header, the combat log strip, the reward summary, and the result text are fully on-screen with no incoherent overlap.
      Actual:

- [ ] Step 13. The combat panel footer band is present on every occupied card (never a card with a portrait but no footer, or a footer with no card).
      Actual:

- [ ] Step 14. The compact combat header is visible **only** during the combat sequence (Combat → through Reward summary), stays clear of the run header, and never appears in Scout/Shop/Formation/Payroll/RivalUpdate/Victory/Defeat/Ready.
      Actual:

## Non-combat screens unchanged (AC3)

- [ ] Step 15. Visit each non-combat screen in a full run: Scout, Shop, Formation, Payroll, Reward Summary, Rival Leaderboard, and an end screen (Victory or Defeat).
      Expected: Every one renders **exactly as before M10.7** — same positions, same big title / status / Start-Restart row, same panel sizes. No combat footer card, no compact header, no shifted log/reward layout on any of them.
      Actual:

## Regression checks

These are included because the diff enlarges the combat panel and resizes cards — the historical R001 log behaviour and the M10.5 effect motion sit on the affected seam (the log panel rect and card world positions).

- [ ] Step 16. **R001 — long-combat log scroll.** Temporarily set `GameRules.StartingGold = 100`. Start a run, hire a support-heavy 5/5 party (Priest, Bard, Enchanter, Treasurer, Apprentice) via hire-then-reroll, continue to a long combat.
      Expected: The combat log strip (unchanged position/behaviour) still streams every line, auto-scrolls to the bottom, and is fully scrollable with the permanent scrollbar — no truncation. The log panel did not move or shrink relative to pre-M10.7.
      Actual:

- [ ] Step 17. **Revert the R001 scaffold:** restore `GameRules.StartingGold` to its original value. (Checkbox — must be done before the slice is marked complete.)
      Actual:

- [ ] Step 18. **M10.5 — effect motion at new size.** In a combat with Ranger (arrow), Wizard (fireball), a melee attacker, Priest (heal), and Enchanter (enchant): watch the shared effect sprites.
      Expected: Each effect still flies from the correct attacker card to the correct target card and centres on the target at the new 200×176 card size/positions; heal/enchant still pulse on the correct card. No effect lands off-card or on the wrong card.
      Actual:
