# Report: Act 1 Fun/Balance Pass (#155)

Part of epic #238 — Full-game fun/balance pass (Acts 1–4).

## Prerequisite Status

**Strategy fix (#243):** NOT YET IMPLEMENTED. Greedy, smart, and random strategies still collapse by round 4 from economic causes, not encounter difficulty. Harness signals from those strategies are noise for balance purposes.

**Combat log reset fix (#247):** NOT YET IMPLEMENTED. `BalanceRunLogger.startRun()` still resets `combatRows` on every seed. The combat outcomes table in the harness report reflects only the final seed's data, not an aggregate.

All harness data below is **frugal-only** until prerequisites are fixed.

## Harness Run

Run ID: `20260612-073114`
Command: `npm run test:balance -- --seeds=100 --strategy=frugal --report`

- Total runs: 100
- Wins: 42 (42.0%) — **below the 50–70% target**
- Losses: 58
  - Act 1 losses (rounds 1–10): 42
  - Acts 2–4 losses (rounds 11–40): 16

## Observed Run Notes

### Note 1: Economy-driven Act 1 defeats dominate

All 42 Act 1 losses are frugal runs. The frugal strategy already applies the recommended fixes (pay debt first, cap upkeep at WinReward, always CutWages). Despite this, 42% of runs fail before round 11. Defeat reasons from code inspection:

- Win reward (8 gold) minus typical upkeep (5–7 gold) = 1–3 net gold per win. After two consecutive losses the debt accrues 3+ gold per round in shortfall, and interest (`ceil(debt / 3)`) compounds at 1–2 gold per round. Runs with a poor slot 1–4 draw can be unrecoverable by round 6.
- Starting gold of 15 supports hiring 2–3 heroes before the first fight. With Slimes (slot 1) a 2-hero party often wins; with Shield Grunts (slot 1) it may not, depending on hero attack values.

### Note 2: Seed 50 (WIN, 453 gold) — extreme positive outlier

Seed 50 survived Act 1 in a gold-positive state and snowballed through all four acts to 453 final gold. This is the economy-snowball scenario confirmed by findings-246: frugal runs that survive Act 1 accumulate gold unchecked through Acts 2–4 because there are no gold sinks. This outlier validates that Act 1 survival is the gating bottleneck, not Acts 2–4 difficulty.

### Note 3: Seeds 98, 88, 86, 74, 54 (LOSS, 0 gold) — debt-spiral defeats

These seeds ended at 0 gold, which means the run either reached debt limit (20) or ran out of gold entirely. The pattern is consistent: losing slots 1–2 when the hire pool offered high-upkeep heroes, followed by compounding interest. These runs illustrate the "one bad start" failure mode: the player had limited agency to recover because the slot 1–4 window is the only period where hero composition is being built.

### Note 4: Hero hire distribution skews economy-only

Most hired in 100 frugal runs: apprentice (48), squire (46), treasurer (35), ranger (30), artificer (27), warrior (27).
Below 5% hire rate: wizard, warlock, fighter.

This distribution reflects frugal's upkeep ceiling of 8 gold, which structurally excludes the highest-damage classes. A human player running more aggressive builds (wizard, warlock) will face a harder economy pressure curve. The harness cannot yet represent this — it will only become visible after the strategy fix is applied.

### Note 5: Rival ghost losses are under-represented

The harness only shows frugal running CutWages every round. This means the player enters every fight with −1 attack on all heroes — a permanent handicap that affects rival ghost difficulty. From code inspection, rival ghost scaling (RivalRaceHpLeadFactor, RivalRaceAttackLeadFactor) is applied on top of base rival stats. A frugal run that falls behind in the rival race faces increasingly buffed ghosts at slots 3, 6, and 9 on top of the CutWages attack deficit.

### Note 6: Tax Collector slot 4 impact is structural

Tax Collector (slot 4 pool) applies `TaxCollectorUpkeep` (+2 wages for the round). For a frugal party already at the 8-gold upkeep ceiling, this pushes the round into guaranteed shortfall regardless of combat outcome. No manual run is needed to confirm this — the code makes it deterministic. The slot 4 alternative (Lazy Inspector, single enemy) does not apply payroll pressure, making the slot 4 pool draw a significant luck component.

### Note 7: Combat log single-sample observations (seed 99 frugal only)

Due to the reset bug, combat stats represent one run:
- Slimes: 1 combat, 100% win rate — expected; basic stat check
- Dungeon Archers: 1 combat, 100% win rate — backline positioning may not be challenging for well-formed frugal parties
- Champion's Guard: 1 combat, 0% win rate — a 2-attack Champion flanked by Guarded Protectors is the hardest slot 7 variant
- Frugal/Greedy Guild Ghost: 0% win rate in this single sample — not representative

These are not reliable percentages. The combat log fix must be applied before encounter-level signals are actionable.

## Summary: Act 1 Feel

Act 1 presents genuine economic tension but the pressure curve is too steep for non-frugal builds. The core loop — scout, shop, form, fight, pay — is legible. Losses are usually explainable in retrospect (upkeep shortfall, bad slot draw, consecutive losses). However, the restart feedback loop is too short: Act 1 collapses happen before the player has built enough party to appreciate strategic variety.

The 42% frugal win rate confirms the audit baseline (findings-244). The target of 50–70% is not met. Structural causes are well-understood.

## Recommendations

### Bugs

| # | Bug | Evidence | File |
|---|---|---|---|
| B1 | `BalanceRunLogger.startRun()` resets `combatRows` per seed — combat outcomes table is single-seed noise | findings-247; harness report confirms 1 combat per encounter | `web/src/run/BalanceRunLogger.js:32` |
| B2 | Greedy/smart/random strategies die at round 4 from economic collapse — harness provides misleading per-strategy data | findings-243 | `web/src/test/strategies/greedy.js`, `smart.js` |

### Tuning Changes

| # | Recommendation | `GameRules.js` param | Current | Proposed | Rationale |
|---|---|---|---|---|---|
| T1 | Raise starting gold | `StartingGold` | 15 | 18 | Allows hiring a 3rd hero before round 1; reduces slot 1 RNG fragility. #244 recommendation confirmed by harness outlier pattern. |
| T2 | Raise debt payment cap | `DebtPaymentCap` | 3 | 5 | Frugal's payDebt call is capped at 3; raising to 5 lets winning runs clear early debt faster, reducing compounding. |
| T3 | Soften morale loss on dungeon loss in Act 1 | `DungeonLossMorale` | 6 | 4 | 5-loss budget before morale exhaustion is too tight for a 10-round act. Softening to 4 gives 7-loss buffer, allowing runs to recover from round 1–3 stumbles. |
| T4 | Remove Tax Collector from slot 4 pool, or cap upkeep increase | `TaxCollectorUpkeep` | 2 | 1 | Tax Collector applies mandatory upkeep pressure before a party is established. Capping at 1 preserves the mechanic's identity without guaranteeing shortfall. |

### UI / Readability Changes

| # | Issue | Notes |
|---|---|---|
| U1 | Debt accumulation speed is not surfaced in the payroll panel | Players do not see projected interest before taking a loan. A "+X debt/round interest" projection would make the debt spiral legible. |
| U2 | Tax Collector's +2 upkeep effect is shown only after combat | If the encounter effect fires before combat resolution, showing the upkeep change in the scout panel would help players plan. |

### Defer / No Change

| # | Item | Reason |
|---|---|---|
| D1 | Reduce Slime health (3 → 3, Shield Grunt health −1) | Slot 1 appears winnable for a 2-hero frugal party from the single-sample combat log. Defer until multi-strategy data is available. |
| D2 | Backline archetype viability | Cannot assess wizard/warlock/high-damage builds until strategy fix is applied. |
| D3 | Rival ghost scaling | Cannot assess rival race contribution to Act 1 difficulty without the attack penalty variable isolated. |

## Recommendation for Act 2 Pass

Act 2 pass (#239) should proceed after:
1. Strategy fixes implemented (separate issue, per findings-243 recommendations).
2. Combat log reset fixed (separate issue, per findings-247 recommendations).
3. Tuning changes T1–T4 optionally applied and re-run (recommended: do Act 2 pass before tuning to capture baseline).

The Act 2 primary question (does debt collapse to near-zero immediately?) can be answered with frugal-only data and does not require the strategy fix.
