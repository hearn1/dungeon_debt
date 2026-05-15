# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: R003 - Fix hire placement after formation movement

**Milestone:** Regression fix before continuing M7
**Slice goal:** Ensure newly hired heroes are placed into an empty formation slot instead of using `run.Party.Count`, so formation slots never stack after the player has moved existing heroes.

### Background

M7.1 completed the local scripted rival state, RivalUpdate loop, and Scout/RivalUpdate leaderboard. The M7.1 manual test plan passed, but testing found R003: after buying 2 heroes on day 1, moving them to `F0` and `B3`, then buying 2 more heroes on day 2, two heroes can occupy `B3`.

The likely cause is `ShopManager.Hire` assigning `new HeroInstance(offer.Hero, run.Party.Count)`. Once formation editing creates gaps or moves heroes to later slots, `run.Party.Count` is no longer guaranteed to be an empty formation slot.

Fix this regression before proceeding to M7.2 ghost teams, because duplicated formation slots can affect targeting, combat order, and manual test reliability.

### Acceptance Criteria

1. **Empty-slot hire placement.** Hiring a hero assigns the first empty formation slot from `0` to `GameRules.MaxPartySize - 1`; it never assigns a slot already occupied by another party member.
2. **Regression repro fixed.** The R003 repro path (buy 2 heroes, move to `F0`/`B3`, advance to day 2, buy 2 more) results in four heroes occupying four distinct slots.
3. **Fire behavior remains valid.** Firing a hero still leaves the party in a valid, non-stacked formation state and does not break subsequent hiring.
4. **Formation UI stays truthful.** `FormationPanelView` shows every party member exactly once when party size is 1-5; no hidden/overwritten hero cards due to duplicate slots.
5. **Existing flow preserved.** Shop -> Formation -> Payroll -> Combat -> Reward -> RivalUpdate -> Scout remains intact, and M7.1 leaderboard behavior is unchanged.

### Files Claude Code May Create

```
TestPlans/TP_R003.md
```

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/Run/ShopManager.cs
  - Change hire placement from `run.Party.Count` to a first-empty-slot lookup.
  - Keep hire cost, party cap, purchased flag, and gold checks unchanged.

DungeonDebt/Assets/Scripts/Run/RunManager.cs
  - Only modify if a small shared helper for slot occupancy is clearly cleaner than keeping the logic inside `ShopManager`.
```

### Files Claude Code Does NOT Create or Modify

- `CombatManager.cs`, `HeroEffects.cs`, `DataRepository.cs` - not needed for this regression.
- `FormationPanelView.cs` - avoid changes unless source inspection proves it is also responsible for hiding stacked heroes.
- `RivalManager.cs`, `RivalLeaderboardView.cs`, `GameManager.cs`, `MainMenuPanel.cs` - M7.1 should remain unchanged unless verification reveals the regression fix needs a tiny refresh hook.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session.

### Relevant Context To Re-read During Orient

- `REGRESSIONS.md` Open section - R003.
- `IMPLEMENTATION_PLAN.md` §4 - `HeroInstance.FormationSlot` and `RunState.Party`.
- `IMPLEMENTATION_PLAN.md` §10 - formation panel display expectations.
- `IMPLEMENTATION_PLAN.md` §11 Milestone 3/4/7 - shop, formation, and current M7 flow.
- `CLAUDE.md` architectural and scope rules, especially no new architecture and no automated Unity test folders.

### Test Plan Output

Claude Code creates `TestPlans/TP_R003.md` covering:

- **Happy path:** Reproduce R003 and verify each hire lands in a unique slot.
- **Edge cases:** Hire into gaps at early, middle, and late slots; party at 5/5 rejects further hires; fire then hire again.
- **Rule checks:** No `UnityEngine.Random`; no new folders; no out-of-scope systems.
- **Regression checks:** M7.1 leaderboard still appears in Scout/RivalUpdate; Shop -> Formation -> Payroll -> Combat -> Reward -> RivalUpdate -> Scout still works.
- **Observable invariants:** Party members always have unique slots in range `0-4`; Formation shows every party member exactly once.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
