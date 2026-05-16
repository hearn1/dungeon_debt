# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.4 - Sprite catalog + static base sprites on combat cards

**Milestone:** M10 - Combat view rebuild
**Slice goal:** Introduce a presentation-only `SpriteCatalog` MonoBehaviour and render each hero's/enemy's static base sprite on its combat unit card, driven by stable id, with the existing placeholder box as fallback when a sprite is missing.

### Why this slice exists

M10.3 ratified the sprite architecture (Option A: `SpriteCatalog` MonoBehaviour), amended `CLAUDE.md` §Scope control + `IMPLEMENTATION_PLAN.md` §15, and produced `Assets/Art/SPRITE_CHECKLIST.md`. M10.4 is the first code slice of that pipeline: stand up the catalog and show static base art on cards. Per-card effect motion is the *next* slice (M10.5), not this one.

### Definition of ready

- ID: M10.4. One-sentence goal: above. Files and acceptance criteria below.
- **Precondition (asset gate):** the user must supply the 12 hero + 16 enemy base PNGs per `Assets/Art/SPRITE_CHECKLIST.md` (`Assets/Art/Units/Heroes/<id>.png`, `Assets/Art/Units/Enemies/<id>.png`). If the PNGs are not yet present, the slice can still land the catalog + fallback path and be tested with the placeholder box; confirm with the user at Orient which case applies.
- No open blocker regressions in `REGRESSIONS.md`.

### Background (state after M10.3)

M10.3 was docs-only. Architecture decided: a single scene `SpriteCatalog` MonoBehaviour with serialized id→Sprite slots for hero base, enemy base, and the 5 shared effect sprites; queried by stable id (`"warrior"`, `"slime"`, `"melee_stab"`, ...). `SpriteCatalog` is presentation-only and holds no gameplay data. M10.2's single `_swordSprite` field on `MainMenuPanel` and `Assets/Art/Combat/sword.png` still exist and stay wired until M10.5 repoints them — do not remove them in M10.4. M10.2 AC4 feasibility verdict is still pending the user's TP_M10.2 Editor run (see Deferred).

### Acceptance Criteria (finalize at Orient/Plan)

1. `SpriteCatalog` MonoBehaviour exists with serialized `id → Sprite` slots for hero base, enemy base, and the 5 shared effect ids; exposes lookup-by-id returning `null` (not an exception) on miss. Presentation-only: references no run/combat/data state.
2. Combat unit cards display the correct base sprite by the unit's stable id for heroes and enemies.
3. When a sprite is missing/unassigned, the card falls back to the existing M10.1/M10.2 placeholder box with no errors and no layout break.
4. No combat math, targeting, rewards, upkeep, hero-effect, run-flow, or new-state changes. The M10.2 `_swordSprite`/`sword.png` path is left intact (untouched, repointed only in M10.5).
5. No tween library, `Animator`, particles, audio, or per-unit/per-effect unique art added; only the catalog + static base-sprite display.

### Files Claude Code May Modify

```
DungeonDebt/Assets/Scripts/UI/SpriteCatalog.cs        - NEW: presentation-only id->Sprite MonoBehaviour.
DungeonDebt/Assets/Scripts/UI/CombatUnitCardView.cs   - render base sprite by id, placeholder fallback.
DungeonDebt/Assets/Scripts/UI/CombatPanelView.cs      - pass catalog reference / resolve id per card.
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs        - serialized SpriteCatalog reference + scene wiring.
DungeonDebt/Assets/Scenes/Main.unity                  - add the SpriteCatalog component + assign slots.
DungeonDebt/Assembly-CSharp.csproj                    - local Compile entry for the new script (Unity regenerates).
TestPlans/TP_M10.4.md                                 - NEW: manual test plan.
```

(`.meta` files for the new script as needed. Final file list confirmed at Plan.)

### Files Claude Code Does NOT Touch

- Any `Combat/`, `Run/`, `Core/`, or `Data/` gameplay script (resolver, run flow, effects, data).
- `Assets/Art/Combat/sword.png` and the `_swordSprite` wiring (M10.5 handles the cutover).
- `IMPLEMENTATION_PLAN.md`, `CLAUDE.md`, `GAME_DESIGN.md` (scope already ratified in M10.3).
- `PROGRESS.md` / `REGRESSIONS.md` mid-session (summary step only).

### Deferred (tracked, not this slice)

- Shared effect-sprite set + category-routed source→target motion -> M10.5 (precondition: M10.4 landed + 5 effect PNGs supplied).
- Per-hero / per-enemy / per-effect unique art -> post-M10 polish, out of MVP unless re-ratified.
- M10.2 AC4 feasibility verdict -> record in `TestPlans/TP_M10.2.md` from the user's Editor run before M10.2 is marked Complete in `PROGRESS.md`.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
