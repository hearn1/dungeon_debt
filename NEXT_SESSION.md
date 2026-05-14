# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M4.1 — Formation editing UI (click-to-swap reorder, frontline targeting)

**Milestone:** M4 — Formation
**Slice goal:** Add a Formation panel between Shop and Combat that lets the player reorder the 5 party slots via click-to-swap (select slot A, click slot B → swap). Default order = order-of-hire from the Shop. Combat targets frontline slots (0–1) before backline slots (2–4); leftmost-slot tiebreak preserved. **No payroll-choice UI, no scout panel, no rival, no new encounters, no new hero/enemy effects.**

### Acceptance criteria

1. Continue from Shop transitions to `GameState.Formation` (not directly to Combat). A new `ContinueFromShop` → Formation and `ContinueFromFormation` → Combat routing exists on `GameManager`.
2. `FormationPanelView` shows the 5 slots in their current order, each occupied slot rendering a `HeroCardView` (or equivalent compact card). Slot indices 0–1 are visibly labeled **Frontline**; slots 2–4 are visibly labeled **Backline**, driven by `GameRules.FrontlineSlots` / `GameRules.BacklineSlots`.
3. Click-to-swap works: click an occupied slot A (it highlights), then click another slot B → the two slots' contents swap (including empties — clicking an empty B moves A to B and leaves A empty). Clicking the same slot twice cancels the selection. After every swap, `HeroInstance.FormationSlot` matches the visible slot index for every party member.
4. Continue from Formation routes to Combat with the chosen ordering. Combat targeting uses slot order: living frontline heroes are targeted before any backline hero is touched; leftmost-slot tiebreak still applies. Verified by observing combat log lines for a deliberately ordered party.
5. No payroll, scout, rival, save/load, or new effect logic. Existing Shop/M2/M1 flow continues to work end-to-end.

### Files Claude Code may create

```
DungeonDebt/Assets/Scripts/UI/FormationPanelView.cs
DungeonDebt/Assets/Scripts/UI/FormationSlotView.cs
TestPlans/TP_M4.1.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Combat/CombatManager.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
```

- `GameManager.cs` — change `ContinueFromShop()` to transition to `Formation`; add `ContinueFromFormation()` → `Combat`.
- `RunManager.cs` — add a `SwapPartySlots(int a, int b)` helper that swaps party-list positions and updates each hero's `FormationSlot` to match its new index.
- `CombatManager.cs` — verify (and adjust if needed) that target selection prefers living heroes with the lowest `FormationSlot` index that satisfies the frontline rule from `IMPLEMENTATION_PLAN.md` §6.
- `MainMenuPanel.cs` — build a `FormationPanelView` in `BuildUi`; in `HandleStateChanged`, show formation on `GameState.Formation` and hide it on other states; wire its Continue button to `_gameManager.ContinueFromFormation()`.

### Files Claude Code does NOT create or modify

- Payroll, scout, rival, save/load, encounter content, hero/enemy effect logic.
- `DataRepository.cs` (no data changes).
- `GameRules.cs` (frontline/backline constants already exist).
- `ShopManager.cs`, `ShopPanelView.cs`, `ShopOfferView.cs`, `HeroCardView.cs` (Shop is finished).
- Any imported sprites, fonts, audio, animation assets, prefab polish.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/`.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 3 — Formation state behavior.
- `IMPLEMENTATION_PLAN.md` Section 5 — `FrontlineSlots` / `BacklineSlots` constants.
- `IMPLEMENTATION_PLAN.md` Section 6 — combat targeting rules (frontline-first, leftmost-slot tiebreak).
- `IMPLEMENTATION_PLAN.md` Section 10 — `FormationPanelView`, `FormationSlotView` panel responsibilities.
- `IMPLEMENTATION_PLAN.md` Section 11 — Milestone 4 acceptance criteria.

### Notes from previous slice

- M3.2 added Shop with Hire/Fire/Reroll/Continue and shipped Option A reroll semantics (Reroll wipes all 3 slots; pool excludes party-member hero ids).
- `RunManager.PrepareSandboxRun()` and `DataRepository.CreateSandboxRun()` are now unreferenced. Either delete in M4.1 *only if it would not touch out-of-scope files* — otherwise leave for a dedicated cleanup slice.
- **Open regression R001** (combat log truncates in long combats) is filed and 🟠 Major but does **not** block M4.1 (the slice does not depend on the combat log being complete). Consider bundling a fix into a polish slice at the end of M4.
- Shop is only entered once per run in current code; per-round shop refresh is M6 scope and is still deferred.
- Existing combat path reads the player party from `_gameManager.CurrentRunState`; `CombatManager.StartCombat(run, encounter)` does not need a signature change for M4.1.

### Test plan output

Claude Code creates `TestPlans/TP_M4.1.md` covering:

- **Happy path:** Start Run → Shop → hire 3–5 heroes → Continue → Formation panel shows them in hire order with Frontline/Backline labels → click-swap two slots → Continue → Combat resolves with the chosen order; combat log shows frontline heroes targeted first.
- **Click-to-swap edge cases:** swap two occupied slots, swap occupied↔empty, cancel selection by re-clicking the same slot, swap into the same slot is a no-op.
- **Frontline targeting check:** deliberately move a high-HP tank to slot 0 and a glass-cannon damage hero to slot 2; verify in the log that the tank is hit before the damage hero. Repeat with a different ordering to confirm targeting follows the formation, not the hire order.
- **Rule checks:** no `UnityEngine.Random`; panels driven by `UIManager`/state, not self-toggled; `GameRules.FrontlineSlots` / `BacklineSlots` used (no magic 2/3 in logic); no out-of-scope additions.
- **Regression checks:** M3.2 shop hire/fire/reroll still works; M2.x reward/upkeep math still correct; M2.3 victory/defeat end screens still reachable.
- **Observable invariants:** `HeroInstance.FormationSlot` always equals the slot index it sits in after any swap; `RunState.Party.Count` unchanged by reordering; no slot index outside `[0, MaxPartySize)` ever appears.

Each test step uses the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action — what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

Every temporary setup step must include exact file/method/value changes to make the scenario testable, then instruct the tester to revert those temporary changes before continuing.

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
