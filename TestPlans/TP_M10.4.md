# TP_M10.4 - Sprite Catalog + Static Base Sprites on Combat Cards

Manual Unity Editor test plan for M10.4. Test in Play mode from `Assets/Scenes/Main.unity`.

**Asset state for this slice:** the 12 hero + 16 enemy base PNGs are **not** supplied yet. M10.4 lands the `SpriteCatalog` and the per-card portrait + fallback path only. With no sprites assigned, every card must fall back to the existing placeholder box. One scenario below temporarily assigns an arbitrary Editor sprite to prove the display path, then reverts it.

---

## Scenario A - Editor wiring (no Play mode)

- [ ] Step 1. In the Hierarchy, select (or create) a GameObject for the catalog and `Add Component` -> `Sprite Catalog`.
      Expected: Component adds with three lists - `Hero Sprites` (12 rows: `warrior`...`apprentice`), `Enemy Sprites` (16 rows: `slime`...`frugal_healer`), `Effect Sprites` (5 rows: `melee_stab`, `arrow`, `fireball`, `heal`, `enchant`). Every `Sprite` field is `None`. No console errors.
      Actual:

- [ ] Step 2. Select the `MainMenuPanel` object and drag the catalog GameObject into its `Sprite Catalog` field.
      Expected: The field accepts the reference; no errors.
      Actual:

- [ ] Step 3. Collapse and re-expand the `Sprite Catalog` lists in the Inspector.
      Expected: The 12 / 16 / 5 id rows persist with ids unchanged and unduplicated.
      Actual:

## Happy Path - fallback (no sprites assigned)

- [ ] Step 4. Enter Play mode with the catalog wired but all sprite fields empty. Start a run, hire 2-3 heroes, continue through Formation and Payroll into Combat.
      Expected: Combat board renders exactly as before M10.4 - every hero and enemy card shows the placeholder box (background tint, role band, HP bar, tier border). No portrait art. No console errors/exceptions.
      Actual:

- [ ] Step 5. Let the combat log stream to completion.
      Expected: HP bars, acting outline, hit flash, heal frame, and the board-level Warrior sword stab all behave exactly as in M10.2/M10.3. Win/loss text unchanged.
      Actual:

- [ ] Step 6. Continue through Reward / Rival Update into the next round and back into Combat.
      Expected: Combat panel hides outside Combat and re-populates correctly on the next Combat; still placeholder boxes, no errors.
      Actual:

## Happy Path - portrait display (temporary sprite)

This proves AC2's display path without the real PNGs. It uses a throwaway sprite and **must be reverted**.

- [ ] Step 7. Exit Play mode. On the catalog, set the `warrior` row's `Sprite` to any existing project/built-in sprite (e.g. a UI sprite under Packages, or import any small PNG). Leave all other rows empty.
      Expected: Field accepts the sprite.
      Actual:

- [ ] Step 8. Enter Play mode, start a run, hire a **Warrior**, and reach Combat with the Warrior placed.
      Expected: The Warrior card shows the assigned sprite confined to the upper/centre region; its name, `HP x/y` bar, role band, and tier border remain fully legible on top of the art. All other cards still show the placeholder box.
      Actual:

- [ ] Step 9. Exit Play mode and set the `warrior` row's `Sprite` back to `None`.
      Expected: Catalog is back to all-empty. (Revert step - required before the slice is considered testable-complete.)
      Actual:

## Edge Cases

- [ ] Step 10. Leave the `MainMenuPanel` `Sprite Catalog` field **empty** (no catalog at all). Enter Play mode and reach Combat.
      Expected: No `NullReferenceException`. Every card falls back to the placeholder box. Combat plays normally.
      Actual:

- [ ] Step 11. With the temporary `warrior` sprite assigned (repeat Step 7), hire a Warrior, reach Combat, then let the Warrior die.
      Expected: On death the card shows the dead-state red tint; the portrait does not block the dead styling or cause layout shift. No errors.
      Actual:

- [ ] Step 12. (Revert) Confirm the `warrior` row sprite is `None` again after Step 11.
      Expected: Catalog all-empty. No temporary sprite committed.
      Actual:

## Observable Invariants

At all times during this slice's scenarios:

- [ ] No console errors or exceptions are produced by `SpriteCatalog`, `CombatPanelView`, or `CombatUnitCardView`.
- [ ] A card with no resolved sprite is visually identical to its pre-M10.4 appearance (placeholder box unchanged).
- [ ] Name text, HP bar/text, role band, and tier border are always readable - never fully hidden by a portrait.
- [ ] Card size and row layout do not change whether or not a portrait is shown (portrait is an overlay, not a layout element).
- [ ] `SpriteCatalog` lookups never throw on a missing/empty/unknown id (they return the placeholder path).

## Regression Checks

The diff modifies `CombatPanelView.cs` (Initialize signature, per-card resolve) and `CombatUnitCardView.cs` (new portrait child + Clear path), which prior slices' combat rendering depends on.

- [ ] Step 13. During Combat (Step 5), confirm the M10.2 board-level Warrior sword-stab still lunges attacker->target and retracts, and acting/hit-flash/heal-frame visuals are unchanged.
      Expected: Identical behaviour to M10.2/M10.3; the new portrait child does not occlude or break the stab or frame overlays (they render on top of the portrait).
      Actual:

- [ ] Step 14. Confirm empty formation slots in Combat render as cleared cards (no stale portrait from a previous round/unit).
      Expected: Empty slots show nothing; `Clear()` has nulled and disabled the portrait Image.
      Actual:
