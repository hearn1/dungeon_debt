# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: R005 — Animation upgrade, planning + first implementation slice

**Slice ID:** R005 (planning + first implementation slice)
**Type:** Regression fix (combat presentation) — **planning-heavy**
**Severity:** 🟠 Major (from `REGRESSIONS.md` Open section)

### One-sentence goal

Decide on an animation approach (CSS keyframes vs sprite atlases vs short GIF/MP4 loops) and land the first visible piece — hero / enemy attack motion, hit reaction, or death — on top of the new vertical trapezoidal combat board.

### Why this slice exists

The combat replay is currently text-driven with a gold "acting" outline on the attacker card and a 380ms color flash on damage / heal targets. R004 reshaped the combat board into a vertical trapezoid (enemy back / front above player front / back), which is a much better canvas for **directional** source → target motion than the old left/right columns. R005 is the regression that asks us to actually use that canvas.

### Open questions to resolve in this session (before any implementation)

1. **Art budget.** Do we have, or are we OK generating, per-hero / per-enemy portrait PNGs? Or do we stay placeholder-card and animate the existing cards (translate, rotate, flash) without per-unit art?
2. **Animation style.** Three plausible tracks, listed cheapest → richest:
   - **CSS-only.** Card-level keyframes — translate toward target on attack, shake on hit, scale-down + fade on death. No new assets. Probably 1–2 days.
   - **Sprite atlases.** Per-unit PNG sheet (idle / attack / hit / death), `background-position` stepped via CSS animation or `requestAnimationFrame`. Few-week art pass but real game feel.
   - **Short loops (GIF / MP4 / Lottie).** One file per state. Highest fidelity, biggest authoring lift.
3. **Scope of first slice.** Even after picking a track, R005 is too big for one session. The first implementation slice should be **one** of: attacker translate-to-target, hit-shake on damage, death-fade, or projectile fly-across.
4. **Determinism.** Animation timing must not block or alter combat resolution — replay still drives off `CombatReplayEvent`s. The existing `STEP_MS = 280` cadence in [CombatPanel.js](web/src/ui/panels/CombatPanel.js) is a hard ceiling for any per-event animation.
5. **Constraints from `CLAUDE.md` §Scope control.** "Animations are now in-scope (per R005) but stay declarative — CSS keyframes, CSS transforms, sprite atlases as PNGs. No tween libraries (GSAP, anime.js), no Lottie, no WebGL." So Lottie/MP4 are actually already ruled out by the project rules — that narrows the decision to CSS-only vs sprite-atlas vs short GIF.

### Scope

**In scope (this session):**

- A short planning conversation with the user that picks (a) one animation track, and (b) one specific first-slice deliverable.
- If time remains and the choice is CSS-only with no new assets needed, implement the first deliverable. Otherwise stop at planning and rewrite this file again.

**Not in scope:**

- Wholesale rewrite of the combat replay engine.
- Adding a tween / animation library.
- Per-hero / per-enemy bespoke choreography. First slice is one **shared** effect across all units.
- Any change to combat math, hero effects, or run flow.
- Sound / audio.

### Definition of ready

- ID: R005 ✅
- One-sentence goal: above ✅
- Files: TBD this session — depends on the picked track ⚠️
- Acceptance criteria: TBD this session ⚠️
- No open 🔴 Blocker regressions ✅ (only R005 remains open)

### Files Claude Code should read

```
CLAUDE.md (§Scope control, §Architectural rules, §UI architecture)
SESSION_PROTOCOL.md
REGRESSIONS.md (R005 entry)
PROGRESS.md (last 2-3 entries, especially R004)
web/src/ui/panels/CombatPanel.js   (the new 4-row trapezoid layout, STEP_MS replay cadence)
web/styles/main.css                (.combat-board, .combat-row, .combat-unit, flash-hit, flash-heal keyframes)
web/src/data/CombatReplayEvent.js  (event kinds and payload shape)
web/src/combat/CombatLogger.js     (where events are emitted; do not change)
```

### Files Claude Code should modify

To be determined this session, after the animation track is picked.

### Files Claude Code does NOT touch

- Anything under `web/src/core/`, `web/src/data/`, `web/src/run/`, `web/src/combat/` — combat resolution stays deterministic and untouched.
- Any panel outside `CombatPanel.js` (unless the animation lib needs a shared component, which it shouldn't for a first slice).
- `package.json`, `electron/`, `serve.py`.
- `PROGRESS.md`, `REGRESSIONS.md` — wrap-step only.

### Acceptance criteria

To be defined this session.

### Start prompt for the next session

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md` (R005). Step 1 (Orient) then pause for me to pick the animation track before you draft a plan.

---

## Suggested follow-up (not this session)

After R005's first deliverable, subsequent R005-N slices can add: hit-shake, death-fade, projectile motion, role-aware effects, per-unit portraits. Sequence them by user feedback after each visible piece lands.
