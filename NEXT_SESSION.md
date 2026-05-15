# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M7.2 - Scripted rival ghost teams and ghost fight modifiers

**Milestone:** M7 - Rival Ghosts
**Slice goal:** Replace the Round 3/6/9 Slime placeholder encounters with scripted rival ghost teams and apply the MVP ghost win/loss reward and morale modifiers.

### Background

M7.1 completed the local scripted rival state, RivalUpdate loop, and Scout/RivalUpdate leaderboard. R003 then fixed hire placement after formation movement, and `TestPlans/TP_R003.md` passed.

The remaining M7 prototype work is to make the scheduled rival ghost fights real enough to test: rounds 3, 6, and 9 should no longer be Slime placeholders, and ghost fights should apply the design's special reward/morale rules:

- Ghost win: base 8 gold + 2 bonus gold.
- Ghost loss: -8 morale.
- Rivals remain local, deterministic, and scripted. Do not build full rival shop simulation, dynamic drafting, online ghosts, replay, accounts, or leaderboards beyond the existing local leaderboard.

### Acceptance Criteria

1. **Round 3 ghost encounter.** Round 3 is a Greedy Guild ghost fight with a scripted enemy team that is visibly different from Slimes in Scout and combat.
2. **Round 6 ghost encounter.** Round 6 is a Carry Guild ghost fight with a scripted enemy team that emphasizes a protected/high-damage carry.
3. **Round 9 ghost encounter.** Round 9 is a Frugal Guild ghost fight with a scripted enemy team that is stable/efficient and distinct from the other ghost fights.
4. **Ghost reward/loss rules.** Winning a rival ghost fight awards `GameRules.WinReward + GameRules.RivalWinBonus`; losing a rival ghost fight applies `GameRules.RivalLossMorale` instead of the dungeon loss morale value.
5. **Existing M7 flow preserved.** Scout -> Shop -> Payroll -> Formation -> Combat -> Reward -> RivalUpdate -> Scout remains intact, and the M7.1 leaderboard behavior is unchanged.

### Files Claude Code May Create

```
TestPlans/TP_M7.2.md
```

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
  - Replace Round 3/6/9 Slime placeholders with scripted RivalGhost encounters.
  - Add any needed static enemy definitions for Greedy, Carry, and Frugal ghost teams.
  - Set encounter type, scout text, danger category, and rival guild id for each ghost encounter.

DungeonDebt/Assets/Scripts/Run/RunManager.cs
  - Apply rival ghost reward and morale modifiers during post-combat result math.
  - Use existing GameRules constants where possible.

DungeonDebt/Assets/Scripts/Core/GameRules.cs
  - Only modify if source inspection shows an M7.2 numeric rule is missing. Prefer existing `RivalWinBonus` and `RivalLossMorale`.
```

### Files Claude Code Does NOT Create or Modify

- `RivalManager.cs` and `RivalLeaderboardView.cs` - M7.1 scripted rival progression and display should remain unchanged unless verification proves a tiny compatibility update is required.
- `ShopManager.cs`, `FormationPanelView.cs`, `PayrollManager.cs` - R003/M4/M5 behavior should not be touched for this slice.
- `CombatManager.cs` and `HeroEffects.cs` - avoid changes unless source inspection proves ghost teams require no-new-feature compatibility wiring.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session.

### Relevant Context To Re-read During Orient

- `REGRESSIONS.md` Open section - confirm no open blocker before starting M7.2.
- `PROGRESS.md` latest entries - R003 and M7.1.
- `IMPLEMENTATION_PLAN.md` §9 - Rival Ghost System Plan.
- `IMPLEMENTATION_PLAN.md` §11 Milestone 7 - expected M7 output and scope limits.
- `GAME_DESIGN.md` Rival Guild Ghost System and MVP Encounter List sections.
- `DataRepository.cs` current encounter list and placeholder Round 3/6/9 entries.
- `RunManager.cs` current reward and morale math.

### Test Plan Output

Claude Code creates `TestPlans/TP_M7.2.md` covering:

- **Happy path:** Reach rounds 3, 6, and 9; verify each Scout and combat uses the correct scripted ghost encounter.
- **Edge cases:** Win and intentionally lose at least one ghost fight; verify reward and morale modifiers.
- **Rule checks:** No online ghosts, replay, accounts, full rival shop simulation, `UnityEngine.Random`, new forbidden folders, or out-of-scope systems.
- **Regression checks:** R003 formation slot uniqueness remains fixed; M7.1 leaderboard still appears in Scout/RivalUpdate; normal dungeon fights still use dungeon reward/loss math.
- **Observable invariants:** RivalGhost encounters have non-null rival guild ids; ghost rewards and morale changes match `GameRules`; run flow still advances through RivalUpdate once per non-terminal round.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
