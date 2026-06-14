# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#312` (Ranged distance and movement correction) is complete; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#312` and its subissues:

1. `#329` - Replace infinite range with real board ranges.
2. `#330` - Make ranged units move when out of range.
3. `#331` - Add simple preferred-range behavior.
4. `#332` - Expose ranged threat metrics in balance reports.
5. `#333` - Add ranged-vs-melee regression scenarios.

### Candidate next work

**Available combat follow-ups:**

- Run a larger Combat V2 ranged/balance audit now that range and movement metrics exist.
- Continue combat presentation polish if Matt wants more combat-facing work.

**Available paused regression polish:**

- `R005-3` - death fade-out replacing the bare `.dead` opacity drop.

**Available follow-up issue slices:**

- Later reward/economy tuning follow-ups from parent `#285`, if Matt chooses one.
- Later shop/debt tuning recommendations from epic `#288`, if Matt chooses one.
- Later `#72` balance harness slices, if Matt explicitly chooses one.
- Later `#71` visual slices V2-V6, if Matt explicitly chooses one.
- Later expansion follow-ups from the issue bodies, if Matt explicitly chooses one.

### Scope

**In scope:**

- Orient on the current branch/main state.
- Read `REGRESSIONS.md` Open section.
- Ask Matt which slice to pick up next if not already specified.

**Not in scope:**

- Starting another implementation slice without Matt choosing it.
- Applying ranged balance tuning automatically.
- Broad refactors or cleanup.

### Files to read

```text
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #312 and prior entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 4
NEXT_SESSION.md
web/src/core/GameRules.js
web/src/combat/CombatBoard.js
web/src/combat/CombatManager.js
web/src/run/BalanceRunLogger.js
```

### Files to modify

- None until Matt chooses a concrete slice and confirms the plan.

### Acceptance criteria

1. The next slice is explicitly selected by Matt.
2. Orient and Plan checkpoints are completed before edits, unless Matt gives orchestration-specific instructions again.

### Verification

No verification command until a concrete slice is selected.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#312` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
