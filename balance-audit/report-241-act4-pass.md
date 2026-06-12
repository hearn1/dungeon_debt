# Report: Act 4 Fun/Balance Pass (#241)

Part of epic #238 — Full-game fun/balance pass (Acts 1–4).

## Prerequisite Status

**Strategy fix (#243):** NOT YET IMPLEMENTED.
**Combat log reset fix (#247):** NOT YET IMPLEMENTED.
**Act 3 pass (#240):** Complete — report at `balance-audit/report-240-act3-pass.md`.

## Dev Flag Note

Acts 3–4 are gated behind a dev flag; enable in the console before manual testing. The harness runs all acts via `devTotalActs`.

## Harness Data

From findings-245 (`20260612-071314`, 100 frugal seeds):

- Runs reaching Act 4: ~38 (frugal runs surviving Act 3 at 90.9%)
- Act 4 survival rate: **86.0%** — well above any reasonable threat target
- Avg gold at Act 4 entry: ~182.28
- Avg debt at Act 4 entry: 0.00

## Observed Run Notes

### Note 1: 86.0% Act 4 survival — the final act is the easiest per-act threat rate

Act 4 survival (86%) is nominally lower than Act 3 (90.9%), suggesting the Banker King encounter does add marginal attrition. But both rates are well above a meaningful threat threshold. The player has 182+ gold, 0 debt, and a Silver-or-better party entering the final act. Economic defeat is effectively impossible.

### Note 2: Banker King debt-pressure mechanic is structurally neutralized

The Banker King (`EnemyEffectId.BankerKingDebtJudgment`) gains attack from player debt. From the enemy definition:
```
createActEnemy(4, "act4-banker-king", "The Banker King", 5, 30, EnemyEffectId.BankerKingDebtJudgment, ...)
```

Base attack: 5. Scaled by `ActStatScale[4].enemyAttack = 1.35` → ceil(5 × 1.35) = 7. The debt bonus is applied on top. Frugal enters Act 4 with 0 debt, so the Banker King fights at base 7 attack. A Silver party with 6–8 avg health per hero can absorb several hits, especially with a healer or Guarded tank. The mechanic's threat radius (scaling attack with debt) is the entire payoff of the economy system — and it fires at zero because debt is eliminated by Act 2.

### Note 3: `ActStatScale` Act 4 is undertuned for the same reasons as Act 3

`ActStatScale[4] = { enemyHealth: 1.45, enemyAttack: 1.35 }`. A Silver+veteran party has:
- Ranger (Silver, vet 2): 3 + 2 (Silver) + 2 (veteran) = 7 attack. With BladeCharter: 8.
- Vault Slime (Act 4 slot 1): base 2 HP × 1.45 = ceil(2.9) = 3 HP. One hit from any hero.

The health scale of 1.45× is better than Act 3 (1.2×) but still insufficient for a party that outscales it by 2–3×. Only the Banker King (30 HP → 44 HP scaled) and Vault Iron Guard (20 HP → 29 HP) present multi-round fights. These are the capstone encounters; the entire act leading to them is not threatening.

### Note 4: Vault Auditor (slot 5) — same debt-scale problem as Act 3

`EnemyEffectId.DebtWraithScales` on the Vault Auditor: base 2 attack, debt 0 = fight at base 2 (scaled to ceil(2 × 1.35) = 3 attack, 16 → 24 HP). A party with 7–8 attack kills this in 3–4 hits. The debt punishment mechanic is inert for the third consecutive act.

### Note 5: No meaningful gold-spending decision exists in Act 4

By Act 4, frugal has 182+ gold. Possible spending: Silver upgrades (5–9 gold each, marginal marginal stat gain when stats already dominate), rerolls (2 gold). The shop offers nothing worth the price relative to the party's power. Gold is accumulated but not spent. The "final debt crunch" predicted by the game's design concept does not exist — there is no debt and no incentive to spend gold.

### Note 6: Act 4 encounters structurally parallel Acts 1–3

Act 4 encounter types:
- Vault Slime Lockbox (slot 1): stat check — trivial
- Vault Marksmen (slot 2): backline pressure — the same formation answer as Act 1
- Vault Auditor (slot 5): debt punishment — inert
- Vault Warlord / Vault Iron Guard (slot 7): burst carry or tank check — first genuine Act 4 encounter
- Banker King (slot 10): final boss

All slot-type patterns are identical to Act 1. No new mechanic or threat category appears. The game ends with the same solution set it started with: frontline, carry, optionally a healer.

### Note 7: End screen presentation is not visible from harness data

The end screen (Victory / Defeat) cannot be assessed from the harness. From code inspection, `GameState.Victory` and `GameState.Defeat` exist and are handled by `UIManager`. Manual playthrough of an Act 4 complete run is needed to evaluate:
- Does the victory screen communicate what the player accomplished?
- Does it surface the debt/gold trajectory?
- Does the defeat screen communicate what went wrong?

This is a UI/readability gap that cannot be addressed without manual play.

### Note 8: Rival race final resolution — no data, structural concern

The rival race resolves at Act 4. From the rival race curve definitions in `GameRules.js`:
- Greedy: 1.4/round (rounds 1–6), 1.2/round (rounds 7+)
- Frugal: 1.1/round flat
- Carry: 0.7/round (rounds 1–5), 1.1/round (rounds 6–10), 1.5/round (rounds 11+)

By round 40, the Carry guild would have advanced ~(0.7×5 + 1.1×5 + 1.5×25) = 3.5 + 5.5 + 37.5 = 46.5 against the `RivalRaceMaxProgress` of 20. Carries "finish" around round 21 (start of Act 3). The Greedy guild finishes around round 18–20. This means both rival guilds complete the race in Act 2 or early Act 3, and the Act 4 "rival race finale" is a race the rivals already won. This structural issue is flagged for #143.

## Summary: Act 4 Feel

Act 4 does not climax — it fizzles. The economy that was supposed to "crunch" in the final act dissolved in Act 2. The Banker King's debt-scaling mechanic fires at zero. Gold is irrelevant. The rival race concluded two acts ago. The only remaining mechanical variable is whether the party can kill 30–44 HP enemies, and at 7–8 attack per hero it can.

**The audit's "economy snowball makes Act 4 trivial" finding (findings-246) is confirmed. The Act 4 survival rate of 86% and zero-debt entry state are consistent with a victory-lap experience, not a climactic final act.**

## Cross-Act Summary

These observations span all four acts and do not belong to any single pass:

### CA1: Gold pressure disappears after round 12–14

The economic tension that defines Act 1 (can I afford my party? will I hit debt limit?) vanishes by mid-Act 2. The cause is structural: frugal's upkeep ceiling creates a 1–3 gold surplus per win, which compounds across 30 rounds with no gold sink. Every other strategy that survives Act 1 would face the same snowball. There is no act-level gold drain mechanic. Recommendation: implement per-act upkeep scaling (`ActUpkeepBonus`) as the highest-leverage single-parameter fix.

### CA2: Debt collapses and never returns

Debt is the core strategic resource — the game's central threat concept. It functions as intended only in Act 1. By Act 2 it is zero. Acts 3–4 have no mechanic that reintroduces debt: no encounter effect, no payroll action, no event. The Debt Wraith, Vault Auditor, and Banker King all scale on debt that doesn't exist. Recommendation: the debt-pressure mechanic needs either a reintroduction event in Acts 3–4, or the economy design must ensure players are still carrying debt into late acts through other means (upkeep scaling, mandatory costs).

### CA3: CutWages stops being a trade-off by Act 3

`CutWages` reduces upkeep by 3 gold (meaningful in Act 1) and inflicts −1 attack on all heroes (meaningful when attack is 2–3, irrelevant when attack is 6–8). The payroll system's most-used action becomes a free income bonus with no downside by Act 3. Recommendation: scale the attack penalty by act (`CutWagesAttackPenalty` per act) or increase it to −2 in Acts 3–4.

### CA4: Enemy stat scaling is flat-multiplier only, no mechanical escalation

`ActStatScale` applies linear multipliers to enemy HP and attack. Player power grows multiplicatively (Silver tier: +67–100% effective stat increase, relics: +1 attack to all damage heroes, veteran bonuses: +1 attack and HP per tier). The gap between player power growth and enemy power growth widens every act. A multiplicative player scaling with a linear enemy scaling will always diverge. The design needs either steeper enemy scaling (recommendations T1–T2 in both Act 3 and 4 reports) or a player power ceiling.

### CA5: Rival race concludes before the climactic final act

The rival guilds' race curves cause them to finish the race by Acts 2–3, making the Act 4 "rival finale" a non-event. This is flagged for #143 but is a cross-act observation: the race system's first half (Act 1) creates meaningful milestones, while its second half (Acts 3–4) is cosmetic.

## Recommendations

### Bugs

| # | Bug | Evidence | File |
|---|---|---|---|
| B1 | Prerequisite bugs still pending (strategy collapse, combat log) | See `report-155-act1-pass.md` B1, B2 | Various |

### Tuning Changes

| # | Recommendation | `GameRules.js` param | Current | Proposed | Rationale |
|---|---|---|---|---|---|
| T1 | Raise `ActStatScale` Act 4 `enemyHealth` | `ActStatScale[4].enemyHealth` | 1.45 | 1.85 | A Silver party with relics needs roughly 2× scaling to feel meaningful threat. At 1.85×, Vault Slime goes from 3 HP to ceil(2×1.85)=4 HP, Banker King goes from 44 HP to ceil(30×1.85)=56 HP — a 3–4 round fight vs. 2. |
| T2 | Raise `ActStatScale` Act 4 `enemyAttack` | `ActStatScale[4].enemyAttack` | 1.35 | 1.6 | At 1.6×, Banker King base attack: ceil(5×1.6)=8. With even 5 debt (if snowball is partially addressed): scales with debt, reaching 10–12 attack. This makes the debt mechanic consequential if debt is non-zero. |
| T3 | Per-act upkeep scaling (new constant) | `ActUpkeepBonus` | (none) | +1/hero/round per act beyond Act 1 | This addresses the cross-act gold accumulation across Acts 2–4 simultaneously. A 5-hero Act 4 party pays +15 gold/round (×5 heroes × 3 extra acts). Even with 182 starting gold, this is a 12-round gold drain at minimum, depending on win rate. |
| T4 | Scale `CutWagesAttackPenalty` by act | `CutWagesAttackPenalty` | −1 flat | −1 / −1 / −2 / −3 by act | Restores the payroll trade-off's meaning in Acts 3–4 when Silver stats make −1 negligible. At −3 in Act 4, CutWages on a 7-attack ranger = 4 attack, a real cost. |

### UI / Readability Changes

| # | Issue | Notes |
|---|---|---|
| U1 | End screen does not show debt/gold arc summary | A post-game screen showing the player's peak debt, gold at each act exit, and cause of victory/defeat would make the run's economic story legible in retrospect. |
| U2 | Rival race outcome is not communicated clearly at run end | The victory/defeat screen should show who "won" the rival race and what consequence that had (if any). |
| U3 | Banker King's debt-scaling mechanic is not telegraphed before the fight | The scout description says "Gains attack from player debt at combat start" — but players with 0 debt have no reason to pay attention. A hint in the Act 4 payroll panel ("The Banker King is watching your debt") would surface the mechanic for future runs. |

### Rival Race Issues (for #143)

- Both Greedy and Carry guilds finish the rival race by Act 2–3, making the Act 4 "final leg" cosmetic.
- The act-based race reset (deferred in #143) is critical for Act 4 to feel like a climax: without it, the race is already over.
- Recommend: #143 should give Act 4 its own race-leg milestone with a meaningful reward/penalty (morale, gold, relic) that the player can see approaching during Act 3.

### Defer / No Change

| # | Item | Reason |
|---|---|---|
| D1 | Mandatory debt event at Act 3/4 | Adding a "Guild Tax: +4 debt" encounter effect requires new `EncounterEffectId` and data. High value, but scoped to a future system issue. |
| D2 | Gold ceiling implementation | Requires new system design. Not in this pass. |
| D3 | Multi-strategy data | All recommendations are based on frugal-only data. Re-run harness after strategy fix for confirmation. |

## Recommendation for Next Priority After This Pass

1. **Implement strategy fixes** (per findings-243 recommendations) — top priority before any tuning, to get reliable multi-strategy data.
2. **Implement combat log fix** (per findings-247 recommendation) — enables per-encounter win rate data.
3. **Apply T1 (StartingGold 15→18) and T3 (ActUpkeepBonus)** — these are the two highest-leverage changes affecting Act 1 survivability and Acts 2–4 economic re-engagement simultaneously.
4. **Re-run 100-seed harness with all strategies** — validate whether recommended changes hit the 50–70% Act 1 survival target.
5. **Re-assess ActStatScale** (T1–T2 in Act 3 and Act 4 reports) — only tune enemy stats after the economic foundation is stabilized. Stat scaling fixes on top of a broken economy will be hard to isolate.
