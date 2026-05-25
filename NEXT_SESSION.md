# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: R005-3 — Death fade-out animation

**Slice ID:** R005-3 (combat animation polish — third of five planned R005 follow-ups)
**Type:** Regression follow-on (R005 in `REGRESSIONS.md`)
**Severity:** 🟡 Minor

### One-sentence goal

When a combat unit reaches 0 HP, its `.combat-unit` card runs a one-shot ~400ms fade-out (opacity 1 → 0.35) combined with a slight `scale(0.92)` and a small downward drift, replacing the current "snap to `opacity: 0.35` the instant `hp <= 0`" so deaths read as deaths instead of dimming.

### Why this slice exists

R005-1 added portraits + projectiles. R005-2 added a melee lunge on attack. The third missing beat from the R005 regression is a *death* moment. Today the card just changes `opacity` from `1` to `0.35` the instant `_paintUnit` re-renders with `hp <= 0`, which reads as "the card got a little dimmer," not "this hero died." A short keyframe gives the death event the same kind of tactile read the attack/hit/heal beats already have.

The slice stays intentionally tiny: one keyframe, one extra class (`.dying`), one transition rule for the `.dead` resting state, and a single new conditional in `CombatPanel._applyEvent` that fires when the target crosses from alive → dead.

### Open questions to resolve (small — answer inline)

1. **Duration.** ~400ms feels long enough to read as a death without stalling the replay. `STEP_MS` is 280ms so the fade will overlap the next event (which is fine — by then the unit is already at its `.dead` resting state). Confirm 400ms, or pick a tighter timing.
2. **Resting opacity.** Today `.dead` is `opacity: 0.35`. Confirm or adjust (lower = more "gone", higher = more visible silhouette).
3. **Scale + drift?** Recommend `scale(0.92) translateY(4px)` at end of keyframe for "the card slumps slightly," but pure opacity fade also reads. Confirm or drop the transform.
4. **Re-render guard.** `_paintUnit` is called on every target event and `clear`s + rebuilds the unit's inner children. The `.dying` class lives on the *unit node itself*, so it survives `clear` — but we need to make sure the `dead`/`dying` class toggle only fires *once*, not on every subsequent attack against an already-dead unit (chain attacks or status ticks). Plan to set `node.dataset.died = "1"` as a one-shot guard. Confirm or suggest a different guard.

### Scope

**In scope (this session):**

1. Add `@keyframes death-fade` to `web/styles/main.css` (opacity 1 → 0.35 with optional `transform: scale + translateY`).
2. Add `.combat-unit.dying { animation: death-fade 400ms ease-out forwards; }` and keep `.combat-unit.dead { opacity: 0.35; }` as the resting state.
3. In `CombatPanel._applyEvent`, after the existing `_paintUnit(target, …)` call, detect alive→dead transition for the target unit (`evt.targetHealthAfter <= 0` and `target.node.dataset.died !== "1"`); set `dataset.died = "1"`, add `dying` class, schedule a `setTimeout` (~440ms) to swap `dying` → `dead`.

**Not in scope:**

- Per-role / per-character death sprites (deferred to R005-4 / R005-5).
- Touching combat math, replay event shape, or any file under `web/src/core/`, `web/src/data/`, `web/src/run/`, `web/src/combat/`.
- Reviving heroes between rounds — that's already done by `CombatManager._finishResult` and works fine. We only need to make sure the next `render()` call clears `dataset.died` (`_buildRow` builds fresh nodes, so this is automatic).
- Tween libraries (CSS keyframes only).
- Sound.

### Definition of ready

- ID: R005-3 ✅
- One-sentence goal: above ✅
- Files to modify: listed below ✅
- Acceptance criteria: 4 below ✅
- No open 🔴 Blocker regressions ✅ (R005 still Open + In progress, dropped to Minor)

### Files Claude Code should read

```
CLAUDE.md (§Architectural rules, §UI architecture, §Scope control, §Coding conventions)
SESSION_PROTOCOL.md
REGRESSIONS.md (R005 entry — note R005-1 + R005-2 already landed)
PROGRESS.md (R005-2 + R005-1 entries — context for the lunge / projectile / portrait pipeline)
web/src/ui/panels/CombatPanel.js  (_applyEvent — the seam; _paintUnit's classList.toggle("dead", hp <= 0); _buildRow builds the units fresh per render)
web/styles/main.css                (.combat-unit.dead at line 178; lunge / flash-hit / flash-heal keyframes for co-location)
```

### Files Claude Code should modify

- **Modify:** `web/styles/main.css` — add `@keyframes death-fade` and `.combat-unit.dying` rule. Co-locate near the lunge / flash-hit / flash-heal block (bottom of file). Leave `.combat-unit.dead` as-is (resting state).
- **Modify:** `web/src/ui/panels/CombatPanel.js` → in `_applyEvent`, after `_paintUnit` (which already toggles `.dead` via `classList.toggle`), detect alive→dead transition on the target and run the one-shot animation. Also: in `_paintUnit`, change `node.classList.toggle("dead", hp <= 0)` to *not* preemptively add `.dead` on the death-tick — let the timeout add it after the animation completes. Initial render (hp <= 0 at combat start, e.g. ghost encounters) should still apply `.dead` immediately.

### Files Claude Code does NOT touch

- `web/src/ui/SpriteCatalog.js` — no change needed.
- Anything under `web/src/core/`, `web/src/data/`, `web/src/run/`, `web/src/combat/`.
- `package.json`, `electron/`, `serve.py`.
- `PROGRESS.md`, `REGRESSIONS.md` — wrap-step only.

### Acceptance criteria

1. When a unit dies during combat replay, its card runs a ~400ms fade animation (opacity → 0.35, optionally with a small scale/translate). Replay timing (`STEP_MS = 280`) is unchanged.
2. The animation fires **once** per death — chain attacks, status ticks, or `_paintUnit` re-renders on an already-dead unit do not restart the animation.
3. Units that start a combat at 0 HP (edge case — shouldn't happen in normal play, but plausible for status-only encounters) are rendered in their `.dead` resting state with no animation, not mid-fade.
4. `npm run test:headless` 57/57 (logic files untouched).
5. Zero console errors / warnings during a full Scout → Combat round where multiple deaths occur.

### Start prompt for the next session

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is `R005-3` — death fade-out animation on the acting combat-unit card when HP crosses to 0, per the brief in `NEXT_SESSION.md`. Builds on R005-2's class-toggle + setTimeout pattern in `_applyEvent`. Pause for plan confirmation after Step 3 before implementing.

---

## Suggested follow-up (not this session)

After R005-3 lands:

- **R005-4:** per-role projectile choreography (different flight arcs / mid-flight flashes per attacker role — magic curves, arrows snap, melee is short and fast).
- **R005-5:** per-character attack sprites. Pure asset-drop slice: add `web/assets/effects/<id>.png` for one or more heroes, register the id in `SpriteCatalog.KNOWN_ATTACK_OVERRIDE_IDS`. No code path changes required.

Each is its own slice. Don't bundle.

### Optional touch-up (if any time left after R005-3 — flag with user, do not bundle)

- One-line addition to `_shouldLunge` if the user wants `cave_bat` and/or `FrugalGhostHeal`-effect enemies exempt from the melee lunge (see R005-2 follow-up flag in `PROGRESS.md`).
