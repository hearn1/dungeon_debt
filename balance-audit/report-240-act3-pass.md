# Report: Act 3 Fun/Balance Pass (#240)

Part of epic #238 — Full-game fun/balance pass (Acts 1–4).

## Prerequisite Status

**Strategy fix (#243):** NOT YET IMPLEMENTED.
**Combat log reset fix (#247):** NOT YET IMPLEMENTED.
**Act 2 pass (#239):** Complete — report at `balance-audit/report-239-act2-pass.md`.

## Dev Flag Note

Acts 3–4 are gated behind a dev flag. To enable in the browser: open the JavaScript console and set the flag that unlocks extended acts, or find the relevant override in `RunManager` / `GameRulesFns.totalActs`. In the harness, Acts 3–4 run without a flag (the harness uses `devTotalActs`). Manual runs require the flag.

From `GameRules.js`:
```js
get totalActs() { return DefaultActCount; },   // 4 — full game
get devTotalActs() { return ActRoundCounts.length; }  // 4 — harness runs all acts
```

## Harness Data

From findings-245 (`20260612-071314`, 100 frugal seeds):

- Runs reaching Act 3: 42 (those that won Act 2)
- Act 3 survival rate: **90.9%** — far above any reasonable threat target
- Avg gold at Act 3 entry: ~126.84
- Avg debt at Act 3 entry: 0.00
- Avg morale at Act 3 entry: 19.92

## Observed Run Notes

### Note 1: 90.9% Act 3 survival confirms the audit thesis

Nearly all runs reaching Act 3 clear it. This is not a calibration precision issue (e.g., 80% vs. 75%); it is a structural problem. A frugal party entering Act 3 with 127 gold, 0 debt, and a Silver-capable roster faces enemies scaled at `{ enemyHealth: 1.2, enemyAttack: 1.15 }`. This is a ~20% HP increase over Act 1 enemies. Meanwhile, the player's heroes have gained:
- Silver tier: +2 attack, +4 health
- Veteran XP bonuses: +1 attack and +1 max HP per veteran tier (most heroes veteran tier 2–3 by round 25)
- Relics: typically 2–3 accumulated by Act 3 entry (one per act capstone)

The 1.2× health scale offsets approximately one Silver upgrade worth of damage increase. It does not keep pace with a party of 3–5 Silver/veteran heroes with 2–3 relics.

### Note 2: Enemy stats in Act 3 are insufficient by calculation

Reference frugal's typical hero at Act 3 entry:

- Apprentice Wizard (Silver, veteran tier 2): base 3 attack → +2 Silver + veteran 2 = 5–6 attack. With possible BladeCharter relic (+1 attack to damage heroes): 6–7.
- Act 3 Mint Slime (slot 1): base 2 HP × 1.2 = 2.4 → ceil = 3 HP. A party attacking for 5+ kills it in one hit.
- Act 3 Mint Enforcer (slot 1 alt, Guarded): base 3 HP × 1.2 = 4 HP, needs two hits (Guarded + kill). A 4-attack hero can break Guarded then kill in the same turn with a carry's assist.

The encounter that would test the player most — MintMaster (slot 10, 30 HP, `ActStatScale[3].enemyHealth = 1.2` → 36 HP, `DungeonAuditorBoss` effect) — is the most dangerous, but a Silver party with 5+ avg attack kills the flanking Mint Enforcers quickly and can survive the periodic damage from `FinalBossDamage`.

### Note 3: Mint Infernal Auditor (slot 5) uses DebtWraithScales — but debt is 0

The Mint Infernal Auditor (`EnemyEffectId.DebtWraithScales`) at slot 5 scales attack with player debt. With frugal's 0.00 debt at Act 3, this enemy fights at its base attack of 2 (scaled to ceil(2 × 1.15) = 3). A 2-attack Auditor type with 16 HP against a Silver party is a non-threat. The debt-scaling mechanic is the design's primary late-game pressure lever, and it is nullified by the economy snowball.

### Note 4: Act 3 encounters introduce no new mechanical archetypes

Act 3 encounter types (from DataRepository):
- Mint Slime Press: stat check (Mint Slime, Mint Slime, Mint Imp)
- Mint Enforcer Squad: frontline durability (Mint Enforcer × 2)
- Mint Crossbowmen: backline pressure (Mint Crossbowman × 2)
- Mint Infernal Auditor: debt punishment (now inert)
- MintMaster: final boss (DungeonAuditorBoss + FinalBossDamage)

Every encounter type was present in Acts 1 and 2. Reskinned names and marginally higher stats do not create new strategic demands. The same formation and payroll decisions that worked in Act 1 continue to work without modification.

### Note 5: Rival race is cosmetic by Act 3

By round 21, rival race progress is set by rounds 1–20 of cumulative rival advances. The Frugal Guild advances at 1.1/round, reaching ~22 by round 20. The Carry Guild starts slow (0.7/round rounds 1–5) then accelerates (1.5/round rounds 11+), potentially passing frugal mid-Act 2. By Act 3, the race outcome is often determined before Act 3 begins. The per-act race reset behavior (from deferred issue #143) would address this, but is not yet implemented. Manual Act 3 plays should note whether the race state at Act 3 entry feels like a meaningful setup for Act 4's conclusion.

### Note 6: CutWages attack penalty is negligible at Silver stats

`CutWagesAttackPenalty` is −1 attack to all heroes. A frugal Silver ranger with 5 attack and 2 veteran bonus = 7 total: −1 leaves 6. This is imperceptible against Act 3 enemies. The payroll trade-off that created genuine decisions in Act 1 (−1 attack on a 3-attack hero = 33% damage reduction) is now background noise.

### Note 7: Gold accumulation reaches "pointless" level by mid-Act 3

With 127 gold and a full Silver-capable roster, frugal has no beneficial spending decision in Act 3. The only shop actions are: hire (party is full), reroll (2 gold cost, no meaningful return), Silver upgrade (optional marginal stat gain). The economy has ceased to be a game system. Gold is a number that increases each round.

## Summary: Act 3 Feel

Act 3 does not escalate — it is a cool-down lap. The player's accumulated power (Silver stats, veteran levels, relics) outpaces `ActStatScale` by 2–3× in combat power terms. No encounter presents a genuine threat. The economy is irrelevant. The rival race is effectively decided.

**Confirmation of audit thesis (findings-245): ActStatScale Act 3 `{ enemyHealth: 1.2, enemyAttack: 1.15 }` is too conservative for a Silver-tier party.**

## Recommendations

### Bugs

| # | Bug | Evidence | File |
|---|---|---|---|
| B1 | Prerequisite bugs still pending (strategy collapse, combat log) | See `report-155-act1-pass.md` B1, B2 | Various |

### Tuning Changes

| # | Recommendation | `GameRules.js` param | Current | Proposed | Rationale |
|---|---|---|---|---|---|
| T1 | Raise `ActStatScale` Act 3 `enemyHealth` | `ActStatScale[3].enemyHealth` | 1.2 | 1.5 | A Silver ranger (5 atk) kills a 1.2×-scaled Slime (3 HP) in one hit. At 1.5× (ceil(2.5×1.5)=4→5 HP) the first slot takes 2 hits. This creates actual combat rounds for the opening encounters. |
| T2 | Raise `ActStatScale` Act 3 `enemyAttack` | `ActStatScale[3].enemyAttack` | 1.15 | 1.35 | A 2-attack enemy scaled to 1.15× = 3 attack, the same as the un-Silver'd frugal party's earlier state. At 1.35× = ceil(2×1.35)=3 attack for low-stat enemies, 4–5 for high-stat enemies, creating real attrition pressure on multi-hero fights. |
| T3 | Add per-act upkeep scaling (new constant) | `ActUpkeepBonus` | (none) | +1/hero/round per act beyond Act 1 | Restores economic tension. A 5-hero Act 3 party pays +10 upkeep/round above Act 1. Required alongside T1–T2 to address gold accumulation. This recommendation carries from #239 — it applies from Act 2 onward. |
| T4 | Scale `CutWagesAttackPenalty` by act | `CutWagesAttackPenalty` | −1 flat | −1 / −1 / −2 / −3 by act | At Silver tier, −1 attack is unnoticeable. Scaling the penalty to −2 in Act 3 makes CutWages a real cost decision at this power level. |

### UI / Readability Changes

| # | Issue | Notes |
|---|---|---|
| U1 | No in-game indication of Acts 3–4 dev flag status | The dev flag that enables Act 3+ should surface visibly in the UI during playtesting, so testers know they are in extended territory. |
| U2 | "MintMaster" encounter name does not communicate the threat archetype | The boss name is thematic but does not telegraph the `FinalBossDamage` periodic damage mechanic. The scout description ("Starts Inspired and applies Burned on attack. Raises wages and deals periodic damage.") is correct but dense. |

### Rival Race Issues (for #143)

- The rival race appears decided before Act 3 begins, based on accumulated progress from Acts 1–2.
- The per-act race reset behavior expected in #143 is not implemented. Act 3 does not feel like a fresh race segment.
- The race lead stat bonuses (`RivalRaceHpLeadFactor`, `RivalRaceAttackLeadFactor`) are too small at Act 3 encounter difficulty to create meaningful scaling.
- Recommend: in #143 design, ensure the rival race reset at Act 3 creates a visible "new leg begins" moment in the UI, with clear communication of what the reset means for the player's lead/deficit.

### Defer / No Change

| # | Item | Reason |
|---|---|---|
| D1 | New enemy archetypes for Act 3 | Out of scope for this pass. New encounter types require content design and `DataRepository` additions. |
| D2 | Gold ceiling mechanic | Requires new system design. Flag for separate issue. |

## Recommendation for Act 4 Pass

Act 4 pass (#241) is the final act and the closing summary. The Acts 3–4 dev flag is required. The central questions are: does the Banker King's debt-pressure mechanic land, and does the economy snowball make Act 4 trivial? Based on Act 3 findings, both answers are "yes, it's trivial." Act 4 must be assessed with the same frugal-only baseline, while recommending stat scale adjustments that flow from these Act 3 findings.
