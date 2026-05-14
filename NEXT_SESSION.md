# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M6.1 — Scout panel and encounter list wiring

**Milestone:** M6 - Full 10-Round Run (first slice)
**Slice goal:** Add Scout state, Scout panel UI, EncounterManager, and populate DataRepository with all 10 encounters. Wire the state machine so each round progresses StartRun → Scout → Shop. Display encounter name, type, scout text, and reward. No hero/enemy effect implementation yet; plain encounters with zero behavioral effects so the round flow is testable end-to-end.

### Background

M5.2 AC5 (multi-round economy) and R002 (round-advance routing) are now fixed. The core loop Shop → Formation → Payroll → Combat → Reward → Upkeep → (next round's Shop) is solid. M6.1 adds the missing Scout state before Shop and populates the 10-encounter list so the game progresses through a full run with visible variety. Hero/enemy effects (which make encounters mechanically distinct) are deferred to M6.2 so M6.1 can focus on state routing and UI.

### Acceptance criteria

1. **Scout state wiring.** After `StartRun` or after each `RivalUpdate`, the next state is `Scout` (not `Shop`). Continue from Scout transitions to Shop.
2. **Scout panel displays encounter info.** For each round 1–10, Scout panel shows: encounter name, type ("Dungeon" / "RivalGhost" / "FinalBoss"), scout text (from §8 of IMPLEMENTATION_PLAN.md), reward gold. No rival leaderboard or advanced UI; just the core scout text and continue button.
3. **EncounterManager loads encounters.** `EncounterManager.LoadEncounter(round)` returns the correct `EncounterDefinition` for that round. Enemies are populated and assigned to formation slots (frontline first, then backline).
4. **10 encounters in DataRepository.** All 10 rounds are defined in `DataRepository.Encounters` as a static list: Slimes (R1), Goblin Thieves (R2), placeholder ghost (R3), Tax Collector (R4), Backline Bat (R5), placeholder ghost (R6), Debt Wraith (R7), Treasure Leech (R8), placeholder ghost (R9), Dungeon Auditor (R10). Placeholders for R3/R6/9 use `SandboxEncounter` (Slimes) until M7.
5. **Round 1–10 progression visible.** Start a new run and progress through all 10 rounds: verify Scout appears each round with correct encounter name; continue through Shop/Formation/Payroll/Combat for each round; Reward Summary shows per-round reward; confirm Victory screen after Round 10 win.
6. **No hero/enemy behavioral effects.** Encounters have no special rules (Goblin Thief steal, Tax Collector upkeep, Debt Wraith scaling, Treasure Leech drain, Backline Bat targeting, Dungeon Auditor periodic damage) yet. Combat resolves as plain DPS race. Effects deferred to M6.2.

### Files Claude Code may create

```
DungeonDebt/Assets/Scripts/Run/EncounterManager.cs
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs
TestPlans/TP_M6.1.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Core/GameManager.cs
  — Add StartRun → Scout wiring; add Scout state handling

DungeonDebt/Assets/Scripts/Core/DataRepository.cs
  — Populate Encounters list with all 10 encounter definitions

DungeonDebt/Assets/Scripts/Core/GameState.cs
  — Ensure GameState.Scout exists (likely already defined); no other changes

DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
  — Build and show ScoutPanelView; add Scout branch to HandleStateChanged

DungeonDebt/Assets/Scripts/Run/RunManager.cs
  — Wire EncounterManager into the run flow; call LoadEncounter(round) at Scout entry or Store the loaded encounter on RunState for Combat/effect-application phases
```

### Files Claude Code does NOT create or modify

- CombatManager.cs — combat logic unchanged
- HeroEffects.cs — remains stubs until M6.2
- PayrollManager.cs, PayrollPanelView.cs, etc. — payroll unchanged
- ShopManager.cs, ShopPanelView.cs, FormationPanelView.cs — unchanged
- RivalManager.cs, RivalLeaderboardView.cs — rivals deferred to M7
- Resources/, StreamingAssets/, Tests/, Editor/
- PROGRESS.md or REGRESSIONS.md during implementation

### Open questions to resolve at plan time

1. **EncounterManager location and integration.** Should `EncounterManager` be a new component on GameManager (like ShopManager, PayrollManager), or should it be called on-demand by RunManager? Recommendation: **new component on GameManager**, initialized in `EnsureManagers`. RunManager calls `_gameManager.EncounterManager.LoadEncounter(round)` when Scout state is entered.

2. **Encounter storage on RunState.** The loaded `EncounterDefinition` needs to be available during Combat and Reward phases (for reward math, enemy effects, etc.). Store it in `RunState.CurrentEncounter` so it persists across Scout → Shop → Formation → Payroll → Combat. Or pass it separately through the call chain? Recommendation: **store on RunState** so managers don't need deeper call chains.

3. **Scout panel compact form.** The full leaderboard is deferred to M7. Scout panel in M6.1 should be minimal: just name, type, scout text, reward, and Continue button. No rival stats row. Yes/No?

4. **Enemy formation setup.** Do enemies auto-populate into the 5-slot formation based on `EncounterDefinition.Enemies` in order (slots 0, 1, 2, …), or does EncounterManager do the slot assignment? Recommendation: **EncounterManager.LoadEncounter** returns an encounter with a pre-populated `List<CombatUnit>` or the list of enemies pre-sorted by intended slot. CombatManager.StartCombat then uses them as-is.

5. **Placeholder ghost encounters (R3, R6, 9).** Until M7, should R3/R6/9 reuse Slimes (SandboxEncounter), or should they be distinct placeholder teams (e.g., "3 Goblins" or "Treasure Leech clone")? Recommendation: **reuse SandboxEncounter (Slimes)** for speed; M7 will replace them with proper ghost teams.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` §8 — Encounter table, scout text (exact text from GAME_DESIGN.md lines 1010, 1029, …), enemy formations, encounter effects (effects themselves are **not** implemented in M6.1, just the encounter data is defined).
- `IMPLEMENTATION_PLAN.md` §3 (State Machine) — Scout state entry/transition.
- `IMPLEMENTATION_PLAN.md` §11 (Milestone 6) — full M6 scope and AC (M6.1 is a subset).
- `GAME_DESIGN.md` §10 (Encounters) — brief flavor text for each round (optional reading if tester wants lore context).
- `REGRESSIONS.md` — R002 is now Closed; no open blockers for M6.1.

### Notes from previous slice (R002)

- R002 fixed: round-advance now routes Shop → Formation → Payroll → Combat → Reward → Upkeep → Shop (next round) instead of jumping to Combat.
- M5.2 AC5 multi-round economy is now verifiable and passes.
- Cleanup items still pending: `RunManager.PrepareSandboxRun()` / `DataRepository.CreateSandboxRun()` are unreferenced; defer to a dedicated cleanup slice after M6/M7.

### Test plan output

Claude Code creates `TestPlans/TP_M6.1.md` covering:

- **Happy path:** Start Run → Scout visible with Round 1 encounter name/type/text → Continue → Shop → ... → Combat → Reward → Continue → Scout visible with Round 2 name/type/text. Repeat for 3 rounds to confirm the cycle.
- **Full 10-round sweep:** Play all 10 rounds, confirming Scout appears each round with correct name and type. Verify encounter variety (at least 5 distinct names visible). Final round shows Dungeon Auditor (R10); win triggers Victory screen.
- **Encounter data checks:** Inspect DataRepository.Encounters list in Inspector or source; verify all 10 entries are populated. Spot-check a few encounters (R1 Slimes reward=8, R4 Tax Collector, R10 Auditor HP=20).
- **State machine checks:** Verify state transitions StartRun → Scout → Shop each round. No direct Shop entry after StartRun (Scout must intercede). After 10 rounds, Upkeep → Victory (not Shop).
- **Rule checks:** No UnityEngine.Random, no magic numbers in encounter selection, EncounterManager is called only at Scout entry, enemies populate into formation slots, no hero/enemy effect code yet.
- **Regression checks:** Rerun TP_R002 Scenario A (Reward → Round 2 Shop) to confirm round-advance still works with Scout inserted.
- **Observable invariants:** `RunState.Round` increments each round; `RunState.CurrentEncounter` is set at Scout entry and used through Combat/Reward; Scout text matches `IMPLEMENTATION_PLAN.md` §8 table.

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
