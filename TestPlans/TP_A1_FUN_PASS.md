# TP_A1_FUN_PASS.md — Act 1 Fun / Balance Pass

## Slice

A1-FUN-PLAN

## Goal

Evaluate whether Act 1 is fun, readable, replayable, and balanceable before tuning constants.

## Definition of "Fun Act 1"

Act 1 should:

- Present a clear tactical/economy question each round.
- Support at least 3 viable party archetypes.
- Let a new player win after a few attempts without hidden knowledge.
- Create debt pressure without making debt feel like a surprise fail meter.
- Make losses understandable from visible causes:
  - weak combat stats
  - over-upkeep debt spiral
  - poor formation into backline pressure
  - risky payroll choices
  - failing to answer reward/debt pressure encounters

## Target Balance Ranges

- Manual exploratory win rate: roughly 40–70% after basic familiarity.
- Smart/frugal harness strategies should not be near 0% or 100%.
- Greedy/debt-heavy runs may win sometimes but should frequently enter Dangerous/Critical debt.
- Random runs can lose often, but losses should usually show clear failure reasons.
- A single normal fight loss should hurt but not usually end the run by itself.
- Debt should become Dangerous/Critical because of repeated choices, not one unclear spike.

## Act 1 Test Archetypes

1. High-upkeep damage
2. Low-upkeep frugal
3. Tank-heavy safe
4. Support/economy
5. Reckless debt/loan

## 10+ Run Test Matrix

| Run | Mode | Seed | Archetype | Strategy Notes | Expected Read |
|---:|---|---:|---|---|---|
| 1 | Manual | n/a | High-upkeep damage | Prioritize Wizard/Ninja/Rogue/Warlock, loans allowed | Powerful but financially strained |
| 2 | Manual | n/a | Low-upkeep frugal | Prefer Squire/Warrior/Ranger/Treasurer/Apprentice, Pay Debt often | Stable economy, possible low damage |
| 3 | Manual | n/a | Tank-heavy safe | Warrior/Knight/Golem/Priest/Cleric/Paladin | Safe but may lack burst |
| 4 | Manual | n/a | Support/economy | Bard/Treasurer/Apprentice/Priest/Enchanter + modest carry | Engine works if it survives |
| 5 | Manual | n/a | Reckless debt/loan | Take Loan aggressively, use Warlock if offered | Tempo now, bankruptcy risk later |
| 6 | Harness | 0 | Smart | `npm run test:balance -- --seeds=1 --strategy=smart` | Baseline smart seed |
| 7 | Harness | 1 | Smart | `npm run test:balance -- --seeds=1 --strategy=smart` | Baseline smart seed |
| 8 | Harness | 2 | Frugal | `npm run test:balance -- --seeds=1 --strategy=frugal` | Conservative baseline |
| 9 | Harness | 3 | Greedy | `npm run test:balance -- --seeds=1 --strategy=greedy` | High-pressure baseline |
| 10 | Harness | 4 | Random | `npm run test:balance -- --seeds=1 --strategy=random` | Readability / chaos baseline |
| 11+ | Optional | 5–20 | All | `npm run test:balance -- --seeds=20 --strategy=all` | Broader confidence |

## Metrics to Capture Per Run

### Run-Level Metrics

- Outcome: Act 1 win/loss
- End round
- End reason
- Final gold
- Final debt
- Final morale
- Highest debt tier reached
- Final party and tiers
- Relics acquired
- Number of fights won/lost
- Number of rival ghost wins/losses
- Number of capstone attempts/wins
- Fun score: 1–5
- Readability score: 1–5

### Economy Metrics

- Gold after shop
- Gold after reward
- Gold after upkeep
- Gold after interest
- Total upkeep
- Upkeep paid
- Upkeep shortfall
- Interest charged
- Interest paid
- Interest added to debt
- Number of Pay Debt clicks
- Total debt paid
- Number of Take Loan uses
- Number of Cut Wages uses
- Number of Promise Victory Bonus uses
- Number of Victory Bonus loss penalties

### Combat / Readability Metrics

- Combat rounds elapsed
- Player units dead
- Enemy survivors
- Whether loss was by party death or turn limit
- Whether Goblin/Leech penalties triggered
- Whether Debt Wraith scaling felt predictable
- Whether Auditor pressure was readable
- Whether the Scout threat matched what happened in combat

## Round-by-Round Notes Template

For each round, record:

| Field | Notes |
|---|---|
| Round | |
| Encounter | |
| Pre-fight plan | |
| Shop decision | |
| Payroll action | |
| Formation decision | |
| Combat result | |
| Reward result | |
| Upkeep / debt result | |
| What felt fun? | |
| What felt unclear? | |
| Why did the player win/lose? | |
| Possible tuning hypothesis | |

