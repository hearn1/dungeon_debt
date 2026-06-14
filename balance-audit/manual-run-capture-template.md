# Manual Run Capture Template

Use this template to summarize one human-played Dungeon Debt run in a format
that can be compared against balance harness rows. Keep entries short: the goal
is enough detail to explain decisions, not a full play-by-play transcript.

## Run Header

- Date:
- Player:
- Difficulty:
- Seed, if known:
- Final result:
- Final act / round:
- Final gold / debt / morale:
- Perceived turning point:

## Act Summary

| Act | Start gold | Start debt | End gold | End debt | Party at act end | Relics / clauses | Notes |
|---|---:|---:|---:|---:|---|---|---|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |

## Shop Decisions

Record one row per shop where the decision mattered. Skip uneventful shops if
the party, gold, and debt barely changed.

| Act | Round | Gold before / after | Debt before / after | Hires | Fires | Rerolls | Merges / upgrades | Debt paid | Reasoning |
|---|---:|---|---|---|---|---:|---|---:|---|
| | | | | | | | | | |

Harness comparison notes:

- Compare `Rerolls` against economy TSV `rerollsUsed`.
- Compare `Debt paid` against economy TSV `debtPaid`.
- Compare `Gold before / after` against economy TSV shop gold columns.
- Mark premium purchases, especially Silver offers and duplicate buys that
  cause merges or upgrades.

## Party Progression

| Act | Round | Party composition | Total tiers / veterancy | Notable power change |
|---|---:|---|---|---|
| | | | | |

Examples of notable power changes:

- New role filled, such as first Tank or first Support.
- Duplicate purchase caused Bronze to Silver, Silver to Gold, or Gold to Diamond.
- Relic materially changed survivability, damage, healing, or economy.
- A weak unit was replaced by a stronger composition piece.

## Combat Notes

Record fights that felt unusually easy, costly, or misleading relative to the
win/loss result.

| Act | Round | Encounter | Result | Heroes lost | Lowest survivor HP | Hard/easy signal | Notes |
|---|---:|---|---|---:|---:|---|---|
| | | | | | | | |

Harness comparison notes:

- Compare `Heroes lost` against combat TSV `heroesLost`.
- Compare costly wins against combat report threat flags.
- Compare backline pressure observations against ranged/backline threat fields.

## Economy Notes

- Largest surplus gold moment:
- Largest debt spike:
- Debt payment pattern:
- Shops where you wanted to spend but could not:
- Shops where you had surplus and no appealing sink:

## Relics / Clauses

| Act | Round | Relic / clause | Picked over | Why it mattered |
|---|---:|---|---|---|
| | | | | |

## Comparison Against Autopilot

Use this section after generating a balance report for similar seed/difficulty
coverage.

- Did the harness spend less gold than the human run?
- Did the harness reroll less often when weak or rich?
- Did the harness miss obvious merges or upgrades?
- Did the harness keep weak units a human would replace?
- Did the harness pay debt earlier or later than the human run?
- Did the harness lose in Act 1 where the human survived, or survive late acts
  with much lower party power?

## Freeform Notes

- What felt too easy:
- What felt too punishing:
- Tuning hypothesis:
- Follow-up issue candidate:
