# findings-284: Post-Scaling Balance Validation

**Date:** 2026-06-13
**Harness run:** `web/balance-reports/run-20260613-141028.md`
**Baseline compared:** `web/balance-reports/run-20260613-134057.md` from `#279`, before the `#280` and `#281` composition pass
**Configuration:** 100 seeds x 4 strategies, difficulty 0, post-#273 scaling and post-#274 composition tuning
**Part of:** epic #275

## Summary

The `#273` scaling and `#274` composition passes improved late-game encounter texture but did not fully solve late-game challenge. Acts 2-4 now last longer and cost more heroes than the pre-composition baseline, but most late normal and boss encounters still flag as low challenge against the new target bands.

Act 1 remained acceptable. Its aggregate combat profile did not drift, no Act 1 encounter flags high challenge, and the main teaching/rival/boss encounters remain inside target bands.

Overall run win rate stayed roughly flat: 54/400 wins (13.5%) after the composition pass vs. 56/400 wins (14.0%) before it. The main remaining failure mode is still economy/debt collapse before or during Act 2, while parties that reach Acts 3-4 remain very strong.

## Run-level results

| Strategy | Wins before | Wins after | After win rate | Median round after | Avg debt after |
|---|---:|---:|---:|---:|---:|
| greedy | 10 | 13 | 13.0% | 13.5 | 18.90 |
| frugal | 28 | 24 | 24.0% | 16.0 | 1.06 |
| smart | 18 | 17 | 17.0% | 20.0 | 17.29 |
| random | 0 | 0 | 0.0% | 7.0 | 22.22 |
| **Overall** | 56 | 54 | 13.5% | 10.0 | 14.87 |

Loss split after tuning:

- Act 1 losses: 205
- Act 2+ losses: 141

This is effectively unchanged from the pre-composition baseline (205 Act 1 losses, 139 Act 2+ losses). Late-game composition tuning made late fights harsher for reaching parties, but it did not materially change who reaches those fights.

## Act-level combat profile

| Act | Win rate before | Win rate after | Avg rounds before | Avg rounds after | Avg heroes lost before | Avg heroes lost after |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 79.7% | 79.7% | 5.32 | 5.32 | 0.84 | 0.84 |
| 2 | 96.1% | 92.4% | 4.37 | 5.36 | 0.56 | 0.83 |
| 3 | 92.9% | 91.5% | 4.33 | 5.18 | 0.63 | 0.87 |
| 4 | 94.3% | 93.4% | 4.04 | 5.19 | 0.57 | 0.94 |

The clearest improvement is not raw win rate; it is fight duration and attrition. Act 2-4 average rounds increased by roughly 0.85-1.15 rounds, and average heroes lost increased in every late act. That means the composition pass is doing real work, especially by adding guards/supports that buy time for encounter mechanics.

## Target-band flags

Post-#275 report flags:

| Act | Encounters | Low challenge | High challenge | On target | Low sample |
|---|---:|---:|---:|---:|---:|
| 1 | 19 | 6 | 0 | 13 | 0 |
| 2 | 14 | 13 | 0 | 1 | 0 |
| 3 | 14 | 12 | 0 | 2 | 0 |
| 4 | 14 | 13 | 0 | 1 | 0 |

Interpretation:

- Act 1 impact is visible and acceptable: 13/19 encounters are on target, and the remaining flags are low-challenge, not punishing.
- Acts 2-4 improved in duration and attrition but are still mostly below challenge targets.
- No encounter in any act flags high challenge, so the current issue is under-pressure rather than overtuning.

## Key encounter deltas

| Encounter | Before | After | Read |
|---|---:|---:|---|
| Act 2 Greedy Guild Rematch | 96.4%, 4.74 rounds, 0.65 lost | 87.7%, 5.26 rounds, 1.06 lost | Improved, but still low challenge by late-rival target. |
| Act 2 Hoard Fiend | 100.0%, 3.62 rounds, 0.10 lost | 100.0%, 5.44 rounds, 0.47 lost | More durable, still too easy. |
| Act 2 Brimstone Brute | 95.6%, 4.68 rounds, 0.82 lost | 89.8%, 6.01 rounds, 1.12 lost | Meaningfully improved, still slightly above late-slot win target. |
| Act 2 Infernal Auditor | 100.0%, 3.83 rounds, 0.46 lost | 96.9%, 5.53 rounds, 0.81 lost | Boss team survives longer, still below boss-pressure target. |
| Act 3 Frugal Guild Mint Rematch | 99.2%, 5.28 rounds, 0.50 lost | 86.2%, 6.58 rounds, 1.35 lost | Strong improvement, still just above late-rival win target. |
| Act 3 Mint Infernal Auditor | 100.0%, 2.87 rounds, 0.03 lost | 100.0%, 4.71 rounds, 0.40 lost | Better texture, debt-scaling root issue remains. |
| Act 3 Mint Soul Broker | 100.0%, 3.50 rounds, 0.06 lost | 100.0%, 5.07 rounds, 0.45 lost | More time in combat, still free by win rate. |
| Act 3 MintMaster | 100.0%, 3.52 rounds, 0.32 lost | 98.8%, 5.30 rounds, 0.57 lost | Boss survives longer, still low challenge. |
| Act 4 Frugal Guild Vault Rematch | 100.0%, 4.77 rounds, 0.30 lost | 80.3%, 6.67 rounds, 1.71 lost | Largest success; nearly target but still barely high by win rate. |
| Act 4 Vault Auditor | 100.0%, 2.87 rounds, 0.00 lost | 100.0%, 4.56 rounds, 0.11 lost | Texture improved, challenge still absent. |
| Act 4 Ledger Broker | 100.0%, 2.97 rounds, 0.00 lost | 100.0%, 4.93 rounds, 0.17 lost | Texture improved, challenge still absent. |
| Act 4 Vault Warlord's Guard | 100.0%, 6.00 rounds, 0.67 lost | 97.0%, 6.85 rounds, 1.18 lost | Improved attrition, still low by win rate. |
| Act 4 Vault Brute | 100.0%, 4.16 rounds, 0.55 lost | 98.4%, 6.23 rounds, 1.36 lost | Improved attrition, still low by win rate. |
| Act 4 The Banker King | 100.0%, 3.70 rounds, 0.39 lost | 100.0%, 5.91 rounds, 0.93 lost | Boss now lasts long enough to read, but still never wins. |

## Recommendations

1. Keep Act 1 stable. It is visible in the new report and did not become too punishing.
2. Treat the `#274` composition work as a partial success, not the final late-game answer. It improved rounds and hero losses, but target flags show Acts 2-4 remain under-pressure.
3. Focus the next tuning pass on late normal and boss encounters that still show 100% or near-100% win rates after gaining support pieces: Hoard Fiend, Mint Soul Broker, Vault Auditor, Ledger Broker, MintMaster, and The Banker King.
4. Debt-scaling encounters still need a separate economy/debt-pressure design decision. Composition helps them survive longer, but low-debt successful parties continue to neutralize the core mechanic.
5. Watch Act 4 Greedy Guild Vault Rematch separately. Its win rate rose from 82.7% to 95.4% despite longer fights, likely due to survivor-selection effects and the changed late-act encounter path.

## Verification

- `npm.cmd run test:balance -- --seeds=100 --strategy=all --report`
- Determinism check: PASS
- `npm.cmd run test:headless`
