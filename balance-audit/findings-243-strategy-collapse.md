# Findings: Autopilot Strategy Collapse (#243)

Part of epic #242 — Balance audit.

## Root Cause (Confirmed)

The failing strategies (greedy, smart, random) are **not** leaving the formation empty. `ShopManager.hire()` assigns formation slots automatically via `findFirstEmptyFormationSlot`, and this path is reached correctly by all four strategies. The Formation state in the harness loop (`case GameState.Formation: state = GameState.Payroll; break;`) is an intentional no-op — formation assignment happens at hire time, not at the Formation phase.

The actual root cause is **economic collapse**, not a missing formation step.

### How the collapse unfolds for `greedy`

`greedy.choosePayrollAction` takes a loan whenever `debt + LoanDebtCost (6) < debtLimit (20)`, i.e. when debt < 14. This fires unconditionally in the first three rounds, pushing debt from 0 → 6 → 12 → 18. Meanwhile:

- `greedy.visitShop` buys up to `MaxPartySize` (5) heroes with no upkeep ceiling. A full party of mixed heroes carries total upkeep of roughly 10–18 gold per round.
- `WinReward` is 8 gold. A combat loss rewards only 4 gold.
- After combat, `applyPostCombatResult` deducts upkeep and interest in sequence. With upkeep ≈ 12 and income ≤ 8, upkeep shortfall ≈ 4+ gold is added to debt each round.
- Interest is `ceil(debt / 3)` per round. At debt = 18, interest = 6 gold — more than a win reward.

By round 4, debt is ≥ 20 (`debtLimit`) and the run ends. This matches the observed median of 4.0 rounds and avg final debt of 24.73.

### Why `smart` fares similarly (1% win rate, median 5.0 rounds)

`smart` adds role-targeting logic but still takes loans when party size < 3, and does not cap projected upkeep before hiring. It reaches debt limit by round 5 on the same path.

### Why `random` reaches round 6 at median

`random` picks actions uniformly at random, including `stop`. It takes loans and hires heroes stochastically, so some seeds avoid the worst builds by luck. The 0.0% win rate confirms this buys a few extra rounds but not survival.

### Why `frugal` works (42% win rate)

Three structural differences protect `frugal`:

1. `shopManager.payDebt()` is called first in `visitShop` — debt is paid down before new heroes are purchased.
2. `choosePayrollAction` always returns `CutWages`, reducing total upkeep by 3 gold per round.
3. `isAllowedByUpkeepPlan` caps projected total upkeep at `WinReward` (8). This guarantees that winning combats fully fund upkeep, preventing the debt spiral.

## Evidence

- Harness run 20260612-071314: greedy avg final debt 24.73, avg final gold 0.00, median rounds 4.0.
- smart avg final debt 23.46, avg final gold 0.00, median rounds 5.0.
- random avg final gold 0.32, median rounds 6.0.
- `CombatManager.startCombat` lines 42–48: a player with no heroes returns `playerWon=false, combatRoundsElapsed=0`. This path is **not** what kills these runs — it is never reached in normal greedy/smart/random runs where at least one hero is hired.
- `ShopManager.hire` lines 74–85: a hero hired when party size < MaxPartySize is always given the first empty formation slot. No explicit formation assignment step exists or is required.

## Are harness signals trustworthy for the other audits?

**No — for greedy, smart, and random.** All three die within Act 1 from economic collapse, not encounter difficulty. Their combat outcomes, encounter coverage, and act-level survival rates are not representative of balanced play.

**Yes — for frugal.** The 42-run win sample provides reliable signal for Act 1 lethality, Acts 3–4 difficulty, and economy snowball (audits #244, #245, #246), with the caveat that frugal's upkeep cap of 8 creates an atypically conservative economy that may understate gold pressure on less disciplined players.

## Recommendations

**Fix scope: medium — strategy files only, no harness or engine changes needed.**

1. Add `shopManager.payDebt()` as the first call in each broken strategy's `visitShop`.
2. Add a projected-upkeep check (≤ `WinReward` or similar threshold) before each hire, mirroring frugal's `isAllowedByUpkeepPlan`.
3. Change greedy/smart loan logic to only take a loan when debt is 0 and party size is below 2 — early-game ramp only, not a perpetual source.
4. File a new issue to implement these fixes before re-running the harness.

The fix is not a one-liner for any strategy; a separate issue is warranted.
