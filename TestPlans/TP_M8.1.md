# TP_M8.1 — Card readability foundation

Manual test plan for slice **M8.1** (Milestone M8 — Card readability pass). Every step is a checkbox with Action / Expected / Actual fields. Run in the Unity Editor against `Assets/Scenes/Main.unity`.

This slice is UI-only. No diagnostic scaffolds (Debug.Log probes, throwaway components, GameRules tweaks) should be required. If a tester adds one anyway, revert it before marking the slice complete.

---

## Happy path

- [ ] Step 1. Press Play. From the Main Menu, click **Start Run**.
      Expected: Scout panel for Round 1 appears.
      Actual: pass

- [ ] Step 2. On the Scout panel, observe the new content area below the reward line.
      Expected: A "Danger: <category>" line is visible (italic, salmon-ish color). Below it, a horizontally centered row of one or more **enemy cards** renders, each with name (bold), an "ATK X    HP Y" stat block, and an italic effect blurb (or "No effect.").
      Actual: pass

- [ ] Step 3. Click **Continue to Shop**.
      Expected: Shop panel opens with three offer slots. Each offer renders a `HeroCardView` showing: a colored vertical band on the left edge, the hero name (bold) at the top, a colored role badge chip (Tank/Damage/Support/Economy) under the name, an "ATK X    HP Y" stat block, a bold larger gold-tinted "Upkeep Ng" line, and an italic wrapped effect blurb. A small empty outlined square is visible in the top-right corner of every card (the reserved tier-badge slot).
      Actual: pass

- [ ] Step 4. Hover/visually inspect each of the three shop offer cards.
      Expected: The role band color and the role badge chip color match the role label inside the chip (Tank=blue, Damage=red, Support=green, Economy=gold).
      Actual: pass

- [ ] Step 5. Click **Hire** on an offer you can afford.
      Expected: Hire/Fire/Reroll behaves exactly as before M8.1. Hired hero appears in the Party panel on the right; the offer's Status flips to "Hired" and the Hire button greys out. No layout breakage.
      Actual: pass

- [ ] Step 6. Click **Reroll**.
      Expected: Three new offers render as cards, each with role band, role badge, prominent upkeep, blurb, and reserved tier slot.
      Actual: pass

- [ ] Step 7. Continue through to Combat, finish the round, return to Round 2 Scout.
      Expected: Round 2 Scout panel renders the new round's enemies as cards in the same row layout.
      Actual: pass

---

## Edge cases

- [ ] Step 8. Reroll the shop until you see a hero with a "No effect." style blurb (Warrior or Squire are the candidates per `DataRepository`).
      Expected: The card still renders the literal effect text (e.g. "No effect.") in the blurb area; the card's vertical layout is unchanged from heroes that have a real effect blurb.
      Actual: pass

- [ ] Step 9. Reroll the shop until you see the longest-named hero (e.g. **Apprentice Wizard**, **Treasure Goblin Tamer** if present, otherwise pick the longest visible).
      Expected: The name does not collide with the reserved tier-slot rectangle in the top-right corner. The name may wrap to a second line; the role badge below the name does not get pushed out of the card.
      Actual: pass

- [ ] Step 10. Reroll until you see the hero with the longest effect blurb (Enchanter / Treasurer / Wizard tend to be longest).
      Expected: The blurb wraps inside the card and is fully readable; it does not bleed into the upkeep line or the bottom edge of the card.
      Actual: pass

- [ ] Step 11. Reroll until the **Apprentice Wizard** appears (low-stat hero).
      Expected: ATK and HP fields render the small numbers correctly with no truncation. Upkeep line still renders prominently.
      Actual: pass

- [ ] Step 12. Play through to a round that contains a **Golem** enemy (high-HP). On the Scout panel, inspect that enemy's card.
      Expected: The high HP value renders correctly, name and effect blurb both visible, no overflow outside the card.
      Actual: pass

- [ ] Step 13. Advance to Round 3 (Greedy rival ghost fight) and look at the Scout panel.
      Expected: The full rival ghost team renders as multiple enemy cards in a single horizontal row, centered. Each card is independently readable. The row does not visually overlap the Continue button below.
      Actual: pass

- [ ] Step 14. Advance to Round 6 (Carry rival ghost) and Round 9 (Frugal rival ghost) and repeat the observation.
      Expected: Same — full opposing team is shown as a row of enemy cards in Scout.
      Actual: pass

---

## Rule checks 

Note from user: please skip these tests in the future. These should be part of the implementation verification, not test plan.

- [ ] Step 15. With the project open, search the workspace for `UnityEngine.Random` and `Random.Range` in any file modified in this slice (`HeroCardView.cs`, `EnemyCardView.cs`, `ScoutPanelView.cs`, `ShopOfferView.cs`, `GameRules.cs`).
      Expected: Zero matches.
      Actual: pass

