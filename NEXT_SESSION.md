# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M12.1 - Debt status + Shop repayment

**Milestone:** M12 - Debt rework and resource-pressure readability
**Slice goal:** Make debt more readable and recoverable without removing its strategic pressure.

### Why this slice exists

M11 closed the initial economy/balance pass. The current 10-round prototype is playable and stable enough to treat as **Act 1 / initial difficulty**, but feedback from the latest planning discussion is that the **debt mechanic feels overly punishing**.

The revised M12.1 direction is that debt needs both a pressure loop and a recovery loop. Debt already pressures the player through upkeep shortfalls, loans, interest, debt defeat, and existing debt-scaling threats. What is missing is an explicit way for the player to pay down principal. M12.1 should add that recovery loop through the existing Shop screen.

### Scope

**Approved for M12.1:**
- Add a simple debt-status/readability model using thresholds in `GameRules.cs`:
  - `Stable`
  - `Strained`
  - `Dangerous`
  - `Critical`
- Add a Shop **Pay Debt** control.
- Pay Debt converts gold into debt reduction at 1:1.
- First-pass repayment rule:
  - Add `GameRules.DebtPaymentCap = 3`.
  - Payment amount = `min(Gold, Debt, GameRules.DebtPaymentCap)`.
  - The action is enabled only when `Gold > 0` and `Debt > 0`.
- The Pay Debt button immediately reduces available gold, so it competes with hiring and rerolling.
- Button label examples:
  - `Pay Debt (3g)`
  - `Pay Debt (2g)`
  - `No Debt`
  - `Need Gold`
- Surface debt status in UI where the player already looks:
  - Run header debt readout includes the current debt tier/status.
  - Shop makes repayment available and updates gold/debt immediately.
  - Reward/upkeep summary may show debt status or general debt-pressure warning copy if useful.
- Keep debt warnings general. Good direction: "High debt increases interest pressure and can interact badly with debt-scaling threats."
- Create `TestPlans/TP_M12.1.md` with manual checks for repayment edge cases, debt-status boundaries, warning copy, and unchanged Debt Wraith scaling.

**Not approved for M12.1:**
- Do not change Debt Wraith mechanics.
- Do not call out any single fight or encounter in debt warnings.
- Do not add automatic surplus repayment.
- Do not add or replace payroll actions.
- Do not add hero behavior changes.
- Do not add enemy behavior changes.
- Do not add shop surcharges.
- Do not add acts, Act 2, new encounters, new heroes, new payroll actions, relics/loot, equipment, inventory, XP/veterancy, difficulty modes, save/load, tutorials, damage/status types, or new resource types.
- Do not remove debt loss entirely. Debt should be recoverable, but still dangerous.
- Do not rework rival simulation beyond any passive display text that already reads player debt.

**Deferred to later M12.x slices after repayment is tested:**
- Treasurer/interest interaction.
- Payroll repayment.
- High-debt shop surcharges.
- Specific encounter warnings.
- New debt enemies or new debt-scaling enemy behavior.

### Definition of ready

- ID: M12.1.
- One-sentence goal: above.
- Files to create/modify are listed below.
- Acceptance criteria are listed below.
- No open blocker regressions in `REGRESSIONS.md` at handoff time.
- `IMPLEMENTATION_PLAN.md` includes Phase 3 / M12 and now explicitly approves Shop repayment for M12.1.

### Relevant plan sections

- `IMPLEMENTATION_PLAN.md` §5 for resource, upkeep, interest, and debt-loss rules.
- `IMPLEMENTATION_PLAN.md` §12 for script responsibilities.
- `IMPLEMENTATION_PLAN.md` §16, especially "Milestone 12: Debt rework and resource-pressure readability".
- `GAME_DESIGN.md` "Player Resources", "Main Strategic Tension", and "Phase 3 Debt Rework Direction".
- `CLAUDE.md` / `AGENTS.md` Scope control: Phase 3 M12 approves debt thresholds/status/readability and the Shop Pay Debt recovery control only.

### M11 carry-forward context

