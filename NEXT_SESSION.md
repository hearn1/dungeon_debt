# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M18.1 - Multi-status combat keywords, enemy-side first pass

**Milestone:** M18 - Combat status keywords
**Slice goal:** Implement a small deterministic status-keyword foundation with the first enemy-side uses, keeping player access through relics/upgrades deferred to M18.2.

### Why this slice exists

M18.0 selected a broader status direction than the original one-keyword placeholder in `IMPLEMENTATION_PLAN.md` section 16. The approved direction is to build a compact set of readable combat statuses together so they share one data surface, one card-indicator treatment, and one manual test plan, while still avoiding a broad RPG status engine.

This is a user-approved expansion of the original "one keyword" M18 placeholder. Keep the implementation deliberately small: statuses may appear on either side's `CombatUnit`, but this slice gives statuses to enemies only. Relics, upgrade rewards, and player-applied statuses are M18.2.

### Scope

**In scope for M18.1:**
- Add a compact combat-status representation for `CombatUnit`.
- Implement the initial status set:
  - `Guarded` (`G`, blue): next incoming attack against this unit deals half damage, rounded up, then Guarded is consumed.
  - `Burned` (`B`, orange): when this unit attacks, it takes 1 damage and deals 1 less damage on that attack.
  - `Poisoned` (`P`, green): when this unit attacks, it takes poison damage; poison damage increases by 1 each time poison damage is taken.
  - `Marked` (`M`, red): next incoming attack against this unit deals +1 damage, then Marked is consumed.
  - `Weakened` (`W`, gray): this unit deals 1 less attack damage.
  - `Inspired` (`I`, gold): next attack by this unit deals +1 damage, then Inspired is consumed.
- Add statuses to a small number of existing enemies/encounters in `DataRepository` only. Prefer existing enemies and encounter blurbs over new enemies.
- Add concise combat-log lines when statuses change attack damage, deal self-damage, increment poison, or are consumed.
- Add small color+letter indicators to combat unit cards. Indicators must live in card chrome/top corner space and must not cover portrait art or HP/Veteran bars.
- Keep combat deterministic and synchronous.
- Put status tuning values, indicator colors, and labels in `GameRules`.
- Create `TestPlans/TP_M18.1.md`.

**Not in scope for M18.1:**
- Relic access, upgrade rewards, hero rewards, player-applied statuses, or status choices. These are M18.2.
- New heroes, new relics, new upgrade reward screens, new enemy batches, new encounters, new acts, equipment, inventory, save/load, meta progression, tutorials, audio, particles, VFX, or animations.
- Stacks as a generalized system. `Poisoned` may carry only its current poison damage counter because that is the keyword's defined behavior.
- Durations, cleanse/dispel, resistances, damage types, crit/dodge, broad debuff libraries, or a full status engine.
- Reworking combat turn order, targeting, replay timing, or non-status hero/enemy effects except where an existing enemy gains a status touchpoint.
- Covering portrait art with status UI.

### Definition of ready

- ID: M18.1.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 5, below.
- No open blocker regressions in `REGRESSIONS.md` currently block implementation.

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: Phase 3 scope rules and M18+ status-keyword placeholder. Note that this slice intentionally expands the placeholder from one keyword to a compact multi-status first pass per M18.0 user decision.
- `GAME_DESIGN.md` combat, run-flow, and MVP scope sections.
- `CLAUDE.md` / `AGENTS.md` Scope control, architectural rules, coding conventions, and Definition of ready.
- `SESSION_PROTOCOL.md` seven-step session flow.
- `PROGRESS.md` latest M18/M17 entries.
- `REGRESSIONS.md` Open section.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (last 2-3 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16)
GAME_DESIGN.md (combat/run-flow/scope sections)
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs
DungeonDebt/Assets/Scripts/Data/CombatUnit.cs
DungeonDebt/Assets/Scripts/Data/CombatResult.cs
DungeonDebt/Assets/Scripts/Data/GameEnums.cs
DungeonDebt/Assets/Scripts/Data/EnemyDefinition.cs
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs
```

### Files Claude Code Should Create

```
TestPlans/TP_M18.1.md
```

Optional only if the implementation needs a separate one-class file:

```
DungeonDebt/Assets/Scripts/Data/CombatStatusState.cs
```

### Files Claude Code Should Modify

```
DungeonDebt/Assets/Scripts/Data/GameEnums.cs - add status enum values for the selected status set.
DungeonDebt/Assets/Scripts/Data/CombatUnit.cs - store active unit statuses and any per-status counters needed for the compact set.
DungeonDebt/Assets/Scripts/Data/EnemyDefinition.cs - only if enemy definitions need starting status data; otherwise leave unchanged.
DungeonDebt/Assets/Scripts/Core/GameRules.cs - status labels, letters, colors, and numeric constants.
DungeonDebt/Assets/Scripts/Core/DataRepository.cs - assign enemy-side starting statuses to a small number of existing enemies/encounters and update blurbs.
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs - apply status effects during attack resolution and status self-damage timing.
DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs - log status damage modifiers, self-damage, poison increments, and consumption.
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs - render small color+letter status indicators without covering portrait art or HP/Veteran bars.
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs - refresh cards with status state during replay if needed.
```

### Files Claude Code Does NOT Touch

- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- Unity scene, prefabs, art assets, project settings, generated Unity folders, or unrelated `.meta` files.
- Shop, payroll, rival, difficulty, relic, veterancy, save/load, act, or reward systems except where combat status output is read-only displayed.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.

### Acceptance criteria

1. `Guarded`, `Burned`, `Poisoned`, `Marked`, `Weakened`, and `Inspired` exist as compact combat statuses with deterministic effects matching the definitions above.
2. A small enemy-side first pass applies statuses through existing enemy/encounter data only; no hero, relic, or upgrade reward access is added in M18.1.
3. Combat logs clearly report status-driven damage changes, self-damage, poison increments, and consumed `Guarded` / `Marked` / `Inspired` effects.
4. Combat unit cards show small color+letter status indicators that do not obscure portrait art, HP bars, Veteran progress, or acting/hit feedback.
5. `TestPlans/TP_M18.1.md` exists with happy path, edge cases, observable invariants, and targeted regression checks for attack damage, death timing, turn-order determinism, replay/card refresh, and prior combat effects.

### Candidate enemy-side touchpoints

Prefer two or three existing encounter edits:

- `Carry Protector`: starts `Guarded` to teach defensive status on a frontline enemy.
- `Backline Bat`: starts `Marked` or applies pressure alongside existing backline behavior without adding new targeting.
- `Debt Wraith`: starts `Poisoned` or `Inspired` only if this does not muddy its debt-scaling identity.
- `Dungeon Auditor`: may start `Inspired` or apply `Burned` pressure only if the boss remains readable.

Keep the final selection small during planning. Do not put every status on a different enemy if the combat log/card UI becomes noisy.

### Manual test expectations

- Verify each status at least once through a deterministic encounter setup or existing encounter path.
- Verify half damage rounds up for `Guarded`.
- Verify 1-damage attacks are not reduced below 0 unless already 0 after all modifiers.
- Verify poison damage increments only when poison damage is taken.
- Verify status self-damage can kill an attacker before or during its action according to the implementation plan chosen in Step 3.
- Verify consumed statuses disappear from the card indicator.
- Verify status indicators fit over portraits and footer UI at the default 1920x1080 layout.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
