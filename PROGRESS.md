# PROGRESS.md

Append-only log of completed slices. **Newest entry goes at the top** of the Session log section. Claude Code reads the last 2-3 entries at the start of every session (per `SESSION_PROTOCOL.md` step 1) to orient.

This file is updated **only** at the end of a session, as part of the session summary step. Do not update it mid-session.

---

## Entry template

Copy this block when adding a new entry. Paste it at the top of the Session log section, below the heading. Replace every placeholder.

```markdown
## <YYYY-MM-DD> - <slice id>: <short slice name>

**Milestone:** M<n> - <name>
**Status:** Complete | Partial | Blocked

**Files added:**
- `Assets/Scripts/...`

**Files modified:**
- `Assets/Scripts/...` - <one-line reason>

**Acceptance criteria:**
- [x] <criterion>
- [x] <criterion>

**Test plan:** `TestPlans/TP_<slice-id>.md` - <results, e.g. "8/8 pass" or "6/8 pass, 2 deferred to next slice">

**Deviations from plan:**
- <none, or list>

**Follow-up flagged:**
- <none, or list - regressions filed in REGRESSIONS.md, post-MVP ideas, etc.>

**Next slice:** <slice id and short name - should match what NEXT_SESSION.md was rewritten to>
```

---

## Status legend

- **Complete** - all acceptance criteria pass, test plan run, no blocking follow-up.
- **Partial** - slice landed but at least one acceptance criterion is unmet or deferred. Note which.
- **Blocked** - work started but could not complete due to a blocker. Note what's blocking and which regression was filed.

---

## Session log

<!-- Newest entries at the top. -->

## 2026-05-16 - M17.1: Tiered veterancy XP + stat bumps

**Milestone:** M17 - Tiered veterancy
**Status:** Complete

**Files added:**
- `TestPlans/TP_M17.1.md`

**Files modified:**
- `CLAUDE.md` - removed stale active-slice tracking language so active work stays in `NEXT_SESSION.md`.
- `DungeonDebt/Assets/Scripts/Data/HeroInstance.cs` - added run-local XP and computed Veteran tier state.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - stores latest veterancy summary text for Reward Summary.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added XP awards, Veteran thresholds, progress helpers, and Veteran stat bonus constants.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - awards stacked survivor/rival/end-of-act/act-complete XP and refreshes hero stats.
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` - applies Veteran attack and max HP bonuses through existing stat surfaces.
- `DungeonDebt/Assets/Scripts/UI/HeroCardView.cs` - shows instance XP/Veteran progress on hero and formation cards.
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs` - shows XP/Veteran progress on player combat cards.
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs` - shows compact XP awards and tier-up callouts.

**Acceptance criteria:**
- [x] Heroes gain run-local XP after combat: +1 for surviving, extra XP for rival/end-of-act fights, and act-complete XP for all current heroes.
- [x] Veteran tier is computed automatically from XP thresholds 2, 5, 9, then continued by increasing gaps (+5, +6, ...).
- [x] Each Veteran tier grants configurable `GameRules` stat bonuses, initially +1 attack and +1 max HP per tier, stacking with Silver, relics, and difficulty modifiers.
- [x] Hero instance cards / formation cards and player combat cards show readable XP/Veteran progress.
- [x] Reward Summary calls out XP awards and new Veteran tiers without adding XP spending, skill trees, class evolution, equipment, save/load, or meta progression.

**Test plan:** `TestPlans/TP_M17.1.md` - user reported everything looks good; `dotnet build DungeonDebt\DungeonDebt.sln` passed with 0 warnings / 0 errors.

**Deviations from plan:**
- User-approved `CLAUDE.md` cleanup included.
- `CombatManager.cs` did not need changes because `CombatResult.DeadHeroes` already provided the survivor signal.

**Follow-up flagged:**
- None. M17 is considered closed; no M17.2 follow-up is needed.

**Next slice:** M18.0 - Status keyword planning + first-slice definition.

## 2026-05-16 - M16.1: Relic rewards after boss wins

**Milestone:** M16 - Relic rewards
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Data/RelicDefinition.cs` (+ `.cs.meta`)
- `DungeonDebt/Assets/Scripts/UI/RelicRewardPanelView.cs` (+ `.cs.meta`)
- `TestPlans/TP_M16.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/GameEnums.cs` - added `RelicId`.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added relic choice/stat/reward constants.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - added the four first-pass relic definitions and read-only access.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - stores active relics, pending relic choices, latest completed encounter, and pending post-relic routing.
- `DungeonDebt/Assets/Scripts/Core/GameState.cs` - added `RelicReward`.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - routes surviving eligible reward continues into Relic Reward, then resumes the original next state.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - rolls non-duplicate relic offers with `System.Random`, stores selections, applies Guild Dividend, and exposes relic stat helpers.
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - applies player combat relic stat bonuses during unit construction/restoration.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - creates, wires, shows, and hides the relic reward panel.
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs` - shows active relics and Guild Dividend reward bonus.
- `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs` - shows active relic names in a small secondary header line.
- `PROGRESS.md` - backfilled the missing M15.2 entry at the user's request.

**Acceptance criteria:**
- [x] Eligible boss-style wins route Reward Summary -> Relic Reward -> the original next state.
- [x] Relic screen offers up to 3 random unowned choices via `RunManager.Random`; selected relics are stored on `RunState` and do not repeat.
- [x] Blade Charter, Iron Oath, Camp Rations, and Guild Dividend exist as static data and apply to combat/reward calculations.
- [x] Active relics are visible in the run UI without confusing debt/difficulty/act readouts.
- [x] No equipment, inventory, rarity ladder, unlocks, save/load, new content, status keywords, or `UnityEngine.Random` usage was introduced; `TP_M16.1.md` covers the slice.

**Test plan:** `TestPlans/TP_M16.1.md` - user reported testing passed. `dotnet build DungeonDebt.sln` passed with 0 warnings / 0 errors.

**Deviations from plan:**
- Defeat checks happen before relic reward per user decision during planning: if post-combat debt/morale defeats the run, no relic screen appears.
- Active relic names are shown in both a small header line and Reward Summary; keep an eye on header crowding in later UI polish.

**Follow-up flagged:**
- M17 is only defined at milestone level, so the next session should define the first narrow veterancy slice before implementation.

**Next slice:** M17.0 - Narrow veterancy planning + first-slice definition.

## 2026-05-16 - M15.2: Combat HP/damage multipliers + retune

**Milestone:** M15 - Difficulty modifiers
**Status:** Complete

**Files added:**
- `TestPlans/TP_M15.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - applies run-scoped hero/enemy HP and damage multipliers during combat unit construction, and restores hero health to scaled max after combat.
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` - applies enemy damage multiplier to Debt Wraith debt-scaled attack.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added `MinimumPositiveCombatStat` and `ScaleCombatStat` helper for ceiling-based combat scaling.
- `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs` - resets post-payroll hero health to scaled max health.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - seeds sandbox/round-advance hero health using scaled max health.
- `NEXT_SESSION.md` - rewritten from the M16 planning brief to the ready M16.1 implementation brief.

**Acceptance criteria:**
- [x] Apprentice Ledger scales player max HP up without reducing 1-damage enemies to 0.
- [x] Standard Contract preserves legacy combat stats and deterministic ordering.
- [x] Predatory Interest scales enemy HP/damage, including Debt Wraith's debt-derived attack.
- [x] Scaled max HP is respected by combat cards, healing caps, payroll stat reset, post-combat restoration, and round advance.
- [x] `TestPlans/TP_M15.2.md` exists with happy path, edge cases, observable invariants, and targeted regression checks.

**Test plan:** `TestPlans/TP_M15.2.md` - drafted; M15.2 was committed and merged as `20f380f` / PR #39. No open regression was filed from this slice.

**Deviations from plan:**
- None noted.

**Follow-up flagged:**
- M16.1 is ready as the next implementation slice: relic rewards after boss wins.

**Next slice:** M16.1 - Relic rewards after boss wins.

## 2026-05-16 - M15.1: Difficulty presets - data model + MainMenu selection + run-scoped economy

**Milestone:** M15 - Difficulty modifiers
**Status:** Complete (pending user run of TP_M15.1.md)

**Files added:**
- `DungeonDebt/Assets/Scripts/Data/DifficultyPreset.cs` (+ `.cs.meta`)
- `TestPlans/TP_M15.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/GameEnums.cs` - added `DifficultyPresetId` enum.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - per-preset economy + 4 combat-multiplier constants + `DefaultDifficultyPreset`.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - assembles the 3 presets from GameRules constants; sandbox run seeded with Standard run-scoped fields.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - selected preset id/name + run-scoped `InterestDivisor`/`DebtLimit` + 4 carried combat multipliers.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - `InitializeRun(DifficultyPresetId)`; interest math + debt-defeat read `RunState`, not `GameRules`.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - `StartRun(DifficultyPresetId)` threads preset to `InitializeRun`; new `ReturnToMainMenu()`.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - 3-button Run Contract selector; clean menu layout (hides combat/log/reward chrome on menu+end); `GameState.MainMenu` presentation branch.
- `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs` - appends preset name to the Round cell.
- `DungeonDebt/Assets/Scripts/UI/EndScreenView.cs` - end-of-run button relabelled "New Run" -> "Main Menu".
- `DungeonDebt/Assembly-CSharp.csproj` - Compile include for the new script (build sync; Unity later regenerated consistently).
- `NEXT_SESSION.md` - rewritten to the M15.2 brief.

**Acceptance criteria:**
- [x] 1 - `DifficultyPreset` + `DifficultyPresetId` exist; `DataRepository` assembles exactly 3 from `GameRules` constants; Standard == today's exact economy.
- [x] 2 - MainMenu 3-preset selector, default Standard, threaded to `RunManager.InitializeRun`.
- [x] 3 - `InitializeRun` sets gold/debt/morale + run-scoped `InterestDivisor`/`DebtLimit` + 4 carried multipliers; interest + debt-defeat read `RunState`; sandbox uses Standard.
- [x] 4 - preset name on `RunState`, shown read-only in `RunHeaderView`; Standard reproduces legacy economy.
- [x] 5 - `TP_M15.1.md` exists; `dotnet build DungeonDebt.sln` 0 warnings / 0 errors; combat multipliers carried but intentionally unapplied (M15.2) - documented, not a gap.

**Test plan:** `TestPlans/TP_M15.1.md` - drafted, not yet run by user. Menu/flow visually accepted by user; preset economy application verified by code trace this session. `dotnet build` passes 0/0.

**Deviations from plan:**
- Run Contract selector placed as a centered block (~400px from top) instead of below the Start Run row, to avoid overlapping the end-screen panel.
- Main-menu refactor (user-approved expansion beyond the slice's selector-only UI line item): the always-on combat-log + Reward Summary chrome is now hidden on the Ready and end screens, and a `GameState.MainMenu` presentation branch was added. Stays inside `MainMenuPanel.cs` (no scene/prefab/new files).
- End-of-run flow change (user-approved): end screen "New Run" became "Main Menu" and routes to `GameState.MainMenu` so difficulty is chosen on the menu before Start Run. Act 1 -> Continue to Act 2 path unchanged.
- `Assembly-CSharp.csproj` + a new `.cs.meta` were touched (mechanically required for the new script to compile/import).

**Follow-up flagged:**
- M15.2: apply the 4 combat HP/damage multipliers at `CombatManager.BuildPlayerUnits`/`BuildEnemyUnits` seams, then retune. Confirmed this session that the multipliers are carried but unread, so difficulty is currently economy-only - this is the expected M15.1/M15.2 boundary, accepted by the user.
- "Restart Sandbox" (top chrome) still immediately restarts with the last preset, bypassing the menu - pre-existing; consider routing through the menu or removing in a later UI pass.
- `TP_M15.1.md` not yet run end-to-end by the user.

**Next slice:** M15.2 - apply combat HP/damage multipliers + retune.

## 2026-05-16 - M14.1: Act 2 state shell + 3-encounter mini vertical

**Milestone:** M14 - Act 2 mini vertical
**Status:** Complete (pending user run of TP_M14.1.md)

**Files added:**
- `TestPlans/TP_M14.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - Act constants (Act1/Act2FinalRound, Act1/Act2Rounds, FinalAct) + act display helpers.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - added explicit `int Act` field.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - 3 Act 2 rival-rematch encounters (abs rounds 11-13) + 8 upgraded enemy defs reusing Act 1 enemy ids for art/effect reuse; sandbox run sets Act=1.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - InitializeRun sets Act=1; act-aware `EvaluateNextState`; new `AdvanceToAct2()`.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - new `ContinueToAct2()` routing through `ChangeState(Scout)`.
- `DungeonDebt/Assets/Scripts/UI/EndScreenView.cs` - 3-way end screen, single reused button (Continue to Act 2 / New Run).
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - wired ContinueToAct2 callback; act-aware Scout/Victory status copy.
- `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs` - act-aware round display.
- `DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs` - act-aware title/type copy.

