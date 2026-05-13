# PROGRESS.md

Append-only log of completed slices. **Newest entry goes at the top** of the Session log section. Claude Code reads the last 2–3 entries at the start of every session (per `SESSION_PROTOCOL.md` step 1) to orient.

This file is updated **only** at the end of a session, as part of the session summary step. Do not update it mid-session.

---

## Entry template

Copy this block when adding a new entry. Paste it at the top of the Session log section, below the heading. Replace every placeholder.

```markdown
## <YYYY-MM-DD> — <slice id>: <short slice name>

**Milestone:** M<n> — <name>
**Status:** ✅ Complete  |  ⚠️ Partial  |  ❌ Blocked

**Files added:**
- `Assets/Scripts/...`

**Files modified:**
- `Assets/Scripts/...` — <one-line reason>

**Acceptance criteria:**
- [x] <criterion>
- [x] <criterion>

**Test plan:** `TestPlans/TP_<slice-id>.md` — <results, e.g. "8/8 pass" or "6/8 pass, 2 deferred to next slice">

**Deviations from plan:**
- <none, or list>

**Follow-up flagged:**
- <none, or list — regressions filed in REGRESSIONS.md, post-MVP ideas, etc.>

**Next slice:** <slice id and short name — should match what NEXT_SESSION.md was rewritten to>
```

---

## Status legend

- ✅ **Complete** — all acceptance criteria pass, test plan run, no blocking follow-up.
- ⚠️ **Partial** — slice landed but at least one acceptance criterion is unmet or deferred. Note which.
- ❌ **Blocked** — work started but could not complete due to a blocker. Note what's blocking and which regression was filed.

---

## Session log

<!-- Newest entries at the top. No completed entries yet. -->

_No completed slices yet. The first session will be M0.1 — Project skeleton (see `NEXT_SESSION.md`)._
