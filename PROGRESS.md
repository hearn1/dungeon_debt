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
