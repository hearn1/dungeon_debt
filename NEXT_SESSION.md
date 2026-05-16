# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M11.1 - Economy and balance baseline run matrix

**Milestone:** M11 - Economy and balance pass
**Slice goal:** Establish a baseline balance picture for the current post-M10 prototype by running a small, repeatable manual run matrix and documenting concrete tuning observations before changing any economy or Silver-tier numbers.

### Why this slice exists

M11 is explicitly about tuning the prototype now that readability, tiering, and combat presentation exist. The current `GameRules` values include several M9 placeholder Silver constants and broad economy constants (`StartingGold`, rewards, upkeep pressure, debt/interest thresholds). Before changing those numbers, this slice should answer: which player archetypes win, which fail, when debt or morale becomes dangerous, whether Silver offers feel too common/rare, and whether the final rounds create meaningful pressure.

This is an observation slice, not a tuning slice. The output should make M11.2 ready to tune constants with evidence.

### Scope

**Approved for M11.1:**
- Run 3 baseline manual playthroughs (or until loss) using distinct archetypes:
  - Balanced party: mix of Tank / Damage / Support / Economy.
  - Aggressive party: prioritize Damage and early wins, accept higher upkeep.
  - Economy/support party: prioritize Bard / Treasurer / Priest / Enchanter style sustain.
- Record round-by-round outcomes: round reached, party shape, Silver hires/upgrades, gold, debt, morale, upkeep due/paid/shortfall, interest, payroll action chosen, win/loss, and end reason if any.
- Create `TestPlans/TP_M11.1.md` with the run matrix checklist and observation fields.
- Summarize findings in the chat and in the `PROGRESS.md` entry at session end.
- Draft the proposed M11.2 tuning target: which constants/files to tune first and why.

**Not approved for M11.1:**
- Do not change `GameRules.cs`, `ShopManager.cs`, `HeroEffects.cs`, `DataRepository.cs`, or any source file yet.
- Do not add new telemetry systems, debug overlays, automated simulations, save/load, new encounters, new heroes, new payroll actions, new rival behavior, or new UI.
- Do not alter Silver mechanics shape. M11 can tune numbers/probability, not add a new tiering system.

### Definition of ready

- ID: M11.1.
- One-sentence goal: above.
- Files to create/modify are listed below.
- Acceptance criteria are listed below.
- No open blocker regressions in `REGRESSIONS.md` at handoff time.

### Relevant plan sections

- `IMPLEMENTATION_PLAN.md` §15, especially "Milestone 11: Economy and balance pass".
- `IMPLEMENTATION_PLAN.md` §5 for economy/run rules.
- `IMPLEMENTATION_PLAN.md` §7/§8/§9 for hero, encounter, and rival tuning context.
- `CLAUDE.md` Scope control still applies: no new systems or content while balancing.

### Current tuning surfaces to inspect

- `DungeonDebt/Assets/Scripts/Core/GameRules.cs`
  - Starting resources and loss thresholds: `StartingGold`, `StartingDebt`, `StartingMorale`, `DebtLimit`.
  - Shop economy: `RerollCost`, `HireCostBonus`, `FireRefund`.
  - Rewards and penalties: `WinReward`, `LossReward`, `RivalWinBonus`, `DungeonLossMorale`, `RivalLossMorale`, `InterestDebtDivisor`.
  - Payroll constants: `LoanGoldGain`, `LoanDebtCost`, `VictoryBonusGoldCost`, `VictoryBonusDebtOnLoss`, `VictoryBonusAttackBuff`, `CutWagesUpkeepReduction`, `CutWagesAttackPenalty`.
  - Encounter pressure: `TaxCollectorUpkeep`, `AuditorUpkeep`, `AuditorDamageEvery`, `AuditorDamage`, `DebtWraithDebtDivisor`, `GoblinThiefStealGold`, `TreasureLeechStealGold`.
  - M11 placeholders: `SilverOfferChance`, `SilverHireCostBonus`, `SilverStatAttackBonus`, `SilverStatHealthBonus`, `SilverUpkeepReduction`, and per-hero Silver bonus constants.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` for reward/upkeep/interest/end-condition flow.
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs` for Silver offer probability and hire/upgrade cost behavior.
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` for per-hero Silver bonus application.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` only as context for hero/encounter/rival numbers; do not edit in M11.1.

### Acceptance criteria

1. `TestPlans/TP_M11.1.md` exists and contains a manual baseline run matrix with at least three archetype runs and clear fields for round-by-round economy observations.
2. At least three runs are executed or explicitly marked incomplete with the blocker/reason; each run records final result, round reached, ending gold/debt/morale, party/tier shape, and the main pressure point.
3. Findings identify 3-6 concrete balance hypotheses for M11.2, each tied to specific constants or files.
4. No gameplay/source constants are changed in M11.1.
5. Session summary includes the observed baseline and a ready M11.2 recommendation.

### Files Claude Code May Modify

```
TestPlans/TP_M11.1.md  - NEW: baseline balance run matrix and manual observation checklist.
PROGRESS.md            - end-of-session entry only, if the user asks Claude Code to update it directly.
NEXT_SESSION.md        - end-of-session rewrite only, to describe M11.2.
```

### Files Claude Code May Read But Not Modify In M11.1

```
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Run/ShopManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
```

### Files Claude Code Does NOT Touch

- Any source file in `DungeonDebt/Assets/Scripts/**` during M11.1.
- `Assets/Scenes/Main.unity`, prefabs, and `Assets/Art/**`.
- `GAME_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`.
- `REGRESSIONS.md` unless a new regression is found and the user asks to file it.

### Suggested M11.2 Shape (do not start in M11.1)

M11.2 should be the first actual tuning slice. It will likely modify `GameRules.cs` only, unless M11.1 finds that Silver probability needs a round-based curve rather than the current single `SilverOfferChance`. If a curve is needed, plan it explicitly before touching `ShopManager.cs`.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