- [ ] Step 16. Search the workspace for any new tier-related field, enum value, or method (e.g. `Tier`, `Bronze`, `Silver`) in `HeroDefinition`, `HeroInstance`, `DataRepository`, or `ShopManager`.
      Expected: Zero matches — M8.1 only reserves a visual slot. Tier logic is M9.
      Actual: pass

- [ ] Step 17. Inspect `Assets/Scripts/UI/HeroCardView.cs` and `Assets/Scripts/UI/EnemyCardView.cs`.
      Expected: Both are `MonoBehaviour` view components with `[SerializeField] private` fields, one class per file, file name == class name. Neither modifies `RunState`, `HeroInstance`, or any other game state — they are presentation only.
      Actual: pass

- [ ] Step 18. Inspect `Assets/Scripts/Core/GameRules.cs`.
      Expected: Role colors are declared `public static readonly Color`, NOT `const Color`. A `GetRoleColor(HeroRole)` helper exists. No new gameplay constants were added.
      Actual: pass

- [ ] Step 19. Verify there are no new files under `Assets/Resources/`, `Assets/StreamingAssets/`, `Assets/Tests/`, `Assets/Editor/`, or `Assets/Art/`.
      Expected: None of those folders contain new files (Art may not exist at all — that's fine).
      Actual: pass

- [ ] Step 20. Verify the project compiles with no new warnings introduced by this slice.
      Expected: Unity Console shows 0 errors and no new warnings attributable to the M8.1 files.
      Actual: pass

---

## Regression checks 

Lets skip regression in the future. Actual test cases should hit enough cases that we don't need to worry. Only propose regression when we might actually change them.

(Critical steps from prior slices that this work might have broken — pulled from `TestPlans/TP_M3.2.md` (shop), `TestPlans/TP_M6.1.md` (10-round flow), `TestPlans/TP_M7.x.md` (rivals/leaderboard), and `TestPlans/TP_R001.md` (combat log scroll). If a referenced test plan does not exist by that exact name, use the closest equivalent.)

- [ ] Step 21. (M1.3 / R001) Force a long combat (e.g. set `GameRules.StartingGold = 100`, hire a 5/5 support party, run combat) and verify the combat log scroll still works and is not truncated.
      Expected: Log scrolls; all lines visible. Revert the `StartingGold` change before continuing.
      Actual:

- [ ] Step 22. (M3.2) On Round 1 Shop, exercise Hire / Fire / Reroll fully. Hire one, Fire it, Reroll, hire two, Fire one of the two, Reroll again.
      Expected: Same behavior as before M8.1. Gold deductions correct. Party panel updates correctly.
      Actual:

- [ ] Step 23. (M6.1) Play a full 10-round run end-to-end, choosing Continue at every Scout / Shop / Formation / Payroll / Combat / Reward step.
      Expected: Run completes (win or loss). Every Scout panel renders correctly. Every Shop panel renders cards correctly. No `NullReferenceException` in the Console.
      Actual:

- [ ] Step 24. (M7.1 / M7.2) On any round 3, 6, or 9, observe the Scout panel and the post-combat Rival Update panel.
      Expected: Rival ghost encounter resolves; leaderboard panel renders intact (M8.1 did not touch it).
      Actual:

- [ ] Step 25. (R003) Hire a hero in Round 1, move it to a non-default formation slot, advance through combat to Round 2, then hire two more heroes.
      Expected: Each new hire takes the first empty formation slot. No two heroes occupy the same slot.
      Actual:

---

## Observable invariants

(Should be true at all times during runtime in this slice.)

- [ ] Step 26. Every visible `HeroCardView` shows exactly one role band, one role badge chip, one stat block, one upkeep line, one effect blurb, and one (empty) reserved tier-slot rectangle.
      Expected: No card has duplicates, none has a missing field.
      Actual: pass

- [ ] Step 27. Every visible `EnemyCardView` shows exactly one name, one stat block, and one effect blurb. No tier slot, no role band (those are hero-only).
      Expected: Confirmed.
      Actual: pass

- [ ] Step 28. The reserved tier-slot rectangle on hero cards is **empty** (no glyph, no text, no Bronze fill). Its outline color is neutral grey, not Bronze-tinted.
      Expected: Confirmed — Bronze coloring is reserved for M9.
      Actual: pass

- [ ] Step 29. No card displays negative stats (ATK, HP, Upkeep) at any point during the run.
      Expected: Confirmed.
      Actual: pass

- [ ] Step 30. Enemy card row in Scout never overflows the Scout panel's content width. Continue button is always reachable below the enemies row.
      Expected: Confirmed across rounds 1–10, including 5-enemy rival rounds.
      Actual: pass

- [ ] Step 31. Role badge chip color matches `GameRules.GetRoleColor(role)` for every visible hero card.
      Expected: Tank=steel-blue, Damage=crimson, Support=green, Economy=gold (the four defaults picked this slice).
      Actual: pass

Potential regression: had enchanter in F0, treasurer in F1. Treasuerer didn't get a stat buff. I dont remember how this buff worked to know if this is an issue