# TP_M9.2 - Silver shop offers, direct-hire cost, and Silver bonuses

Manual Unity Editor test plan for slice M9.2.

**Slice scope (recap):**

- Shop offers now carry a `ShopOffer.Tier`.
- Silver offers can surface directly from the shop pool using `GameRules.SilverOfferChance`.
- Direct-hiring a Silver offer costs `BaseUpkeep + GameRules.HireCostBonus + GameRules.SilverHireCostBonus`.
- Silver heroes apply the placeholder M9.2 bonus shape from `IMPLEMENTATION_PLAN.md` section 15.
- Shop offer cards show the tier badge fill for the offered tier.

---

## Happy path

### Scenario A - Force Silver offers

Temporary diagnostic scaffold:

1. In `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, temporarily change `public const float SilverOfferChance = 0.20f;` to `public const float SilverOfferChance = 1.0f;`.
2. Press Play after Unity recompiles.
3. Revert `SilverOfferChance` to `0.20f` immediately after Scenario A.

- [ ] Step 1. Start a fresh run and advance Scout -> Shop.
      Expected: All non-empty shop offers are Silver-tier offers. Each offer card has a solid Silver tier slot, button text says `Hire Silver (Xg)`, and status says `Silver offer`.
      Actual: pass

- [ ] Step 2. Compare any Silver offer's cost against its displayed Upkeep and the hero's known base upkeep.
      Expected: Cost equals `BaseUpkeep + 2 + 3`. For example, a Warrior costs 7g (2 base upkeep + 2 hire bonus + 3 Silver bonus).
      Actual: pass

- [ ] Step 3. Hire an affordable Silver offer.
      Expected: Gold decreases by the Silver offer cost. The new party member fills the first empty formation slot, party count increases by 1, and its Party/Formation card shows a Silver tier slot.
      Actual: pass

- [ ] Step 4. If the hired Silver hero is Warrior, Ranger, or Squire, inspect its visible stats in the Party/Formation card.
      Expected: Warrior and Squire show +2 ATK and +4 HP over Bronze baseline. Ranger shows +2 ATK over Bronze baseline and keeps baseline HP.
      Actual: pass

- [ ] Step 5. If the hired Silver hero is Golem, Wizard, or Ninja, inspect its visible upkeep in the Party/Formation card.
      Expected: The upkeep hero shows 2 less upkeep than its Bronze baseline, never below 0.
      Actual: pass

- [ ] Step 6. Revert the temporary `SilverOfferChance = 1.0f` edit back to `0.20f`.
      Expected: The file is back to the committed placeholder value before continuing.
      Actual: pass

### Scenario B - Duplicate merge still works

Temporary diagnostic scaffold:

1. In `DungeonDebt/Assets/Scripts/Core/GameRules.cs`, temporarily change `public const float SilverOfferChance = 0.20f;` to `public const float SilverOfferChance = 0.0f;`.
2. Press Play after Unity recompiles.
3. Revert `SilverOfferChance` to `0.20f` immediately after Scenario B.

- [ ] Step 7. Start a fresh run, advance to Shop, and hire any Bronze offer.
      Expected: The hired hero appears as Bronze in Party/Formation, with Bronze baseline stats.
      Actual: pass

- [ ] Step 8. Reroll until the same Bronze-owned hero appears again, then click `Upgrade`.
      Expected: The existing instance becomes Silver in-place, party count does not grow, and its visible stats/upkeep update immediately according to its Silver bonus shape.
      Actual: pass

- [ ] Step 9. Reroll several more times after the merge.
      Expected: The now-Silver-owned hero does not reappear as either a Bronze offer or a Silver offer.
      Actual: pass

- [ ] Step 10. Revert the temporary `SilverOfferChance = 0.0f` edit back to `0.20f`.
      Expected: The file is back to the committed placeholder value before continuing.
      Actual: pass

---

## Edge cases

- [ ] Step 11. Temporarily set `SilverOfferChance = 1.0f`, then start a run and spend gold until you cannot afford a Silver offer.
      Expected: The unaffordable Silver offer button is disabled and the status says `Need Xg`.
      Actual: pass

- [ ] Step 12. Keeping `SilverOfferChance = 1.0f`, fill the party to 5/5 and observe remaining unpurchased Silver offers.
      Expected: Direct-hire Silver offers are disabled with `Party full`; no extra hero can be added.
      Actual: pass

- [ ] Step 13. Revert `SilverOfferChance` to `0.20f`.
      Expected: The temporary Silver-only shop scaffold is removed before the next scenario.
      Actual: pass

- [ ] Step 14. Temporarily set `SilverOfferChance = 0.0f`, fill the party to 5/5 with Bronze heroes, then reroll until a duplicate appears.
      Expected: The duplicate Bronze offer still shows `Upgrade (Xg)` / `Merges to Silver` and remains interactable if affordable, even though the party is full.
      Actual: pass

- [ ] Step 15. Revert `SilverOfferChance` to `0.20f`.
      Expected: The temporary Bronze-only shop scaffold is removed before continuing.
      Actual: pass

- [ ] Step 16. Hire or merge a Silver Knight, then reach a Backline Bat encounter or another backline-hit setup.
      Expected: Combat log contains two separate Knight redirect messages before redirects stop.
      Actual: pass

- [ ] Step 17. Hire or merge a Silver Priest, then enter combat with a damaged frontline ally during a round.
      Expected: Priest heal log says it heals for up to 3, clamped by missing HP.
      Actual: pass

- [ ] Step 18. Hire or merge a Silver Bard and win a combat.
      Expected: Combat log says the Bard sings for +4 gold, not +2.
      Actual: pass

- [ ] Step 19. Place a Silver Enchanter with multiple Damage allies where at least one Damage ally is not adjacent, then start combat.
      Expected: Combat log shows the Enchanter buffing all living Damage allies, not only adjacent ones.
      Actual: pass

Temporary diagnostic scaffold for Steps 20-22:

1. In `DungeonDebt/Assets/Scripts/Run/RunManager.cs`, inside `CalculateTotalUpkeep`, add this temporary loop immediately before the line `HeroEffects.ApplyPreUpkeep(runState);`:

```csharp
for (int i = 0; i < runState.Party.Count; i++)
{
    HeroInstance hero = runState.Party[i];
    Debug.Log("M9.2 PRE upkeep " + hero.Definition.DisplayName + " " + hero.Tier + " = " + hero.UpkeepThisRound);
}
```

2. Add this temporary loop immediately after the line `HeroEffects.ApplyPreUpkeep(runState);`:

```csharp
for (int i = 0; i < runState.Party.Count; i++)
{
    HeroInstance hero = runState.Party[i];
    Debug.Log("M9.2 POST upkeep " + hero.Definition.DisplayName + " " + hero.Tier + " = " + hero.UpkeepThisRound);
}
```

3. In the Unity Console, compare the PRE and POST upkeep lines for Wizard / Treasurer targets.
4. Revert both temporary log loops in Step 22 before marking the slice complete.

- [ ] Step 20. Build a party with a Silver Apprentice and a Wizard, then advance through upkeep.
      Expected: Wizard upkeep is reduced by 2 from Apprentice support before total upkeep is paid.
      Actual: pass

- [ ] Step 21. Build a party with a Silver Treasurer and at least two other heroes with positive upkeep, then advance through upkeep.
      Expected: Treasurer reduces the top two distinct allies by 2 upkeep each, not the same ally twice.
      Actual: pass

- [ ] Step 22. Revert the temporary `RunManager.CalculateTotalUpkeep` diagnostic log loops.
      Expected: No temporary `Debug.Log` upkeep probes remain in `RunManager.cs`.
      Actual: pass

---

## Observable invariants

- [ ] Inv 1. Every non-empty shop offer has exactly one tier source: `ShopOffer.Tier`; it is not inferred from party state.

- [ ] Inv 2. Silver direct-hire always costs exactly 3g more than the same hero's Bronze direct-hire cost.

- [ ] Inv 3. Silver-owned heroes are excluded from both Bronze and Silver offer pools.

- [ ] Inv 4. Duplicate merge never consumes a formation slot and never creates a second instance of the same hero.

- [ ] Inv 5. Payroll temporary stat changes are gone after combat, but Silver baseline bonuses remain visible in the next Shop/Formation phase.

- [ ] Inv 6. All Silver bonus numbers come from `GameRules`; no observed Silver value should require changing logic files to tune later.

---

## Regression checks

- [ ] Step 23. M9.1 duplicate merge path protected by `ShopManager.Hire`: repeat Scenario B Steps 7-8.
      Expected: Bronze duplicate still merges in-place to Silver with no party growth.
      Actual: pass

- [ ] Step 24. M9.1 HP-restore fix protected by `CombatManager.FinishResult`: lose or finish any combat with damaged/dead heroes, then return to Shop.
      Expected: Party panel shows each hero at full tier-adjusted HP, not stale 0 HP.
      Actual: pass

- [ ] Step 25. Run-flow state protected by `RunManager.ApplyPostCombatResult` and `AdvanceRound`: play one complete round through Scout -> Shop -> Payroll -> Formation -> Combat -> Reward -> Upkeep -> Rival Update -> next Scout/Shop.
      Expected: The next round still routes through the normal loop and does not skip Shop, Payroll, or Formation.
      Actual: pass

- [ ] Step 26. Payroll reset protected by `PayrollManager.RevertPerCombatHeroStats`: use Cut Wages or Promise Victory Bonus with a Silver stat hero.
      Expected: Temporary payroll attack/upkeep changes affect only that fight/upkeep cycle; the next round shows the Silver baseline, not Bronze baseline and not the temporary value.
      Actual: pass
