# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#286` (Encounter reward curve) is complete; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#286` and its subissues:

1. `#289` - Add encounter reward helper for act, slot, and encounter type
2. `#290` - Wire scaled gold rewards into post-combat payout
3. `#291` - Add reward curve tests and payout visibility

### Candidate next work

**Likely follow-up from parent `#285`:**

- The next reward/economy tuning issue, if Matt chooses to continue that track.
- Follow-up tuning from balance reports now that scaled payouts are visible by encounter.

**Available paused regression polish:**

- `R005-3` - death fade-out replacing the bare `.dead` opacity drop.

**Available follow-up issue slices:**

- Later `#72` balance harness slices, especially Phase 3 markdown/report aggregation, only if Matt explicitly chooses one.
- Later `#71` visual slices V2-V6, only if Matt explicitly chooses one.
- Later `#67` campaign-expansion slices, especially normal-player access for Acts 3-4 or economy/balance tuning, only if Matt explicitly chooses one.
- Later expansion follow-ups from the issue bodies, only if Matt explicitly chooses one.

### Scope

**In scope:**

- Orient on current `main`.
- Read `REGRESSIONS.md` Open section.
- Ask Matt which slice to pick up next if not already specified.

**Not in scope:**

- Starting another implementation slice without Matt choosing it.
- Continuing the encounter/balance track automatically.
- Broad refactors or cleanup.

### Files to read

```text
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #286, #275, #274 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 6
NEXT_SESSION.md
```

### Files to modify

- None until Matt chooses a concrete slice and confirms the plan.

### Acceptance criteria

1. The next slice is explicitly selected by Matt.
2. Orient and Plan checkpoints are completed before edits, unless Matt gives orchestration-specific instructions again.

### Verification

No verification command until a concrete slice is selected.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#286` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
