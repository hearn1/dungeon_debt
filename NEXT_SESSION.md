# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M16.0 - Relic/policy rewards planning + first-slice definition

**Milestone:** M16 - Relic/policy rewards
**Slice goal:** Turn the broad M16 plan into a small approved vertical: define the first global policy/relic reward slice, lock its data/UI/effect shape, and rewrite `NEXT_SESSION.md` to a ready implementation brief.

### Why this slice exists

M15 difficulty modifiers are accepted enough to skip the optional M15.3 retest. The next likely item is M16, but `IMPLEMENTATION_PLAN.md` currently defines M16 only at milestone level: "global run modifiers presented as card choices, such as guild policies or relics that affect existing economy/combat hooks." Before coding, M16 needs a narrow first slice so it does not accidentally become inventory, equipment, a large loot pool, or a new progression system.

### Scope

**In scope for M16.0:**
- Re-read Phase 3 scope rules and M16 in `IMPLEMENTATION_PLAN.md` section 16.
- Define the first M16 implementation slice with:
  - Slice ID and one-sentence goal.
  - 2-4 global policy/relic choices max for the first vertical.
  - When choices are offered, how many are shown, and which existing screen owns the choice.
  - Which existing hooks they affect: economy, reward/upkeep, shop, or simple combat stat construction.
  - Files to create/modify.
  - 2-5 acceptance criteria.
- Prefer a tiny vertical that proves the full loop: present choices -> choose one -> store active run modifier -> apply one or two simple effects -> show active policy/relic in existing UI.
- Rewrite `NEXT_SESSION.md` to the approved implementation slice.

**Not in scope for M16.0:**
- Writing implementation code unless the user explicitly chooses to collapse planning and implementation into one session after the protocol checkpoints.
- Per-hero equipment, item slots, inventory, rarity ladders, large item pools, unlocks, meta progression, save/load, achievements, or accounts.
- New heroes, enemies, encounters, payroll actions, status keywords, crit/dodge/types, or combat algorithm changes.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.

### Definition of ready

- ID: M16.0.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 4, below.
- No open blocker regressions in `REGRESSIONS.md` currently block planning.

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: Phase 3 scope rules and "Milestone 16: Relic/policy rewards".
- `CLAUDE.md` / `AGENTS.md` Scope control, architectural rules, and "Definition of ready".
- `SESSION_PROTOCOL.md` seven-step session flow.
- `PROGRESS.md` latest M15 entries.
- `GAME_DESIGN.md` only if the proposed first relic/policy touches design intent for economy, combat, run flow, or debt.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (last 2-3 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (only relevant economy/combat/run-flow sections if needed)
DungeonDebt/Assets/Scripts/Data/RunState.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Run/ShopManager.cs
DungeonDebt/Assets/Scripts/Run/PayrollManager.cs
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
```

### Files Claude Code Should Create

```
None expected for M16.0 planning.
```

### Files Claude Code Should Modify

```
NEXT_SESSION.md - rewrite to the approved M16.1 implementation brief.
```

### Files Claude Code Does NOT Touch

- `PROGRESS.md` / `REGRESSIONS.md` directly; draft summary text for the user instead.
- Unity scene, prefabs, art assets, project settings, or generated Unity folders.
- Any gameplay source file unless the user explicitly approves implementation after M16.0 planning.

### Acceptance criteria

1. The first M16 implementation slice is defined with ID, goal, files, and 2-5 acceptance criteria.
2. The proposed first slice stays inside global run policy/relic rewards and does not introduce equipment, inventory, rarity ladders, unlocks, or meta progression.
3. Open questions are resolved or carried explicitly into the next implementation brief.
4. `NEXT_SESSION.md` is rewritten to the ready M16.1 implementation slice.

### Candidate first-slice shape to consider

Prefer something this small unless the user chooses otherwise:

- Offer one policy/relic choice after the first boss/Act 1 clear, or after a fixed early round.
- Show 2-3 choices on an existing panel, not a new screen if avoidable.
- Store selected global run modifiers on `RunState`.
- Start with simple effects like `+1 reward gold`, `-1 upkeep once per round`, or `shop reroll cost -1`, using `GameRules` constants.
- Display active policy/relic name in `RunHeaderView` or `RewardSummaryView`.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
