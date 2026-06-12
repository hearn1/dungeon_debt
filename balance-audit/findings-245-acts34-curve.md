# Findings: Acts 3–4 Difficulty Curve Too Flat (#245)

Part of epic #242 — Balance audit.

## Data Reliability

Data for Acts 3–4 comes entirely from the 42 frugal winning runs. This is valid for understanding frugal's experience but does not represent multi-strategy play. Post-strategy-fix re-run will expand the sample.

Survival rates from harness run 20260612-071314:
- Act 3: 90.9% (from runs reaching it)
- Act 4: 86.0% (from runs reaching it)

These runs all carried 0 avg debt, ≈ 127/182 avg gold by Act 3/4 exit (see #246 data), and likely had Silver-tier heroes.

## Why Acts 3–4 Fail to Threaten Players

### 1. Enemy stat scaling is too conservative

`ActStatScale` in `GameRules.js`:
```js
ActStatScale: {
  2: { enemyHealth: 1,    enemyAttack: 1    },
  3: { enemyHealth: 1.2,  enemyAttack: 1.15 },
  4: { enemyHealth: 1.45, enemyAttack: 1.35 },
}
```

Act 1 enemies (no scale) are tuned for a 1–3 hero Bronze party. A frugal run reaching Act 3 has 3–5 heroes, many with Silver-tier bonuses:
- Silver: +2 attack, +4 health, −2 upkeep (net stat increase ≈ +50–80% for a 2-atk/4-hp Bronze hero)
- Gold: ×1.8 stat multiplier

A Silver ranger (3 + 2 = 5 attack) against an Act 3 enemy scaled to 1.2× health means the player's damage output grew faster than enemy durability. The 1.2× scaling offsets roughly one Silver-tier upgrade; it does not keep pace with a 3–5 hero Silver party that has also accumulated relics.

### 2. Player snowball outpaces enemy scaling

By Act 3, a surviving frugal run has:
- Up to 3 relics (one per act capstone)
- Heroes with veteran XP bonuses (`VeteranAttackBonusPerTier`, `VeteranHealthBonusPerTier`)
- No debt (0.00 avg) so CutWages' attack penalty is a manageable trade-off
- 127+ avg gold with no gold sink spending decisions

The compounding of Silver stats + relic bonuses + veteran bonuses means player combat power grows multiplicatively while enemy scaling is purely linear.

### 3. No economic pressure survives into Acts 3–4

Upkeep is capped at `WinReward` (8) by frugal's hiring rule, so all wins are self-funding. With zero debt, interest charges (ceil(debt/3)) are zero. The economy effectively stops generating tension. Gold simply accumulates.

See findings #246 for the full economy snowball analysis.

### 4. Act 3–4 encounter design does not meaningfully escalate

Acts 3–4 have the same structural slot pattern as Act 1: basic stat check (slot 1), backline pressure (slot 2), rival ghost (slots 3/6/9), etc. The named encounter escalation (Mint Slime Press → Mint Enforcers, etc.) replaces fluff text and increments base stats, but does not introduce new threat categories. No Act 3–4 encounter presents a mechanical archetype not already seen in Act 1.

The final bosses (MintMaster slot 10, Banker King slot 10) use `EncounterEffectId` modifiers (`FinalBossDamage`, `MintMasterOvermint`) that deal persistent damage, but a full-health party with 0 debt has wide margins to absorb attrition.

## Is This Missing Content or Miscalibrated Values?

Both. The threat-per-encounter issue is calibration (stat scales). The absence of new late-game gold sinks or debt re-introduction mechanisms is missing system scope.

## Recommendations

| # | Recommendation | Estimated difficulty | Rationale |
|---|---|---|---|
| 1 | Raise `ActStatScale` Act 3 to `{ enemyHealth: 1.5, enemyAttack: 1.35 }` | Low | Brings Act 3 enemy HP in line with a Silver-tier party; attack increase makes individual losses more costly |
| 2 | Raise `ActStatScale` Act 4 to `{ enemyHealth: 1.85, enemyAttack: 1.6 }` | Low | A Diamond-tier or heavily Silver party needs roughly 2× scaling to feel genuine threat |
| 3 | Scale base upkeep by act: +1 gold per hero per act beyond Act 1 | Medium | Creates a real gold-drain decision in Acts 3–4. A 5-hero party faces +4 gold upkeep per round by Act 4, requiring wins to sustain |
| 4 | Add a mandatory debt event at Act 3 round 5 and Act 4 round 5 (e.g. "guild audit: +5 debt") | High | Reintroduces debt pressure after Act 1 clears it; requires new `EncounterEffectId` or payroll event |
| 5 | Cap gold accumulation: implement a "gold ceiling" or large-cost event in Act 3+ shop | High | Late-game spending decisions require gold sinks that currently don't exist |

Recommendations 1–2 are low-risk tuning changes that can be made before the harness re-run. Recommendations 3–5 require new systems and belong in separate issues.
