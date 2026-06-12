# Findings: Act 1 Difficulty Wall (#244)

Part of epic #242 — Balance audit.

## Data Reliability

**Prerequisite not fully met.** The strategy audit (#243) confirmed that greedy, smart, and random all die from economic collapse, not encounter difficulty. Their Act 1 deaths inflate the 77.8% Act 1 loss rate to an unreliable figure.

However, `frugal` alone provides a meaningful sample:
- 100 frugal runs, 42 wins (42% win rate), 58 losses
- All frugal losses occur in Act 1 (rounds 1–10), since frugal runs that survive Act 1 win with high regularity (Acts 3–4 survival ≥ 86%)
- **Corrected Act 1 frugal survival: ~42%** — still below the 50–70% target

This audit is based on the frugal sample. A post-strategy-fix harness re-run will give a multi-strategy baseline.

## Primary Causes of Act 1 Lethality

### 1. Starting economy is tight relative to upkeep ramp

Starting gold: 15. Cheapest hero hire cost: 3 (Squire/Apprentice). Frugal's upkeep ceiling: `WinReward` (8 gold). A typical frugal party of 3 heroes carrying ≈ 6–7 total upkeep is sustainable on wins but fragile on losses:

- Win reward: 8 gold. After upkeep (7): +1 net.
- Loss reward: 4 gold. After upkeep (7): −3 net → debt += 3.
- Interest: `ceil(debt / interestDivisor)` = `ceil(debt / 3)`. Even 3 debt costs 1 gold/round in interest.

Two consecutive losses in rounds 1–4 can push a frugal run into debt that compounds faster than wins can clear. Morale also takes `DungeonLossMorale` (6) per combat loss. With starting morale 30 and 5 losses possible before reaching 0, Act 1 provides exactly 5 loss budget.

### 2. Combat win requirement is binary with no recovery path

Once heroes take damage in a losing combat, `CombatManager._finishResult` resets `currentHealth` to full for the next round. So hero health is not a persistent resource. The persistent damage is purely economic (reward shortfall → debt) and morale (−6 per loss). There is no mechanic to recover morale mid-Act, and no gold source between rounds other than combat rewards and relics.

### 3. Early RNG variance in encounter slot selection amplifies luck

Act 1 slot 1 pool: Slimes (3 × weak), Shield Grunts (2 × Guarded). Shield Grunts require two hits each to break Guarded + kill, which is harder on a small party. A frugal run that draws Shield Grunts at slot 1, Dungeon Archers at slot 2, and Tax Collector at slot 4 is under continuous pressure before it can stabilize.

### 4. Which encounters are most lethal (from the single-run combat log)

The single-run combat log (#247 confirms this is not an aggregate) cannot be used. However, from first principles and encounter design:

- **Tax Collector** (slot 4): increases upkeep by 2 this round (`EncounterEffectId.TaxCollectorUpkeep`). Against a frugal party already at the upkeep ceiling, this triggers a shortfall on any outcome.
- **Dungeon Archers** (slot 2): two ranged units applying Burned stacks. A party with one frontline hero may not reach them before Burned accumulates.
- **Debt Wraith** (slot 7): gains attack equal to current debt. By round 7, a debt-carrying run faces a significantly stronger enemy.
- **Dungeon Auditor** (slot 10, final boss): `EncounterEffectId.FinalBossDamage` deals direct party damage per round, adding consistent attrition pressure on top of combat.

### 5. No economy data to assess per-round gold trajectory

The combat log reset bug (#247) means per-round economy data is unavailable. Re-running after the fix is needed.

## Recommendations

These are tuning proposals only. No changes made in this issue.

| # | Recommendation | Estimated difficulty | Rationale |
|---|---|---|---|
| 1 | Increase `StartingGold` from 15 to 18 | Low | Gives frugal-style players one more affordable hire before round 1 combat, reducing the RNG pressure of slot 1 draw |
| 2 | Reduce `DungeonLossMorale` from 6 to 4 in Act 1 only | Medium | 5-loss budget → 7-loss budget. Morale is currently the secondary kill condition behind debt; softening it in Act 1 lets runs recover from early stumbles |
| 3 | Reduce Slime health from 4 to 3 and Shield Grunt health by 1 | Low | Slot 1 encounters would resolve faster, reducing upkeep-lost-round pressure on small starting parties |
| 4 | Remove Tax Collector from Act 1 slot 4 pool, or cap its upkeep increase at 1 | Medium | Tax Collector at slot 4 fires before the player can establish a debt buffer, disproportionately punishing small parties |
| 5 | Add `DebtPaymentCap` relief: allow paying up to 5 gold of debt per shop visit instead of 3 | Low | Frugal's `payDebt()` call is capped at `GameRules.DebtPaymentCap` (3). Raising this to 5 lets a winning run clear debt faster in Act 1 |
| 6 | Re-run harness after strategies are fixed and re-assess with multi-strategy data | High priority | These recommendations are based on frugal alone; with corrected strategies the Act 1 survival baseline may shift meaningfully |

## Verdict

Act 1 is genuinely hard even for a working strategy (frugal 42%). The primary causes are a tight starting economy, no morale recovery, and RNG variance in the slot 1–4 encounter draws. The target range of 50–70% survival is achievable with 2–3 of the above changes, but re-running the harness after the strategy fix is the prerequisite for dialing in which ones to apply.
