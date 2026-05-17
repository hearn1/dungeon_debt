# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M20.1 - Act 2 full 10-round demonic skeleton

**Milestone:** M20 - Act expansion foundation
**Slice goal:** Extend Act 2 to a full 10-round act (rounds 11-20) with a demonic-themed encounter skeleton - Frugal/Greedy/Carry guild fights at slots 3/6/9 and a new demonic `FinalBoss` at round 20 - using deterministic single-candidate encounter pools (no encounter randomization yet).

### Why this slice exists

M19.3 generalized the code seams (data-driven `ActRoundCounts`, `(act, slot)` encounter keying with a `RunManager.Random` pool seam, typed `RivalGuild` dispatch, generalized `AdvanceToNextAct`, content-agnostic `RivalGhost OR FinalBoss` relic rule). M20.0 then locked the content shape: a reusable 10-slot act format, Act 2 as a demonic-themed act (rounds 11-20) with the round-20 final boss, the new demonic enemy asset list, the guild-evolution direction, the encounter-randomness rule, the late-hire catch-up proposal, and the major-view readability checklist. M20.1 is the **first implementation slice**: it fills the architecture with the Act 2 = rounds 11-20 demonic skeleton so a 20-round run is playable end-to-end. Full design rationale is in `IMPLEMENTATION_PLAN.md` section 16 "M20.0 act-format design outcome".

### Confirmed design direction (from M20.0, all user-locked)

- Act 2 becomes a **full 10-round act** (`GameRules.ActRoundCounts` `{10, 3}` -> `{10, 10}`), rounds 11-20, with a **demonic theme** as its own identity.
- Reusable 10-slot act template (see the M20.0 table in `IMPLEMENTATION_PLAN.md` section 16): slots 1-2 dungeon, slot 3 guild fight, slots 4-5 dungeon, slot 6 guild fight, slots 7-8 dungeon, slot 9 guild fight, slot 10 `FinalBoss` capstone.
- Guild-fight order by rough difficulty: **Frugal (slot 3) -> Greedy (slot 6) -> Carry (slot 9)**.
- Act 2 slot map and the 6 new demonic enemy assets are specified in `IMPLEMENTATION_PLAN.md` section 16 M20.0 ("New Act 2 enemy assets to author").
- Encounter pools for M20.1 are **single-candidate / deterministic** - no `RunManager.Random` variation this slice. Pooled dungeon variants are a later M20.x slice.
- Late-hire catch-up (act-aware minimum XP) is a proposal only - **not** implemented in M20.1.

### Scope

**In scope for M20.1:**
- `GameRules.ActRoundCounts` -> `{10, 10}`; add Act 2 enemy/boss numeric constants in `GameRules`.
- Author the 6 new Act 2 demonic enemy definitions in `DataRepository` (Imp, Soul Broker, Gloom Bat, Hoard Fiend, Brimstone Brute, and the Act 2 final boss - user picks the boss name).
- Author 10 `(2, slot)` encounter definitions per the M20.0 slot map; re-slot the existing Act 2 guild rematch encounters to `(2,3)/(2,6)/(2,9)` in Frugal->Greedy->Carry order; reuse Debt Wraith (retuned) at `(2,5)`.
- Generalize the `EndScreenView` "Act 1 Clear"/"Act 2 Complete" literals for N acts (M19.3 follow-up).
- Add `SpriteCatalog` / scene id->Sprite slots for the 6 new Act 2 enemies (presentation only, per `CLAUDE.md` M10.4 carve-out). Placeholder art is acceptable if final demonic art is not ready.
- `TestPlans/TP_M20.1.md`.

**Not in scope for M20.1:**
- Encounter-pool randomization (`RunManager.Random` variant selection) - later M20.x.
- Guild-evolution numeric tuning beyond the minimum needed to make Act 2 winnable - directional only this slice; a dedicated M20.x balance slice sets final numbers.
- Late-hire catch-up implementation.
- The Acts 3/4/5 structure decision (Option A environment-themed vs Option B guild-owned) - deferred design item.
- Major-view readability proposals - separate slice(s) before the bulk content beyond this skeleton.
- New heroes, new payroll actions, new relics/statuses, save/load, online, meta progression, equipment/inventory, tutorial, audio, architecture rewrites.

### Definition of ready

