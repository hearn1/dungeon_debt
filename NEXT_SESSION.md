# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.6 - Combat card cleanup (thin tier frame + remove redundant name text)

**Milestone:** M10 - Combat view rebuild
**Slice goal:** Make the combat unit card read cleanly now that static portraits exist: fix the pre-existing full-card tier-border so the tier colour shows as a thin frame, and remove the now-redundant unit name text (the portrait identifies the unit).

### Why this slice exists

M10.4 landed static base portraits on combat cards. Two card-readability items surfaced during it, both isolated to `CombatUnitCardView` layout:

1. **Pre-existing bug (from M9/M10.1):** the hero tier-border left/right images are positioned with the `SetAnchored(...)` helper, which makes them **full-card opaque rectangles** in the tier colour instead of thin edges. Hero cards read as solid orange/grey blocks. (Top/bottom borders are already correct and thin.)
2. **User request:** with portraits in place, the unit name text is redundant clutter on the small card.

These pair naturally — same file, same `BuildUi`/card layout, same "card reads at a glance" goal.

### Definition of ready

- ID: M10.6. One-sentence goal: above. Files and acceptance criteria below.
- **Check first:** a background task was spawned in M10.4 to fix item 1 (the full-card tier border) on its own. If that task was already completed/merged, this slice reduces to item 2 only (name-text removal) plus verifying the tier frame - confirm at Orient which case applies and adjust the plan.
- No open blocker regressions in `REGRESSIONS.md`. (Recommend the M10.4 tier-border finding is filed as a regression first; if filed and still open it is the thing this slice closes, not a blocker.)

### Background (state after M10.4)

`SpriteCatalog` (presentation-only id->Sprite, self-seeding 33 ids) is in the scene and wired via `MainMenuPanel._spriteCatalog`. Hero and enemy combat cards show static base portraits by stable id, with placeholder-box fallback on a missing sprite. Art lives in `Assets/Art/Units/Heroes`, `Units/Enemies`, `Effects` per `SPRITE_CHECKLIST.md`. The M10.2 `_swordSprite`/`Assets/Art/Combat/sword.png` stab path is still intact and is M10.5's concern, not this slice. Portrait z-order is already after the tier-frame images (M10.4 fix) - keep it that way.

In `CombatUnitCardView.BuildUi`, the heal/acting frame strips correctly use `SetEdgeLeft(rt, thickness)` / `SetEdgeRight(rt, thickness)` / `SetEdgeTop` / `SetEdgeBottom`. The tier-border left/right currently use `SetAnchored(...)` instead - that is the bug. `ApplyTierBorder` / `SetTierBorderEnabled` tinting logic should stay; only the rect setup changes.

### Acceptance Criteria (finalize at Orient/Plan)

1. Hero tier border renders as a consistent thin frame (top/bottom/left/right same thickness) in the Bronze/Silver tier colour; it no longer fills the card or occludes the portrait/background.
2. The redundant unit name text is removed from the combat unit card - OR shown only as the fallback when no portrait sprite resolves (decide at Plan; pick one and state why).
3. Portrait, HP bar + HP text, role band, and the thin tier frame all remain legible; no card-size or row-layout change; enemy cards (no tier border) are visually unaffected aside from the name change.
4. No combat math, targeting, rewards, upkeep, hero-effect, run-flow, or new-state changes. `SpriteCatalog`, `MainMenuPanel`, and the `_swordSprite`/`sword.png` path are untouched.
5. No tween library, `Animator`, particles, audio, or new art added; layout-only change.

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs   - thin tier-frame rects; remove/relocate name text.
TestPlans/TP_M10.6.md                                 - NEW: manual test plan.
```

(If a no-sprite name fallback is chosen and it needs the resolved-sprite signal, `CombatPanelView.cs` may pass that in - confirm at Plan. Default expectation: contained to `CombatUnitCardView`.)

### Files Claude Code Does NOT Touch

- `SpriteCatalog.cs`, `MainMenuPanel.cs`.
- Any `Combat/`, `Run/`, `Core/`, or `Data/` gameplay script.
- `Assets/Art/**` and the `_swordSprite` / `Assets/Art/Combat/sword.png` path (M10.5 owns the effect cutover).
- `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`, `GAME_DESIGN.md`.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session (summary step only).
- `Assets/Scenes/Main.unity`.

### Deferred (tracked, not this slice)

- **M10.5** - shared effect-sprite set + category-routed source->target motion; repoints `_swordSprite` -> `SpriteCatalog.GetEffectSprite("melee_stab")` and retires `Assets/Art/Combat/sword.png`. Preconditions now met (M10.4 landed; the 5 effect PNGs are supplied in `Assets/Art/Effects/`). Sequence M10.5 after M10.6, or swap order if preferred - they are independent.
- M10.2 AC4 feasibility verdict -> record in `TestPlans/TP_M10.2.md` from the user's Editor run before M10.2 is marked Complete in `PROGRESS.md`.
- Per-hero / per-enemy / per-effect unique art -> post-M10, out of MVP unless re-ratified.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