---

## Archetype Definitions

### 1. High-Upkeep Damage

**Goal:** Check whether expensive carries can win before the economy collapses.

Likely heroes:

- Wizard
- Ninja
- Rogue
- Warlock
- Ranger
- Knight

Payroll behavior:

- Take Loan early if a high-value carry appears.
- Promise Victory Bonus on scary rival/boss rounds.
- Delay Pay Debt unless debt becomes Dangerous/Critical.

Expected read:

> "I can crush fights, but payroll is killing me."

Watch for:

- Debt reaches Dangerous/Critical too early.
- Losses feel like unavoidable bankruptcy after one exciting purchase.
- Wizard full-upkeep scaling is too hard to maintain.

---

### 2. Low-Upkeep Frugal

**Goal:** Check whether conservative play is viable without becoming boring.

Likely heroes:

- Squire
- Warrior
- Ranger
- Treasurer
- Apprentice
- Bard

Payroll behavior:

- Pay Debt often.
- Prefer Standard Pay or Cut Wages.
- Avoid loans unless necessary.

Expected read:

> "I'm surviving because my party is efficient, but I need enough damage."

Watch for:

- Runs become trivial because upkeep is too low.
- Runs time out because low-damage teams cannot solve Leech / Frugal / Auditor.
- Pay Debt always beats hiring/rerolling.

---

### 3. Tank-Heavy Safe

**Goal:** Check whether defense is a real path, not just a trap.

Likely heroes:

- Warrior
- Knight
- Golem
- Priest
- Cleric
- Paladin
- Ranger

Payroll behavior:

- Mostly Standard Pay.
- Occasional Cut Wages.
- Avoid loans unless a key defensive hire appears.

Expected read:

> "I can survive, but I need to solve damage checks."

Watch for:

- Golem/Knight/Priest line becomes too safe.
- Tank-heavy runs lose only because the 10-turn combat limit punishes low damage.
- Backline Bat / Carry fights stop mattering if frontline protection is too strong.

---

### 4. Support / Economy

**Goal:** Check whether economy/support heroes create an engine without skipping the main tension.

Likely heroes:

- Bard
- Treasurer
- Apprentice
- Priest
- Enchanter
- One carry

Payroll behavior:

- Pay Debt when stable.
- Standard Pay by default.
- Occasional Victory Bonus to protect the engine.

Expected read:

> "My engine works if I survive the next fight."

Watch for:

- Bard income snowballs too hard.
- Treasurer/Apprentice make upkeep irrelevant.
- Support comps are too dependent on finding exactly one carry.

---

### 5. Reckless Debt / Loan

**Goal:** Check whether debt is a fun risk path without becoming the obvious best line or a guaranteed loss.

Likely heroes:

- Warlock
- Wizard
- Rogue
- Ninja
- Golem
- Knight
- Bard

Payroll behavior:

- Take Loan aggressively.
- Delay Pay Debt.
- Use Victory Bonus often.

Expected read:

> "Debt gives me tempo, but I'm one bad fight from collapse."

Watch for:

- Warlock/debt gameplay becomes too strong.
- Debt Wraith becomes a single hard counter rather than a readable punishment.
- Debt limit is reached before the player has recovery agency.

---

## Intended Failure Patterns

At least two failure patterns should be intentional and understandable.

### 1. Overbuilt Payroll Collapse

The player buys or merges expensive heroes, wins fights, but cannot keep up with upkeep + interest.

This supports the core hook:

> "Can I afford to keep this party?"

Good version:

- The player sees debt rising.
- The player had chances to Pay Debt, skip hires, fire units, or cut wages.
- The final collapse feels earned.

Bad version:

- One purchase silently dooms the run.
- Interest/debt jumps are not understandable.
- The player loses while feeling like they played well.

---

### 2. Underpowered Safe Team

The player avoids debt but lacks damage to kill reward-drainers, rival carries, or the final boss quickly enough.

Good version:

- The player understands they over-prioritized safety.
- The run shows clear damage checks.
- Future solution is obvious: add carry, buff damage, use Victory Bonus, or reroll.

Bad version:

- Frugal play is never viable.
- Low-upkeep heroes are traps.
- The player cannot tell whether they lost to stats, formation, or economy.

---

### 3. Bad Formation / Backline Pressure

The player fails to protect fragile backline units against known backline attacks.

Good version:

- Scout warning makes the threat clear.
- Formation decision matters.
- Loss teaches a fix.

Bad version:

- The target rule feels hidden.
- Backline deaths feel random.
- Knight/frontline protection does not read clearly.

---

## Tuning Hypotheses for Later

Do **not** apply these in this planning slice.

### H1 — Act 1 Economy May Be Too Tight

If competent runs regularly hit debt limit before round 7–10 despite winning most fights, the economy is too punishing.

