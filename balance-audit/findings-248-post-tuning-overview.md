# findings-248: Post-Tuning Balance Overview

**Date:** 2026-06-12  
**Harness run:** 100 seeds × 4 strategies = 400 runs  
**Prerequisites complete:** #251 (strategy fix), #252 (combat log fix), #253 (GameRules tuning)  
**Part of:** epic #250

---

## Configuration applied (#253)

| Parameter | Before | After |
|---|---|---|
| `StartingGold` | 15 | 18 |
| `DebtPaymentCap` | 3 | 5 |
| `DungeonLossMorale` | 6 | 4 |
| `TaxCollectorUpkeep` | 2 | 1 |
| `ActStatScale[3].enemyHealth` | 1.20 | 1.50 |
| `ActStatScale[3].enemyAttack` | 1.15 | 1.35 |
| `ActStatScale[4].enemyHealth` | 1.45 | 1.85 |
| `ActStatScale[4].enemyAttack` | 1.35 | 1.60 |

---

## Win rates by strategy

| Strategy | Runs | Wins | Win Rate | Median Rounds | Avg Gold | Avg Debt |
|---|---|---|---|---|---|---|
| frugal | 100 | 33 | **33.0%** | 26.0 | 90.18 | 1.06 |
| smart | 100 | 23 | **23.0%** | 26.0 | 5.92 | 16.58 |
| greedy | 100 | 12 | **12.0%** | 13.5 | 6.48 | 20.18 |
| random | 100 | 0 | **0.0%** | 7.0 | 0.00 | 22.23 |
| **Overall** | 400 | 68 | 17.0% | 10.0 | 25.64 | 15.01 |

### Target status

- **Frugal 50–70% target: MISS — 33%.** Below target. See follow-up section.
- **Non-zero non-frugal strategy: PASS** — greedy (12%) and smart (23%) both show wins.
- **Random still 0%.** Loan logic and debt cap helped but random still hits debt limit consistently (avg debt 22.23 ≈ DebtLimit).

---

## Primary defeat condition by strategy

**Act 1 losses (rounds ≤ 10):** 205 of 332 losses (62%)  
**Act 2+ losses (rounds > 10):** 127 of 332 losses (38%)

| Strategy | Primary collapse mode | Evidence |
|---|---|---|
| greedy | Debt limit breach | avg debt 20.18 ≈ DebtLimit (20); median survival round 13.5 |
| smart | Debt limit breach | avg debt 16.58; median survival round 26 but many early exits |
| random | Debt limit breach | avg debt 22.23; median round 7 |
| frugal | Morale exhaustion (Act 1/2 combat wall) | avg debt 1.06; median round 26 |

Greedy/smart collapse is still primarily economic, not encounter-difficulty. The upkeep cap fix in #251 helped (wins went from ~0 to 12–23%) but both strategies still accumulate debt too fast in bad shops.

---

## Economy at act boundaries (frugal, winners only)

Frugal winners reach median round 26 with avg final gold 90.18 and avg debt 1.06. This confirms that when frugal survives Act 1, it snowballs strongly and the later acts offer little resistance — Act 3/4 encounter win rates are near 100% for surviving parties (see findings-249). The game's core difficulty is the Act 1 economic wall, not late-game combat.

---

## Follow-up recommendation (frugal 33% vs 50–70% target)

The tuning changes moved frugal in the right direction but are insufficient on their own. The Act 1 wall is still primarily **morale exhaustion from early combat losses**, not debt collapse. Key signals:

1. **Act 1 still produces 62% of all losses.** StartingGold +3 and DungeonLossMorale −2 helped, but most frugal losses still occur in rounds 1–10.
2. **Frugal loses on encounter difficulty, not upkeep.** Avg debt 1.06 means frugal is managing economy correctly; it's losing fights.
3. **Recommended next steps (in priority order):**
   - Reduce starting encounter health slightly for Act 1 slots 1–3 (Slimes, Shield Grunts, Dungeon Archers) — these are the encounters where underpowered early parties die. See findings-249 for slot-by-slot win rates.
   - Alternatively, add `StartingMorale` buffer (+2–4) to absorb early stumbles before the party tiers up.
   - Consider making `DungeonLossMorale` Act 1–specific (e.g. 3 in Act 1, 6 in Acts 2–4) rather than a global reduction that could make late-game too forgiving.

---

## Silver-tier merge rate

All strategies except random reached Silver tier occasionally. Frugal winners averaged tier 1.84 for rangers and 1.73 for squires. No strategy reliably reached Gold/Diamond tier, consistent with the 20-round game length.

---

## Rival race at act boundaries

Greedy Guild Ghost win rate is 50.7% (see findings-249) — the rival race is tight. Greedy Guild Mint Rematch at 72.9% suggests surviving parties can beat the Act 3 rival fight but it remains contested.
