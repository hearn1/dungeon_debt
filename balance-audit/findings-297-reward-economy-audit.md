# findings-297: Reward Economy Audit After Scaling

**Date:** 2026-06-13
**Harness run:** `web/balance-reports/run-20260613-185511.md`
**Economy TSV:** `web/balance-reports/economy-20260613-185511.tsv`
**Configuration:** 100 seeds x 4 strategies, difficulty 0, post-#286 reward curve, post-#287 reward-quality scaling
**Part of:** epic #288

## Summary

Later encounters are now visibly better rewarded, but the matching sink pressure is not strong enough for parties that survive Act 1. The new economy report shows gold compounding sharply across acts while debt and interest trend down toward zero.

The current economy still kills weak or random runs, so the prototype is not globally too easy. The problem is split: Act 1 remains the main filter, while successful Act 2+ parties snowball into very large gold reserves. That means the next implementation slice should tune late shop sinks first, then reassess debt-facing encounter pressure.

## Run-level results

| Strategy | Wins | Win rate | Median round | Avg final gold | Avg final debt |
|---|---:|---:|---:|---:|---:|
| greedy | 36/100 | 36.0% | 28.5 | 118.84 | 8.23 |
| frugal | 30/100 | 30.0% | 16.0 | 181.89 | 0.96 |
| smart | 36/100 | 36.0% | 34.5 | 119.97 | 6.38 |
| random | 5/100 | 5.0% | 7.0 | 3.38 | 21.43 |
| **Overall** | 107/400 | 26.8% | 13.0 | 106.02 | 9.25 |

Loss split:

- Act 1 losses: 188
- Act 2+ losses: 105

Interpretation: Act 1 is still the main economy/combat gate. Runs that get past it increasingly accumulate surplus.

## Economy pressure by act

| Act | Avg gold before shop | Avg gold after shop | Avg shop gold delta | Avg debt paid | Debt payment rate | Avg debt after shop |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 10.08 | 7.22 | -2.86 | 0.13 | 4.4% | 1.62 |
| 2 | 39.60 | 38.40 | -1.20 | 0.09 | 3.4% | 0.69 |
| 3 | 112.06 | 111.53 | -0.53 | 0.13 | 5.7% | 0.24 |
| 4 | 228.41 | 227.98 | -0.43 | 0.11 | 4.0% | 0.07 |

Shop spending pressure collapses in later acts. By Act 4, average shop visits spend less than half a gold net despite entering shop with 228 gold on average. Reroll use is also low in the harness, so the current report likely understates how much a human player could convert surplus into premium offers.

## Reward and debt settlement

| Act | Avg reward | Avg contract reward | Avg gold after settlement | Avg debt before combat | Avg debt after settlement | Avg upkeep | Avg upkeep shortfall | Avg interest to debt |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 8.54 | 8.21 | 9.50 | 1.93 | 2.70 | 6.76 | 0.27 | 0.47 |
| 2 | 13.63 | 12.69 | 44.31 | 0.74 | 0.93 | 8.17 | 0.04 | 0.10 |
| 3 | 17.13 | 15.95 | 120.40 | 0.27 | 0.39 | 8.79 | 0.00 | 0.01 |
| 4 | 20.89 | 19.41 | 240.31 | 0.11 | 0.22 | 9.18 | 0.00 | 0.00 |

Rewards scale successfully: average realized rewards rise from 8.54 in Act 1 to 20.89 in Act 4. Upkeep does not keep pace, rising only from 6.76 to 9.18. Debt pressure fades alongside that surplus: average interest added to debt drops from 0.47 in Act 1 to 0.00 in Act 4.

## Act-boundary economy

| Act | Start samples | Avg start gold | Avg start debt | End samples | Avg end gold | Avg end debt |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 400 | 18.00 | 0.00 | 260 | 19.18 | 2.99 |
| 2 | 212 | 22.23 | 1.26 | 169 | 77.08 | 0.46 |
| 3 | 163 | 78.82 | 0.34 | 137 | 175.01 | 0.17 |
| 4 | 137 | 175.01 | 0.17 | 108 | 322.92 | 0.09 |

This is the clearest sink-pressure failure. Runs reaching Act 4 start with 175 gold on average and end with 323 gold on average. Debt is almost gone by then.

## Challenge context

The same report still flags most late encounters as low challenge:

| Act | Low challenge | On target | High challenge |
|---|---:|---:|---:|
| 1 | 7 | 12 | 0 |
| 2 | 13 | 1 | 0 |
| 3 | 12 | 2 | 0 |
| 4 | 13 | 1 | 0 |

This matters for economy tuning: shop/debt sinks should be tuned together with late encounter pressure. If late fights remain too easy, more rewards will still become surplus even with moderate shop scaling.

## Recommendations

1. Implement act-aware reroll and premium-tier surcharges before changing debt math.

   The report shows late shop spend is the biggest mismatch. Start with the `#295` candidate curve: reroll 2/3/4/5 by act and +0/+1/+2/+3 premium-tier surcharge by act. Keep Bronze hire costs flat.

2. Leave `DebtPaymentCap` at 5 for the first tuning pass.

   Debt is already near zero in late acts, but not because Pay Debt is too generous per click. It is because successful parties are carrying enough surplus to pay debt whenever it appears. Bigger shop sinks should be tested before making repayment harder.

3. Add named debt-pressure constants only after shop sink tuning.

   If debt still vanishes after shop scaling, tune debt-facing encounters: Debt Wraith, MintMaster Overmint, and Banker King Debt Judgment. Avoid global interest or debt-limit changes until those localized levers are tested.

4. Keep Act 1 stable.

   Act 1 still produces most losses and still carries the clearest debt pressure. Late-act sink changes should preserve Act 1 baseline costs and reward math.

5. Keep the new economy report sections.

   The added `Economy Pressure Summary`, `Reward / Debt Settlement Summary`, and `Act Boundary Economy` sections directly expose whether future tuning keeps rewards exciting without deleting debt pressure.

## Verification

- `npm.cmd run test:headless` - PASS
- `npm.cmd run test:balance -- --seeds=3 --strategy=all --report` - PASS, determinism check PASS
- `npm.cmd run test:balance -- --seeds=100 --strategy=all --report` - PASS, determinism check PASS
