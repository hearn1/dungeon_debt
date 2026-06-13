# findings-295: Shop Price and Reroll Scaling Review

**Date:** 2026-06-13
**Harness run:** Not applicable; static review of current economy constants and reward curve
**Configuration:** post-#286 reward curve and post-#287 reward-quality scaling
**Part of:** epic #288

## Summary

Late-game rewards now grow from the Act 1 baseline of 8 gold to Act 4 normal rewards of 16-22 gold, with Act 4 rival and boss contracts reaching 25 and 29 gold before other bonuses. Shop costs did not scale with that curve: base hire cost remains `baseUpkeep + GameRules.HireCostBonus`, reroll remains `GameRules.RerollCost`, Silver/merge surcharge remains `GameRules.SilverHireCostBonus`, and shop events remain flat.

That is acceptable for Act 1 clarity, but later acts risk letting successful parties turn each win into several rerolls, frequent direct Silver purchases, and debt repayment without meaningful tradeoffs. The first tuning target should be reroll and premium-tier access, not Bronze hire cost.

## Current cost surface

| Surface | Current source | Current behavior | Scaling read |
|---|---|---|---|
| Bronze hire | `ShopManager._fillAllOffers` + `GameRules.HireCostBonus` | `baseUpkeep + 2` | Keep flat initially; it preserves replacement and comeback agency. |
| Silver offer / duplicate merge surcharge | `ShopManager._fillAllOffers` + `GameRules.SilverHireCostBonus` | +3 on top of base hire cost | Candidate for act-aware scaling because it is a power sink, not basic roster access. |
| Reroll | `ShopManager.reroll` + `GameRules.RerollCost` | 2 gold plus difficulty mutator | Strong candidate for act-aware scaling; late rewards buy too many rerolls at 2g. |
| Fire refund | `ShopManager.fire` + `GameRules.FireRefund` | +1 gold | Keep flat; raising refunds would add income, lowering them would punish pivots. |
| Tax Audit | `GameRules.TaxAuditGoldCost` | 5 gold or 1 morale | Candidate for mild act-aware scaling if shop events need to stay relevant. |
| Travelling Merchant goods | `GameRules.TravellingHealAllCost`, `GameRules.TravellingBlessingCost` | 3 gold each | Candidate for mild act-aware scaling; the blessing is a reward amplifier. |

## Reward curve context

| Act | Normal reward range | Late rival reward | Boss reward |
|---|---:|---:|---:|
| 1 | 8 | 11 | 15 |
| 2 | 10-14 | 17 | 21 |
| 3 | 13-18 | 21 | 25 |
| 4 | 16-22 | 25 | 29 |

The key ratio is rerolls per normal win. Act 1's 8 gold buys 4 rerolls before wages and interest. Act 4's late normal 22 gold buys 11 rerolls before wages and interest. Even after upkeep, the late-game reroll price becomes much less meaningful.

## Recommendations

1. Add a deterministic helper for act-aware shop costs before changing constants inline:

   - `GameRules.ShopRerollActSurcharge`
   - `GameRules.ShopPremiumTierActSurcharge`
   - `GameRulesFns.getShopRerollCost(runOrAct)`
   - `GameRulesFns.getShopPremiumTierSurcharge(runOrAct)`

2. Keep Act 1 exactly unchanged:

   - Act 1 reroll: 2
   - Act 1 Bronze hire: `baseUpkeep + 2`
   - Act 1 Silver/merge surcharge: +3

3. Test this first-pass cost curve:

   | Act | Reroll cost | Silver/merge extra surcharge |
   |---|---:|---:|
   | 1 | 2 | +0 |
   | 2 | 3 | +1 |
   | 3 | 4 | +2 |
   | 4 | 5 | +3 |

   This keeps the curve readable and avoids sudden spikes. It also preserves difficulty mutators by layering the act-aware helper with `run.rerollCostModifier`.

4. Do not scale Bronze hire cost until audit data proves it is needed. Basic roster replacement is a recovery valve, and increasing it risks making early losses snowball harder.

5. Consider shop event scaling only after reroll and premium-tier scaling are tested:

   - `TaxAuditGoldCost`: 5/6/7/8 by act.
   - Travelling Merchant heal/blessing: 3/4/5/6 by act.

   These should be secondary because they are intermittent and less predictable than reroll/hire costs.

## Proposed acceptance test names for a future implementation slice

- `shop-costs: Act 1 reroll remains baseline`
- `shop-costs: reroll cost increases by act and includes difficulty modifier`
- `shop-costs: Silver offers include act surcharge`
- `shop-costs: duplicate merge includes act surcharge`
- `shop-costs: Bronze hire cost remains unchanged`

## Scope note

This subissue is recommendation-only. No gameplay constants or shop behavior changed in this slice.
