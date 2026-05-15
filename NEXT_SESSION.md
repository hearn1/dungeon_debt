# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M6.2 — Encounter and hero effects wired into combat / reward / upkeep

**Milestone:** M6 - Full 10-Round Run (second slice)
**Slice goal:** Implement the encounter behavioral effects deferred from M6.1 (Goblin Thief gold steal, Tax Collector upkeep, Backline Bat targeting, Debt Wraith scaling, Treasure Leech reward drain, Dungeon Auditor boss effects) and the remaining hero effects in `HeroEffects.cs`. Wire each encounter's `EncounterEffectId` and each new enemy's `EnemyEffectId` to its handler so combat / reward / upkeep behave per `IMPLEMENTATION_PLAN.md` §6, §7, §8.

### Background

M6.1 added Scout state, ScoutPanelView, EncounterManager, and the full 10-encounter list — but combat resolves as a plain DPS race because every encounter and new enemy uses `*.None`. M6.2 turns each encounter into a distinct mechanical situation per §8 and finishes hero-effect coverage per §7. By the end of this slice, a full 10-round run should feel mechanically varied: Goblin Thieves should be able to actually steal gold, Tax Collector should raise upkeep, Backline Bat should redirect to a backline hero on round 2, Debt Wraith's attack should scale with debt, Treasure Leech should reduce reward on survive, and Dungeon Auditor should pressure both party HP and upkeep.

### Acceptance criteria

1. **Goblin Thief steal.** If any Goblin Thief is alive at end of combat round `GameRules.GoblinThiefStealRound` (= 3), `CombatResult.SurvivorFlags["goblinStoleGold"] = true`. In Reward, reward gold reduced by `GameRules.GoblinThiefStealGold` (= 3), clamped to ≥ 0.
2. **Tax Collector upkeep.** On Round 4, total upkeep is increased by `GameRules.TaxCollectorUpkeep` (= 2) during the Upkeep math in `RunManager.ApplyPostCombatResult`. Reflected in the reward summary upkeep line.
3. **Backline Bat targeting override.** On combat round 2, Backline Bat targets the lowest-HP backline player hero (ties: leftmost slot). If no backline hero is alive, falls back to normal targeting.
4. **Debt Wraith scaling.** At combat start, the Debt Wraith `CombatUnit.Attack` is set to `1 + floor(run.Debt / GameRules.DebtWraithDebtDivisor)` (divisor = 3). Underlying `EnemyDefinition` stays immutable.
5. **Treasure Leech reward drain.** If a Treasure Leech is alive at combat end, `SurvivorFlags["treasureLeechSurvived"] = true`. In Reward, reward gold reduced by `GameRules.TreasureLeechStealGold` (= 4), clamped to ≥ 0.
6. **Dungeon Auditor boss.** On combat start, `+GameRules.AuditorUpkeep` (= 3) added to this round's upkeep. Every `GameRules.AuditorDamageEvery` (= 3) combat rounds, deal `GameRules.AuditorDamage` (= 1) damage to each living player hero (leftmost-slot order in the log).
7. **Hero effects coverage.** Every `HeroEffectId` in `GameEnums.cs` produces an observable in-game change. Verify each via TP_M6.2.
8. **Full-run regression.** Scout → Shop → Formation → Payroll → Combat → Reward → Upkeep → Scout still works end-to-end for all 10 rounds with these effects layered in. Victory after Round 10 win still fires.

### Files Claude Code may create

```
TestPlans/TP_M6.2.md
```

(No new .cs files anticipated — all logic lives in existing files.)

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
  — implement all 12 hero effect bodies + the enemy/encounter effect hooks
    (OnCombatStart for Debt Wraith scaling and Auditor upkeep,
     OnEndOfCombatRound for Goblin Thief flag, Auditor periodic damage, Backline Bat trigger on round 2,
     OnCombatEnd for Treasure Leech flag, Bard gold-on-win, etc.)

DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
  — if needed, add a per-attacker targeting override hook so Backline Bat can re-route on round 2.
    Keep the override surface narrow (single delegate or extra HeroEffects call from FindTarget).

DungeonDebt/Assets/Scripts/Run/RunManager.cs
  — apply encounter reward modifiers (Goblin Thief, Treasure Leech) before the upkeep step;
    apply encounter upkeep modifiers (Tax Collector, Auditor) when calculating total upkeep.

DungeonDebt/Assets/Scripts/Core/GameRules.cs
  — add constants: TaxCollectorUpkeep (2), AuditorUpkeep (3), AuditorDamageEvery (3),
    AuditorDamage (1), DebtWraithDebtDivisor (3), GoblinThiefStealRound (3),
    GoblinThiefStealGold (3), TreasureLeechStealGold (4).

DungeonDebt/Assets/Scripts/Core/DataRepository.cs
  — assign real EnemyEffectId / EncounterEffectId values to the 6 enemies and matching encounters
    (GoblinThief → GoblinStealGold; BacklineBat → BackBatBackline; DebtWraith → DebtWraithScales;
     TreasureLeech → TreasureLeechRewardDrain; DungeonAuditor → DungeonAuditorBoss;
     encounter R4 → TaxCollectorUpkeep; encounter R10 → FinalBossDamage).