**Acceptance criteria:**
- [x] Act 1 round-10 win offers a real Continue to Act 2 path (not the old dead end).
- [x] Continuing preserves live party/tiers/gold/debt/morale/rival state; routes to Act 2 round 1 Scout via existing transitions.
- [x] Exactly 3 upgraded rival-guild rematches using existing systems only (higher stats, +1 Carry unit, reused FrugalGhostHeal; no new effects/art/heroes/payroll/resources).
- [x] Header/scout/status/end-screen distinguish Act 1 clear / Act 2 rounds 1-3 / Act 2 complete / defeat.
- [x] `TestPlans/TP_M14.1.md` exists with happy path, edge cases, observable invariants, targeted regression checks.

**Test plan:** `TestPlans/TP_M14.1.md` - drafted; not yet run by user. `dotnet build DungeonDebt.sln` passed with 0 warnings / 0 errors (rebuilt after the enemy-id art-reuse fix).

**Deviations from plan:**
- `RunState.cs` gained an explicit `int Act` field per user choice (NEXT_SESSION recommended absolute-round + UI mapping with no act data model). Minimized to one property; absolute `Round` kept as the encounter-lookup key so EncounterManager/RivalManager/BalanceRunLogger needed no changes. Flagged in the plan and user-approved.
- Removed an invalid "lower `Act1FinalRound`" test fast-path during test-plan authoring: it would desync Act 2 encounter lookup (encounters keyed to absolute 11-13; `AdvanceToAct2` derives the start round from `Act1FinalRound`). Edge cases use only the defeat temporary setup.
- Post-implementation fix: Act 2 enemy ids initially `act2_*` showed no portrait (catalog miss). Changed to reuse Act 1 enemy ids so existing portrait art and attack-effect category resolve. Enemy `Id` is not a unique key anywhere (`AllEnemies` is unused; SpriteCatalog seeds from its own id list), so duplicate ids are safe. Touched only `DataRepository.cs` (already in the slice change set).

**Follow-up flagged:**
- M14.2 retest/tuning slice was intentionally skipped per user decision: M14.1 is accepted as a proof that the run can carry into a second act. M14 is closed as a proof vertical; Act 2 fight expansion is deferred (revisit in a later content milestone).
- Act 2 enemy stats are conservative first-pass numbers; left as-is until Act 2 is expanded.
- Act 2 Complete is a temporary finale (no further content yet) - expected per scope.
- `TP_M14.1.md` was not run end-to-end by the user; M14.1 visually accepted via the live Act 2 Greedy fight + art-reuse fix instead.

**Next slice:** M15.0 - Difficulty modifiers planning + first-slice definition.

## 2026-05-16 - M13.1: Act 1 framing and transition shell

**Milestone:** M13 - Act 1 framing and transition shell
**Status:** Complete

**Files added:**
- `TestPlans/TP_M13.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs` - added persistent Act 1 round framing.
- `DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs` - added Act 1 scout/title framing.
- `DungeonDebt/Assets/Scripts/UI/EndScreenView.cs` - changed victory to Act 1 clear with a two-line Act 2 placeholder handoff.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - aligned status copy with Act 1 framing.

**Acceptance criteria:**
- [x] Existing 10-round run is clearly framed as Act 1.
- [x] Victory after round 10 reads as clearing Act 1 and shows a placeholder Act 2 handoff without starting Act 2.
- [x] Defeat flow remains clear and does not imply Act 2 is reached.
- [x] No gameplay flow, combat math, economy math, debt repayment, hero/enemy effects, or rival mechanics change.
- [x] `TestPlans/TP_M13.1.md` exists with happy path, edge cases, observable invariants, and targeted regression checks.

**Test plan:** `TestPlans/TP_M13.1.md` - user completed testing and reported the slice passed. One victory-screen Act 2 text clipping issue was found during testing and fixed by splitting the message into two lines. `dotnet build DungeonDebt.sln` from `DungeonDebt/` passed with 0 warnings / 0 errors.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- M13.1 tested cleanly after the end-screen copy fit adjustment. No M13.2 polish slice is needed unless later copy/layout feedback appears.

**Next slice:** M14.0 - Act 2 mini vertical planning.

## 2026-05-16 - M12.1: Debt status + Shop repayment

**Milestone:** M12 - Debt rework and resource-pressure readability
**Status:** Complete

**Files added:**
- `TestPlans/TP_M12.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added debt payment cap, debt-status thresholds, and repayment/status helpers.
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs` - added capped 1:1 Pay Debt action.
- `DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs` - added Pay Debt control and labels.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - wired Pay Debt callback and immediate refresh.
- `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs` - displays debt status in the header.
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs` - shows debt status and general high-debt warning copy.

**Acceptance criteria:**
- [x] Debt status is derived from current debt and displayed clearly in the run UI.
- [x] Shop includes a Pay Debt control that converts up to `GameRules.DebtPaymentCap` gold into debt reduction at 1:1.
- [x] Pay Debt immediately updates gold/debt and competes with hiring/rerolling.
- [x] High debt danger is clearer through general status/warning copy only; Debt Wraith mechanics remain unchanged.
- [x] No payroll actions, hero effects, enemy effects, act structure, or new content are added.

**Test plan:** `TestPlans/TP_M12.1.md` - user completed testing and reported no issues; slice considered passed. `dotnet build DungeonDebt.sln` from `DungeonDebt/` passed with 0 warnings / 0 errors.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- M12.1 tested cleanly; skip the optional M12.2 retest slice unless later balance feedback specifically calls for it.

**Next slice:** M13.1 - Act 1 framing and transition shell.

## 2026-05-16 - M11.2: Cut Wages rule alignment and first economy retest

**Milestone:** M11 - Economy and balance pass
**Status:** Complete

**Files added:**
- `TestPlans/TP_M11.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs` - removed Cut Wages per-hero upkeep mutation, kept temporary per-hero attack penalty, and corrected the reward summary text.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - applies Cut Wages as a single total-upkeep reduction during total upkeep calculation.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - corrected Cut Wages payroll card copy from per-hero upkeep reduction to total-upkeep reduction.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - reduced `SilverOfferChance` from `0.20f` to `0.12f`.
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs` - duplicate Bronze hires that upgrade an owned hero to Silver now include `SilverHireCostBonus`.
- `DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs` - shortened direct Silver offer button label so the gold cost remains visible.

**Acceptance criteria:**
- [x] Cut Wages reduces total upkeep by `GameRules.CutWagesUpkeepReduction` once per round, not once per hero, while still applying the attack penalty to all heroes for combat.
- [x] Standard Pay, Take Loan, and Promise Victory Bonus behavior remain unchanged by the Cut Wages fix.
- [x] Reward summary and balance TSV logs show corrected Cut Wages total-upkeep math.
- [x] `TestPlans/TP_M11.2.md` exists and includes targeted checks plus short post-fix retest guidance.
- [x] Session review identified the next tuning direction and concluded Act 1 / initial balance is good enough for now.

**Test plan:** `TestPlans/TP_M11.2.md` was created but not run as a checkbox plan by user choice. Instead, live balance TSV logs were reviewed across multiple batches: post-Cut-Wages fix, post-`SilverOfferChance = 0.12f`, and post-duplicate-upgrade premium. `dotnet build DungeonDebt.sln` passed after each code change with 0 warnings / 0 errors.

**Deviations from plan:**
- With user approval, the session expanded from Cut Wages alignment into conservative M11 tuning: direct Silver offer chance was reduced, duplicate Silver upgrades were repriced, and a quick Silver hire button-label bug was fixed.
- Manual checkbox execution of `TP_M11.2.md` was replaced by direct review of the generated balance TSV logs.

**Follow-up flagged:**
- Current 10-round balance looks acceptable if treated as Act 1 / initial difficulty: wins are common for stable runs, but debt, morale, and poor economy/combat decisions still produce meaningful losses.
- No M12 exists in `IMPLEMENTATION_PLAN.md`; the next implementation round should be planned explicitly before coding resumes.
- Potential future direction: act structure, difficulty modifiers, or a post-M11 planning pass. Do not add these until `IMPLEMENTATION_PLAN.md` is updated.

**Next slice:** none currently defined - planned M1-M11 work is complete; next session should discuss/update the next implementation plan round.

## 2026-05-16 - M11.1: Economy and balance baseline run matrix

**Milestone:** M11 - Economy and balance pass
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs`
- `DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs.meta`
- `TestPlans/TP_M11.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - starts a new balance TSV log when a run initializes.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - writes one balance TSV row after each completed round is evaluated and before payroll selection is cleared.

**Acceptance criteria:**
- [x] `TestPlans/TP_M11.1.md` exists and contains a repeatable baseline run matrix with three archetypes, logger instructions, manual notes, invalid-run handling, and M11.2 synthesis fields.
- [x] At least three runs were executed or explicitly invalidated: five valid victory logs, two meaningful defeat logs, and two header-only invalid starts were collected.
- [x] Findings identify concrete M11.2 hypotheses tied to specific files/constants: Cut Wages implementation/constant, Silver offer and Silver bonus values, debt/interest pressure, morale loss values, and reward/upkeep curve.
- [x] No gameplay/tuning constants were changed in M11.1.
- [x] Session summary identified the observed baseline and a ready M11.2 recommendation.

**Test plan:** `TestPlans/TP_M11.1.md` - logger created and verified through live Unity run logs; observed logs include Cut Wages-heavy wins, Standard Pay/loan coverage, debt defeat, morale defeat, and invalid header-only starts. `dotnet build` from `DungeonDebt/` passed with 0 warnings / 0 errors.

