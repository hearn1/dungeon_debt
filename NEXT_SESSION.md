# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M14.0 - Act 2 mini vertical planning

**Milestone:** M14 - Act 2 mini vertical
**Slice goal:** Define the first implementable Act 2 mini-vertical slice without coding it yet.

### Why this slice exists

M13.1 reframed the current 10-round dungeon as **Act 1** and added a victory handoff shell. The user completed `TestPlans/TP_M13.1.md`; one Act 2 text clipping issue was fixed immediately, and the slice is accepted.

The next Phase 3 vertical in `IMPLEMENTATION_PLAN.md` section 16 is M14: a small Act 2 follow-up. M14 is currently defined only at milestone level, so the next session should make the first implementation slice ready before any code changes begin.

### Scope

**Approved for M14.0:**
- Re-read the Phase 3 vertical rules in `IMPLEMENTATION_PLAN.md` section 16.
- Re-read M13.1 context in `PROGRESS.md` and the current accepted Act 1 framing.
- Decide the exact first Act 2 implementation slice.
- Define the first slice's one-sentence goal.
- List files to create or modify for that first slice.
- Write 2-5 acceptance criteria for that first slice.
- Keep Act 2 small: 3-5 encounters using existing systems only, per M14.
- Rewrite `NEXT_SESSION.md` at the end so it describes the chosen ready M14.1 slice.

**Not approved for M14.0:**
- Do not implement Act 2 gameplay yet.
- Do not add Act 2 encounters, enemies, rewards, UI, or state flow in this planning session.
- Do not add save/load, campaign maps, branching paths, campaign selection, persistent carry-forward state, relics/loot, equipment, inventory, XP/veterancy, difficulty modes, tutorials, damage/status types, new heroes, new resource types, audio, animation, or new scenes.
- Do not change combat math, economy math, debt repayment, rival simulation, hero/enemy effects, or existing Act 1 balance.

### Definition of ready

- ID: M14.0.
- One-sentence goal: above.
- Files to create/modify are listed below.
- Acceptance criteria are listed below.
- No open blocker regressions in `REGRESSIONS.md` at handoff time.
- M13.1 passed manual testing after the small end-screen copy fit adjustment.

### Relevant plan sections

- `IMPLEMENTATION_PLAN.md` section 16, especially "Phase 3 vertical order", "Phase 3 scope rules", and "Milestone 14: Act 2 mini vertical".
- `IMPLEMENTATION_PLAN.md` section 3 for the current state machine and victory/defeat flow.
- `IMPLEMENTATION_PLAN.md` section 8 for existing encounter patterns.
- `IMPLEMENTATION_PLAN.md` section 10 for existing UI surfaces.
- `GAME_DESIGN.md` "Updated Core Loop", "Round Flow", "MVP Encounter List", "Win and Loss Conditions", and "MVP Scope".
- `CLAUDE.md` / `AGENTS.md` Scope control: M14 may plan a small Act 2 vertical only; broad campaign systems remain out of scope.

### M13.1 carry-forward context

- The current 10-round dungeon now presents as Act 1 in the run header and scout/status copy.
- Victory shows `Act 1 Clear`.
- The victory reason is two lines:

```text
Auditor defeated.
Act 2 is not implemented yet.
```

- The victory stats include a future-facing handoff note: `Future handoff: review party, gold, debt, morale.`
- There is no Act 2 gameplay, carry-forward state, save/load, map, or extra round yet.
- M13.2 is not needed unless later copy/layout feedback appears.

### Likely Files Claude Code May Modify

```
NEXT_SESSION.md             - end-of-session rewrite only, to describe the chosen ready M14.1 slice.
PROGRESS.md                 - end-of-session entry only, if the user asks Claude Code to update it directly.
```

### Files Claude Code May Read But Should Not Modify Unless Planning Expands

```
IMPLEMENTATION_PLAN.md
GAME_DESIGN.md
CLAUDE.md
AGENTS.md
SESSION_PROTOCOL.md
REGRESSIONS.md
PROGRESS.md
NEXT_SESSION.md
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Data/EncounterDefinition.cs
DungeonDebt/Assets/Scripts/Run/EncounterManager.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
```

### Files Claude Code Does NOT Touch

- `DungeonDebt/Assets/Scenes/Main.unity`, prefabs, and `Assets/Art/**`.
- Gameplay source files for Act 2 content during M14.0.
- `REGRESSIONS.md` unless a new regression is found and the user asks to file it.
- Any files for save/load, campaign maps, branching paths, campaign selection, persistent carry-forward state, relics/loot, equipment, inventory, XP/veterancy, difficulty modes, tutorials, damage/status types, new heroes, new resource types, audio, animation, or new scenes.

### Acceptance criteria

1. The session chooses one concrete M14.1 slice that stays within M14's small Act 2 mini-vertical scope.
2. M14.1 has a one-sentence goal, a files-to-create/modify list, and 2-5 acceptance criteria.
3. Open questions about Act 2 flow, carry-forward assumptions, encounter count, and victory/defeat handling are resolved or explicitly deferred.
4. No code or Unity assets are changed during M14.0.
5. `NEXT_SESSION.md` is rewritten to describe the ready M14.1 implementation slice.

### Planning prompts to answer in M14.0

- Does Act 2 begin only after an Act 1 victory, or is M14.1 just a data/state shell that can be manually reached for testing?
- How many Act 2 encounters should the first mini vertical include: 3, 4, or 5?
- Does the first Act 2 slice reuse existing enemies only, or may it add a very small number of new enemies under M14?
- What exactly carries into Act 2 for the first pass: party/gold/debt/morale as live state, or copy-only until a later slice?
- What is the Act 2 temporary end condition for the first mini vertical?

### Suggested M14.1 Shape (do not implement in M14.0)

A conservative likely first implementation slice is:

**M14.1 - Act 2 state shell + 3 encounter data pass**

Possible shape: after Act 1 clear, let the player choose to continue into a short Act 2 test sequence with 3 encounters using the existing Scout -> Shop -> Payroll -> Formation -> Combat -> Reward loop, ending in a temporary Act 2 complete screen. Exact scope should be confirmed in M14.0 before coding.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
