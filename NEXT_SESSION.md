# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M18.2 - Relic/upgrade variants for player-side status access

**Milestone:** M18 - Combat status keywords
**Slice goal:** Add a narrow player-side access layer for the M18.1 status system through relic/upgrade variants, without expanding into a broad status engine or new reward system.

### Why this slice exists

M18.1 added the compact combat-status foundation and enemy-side touchpoints for `Guarded`, `Burned`, `Poisoned`, `Marked`, `Weakened`, and `Inspired`. Manual verification confirmed the core status behavior, with an important readability correction: `Burned`, `Poisoned`, and `Weakened` are attack-applied statuses on the target, not starting wounds on enemies.

M18.2 should let the player interact with the same status system in a small, readable way. The preferred implementation is to add status-oriented variants to the existing relic/policy reward surface rather than creating a new upgrade screen, new inventory, or player status-choice subsystem.

### Scope

**In scope for M18.2:**
- Add a small number of new relic/policy definitions that grant player-side status access through existing combat hooks.
- Prefer 3-4 status relics total, using existing `RelicReward` flow and `RunState.ActiveRelics`.
- Candidate relic shapes:
  - A defensive relic that gives one frontline hero `Guarded` at combat start.
  - An offensive relic that makes the first player attack apply `Marked`.
  - A pressure relic that lets Damage-role heroes apply `Burned` or `Poisoned` on attack.
  - A morale/tempo relic that gives one hero `Inspired` at combat start.
- Reuse M18.1 `CombatUnit` status state, logging, replay refresh, and card indicators.
- Keep effects deterministic, synchronous, and small enough to explain in relic text.
- Put any new numeric constants, labels, or helper decisions in `GameRules`.
- Create `TestPlans/TP_M18.2.md`.

**Not in scope for M18.2:**
- A new upgrade reward screen unless planning proves existing relic rewards cannot support the slice.
- New heroes, enemies, encounters, acts, equipment, inventory, save/load, meta progression, tutorials, audio, particles, VFX, or animations.
- Generalized stacks, durations, cleanse/dispel, resistances, damage types, crit/dodge, or a broad debuff library.
- Player-selected per-combat status targeting.
- Statuses outside the six implemented in M18.1.
- Reworking combat turn order, targeting, replay timing, or enemy-side M18.1 behavior except to integrate player-side status output cleanly.

### Definition of ready

- ID: M18.2.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 5, below.
- No open blocker regressions in `REGRESSIONS.md` currently block implementation.

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: Phase 3 scope rules and M18+ status-keyword placeholder. Note that M18 is following the user-approved six-status expansion recorded in M18.0/M18.1.
- `GAME_DESIGN.md` combat, run-flow, reward, and MVP scope sections.
- `PROGRESS.md` latest M18.1/M18.0 entries.
- `REGRESSIONS.md` Open section.
- `SESSION_PROTOCOL.md` seven-step session flow.
- `CLAUDE.md` / `AGENTS.md` Scope control, architectural rules, coding conventions, and Definition of ready.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (last 2-3 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (combat/reward/run-flow/scope sections)
DungeonDebt/Assets/Scripts/Data/GameEnums.cs
DungeonDebt/Assets/Scripts/Data/RelicDefinition.cs
DungeonDebt/Assets/Scripts/Data/RunState.cs
DungeonDebt/Assets/Scripts/Data/CombatUnit.cs
DungeonDebt/Assets/Scripts/Data/CombatStatusState.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs
DungeonDebt/Assets/Scripts/UI/RelicRewardPanelView.cs
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs
TestPlans/TP_M18.1.md
```

### Files Claude Code Should Create

```
TestPlans/TP_M18.2.md
```

Optional only if planning shows the relic effects need a separate one-class helper:

```
DungeonDebt/Assets/Scripts/Combat/RelicCombatEffects.cs
```

### Files Claude Code Should Modify

```
DungeonDebt/Assets/Scripts/Data/GameEnums.cs - add new RelicId values for the selected status relics.
DungeonDebt/Assets/Scripts/Core/GameRules.cs - add any status relic constants and helper labels.
DungeonDebt/Assets/Scripts/Core/DataRepository.cs - add the new relic definitions to the existing relic list.
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs - apply player-side status relic effects at combat start or on attack.
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs - only if new player-side relic status application needs clearer log helper text beyond M18.1 helpers.
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs - only if active relic/status summary copy needs a small readability tweak.
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs - only if active relic text crowding needs a small display adjustment.
```

### Files Claude Code Does NOT Touch

- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- Unity scene, prefabs, art assets, project settings, generated Unity folders, or unrelated `.meta` files.
- Shop, payroll, rival, difficulty, veterancy, save/load, act, or reward-routing systems except where existing relic reward data is used.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.
- Enemy-side status touchpoints from M18.1 unless a specific regression from testing must be fixed.

### Acceptance criteria

1. A small set of new relic/policy definitions gives player-side access to selected M18.1 statuses using the existing relic reward flow.
2. Player-side status effects reuse the M18.1 status data, logs, replay refresh, and combat-card indicators; no duplicate status system is introduced.
3. Status relic effects are deterministic and readable: combat-start effects happen before the first action, and on-attack effects apply to the target after damage lands if the target survives.
4. Existing enemy-side M18.1 statuses still work, including attack-applied Burned / Poisoned / Weakened behavior.
5. `TestPlans/TP_M18.2.md` exists with happy path, edge cases, observable invariants, and targeted regression checks for relic reward routing, active relic visibility, status replay/card refresh, and prior relic effects.

### Planning guidance

Keep the final relic set small. It is better to add 3 readable relics than 6 noisy ones. Do not give every status a relic if that makes combat logs unreadable.

Recommended first-pass relic concepts:

- `Shield Clause`: leftmost living frontline hero starts combat `Guarded`.
- `Red Ink Brand`: first player attack each combat applies `Marked` to its target.
- `Caustic Writ`: Damage-role heroes apply `Burned` on attack.
- `Toxic Collateral`: Damage-role heroes apply `Poisoned` on attack.

If four relics feels too noisy during planning, pick three and explicitly defer the fourth. Avoid adding separate UI affordances; these should appear in the existing relic offer screen and active relic displays.

### Manual test expectations

- Verify each new status relic can appear in the existing relic reward flow.
- Verify selected relics are stored on `RunState.ActiveRelics` and do not repeat.
- Verify combat-start player statuses are visible before the first replayed attack.
- Verify player on-attack status applications happen after damage lands and only if the target survives.
- Verify existing relics from M16.1 still work: Blade Charter, Iron Oath, Camp Rations, and Guild Dividend.
- Verify enemy-side M18.1 touchpoints still work after adding player-side access.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