- M11.2 fixed Cut Wages so it reduces total upkeep once per round instead of reducing each hero's upkeep.
- M11.2 also made conservative tuning changes: lower direct Silver offer chance, duplicate-upgrade premium, and a short Silver hire button-label fix.
- Current 10-round balance is acceptable as Act 1 / initial difficulty: stable runs can win, but debt, morale, and poor economy/combat decisions still cause meaningful losses.
- The next high-value vertical is debt feel/readability/recovery, not broader content expansion.

### Likely Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/Core/GameRules.cs        - add debt status thresholds/helpers and DebtPaymentCap.
DungeonDebt/Assets/Scripts/Data/RunState.cs         - add latest debt/status summary fields only if needed for UI summaries.
DungeonDebt/Assets/Scripts/Run/RunManager.cs        - add helper for deriving debt status if that belongs in run logic, or expose repayment method if preferred.
DungeonDebt/Assets/Scripts/Run/ShopManager.cs       - add PayDebt / repayment method that spends up to cap and reduces debt 1:1.
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs      - display debt status near debt.
DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs      - add Pay Debt button/control and refresh labels/interactable state.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs      - wire Shop Pay Debt callback if needed.
DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs  - show debt status or general debt-pressure warning after upkeep/interest if needed.
TestPlans/TP_M12.1.md                               - NEW: targeted manual debt-status + repayment test plan.
PROGRESS.md                                         - end-of-session entry only, if the user asks Claude Code to update it directly.
NEXT_SESSION.md                                     - end-of-session rewrite only, to describe the next slice.
```

### Files Claude Code May Read But Should Not Modify Unless Planning Expands

```
DungeonDebt/Assets/Scripts/Data/GameEnums.cs
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
DungeonDebt/Assets/Scripts/Run/PayrollManager.cs
DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/UI/EndScreenView.cs
DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs
```

Do not include `ScoutPanelView.cs` in likely implementation files unless the final plan explicitly decides to add only general debt-status copy. Do not add encounter-specific warnings.

### Files Claude Code Does NOT Touch

- `DungeonDebt/Assets/Scenes/Main.unity`, prefabs, and `Assets/Art/**`, unless an existing serialized reference must be adjusted because a modified UI script already exposes the field.
- `GAME_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`, `AGENTS.md`, or `SESSION_PROTOCOL.md` during the code slice.
- `REGRESSIONS.md` unless a new regression is found and the user asks to file it.
- Any files for acts, loot/relics, XP, damage/status types, difficulty selection, save/load, new enemies, new heroes, or new content.

### Acceptance criteria

1. Debt status is derived from current debt and displayed clearly in the run UI.
2. Shop includes a Pay Debt control that converts up to `GameRules.DebtPaymentCap` gold into debt reduction at 1:1.
3. Pay Debt immediately updates gold/debt and competes with hiring/rerolling.
4. High debt danger is clearer through general status/warning copy only; no specific encounter is called out and Debt Wraith mechanics remain unchanged.
5. No payroll actions, hero effects, enemy effects, act structure, or new content are added.

### Manual test plan requirements

`TestPlans/TP_M12.1.md` should include:

- Pay Debt disabled at 0 debt.
- Pay Debt disabled when gold is 0.
- Debt > cap and gold > cap pays exactly cap.
- Debt below cap pays only remaining debt.
- Gold below cap pays only available gold.
- Paying debt updates the run header immediately.
- Paying debt can make hire/reroll unaffordable.
- Debt status changes at threshold boundaries.
- Any debt warning copy is general and does not reference a specific fight.
- Debt Wraith combat scaling behavior is unchanged.

### Suggested M12.2 Shape (do not start in M12.1)

M12.2 should be a short debt retest/balance follow-up after M12.1 lands. It should use the existing balance TSV logger to compare at least three runs: stable/no-loan, loan-heavy, and high-upkeep/Silver-heavy. Depending on those results, M12.2 can tune debt thresholds/interest/repayment cap or decide whether to explore deferred debt interactions.

Deferred candidates for later M12.x only after repayment is tested: Treasurer/interest interaction, payroll repayment, high-debt shop surcharges, specific encounter warnings, and new debt enemies.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
