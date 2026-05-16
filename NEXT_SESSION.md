# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M17.0 - Narrow veterancy planning + first-slice definition

**Milestone:** M17 - Narrow veterancy  
**Slice goal:** Define the first small, approved veterancy implementation slice so M17 stays capped, readable, and does not become a full XP/leveling/progression system.

### Why this slice exists

M16 added global relic rewards successfully. The next Phase 3 vertical in `IMPLEMENTATION_PLAN.md` is M17 narrow veterancy, but the plan only defines it at milestone level: "at most one veteran bump per hero, with no skill tree and no branching choices." Before coding, M17 needs an explicit first slice with a tiny data/UI/effect shape and clear acceptance criteria.

### Scope

**In scope for M17.0:**
- Re-read Phase 3 scope rules and M17 in `IMPLEMENTATION_PLAN.md` section 16.
- Decide whether the first implementation slice should use:
  - per-hero combat participation tracking,
  - per-hero boss-win tracking,
  - or a simpler end-of-act veteran bump.
- Define exactly what "Veteran" means for the first pass:
  - one capped bump per hero,
  - no branching choices,
  - no skill tree,
  - no class evolution,
  - no meta progression.
- Define the first M17 implementation slice with:
  - slice ID and one-sentence goal,
  - files to create/modify,
  - 2-5 acceptance criteria,
  - manual test expectations,
  - explicit out-of-scope list.
- Prefer a tiny vertical that proves the loop: hero qualifies -> hero receives one visible capped bump -> bump affects existing combat/readability surface -> no persistence beyond the current run.
- Rewrite `NEXT_SESSION.md` to the approved M17.1 implementation slice.

**Not in scope for M17.0:**
- Writing implementation code unless the user explicitly chooses to collapse planning and implementation into one session after the protocol checkpoints.
- XP bars, XP currency, level numbers, repeated leveling, skill trees, branching choices, class upgrades, new abilities, unlocks, achievements, save/load, meta progression, or persistent currency.
- New heroes, enemies, encounters, relics, payroll actions, difficulty presets, status keywords, crit/dodge/types, or combat algorithm changes beyond the eventual approved veteran bump.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.
- Art, audio, animations, particles, tween libraries, or screen shake.

### Definition of ready

- ID: M17.0.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 4, below.
- No open blocker regressions in `REGRESSIONS.md` currently block planning.

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: Phase 3 scope rules and "Milestone 17: Narrow veterancy".
- `CLAUDE.md` / `AGENTS.md` Scope control, architectural rules, and "Definition of ready".
- `SESSION_PROTOCOL.md` seven-step session flow.
- `PROGRESS.md` latest M16/M15 entries.
- `REGRESSIONS.md` Open section.
- `GAME_DESIGN.md` combat, run-flow, and scope sections only if needed.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (last 2-3 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (only relevant combat/run-flow/scope sections if needed)
DungeonDebt/Assets/Scripts/Data/HeroInstance.cs
DungeonDebt/Assets/Scripts/Data/RunState.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/UI/HeroCardView.cs
DungeonDebt/Assets/Scripts/UI/FormationPanelView.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
```

### Files Claude Code Should Create

```
None expected for M17.0 planning.
```

### Files Claude Code Should Modify

```
NEXT_SESSION.md - rewrite to the approved M17.1 implementation brief.
```

### Files Claude Code Does NOT Touch

- `PROGRESS.md` / `REGRESSIONS.md` directly; draft summary text for the user instead.
- Unity scene, prefabs, art assets, project settings, or generated Unity folders.
- Any gameplay source file unless the user explicitly approves implementation after M17.0 planning.
- Existing relic, difficulty, shop, payroll, rival, encounter, save/load, or art systems.

### Acceptance criteria

1. The first M17 implementation slice is defined with ID, goal, files, and 2-5 acceptance criteria.
2. The proposed first slice stays inside one capped per-hero veteran bump and does not introduce XP bars, repeated levels, skill trees, branching choices, class evolution, unlocks, save/load, or meta progression.
3. Open questions are resolved or carried explicitly into the next implementation brief.
4. `NEXT_SESSION.md` is rewritten to the ready M17.1 implementation slice.

### Candidate first-slice shape to consider

Prefer something this small unless the user chooses otherwise:

- A hero becomes Veteran once per run after participating in a fixed number of won combats or after surviving an act-ending boss win.
- Veteran is a boolean on `HeroInstance`, not a level number.
- Veteran grants a simple existing-stat bump such as +1 attack or +2 max HP, with values in `GameRules`.
- Hero cards or formation cards show a small `Veteran` label.
- The reward/end-of-act summary calls out newly veteran heroes.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
