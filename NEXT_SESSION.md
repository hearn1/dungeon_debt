# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#311` (Combat V2 replay and presentation) is complete; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#311` and its subissues:

1. `#323` - Add replay grouping and metadata for Combat V2
2. `#324` - Validate grouped Combat V2 replay event streams
3. `#325` - Animate replay groups together in CombatPanel
4. `#326` - Add Combat V2 unit action bars
5. `#327` - Tune Combat V2 replay timing paths
6. `#328` - Document and browser-smoke Combat V2 replay behavior

### Candidate next work

**Available combat follow-ups:**

- Run a larger balance audit/tuning pass now that Combat V2 simulation and replay presentation are in place.
- Continue visual polish if Matt wants more combat-facing presentation work.

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
PROGRESS.md (latest #311 and prior entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 6
NEXT_SESSION.md
COMBAT_V2_RUNTIME_CONTRACT.md
web/docs/COMBAT_V2_REPLAY.md
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

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#311` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
