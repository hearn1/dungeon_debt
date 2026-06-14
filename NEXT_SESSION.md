# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#310` (Combat V2 simulation foundation) is complete; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#310` and its subissues:

1. `#315` - Define the Combat V2 runtime contract
2. `#316` - Add attack cooldown/speed stat surfaces
3. `#317` - Refactor combat into a timeline phase loop
4. `#318` - Add windup and same-tick hit resolution
5. `#319` - Redesign movement as continuous timeline cadence
6. `#320` - Rework targeting for stable timeline combat
7. `#321` - Integrate active abilities into timeline intents
8. `#322` - Add runtime seam and rebaseline tests

### Candidate next work

**Likely follow-up from epic `#310`:**

- Continue with presentation/replay polish on top of Combat V2, likely epic `#311` if Matt wants the next combat-facing slice.
- Run a larger balance audit after Matt chooses whether to tune around the new Combat V2 foundation.

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

- Orient on current `main`.
- Read `REGRESSIONS.md` Open section.
- Ask Matt which slice to pick up next if not already specified.

**Not in scope:**

- Starting another implementation slice without Matt choosing it.
- Applying the `#288` shop/debt recommendations automatically.
- Broad refactors or cleanup.

### Files to read

```text
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #310 and prior entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 6
NEXT_SESSION.md
COMBAT_V2_RUNTIME_CONTRACT.md
balance-audit/findings-310-combat-v2-rebaseline.md
```

### Files to modify

- None until Matt chooses a concrete slice and confirms the plan.

### Acceptance criteria

1. The next slice is explicitly selected by Matt.
2. Orient and Plan checkpoints are completed before edits, unless Matt gives orchestration-specific instructions again.

### Verification

No verification command until a concrete slice is selected.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#310` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
