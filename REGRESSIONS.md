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

### R001 — Combat log truncates in long combats

**Reported:** 2026-05-14
**Found in slice:** M3.2 (detected) — M1.3 (introduced)
**Severity:** 🟠 Major
**Status:** Open

**Repro steps:**
1. Temporarily set `GameRules.StartingGold = 100`.
2. Start Run. Hire a support-heavy party (e.g. Priest, Bard, Enchanter, Treasurer, Apprentice) up to 5/5 via the hire-then-reroll cycle.
3. Continue to Combat.

**Expected:** All combat log lines for the full encounter remain visible (or scroll).
**Actual:** Log text cuts off; later actions are not visible.

**Suspected cause:** `CombatLogView`'s `Text` component uses `VerticalWrapMode.Truncate` on a fixed-height panel with no scrolling. With a larger party producing more lines per round, content past the panel bottom is dropped.
**Notes:** Out of scope for M3.2; surfaced only because M3 enabled bigger parties. Fix candidates for a polish slice: wrap the log in a `ScrollRect` and auto-scroll to bottom, or trim oldest lines when over a line cap.

---

## Closed

<!-- Move closed entries here. Add a Closed date and link to the slice that fixed them. -->

```markdown
### R<NNN> — <short title>  ✅ Closed

**Closed:** <YYYY-MM-DD>
**Fixed in slice:** <slice id>
**Original entry:** <preserve the original body for history>
```

_None._
