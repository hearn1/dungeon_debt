# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#260` (3D / 2.5D asset catalog and placeholder asset pass) is complete; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#260` and its subissues:

1. `#269` - Add visual asset catalog for 3D / 2.5D units
2. `#270` - Add unit visual state mapping and fallback animations
3. `#271` - Review placeholder visual options for first 2.5D pass

### Candidate next work

**Likely follow-up from parent `#256`:**

- The next 2.5D/board-renderer issue, if Matt chooses to continue that track.

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
- Continuing the 2.5D track automatically.
- Broad refactors or cleanup.

### Files to read

```text
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #260, #259, #258 entries)
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

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#260` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
