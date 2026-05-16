# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M19.0 - Prototype assessment and consolidation plan

**Milestone:** M19 - Prototype assessment / consolidation
**Slice goal:** Decide whether Dungeon Debt needs another vertical at all, or whether the next phase should tighten, balance, prune, and clarify existing systems.

### Why this slice exists

M18 is complete: M18.0 planned the six-status direction, M18.1 added the compact enemy-side status foundation, and M18.2 added narrow player-side access through relics and Silver hero upgrades.

The existing `IMPLEMENTATION_PLAN.md` Phase 3 order currently ends at M18+. More importantly, the prototype now has most of the originally imagined vertical layers: debt readability, acts, difficulty, relics, veterancy, and statuses. The next session should assess whether adding another vertical would improve the game, or whether the better move is consolidation: balance, clarity, pacing, UX, pruning, and outside-tester readiness.

### Scope

**In scope for M19.0:**
- Review the completed M18 state and any manual-test notes from `TestPlans/TP_M18.2.md`.
- Check `REGRESSIONS.md` for blockers or newly reported M18 issues.
- Assess the current prototype as a whole:
  - Is the core loop fun enough round-to-round?
  - Which systems are carrying the experience?
  - Which systems feel noisy, redundant, under-tested, or overgrown?
  - Does the game need more content/features, or does it need tightening?
  - What would make it clearer and more playable for an outside tester?
- Decide whether the next work should be consolidation, a targeted regression/tuning follow-up, or a genuinely necessary new vertical.
- Draft a ready next implementation slice with ID, goal, files, and 2-5 acceptance criteria based on that assessment.
- Rewrite `NEXT_SESSION.md` for that ready slice.
- Create `TestPlans/TP_M19.0.md` as a planning/document-review checklist if the session changes no runtime code.

**Not in scope for M19.0:**
- Implementing the next vertical or consolidation slice in the same session.
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
- `IMPLEMENTATION_PLAN.md` section 16 Phase 3 scope rules.
- `GAME_DESIGN.md` core loop, MVP scope, strategic tension, and design warning sections.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (latest M18.2/M18.1/M18.0 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (core loop, MVP scope, strategic tension, design warning)
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
IMPLEMENTATION_PLAN.md - add or amend a concise consolidation milestone entry if the user wants the plan itself updated.
```

### Files Claude Code Does NOT Touch

- Runtime C# code, Unity scene, prefabs, art assets, project settings, generated Unity folders, or unrelated `.meta` files.
- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.

### Acceptance criteria

1. The session produces a clear recommendation: consolidate existing systems, fix/tune M18, or add a new vertical only if there is a strong reason.
2. The assessment names the prototype's strongest systems, weakest/noisiest systems, and biggest outside-tester readiness gaps.
3. The chosen next slice has an ID, one-sentence goal, files to create/modify, and 2-5 acceptance criteria.
4. `NEXT_SESSION.md` is rewritten to that ready slice so the following session can start with Orient.
5. No runtime code or out-of-scope feature work is started during M19.0.

### Planning guidance

Start from the assumption that another vertical is not automatically desirable. The question is whether the current prototype needs breadth or focus.

Reasonable options to discuss:

- A small status/relic balance pass if M18.2 manual testing finds rough edges.
- A consolidation milestone focused on balance, clarity, pacing, and readability.
- A UX/readability milestone for relic/status/veterancy density.
- A content polish milestone using existing systems only, if playtesting shows the run is too repetitive.
- Updating `IMPLEMENTATION_PLAN.md` to define a consolidation phase before coding.

### Manual test expectations

M19.0 is a planning/documentation slice. If no runtime code changes, use `TestPlans/TP_M19.0.md` as a document-review checklist confirming the next slice is ready and no implementation files changed.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
