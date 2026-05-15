# TP_M9.1 — Bronze→Silver tiering foundation

Manual Unity Editor test plan for slice M9.1.

**Slice scope (recap):**

- `HeroTier` enum (Bronze, Silver) exists; `HeroInstance.Tier` defaults to Bronze.
- Duplicate-hire of an already-owned **Bronze** hero merges to **Silver** in the same slot — no new party slot, no new `HeroInstance`.
- `HeroCardView` paints the reserved tier slot per `Tier`: Bronze (`GameRules.BronzeBadgeColor`), Silver (`GameRules.SilverBadgeColor`). Definition-only Refresh paths (Shop offer, Scout) keep the M8.1 reserved-but-empty look.
- Silver-owned heroes are excluded from the offer pool; Bronze-owned heroes may re-appear (so a merge can be triggered).
- Shop offer card relabels its hire button to `Upgrade (Xg)` and shows `Merges to Silver` status when the offered hero is already owned at Bronze.

**Out of scope** (no behavior changes expected): combat math, upkeep math, hero effects, Silver shop-offer pool, `SilverHireCostBonus`, any Gold tier.

---

## Happy path

- [ ] Step 1. Press Play in the Unity Editor. Click **Start Run**, advance through Scout → Shop.
      Expected: Shop panel shows 3 offers. Each offer's hero card renders with the M8.1 reserved-but-empty tier slot (faint fill, outlined). Hire buttons say `Hire (Xg)`.
      Actual: pass

- [ ] Step 2. Hire one offer (any hero — call this hero **H**). Inspect the Party panel and Formation panel.
      Expected: Party now has H at 1/5. Hero card in Party/Formation shows H's tier slot **filled solid Bronze** (`GameRules.BronzeBadgeColor`, distinct from the faint reserved fill).
      Actual: pass

- [ ] Step 3. Click **Reroll** until one of the 3 offers is the **same hero H** that's already in your party. (If gold runs low, restart from Step 1.)
      Expected: The offer for H now renders its button as `Upgrade (Xg)`, and the status line below shows `Merges to Silver`. The other two offers still say `Hire (Xg)`.
      Actual: pass

- [ ] Step 4. Click the `Upgrade` button on H's offer.
      Expected: Gold decreases by exactly the offer's `HireCost` (= H's `BaseUpkeep + HireCostBonus`). Party count stays at 1/5 (no new slot consumed). H's hero card now shows the tier slot **filled solid Silver** (`GameRules.SilverBadgeColor`). The offer status changes to `Upgraded` and the button is no longer interactable.
      Actual: pass

- [ ] Step 5. Reroll again. Observe whether H (now Silver) ever re-appears as an offer across multiple rerolls.
      Expected: H is now excluded from the offer pool. Across many rerolls, H never appears as an offer.
      Actual: pass

- [ ] Step 6. Continue from Shop → Formation → Payroll (select Standard Pay) → Combat → Reward → Upkeep.
      Expected: Combat resolves normally. H's `Attack`, `CurrentHealth`, and `UpkeepThisRound` behave **identically** to a Bronze H of the same definition (M9.1 keeps Silver bonuses stubbed). Reward Summary and Upkeep math match pre-M9.1 behavior.
      Actual: pass

- [ ] Step 7. After combat, return to Shop for Round 2. Confirm H's card in the Party panel still shows the Silver fill.
      Expected: Tier persists across rounds. H is still Silver.
      Actual: pass

---

## Edge cases

- [ ] Step 8. (Silver-owned guard — exclusion check.) After upgrading H to Silver, perform ~20 rerolls and confirm H never appears.
      Expected: H is excluded from the pool while Silver. (Stronger version of Step 5; intentionally repeats with more samples.)
      Actual: pass

- [ ] Step 9. (Underfunded merge.) With H owned at Bronze, drop your gold below the offer's `HireCost` (spend on Rerolls until gold < cost). Trigger the offer for H to re-appear if possible. If it appears, observe the upgrade button state.
      Expected: When the player can't afford the offer, the button is disabled and the status reads `Need Xg`. (Same gating as `Hire`.) No gold is spent and H stays Bronze.
      Actual: pass

- [ ] Step 10. (Party-full + Bronze-duplicate.) Fill the party to 5/5 with 5 distinct Bronze heroes. Reroll until one of those 5 appears as an offer.
      Expected: That offer reads `Upgrade (Xg)` / `Merges to Silver` and the button is interactable (provided you can afford it). The party-full state does NOT disable the upgrade button — because merging consumes no slot. The other 2 (non-duplicate) offers in this same shop view read `Party full` and are disabled.
      Actual: pass

- [ ] Step 11. (Confirm the merge in Step 10.) Click `Upgrade` on the duplicate offer at 5/5.
      Expected: Gold decreases by `HireCost`. Party stays at 5/5 (no new hire). The merged hero's card flips to Silver. The remaining two `Party full` offers stay disabled.
      Actual: pass

- [ ] Step 12. (Definition-only Refresh paths stay reserved-but-empty.) In Scout, look at the encounter's enemy preview row and at every Shop offer's hero card.
      Expected: Shop offer hero cards always render the M8.1 reserved-but-empty tier slot (faint fill, outlined border) — they never show a Bronze or Silver fill, regardless of whether the offered hero is owned at Bronze. (Owned-vs-unowned only changes the button label, not the offer card's tier slot.) Enemy cards never have a tier slot at all (unchanged from M8.1).
      Actual: pass

- [ ] Step 13. (Fire then re-hire resets tier.) Hire any hero (creates a fresh Bronze instance). Upgrade it to Silver via a duplicate offer. Fire it. Re-hire from a new offer.
      Expected: After Fire, party shrinks by 1 and that hero's definition becomes eligible to re-appear in the pool (no longer Silver-owned). After Re-hire, the re-hired instance starts at Bronze again — its card shows the Bronze fill, not Silver.
      Actual: pass

- [ ] Step 14. (Empty / fresh-run baseline.) Start a brand-new run. Before hiring anyone, look at the Formation panel's 5 empty slots.
      Expected: Empty Formation slots still show the M8.2 empty-slot placeholder. No spurious Bronze/Silver fills on empty slots.
      Actual: pass

---

## Observable invariants

- [ ] Inv 1. Party size never grows from a merge — `runState.Party.Count` is the same before and after an `Upgrade` click. (Observable via the Party panel header `Party: N / 5`.)

- [ ] Inv 2. Every occupied hero card in Party and Formation panels has a visibly filled tier slot — either Bronze or Silver — never the faint reserved-empty look.

- [ ] Inv 3. Every Shop offer card and every Scout enemy/hero card shows the reserved-empty tier slot (Shop offers) or no tier slot (enemies). Tier fill only appears on instance-bound cards (Party panel, Formation panel).

- [ ] Inv 4. A Silver-owned hero never re-appears as a shop offer, across any number of rerolls.

- [ ] Inv 5. A hero's `Tier` is `Bronze` immediately after `Hire` for a non-duplicate offer, and `Silver` immediately after `Hire` for a duplicate of a Bronze-owned member. `Tier` never returns from Silver to Bronze except via Fire + Re-hire.

- [ ] Inv 6. Combat behavior, reward math, upkeep math, and interest math for a Silver hero match a Bronze hero of the same definition in M9.1 (bonuses stubbed). Reward Summary numbers should not shift solely because a hero is Silver.

Regression: In the shop phase, stats appear to reflect result of last combat. For example after a loss all of the HP stats say 0. When proceeding to formation state stats are reset.