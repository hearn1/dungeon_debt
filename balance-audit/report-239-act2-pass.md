# Report: Act 2 Fun/Balance Pass (#239)

Part of epic #238 — Full-game fun/balance pass (Acts 1–4).

## Prerequisite Status

**Strategy fix (#243):** NOT YET IMPLEMENTED. Greedy, smart, and random strategies still die in Act 1. They contribute no Act 2 data. All signals below are frugal-only.

**Combat log reset fix (#247):** NOT YET IMPLEMENTED. Combat outcomes in this report are single-seed samples only.

**Act 1 pass (#155):** Complete — report at `balance-audit/report-155-act1-pass.md`.

## Harness Data

From run `20260612-073114` (100 frugal seeds):

- Runs reaching Act 2: 58 (those that survived Act 1)
- Acts 2–4 combined losses: 16
- Frugal Act 2 implicit survival rate: very high (most of the 16 losses in rounds 11–40 are concentrated in Act 2; no Acts 3–4 losses were isolated in this report's split — see findings-245 for per-act breakdown)

From findings-245 and findings-246 (harness run `20260612-071314`, same 100-seed frugal set):

| Act exit | Avg gold | Avg debt |
|---|---|---|
| Act 1 | 18.92 | 3.99 |
| Act 2 | 70.64 | 0.27 |
| Act 3 | 126.84 | 0.00 |
| Act 4 | 182.28 | 0.00 |

## Observed Run Notes

### Note 1: Debt collapses to near-zero by Act 2 mid-point

The audit's central Act 2 concern is confirmed: frugal runs that survive Act 1 carry avg 3.99 debt into Act 2, and by Act 2 exit this drops to 0.27. The economic pressure that defined Act 1 evaporates within the first 1–3 rounds of Act 2.

Mechanism: frugal always applies `CutWages` (−3 upkeep), then `payDebt()` (up to `DebtPaymentCap` = 3 gold). With upkeep typically 4–7 after CutWages and win reward = 8, each Act 2 win generates net surplus. Debt is retired in 2–4 rounds. Interest charges cease. The economy enters a permanent surplus state.

### Note 2: Gold triples from Act 1 exit to Act 2 exit (18.92 → 70.64)

No gold sink exists in Act 2. The Silver-tier shop offers appear at 12% base chance (`SilverOfferChance`), but frugal's upkeep ceiling blocks most Silver hires — the Silver upkeep reduction (−2) partially offsets the Silver hire cost bonus (+3), making Silver upgrades attractive in theory but often skipped by frugal's conservative logic. In practice, frugal accumulates gold passively across Acts 2–4 without meaningful spending decisions.

### Note 3: Act 2 encounter design mirrors Act 1 structurally

Act 2 encounter slots follow the identical slot-type pattern as Act 1:
- Slot 1: basic stat check (Imp Swarm / Iron Grunt Squad)
- Slot 2: backline pressure or economy drain (Soul Broker / Demonic Archers)
- Slot 3: rival ghost (Frugal Guild Rematch)
- Slot 4: backline or sustain fight (Gloom Bat)
- Slot 5: debt punishment or sustain (Debt Wraith / Infernal Ward)
- Slot 6: rival ghost (Greedy Guild Rematch)
- Slot 7: reward drain or burst carry (Hoard Fiend / Demon Champion's Guard)
- Slot 8: heavy dungeon (Brimstone Brute)
- Slot 9: rival ghost (Carry Guild Rematch)
- Slot 10: Final Boss (Infernal Auditor)

The Act 2 enemies have higher base stats (Act2ShieldGrunt, Act2DungeonArcher etc. generated via `createActEnemy(2, ...)`) but introduce no new mechanical threat categories. A frugal party that survived Act 1 has grown enough to absorb the stat increase without meaningful pressure.

### Note 4: Act 2 Debt Wraith (slot 5) is neutralized by frugal's debt management

The Act 2 Debt Wraith (`EnemyEffectId.DebtWraithScales`) scales attack with player debt. Frugal exits Act 1 with avg 3.99 debt and clears it within 2–3 rounds. By the time slot 5 appears (round 15), frugal debt is 0.00. The Debt Wraith's scaling effect is nullified: it fights at its base attack of 2 (scaled by `ActStatScale[2].enemyAttack = 1.0` → still 2). This is Act 2's intended debt-punisher, and it has no bite for debt-clear strategies.

### Note 5: Infernal Auditor (final boss, slot 10) — `FinalBossDamage` attrition applies

The Infernal Auditor uses `EncounterEffectId.FinalBossDamage`. From code inspection, this deals periodic direct party damage, adding attrition pressure on top of combat. For a frugal party with avg 70+ gold and 0 debt entering round 20, the Auditor's health pool (30 HP, scaled 1.0× for Act 2, `ActStatScale[2].enemyHealth = 1`) is high but within reach of a Silver-capable party. The 16 Act 2+ losses in the harness run include some Auditor defeats, but cannot be isolated without the combat log fix.

### Note 6: Silver-tier merges are underused

Hero hire distribution shows apprentice, squire, and treasurer dominating. These heroes are low-upkeep, low-stat — they are frugal's natural picks but not the heroes that benefit most from Silver merges. The Silver stat bonus (+2 attack, +4 health, −2 upkeep) would most improve mid-tier damage heroes like ranger or rogue, but frugal's logic does not pursue upgrades in the current harness implementation. A human player would be more likely to invest in Silver merges in Act 2, creating more interesting gold-sink decisions — but only if they recognize the option and have surplus gold from Act 1.

### Note 7: Rival race enters a holding pattern in Act 2

By Act 2, the rival race progress is deterministic: frugal always cuts wages, which limits the attack bonus vs. rivals. RivalRaceHpLeadFactor and RivalRaceAttackLeadFactor create stat buffs for the leading rival, but frugal's consistent win rate in Act 2 means the race state is secondary. The race becomes a cosmetic narrative element rather than a mechanical pressure source.

## Summary: Act 2 Feel

Act 2 is a cooldown from Act 1. The debt pressure that defined Act 1 dissolves in the first few rounds. Gold accumulates. Encounters pose little additional challenge. The act reads as a victory lap for runs that survived Act 1, not a distinct act with its own identity and escalating pressure.

The audit's economy snowball finding (findings-246) is confirmed: debt collapses to near-zero by Act 2 exit, and no mechanic reintroduces it.

**The primary Act 2 concern is confirmed: debt vanishes immediately by round 12–13, not gradually over the act.**

## Recommendations

### Bugs

| # | Bug | Evidence | File |
|---|---|---|---|
| B1 | Prerequisite bugs from Act 1 report still pending | See `report-155-act1-pass.md` B1, B2 | Various |

### Tuning Changes

| # | Recommendation | `GameRules.js` param | Current | Proposed | Rationale |
|---|---|---|---|---|---|
| T1 | Scale upkeep by act: +1 gold per hero per round beyond Act 1 | (no param exists — new constant needed) | N/A | `ActUpkeepBonus` per act | A 5-hero party in Act 2 would pay +4/round, creating renewed economic decisions after the Act 1 debt clears. This is the most direct fix for the economic vacuum. |
| T2 | Scale `WinReward` by act | `WinReward` | 8 (flat) | 8 / 9 / 10 / 11 by act | Paired with T1, this creates a moving equilibrium: income rises but costs rise too. Alone, it worsens snowball. |
| T3 | Raise `CutWagesUpkeepReduction` penalty in Acts 3–4 only | `CutWagesAttackPenalty` | −1 flat | −1 / −1 / −2 / −3 per act | CutWages' trade-off (attack for upkeep savings) becomes meaningless with Silver stats. Act-scaling restores the bite. Requires per-act constant or act-aware calculation. |
| T4 | Increase `DebtPaymentCap` to restore debt-clear speed in Act 1 (from report-155) | `DebtPaymentCap` | 3 | 5 | This affects both acts. In Act 1 it aids recovery; in Act 2 it accelerates debt disappearance, slightly exacerbating the snowball. Net benefit is positive if T1 is also applied. |

### UI / Readability Changes

| # | Issue | Notes |
|---|---|---|
| U1 | Silver-tier badge in shop does not communicate the upkeep trade-off | A Silver hero's hire cost bonus (+3) is visible but the upkeep reduction (−2) is not prominently surfaced. Players may miss that Silver is a long-term investment. |
| U2 | Rival race status panel does not show momentum or projected finish round | A "rival is projected to finish in N rounds" signal would make the race feel consequential rather than background decoration. |

### Defer / No Change

| # | Item | Reason |
|---|---|---|
| D1 | Act 2 encounter redesign | Structural similarity to Act 1 is a calibration issue (stats), not a content problem. New encounter types belong in a content issue, not this pass. |
| D2 | Gold ceiling mechanic | Implementing a gold accumulation cap requires new system design. Recommend flagging for a separate design issue. |
| D3 | Multi-strategy Act 2 data | Cannot confirm debt trajectory for greedy/smart/random until strategy fix is applied. Run harness with all strategies after fix. |

## Recommendation for Act 3 Pass

Act 3 pass (#240) should proceed using frugal-only data. The Acts 3–4 dev flag must be enabled to reach Act 3 content. The key question (does ActStatScale hold for a Silver-tier party?) can be answered with code analysis plus frugal harness data.