**Deviations from plan:**
- Revised mid-session with user confirmation from manual-only observation to lightweight balance telemetry. This added `BalanceRunLogger` and two source hooks, but did not alter gameplay math, tuning constants, scene files, prefabs, art, or design docs.

**Follow-up flagged:**
- First M11.2 target should be Cut Wages rule alignment: current behavior reduces each hero's upkeep by `GameRules.CutWagesUpkeepReduction`, while the design/plan describe reducing total upkeep by 3 for the round.
- Re-run a small post-fix matrix before broad Silver/economy tuning.
- Silver pacing looks hot: several wins reached 4-5 Silver heroes by round 10 with little or no debt.
- Debt/interest pressure works when loans are used, but Cut Wages-heavy runs avoid debt almost entirely.

**Next slice:** M11.2 - Cut Wages rule alignment and first economy retest.

## 2026-05-16 - M10.7: Combat-screen layout pass (v2 footer-card, practical Unity fit)

**Milestone:** M10 - Combat view rebuild
**Status:** Complete (user visually accepted combat result; formal TP_M10.7 checkbox run not fully recorded)

**Files added:**
- `TestPlans/TP_M10.7.md`

**Files removed:**
- `Combat Layout v2.html`
- `Combat Layouts.html`
- `combat-card-v2.jsx`
- `combat-variants.jsx`
- `design-canvas (1).jsx`
- `tweaks-panel.jsx`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs` - reshaped combat unit cards into portrait cards with a bottom footer band, 1px role-accent footer edge, HP track, and no-sprite name fallback.
- `DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs` - enlarged combat card/grid constants to `200x176` and explicitly applied card RectTransform sizing so Unity does not fall back to default 100x100 cards.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - added combat-only top reclaim via `CombatScreenTopOffset`, plus a compact combat status/restart header that stays clear of the persistent run header.
- `TestPlans/Capture.PNG` - user-provided visual capture used to verify the first pass and expose the unresolved card-size/header overlap issues.

**Acceptance criteria:**
- [x] AC1 - `CombatUnitCardView` is now a portrait card: portrait above a fixed bottom footer, HP in the footer, role-accent footer edge, darker footer background, and name only as the no-sprite fallback.
- [x] AC2 - Combat-only relayout reclaims vertical space and cards are meaningfully larger than 150x102 (`200x176` final fit); the scrolling log remains in its existing strip.
- [x] AC3 - Non-combat panel offsets were not changed; shop/formation/payroll/scout/reward/end/leaderboard continue using the shared existing layout.
- [x] AC4 - Existing card states are preserved: role band, tier frame, acting outline, hit flash, dead tint, no-sprite name fallback, and HP colour threshold.
- [x] AC5 - `CombatLogView`/combat math/run/data/flow/art/scene were not changed; M10.5 effect motion still reads live card world positions and should track the new card size.

**Test plan:** `TestPlans/TP_M10.7.md` created. `dotnet build DungeonDebt.sln` passed with 0 warnings / 0 errors. User visually accepted the corrected combat layout; full manual checkbox run remains available for regression sweep.

**Deviations from plan:**
- Final card height is `176` rather than the ideal `208`, preserving the scrolling log and bounded top reclaim.
- The compact combat header was placed in the upper-right combat area below the run header after `Capture.PNG` showed the first pass overlapping the persistent Round/Gold/Debt/Morale header.
- Added an explicit card RectTransform sizing fix after `Capture.PNG` showed Unity ignored preferred card size while row layout child-control sizing was disabled.

**Follow-up flagged:**
- M10.5 effect motion and R001 long-log scroll are covered in `TP_M10.7.md`; run them during the next broad visual/regression sweep if desired.
- Balance work can now proceed to M11.

**Next slice:** M11.1 - Economy and balance baseline run matrix.

## 2026-05-16 - M10.6: Combat card cleanup (thin tier frame + name as no-sprite fallback)

**Milestone:** M10 - Combat view rebuild
**Status:** Complete (user accepted changes; formal TP_M10.6 Editor run skipped as the change was minimal/layout-only)

**Files added:**
- `TestPlans/TP_M10.6.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs` - tier-border top/bottom/left/right now use the fixed-thickness `SetEdge*` strip helpers (left/right were full-card `SetAnchored` fills - the M10.4-flagged bug); unit name text shown only as the no-sprite fallback, driven by `SetPortrait`/disabled in `Clear`; trimmed stale tier-frame comment.

**Acceptance criteria:**
- [x] AC1 - thin four-sided tier frame, consistent thickness, no card fill / portrait occlusion.
- [x] AC2 - name shown only as no-sprite fallback (kept so the placeholder box stays identifiable; contained in `SetPortrait`).
- [x] AC3 - portrait/HP/role band/thin frame legible; no card-size/row change; enemy cards only see the allowed name change.
- [x] AC4 - no combat/run/data/effect/flow change; `SpriteCatalog`/`MainMenuPanel`/`_swordSprite`/`sword.png` untouched.
- [x] AC5 - layout-only; no tween/Animator/particles/audio/new art.

**Test plan:** `TestPlans/TP_M10.6.md` created (happy path, edge cases incl. no-sprite fallback + revert, invariants, regression checks). Formal Editor run skipped by user decision - change is minimal and layout-only; visually accepted.

**Deviations from plan:**
- None. The M10.4-spawned standalone tier-border task never landed (no branch/commit), so this slice covered both items as orientation predicted.

**Follow-up flagged:**
- M10.4 tier-border finding was never filed as a regression; fixed here, so no separate regression needed.
- M10.2 AC4 feasibility verdict still pending user TP_M10.2 Editor run (carried).

**Next slice:** M10.5 - shared effect-sprite set + category-routed source->target motion.

## 2026-05-16 - M10.4: Sprite catalog + static base sprites on combat cards

**Milestone:** M10 - Combat view rebuild
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/SpriteCatalog.cs`
- `DungeonDebt/Assets/Scripts/UI/SpriteCatalog.cs.meta`
- `TestPlans/TP_M10.4.md`
- `DungeonDebt/Assets/Art/Units/Heroes/*.png` + `.meta` (12, user-supplied)
- `DungeonDebt/Assets/Art/Units/Enemies/*.png` + `.meta` (16, user-supplied)
- `DungeonDebt/Assets/Art/Effects/*.png` + `.meta` (5, user-supplied; consumed in M10.5)

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs` - confined upper/centre portrait Image + SetPortrait + Clear reset; portrait created after the tier-frame images so it is not occluded for heroes.
- `DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs` - SpriteCatalog passed via Initialize; ResolveBaseSprite resolves hero/enemy art by stable id per card.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - serialized `_spriteCatalog`, passed to CombatPanelView; `_swordSprite`/`sword.png` untouched.
- `DungeonDebt/Assembly-CSharp.csproj` - local Compile entry for new script (Unity regenerates).
- Art folders reorganised to `SPRITE_CHECKLIST.md` layout (`Units/Heroes`, `Units/Enemies`, `Effects`); legacy `Combat/sword.png` left intact for M10.5.

**Acceptance criteria:**
- [x] AC1 - SpriteCatalog MonoBehaviour, typed lookups (hero/enemy/effect), null-on-miss, self-seeds 33 ids, presentation-only.
- [x] AC2 - Hero and enemy combat cards display the correct base sprite by stable id (verified live: Slime/Enchanter/Wizard/Ranger/Treasurer portraits render).
- [x] AC3 - Missing/unassigned sprite falls back to placeholder box (observed before slots were assigned; no errors, no layout break).
- [x] AC4 - No combat/run/data/effect/flow change; `_swordSprite`/`sword.png` path intact.
- [x] AC5 - No tween/Animator/particles/audio/unique art; static base sprite only (effect slots seeded but unused until M10.5).

**Test plan:** `TestPlans/TP_M10.4.md` - happy path + fallback exercised live during the Editor session (enemy then hero portraits, placeholder fallback when slots empty). Formal full step-by-step run not recorded; behaviour confirmed via screenshots and a temporary diagnostic (added then reverted, build clean, no residue).

**Deviations from plan:**
- Per user decision (option b), `Main.unity` was not hand-edited; `SpriteCatalog` self-seeds its 33 ids via OnValidate/Reset/Awake and the user added + wired the component in the Editor.
- Portrait z-order moved to after the tier-frame images (root cause of heroes initially showing no art - see follow-up).

**Follow-up flagged:**
- **Pre-existing bug (discovered in M10.4, out of scope):** in `CombatUnitCardView.BuildUi` the hero tier-border left/right images use `SetAnchored(...)` and render as full-card opaque rectangles in the tier colour instead of thin edges, so hero cards read as solid orange/grey blocks. Spawned as a separate task; recommend filing as a regression. Fix bundled into the next slice.
- User request: remove the now-redundant unit name text on combat cards (portraits identify units). Folded into the next slice; consider keeping the name only as the no-sprite fallback.
- M10.2 AC4 feasibility verdict still pending the user's TP_M10.2 Editor run (carried).
- M10.3 has no PROGRESS.md entry (docs-only slice) - paste if tracked.

**Next slice:** M10.6 - Combat card cleanup (thin tier frame + remove redundant name text)

## 2026-05-15 - M10.2: Combat replay and visual feasibility prototype

**Milestone:** M10 - Combat view rebuild
**Status:** Partial - code complete & builds clean; AC4 feasibility verdict pending user TP_M10.2 run

**Files added:**
- `DungeonDebt/Assets/Scripts/Data/CombatReplayEvent.cs`
- `DungeonDebt/Assets/Scripts/Data/CombatReplayEvent.cs.meta`
- `DungeonDebt/Assets/Art/Combat/sword.png` (user-supplied placeholder sprite)
- `TestPlans/TP_M10.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/CombatResult.cs` - added `ReplayEvents` list.
- `DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs` - parallel `CombatReplayEvent` per log line; new `LogHeal`.
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - copies replay events into result; resolver unchanged.
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` - shared heal callsite `LogMessage`->`LogHeal`; no effect math change.
- `DungeonDebt/Assets/Scripts/UI/CombatLogView.cs` - added `StreamReplay(events, onStep, onComplete)`.
- `DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs` - `ApplyReplayEvent`, `ClearAllActing`, board-level traveling sword stab state machine.
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs` - per-step HP setter, thin-edge acting outline, pulsing green heal frame, hit flash; per-card slash removed.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - serialized `_swordSprite`; `StreamLines`->`StreamReplay`.
- `DungeonDebt/Assembly-CSharp.csproj` - local Compile entry for new script (Unity regenerates).

**Acceptance criteria:**
- [x] AC1 - HP bars update per event during replay.
- [x] AC2 - Visual prototype: acting outline + hit flash + heal frame + board-level Warrior sword stab.
- [x] AC3 - Combat math/log/run flow unchanged; final-snapshot refresh preserved.
- [ ] AC4 - Feasibility verdict (F1/F2/F3) to be recorded in TP_M10.2.md after user Editor run.
- [x] AC5 - No tween lib/particles/audio/new states/resolver changes; sole new asset is user-supplied sword.png.

**Test plan:** `TestPlans/TP_M10.2.md` - awaiting user run; visuals verbally approved ("looks good for a first pass").

**Deviations from plan:**
- `HeroEffects.cs` added at Plan checkpoint for heal HP-after data (single shared callsite swap).
- Per-card slash replaced with board-level traveling sword stab; acting/heal changed from full-card fills to thin edge frames (user iteration).
- Auditor damage stays Message-only (HP corrected by final snapshot); documented TP R4.

**Follow-up flagged:**
- AC4 verdict recording.
- Sprite organization decision deferred to M10.3 planning slice (A: SpriteCatalog vs B: ScriptableObject); current single-field approach is Option A in miniature, non-scaling.
- M10.3 must ratify scope amendments (CLAUDE.md §Scope control / IMPLEMENTATION_PLAN.md §15) before any per-entity sprite or per-card animation code.

**Next slice:** M10.3 - Sprite-foundation planning slice (no code): decide sprite architecture, amend scope docs, produce PNG checklist.

## 2026-05-15 - M10.1: Combat view rebuild kickoff

**Milestone:** M10 - Combat view rebuild
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs`
- `DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs.meta`
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs`
- `DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs.meta`
- `TestPlans/TP_M10.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/CombatResult.cs` - added combat-start and combat-final unit snapshots for presentation.
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - copies read-only unit snapshots without changing resolver behavior.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - builds and shows the combat board above a smaller retained combat log.
- `TestPlans/TP_M10.1.md` - manual test plan for combat board, snapshot display, edge cases, and regression seams.

**Acceptance criteria:**
- [x] Combat view shows player/enemy combatants as visible panels during Combat, separate from the existing text log.
- [x] Placeholder combat tiles show unit names, HP bars, tier-colored borders for heroes, enemy accent bands, and red dead-state styling.
- [x] The view is populated from combat-start/combat-result data without changing combat resolution rules, target rules, rewards, upkeep, or hero effects.
- [x] Existing `CombatLogView` remains visible and continues to stream the resolved log.
- [x] No tweens, particles, audio, new combat states, new statuses, or gameplay behavior changes.

**Test plan:** `TestPlans/TP_M10.1.md` - created; user visually verified the combat board through screenshot iterations and reported the final trapezoid formation layout looks good.

**Deviations from plan:**
- Final placeholder combat tiles intentionally omit visible ATK values; the combat log remains the temporary source of truth until M10.2 prototypes attack/take-damage visuals.
- Combat layout evolved from simple rows into fixed formation lanes (`Enemy Back`, `Enemy Front`, `Hero Front`, `Hero Back`) to match the Formation screen's 2-front / 3-back structure.
- Added script `.meta` files. Updated ignored generated `Assembly-CSharp.csproj` locally so `dotnet build` could include the new scripts.

**Follow-up flagged:**
- M10.2 should prototype live replay visuals and decide whether the current uGUI combat board can support attack/take-damage animation, or whether future M10 work needs a GameObject-based combat representation.

**Next slice:** M10.2 - Combat replay and visual feasibility prototype.

## 2026-05-15 - M9.3: Upgrade delta preview

**Milestone:** M9 - Bronze->Silver tiering
**Status:** Complete

**Files added:**
- `TestPlans/TP_M9.3.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs` - upgrade offers now show concise Bronze -> Silver stat/effect deltas.

**Acceptance criteria:**
- [x] Upgrade offers preview Bronze -> Silver changes before purchase.
- [x] Only changed values/effects are shown.
- [x] Silver direct-hire offers keep normal Silver offer display.
- [x] No tuning, combat, economy, or tier-rule changes.

**Test plan:** `TestPlans/TP_M9.3.md` - user reported changes look good.

**Deviations from plan:**
- `ShopPanelView.cs` did not need changes; existing `isUpgrade` context was sufficient.

**Follow-up flagged:**
- None.

**Next slice:** M10.1 - Combat view rebuild kickoff.

## 2026-05-15 - M9.2: Silver shop offers, Silver direct-hire cost, and per-hero Silver bonuses

**Milestone:** M9 - Bronze->Silver tiering
**Status:** Complete

**Files added:**
- `TestPlans/TP_M9.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/ShopOffer.cs` - added offer-tier data.
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs` - added Silver offers, Silver direct-hire cost, Silver instance seeding, and duplicate path preservation.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added M9.2 placeholder Silver constants.
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` - added tier-aware stat/upkeep/effect bonuses.
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - used Silver HP and multi-redirect Knight counter.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - reseeded tier-aware stats at round boundaries.
- `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs` - preserved Silver baselines after temporary payroll stat changes.
- `DungeonDebt/Assets/Scripts/UI/HeroCardView.cs` - added definition + tier card refresh.
- `DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs` - displayed Silver offer badge/labels.
- `DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs` - kept Bronze duplicate upgrade logic separate from Silver offer display.

**Acceptance criteria:**
- [x] Silver offers surface directly using `GameRules.SilverOfferChance`.
- [x] Silver direct-hire costs Bronze cost + `SilverHireCostBonus` and creates a Silver instance.
- [x] Per-hero Silver bonus shapes are active.
- [x] Shop offer cards visibly indicate Silver-tier offers.
- [x] No Gold tier or out-of-scope systems added.

**Test plan:** `TestPlans/TP_M9.2.md` - user reported completed test pass.

**Deviations from plan:**
- Added `PayrollManager.cs` so temporary payroll stat resets preserve Silver baselines.
- Fixed Silver Treasurer targeting to choose two distinct allies.

**Follow-up flagged:**
- None.

**Next slice:** M9.3 - Upgrade delta preview.

## 2026-05-15 - M9.1: Bronze->Silver tiering foundation

**Milestone:** M9 - Bronze->Silver tiering
**Status:** Complete

**Files added:**
- `TestPlans/TP_M9.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/GameEnums.cs` - added `HeroTier { Bronze, Silver }`.
- `DungeonDebt/Assets/Scripts/Data/HeroInstance.cs` - added mutable `Tier` (default Bronze).
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added `SilverBadgeColor`.
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs` - `Hire` upgrades a Bronze-owned duplicate to Silver in-place (no slot consumed, no new instance); offer-pool now excludes only Silver-owned heroes; defensive Silver-dup guard; added passive `IsUpgradeOffer` helper for symmetry with M9.2.
- `DungeonDebt/Assets/Scripts/UI/HeroCardView.cs` - tier slot paints Bronze/Silver fill for instance-bound cards; definition-only paths keep M8.1 reserved-empty look.
- `DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs` - `Refresh` takes `isUpgrade`; relabels button to `Upgrade (Xg)` with `Merges to Silver` status; party-full disable skipped on upgrade.
- `DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs` - computes per-offer Bronze-owned-duplicate flag and forwards it to `ShopOfferView`.
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - in-slice cosmetic-bug fix: moved the `HeroInstance.CurrentHealth = BaseHealth` reset from `BuildPlayerUnits` (next combat) to `FinishResult` (end of current combat) so between-combat UI (e.g., Shop Party list) sees coherent full-HP values. Matches `CLAUDE.md` §Common pitfalls "no permadeath" rule.

