# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M18.0 - Status keyword planning + first-slice definition

**Milestone:** M18 - One status keyword vertical
**Slice goal:** Define the first narrow, readable status-keyword implementation slice so M18 adds at most one contained combat keyword without becoming a broad status system.

### Why this slice exists

M17 tiered veterancy is complete and accepted. The next Phase 3 vertical in `IMPLEMENTATION_PLAN.md` is M18+: one status keyword vertical. The plan intentionally defines this at a milestone level only, so the next session should choose exactly one keyword, one timing rule, a small set of affected units, and a testable first slice before implementation begins.

### Scope

**In scope for M18.0:**
- Re-read Phase 3 scope rules and M18+ in `IMPLEMENTATION_PLAN.md` section 16.
- Decide whether the first status keyword should be implemented now, deferred, or narrowed further.
- If implemented, define exactly one keyword with:
  - one clear timing rule,
  - one or two heroes/enemies using it at most,
  - minimal UI/log copy needed for readability,
  - deterministic combat behavior,
  - no stacked status framework.
- Define the first M18 implementation slice with:
  - slice ID and one-sentence goal,
  - files to create/modify,
  - 2-5 acceptance criteria,
  - manual test expectations,
  - explicit out-of-scope list.
- Rewrite `NEXT_SESSION.md` to the approved M18.1 implementation slice, or to a non-status follow-up if M18 is deferred.

**Not in scope for M18.0:**
- Writing status implementation code unless the user explicitly chooses to collapse planning and implementation into one session after the protocol checkpoints.
- More than one keyword.
- Stacks, durations, cleanse/dispel systems, resistances, damage types, crit/dodge, broad debuff libraries, or a generalized status engine.
- New heroes, large enemy batches, new acts, new relic pools, equipment, inventory, save/load, meta progression, tutorials, audio, particles, or animation polish.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.

### Definition of ready

- ID: M18.0.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 4, below.
- No open blocker regressions in `REGRESSIONS.md` currently block planning.

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: Phase 3 scope rules and "Milestone 18+: One status keyword vertical".
- `GAME_DESIGN.md` combat, run-flow, and first-playable scope sections only if needed.
- `CLAUDE.md` / `AGENTS.md` Scope control, architectural rules, and "Definition of ready".
- `SESSION_PROTOCOL.md` seven-step session flow.
- `PROGRESS.md` latest M17/M16 entries.
- `REGRESSIONS.md` Open section.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (last 2-3 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (combat/run-flow/scope sections if needed)
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs
DungeonDebt/Assets/Scripts/Data/CombatUnit.cs
DungeonDebt/Assets/Scripts/Data/CombatResult.cs
DungeonDebt/Assets/Scripts/Data/GameEnums.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
```

### Files Claude Code Should Create

```
None expected for M18.0 planning.
```

### Files Claude Code Should Modify

```
NEXT_SESSION.md - rewrite to the approved M18.1 implementation brief, or to the next selected slice if M18 is deferred.
```

### Files Claude Code Does NOT Touch

- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- Unity scene, prefabs, art assets, project settings, generated Unity folders, or `.cs.meta` files.
- Gameplay source files unless the user explicitly approves implementation after M18.0 planning.
- Existing shop, payroll, rival, relic, difficulty, veterancy, save/load, or art systems unless the chosen status slice specifically names them.

### Acceptance criteria

1. The first M18 implementation slice is defined with ID, goal, files, and 2-5 acceptance criteria.
2. The proposed slice contains at most one status keyword, one clear timing rule, and one or two content touchpoints.
3. The plan explicitly excludes stacks, durations, cleanse/dispel systems, resistances, damage types, crit/dodge, broad status engines, and unrelated content.
4. `NEXT_SESSION.md` is rewritten to a ready implementation slice or a clearly selected deferred next slice.

### Candidate first-slice shape to consider

Prefer a very small vertical unless the user chooses otherwise:

- One keyword such as `Guarded`, `Bleed`, `Stunned`, or `Marked`.
- One timing rule that can be explained in a single sentence.
- One existing unit or one small encounter edit using the keyword.
- Combat log text and minimal card/readability support.
- No generalized status framework beyond what the one keyword needs.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
