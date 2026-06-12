# findings-249: Post-Tuning Encounter Win Rates

**Date:** 2026-06-12  
**Harness run:** 100 seeds × 4 strategies = 400 runs  
**Combat log fix (#252) active:** yes — data aggregated across all seeds, not single-seed noise  
**Part of:** epic #250

---

## Summary

This is the first encounter win-rate report with a working aggregate combat log (fixed in #252). Prior reports in findings-247 reflected only the final seed's data. All figures below are aggregated across 100 seeds.

No encounter has 0% or 100% overall win rate when aggregated across all strategies — the game has no unwinnable or trivially free encounters at the population level.

---

## Act 1 encounter win rates (the key balance zone)

Act 1 encounters see the most traffic from all strategies including those that collapse early.

| Encounter | Combats | Win Rate | Avg Combat Rounds | Avg Heroes Lost | Flag |
|---|---|---|---|---|---|
| Slimes | 200 | 75.0% | 5.64 | 0.55 | |
| Shield Grunts | 200 | 70.5% | 5.48 | 0.86 | |
| Dungeon Archers | 236 | 90.3% | 4.97 | 0.59 | |
| Greedy Guild Ghost (round 10) | 400 | 50.7% | 5.51 | 1.75 | ⚠ contested |
| Tax Collector | 220 | 90.0% | 4.48 | 0.20 | |
| Goblin Thieves | 164 | 78.7% | 5.29 | 0.84 | |
| Dungeon Auditor | 256 | 82.4% | 6.23 | 1.09 | |

### Act 1 interpretation

- **Greedy Guild Ghost (50.7%)** is the highest-stakes Act 1 fight. This is the capstone rival fight; losing it costs morale and has economic consequences. Being close to 50% is appropriate tension but may be slightly too hard for underpowered early parties.
- **Slimes (75%) and Shield Grunts (70.5%)** are the wall identified in earlier reports. Frugal parties with 1–2 heroes in round 1 still lose these frequently. The TaxCollectorUpkeep reduction freed one gold of headroom but didn't change combat outcomes directly.
- **Dungeon Archers (90.3%)** is performing well — ranged enemies are manageable once the party has a tank.

---

## Act 2 encounter win rates

| Encounter | Combats | Win Rate | Flag |
|---|---|---|---|
| Owl Roost | 180 | 57.8% | ⚠ low |
| Champion's Guard | 162 | 75.9% | |
| Pit Brawlers | 115 | 80.9% | |
| Carry Guild Ghost | 186 | 66.1% | |
| Healing Ward | 127 | 88.2% | |
| Goblin Twin Bruisers | 146 | 98.6% | ⚠ high |
| Backline Bat | 133 | 91.7% | |
| Brigand Lieutenant | 153 | 92.8% | |
| Brimstone Brute | 162 | 98.8% | ⚠ high |

### Act 2 interpretation

- **Owl Roost (57.8%)** is the hardest Act 2 encounter. This appears appropriate — by Act 2 the player should have 3+ heroes and Act 2 should provide meaningful challenge.
- **Goblin Twin Bruisers (98.6%) and Brimstone Brute (98.8%)** are trivially easy for parties reaching Act 2. These could be strengthened in a future tuning pass.
- **Carry Guild Ghost (66.1%)** provides meaningful rival pressure in Act 2.

---

## Acts 3–4 encounter win rates (summary)

Acts 3 and 4 are a near-victory-lap for surviving parties. Nearly all Act 3/4 encounters show >95% win rates. This is partially a selection effect (only well-equipped frugal parties reach Act 3) but also indicates the new `ActStatScale` values (1.5/1.35 for Act 3, 1.85/1.60 for Act 4) still don't produce meaningful resistance for a scaled-up party.

Notable exceptions:
- **Carry Guild Mint Rematch (62.5%)** — hardest Act 3/4 encounter; appropriate.
- **Carry Guild Ghost (66.1%)** — already noted above.
- **Greedy Guild Mint Rematch (72.9%)** — meaningful but winnable.

**Recommendation:** The ActStatScale increases are a step in the right direction but Act 3/4 encounters remain too easy for parties that reach them. A further increase to Act 4 values (e.g. enemyHealth → 2.2, enemyAttack → 1.9) is worth testing in a follow-up. However, this should only be done once frugal Act 1 win rate reaches target — stacking difficulty changes makes it harder to attribute outcomes.

---

## Focus encounters (per #254 spec)

| Encounter | Win Rate | Assessment |
|---|---|---|
| Slimes | 75.0% | Acceptable; slightly hard for round-1 parties |
| Shield Grunts | 70.5% | Acceptable; primary early wall |
| Dungeon Archers | 90.3% | Good |
| Tax Collector | 90.0% | Good (upkeep reduction helped economic margin, not combat) |
| Debt Wraith | 97.2% | ⚠ high — near-free for reaching parties |
| Dungeon Auditor | 82.4% | Good |

---

## Encounters with >90% win rate (⚠ high flag)

Many encounters flag ⚠ high due to the selection effect: only surviving parties reach them. The encounters most worth reducing in a future pass are those in early/mid game:

- Goblin Twin Bruisers (Act 2, 98.6%)
- Brimstone Brute (Act 2, 98.8%)
- Debt Wraith (Act 1 capstone area, 97.2%) — may be intentionally easy as an economic encounter
- All Vault-tier encounters (Acts 3/4) — selection effect is dominant here

---

## Encounters with <70% win rate

| Encounter | Win Rate | Act | Action |
|---|---|---|---|
| Greedy Guild Ghost | 50.7% | 1 | Monitor; near-appropriate tension |
| Owl Roost | 57.8% | 2 | Monitor; hardest Act 2 encounter |
| Carry Guild Ghost | 66.1% | 2 | Acceptable rivalry pressure |
| Carry Guild Mint Rematch | 62.5% | 3 | Acceptable |
| Shield Grunts | 70.5% | 1 | Monitor; primary early wall |

No encounter is below 50% overall, so no immediate emergency fixes are needed.
