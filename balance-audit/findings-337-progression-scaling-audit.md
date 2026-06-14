# Progression Scaling Audit

Parent epic: #313
Subissue: #337

## Scope

This audit reviews whether XP, upgrades, relics, rewards, and enemy scaling are
moving together coherently before any direct combat or economy tuning. No
gameplay values were changed for this subissue.

Evidence uses the new party power progression report from `#336`.

Sample command:

```powershell
npm.cmd run test:balance -- --seeds=20 --strategy=smart --report
```

Sample output used here:

- `web/balance-reports/run-20260614-114842.md`
- `web/balance-reports/power-20260614-114842.tsv`
- `web/balance-reports/economy-20260614-114842.tsv`
- `web/balance-reports/combat-20260614-114842.tsv`

The sample is intentionally small enough to keep this audit lightweight. Treat
the exact rates as directional, not final tuning targets.

## Summary Findings

- Smart-strategy win rate in the 20-seed sample was 15%: 3 wins, 17 losses.
- Early failure still dominates the sample: 10 losses ended in Act 1, while 7
  losses reached Act 2 or later.
- Surviving party power grows much faster than the current enemy progression
  multipliers:
  - Act 1 average party power: 22.25 HP, 8.94 attack, 1.32 average tier.
  - Act 2 average party power: 37.98 HP, 21.21 attack, 1.91 average tier.
  - Act 3 average party power: 61.86 HP, 39.39 attack, 2.85 average tier.
  - Act 4 average party power: 81.67 HP, 52.88 attack, 3.49 average tier.
- Enemy scaling in the same power rows averaged only 1.00x / 1.00x in Act 1,
  1.03x / 1.03x in Act 2, 1.08x / 1.05x in Act 3, and 1.11x / 1.07x in Act 4
  before authored base-stat differences.
- Rewards and relic counts compound for survivors: average relic count climbs
  from 0.49 in Act 1 to 3.98 in Act 2, 8.78 in Act 3, and 10.00 in Act 4.

## XP And Veterancy

Veterancy is meaningful for surviving parties. The sample's total veteran tier
count rose from 3.08 in Act 1 to 37.79 in Act 4. Because veterancy adds both
attack and health through existing `HeroEffects` seeding, it becomes a large
part of the survivor power curve.

Recommendation:

- Do not reduce XP globally yet. First, use the new survivor cohort split from
  `#338` to compare Act 3/4 parties that actually survived against all-run
  averages.
- If late survivors remain too soft after cohort reporting, tune enemy
  scaling or late encounter composition before weakening early XP.

## Upgrades And Merges

The improved smart strategy now spends surplus on rerolls and merges:

| Act | Avg shop spend | Avg rerolls | Avg merges / upgrades |
|---|---:|---:|---:|
| 1 | 2.83 | 0.33 | 0.07 |
| 2 | 2.88 | 0.61 | 0.24 |
| 3 | 4.58 | 1.57 | 0.20 |
| 4 | 4.64 | 1.30 | 0.27 |

The party tier curve confirms upgrades matter: average tier rises from 1.32 in
Act 1 to 3.49 in Act 4. The harness still shows low premium purchases after Act
1 because direct Silver offers are only for unowned heroes and late parties are
often full.

Recommendation:

- Keep merge/upgrade reporting visible in economy summaries.
- Before changing tier stat multipliers, inspect winning-run and Act 3/4
  survivor cohorts separately. The all-run sample mixes early deaths with
  strongly upgraded survivors.

## Relics And Clauses

Relics appear to be a major late-survivor amplifier. Average relic count reaches
nearly 9 in Act 3 and 10 in Act 4. Combat-facing relics stack with veteran tiers
and hero upgrades, while economy relics improve the ability to keep spending.

Recommendation:

- Add future tuning candidates for late relic pacing or relic power only after
  the `#338` survivor cohort report shows whether winning parties are uniformly
  relic-saturated or just a small high-roll subset.
- Preserve the current relic choice/reward quality report fields; they are
  needed to tell whether relic quantity or relic quality is the larger lever.

## Rewards And Economy

Rewards scale up substantially for later acts, but the improved smart strategy
also spends more:

| Act | Avg reward | Avg contract reward | Avg shop spend | Avg end gold at act boundary |
|---|---:|---:|---:|---:|
| 1 | 8.33 | 8.07 | 2.83 | 5.92 |
| 2 | 11.39 | 10.82 | 2.88 | 9.25 |
| 3 | 17.60 | 16.32 | 4.58 | 11.75 |
| 4 | 21.27 | 19.85 | 4.64 | 13.00 |

The late-game economy no longer looks like pure unspent-gold hoarding in this
sample. Average economy surplus still rises from 1.00 in Act 1 to 5.64 in Act
4, but much of the late reward increase is being converted into rerolls and
upgrades.

Recommendation:

- Do not nerf rewards before cohort reporting. If late survivor cohorts still
  show high surplus and low threat, target late shop sinks or late encounter
  pressure rather than flattening all rewards.
- Keep debt payment reporting. Debt paid remains very low in this sample,
  partly because surviving smart runs often have low debt by later acts.

## Enemy Scaling

Enemy scaling is currently modest compared with player power growth. That is
not automatically wrong because authored later-act enemies have stronger base
stats, but the measured player curve is steep enough that win rate alone can
hide late softness among the survivors.

Recommendation:

- Use `#338` survivor cohorts and `#339` threat metrics before tuning enemy
  numbers.
- If late survivor cohorts show trivial wins, candidate levers are:
  - Slightly steeper Act 3/4 progression scaling.
  - More late encounters that pressure support/ranged backlines.
  - Boss and rival compositions that assume upgraded parties, not base parties.

## Follow-Up Candidates

1. Run `#338` survivor cohorts to separate early-run failure from late-run
   softness.
2. Run `#339` threat metrics to flag wins that are trivial versus costly.
3. After both reports exist, rerun a larger smart/all-strategy audit and tune
   late enemies or sinks only if the survivor cohorts confirm the same pattern.
