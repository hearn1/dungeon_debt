# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

The GitHub expansion issue wave `#66`-`#73` is complete, including the #67 Act 4 dev-gated Vault follow-up, #72 Phase 2 strategy-variants follow-up, #73 Bargain Stall clear-on-leave follow-up, #82 cumulative difficulty-description follow-up, #83 final-run unlock follow-up, and #88 Visual V3 attack/impact feedback follow-up; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The recommended conflict-aware order has been completed:

1. `#72` - Balance harness Phase 1
2. `#73` - Encounter variants Bucket A
3. `#66` - Gold hero tier
4. `#69` - Paladin, Cleric, Barbarian
5. `#70` - Difficulty levels 0-3
6. `#67` - Act 3 dev-flag content
7. `#68` - Rival Race mechanic
8. `#71` - Visual identity V1
9. `#73` - Bargain Stall follow-up: clear event state when leaving Shop
10. `#82` - Difficulty level descriptions show cumulative mutators, including locked levels
11. `#83` - Difficulty unlocks advance only after final-run victory
12. `#72` - Balance harness Phase 2 strategy variants
13. `#67` - Act 4 dev-gated Vault follow-up with Banker King Debt Judgment
14. `#88` - Visual V3 attack and impact feedback

### Candidate next work

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
- Continuing beyond V1 of `#71` automatically.
- Broad refactors or cleanup.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #71, #68, #67 entries)
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

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The GitHub expansion issue wave is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
