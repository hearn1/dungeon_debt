# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M11.2 - Cut Wages rule alignment and first economy retest

**Milestone:** M11 - Economy and balance pass
**Slice goal:** Align Cut Wages with the design/plan's total-upkeep reduction rule, then run a short targeted balance retest before making broader Silver or economy tuning changes.

### Why this slice exists

M11.1 added lightweight balance logging and collected multiple baseline runs. The strongest signal was not a broad numeric tuning target yet: **Cut Wages appears to be implemented as a per-hero upkeep reduction**, while the design and implementation plan describe it as reducing **total upkeep by 3 this round** while applying the attack penalty to all heroes.

Because Cut Wages currently drives many multi-hero parties to `UpkeepDue = 0`, it distorts debt, interest, Debt Wraith, Silver affordability, and late-run gold observations. M11.2 should fix/align that first, then rerun a small matrix to produce cleaner tuning evidence.

### Scope

**Approved for M11.2:**
- Inspect and align Cut Wages behavior with `GAME_DESIGN.md` and `IMPLEMENTATION_PLAN.md`:
  - Keep the all-heroes attack penalty.
  - Change upkeep handling from per-hero reduction to a total-upkeep reduction of `GameRules.CutWagesUpkeepReduction`.
  - Preserve minimum total upkeep of 0.
- Update reward/payroll summary text if needed so the UI describes the corrected behavior.
- Keep `BalanceRunLogger` active and use it to compare before/after behavior.
- Create `TestPlans/TP_M11.2.md` with targeted manual checks:
  - Cut Wages total-upkeep math on 1, 3, and 5 hero parties.
  - Standard Pay comparison.
  - At least two short post-fix balance runs: one Cut Wages-heavy and one Standard Pay/loan mix.
- Summarize whether M11.3 should tune Silver, rewards/upkeep, debt/interest, morale, or payroll constants next.

**Not approved for M11.2:**
- Do not tune Silver probability or Silver bonus numbers yet unless the Cut Wages alignment is complete and the user explicitly expands scope.
- Do not add new payroll actions, encounters, heroes, UI panels, debug overlays, save/load, automated simulations, or seeded-run support.
- Do not alter combat math, shop offer mechanics, rival behavior, scene files, prefabs, or art.
- Do not remove `BalanceRunLogger`; it remains useful through M11.

### Definition of ready

- ID: M11.2.
- One-sentence goal: above.
- Files to create/modify are listed below.
- Acceptance criteria are listed below.
- No open blocker regressions in `REGRESSIONS.md` at handoff time.

### Relevant plan sections

- `IMPLEMENTATION_PLAN.md` §15, especially "Milestone 11: Economy and balance pass".
- `IMPLEMENTATION_PLAN.md` §5 for payroll/upkeep rules.
- `GAME_DESIGN.md` "Payroll Choice Phase" and "Upkeep Phase" for design intent.
- `CLAUDE.md` Scope control still applies: no new systems or content while balancing.

### M11.1 baseline findings to carry forward

- Valid logs collected:
  - Five victory runs: `104651`, `104954`, `105222`, `105930`, `110335`.
  - Two meaningful defeat runs: `105845` debt defeat round 4, `110157` morale defeat round 9 with high debt.
  - Two invalid/header-only starts: `105419`, `110551`.
- Cut Wages-heavy runs frequently reached `UpkeepDue = 0` and ended with no player debt.
- Standard Pay/loan coverage showed debt and interest can matter when loans are used.
- Several wins reached 4-5 Silver heroes by round 10, so Silver pacing remains a likely later tuning target after Cut Wages is aligned.

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/Run/PayrollManager.cs  - align Cut Wages application and summary text.
DungeonDebt/Assets/Scripts/Run/RunManager.cs      - apply total Cut Wages upkeep reduction during total upkeep calculation if needed.
TestPlans/TP_M11.2.md                             - NEW: targeted Cut Wages alignment and retest plan.
PROGRESS.md                                      - end-of-session entry only, if the user asks Claude Code to update it directly.
NEXT_SESSION.md                                  - end-of-session rewrite only, to describe M11.3.
```

### Files Claude Code May Read But Should Not Modify Unless Planning Expands

```
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Run/ShopManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
```

### Files Claude Code Does NOT Touch

- `DungeonDebt/Assets/Scenes/Main.unity`, prefabs, and `Assets/Art/**`.
- `GAME_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`.
- `REGRESSIONS.md` unless a new regression is found and the user asks to file it.

### Acceptance criteria

1. Cut Wages reduces total upkeep by `GameRules.CutWagesUpkeepReduction` once per round, not once per hero, while still applying the attack penalty to all heroes for combat.
2. Standard Pay, Take Loan, and Promise Victory Bonus behavior remain unchanged.
3. Reward summary and balance TSV logs show corrected Cut Wages total-upkeep math.
4. `TestPlans/TP_M11.2.md` exists and includes targeted checks plus at least two short post-fix retest runs.
5. Session summary identifies whether M11.3 should tune Silver, economy constants, morale/debt pressure, or payroll constants next.

### Suggested M11.3 Shape (do not start in M11.2)

M11.3 should be the first broad numeric tuning slice after corrected Cut Wages data. Likely candidates are `SilverOfferChance`, `SilverHireCostBonus`, `SilverUpkeepReduction`, reward/upkeep pressure, or morale/debt thresholds depending on M11.2 retest results.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