**Acceptance criteria** (per `IMPLEMENTATION_PLAN.md §15` M9.1/M9.2 split, user-confirmed Option A; NEXT_SESSION.md AC4 active-Silver-bonus wording was treated as over-scoped and deferred to M9.2):
- [x] AC1 - `HeroTier` enum + default-Bronze `HeroInstance.Tier`.
- [x] AC2 - Duplicate-hire of Bronze-owned hero merges to Silver in same slot.
- [x] AC3 - `HeroCardView` paints Bronze/Silver fill; definition-only paths reserved-empty.
- [x] AC4 - Silver bonus stubbed; combat/upkeep math unchanged.
- [x] AC5 - No Gold tier, equipment, traits, factions, synergies, `SilverHireCostBonus`, `UnityEngine.Random`, tweens, forbidden folders.

**Test plan:** `TestPlans/TP_M9.1.md` - all 14 steps + 6 invariants pass per user. One regression observed during testing (stale post-combat HP in Shop Party panel) was fixed in-slice via `CombatManager.FinishResult` reset.

**Deviations from plan:**
- `ShopOfferView.cs` and `ShopPanelView.cs` were added to scope mid-plan in response to Q3 (button-label-only upgrade hint). Confirmed surgical - only button text, status text, and party-full disable path touched.
- `CombatManager.cs` was added to scope late in the session to fix the stale-HP regression via Option B (move the HP reset into `FinishResult`). User explicitly chose this over the smaller `ShopPanelView` cosmetic fix because it aligns the data model with the "no permadeath" rule.
- Treated `NEXT_SESSION.md` AC4 (active Silver bonus) and "Silver offers in pool" mention as over-scoped per `IMPLEMENTATION_PLAN.md §15` M9.1/M9.2 split, with user confirmation.

**Follow-up flagged:**
- M9.2: Silver shop offers in the pool (placeholder probability constants in `GameRules`), `SilverHireCostBonus` for Silver direct-hire cost, per-hero Silver bonuses wired into `HeroEffects` and stat reads.
- `ShopManager.IsUpgradeOffer` is currently unreferenced (kept for symmetry with M9.2; consider deleting in a cleanup slice if it remains unused after M9.2).
- Polish: `Merges to Silver` is currently a status-line string only; the offer card's hero card still renders the M8.1 reserved-empty tier slot. A future polish slice could preview the Silver fill on an upgrade-eligible offer card.

**Next slice:** M9.2 - Silver shop offers, `SilverHireCostBonus`, and per-hero Silver bonuses.

## 2026-05-15 - M8.2: Formation card adoption

**Milestone:** M8 - Card readability pass
**Status:** Complete

**Files added:**
- `TestPlans/TP_M8.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/HeroCardView.cs` - added `Refresh(HeroInstance)` overload + private `ApplyContent` so Formation uses live ATK / `UpkeepThisRound`.
- `DungeonDebt/Assets/Scripts/UI/FormationSlotView.cs` - replaced inline name/stats/role fields with a hosted `HeroCardView`; kept background/button/highlight/empty placeholder; moved slot label to bottom-right to avoid colliding with the reserved tier slot.
- `DungeonDebt/Assets/Scripts/UI/FormationPanelView.cs` - bumped slot size 220x160 -> 240x200 so the embedded card layout fits without text crunching; tightened title/hint/row-gap/continue-button chrome so the Continue button stays inside the host panel's ~600px height.

**Acceptance criteria:**
- [x] AC1 - Occupied slots render via `HeroCardView` with role band, badge, ATK/HP, prominent Upkeep, blurb, reserved tier slot.
- [x] AC2 - Empty slots clearly empty; frontline/backline distinction preserved.
- [x] AC3 - Click-swap reassignment + frontline targeting unchanged.
- [x] AC4 - Reserved tier slot stays empty; no tier logic.
- [x] AC5 - No `UnityEngine.Random`, tweens, audio/VFX, forbidden folders; `dotnet build` clean (0 warn / 0 err).

**Test plan:** `TestPlans/TP_M8.2.md` - 18/18 pass.

**Deviations from plan:**
- Initial slot bump 220x160 -> 240x220 clipped the Continue button against the host panel's fixed ~600px height. Resolved in-slice by reducing slot height to 200 (matches M8.1 shop offer height) and tightening title/hint/row-gap/continue spacing. Slot width stayed at 240. No `MainMenuPanel.cs` change required.

**Follow-up flagged:**
- None.

**Next slice:** M9.1 - Bronze->Silver tiering foundation (duplicate-hire merge, Silver shop offers, per-hero Silver bonus).

## 2026-05-15 - M8.1: Card readability foundation

**Milestone:** M8 - Card readability pass
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/EnemyCardView.cs`
- `TestPlans/TP_M8.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - role color palette (Tank/Damage/Support/Economy), `BronzeBadgeColor`, `ReservedTierSlotOutlineColor`, `GetRoleColor(HeroRole)` helper.
- `DungeonDebt/Assets/Scripts/UI/HeroCardView.cs` - extended in place: left role color band, role badge chip, prominent gold-tinted Upkeep line, wrapped effect blurb, top-right empty reserved tier-slot rendered as a faint-fill rect with four explicit border-edge `Image` strips.
- `DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs` - bumped `CardHeight` 124 -> 200 to fit the extended hero card.
- `DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs` - added "Danger: <category>" line and a centered horizontal row of `EnemyCardView` per encounter enemy; moved Continue button down.
- `DungeonDebt/Assets/Scripts/UI/EnemyCardView.cs` - in-slice fix: bumped Name area to fit two wrapped lines so multi-word enemy names ("Carry Protector") no longer overlap the stat block.
- `SESSION_PROTOCOL.md` - step 6: removed mandatory "Rule checks" section from test plans (folded into step 5 self-verification) and made "Regression checks" opt-in.

**Acceptance criteria:**
- [x] AC1 - HeroCardView shows role color band+badge, name, ATK/HP, prominent Upkeep, wrapped blurb, empty reserved tier slot.
- [x] AC2 - EnemyCardView shows name, ATK/HP, blurb. Encounter-role hint rendered at the encounter level as "Danger: <category>" in Scout (per Q5 answer A - `EnemyDefinition` has no per-enemy role field).
- [~] AC3 - Role color palette + Bronze color exposed in `GameRules` and consumed by `HeroCardView`. `EnemyCardView` does not consume role colors (enemies have no `HeroRole`); `BronzeBadgeColor` is exposed but unused this slice (Q2 answer A -> neutral grey outline). User accepted this reading.
- [x] AC4 - Shop and Scout adopt the new card views; Formation deferred to M8.2.
- [x] AC5 - No tier logic, HP bars, combat changes, tweens, audio/VFX, or forbidden folders.

**Test plan:** `TestPlans/TP_M8.1.md` - happy path 7/7 pass, edge cases 7/7 pass, observable invariants 6/6 pass. Rule checks 6/6 pass but flagged by user as out of scope for test plans going forward (now codified in `SESSION_PROTOCOL.md`). Regression checks (Steps 21-25) intentionally not run per same feedback.

**Deviations from plan:**
- `ShopPanelView.cs` and `MainMenuPanel.cs` were listed as "may modify" - not needed.
- No `Assets/Art/` sprites added - solid color blocks read cleanly without them.
- Reserved tier slot border initially used Unity's `Outline` component on a transparent `Image` (invisible because `Outline` clones the underlying graphic); switched mid-test to four explicit border-edge `Image` strips with a faint fill.
- `EnemyCardView` Name area required a follow-up bump after Step 14 surfaced two-line name overlap on rival ghost rounds.
- `SESSION_PROTOCOL.md` updated mid-session per user feedback to drop mandatory "Rule checks" and default-out "Regression checks" in test plans.

**Follow-up flagged:**
- AC3 strict reading: if `EnemyCardView` should also visibly consume a `GameRules` color, that is a one-line tweak.
- `BronzeBadgeColor` is currently dead code, intended for M9 to consume.

**Next slice:** M8.2 - Formation panel adopts `HeroCardView`.

## 2026-05-15 - M7.3: M7 full-run verification and milestone closeout

**Milestone:** M7 - Rival Ghosts
**Status:** Complete

**Files added:**
- `TestPlans/TP_M7.3.md`

**Files modified:**
- None.

**Acceptance criteria:**
- [x] Full M7 loop verified.
- [x] Leaderboard behavior preserved.
- [x] Ghost fights verified.
- [x] Reward/morale rules verified.
- [x] Milestone closeout ready.

**Test plan:** `TestPlans/TP_M7.3.md` - user reported all cases passing.

**Deviations from plan:**
- The initial closeout test plan was shortened at the user's request because M7.1, R003, and M7.2 were already tested and no runtime code changed in M7.3.

**Follow-up flagged:**
- None.

**Next slice:** Not decided. Leave `NEXT_SESSION.md` unchanged until the next implementation direction is chosen.

## 2026-05-15 - M7.2: Scripted rival ghost teams and ghost fight modifiers

**Milestone:** M7 - Rival Ghosts
**Status:** Complete

**Files added:**
- `TestPlans/TP_M7.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - replaced R3/R6/R9 Slime placeholders with scripted rival ghost teams.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - applied rival ghost reward and morale modifiers.
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` - reused Priest-style healing for Frugal Healer.
- `DungeonDebt/Assets/Scripts/Data/GameEnums.cs` - added Frugal ghost heal effect id.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added shared frontline heal amount constant.

**Acceptance criteria:**
- [x] Round 3 Greedy ghost fight uses a scripted non-Slime team.
- [x] Round 6 Carry ghost fight uses a protected high-damage carry team.
- [x] Round 9 Frugal ghost fight uses a distinct efficient team with healer behavior.
- [x] Ghost wins award +10 gold; ghost losses apply -8 morale.
- [x] Existing M7 flow and leaderboard behavior are preserved.

**Test plan:** `TestPlans/TP_M7.2.md` - user reported all tests appear to be passing.

**Deviations from plan:**
- Frugal Healer behavior was included with user confirmation by sharing Priest-style heal logic.

**Follow-up flagged:**
- None.

**Next slice:** M7.3 - M7 full-run verification and milestone closeout.

## 2026-05-15 - R003: Fix hire placement after formation movement

**Milestone:** Regression fix before continuing M7
**Status:** Complete

**Files added:**
- `TestPlans/TP_R003.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs` - changed hiring to assign the first empty formation slot instead of `run.Party.Count`.

**Acceptance criteria:**
- [x] Hiring assigns the first empty formation slot from 0-4.
- [x] R003 repro no longer stacks heroes in `B3`.
- [x] Fire behavior remains valid and later hires remain non-stacked.
- [x] Formation UI shows each party member exactly once.
- [x] Existing M7.1 flow and leaderboard behavior are preserved.

**Test plan:** `TestPlans/TP_R003.md` - user reported all test cases pass.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- None.

**Next slice:** M7.2 - Scripted rival ghost teams and ghost fight modifiers.

## 2026-05-15 - M7.1: Rival state and leaderboard loop

**Milestone:** M7 - Rival Ghosts
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Run/RivalManager.cs`
- `DungeonDebt/Assets/Scripts/Run/RivalManager.cs.meta`
- `DungeonDebt/Assets/Scripts/UI/RivalLeaderboardView.cs`
- `DungeonDebt/Assets/Scripts/UI/RivalLeaderboardView.cs.meta`
- `TestPlans/TP_M7.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - added local rival profile construction for Greedy Guild, Frugal Guild, and Carry Guild.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added rival tuning constants for deterministic scripted updates.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - wired `RivalManager`, `RivalUpdate`, and Continue-from-RivalUpdate flow.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - initialized rivals at run start and routed non-terminal rounds to `RivalUpdate`.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - built and toggled the compact/full rival leaderboard during Scout and RivalUpdate.

**Acceptance criteria:**
- [x] Starting a run initializes exactly 3 rivals with the M7.1 profile values.
- [x] Continuing a non-terminal round enters `GameState.RivalUpdate`, advances rivals, then continues to next Scout.
- [x] Greedy, Frugal, and Carry rival payroll/debt/morale math advances deterministically per the slice brief.
- [x] `RivalLeaderboardView` shows player plus 3 rivals sorted by morale.
- [x] Scout shows a compact leaderboard; RivalUpdate shows the full leaderboard; other panels are not obscured.
- [x] R3/R6/R9 Slime placeholder ghost fights and MVP scope limits were preserved.

**Test plan:** `TestPlans/TP_M7.1.md` - user reported all 25 steps pass. One separate regression was observed during testing and filed as R003.

**Deviations from plan:**
- `GameRules.cs` was added to scope with user confirmation so rival math did not hardcode tuning numbers.

**Follow-up flagged:**
- **R003 filed:** hiring after formation movement can stack two heroes into the same formation slot.
- M7 later slice: replace R3/R6/R9 Slime placeholders with scripted ghost teams and add rival ghost reward/morale modifiers.

**Next slice:** R003 - Fix hire placement so new heroes use an empty formation slot.

## 2026-05-15 - M6.2: Encounter and hero effects wired into combat / reward / upkeep

**Milestone:** M6 - Full 10-Round Run
**Status:** Complete

**Files added:**
- `TestPlans/TP_M6.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs` - implemented hero effects plus encounter/enemy effect hooks for combat start, targeting, kill rewards, end-of-round effects, combat end, and pre-upkeep.
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs` - added the narrow targeting override surface, Knight redirect integration, run-aware kill hook, survivor flag capture, and combat-end hook call.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - assigned real enemy and encounter effect IDs for M6.2 encounters.
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added M6.2 encounter constants and restored `StartingGold` to the locked value of 10 after testing.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - added `FullUpkeepPaidLastRound` for Wizard scaling.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - applied survivor-flag reward drains, encounter upkeep modifiers, hero pre-upkeep effects, and full-upkeep tracking.

**Acceptance criteria:**
- [x] Goblin Thieves set `goblinStoleGold` at end of combat round 3 and reduce reward by 3, clamped to 0.
- [x] Tax Collector adds +2 to total upkeep in the reward/upkeep math.
- [x] Backline Bat targets the lowest-HP backline hero on combat round 2, falling back to normal targeting if no backline target exists.
- [x] Debt Wraith scales `CombatUnit.Attack` from current debt without mutating the immutable `EnemyDefinition`.
- [x] Treasure Leech sets `treasureLeechSurvived` if alive at combat end and drains 4 reward gold, clamped to 0.
- [x] Dungeon Auditor adds +3 upkeep and deals 1 damage to each living player hero every 3 combat rounds.
- [x] Every `HeroEffectId` has an observable in-game behavior or intentional no-op flavor case covered by `TP_M6.2.md`.
- [x] Full 10-round flow still runs Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> Upkeep -> Scout, with Victory after Round 10 win.

**Test plan:** `TestPlans/TP_M6.2.md` - user reported all behavior working except the original Treasure Leech Step 8 expectation; the plan was corrected because MVP win rules require all enemies dead, so a surviving Leech implies a loss and drains `LossReward` from 4 to 0. `dotnet build DungeonDebt.sln` passed with 0 warnings and 0 errors after the correction.

**Deviations from plan:**
- Corrected `TP_M6.2.md` Treasure Leech expectations from an impossible "win while Leech survives" case to the implemented and documented combat win rule: kill Leech to win for +8, or let it survive and lose with +0 reward after drain.
- Restored `GameRules.StartingGold` from a temporary test value of 100 back to the locked design value of 10.

**Follow-up flagged:**
- M7.1: add local scripted rival state, per-round rival updates, and the visible rival leaderboard.
- M7 later slice: replace R3/R6/R9 Slime placeholders with scripted ghost teams and add rival ghost reward/morale modifiers.
- Cleanup (deferred): `RunManager.PrepareSandboxRun()` / `DataRepository.CreateSandboxRun()` remain legacy sandbox helpers; remove only in a dedicated cleanup slice after M6/M7 stability.

**Next slice:** M7.1 - Rival state and leaderboard loop.

## 2026-05-14 - M6.1: Scout panel and encounter list wiring

**Milestone:** M6 - Full 10-Round Run
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Run/EncounterManager.cs`
- `DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs`
- `TestPlans/TP_M6.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` — added `CurrentEncounter` property so Scout/Combat/Reward share the loaded encounter.
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` — added 6 enemy definitions (GoblinThief, TaxCollector, BacklineBat, DebtWraith, TreasureLeech, DungeonAuditor) and the static 10-entry `Encounters` list per §8 table; R3/R6/R9 use Slime placeholders until M7.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` — added `EncounterManager` field/property/wire-up; `StartRun` now chains `StartRun → Scout`; added `ContinueFromScout`; `ChangeState` calls `LoadEncounter` on Scout entry; `ContinueAfterReward` reroutes the run-continue branch to Scout after `AdvanceRound()`.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` — built `ScoutPanelView` in `BuildUi`; added a `Scout` branch in `HandleStateChanged` and hid the panel in every other branch; `RunSandboxCombat` now uses `run.CurrentEncounter` instead of `DataRepository.SandboxEncounter`.
- `REGRESSIONS.md` — moved R002 from Open to Closed (administrative cleanup at session start; R002 was actually fixed in the prior slice).

**Acceptance criteria:**
- [x] AC1 — Scout state wired into StartRun and round-advance.
- [x] AC2 — Scout panel shows encounter name, type, scout text, reward, Continue.
- [x] AC3 — EncounterManager.LoadEncounter(round) returns the right EncounterDefinition; enemies flow into combat in slot order.
- [x] AC4 — All 10 encounters present in DataRepository.Encounters with correct names/types/scout text per §8.
- [x] AC5 — Full 10-round playthrough with Scout each round and Victory after R10 (TP_M6.1 sweep completed, no observations).
- [x] AC6 — No hero/enemy behavioral effects in this slice (all use *.None; combat is plain DPS).

**Test plan:** `TestPlans/TP_M6.1.md` — completed; happy path steps 1-8 marked pass, no observations on remaining sweep/data/state/rule/regression/invariant checks.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- M6.2: implement encounter effects (Goblin Thief steal, Tax Collector upkeep, Backline Bat targeting, Debt Wraith scaling, Treasure Leech reward drain, Dungeon Auditor boss effects) and wire each encounter/enemy's EffectId.
- M6.2: any remaining hero effect implementations in `HeroEffects.cs` per §7.
- M7: replace R3/R6/R9 Slime placeholders with proper rival ghost teams; rival win-bonus reward math.
- Cleanup (deferred): `RunManager.PrepareSandboxRun()` / `DataRepository.CreateSandboxRun()` still unreferenced once Combat is exclusively driven by `run.CurrentEncounter`; `MainMenuPanel.RunSandboxCombat` keeps a defensive fallback to `SandboxEncounter`.

**Next slice:** M6.2 - Encounter and hero effects wired into combat / reward / upkeep.

## 2026-05-14 - R002: Round-advance routes through Shop → Formation → Payroll → Combat

**Milestone:** Regression fix (blocks M6 entry)
**Status:** Complete

**Files added:**
- `TestPlans/TP_R002.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - `EvaluateNextState()` returns `GameState.Shop` instead of `GameState.Combat` for the "run continues" case.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - `ContinueAfterReward()` calls `AdvanceRound()` when transitioning to `Shop` instead of `Combat`.

**Acceptance criteria:**
- [x] AC1 - Continue from Reward Summary goes to Shop, not Combat.
- [x] AC2 - All in-between states fire in order: Shop → Formation → Payroll → Combat → Reward → Upkeep → next round's Shop.
- [x] AC3 - `SelectedPayrollAction` is null at every Payroll-state entry.
- [x] AC4 - Per-hero `Attack`/`UpkeepThisRound` at base when Round 2's Payroll panel renders.
- [x] AC5 - No new shop refresh, encounters, scout, or rival.
- [x] AC6 - End conditions (morale, debt, round 10) still fire.

**Test plan:** `TestPlans/TP_R002.md` - All scenarios A–G pass. Scenarios A/B verify single-round→multi-round transition; C verifies 10-round sweep end-to-end; D verifies end conditions (morale, debt, victory); E verifies code rules; F verifies prior-slice regression checks; G verifies invariants. All temporary GameRules edits reverted.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- M5.2 AC5 (multi-round economy) is now testable and passes. M5.2 can be marked fully complete if TP_M5.2 A.5 and F.2 second-half scenarios are re-run (now reachable).
- Per-round shop refresh and Scout/RivalUpdate remain deferred to M6/M7 as planned.
- `RunManager.PrepareSandboxRun()` / `DataRepository.CreateSandboxRun()` still unreferenced; defer to cleanup slice.

**Next slice:** M6.1 - Add Scout panel and full 10-round encounter list (all encounters + hero effects wired).

## 2026-05-14 - M5.2: Victory Bonus loss-debt, post-combat hero-stat revert, payroll line items in RewardSummaryView

**Milestone:** M5 - Payroll Actions
**Status:** Partial

**Files added:**
- `TestPlans/TP_M5.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - added `LatestPayrollSummary` and `LatestVictoryBonusLossDebt` for the reward summary.
- `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs` - added `ApplyPostCombat` (Victory Bonus loss-debt + per-action summary text) and `RevertPerCombatHeroStats` (reset Attack/UpkeepThisRound to definition base).
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - added serialized `PayrollManager` field + `Initialize(PayrollManager)`; `ApplyPostCombatResult` now calls `ApplyPostCombat` before upkeep and `RevertPerCombatHeroStats` at end.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - wired payroll manager into run manager in `EnsureManagers`; `ContinueAfterReward` clears `SelectedPayrollAction` after reward summary dismissed.
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs` - replaced hardcoded "Payroll effect: None" with conditional `LatestPayrollSummary` block.
- `DungeonDebt/Assets/Scripts/UI/PayrollPanelView.cs` - `Refresh(RunState)` signature; disables Victory Bonus card when `Gold < VictoryBonusGoldCost`.
- `DungeonDebt/Assets/Scripts/UI/PayrollCardView.cs` - added 1-line `SetInteractable(bool)` hook (Q2(a) scope add).
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - updated `PayrollPanelView.Refresh` callsites to pass `RunState`.

**Acceptance criteria:**
- [x] AC1 - Victory Bonus loss-debt applied before interest math (Scenario C).
- [x] AC2 - Per-hero `Attack`/`UpkeepThisRound` reverted after every combat (Scenarios B.3, C.4, F.2 — observed via downstream UI; DIAG probes were not added during testing but downstream effects confirm).
- [x] AC3 - Reward summary shows payroll line items per non-StandardPay action (Scenarios A.3, B.2, C.3, D.3, E.1).
- [x] AC4 - `SelectedPayrollAction` survives through reward summary, clears in `ContinueAfterReward` (Rule check R.4).
- [ ] AC5 - "Existing Shop → Formation → Payroll → Combat → Reward → next-round flow continues to work end-to-end" — **single-round flow works**; multi-round flow is broken by R002 (round-advance bypasses Shop/Formation/Payroll). Pre-existing bug from M2.3 surfaced by M5.2 testing.

**Test plan:** `TestPlans/TP_M5.2.md` - Scenarios A.1-A.4, B, C, D, E, F all pass. A.5 blocked by R002 (Payroll panel never re-appears for Round 2). All Rule checks, Regression checks, and Observable invariants pass. DIAG.1/DIAG.2 `Debug.Log` probes were not added to `PayrollManager` during testing, so the cross-round revert was confirmed via downstream UI effects rather than direct log readout.

**Deviations from plan:**
- Touched `PayrollCardView.cs` (1-line `SetInteractable(bool)` hook) to support Q2(a) Victory Bonus card disable. Brief listed this file as not-to-modify; the change is the minimal hook required and was confirmed as part of the Q2(a) scope decision at plan time.

**Follow-up flagged:**
- **R002 filed:** round-advance loop bypasses Shop/Formation/Payroll. Blocks AC5 multi-round verification and must be addressed before M6.
- `RunManager.PrepareSandboxRun()` / `DataRepository.CreateSandboxRun()` still unreferenced; defer to a cleanup slice.
- `MainMenuPanel.RunSandboxCombat` still drives post-combat math from the UI panel; should migrate into the run flow once M6 encounter selection lands.
- Per-round shop refresh still deferred to M6.
- Future test plans should give the tester an explicit "did you add the diagnostic scaffold?" gating step before scenarios that depend on it, or fall back to UI-observable signals only.

**Next slice:** R002 - Route round-advance through Shop → Formation → Payroll → Combat instead of directly to Combat.

## 2026-05-14 - M5.1: Payroll action data + payroll panel shell

**Milestone:** M5 - Payroll Actions
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Run/PayrollManager.cs`
- `DungeonDebt/Assets/Scripts/UI/PayrollPanelView.cs`
- `DungeonDebt/Assets/Scripts/UI/PayrollCardView.cs`
- `TestPlans/TP_M5.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - added `PayrollManager` field/property and `EnsureManagers` wiring; `ContinueFromFormation` now routes to `Payroll`; added `SelectPayrollAction(PayrollActionId?)` and `ContinueFromPayroll()` (applies the selected action, then `ChangeState(Combat)`).
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - added 4 `PayrollActionDefinition` static fields and `AllPayrollActions` read-only list; descriptions interpolate from `GameRules` constants only.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - built `PayrollPanelView` in the same screen region as Shop/Formation; wired `SetActions` / select / continue handlers; added a `Payroll` branch in `HandleStateChanged` that clears `SelectedPayrollAction` on entry; hidden the panel on every other state and in `RunSandboxCombat` / `ResetUi`.
- `SESSION_PROTOCOL.md` - added Step 6 guidance on temporary diagnostic scaffolds (Debug.Log when Inspector Debug mode can't observe plain-C# state) and the requirement to revert them before slice completion.

**Acceptance criteria:**
- [x] `ContinueFromFormation` -> `Payroll`; `ContinueFromPayroll` -> `Combat`.
- [x] `DataRepository.AllPayrollActions` exposes the 4 actions with id/name/description and `GameRules`-driven tunables.
- [x] Card click selects / re-click cancels; Continue enable mirrors selection; `RunState.SelectedPayrollAction` updates per click.
- [x] `PayrollManager.Apply` implements Loan / Cut Wages / Victory Bonus / Skip Payroll pre-combat effects with per-hero clamping.
- [x] M1-M4 flow preserved end to end.

**Test plan:** `TestPlans/TP_M5.1.md` - all 38 steps reported pass. Step 7 (Inspector Debug snapshot) was unverifiable because plain C# fields like `RunState` are not Unity-serializable; switched to a temporary `Debug.Log` pair inside `PayrollManager.Apply` (removed before slice completion). Step 14 (Victory Bonus gold-clamp at `Gold < VictoryBonusGoldCost`) was exercised at the boundary (`Gold == cost`) but not strictly below it; the clamp code path is correct but not directly verified for sub-cost amounts.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- M5.2: implement Victory Bonus loss-debt (`+VictoryBonusDebtOnLoss` on combat loss) and revert per-combat `Attack` / `UpkeepThisRound` deltas after combat so payroll effects don't accumulate across rounds. Surface payroll line items in `RewardSummaryView` (M5 acceptance criterion).
- UX gap noted during M5.1 testing: Victory Bonus is selectable even when `Gold < VictoryBonusGoldCost`; consider disabling the card (or showing a cost-not-met label) once the cost is a runtime check, not just a clamp. Owner decision.
- Test plan gap: Step 14 did not actually exercise `Gold < cost`. Add an explicit "Gold == cost − 1" scenario to M5.2's test plan.
- `Inspector Debug mode + plain-C# state` lesson written into `SESSION_PROTOCOL.md` step 6 so future slices either tag fields `[SerializeField]` / `[Serializable]` up front or plan a Debug.Log scaffold from the start.
- `RunManager.PrepareSandboxRun()` and `DataRepository.CreateSandboxRun()` remain unreferenced (carried over from M3.2 / M4.1).

**Next slice:** M5.2 - Victory Bonus loss-debt, post-combat attack/upkeep revert, and payroll line items in RewardSummaryView.

## 2026-05-14 - M4.1: Formation editing UI (click-to-swap reorder, frontline targeting)

**Milestone:** M4 - Formation
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/FormationPanelView.cs`
- `DungeonDebt/Assets/Scripts/UI/FormationSlotView.cs`
- `TestPlans/TP_M4.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - `ContinueFromShop` now transitions to Formation; added `ContinueFromFormation` -> Combat.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - added `SwapPartySlots(int, int)` that swaps each hero's `FormationSlot` and re-sorts `Party` by slot.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - built/wired FormationPanelView in `BuildUi`; added Formation branch to `HandleStateChanged`; hidden it on all other states.

**Acceptance criteria:**
- [x] Shop -> Formation routing via `ContinueFromShop`; Formation -> Combat via `ContinueFromFormation`.
- [x] FormationPanelView renders 5 slots in trapezoid (2 frontline over 3 backline); section labels driven by `GameRules.FrontlineSlots`/`BacklineSlots`.
- [x] Click-to-swap: highlight on first occupied click; second click swaps (including occupied<->empty); same-slot click cancels; empty-first click is a no-op.
- [x] Continue from Formation routes to Combat with the chosen ordering; CombatManager targeting already frontline-first leftmost (no change needed).
- [x] No payroll/scout/rival/save/new effect logic; M1-M3 flow intact.

**Test plan:** `TestPlans/TP_M4.1.md` - all 35 steps pass.

**Deviations from plan:**
- None. `CombatManager.cs` was listed in the brief as "verify and adjust if needed" - verified, no adjustment required.

**Follow-up flagged:**
- `RunManager.PrepareSandboxRun()` and `DataRepository.CreateSandboxRun()` still unreferenced (carried over from M3.2). Defer to a dedicated cleanup slice.
- M6 per-round shop refresh still deferred.
- Possible M4.2 polish slice (drag-and-drop, richer slot art) if desired before M5.

**Next slice:** M5.1 - Payroll action data + payroll panel shell.

## 2026-05-14 - R001: Combat log scroll fix

**Milestone:** Regression fix (not tied to a milestone slice)
**Status:** Complete

**Files added:**
- `TestPlans/TP_R001.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/CombatLogView.cs` - accept a ScrollRect reference; rebuild layout and snap to bottom after each appended line and on Clear.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - rebuilt the combat-log panel as ScrollRect -> Viewport (RectMask2D) -> Content (VerticalLayoutGroup + ContentSizeFitter) with the log Text in Overflow vertical wrap mode, plus a permanent vertical Scrollbar.

**Acceptance criteria:**
- [x] All combat log lines remain reachable in long combats.
- [x] View auto-scrolls to the latest line during streaming.
- [x] User can scroll up via mouse wheel and via visible scrollbar.
- [x] No changes outside the two UI files; no combat/run-state/encounter logic touched.

**Test plan:** `TestPlans/TP_R001.md` - all 26 steps pass.

**Deviations from plan:**
- Added a `VerticalLayoutGroup` on the Content rect so `ContentSizeFitter` could compute height from the Text's preferred size. Not explicitly in the plan but required for the ScrollRect math to be correct.

**Follow-up flagged:**
- R001 moved to the **Closed** section of `REGRESSIONS.md`.

**Next slice:** M4.1 - Formation editing UI (click-to-swap reorder; frontline targeting wired into combat).

## 2026-05-14 - M3.2: ShopManager and shop UI (offer generation, hire, fire, reroll)

**Milestone:** M3 - Shop and Party
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Run/ShopManager.cs`
- `DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs`
- `DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs`
- `DungeonDebt/Assets/Scripts/UI/HeroCardView.cs`
- `TestPlans/TP_M3.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - wired `ShopManager`; `StartRun()` chains to Shop; entering `Shop` calls `GenerateOffers()`; added `ContinueFromShop()`.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - built/wired shop panel into `BuildUi`; hooked Hire/Fire/Reroll/Continue handlers; removed `PrepareSandboxRun` call from combat path; state-driven show/hide of the shop panel.

**Acceptance criteria:**
- [x] 3 distinct offers from `AllHeroes` via `RunManager.Random` (`System.Random`); no `UnityEngine.Random`.
- [x] Hire deducts `BaseUpkeep + HireCostBonus`, caps at `MaxPartySize`, disables Hire when unaffordable or full.
- [x] Fire removes hero and refunds `FireRefund` (1 gold).
- [x] Reroll costs `RerollCost` (2 gold), disabled when underfunded. Mid-slice design clarification: Reroll refreshes **all 3** slots (the offer pool excludes heroes already in party), not just unpurchased slots — required to reach the 5/5 cap in a single shop visit.
- [x] Continue from Shop → Combat with player-built party; M1/M2 reward/upkeep/interest/end-screen flow preserved.
- [x] No payroll/formation/scout/rival UI, no new combat or encounter content.

**Test plan:** `TestPlans/TP_M3.2.md` - all steps pass; one step partial (Step 9: no offer cost > 10 in this run, so the cost-disable case was verified incidentally during hiring; Step 17: re-enable-after-Fire visual check not directly observed).

**Deviations from plan:**
- `RunManager.cs` was listed in the plan's "Files to modify" but ended up untouched; `MainMenuPanel` already accessed `CurrentRunState` via `GameManager`, and `RunManager.Random` was already public.
- Reroll semantics evolved from "refresh only unpurchased slots" (literal brief reading) to "refresh all 3 slots, excluding party-member heroes from the pool" (Option A, user-confirmed). Required to make the 5-hero cap reachable in a single shop visit.

**Follow-up flagged:**
- New regression filed: R001 - combat log truncates in long combats (M1.3 `CombatLogView` issue, surfaced by larger parties). Out of scope for M3.2.
- `RunManager.PrepareSandboxRun()` and `DataRepository.CreateSandboxRun()` are now unreferenced; defer deletion to a later cleanup slice (per Option A confirmed during planning).
- Per-round shop refresh deferred to M6 (confirmed scope).

**Next slice:** M4.1 - Formation editing UI (click-to-swap reorder of 5 slots; frontline targeting wired into combat).

## 2026-05-14 - M3.1: DataRepository expansion to the full 12 heroes

**Milestone:** M3 - Shop and Party
**Status:** Complete

**Files added:**
- `TestPlans/TP_M3.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` - added Knight, Golem, Ninja, Bard, Enchanter, Treasurer, Apprentice definitions; reordered `HeroDefinitions` list to §7 plan order.

**Acceptance criteria:**
- [x] `DataRepository.AllHeroes` returns all 12 heroes from `IMPLEMENTATION_PLAN.md` §7 in plan order as an immutable read-only list.
- [x] Each new `HeroDefinition` uses the exact §7 stats/role/upkeep/description/`HeroEffectId`.
- [x] No new `HeroEffectId` values were required (all 11 IDs already existed from M1.1); `HeroEffects.cs` unchanged.
- [x] M1.3/M2.x sandbox flow preserved: `CreateSandboxRun()` references named static fields, not list indices.
- [x] No shop UI, hire/fire/reroll, payroll, formation, scout, rival, save/load, encounter, run-economy, or combat-rule changes.

**Test plan:** `TestPlans/TP_M3.1.md` - all steps passed (happy path, field-by-field for all 12 heroes, edge cases, rule checks, regression checks, observable invariants).

**Deviations from plan:**
- Adopted strict §7 plan order for `HeroDefinitions` with explicit user confirmation. This dropped the "existing 5 heroes appear in the same order they did before" invariant from the brief. Sandbox identity is preserved via named-field references in `CreateSandboxRun()`, so list ordering does not affect M1/M2.

**Follow-up flagged:**
- None.

**Next slice:** M3.2 - ShopManager + shop UI (3 offers from `AllHeroes`, hire/fire/reroll wired to gold).

## 2026-05-13 - M2.3: Round advance, run loss checks, and end-screen shell

**Milestone:** M2 - Run State and Resources
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/EndScreenView.cs`
- `TestPlans/TP_M2.3.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added `FinalRound` constant.
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs` - added `ContinueAfterReward` helper that routes outcome through `RunManager` into `ChangeState`.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - added `EvaluateNextState` and `AdvanceRound`.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - added `LatestEndReason`.
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs` - added Continue button + `SetOnContinue` hook.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - state-driven sandbox combat re-entry, Continue/New Run wiring, end-screen panel.

**Acceptance criteria:**
- [x] Continue/Next Round routes through `RunManager` and `GameManager.ChangeState`.
- [x] M2 outcomes evaluated: morale, debt limit, round-10 win.
- [x] Round advances and combat flow re-runs when no end condition is met.
- [x] `EndScreenView` shows victory/defeat with reason, final stats, and uGUI New Run button.
- [x] M2.2 reward summary behavior intact; combat resolver remains scene-independent.

**Test plan:** `TestPlans/TP_M2.3.md` - all scenarios passed (happy path, victory, defeat by morale, defeat by debt, rule checks, regression checks, observable invariants). User confirmed the temporary `GameRules` edit instructions were clear.

**Deviations from plan:**
- Used the existing `GameState` enum for outcome evaluation instead of introducing a new `RunOutcome` enum/file. Avoids adding a file not listed in the brief and keeps state vocabulary unified.

**Follow-up flagged:**
- Reward summary panel height bumped from 430 to 460 to fit Continue button; revisit if layout drifts.
- End-screen overlay centered at 640x460; revisit positioning/sizing in a polish pass if it clashes with header/buttons.
- `HandleStateChanged` only reacts to `StartRun`/`Combat`/`Victory`/`Defeat`. Future slices that need Reward/Upkeep panel reactions will extend it.

**Next slice:** M3.1 - DataRepository expansion to the full 12 heroes.

## 2026-05-14 - M2.2: Post-combat resource math and reward summary shell

**Milestone:** M2 - Run State and Resources
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs`
- `DungeonDebt/Assets/Scripts/UI/RewardSummaryView.cs.meta`
- `TestPlans/TP_M2.2.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs` - added the interest divisor constant.
- `DungeonDebt/Assets/Scripts/Data/RunState.cs` - stored latest reward/upkeep summary values.
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs` - prepared the sandbox party on the current run and applied reward, upkeep, shortfall, interest, and morale math.
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - displayed the reward summary after combat streaming and refreshed the header with final resources.

**Acceptance criteria:**
- [x] After sandbox combat finishes, `RunManager` applies post-combat resource math to the current `RunState`: reward gold, party upkeep, shortfall converted to debt, interest, and morale loss on defeat.
- [x] `RewardSummaryView` displays the result of that math clearly enough to verify gold gained, upkeep paid/shortfall, interest paid or added to debt, morale change, and final gold/debt/morale.
- [x] `RunHeaderView` refreshes after post-combat math and matches the final values shown in `RewardSummaryView`.
- [x] Numeric rules come from `GameRules` and existing `HeroInstance.UpkeepThisRound`; no new magic numbers are introduced in logic files.
- [x] Existing M1.3/M2.1 start and restart sandbox flow remains usable, deterministic, and scene-independent at the combat resolver level.

**Test plan:** `TestPlans/TP_M2.2.md` - core happy path, fresh-run, rule, regression, and observable checks passed; temporary setup math/edge scenarios were skipped because the plan did not give clear setup instructions.

**Deviations from plan:**
- `GameRules.cs` was added to scope with explicit user confirmation so the interest divisor would not be hardcoded in run logic.

**Follow-up flagged:**
- Future test plans should include exact temporary setup instructions when asking the tester to force losses, debt, or high-upkeep scenarios.

**Next slice:** M2.3 - Round advance, run loss checks, and end-screen shell

## 2026-05-14 - M2.1: Run state bootstrap and header shell

**Milestone:** M2 - Run State and Resources
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Core/GameState.cs`
- `DungeonDebt/Assets/Scripts/Core/GameManager.cs`
- `DungeonDebt/Assets/Scripts/Run/RunManager.cs`
- `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs`
- `TestPlans/TP_M2.1.md`

**Files modified:**
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` - routed Start/Restart through run bootstrap, displayed the run header, and adjusted vertical spacing after manual testing.

**Acceptance criteria:**
- [x] `Main.unity` still opens as one scene with the existing Canvas/EventSystem and a start button.
- [x] Clicking the start button initializes a fresh `RunState` through `RunManager.InitializeRun()` with `Round = 1`, `Gold = GameRules.StartingGold`, `Debt = GameRules.StartingDebt`, and `Morale = GameRules.StartingMorale`.
- [x] `GameManager` owns the current `GameState`, exposes `ChangeState(GameState)`, and state changes go through that method.
- [x] `RunHeaderView` displays the current round, gold, debt, and morale from the initialized `RunState`.
- [x] The M1.3 sandbox combat path remains usable, with no reward/upkeep/interest/loss-condition math added.

**Test plan:** `TestPlans/TP_M2.1.md` - user ran the plan; one spacing observation on step 22 was fixed in `MainMenuPanel.cs`, then confirmed looking good.

**Deviations from plan:**
- None.

**Follow-up flagged:**
- None.

**Next slice:** M2.2 - Post-combat resource math and reward summary shell

## 2026-05-14 - M1.3: Combat sandbox UI wiring

**Milestone:** M1 - Combat Sandbox
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs`
- `DungeonDebt/Assets/Scripts/UI/CombatLogView.cs`
- `TestPlans/TP_M1.3.md`

**Files modified:**
- `DungeonDebt/Assets/Scenes/Main.unity` - attached the sandbox UI controller to the existing Canvas.
- `PROGRESS.md` - added the missing M1.2 entry at the user's request before logging this slice.

**Acceptance criteria:**
- [x] `Main.unity` opens with a minimal combat sandbox UI on the existing Canvas.
- [x] Start Combat runs `DataRepository.CreateSandboxRun()`, `DataRepository.SandboxEncounter`, and `CombatManager.StartCombat(...)`.
- [x] `CombatLogView` streams already-resolved `CombatResult.LogLines` with a readable delay; combat simulation remains synchronous.
- [x] Final UI state shows win/loss and enables Restart; Restart clears the old log and reproduces identical combat text.
- [x] No out-of-scope systems were introduced.

**Test plan:** `TestPlans/TP_M1.3.md` - user reported the UI, restart, state, edge, rule, and observable checks passed after the text-rendering fix; source-inspection regression steps 20-21 were skipped as unclear, and step 24 was marked "appears to pass" because identical Slime names make unit identity hard to distinguish.

**Deviations from plan:**
- Generated UI labels use legacy uGUI `Text` instead of TextMeshPro because the fresh project did not have usable TMP font assets/imported TMP Essentials, causing invisible text and TMP font warnings. This keeps the slice uGUI-only and testable without adding imported assets or forbidden folders.

**Follow-up flagged:**
- Revisit TextMeshPro setup in a later UI polish/setup slice if TMP Essentials or a committed font asset is intentionally added.
- Future test plans should make source-inspection regression checks more concrete for non-code reviewers.

**Next slice:** M2.1 - Run state bootstrap and header shell

## 2026-05-14 - M1.2: Combat repository and resolver scaffold

**Milestone:** M1 - Combat Sandbox
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Core/GameRules.cs`
- `DungeonDebt/Assets/Scripts/Core/DataRepository.cs`
- `DungeonDebt/Assets/Scripts/Combat/CombatManager.cs`
- `DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs`
- `DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs`
- `TestPlans/TP_M1.2.md`

**Files modified:**
- `NEXT_SESSION.md` - rewrote the next-session brief for M1.3 combat sandbox UI wiring.

**Acceptance criteria:**
- [x] `GameRules.cs` contains M1 numeric constants, including `CombatTurnLimit`.
- [x] `DataRepository.cs` exposes sandbox-only static data: 4-5 heroes, 2-3 enemies, one sandbox encounter, and `CreateSandboxRun()`.
- [x] `CombatManager.StartCombat(...)` synchronously resolves deterministic combat into a `CombatResult`.
- [x] `CombatLogger.cs` records ordered attack, death, turn-limit, and final-result log lines.
- [x] `HeroEffects.cs` exists as a static no-op hook surface without non-M1 effect implementation.
- [x] No UI, shop, payroll, formation editing, economy flow, forbidden folders, or automated test assets were introduced.

**Test plan:** `TestPlans/TP_M1.2.md` - source, compile, scene, and rule checks passed; temporary probe-script combat checks were skipped or unclear because the test plan did not include exact probe creation/run instructions.

**Deviations from plan:**
- Probe-script validation steps were not completed by the tester due to unclear instructions. M1.3 is expected to make the same resolver testable through scene UI.

**Follow-up flagged:**
- Future test plans should include exact scratch/probe script bodies and placement if probe scripts are required.

**Next slice:** M1.3 - Combat sandbox UI wiring

## 2026-05-14 - M1.1: Combat data model

**Milestone:** M1 - Combat Sandbox
**Status:** Complete

**Files added:**
- `DungeonDebt/Assets/Scripts/Data/GameEnums.cs`
- `DungeonDebt/Assets/Scripts/Data/HeroDefinition.cs`
- `DungeonDebt/Assets/Scripts/Data/HeroInstance.cs`
- `DungeonDebt/Assets/Scripts/Data/EnemyDefinition.cs`
- `DungeonDebt/Assets/Scripts/Data/EncounterDefinition.cs`
- `DungeonDebt/Assets/Scripts/Data/RivalGuildState.cs`
- `DungeonDebt/Assets/Scripts/Data/RunState.cs`
- `DungeonDebt/Assets/Scripts/Data/CombatUnit.cs`
- `DungeonDebt/Assets/Scripts/Data/CombatResult.cs`
- `DungeonDebt/Assets/Scripts/Data/PayrollActionDefinition.cs`
- `DungeonDebt/Assets/Scripts/Data/ShopOffer.cs`
- `TestPlans/TP_M1.1.md`

**Files modified:**
- None.

**Acceptance criteria:**
- [x] Data model files exist under `DungeonDebt/Assets/Scripts/Data/`.
- [x] New types are plain C# classes or enums only; none inherit from `MonoBehaviour`, `ScriptableObject`, or Unity component types.
- [x] Definition classes expose get-only data initialized through constructors.
- [x] Runtime classes expose mutable state and initialized collections where required by the plan.
- [x] Unity compiles with zero errors and zero new warnings.
- [x] No UI, manager, combat logic, repository data, prefabs, scene edits, forbidden folders, or automated test assets were created.
- [x] `TestPlans/TP_M1.1.md` exists.

**Test plan:** `TestPlans/TP_M1.1.md` - user reported all applicable checks passed; scratch-context-only checks were skipped because the instruction was unclear.

**Deviations from plan:**
- Scratch-context manual checks were skipped by the tester; equivalent source/compile confidence was covered by Unity compilation and source inspection.

**Follow-up flagged:**
- Make future manual test plans avoid the ambiguous phrase "temporary scratch context" or define it inline.

**Next slice:** M1.2 - Combat repository and resolver scaffold

## 2026-05-14 - M1.0: Project skeleton

**Milestone:** M1 - Combat Sandbox
**Status:** Complete

**Files added:**
- `.gitignore`
- `DungeonDebt/` Unity project skeleton
- `DungeonDebt/Assets/Scenes/Main.unity`
- `DungeonDebt/Assets/Scripts/Core/.gitkeep`
- `DungeonDebt/Assets/Scripts/Data/.gitkeep`
- `DungeonDebt/Assets/Scripts/Run/.gitkeep`
- `DungeonDebt/Assets/Scripts/Combat/.gitkeep`
- `DungeonDebt/Assets/Scripts/UI/.gitkeep`
- `DungeonDebt/Assets/Prefabs/.gitkeep`
- `DungeonDebt/Assets/Art/.gitkeep`
- `TestPlans/.gitkeep`
- `TestPlans/TP_M0.1.md`

**Files modified:**
- None.

**Acceptance criteria:**
- [x] Unity project skeleton exists with the required folder structure.
- [x] `Assets/Scenes/Main.unity` exists and opens with the expected base scene.
- [x] Root workflow docs and root-level `TestPlans/` folder exist.
- [x] Forbidden folders (`Resources/`, `StreamingAssets/`, `Tests/`, `Editor/`) were not created.
- [x] Unity import and Console were verified clean by the user before M1.1 began.

**Test plan:** `TestPlans/TP_M0.1.md` - completed manually before M1.1; user confirmed the skeleton was verified and Unity was clean.

**Deviations from plan:**
- Slice is logged as M1.0 here, while the test plan filename uses the earlier `M0.1` label.

**Follow-up flagged:**
- None.

**Next slice:** M1.1 - Combat data model
