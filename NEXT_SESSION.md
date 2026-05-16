# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M15.2 - Apply combat HP/damage multipliers + retune

**Milestone:** M15 - Difficulty modifiers
**Slice goal:** Read the four run-scoped combat multipliers already carried on `RunState` and apply them at the `CombatManager` unit-construction seams so the selected difficulty preset actually changes the fight, then do a light first-pass retune of the multiplier values.

### Why this slice exists

M15.0 locked the M15 design. M15.1 (complete) built the preset data model, MainMenu selection, and run-scoped **economy** application, and confirmed by code trace that the four combat HP/damage multipliers are stored on `RunState` but read **nowhere** in combat - so today difficulty only shifts economy (modest deltas) and the fight feels identical across presets. M15.2 closes that gap: it applies the carried multipliers and then tunes them.

### Locked design (from M15.0, unchanged)

| Preset | Hero HP | Hero dmg | Enemy HP | Enemy dmg |
|---|---|---|---|---|
| Apprentice Ledger (easy) | x1.25 | x1.0 | x1.0 | x0.85 |
| Standard Contract (default) | x1.0 | x1.0 | x1.0 | x1.0 |
| Predatory Interest (hard) | x1.0 | x1.0 | x1.20 | x1.20 |

**Hard constraint (from M15.0):** current health is the **floor** for both heroes and enemies - no preset reduces HP below today's values. All HP multipliers are >= 1.0 by construction; the rounding rule chosen this slice must not round a x1.0 HP below today's integer value (i.e. Standard must remain byte-identical to legacy combat).

The multiplier values live as named constants in `GameRules` (added in M15.1) and flow `DifficultyPreset` -> `RunManager.InitializeRun` -> `RunState.HeroHealthMultiplier` / `HeroDamageMultiplier` / `EnemyHealthMultiplier` / `EnemyDamageMultiplier`. M15.2 only **reads** those `RunState` fields - it does not re-plumb the data path.

### Scope

**In scope for M15.2:**
- Apply `RunState.HeroHealthMultiplier` and `RunState.HeroDamageMultiplier` to player units, and `RunState.EnemyHealthMultiplier` / `RunState.EnemyDamageMultiplier` to enemy units, at the `CombatManager` build seams (`BuildPlayerUnits`, `BuildEnemyUnits`).
- Thread `RunState` into `BuildEnemyUnits` (currently `EncounterDefinition`-only) via the existing `StartCombat` call path - no event bus, no new manager.
- Keep the multiplier application consistent everywhere a unit's max health is (re)computed for combat, including the between-round hero-health restore and any start/clone unit copy, so a difficulty never desyncs mid-combat (see risks).
- One agreed integer rounding rule for scaled health and attack, defined in `GameRules` or a single helper (no scattered `Mathf.RoundToInt` calls), that preserves the HP floor and keeps Standard == legacy.
- A light first-pass retune of the M15.0 multiplier constants only if combat testing shows a preset is trivially easy/impossible - conservative, constants in `GameRules` only.
- `TestPlans/TP_M15.2.md`.

**Not in scope for M15.2 (out of scope / later):**
- Any economy re-plumbing (M15.1 owns it and is done).
- New presets, new heroes/enemies/encounters/payroll, Act work, relics, XP, save/load, persistence, unlocks, achievements, a new screen.
- Status keywords, crit/dodge/types, or any combat-system expansion beyond a flat stat multiply.
- Reworking the combat resolution algorithm; only unit construction stats change.
- "Restart Sandbox bypasses the menu" cleanup (separate later UI pass, flagged in PROGRESS).

### Definition of ready

- ID: M15.2.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 5, below.
- No open blocker regressions in `REGRESSIONS.md` (none currently open).

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: "Milestone 15: Difficulty modifiers", "Phase 3 scope rules".
- `IMPLEMENTATION_PLAN.md` section 6 (combat flow / unit construction).
- `GAME_DESIGN.md` combat math section.
- `CLAUDE.md` / `AGENTS.md` Scope control + Phase 3 carve-outs; "Combat is deterministic".
- `PROGRESS.md` M15.1 entry (multipliers are carried, not applied - this slice applies them).

### Files Claude Code Should Read (inputs)

