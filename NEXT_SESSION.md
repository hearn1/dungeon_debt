# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: Awaiting Matt's next slice

**Slice ID:** TBD
**Type:** Planning checkpoint
**Severity:** TBD

### One-sentence goal

Epic `#288` (Shop, debt, and price scaling) is complete; Matt should choose the next implementation slice before any code changes.

### Why this session exists

The previous session completed GitHub epic `#288` and its subissues:

1. `#295` - Review act-aware shop price and reroll scaling
2. `#296` - Review act-aware debt payment and debt pressure scaling
3. `#297` - Run reward economy audit after scaling changes

### Candidate next work

**Likely follow-up from epic `#288`:**

- Implement act-aware reroll and premium-tier shop surcharges using the recommendations in `balance-audit/findings-295-shop-price-scaling.md`.
- Rerun the reward economy audit after shop-sink tuning before changing debt math.

**Available paused regression polish:**

- `R005-3` - death fade-out replacing the bare `.dead` opacity drop.

**Available follow-up issue slices:**

- Later reward/economy tuning follow-ups from parent `#285`, if Matt chooses one.
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
PROGRESS.md (latest #288, #287, #286 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 6
NEXT_SESSION.md
balance-audit/findings-295-shop-price-scaling.md
balance-audit/findings-296-debt-pressure-scaling.md
balance-audit/findings-297-reward-economy-audit.md
```

### Files to modify

- None until Matt chooses a concrete slice and confirms the plan.

### Acceptance criteria

1. The next slice is explicitly selected by Matt.
2. Orient and Plan checkpoints are completed before edits, unless Matt gives orchestration-specific instructions again.

### Verification

No verification command until a concrete slice is selected.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. Epic `#288` is complete. Orient on the latest progress and ask Matt which slice to pick up next before planning code changes.
