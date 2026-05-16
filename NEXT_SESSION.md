# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M19.0 - Post-M18 next-vertical planning

**Milestone:** M19 - TBD after M18
**Slice goal:** Decide and document the next approved Phase 3 vertical now that M18 combat statuses are complete, without starting implementation in the same session.

### Why this slice exists

M18 is complete: M18.0 planned the six-status direction, M18.1 added the compact enemy-side status foundation, and M18.2 added narrow player-side access through relics and Silver hero upgrades.

The existing `IMPLEMENTATION_PLAN.md` Phase 3 order currently ends at M18+. Before implementation continues, the next session should choose the next vertical deliberately, define a ready first slice, and update the handoff docs so the next implementation session has a clear scope.

### Scope

**In scope for M19.0:**
- Review the completed M18 state and any manual-test notes from `TestPlans/TP_M18.2.md`.
- Check `REGRESSIONS.md` for blockers or newly reported M18 issues.
- Decide whether the next work is:
  - a targeted M18 regression/tuning follow-up, or
  - a new Phase 3 milestone such as content, balance, UI polish, or another user-approved vertical.
- Draft a ready next implementation slice with ID, goal, files, and 2-5 acceptance criteria.
- Rewrite `NEXT_SESSION.md` for that ready slice.
- Create `TestPlans/TP_M19.0.md` as a planning/document-review checklist if the session changes no runtime code.

**Not in scope for M19.0:**
- Implementing the next vertical in the same session.
- Adding new heroes, enemies, relics, statuses, acts, UI screens, save/load, meta progression, equipment, inventory, tutorials, audio, particles, VFX, or broad architecture.
- Changing M18 behavior unless a specific regression is selected instead of planning.
- Updating `PROGRESS.md` or `REGRESSIONS.md` mid-session.

### Definition of ready

- ID: M19.0.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 4, below.
- No open blocker regressions in `REGRESSIONS.md` currently block planning.

### Relevant plan/design sections

- `SESSION_PROTOCOL.md` seven-step session flow.
- `CLAUDE.md` / `AGENTS.md` Scope control, architectural rules, coding conventions, and Definition of ready.
- `PROGRESS.md` latest M18.2/M18.1/M18.0 entries.
- `REGRESSIONS.md` Open section.
- `IMPLEMENTATION_PLAN.md` section 16 Phase 3 scope rules and any future section the user wants to add or select.
- `GAME_DESIGN.md` MVP scope and any design section relevant to the proposed next vertical.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (latest M18.2/M18.1/M18.0 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (MVP scope and relevant next-vertical sections)
TestPlans/TP_M18.2.md
```

### Files Claude Code Should Create

```
TestPlans/TP_M19.0.md
```

### Files Claude Code Should Modify

```
NEXT_SESSION.md - rewrite it to describe the next ready implementation slice after the planning decision.
```

Optional only with explicit user approval during planning:

```
IMPLEMENTATION_PLAN.md - add or amend a concise M19 milestone entry if the user wants the plan itself updated.
```

### Files Claude Code Does NOT Touch

- Runtime C# code, Unity scene, prefabs, art assets, project settings, generated Unity folders, or unrelated `.meta` files.
- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.

### Acceptance criteria

1. The next implementation slice after M18 is chosen or explicitly deferred because a regression/tuning follow-up is more important.
2. The chosen next slice has an ID, one-sentence goal, files to create/modify, and 2-5 acceptance criteria.
3. `NEXT_SESSION.md` is rewritten to that ready slice so the following session can start with Orient.
4. No runtime code or out-of-scope feature work is started during M19.0.

### Planning guidance

Start by asking the user what they want the next vertical to be, unless a blocker regression exists. The current Phase 3 list ended at M18, so do not invent M19 implementation scope without user confirmation.

Reasonable options to discuss:

- A small status/relic balance pass if M18.2 manual testing finds rough edges.
- A content or encounter polish milestone using existing systems.
- A UI readability polish milestone for relic/status/veterancy density.
- Updating `IMPLEMENTATION_PLAN.md` to define the next Phase 3 vertical before coding.

### Manual test expectations

M19.0 is a planning/documentation slice. If no runtime code changes, use `TestPlans/TP_M19.0.md` as a document-review checklist confirming the next slice is ready and no implementation files changed.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