- ID: M20.1.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 5, below.
- No open Blocker regressions in `REGRESSIONS.md` block this work (Open section currently empty).

### Relevant plan/design sections

- `SESSION_PROTOCOL.md` seven-step session flow.
- `CLAUDE.md` scope control (Phase 3 carve-outs, M10.4 sprite carve-out), architectural rules (`GameRules` tuning surface, `DataRepository` read-only static, deterministic combat), definition of ready.
- `IMPLEMENTATION_PLAN.md` section 16: Milestone 20 + the **"M20.0 act-format design outcome"** subsection (act format, Act 2 slot map, enemy asset list, encounter-randomness rule, the ready M20.1 definition).
- `PROGRESS.md` latest M19/M20 entries.
- `REGRESSIONS.md` Open section.
- `GAME_DESIGN.md` rival guild system, encounter list, MVP scope reconciliation note in M20.0.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (latest M19/M20 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16, M20.0 act-format design outcome + M20.1)
GAME_DESIGN.md (rival guilds, encounter list)
DungeonDebt/Assets/Scripts/Core/GameRules.cs        (ActRoundCounts + act helpers)
DungeonDebt/Assets/Scripts/Core/DataRepository.cs   (EncounterDefinitions, Act2* enemy defs, GetEncounterPool, GetRivalEncounter)
DungeonDebt/Assets/Scripts/Data/EncounterDefinition.cs
DungeonDebt/Assets/Scripts/Data/EnemyDefinition.cs
DungeonDebt/Assets/Scripts/Run/EncounterManager.cs  (pool lookup seam)
DungeonDebt/Assets/Scripts/Run/RunManager.cs        (AdvanceToNextAct, relic/end-of-act)
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs      (act-clear copy to generalize)
```

### Files Claude Code Should Create

```
TestPlans/TP_M20.1.md
```

### Files Claude Code Should Modify

```
DungeonDebt/Assets/Scripts/Core/GameRules.cs       - ActRoundCounts -> {10,10}; Act 2 enemy/boss constants.
DungeonDebt/Assets/Scripts/Core/DataRepository.cs  - 6 new Act 2 demonic enemy defs; 10 (2,slot) encounters; re-slot guild rematches; reuse retuned Debt Wraith.
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs     - generalize Act 1/Act 2 literals for N acts.
DungeonDebt/Assets/Scenes/Main.unity (or SpriteCatalog component) - id->Sprite slots for the 6 new Act 2 enemies (presentation only).
IMPLEMENTATION_PLAN.md - mark M20.1 complete and leave the next M20.x slice ready (end-of-session).
NEXT_SESSION.md - rewrite for the next M20.x slice (end-of-session).
```

### Files Claude Code Does NOT Touch

- `RunManager.cs`, `EncounterManager.cs`, `RivalManager.cs`, `GameManager.cs`, `CombatManager.cs`, `HeroEffects.cs` logic - the M19.3 seams already support N acts; M20.1 is content + one UI copy generalization only. (Read them for understanding; do not change behavior.)
- `MainMenuPanel.cs` beyond any unavoidable mechanical wiring - flag and ask before touching.
- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- `GAME_DESIGN.md`, `CLAUDE.md`, `SESSION_PROTOCOL.md`.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.
- Encounter-pool randomization, late-hire catch-up, guild numeric balance pass - out of M20.1 scope.

### Acceptance criteria

1. `GameRules.ActRoundCounts` makes Act 2 a 10-round act (rounds 11-20); all act helpers and the Act 1->Act 2 transition resolve correctly for a 20-round run.
2. Act 2 has 10 authored `(2, slot)` encounters matching the M20.0 slot map: demonic dungeon slots, guild fights at slots 3/6/9 in Frugal->Greedy->Carry order, and a `FinalBoss` at round 20 that awards a relic via the existing `RivalGhost OR FinalBoss` rule.
3. The 6 new Act 2 demonic enemy definitions exist and are referenced only by Act 2 encounters; Debt Wraith is reused (retuned) at slot 15; no Act 1 encounter or enemy behavior changes.
4. End/act-transition copy is generalized (no hardcoded "Act 1"/"Act 2" literals) and a full 20-round run is completable in the Unity Editor.
5. All Act 2 encounter pools are single-candidate/deterministic (no `RunManager.Random` variation introduced this slice); combat remains deterministic.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
