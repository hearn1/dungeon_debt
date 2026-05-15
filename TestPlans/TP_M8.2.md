# TP_M8.2 — Formation card adoption

**Slice:** M8.2
**Goal:** Formation slots render occupied heroes through the M8.1 `HeroCardView` (role band, role badge, ATK/HP, prominent Upkeep, blurb, reserved tier slot). Empty slots and click-to-swap behavior unchanged. Live instance values used for ATK and Upkeep.

Open `Assets/Scenes/Main.unity`, enter Play mode, click **Start Run**, then proceed through Shop into Formation as the scenarios direct.

---

## Happy path

- [ ] Step 1. Start a run. Hire one hero (any role). Continue from Shop.
      Expected: Formation panel appears. The hired hero's slot renders as a `HeroCardView`: left-edge role color band, role badge chip under the name, `ATK <n>    HP <n>` line, prominent gold-tinted `Upkeep <n>g` line, wrapped effect blurb beneath, and an empty outlined reserved tier slot in the top-right.
      Actual: pass

- [ ] Step 2. Observe the remaining 4 empty slots.
      Expected: Each empty slot shows a darker background and a centered italic `(empty)` placeholder. No hero card content (no role band, no badge, no stats, no blurb).
      Actual: pass

- [ ] Step 3. Look at the bottom-right corner of every slot.
      Expected: Slot label `F0`, `F1` on the frontline row and `B2`, `B3`, `B4` on the backline row, drawn on top of the card / empty placeholder.
      Actual: pass

- [ ] Step 4. Visually confirm the trapezoid layout.
      Expected: 2 frontline slots centered above 3 backline slots, gold "Frontline" label above the top row, blue "Backline" label above the bottom row, Continue button centered below.
      Actual: pass

- [ ] Step 5. Click the occupied slot, then click an empty slot.
      Expected: First click highlights the occupied slot with a gold border. Second click swaps the hero into the new slot; the previous slot returns to `(empty)`; the highlight clears.
      Actual: pass

- [ ] Step 6. Continue to Combat.
      Expected: Combat resolves normally with the heroes in their chosen positions. No errors in Console.
      Actual: pass

---

## Edge cases

- [ ] Step 7. Edge — longest-name hero. Start a new run. Reroll until you can hire **Enchanter** (or another long-name hero) and place them in any slot.
      Expected: Hero name fits within the slot without overlapping the role badge or the reserved tier slot. Name may wrap to two lines but stays legible.
      Actual: pass

- [ ] Step 8. Edge — lowest-stat hero. In the same or a fresh run, hire **Apprentice** (lowest ATK / lowest upkeep). Open Formation.
      Expected: Card shows `ATK 1    HP 4` (or definition values), `Upkeep 1g`, full blurb visible, reserved tier slot still rendered.
      Actual: pas

- [ ] Step 9. Edge — full 5/5 party with mixed roles. Hire heroes covering Tank, Damage, Support, and Economy roles until party is at 5/5 (use Reroll for cost 2g if needed; you may temporarily raise `GameRules.StartingGold` to 100 to make this fast — revert before slice complete, see scaffold step below).
      Expected: All 5 slots render full cards side-by-side at 1920×1080. Role bands clearly differentiate the 4 role colors. Slots do not overlap each other and do not clip the Continue button.
      Actual: pass

- [ ] Step 10. Edge — partial party. From a fresh run, hire exactly 2 heroes. Place one in `F0` and one in `B4`.
      Expected: Slots F0 and B4 show full cards; F1, B2, B3 show `(empty)` placeholders. No layout shift between rounds when re-entering Formation.
      Actual: pass

- [ ] Step 11. Edge — live values via payroll. Hire any 2 heroes. Continue to Formation, note each hero's `Upkeep <n>g` value on the card.
      Expected: Upkeep shown on the card equals each hero's `BaseUpkeep` (no payroll applied yet — `UpkeepThisRound == BaseUpkeep` at the Formation step of round 1).
      Actual: pass

- [ ] Step 12. Continuation of Step 11. Continue to Payroll, select **Cut Wages**, resolve combat and reward. On round 2, return to Formation.
      Expected: Cards show base ATK and base Upkeep again (per `RevertPerCombatHeroStats` between rounds). Live values match the values upkeep math will use on this round.
      Actual: pass

### Temporary diagnostic scaffold (Step 9 only)

To make 5/5 hires easy, temporarily edit `DungeonDebt/Assets/Scripts/Core/GameRules.cs`:

1. Locate `public const int StartingGold = 10;`
2. Change to `public const int StartingGold = 100;`
3. Run the scenario.

- [ ] Step 13. Revert `GameRules.StartingGold` to `10` before marking the slice complete.
      Expected: File restored to the original committed value.
      Actual: pass

---

## Observable invariants

- [ ] Step 14. Invariant — slot count. At every Formation entry, count visible slots.
      Expected: Always exactly 5 slots (2 frontline + 3 backline).
      Actual: pass

- [ ] Step 15. Invariant — no slot overlap. Inspect the panel for any frame.
      Expected: Slot rectangles never overlap each other or the Continue button.
      Actual: pass

- [ ] Step 16. Invariant — empty slots never render hero data. With at least one empty slot present, confirm:
      Expected: No role band, no badge, no stats, no `Upkeep` text, and no blurb on any empty slot.
      Actual: pass

- [ ] Step 17. Invariant — frontline / backline visual distinction. From any Formation entry:
      Expected: Frontline label is gold and sits above the top row of 2 slots; Backline label is blue and sits above the bottom row of 3 slots. Rows are visibly separated by the `RowGap` spacing.
      Actual: pass

- [ ] Step 18. Invariant — reserved tier slot stays empty. On every occupied card across all scenarios:
      Expected: Top-right reserved tier slot renders as a faintly filled outlined rectangle. No glyph, no Bronze fill, no numeric tier label.
      Actual: pass
