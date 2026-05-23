# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: R004 — Restore visible frontline / backline split on Formation panel

**Slice ID:** R004
**Type:** Regression fix (UI / CSS)
**Severity:** 🟡 Minor (from `REGRESSIONS.md` Open section)

### One-sentence goal

Make slots 0–1 (frontline) visibly separate from slots 2–4 (backline) on the Formation panel, with clear zone labels and a real gap, so the player can tell at a glance which heroes will take hits first.

### Why this slice exists

The web-port Phase D shipped Formation with both rows wrapped in a single flexbox (`.formation`), which on the current viewport collapses into a single flat row of five cards under two adjacent zone labels. That obscures the central tactical decision (frontline vs backline targeting). The Unity build had a clear two-row layout with the frontline above the backline. The data model is unchanged — only presentation.

### Scope

**In scope:**

- `web/src/ui/panels/FormationPanel.js` — adjust layout so the two zones stack vertically (frontline above backline) with a visible gap and persistent zone labels.
- `web/styles/main.css` — add / refine `.formation`, `.formation-zone`, `.slot-row` rules. Slots should remain interactive (click-to-select, click-second-to-swap) and the `.selected` state should still highlight in gold.
- Manual verification in the browser preview.

**Not in scope:**

- Drag-and-drop reordering (formation today is click-swap; don't change that contract).
- Any change to `RunManager.swapPartySlots` or `GameRules.FrontlineSlots` / `BacklineSlots`.
- Animations on swap (R005 follow-up will cover broader animation work).
- Touching any other panel.

### Definition of ready

- ID: R004 ✅
- One-sentence goal: above ✅
- Files: listed below ✅
- Acceptance criteria: 4, below ✅
- No open 🔴 Blocker regressions ✅ (R004 and R005 are the only open items; neither is a blocker)

### Files Claude Code should read

```
CLAUDE.md (§Architectural rules, §UI architecture, §Coding conventions)
SESSION_PROTOCOL.md
REGRESSIONS.md (R004 entry)
IMPLEMENTATION_PLAN.md (§4 Architectural contracts)
web/src/ui/panels/FormationPanel.js
web/styles/main.css (Formation section)
web/src/ui/UIManager.js (for the dirty-refresh contract)
```

### Files Claude Code should modify

```
web/src/ui/panels/FormationPanel.js  — restructure render() so the two zones stack vertically with their own labels and a visible gap
web/styles/main.css                  — restyle .formation / .formation-zone / .slot-row so the split is unmistakable at 1280×720 and at the dev-preview narrow width
```

### Files Claude Code does NOT touch

- Any file under `web/src/core/`, `web/src/data/`, `web/src/run/`, `web/src/combat/` — this is presentation-only.
- Any other panel under `web/src/ui/panels/`.
- `package.json`, `electron/`, `serve.py`.
- `PROGRESS.md`, `REGRESSIONS.md` (those get updated at end of session as part of the wrap step).

### Acceptance criteria

1. On the Formation panel, slots 0–1 render in a row labeled "FRONTLINE", and slots 2–4 render in a row labeled "BACKLINE" *below* the frontline row, with at least 16px of visible vertical gap between the two zones.
2. Empty slots still render as dashed-border placeholders; filled slots still render the hero card.
3. Click-to-select then click-second-slot still swaps heroes (no functional regression — verify by swapping a frontline and backline hero and starting combat).
4. `npm run test:headless` still passes 57/57 (no logic changes expected, but confirm).

### Start prompt for the next session

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md` (R004). Start with step 1 (Orient) and wait for my confirmation before planning.

---

## Suggested follow-up (not this session)

After R004, the obvious next slice is **R005 — animation upgrade**. That's a larger design conversation: portrait sources, art budget, animation style (CSS keyframes vs sprite atlas vs short MP4 loops). Worth a planning session before any code, not a same-session continuation.
