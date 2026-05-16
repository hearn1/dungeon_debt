# TP_M10.6 — Combat card cleanup (thin tier frame + name as no-sprite fallback)

**Slice:** M10.6
**Goal:** Hero tier border renders as a thin four-sided frame in the tier colour (no longer a full-card fill), and the unit name text shows only as the fallback when no portrait sprite resolves.

No temporary diagnostic scaffold is required: both behaviours under test (tier-frame shape/colour, name visibility) are directly visible on the combat cards in the Game view. No internal C# state needs to be probed.

---

## Happy path

- [ ] Step 1. Enter Play mode, start a run, hire at least 2 heroes, and proceed through Formation/Payroll into Combat with `SpriteCatalog` populated (hero portraits assigned).
      Expected: Each hero combat card shows its portrait. The tier border is a **thin** frame (≈2px) along all four edges of the card in the tier colour (orange-ish Bronze / grey Silver). The card centre shows the portrait — it is **not** covered by a solid tier-colour rectangle.
      Actual:

- [ ] Step 2. Look at the hero cards where portraits resolved.
      Expected: No unit name text is drawn over the card (portrait identifies the unit). HP bar + "HP x/y" text and the role band remain visible and legible.
      Actual:

- [ ] Step 3. Compare a Bronze hero card with a Silver hero card (hire a duplicate to force a Silver, or use a run that has one).
      Expected: Both show the same thin four-sided frame; only the colour differs (Bronze vs Silver). Frame thickness is visually identical on top, bottom, left, and right.
      Actual:

- [ ] Step 4. Look at the enemy cards in the same combat.
      Expected: Enemy cards show no tier frame at all (unchanged from before). Enemy name text is hidden when the enemy portrait resolves; portrait, HP bar, and accent band are legible.
      Actual:

---

## Edge cases

- [ ] Step 5. Temporarily clear one hero's sprite slot in the `SpriteCatalog` component in the scene (set the Sprite field to None) so that hero's portrait does not resolve, then run a combat with that hero.
      Expected: That hero's card falls back to the placeholder box (background tint, role band, thin tier frame) **and** the unit name text is now shown so the card is still identifiable. Cards whose sprites still resolve continue to hide the name.
      Actual:

- [ ] Step 6. Revert the `SpriteCatalog` slot from Step 5 back to its original sprite. (Revert checkbox — required before the slice is marked complete.)
      Expected: Slot restored; that hero's portrait resolves again and its name hides again.
      Actual:

- [ ] Step 7. Let a hero die during combat (low-HP unit takes lethal damage).
      Expected: Dead-state styling (dark red background) still applies; the thin tier frame and (if no portrait) the fallback name behave the same as when alive — no full-card tier rectangle reappears.
      Actual:

- [ ] Step 8. Run a combat where the same card slots are reused across multiple rounds (advance to round 2+ and fight again).
      Expected: `Clear()` between refreshes leaves no stale name text and no stale tier fill; each round the cards rebuild correctly with the thin frame and correct name visibility.
      Actual:

---

## Observable invariants

(Should always hold while combat cards are visible in this slice.)

- [ ] The hero tier border is never a filled rectangle covering the card interior — it is always a thin edge frame.
- [ ] Tier-frame thickness is the same on all four sides of any given hero card.
- [ ] A hero card shows the unit name **iff** its portrait did not resolve (exclusive: portrait present ⇒ name hidden; portrait absent ⇒ name shown).
- [ ] Enemy cards never display a tier frame.
- [ ] The portrait, when present, is never occluded by the tier frame.
- [ ] No card changes size or row position relative to the M10.4 layout.

---

## Regression checks

This slice edits `CombatUnitCardView.BuildUi` (tier-border rect setup) and `SetPortrait`/`Clear` (name visibility) — the combat board layout that M10.1/M10.2/M10.4 depend on. Specific prior behaviour at risk:

- [ ] Step 9. Run a full combat with the heal/acting/hit-flash visuals (a party with a healer; let units act and take damage).
      Expected: The acting outline, pulsing green heal frame, and red hit-flash still render as thin edges exactly as in M10.2 — the tier-frame change did not disturb the heal/acting frame rects (they share the `SetEdge*` helpers but are separate Images).
      Actual:

- [ ] Step 10. Replay a combat and watch HP bars update per replay event.
      Expected: Per-step HP fill/text updates (M10.2/M10.4) still work; the name-visibility change did not affect HP display or the portrait set by `CombatPanelView` after `Refresh`.
      Actual:
