# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#313` (Better balance signals and progression scaling audit) is complete; Matt should choose the next implementation or tuning slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#313` and its subissues:

1. `#334` - Add manual human-run capture template.
2. `#335` - Improve smart autopilot spending and upgrade behavior.
3. `#336` - Add party power progression TSV/markdown reporting.
4. `#337` - Audit XP, upgrades, relics, rewards, and enemy scaling.
5. `#338` - Split reports by survivor cohort.
6. `#339` - Add combat threat metrics beyond win rate.

### Candidate next work

**Available balance follow-ups:**

- Run a larger smart/all-strategy audit using the new survivor cohort, power, and threat reports.
- Pick a scoped late-game tuning slice only after reviewing the new reports.
- Tune late enemy scaling, late encounter pressure, shop sinks, or rewards as a follow-up if Matt selects one.

**Available paused regression polish:**

- `R005-3` - death fade-out replacing the bare `.dead` opacity drop.

**Available follow-up issue slices:**

- Later reward/economy tuning follow-ups from parent `#285`, if Matt chooses one.
- Later shop/debt tuning recommendations from epic `#288`, if Matt chooses one.
- Later `#71` visual slices V2-V6, if Matt explicitly chooses one.
- Later expansion follow-ups from the issue bodies, if Matt explicitly chooses one.

### Scope

**In scope:**

- Orient on the current branch/main state.
- Read `REGRESSIONS.md` Open section.
- Ask Matt which slice to pick up next if not already specified.

**Not in scope:**

- Applying balance tuning automatically.
- Starting another implementation slice without Matt choosing it.
- Broad refactors or cleanup.

### Files to read

```text
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #313 and prior entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 4 and section 5
NEXT_SESSION.md
balance-audit/findings-337-progression-scaling-audit.md
web/src/test/balance.js
web/src/run/BalanceRunLogger.js
web/src/test/BalanceTargets.js
web/src/test/BalancePowerMetrics.js
```

### Files to modify

- None until Matt chooses a concrete slice and confirms the plan.

### Acceptance criteria

1. The next slice is explicitly selected by Matt.
2. Orient and Plan checkpoints are completed before edits, unless Matt gives orchestration-specific instructions again.

### Verification

No verification command until a concrete slice is selected.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#313` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
