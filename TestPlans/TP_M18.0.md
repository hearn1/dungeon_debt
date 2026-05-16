# TP_M18.0 - Status keyword planning + first-slice definition

M18.0 is a planning-only slice. No Unity runtime behavior changed, so the checks below verify that the next implementation brief is ready, scoped, and consistent with the user's status direction.

## Happy path

- [ ] Step 1. Open `NEXT_SESSION.md` and confirm the next slice is `M18.1 - Multi-status combat keywords, enemy-side first pass`.
      Expected: The file names M18.1, gives a one-sentence goal, and states that player access through relics/upgrades is deferred to M18.2.
      Actual:

- [ ] Step 2. Review the in-scope status definitions.
      Expected: `Guarded`, `Burned`, `Poisoned`, `Marked`, `Weakened`, and `Inspired` each have a short deterministic rule, a letter, and a color.
      Actual:

- [ ] Step 3. Review the files-to-create and files-to-modify sections.
      Expected: The brief lists implementation files under the existing `DungeonDebt/Assets/Scripts/` folders and creates only `TestPlans/TP_M18.1.md` plus an optional data class if needed.
      Actual:

## Edge cases

- [ ] Step 4. Check that `Guarded` specifies half damage rounded up.
      Expected: The M18.1 brief explicitly says rounded up.
      Actual:

- [ ] Step 5. Check that `Poisoned` is not described as a generalized stack framework.
      Expected: The brief allows only Poisoned's current poison damage counter and excludes generalized stacks.
      Actual:

- [ ] Step 6. Check the status-indicator UI note.
      Expected: The brief requires color+letter indicators that do not cover portrait art, HP bars, Veteran progress, or acting/hit feedback.
      Actual:

## Observable invariants

- [ ] Step 7. Confirm the brief keeps M18.1 enemy-side only.
      Expected: No hero, relic, or upgrade reward access is in scope for M18.1.
      Actual:

- [ ] Step 8. Confirm forbidden systems remain excluded.
      Expected: The brief excludes durations, cleanse/dispel, resistances, damage types, crit/dodge, broad debuff libraries, full status engines, save/load, equipment, inventory, and new top-level folders.
      Actual:

- [ ] Step 9. Confirm source-of-truth deviation is visible.
      Expected: The brief clearly says M18.1 is a user-approved expansion from the original one-keyword placeholder in `IMPLEMENTATION_PLAN.md` section 16.
      Actual:

## Regression checks

This planning slice changes only handoff documentation and does not alter runtime behavior. Regression checks are limited to documentation readiness because no Unity scene, prefab, source code, or generated asset was modified.

- [ ] Step 10. Run `git status --short`.
      Expected: Only `NEXT_SESSION.md` and `TestPlans/TP_M18.0.md` are modified/added by this planning slice.
      Actual:
