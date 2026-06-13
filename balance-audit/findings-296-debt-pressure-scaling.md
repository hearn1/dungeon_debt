# findings-296: Debt Payment and Debt Pressure Scaling Review

**Date:** 2026-06-13
**Harness run:** Not applicable; static review of current debt systems against the post-#286 reward curve
**Configuration:** post-#286 reward curve and post-#287 reward-quality scaling
**Part of:** epic #288

## Summary

Debt pressure should stay player-controlled. The current Shop Pay Debt action already protects that: late rewards do not automatically erase debt because repayment is capped by `GameRules.DebtPaymentCap` and requires an explicit shop action. The bigger late-game risk is not the repayment cap itself; it is that debt-facing enemies and reports do not yet make late-act debt pressure visible enough to tune confidently.

The first implementation pass should avoid automatic repayment, avoid act-scaled debt limits, and avoid a harsher global interest curve. Instead, keep the base debt contract stable and add small helper surfaces for debt-facing encounter pressure if audit data shows late debt is too easy to ignore.

## Current debt surface

| Surface | Current source | Current behavior | Scaling read |
|---|---|---|---|
| Debt payment cap | `GameRules.DebtPaymentCap` + `GameRulesFns.calculateDebtPaymentAmount` | Pay up to 5 gold in Shop | Keep flat initially; it preserves agency and prevents one large late payout from wiping debt instantly. |
| Interest | `RunManager.applyPostCombatResult` + `run.interestDivisor` | `ceil(debt / interestDivisor)`, baseline divisor 3 | Keep baseline flat; global harsher interest can create surprise collapses. |
| Debt limit | `run.debtLimit`, baseline `GameRules.DebtLimit` | Defeat at 20 debt | Keep flat on Level 0; act-scaling the limit would either erase pressure or feel unfair. |
| Payroll loan | `PayrollManager.apply` | +5 gold, +6 debt | Keep flat; it remains a risky emergency lever. |
| Promise Victory Bonus | `PayrollManager.applyPostCombat` | Win pays 3 gold, unpaid becomes debt; loss adds 5 debt | Keep flat until shop sinks are tuned. |
| Cut Wages | `RunManager.calculateTotalUpkeep` | Saves up to 3 upkeep for -1 attack | Keep flat; it is the main non-debt recovery action. |
| Debt Wraith line | `HeroEffects.onCombatStart` + `GameRules.DebtWraithDebtDivisor` | Attack = `1 + floor(debt / 3)` before damage modifiers | Candidate for act-aware pressure if late debt is too safe. |
| MintMaster Overmint | `RunManager.calculateTotalUpkeep` + `GameRules.MintDebtDivisor` | Extra upkeep = `floor(debt / 5)`, capped at 6 | Candidate for act-aware cap/divisor only if Act 3-4 debt remains toothless. |
| Banker King Debt Judgment | `HeroEffects.onCombatStart` | +1 attack per 10 debt, capped at +4 | Candidate for named constants and possible stronger late-act pressure. |

## Recommendations

1. Keep Pay Debt explicit and capped.

   Do not add automatic surplus repayment. Do not raise `DebtPaymentCap` in the first pass. The current cap of 5 means a player with 20 debt needs four shop visits to clear principal, even if late rewards are high.

2. Do not scale the Level 0 debt limit by act.

   A rising debt limit would make debt safer exactly when the epic wants it to stay relevant. A falling debt limit would create late-run surprise defeats. Leave `GameRules.DebtLimit` at 20 and keep difficulty mutators as the place for lower limits.

3. Keep baseline interest at divisor 3 unless audit data shows late winning runs sit at high gold and low debt.

   If a future implementation needs more pressure, prefer a named helper over inline math:

   - `GameRules.DebtInterestActSurcharge`
   - `GameRulesFns.getInterestCharged(debt, interestDivisor, act)`

   First-pass candidate if needed: +0 interest in Acts 1-2, +1 minimum extra interest only when debt is already `Dangerous` in Acts 3-4. This keeps low debt recoverable and avoids punishing players for carrying tiny principal.

4. Prefer debt-facing encounter pressure over global debt pressure.

   The cleanest future levers are encounter-local and already fit the design:

   - `GameRules.DebtWraithActAttackBonus`
   - `GameRules.MintOvermintActCapBonus`
   - `GameRules.BankerKingDebtJudgmentDivisor`
   - `GameRules.BankerKingDebtJudgmentCap`
   - `GameRulesFns.getDebtPressureAttackBonus(debt, act)`
   - `GameRulesFns.getDebtPressureUpkeepBonus(debt, act)`

   First-pass candidate values:

   | Act | Debt Wraith extra attack | Overmint cap bonus | Banker divisor |
   |---|---:|---:|---:|
   | 1 | +0 | +0 | n/a |
   | 2 | +0 | +0 | n/a |
   | 3 | +1 at Dangerous debt | +1 | n/a |
   | 4 | +2 at Dangerous debt | +2 | 8 instead of 10 |

5. Keep payroll action debt amounts flat until shop sinks are tested.

   `TakeLoan` and `PromiseVictoryBonus` are player-facing contracts. Scaling them by act would be harder to explain than scaling shop prices or debt-specific enemies. Revisit only if audit reports show players spam loans in late acts with no collapse risk.

## Proposed acceptance test names for a future implementation slice

- `debt-pressure: Pay Debt cap remains explicit and non-automatic`
- `debt-pressure: baseline debt limit remains unchanged on Level 0`
- `debt-pressure: interest helper preserves Act 1 baseline`
- `debt-pressure: Debt Wraith act pressure applies only at dangerous debt`
- `debt-pressure: Banker King uses named debt judgment constants`

## Scope note

This subissue is recommendation-only. No gameplay constants, debt math, payroll behavior, or combat behavior changed in this slice.