```
IMPLEMENTATION_PLAN.md (section 16, 6)
CLAUDE.md
SESSION_PROTOCOL.md
REGRESSIONS.md
PROGRESS.md (last 2-3 entries)
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs   (BuildPlayerUnits ~85, BuildEnemyUnits ~114, StartCombat caller, between-round restore ~258-262, start/clone copy ~286-292)
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs     (GetTierAdjustedMaxHealth - where hero max HP is derived)
DungeonDebt/Assets/Scripts/Data/RunState.cs          (the 4 multiplier fields)
DungeonDebt/Assets/Scripts/Data/CombatUnit.cs        (Attack / MaxHealth / CurrentHealth shape)
DungeonDebt/Assets/Scripts/Core/GameRules.cs         (multiplier constants; home for a rounding-rule helper if added)
DungeonDebt/Assets/Scripts/Run/RunManager.cs         (PrepareSandboxRun hero-health seed ~96-104 - check it does not desync)
```

### Files Claude Code Should Create

```
TestPlans/TP_M15.2.md
```

### Files Claude Code Should Modify

```
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs  - apply the 4 RunState multipliers at the build seams; thread RunState into BuildEnemyUnits; keep mid-combat health-recompute paths consistent.
DungeonDebt/Assets/Scripts/Core/GameRules.cs        - only if a single rounding-rule helper/constant is needed, and only if a conservative multiplier retune is warranted.
NEXT_SESSION.md                                     - end-of-session rewrite to the next ready brief.
```

### Files Claude Code Does NOT Touch

- `DungeonDebt/Assets/Scripts/Data/DifficultyPreset.cs`, `RunManager.InitializeRun`, `GameManager`, `MainMenuPanel.cs`, `RunHeaderView.cs`, `EndScreenView.cs`, `DataRepository.cs` - M15.1 data path is complete and correct; M15.2 only consumes the existing `RunState` fields.
- `DungeonDebt/Assets/Scenes/Main.unity`, prefabs, `Assets/Art/**`.
- Economy / interest / debt math (M15.1-owned, unchanged).
- `REGRESSIONS.md` / `PROGRESS.md` (summary step only; user commits).

### Acceptance criteria

1. Player units are built with `MaxHealth` and `Attack` scaled by `RunState.HeroHealthMultiplier` / `HeroDamageMultiplier`; enemy units by `RunState.EnemyHealthMultiplier` / `EnemyDamageMultiplier`, at the `CombatManager` build seams; `RunState` is threaded into enemy construction via the existing `StartCombat` path (no event bus / new manager).
2. Standard Contract combat is **byte-identical to the pre-M15.2 build** (all multipliers x1.0 with the chosen rounding rule produce unchanged hero/enemy HP and damage, unchanged combat log, unchanged win/loss); the HP floor constraint holds for every preset.
3. Apprentice Ledger is observably easier in combat (heroes ~+25% HP, enemies ~-15% damage) and Predatory Interest observably harder (enemies ~+20% HP and damage); differences are visible in the combat log/unit panel and consistent across rounds and between-round hero-health restore (no mid-combat desync).
4. Combat remains deterministic (no `UnityEngine.Random`); scaling uses one centralized integer rounding rule (no scattered rounding); any multiplier retune is a conservative constant change in `GameRules` only, with the rationale noted.
5. `TestPlans/TP_M15.2.md` exists (happy path: each preset's scaled hero/enemy stats in round 1; edge: Standard == legacy, HP-floor check, rounding boundary; observable invariants; targeted regression check that Standard combat and M15.1 economy are unchanged). `dotnet build DungeonDebt.sln` passes 0 warnings / 0 errors.

### Notes / risks for the implementer

- **Main risk - mid-combat desync:** hero max health is derived in more than one place (`CombatManager.BuildPlayerUnits` ~96, the between-round restore ~258-262, and `RunManager.PrepareSandboxRun` ~96-104 which is currently unused in the real run but seeds `HeroInstance.CurrentHealth`). If the multiplier is applied in `BuildPlayerUnits` only, a restored hero between rounds can revert to unscaled HP. Apply via one shared helper used by every combat HP-recompute site, or confirm the unused paths cannot run in a real run.
- `BuildEnemyUnits(EncounterDefinition)` has no `RunState` today - widen its signature and update the single `StartCombat` caller; do not introduce a static/global.
- Rounding: HP multipliers are >= 1.0 so any sane rule preserves the floor, but verify x1.0 rounds to exactly today's integer (Standard regression). Enemy damage x0.85 must not round attack below 1 for an attacker with attack > 0 unless that already matches today for x1.0 (it does not affect Standard).
- Keep the `[M15.1]` diagnostic-log pattern habit: TP_M15.2 should add a temporary PRE/POST `Debug.Log` of built unit `Attack`/`MaxHealth` per preset with an explicit revert step, since `CombatUnit` is plain C# and not Inspector-visible.
- Determinism: do not let scaling introduce float tie-break differences; round to int at construction so the existing integer combat loop and leftmost-slot tie-break are unaffected.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
