# Findings: Zero-Win-Rate Encounters (#247)

Part of epic #242 — Balance audit.

## Root Cause (Confirmed Bug)

The "Slimes: 1 combat, 0% win rate, 0.00 rounds" and "Dungeon Archers: 1 combat, 0% win rate, 0.00 rounds" entries are **logging artifacts**, not balance findings.

### The logging bug

`BalanceRunLogger.startRun()` (called from `RunManager.initializeRun()`) resets `combatRows` to an empty array on every run:

```js
// BalanceRunLogger.js lines 29–33
startRun(_runState) {
  this.runId = ...;
  this.rows = [];
  this.combatRows = [];   // ← resets on every new seed
},
```

`runSeedSet` calls `runManager.initializeRun()` for each of the 400 runs. Each call resets `combatRows`, discarding all prior seeds' combat data. After `runSeedSet` completes, `BalanceRunLogger.combatRows` contains only the last seed's combats (seed 99, random strategy).

In `balance.js`:
```js
const firstCombatLog = [...BalanceRunLogger.combatRows];
```

This snapshot therefore reflects a single run — seed 99, random. The markdown report's "Combat Outcomes" table is not an aggregate across 400 runs; it is a single run's log.

### Why 0 rounds and 0% win rate for that one run

Seed 99 with random strategy reached Slimes (Act 1, slot 1) and Dungeon Archers (Act 1, slot 2) with 0 heroes in formation. The random strategy's `visitShop` selects actions uniformly at random — including `stop` and `reroll`. For seed 99, the RNG chose to stop (or reroll until gold was exhausted) before hiring any hero. With an empty party, `CombatManager.startCombat` exits immediately via the early-exit guard at lines 42–48:

```js
if (!hasLivingUnits(playerUnits)) {
  result.playerWon = false;
  result.combatRoundsElapsed = 0;
  ...
}
```

This is a valid code path — it is not a bug in the combat engine. The 0 rounds and 0 heroes lost are correct for a combat started with an empty player side.

### Encounter definitions are not the issue

- Slimes: act 1 slot 1, three Slimes (1 atk / 4 hp each). Straightforward.
- Dungeon Archers: act 1 slot 2, two archers at `{q:6,r:0}` and `{q:6,r:4}` with Marked + Burned-on-attack. Placement is valid; `initBoardPositions` handles the custom formation.

No encounter crash, no infinite loop, no stat error. The 0% win rate is pure noise from a 1-sample log of a degenerate (empty-party) run.

## Is this a balance issue?

No. The balance of Slimes and Dungeon Archers cannot be assessed from this data. The confirmed bug prevents any aggregate combat statistics from appearing in the report.

The `combat.js` headless test suite does exercise basic combat, but does not include Slimes or Dungeon Archers as named fixture tests.

## Recommendation

File a new issue to fix `BalanceRunLogger.startRun`: move the `combatRows = []` reset out of `startRun` (which is per-run) and into a harness-level reset that fires once per pass, not once per seed. The fix is a one-liner in `BalanceRunLogger.js` plus a matching change in `balance.js` to reset the log between passes.

Once fixed, Slimes and Dungeon Archers will accumulate ~50 combats each per 100-seed run (slot 1 and slot 2 each have two encounter candidates; RNG picks one). Win rates will then be meaningful.
