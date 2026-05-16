# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M13.1 - Act 1 framing and transition shell

**Milestone:** M13 - Act 1 framing and transition shell
**Slice goal:** Reframe the existing 10-round dungeon as Act 1 and add a clear act-complete handoff shell without building Act 2 content.

### Why this slice exists

M12.1 made debt more readable and recoverable through status labels and Shop repayment. The user completed `TestPlans/TP_M12.1.md` with no issues and chose to skip the optional M12.2 retest slice. The next Phase 3 vertical in `IMPLEMENTATION_PLAN.md` section 16 is M13: Act 1 framing and transition shell.

The current prototype already has a complete 10-round run. M13 should make that run read as **Act 1** and make victory feel like clearing Act 1, while keeping the actual playable content unchanged.

### Scope

**Approved for M13.1:**
- Add Act 1 naming/copy to existing UI surfaces where it helps orientation.
- Make the final victory screen read as an Act 1 clear rather than a full campaign ending.
- Add a placeholder Act 2 handoff shell/copy that clearly says the next act is not implemented yet.
- Document, in UI copy, what would conceptually carry forward only if this becomes a multi-act campaign later.
- Reuse existing UI surfaces first: run header, scout/status text, reward/end screen.
- Create `TestPlans/TP_M13.1.md` with checks for Act 1 copy, victory handoff, and unchanged 10-round gameplay flow.

**Not approved for M13.1:**
- Do not build Act 2 encounters.
- Do not add more rounds.
- Do not add a map, branching path, campaign selection, save/load, or carry-forward state.
- Do not add new heroes, enemies, payroll actions, relics/loot, equipment, inventory, XP/veterancy, difficulty modes, tutorials, damage/status types, or new resource types.
- Do not change combat math, economy math, debt repayment, Debt Wraith mechanics, rival simulation, or hero/enemy effects.
- Do not add new scenes, ScriptableObjects, Resources, StreamingAssets, Tests, or Editor folders.

### Definition of ready

- ID: M13.1.
- One-sentence goal: above.
- Files to create/modify are listed below.
- Acceptance criteria are listed below.
- No open blocker regressions in `REGRESSIONS.md` at handoff time.
- M12.1 passed manual testing with no issues.

### Relevant plan sections

- `IMPLEMENTATION_PLAN.md` section 16, especially "Milestone 13: Act 1 framing and transition shell".
- `IMPLEMENTATION_PLAN.md` section 3 for state machine flow and victory/defeat states.
- `IMPLEMENTATION_PLAN.md` section 10 for existing UI panels.
- `GAME_DESIGN.md` "Updated Core Loop", "Win and Loss Conditions", and "MVP Scope".
- `CLAUDE.md` / `AGENTS.md` Scope control: M13 is framing/handoff only; Act 2 content is out of scope.

### M12.1 carry-forward context

- Debt status labels and Shop Pay Debt are complete and manually tested clean.
- M12.2 retest/tuning is intentionally skipped for now by user decision.
- Current 10-round balance is acceptable as Act 1 / initial difficulty.
- The next vertical is framing the existing run as Act 1, not expanding content yet.

### Likely Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs      - optional Act 1 label near round/current run info if layout supports it.
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs     - optional Act 1 framing copy around the current encounter.
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs      - Act 1 clear wording and placeholder Act 2 handoff on victory.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs      - optional status/button copy if needed for the handoff shell.
TestPlans/TP_M13.1.md                               - NEW: manual Act 1 framing + victory handoff test plan.
PROGRESS.md                                         - end-of-session entry only, if the user asks Claude Code to update it directly.
NEXT_SESSION.md                                     - end-of-session rewrite only, to describe the next slice.
```

### Files Claude Code May Read But Should Not Modify Unless Planning Expands

```
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
DungeonDebt/Assets/Scripts/UI/RivalLeaderboardView.cs
```

### Files Claude Code Does NOT Touch

- `DungeonDebt/Assets/Scenes/Main.unity`, prefabs, and `Assets/Art/**`.
- `GAME_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`, `AGENTS.md`, or `SESSION_PROTOCOL.md`.
- `REGRESSIONS.md` unless a new regression is found and the user asks to file it.
- Any files for Act 2 gameplay content, new encounters, map/campaign systems, loot/relics, XP, damage/status types, difficulty selection, save/load, new enemies, new heroes, or new resources.

### Acceptance criteria

1. Existing 10-round run is clearly framed as Act 1 in at least one persistent or high-visibility UI surface.
2. Victory after round 10 reads as clearing Act 1 and shows a placeholder Act 2 handoff without starting Act 2.
3. Defeat flow remains clear and does not imply Act 2 is reached.
4. No gameplay flow, combat math, economy math, debt repayment, hero/enemy effects, or rival mechanics change.
5. `TestPlans/TP_M13.1.md` exists with happy path, edge cases, observable invariants, and targeted regression checks.

### Manual test plan requirements

`TestPlans/TP_M13.1.md` should include:

- Start-run/header or scout copy confirms the run is Act 1.
- Normal Scout -> Shop -> Payroll -> Formation -> Combat -> Reward -> Rival Update flow still works.
- Victory after round 10 shows Act 1 clear and the not-yet-implemented Act 2 handoff.
- Defeat by morale/debt/final-boss loss still shows a defeat state, not the Act 2 handoff.
- No UI copy promises playable Act 2 content.
- No additional rounds, scenes, save/load, or carry-forward state appear.

### Suggested M13.2 Shape (do not start in M13.1)

If M13.1 lands cleanly, M13.2 can be a tiny polish/follow-up only if manual testing shows copy/layout issues. Otherwise proceed to planning M14 Act 2 mini vertical in a separate session.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
