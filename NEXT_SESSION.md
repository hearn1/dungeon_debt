# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M7.3 - M7 full-run verification and milestone closeout

**Milestone:** M7 - Rival Ghosts
**Slice goal:** Run one final M7 verification pass across rival leaderboard, scripted ghost fights, reward/morale rules, and the full 10-round loop; fix only any regressions found inside M7 scope.

### Background

M7.1 completed local scripted rival state, RivalUpdate flow, and Scout/RivalUpdate leaderboard display. R003 fixed hire placement after formation movement. M7.2 replaced the Round 3/6/9 Slime placeholder ghost fights with scripted Greedy, Carry, and Frugal ghost teams, added ghost reward/loss modifiers, and reused Priest-style healing for the Frugal Healer.

`TestPlans/TP_M7.2.md` was run by the user and all tests appeared to be passing.

M7 should now be close to complete. This slice is a closeout pass, not a feature expansion. Do not add new rival systems, online ghosts, replay, accounts, dynamic drafting, visual ghost effects, new UI screens, or extra content.

### Acceptance Criteria

1. **Full M7 loop verified.** A run can proceed through Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> RivalUpdate -> Scout, including rounds 3, 6, and 9 ghost fights.
2. **Leaderboard behavior preserved.** Scout shows the compact leaderboard, RivalUpdate shows the full leaderboard, and rival stats advance once per non-terminal round using the M7.1 scripted rules.
3. **Ghost fights verified.** Round 3 Greedy, Round 6 Carry, and Round 9 Frugal ghost fights use their scripted teams and no longer use Slime placeholders.
4. **Reward/morale rules verified.** Ghost wins award +10 gold, ghost losses apply -8 morale, and normal dungeon fights still use normal reward/loss math.
5. **Milestone closeout ready.** Any regressions found are either fixed within M7 scope or filed in `REGRESSIONS.md`; no out-of-scope features are added.

### Files Claude Code May Create

```
TestPlans/TP_M7.3.md
```

### Files Claude Code May Modify

Only if verification finds a regression:

```
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Data/GameEnums.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Run/RivalManager.cs
DungeonDebt/Assets/Scripts/UI/RivalLeaderboardView.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
TestPlans/TP_M7.3.md
```

If no regression is found, create only the test plan and report the closeout verification results.

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden.
- New online, replay, account, server, matchmaking, save/load, or dynamic rival shop systems.
- New heroes, equipment, traits, factions, synergies, maps, tutorial, audio, VFX, or meta progression.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session unless the user explicitly asks for end-of-session doc updates.

### Relevant Context To Re-read During Orient

- `REGRESSIONS.md` Open section - confirm no open blocker before starting M7.3.
- `PROGRESS.md` latest entries - M7.2, R003, and M7.1.
- `IMPLEMENTATION_PLAN.md` §9 - Rival Ghost System Plan.
- `IMPLEMENTATION_PLAN.md` §11 Milestone 7 - expected output, required behavior, and manual test steps.
- `GAME_DESIGN.md` Rival Guild Ghost System and MVP Encounter List sections.
- `TestPlans/TP_M7.1.md`, `TestPlans/TP_R003.md`, and `TestPlans/TP_M7.2.md`.
- M7 implementation files touched by M7.1/M7.2.

### Test Plan Output

Claude Code creates `TestPlans/TP_M7.3.md` covering:

- **Happy path:** Complete a full run far enough to verify all three ghost fights and the RivalUpdate loop.
- **Edge cases:** Verify at least one ghost win, one ghost loss, one normal dungeon win, one normal dungeon loss, and terminal round behavior.
- **Rule checks:** No forbidden folders or out-of-scope rival systems; no `UnityEngine.Random`; scripted/local/deterministic rivals only.
- **Regression checks:** R003 hire placement remains fixed; M7.1 leaderboard behavior remains intact; M7.2 ghost teams and modifiers remain intact; M6 encounter effects still work.
- **Observable invariants:** Rival leaderboard always has 4 rows, ghost encounters have valid rival ids, rewards/morale match `GameRules`, and run flow advances exactly once per RivalUpdate.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
