# findings-279: Late-Game Team Composition Pressure

**Date:** 2026-06-13
**Harness run:** `web/balance-reports/run-20260613-134057.md`
**Configuration:** 100 seeds x 4 strategies, difficulty 0, post-#273 encounter scaling
**Part of:** epic #274

## Summary

The post-#273 baseline confirms that late-game pressure is still mostly absent from normal dungeon and boss encounters. The fresh harness run produced 56 wins out of 400 strategy-runs, but that low overall win rate is driven by Act 1 and economy/debt collapse. Runs that reach Acts 3-4 beat nearly every normal and boss encounter.

Composition is the right next lever for several encounters because the weak spots are not just low scaled stats: many late fights are too small, too single-threat, or lack support pieces that force target-priority decisions.

## Highest-priority normal encounter candidates

| Priority | Encounter | Latest signal | Candidate type | Recommendation |
|---|---|---:|---|---|
| 1 | Act 2 Brimstone Brute | 95.6% win rate, 4.67 avg rounds | Composition | Add a support or guard piece so the brute is not a lone stat check with filler imps. |
| 2 | Act 2 Hoard Fiend | 100.0% win rate, 3.63 avg rounds | Composition | Add protection or a second economy-drain body so reward pressure can survive beyond the opening attacks. |
| 3 | Act 3 Mint Infernal Auditor | 100.0% win rate, 2.87 avg rounds | Stat/economy + composition | Debt scaling is inert when player debt is zero, so add support pressure while leaving debt-system changes to a future issue. |
| 4 | Act 3 Mint Soul Broker | 100.0% win rate, 3.50 avg rounds | Composition | Add a guarding front line or second broker-style target; current two-unit layout folds too quickly. |
| 5 | Act 4 Vault Auditor | 100.0% win rate, 2.87 avg rounds | Stat/economy + composition | Same debt-scaling issue as the Mint Auditor; composition can make it less trivial without new debt systems. |
| 6 | Act 4 Ledger Broker | 100.0% win rate, 2.97 avg rounds | Composition | Add a front-line protector or second reward-pressure target. |
| 7 | Act 4 Vault Brute | 100.0% win rate, 4.16 avg rounds | Composition | Add a backline/status piece so the heavy unit has a coherent team instead of acting as a solo checkpoint. |
| 8 | Act 4 Vault Warlord's Guard | 100.0% win rate, 6.00 avg rounds | Composition | It lasts longer than most Vault fights, but still never wins; add late-act support pressure rather than pure stat inflation. |

## Rival encounter candidates

| Priority | Encounter | Latest signal | Recommendation |
|---|---|---:|---|
| 1 | Act 4 Frugal Guild Vault Rematch | 100.0% win rate | Replace the generic Vault-creature lineup with a real sustain rival shell. |
| 2 | Act 3 Frugal Guild Mint Rematch | 99.2% win rate | Add a healer/guard identity so the rematch tests sustain instead of generic bodies. |
| 3 | Act 2 Greedy Guild Rematch | 96.4% win rate | Add carry protection or a backline threat; current three-body lineup is not keeping pace. |
| 4 | Act 4 Greedy Guild Vault Rematch | 82.7% win rate | Lower priority than Frugal, but can use a support piece if #281 needs a broader rival pass. |

The Carry guild is already doing its job: Act 3 Carry Guild Mint Rematch is 60.0%, and Act 4 Carry Guild Vault Rematch is 52.5%. Those should be left mostly intact during this epic to avoid overcorrecting the hardest late rival lane.

## Boss encounter candidates

| Priority | Encounter | Latest signal | Recommendation |
|---|---|---:|---|
| 1 | Act 4 The Banker King | 100.0% win rate, 3.70 avg rounds | Add support bodies that make the debt-judgment boss feel like a final encounter even when player debt is low. |
| 2 | Act 3 MintMaster | 100.0% win rate, 3.52 avg rounds | Add guard/support pieces so the periodic damage boss survives long enough to matter. |
| 3 | Act 2 Infernal Auditor | 100.0% win rate, 3.83 avg rounds | Add flanking support, matching the Act 1 Dungeon Auditor's readable boss-party structure. |

All three later bosses are single-enemy encounters today. That is the clearest composition miss in the epic: the boss mechanics exist, but the teams do not buy enough time for those mechanics to matter.

## Stat-scaling vs composition candidates

Composition-first candidates:

- Brimstone Brute
- Hoard Fiend
- Mint Soul Broker
- Ledger Broker
- Vault Brute
- Vault Warlord's Guard
- Frugal Guild Mint/Vault rematches
- Greedy Guild Act 2 rematch
- Infernal Auditor, MintMaster, and Banker King boss teams

Stat/economy candidates where composition can help but cannot fully solve the root cause:

- Debt Wraith
- Mint Infernal Auditor
- Vault Auditor
- Banker King debt judgment

The debt-scaling enemies underperform because strong strategies reach them with little or no debt. This epic should not add new debt systems, mandatory debt events, or anti-snowball logic. It can make those fights less empty by pairing the debt-scaling unit with support or protection.

## Recommended issue order

1. `#280` - Tune normal Act 2-4 encounter compositions first. This addresses the largest number of high-win-rate fights and gives the harness a cleaner read on baseline late-dungeon pressure.
2. `#281` - Tune boss and rival support compositions second. Boss/rival fights are higher-impact but easier to overtune, so they should build on the normal encounter pass.

## Non-goals for this epic

- Do not increase `ActStatScale` again.
- Do not add new enemies, statuses, combat effects, encounter effects, or debt events.
- Do not change the shop, payroll, rival race, or economy systems.
- Do not tune Act 1; the epic goal is Acts 2-4 pressure without tanking Act 1.
