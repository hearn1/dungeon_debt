# TP_M9.3 - Upgrade delta preview

Manual Unity Editor test plan for slice M9.3.

**Slice scope (recap):**

- Bronze-owned duplicate shop offers still show as upgrade offers.
- Upgrade offers now preview what Bronze -> Silver changes before the player clicks.
- Silver direct-hire offers keep their existing Silver-offer presentation and do not show Bronze -> Silver deltas.
- No gameplay numbers, hire rules, combat rules, or economy rules change.

---

## Happy path

Temporary setup:

1. In `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, temporarily change `public const float SilverOfferChance = 0.20f;` to `public const float SilverOfferChance = 0.0f;`.
2. Press Play after Unity recompiles.
3. Revert `SilverOfferChance` to `0.20f` in Step 6.

- [ ] Step 1. Start a fresh run and advance Scout -> Shop.
      Expected: Shop shows Bronze offers only while the temporary setup is active.
      Actual: pass

- [ ] Step 2. Hire a stat-upgrade hero: Warrior, Ranger, or Squire.
      Expected: The hired hero appears in the Party panel as Bronze.
      Actual: pass

- [ ] Step 3. Reroll until the same hero appears again as a Bronze duplicate.
      Expected: The offer button says `Upgrade (Xg)`, and the status area shows a numeric Bronze -> Silver preview. Warrior/Squire show ATK and HP deltas; Ranger shows an ATK delta.
      Actual: pass

- [ ] Step 4. Click the upgrade offer.
      Expected: The hero upgrades to Silver in-place, and the visible Party/Formation stats match the previewed delta.
      Actual: pass

- [ ] Step 5. Repeat with one non-stat effect hero when practical, such as Priest, Bard, Enchanter, Treasurer, or Apprentice.
      Expected: The upgrade offer status shows a short effect preview such as `Heal 2->3`, `Win gold 2->4`, `Adjacent Damage -> All Damage`, `Top 1 -> Top 2`, or `Wizard upkeep -1->-2`.
      Actual: pass

- [ ] Step 6. Revert the temporary `SilverOfferChance = 0.0f` edit back to `0.20f`.
      Expected: The file is back to the committed placeholder value before continuing.
      Actual: pass

---

## Edge cases

- [ ] Step 7. With normal `SilverOfferChance = 0.20f`, observe a Silver direct-hire offer if one appears.
      Expected: The offer still says `Hire Silver (Xg)` and status says `Silver offer`; it does not show a Bronze -> Silver delta preview.
      Actual: pass

- [ ] Step 8. Fill the party to 5/5, then reroll until a Bronze-owned duplicate offer appears.
      Expected: The upgrade offer remains interactable if affordable, and the status area still shows the delta preview rather than `Party full`.
      Actual: pass

- [ ] Step 9. Spend gold below an upgrade offer's cost.
      Expected: The button is disabled and status says `Need Xg`; the preview is hidden while the offer is unaffordable.
      Actual: pass

- [ ] Step 10. Upgrade an upkeep-reduction hero: Golem, Wizard, or Ninja.
      Expected: The preview shows `Upkeep X->Y` where Y is lower than X and never below 0.
      Actual: pass

---

## Observable invariants

- [ ] Inv 1. Upgrade previews appear only for Bronze-owned duplicate offers.

- [ ] Inv 2. Upgrade previews list only values that change from Bronze to Silver.

- [ ] Inv 3. Previewed stats match the post-upgrade card values after purchase.

- [ ] Inv 4. Silver direct-hire offers do not imply an owned-hero merge.

- [ ] Inv 5. Offer button labels and interactability continue to reflect affordability, purchased state, and party-full state.

---

## Regression checks

- [ ] Step 11. Protected seam: `ShopOfferView.Refresh` affordability branch. Try an unaffordable normal hire and unaffordable upgrade.
      Expected: Both show `Need Xg`, and neither button is interactable.
      Actual: pass

- [ ] Step 12. Protected seam: `ShopOfferView.Refresh` purchased branch. Buy a normal offer and upgrade a duplicate offer.
      Expected: Normal purchase status says `Hired`; upgrade purchase status says `Upgraded`; both buttons disable after purchase.
      Actual: pass
