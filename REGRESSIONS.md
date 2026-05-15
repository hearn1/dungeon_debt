# REGRESSIONS.md

Open bugs and regressions found during manual testing of Dungeon Debt. Closed items move to the **Closed** section at the bottom. Claude Code reads the **Open** section at the start of every session (per `SESSION_PROTOCOL.md` step 1) to check for blockers.

This file is updated **only** at the end of a session (when filing new issues or moving closed ones), or at the start of a session if the user explicitly asks Claude Code to pick up a regression as the slice. Do not update it mid-session.

---

## Entry template

Copy this block when filing a new regression. New regressions go at the top of the **Open** section. Increment the ID — R001, R002, R003, etc. IDs never get reused, even after closure.

```markdown
### R<NNN> — <short title>

**Reported:** <YYYY-MM-DD>
**Found in slice:** <slice id where detected> (detected) — <slice id where introduced, if known> (introduced)
**Severity:** 🔴 Blocker  |  🟠 Major  |  🟡 Minor  |  🔵 Polish
**Status:** Open  |  In progress  |  Fixed (pending verify)  |  Closed

**Repro steps:**
1. <step>
2. <step>

**Expected:** <what should happen>
**Actual:** <what happens>

**Suspected cause:** <optional — file or method if known>
**Notes:** <optional>
```

---

## Severity guide

- 🔴 **Blocker** — prevents the next slice from being built or tested, or breaks a core rule from `CLAUDE.md`. Must be fixed before continuing.
- 🟠 **Major** — a listed feature is broken or behaves incorrectly. Schedule into the next session.
- 🟡 **Minor** — wrong number, off-by-one, ugly but functional. Fix when convenient, typically batched at the end of a milestone.
- 🔵 **Polish** — UI cosmetic, log wording, alignment, label color. Batch into a polish pass at the end of a milestone.

---

## Open

<!-- Newest at the top. -->

### R003 - Hiring after formation movement can stack heroes in one slot

**Reported:** 2026-05-15
**Found in slice:** M7.1 (detected) - M4.1/M3.2 (introduced, suspected)
**Severity:** 🟠 Major
**Status:** Open

**Repro steps:**
1. Start a run and buy 2 heroes on day 1.
2. In Formation, place the heroes in `F0` and `B3`.
3. Continue through combat/reward/rival update to day 2.
4. Buy 2 more heroes on day 2, then inspect Formation.

**Expected:** Each hired hero is placed in an empty formation slot, with no duplicate `FormationSlot` values among party members.
**Actual:** Two heroes can occupy `B3` at the same time. The tester noted exact order/placement may be slightly off, but the stacking was on `B3`.

**Suspected cause:** `ShopManager.Hire` creates new `HeroInstance(offer.Hero, run.Party.Count)`. After formation movement, `run.Party.Count` can point to an already occupied slot instead of the first empty slot. `FormationPanelView.Refresh` then lets the later occupant overwrite the earlier one in the displayed slot array.
**Notes:** Schedule as the next session before more M7 ghost-combat work, because duplicated formation slots can affect targeting, combat order, and test reliability.

---

## Closed

<!-- Move closed entries here. Add a Closed date and link to the slice that fixed them. -->

```markdown
### R<NNN> — <short title>  ✅ Closed

**Closed:** <YYYY-MM-DD>
**Fixed in slice:** <slice id>
**Original entry:** <preserve the original body for history>
```

### R002 — Round-advance loop bypasses Shop / Formation / Payroll  ✅ Closed

**Closed:** 2026-05-14
**Fixed in slice:** R002

**Original entry:**

**Reported:** 2026-05-14
**Found in slice:** M5.2 (detected) — M2.3 (introduced)
**Severity:** 🟠 Major
**Status:** Closed

**Repro steps:**
1. Start a Run. Hire any party. Continue → Formation → Payroll.
2. Pick any payroll action. Continue → Combat resolves → Reward Summary shows.
3. Click Continue on the Reward Summary.

**Expected:** Round advances to N+1 and routes back through Shop → Formation → Payroll → Combat per `IMPLEMENTATION_PLAN.md` §11 Milestone 5/6 flow ("Scout → Shop → Payroll → Formation → Combat → Reward → Upkeep → next round").
**Actual:** Round advances and jumps directly to Combat with the prior round's party, formation, and (cleared) payroll selection. Shop/Formation/Payroll panels are never re-entered for rounds 2–10.

**Suspected cause:** `GameManager.ContinueAfterReward` calls `_runManager.EvaluateNextState()`, which returned `GameState.Combat` whenever no end condition was met. Routing wired in M2.3 before Shop/Formation/Payroll states existed.
**Notes:** Fixed by returning `GameState.Shop` from `EvaluateNextState` and calling `AdvanceRound()` in `ContinueAfterReward` when transitioning to Shop. See `TestPlans/TP_R002.md`.

### R001 — Combat log truncates in long combats  ✅ Closed

**Closed:** 2026-05-14
**Fixed in slice:** R001

**Original entry:**

**Reported:** 2026-05-14
**Found in slice:** M3.2 (detected) — M1.3 (introduced)
**Severity:** 🟠 Major
**Status:** Closed

**Repro steps:**
1. Temporarily set `GameRules.StartingGold = 100`.
2. Start Run. Hire a support-heavy party (e.g. Priest, Bard, Enchanter, Treasurer, Apprentice) up to 5/5 via the hire-then-reroll cycle.
3. Continue to Combat.

**Expected:** All combat log lines for the full encounter remain visible (or scroll).
**Actual:** Log text cuts off; later actions are not visible.

**Suspected cause:** `CombatLogView`'s `Text` component uses `VerticalWrapMode.Truncate` on a fixed-height panel with no scrolling. With a larger party producing more lines per round, content past the panel bottom is dropped.
**Notes:** Fixed by wrapping the log in a uGUI `ScrollRect` with auto-scroll-to-bottom and a permanent vertical scrollbar. See `TestPlans/TP_R001.md` (all 26 steps pass).
