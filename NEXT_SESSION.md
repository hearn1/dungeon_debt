# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.5 - Shared effect sprites + category-routed source->target motion

**Milestone:** M10 - Combat view rebuild
**Slice goal:** Replace the single hard-coded `_swordSprite`/`sword.png` stab path with the shared 5-sprite effect set from `SpriteCatalog`, routed by attack category, animated source->target via the existing M10.2 board-level motion state machine and synced to the replay.

### Why this slice exists

M10.2 built a board-level traveling-sword stab state machine in `CombatPanelView`, fed by a single serialized `_swordSprite` (`Assets/Art/Combat/sword.png`). M10.4 landed `SpriteCatalog` (presentation-only, self-seeding 33 ids including the 5 effect ids) and the 5 effect PNGs now exist in `Assets/Art/Effects/`. M10.5 is the planned cutover: generalize the one-sprite stab into a category-routed shared-effect motion (`melee_stab`, `arrow`, `fireball`, `heal`, `enchant`), drop `_swordSprite`/`sword.png`, and pull all effect art from `SpriteCatalog`.

### Definition of ready

- ID: M10.5. One-sentence goal: above. Files and acceptance criteria below.
- M10.6 is complete (thin tier frame + name fallback landed); no open blocker regressions in `REGRESSIONS.md` (Open section currently empty).
- **Decide at Plan:** how a replay event maps to one of the 5 effect categories. There is **no per-effect gameplay data** and none may be added (presentation-only). The mapping must be derived from existing `CombatReplayEvent` / attack-vs-heal-vs-enchant signal already present, not new state. Confirm the exact signal at Orient by reading `CombatReplayEvent.cs` and the M10.2 stab state machine in `CombatPanelView.cs`.

### Background (state after M10.6)

`SpriteCatalog` exposes typed lookups incl. `GetEffectSprite(id)` for the 5 effect ids; it self-seeds and is wired via `MainMenuPanel._spriteCatalog` and passed into `CombatPanelView.Initialize`. Hero/enemy static portraits render by stable id with placeholder-box fallback; tier frame is a thin four-sided strip; unit name shows only when no portrait resolves. The M10.2 traveling-sword stab still uses the serialized `_swordSprite` (`Assets/Art/Combat/sword.png`) and a board-level source->target motion synced to the replay - that is exactly the path this slice generalizes and retires.

### Acceptance Criteria (finalize at Orient/Plan)

1. The board-level effect motion uses `SpriteCatalog` effect sprites, not a serialized single sprite. `_swordSprite` is removed and `Assets/Art/Combat/sword.png` is retired.
2. The correct effect sprite is chosen by category from the existing replay/attack signal (melee attack -> `melee_stab`, ranged -> `arrow`, magic damage -> `fireball`, heal -> `heal`, enchant/buff -> `enchant`). Exact category-to-id rules agreed at Plan; no new gameplay/effect data added.
3. The effect travels source->target via hand-coded RectTransform interpolation synced to the existing replay step timing, reusing (not duplicating) the M10.2 motion state machine.
4. No combat math, targeting, rewards, upkeep, hero-effect, or run-flow change; no new combat state. Replay/log content unchanged.
5. No tween library, `Animator`, particles, VFX, screen shake, or audio. Exactly the 5 shared effect sprites; no per-unit/per-effect unique art; no extra effect sprites.

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs   - category-routed source->target effect motion from SpriteCatalog.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs     - remove serialized `_swordSprite`; effect sprites come from SpriteCatalog.
DungeonDebt/Assets/Art/Combat/sword.png (+ .meta)  - retire (delete) once the cutover is verified.
TestPlans/TP_M10.5.md                              - NEW: manual test plan.
```

(Confirm at Plan whether a small read-only category helper belongs in `CombatPanelView` or alongside `CombatReplayEvent`. Default: contained to `CombatPanelView`. `CombatReplayEvent.cs` may be **read** for the category signal but not have gameplay fields added.)

### Files Claude Code Does NOT Touch

- `SpriteCatalog.cs` (consume only; do not add ids beyond the seeded 5 effects).
- Any `Combat/`, `Run/`, `Core/`, or `Data/` gameplay script for behaviour changes (read-only inspection of `CombatReplayEvent.cs` for the category signal is allowed; no new fields/state).
- `CombatUnitCardView.cs` (M10.6 just stabilized it; no card-layout change needed for this slice unless Plan surfaces a required anchor point - raise it first).
- `Assets/Art/Units/**` and any non-effect art.
- `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`, `GAME_DESIGN.md`.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session (summary step only).
- `Assets/Scenes/Main.unity`.

### Deferred (tracked, not this slice)

- M10.2 AC4 feasibility verdict -> record in `TestPlans/TP_M10.2.md` from the user's Editor run before M10.2 is marked Complete in `PROGRESS.md`.
- TP_M10.6 formal Editor run -> optional; slice accepted as visually verified, change was minimal/layout-only.
- Per-hero / per-enemy / per-effect unique art -> post-M10, out of MVP unless re-ratified.
- M11 - Economy & balance pass (after M10 closes out).

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
