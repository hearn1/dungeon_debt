# Findings: Economy Snowball — No Debt Pressure After Act 1 (#246)

Part of epic #242 — Balance audit.

## Data Reliability

Economy data is from the frugal strategy only (42 winning runs). Greedy/smart/random never reach Act 2+. This is a clean sample for frugal, but frugal's upkeep cap (≤ `WinReward`) is unusually conservative — a balanced multi-strategy re-run may show different gold accumulation curves.

Per-act economy snapshot from harness run 20260612-071314:

| Act completed | Avg gold | Avg debt | Notes |
|---|---|---|---|
| Act 1 | 18.92 | 3.99 | Frugal exits Act 1 with some debt but positive gold |
| Act 2 | 70.64 | 0.27 | Debt nearly zero; gold tripling from Act 1 |
| Act 3 | 126.84 | 0.00 | Debt eliminated; gold accumulating unchecked |
| Act 4 | 182.28 | 0.00 | 12× starting gold; economy is irrelevant |

## Why Gold Accumulates After Act 1

### 1. Win reward exceeds sustainable upkeep

Frugal's hiring rule caps total upkeep at `WinReward` (8 gold). With upkeep = 8 and win reward = 8, each combat win is gold-neutral. But in practice, frugal rarely hits exactly 8 upkeep, often running 5–7, which means each win generates 1–3 net gold. Over 30 rounds, that accumulates to 30–90 gold with no leakage.

### 2. No gold sinks exist in Acts 2–4

The shop offers three slots per round. Frugal fills its party by Act 2 and has no reason to hire more (already at MaxPartySize or upkeep ceiling). Reroll costs 2 gold — negligible, rarely triggered. Silver merges cost `hireCost + SilverHireCostBonus (3)` = 5–9 gold, but these are optional upgrades the frugal strategy does not pursue.

### 3. Debt collapses and never returns

`CutWages` reduces upkeep by `CutWagesUpkeepReduction` (3) per round, pushing upkeep well below income. Frugal's `shopManager.payDebt()` call pays up to `DebtPaymentCap` (3) gold per shop visit. Within 2–4 rounds of any debt accumulation, frugal clears it. No Act 2–4 mechanic creates new mandatory debt.

Interest (`ceil(debt / interestDivisor)`) is zero once debt is zero, so there is no compounding that re-engages economic tension.

### 4. `CutWages` attack penalty becomes free in Act 3+

`CutWages` inflicts `CutWagesAttackPenalty` (−1 attack) on all heroes. Early game this is a real trade-off. By Act 3, a Silver-tier party has enough raw attack (base + silver bonus +2 + veteran + relics) that −1 attack is imperceptible. The payroll trade-off has no bite.

## Why Debt Collapses and Does Not Return

- Frugal never takes a loan (`CutWages` every round).
- No encounter in Acts 2–4 forces debt addition except the `VictoryBonus` payroll action (which frugal never uses) and the `DebtPact` relic penalty on loss.
- Interest is the only self-propagating debt source, but it goes to zero once debt is cleared.
- `TaxCollector` (slot 4) adds 2 upkeep for one round — a small bump, not a structural debt source.

## Recommendations

**Gold accumulation causes:**

| # | Recommendation | Estimated difficulty | Rationale |
|---|---|---|---|
| 1 | Scale `WinReward` by act: `WinReward + (act − 1)` gold (8 / 9 / 10 / 11) | Low | Slightly increases income slope — not a fix on its own, but paired with upkeep scaling below creates a moving equilibrium |
| 2 | Scale upkeep by act: +1 gold per hero per round beyond Act 1 | Medium | A 5-hero party in Act 4 pays +4/round above Act 1 upkeep. This alone may recreate economic tension without new systems |
| 3 | Add Silver-merge cost pressure: merging a hero to Silver costs `SilverHireCostBonus + actSurcharge` | Medium | Makes upgrading a genuine spending decision in Acts 3–4 |

**Debt re-introduction causes:**

| # | Recommendation | Estimated difficulty | Rationale |
|---|---|---|---|
| 4 | Add a mid-act debt event in Act 3 and Act 4 (e.g. "Guild Tax: +4 debt") | High | The only way to restore debt tension without changing every economic constant; requires new encounter effect or event system |
| 5 | Increase `InterestDebtDivisor` from 3 to 2 in Acts 3–4 | Low | Interest compounds faster if debt re-appears; no effect until debt > 0, so this only matters if #4 is also implemented |
| 6 | Make `CutWages` attack penalty scale with act (−1 / −1 / −2 / −3) | Medium | Restores the payroll trade-off meaning in late acts |

**Structural note:** Recommendations 1–3 can be implemented purely in `GameRules.js`. Recommendation 4 requires new data or system work. Recommendations 5–6 are parameter changes. File a separate tuning issue after the harness is re-run with corrected strategies to confirm which levers have the largest impact.