Candidate later constants:

```text
StartingGold
WinReward
LossReward
InterestDebtDivisor
DebtPaymentCap
HireCostBonus
RerollCost
```

---

### H2 — Debt Recovery May Be Too Weak

If players click Pay Debt repeatedly but still cannot meaningfully recover from moderate debt, recovery is too weak.

Candidate later constants:

```text
DebtPaymentCap
InterestDebtDivisor
DebtLimit
```

---

### H3 — Greedy / High-Upkeep May Be Too Good

If aggressive loan-heavy runs outperform conservative runs without meaningful downside, debt is underpriced.

Candidate later constants:

```text
LoanGoldGain
LoanDebtCost
DebtLimit
InterestDebtDivisor
VictoryBonusGoldCost
VictoryBonusDebtOnLoss
```

---

### H4 — Conservative / Frugal May Be Too Weak

If low-upkeep parties regularly reach round 8–10 but cannot kill enemies before turn limit, the defensive/economy path may need support.

Candidate later constants/data:

```text
CombatTurnLimit
WinReward
BronzeBardWinGold
TreasurerUpkeepReduction
Act 1 enemy health values
```

---

### H5 — Rival Ghosts May Punish Too Sharply

If rival ghost fights feel unexpectedly harder because of race-lead scaling, the issue may be readability or scaling pressure.

Candidate later constants:

```text
RivalRaceHpLeadFactor
RivalRaceAttackLeadFactor
RivalRaceHpLeadCap
RivalRaceAttackLeadCap
RivalFinishedFirstMorale
```

---

### H6 — Encounter Variants May Add Noise Before Baseline Tuning

If results vary too much because alternate encounters appear in the same slot, the report should track which variant appeared before any tuning changes.

Candidate later file:

```text
web/src/core/DataRepository.js
```

---

## Constants Allowed to Tune Later

First real tuning slice should prefer `web/src/core/GameRules.js`.

Allowed first-pass constants:

```text
StartingGold
StartingMorale
DebtLimit
DebtPaymentCap
WinReward
LossReward
RivalWinBonus
DungeonLossMorale
RivalLossMorale
InterestDebtDivisor
LoanGoldGain
LoanDebtCost
VictoryBonusGoldCost
VictoryBonusDebtOnLoss
CutWagesUpkeepReduction
CutWagesAttackPenalty
RerollCost
HireCostBonus
FireRefund
```

Only tune enemy/encounter data later if the run report proves constants alone cannot fix the issue.

---

## Files Likely Touched in Later Tuning Slices

### First Tuning Slice

```text
web/src/core/GameRules.js
```

Reason: primary numeric tuning surface.

### Possible Later Data Slice

```text
web/src/core/DataRepository.js
```

Reason: only if Act 1 encounter composition, enemy stats, or variant pressure is the actual problem.

### Possible Later Harness/Reporting Slice

```text
web/src/test/balance.js
web/src/test/strategies/*.js
web/src/run/BalanceRunLogger.js
```

Reason: only if reporting needs to become more automated after manual notes are collected.

---

## Recommended First Tuning Slice After This

**Slice ID:** `A1-TUNE-1`
**Goal:** Tune Act 1 economy pressure using only `GameRules.js`, based on the `TP_A1_FUN_PASS.md` findings.

### A1-TUNE-1 Scope

Allowed:

```text
web/src/core/GameRules.js
```

Not allowed in first tuning slice:

```text
web/src/core/DataRepository.js
web/src/combat/**
web/src/run/RunManager.js
web/src/run/ShopManager.js
web/src/run/PayrollManager.js
web/src/run/RivalManager.js
web/src/ui/**
web/styles/**
```

### A1-TUNE-1 Verification

```sh
cd web
npm run test:headless
npm run test:balance -- --seeds=20 --strategy=all
```

Then perform at least 3 manual Act 1 runs across different archetypes.

---

## Acceptance Criteria for A1-FUN-PLAN

- `TestPlans/TP_A1_FUN_PASS.md` exists.
- The plan defines 3–5 Act 1 archetypes.
- The plan defines measurable "fun Act 1" targets.
- The plan includes a 10+ run matrix.
- The plan lists metrics to capture.
- The plan identifies allowed later tuning constants.
- The plan lists out-of-scope changes.
- The plan recommends the first follow-up tuning slice.
- No gameplay constants are changed.

---

## Out of Scope for This Planning Pass

- No tuning constants.
- No hero stat changes.
- No enemy stat changes.
- No encounter composition changes.
- No new encounters.
- No new heroes.
- No new relics.
- No new payroll actions.
- No new debt mechanics.
- No changes to Acts 2–4.
- No UI changes.
- No balance harness rewrite.
- No third-party tooling.
- No broad refactors.