```

### Files Claude Code does NOT create or modify

- `ScoutPanelView.cs`, `EncounterManager.cs` — Scout UI / loading unchanged.
- `ShopManager.cs`, `PayrollManager.cs`, `FormationPanelView.cs`, `MainMenuPanel.cs` — not in this slice (unless an effect requires UI surfacing — surface it at plan time).
- `RivalManager.cs`, `RivalLeaderboardView.cs` — deferred to M7.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` — forbidden.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session.

### Open questions to resolve at plan time

1. **EncounterEffectId coverage vs SurvivorFlags pattern.** §8 sample code applies Goblin Thief / Treasure Leech reductions via `result.SurvivorFlags.GetValueOrDefault("...")` string keys. Current enum only has `TaxCollectorUpkeep`, `FinalBossDamage`. Decide: keep the flag-string pattern for reward drains (recommendation), or add `GoblinThiefSteal` / `TreasureLeechDrain` enum values? Recommend: **keep `SurvivorFlags` pattern** — matches §8 and keeps Reward math centralized in `RunManager.ApplyPostCombatResult`.
2. **Targeting override surface.** Backline Bat needs to redirect on round 2 only. Options: (a) `HeroEffects.OverrideTarget(attacker, defenders, combatRound)` returns a target or null; `CombatManager.FindTarget` calls it first. (b) Pre-attack hook mutates the defenders list. Recommend: **(a)** — cleanest, deterministic, keeps `CombatManager` simple.
3. **Debt Wraith timing.** Apply at `OnCombatStart` before any combat round resolves. Mutate `CombatUnit.Attack` only — never `EnemyDefinition`. Confirm.
4. **Auditor periodic damage ordering.** Apply at `OnEndOfCombatRound` when `combatRound % AuditorDamageEvery == 0`. Damage each living player hero in leftmost-slot order, logging each via `CombatLogger`. Confirm.
5. **Hero effects scope.** Some effects (Bard `+2 gold on win`, Ninja `+1 gold per kill`, Treasurer / Apprentice upkeep reductions) need to feed `RunManager` or `RunState` directly. Confirm at plan time which hooks to use (`OnCombatEnd` vs `OnUpkeepCalculated`) and whether new fields on `CombatResult` are needed (e.g. `BonusGold`, `BonusUpkeepReduction`).

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` §6 — Combat System Plan: hook points (`OnCombatStart`, `OnAttack`, `OnKill`, `OnEndOfCombatRound`, `OnCombatEnd`, `OnUpkeepCalculated`) and timing rules.
- `IMPLEMENTATION_PLAN.md` §7 — Hero Effects Implementation Plan: 12 effects + risky/complex flagged ones.
- `IMPLEMENTATION_PLAN.md` §8 — Encounter Implementation Plan: where each encounter effect fires (combat start / during / end / reward / upkeep).
- `GAME_DESIGN.md` rounds 1–10 — flavor + numeric intent for each encounter effect.
- `CLAUDE.md` §Common pitfalls — "Don't make hero effects subclasses or virtual methods. Use the static `HeroEffects` class keyed by `HeroEffectId` enum." Same pattern for enemy/encounter effects.

### Notes from previous slice (M6.1)

- All 10 encounters and 6 new enemies are in `DataRepository` but use `*.None` effect IDs. M6.2 swaps those IDs to the real values and adds the matching handlers.
- `RunState.CurrentEncounter` is the canonical encounter pointer through the whole round. `RunManager.ApplyPostCombatResult` already receives `encounter` as a parameter — reward and upkeep modifiers should be applied there.
- `MainMenuPanel.RunSandboxCombat` reads `run.CurrentEncounter` (with `SandboxEncounter` fallback). The fallback can be removed in a cleanup slice once we're confident no path produces a null `CurrentEncounter`.
- `RunManager.PrepareSandboxRun()` / `DataRepository.CreateSandboxRun()` remain unreferenced; defer to a dedicated cleanup slice after M6/M7.

### Test plan output

Claude Code creates `TestPlans/TP_M6.2.md` covering:

- **Happy path:** A scripted 10-round playthrough where each encounter's effect is observable (Goblin Thief steals 3 gold when surviving past round 3; Tax Collector raises upkeep by 2; Backline Bat targets a backline hero on round 2; Debt Wraith attack scales with debt; Treasure Leech reduces reward by 4 on survive; Auditor +3 upkeep and -1 HP to all heroes every 3 rounds).
- **Per-effect isolation:** One scenario per encounter effect with a temporary diagnostic scaffold (force the relevant precondition — e.g., set debt high before R7 to confirm Debt Wraith scaling).
- **Per-hero-effect checks:** One scenario per `HeroEffectId` confirming the effect is observable.
- **Rule checks:** No `UnityEngine.Random`; constants live in `GameRules`; encounter/enemy effects keyed via enums, not subclasses.
- **Regression checks:** TP_M6.1 happy path + 10-round sweep still pass; TP_R002 round-advance still routes through Scout; TP_M5.2 payroll line items still surface; TP_M4.1 formation swap still works.
- **Observable invariants:** `CombatResult.SurvivorFlags` is populated correctly for both flag-bearing encounters; encounter upkeep modifier never produces negative upkeep; Auditor periodic damage never crits past 0 HP without producing a death log line.

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
