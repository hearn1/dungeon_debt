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

_None._

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
