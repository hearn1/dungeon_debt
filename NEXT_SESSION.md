# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M10.3 - Sprite-foundation planning slice (NO CODE)

**Milestone:** M10 - Combat view rebuild
**Slice goal:** Decide the sprite-organization architecture, ratify the scope-doc amendments needed for a per-entity sprite library, and produce an exact PNG asset checklist for the user. This slice produces documentation and a decision only - it writes ZERO C# and touches no scene, prefab, or image asset.

### Why this slice exists

"Each combat card has an animation tied to it" is gated on each hero/enemy being a sprite, not a placeholder box. That requires a scalable sprite-organization architecture and per-entity art - which exceeds the current locked scope:

- `CLAUDE.md` §Core tech: "placeholder art only / small placeholder set", "no ScriptableObjects, no JSON, no Resources/".
- `CLAUDE.md` §Scope control: "no animations beyond simple UI feedback".

Per `SESSION_PROTOCOL.md`, scope expansions are ratified in the source-of-truth docs before any code. The current single `_swordSprite` serialized field (added in M10.2) is "Option A in miniature" and does not scale to ~12 heroes + the enemy roster.

### Definition of ready - met

- ID: M10.3. One-sentence goal: above. Deliverables and acceptance criteria below. No open blocker regressions in `REGRESSIONS.md`.

### Background (state after M10.2)

M10.2 delivered combat replay: per-step HP bars, a thin-edge acting outline, hit flash, pulsing green heal frame, and a board-level traveling sword stab for the Warrior (sprite assigned via a single serialized field on `MainMenuPanel`). M10.2 is code-complete and builds clean; its AC4 feasibility verdict is pending the user's TP_M10.2 Editor run. The "generic motion on placeholder boxes" idea floated mid-M10.2 was explicitly dropped as throwaway - the real feature needs sprites first.

### Acceptance Criteria (finalize at Orient/Plan)

1. A written A-vs-B decision with full tradeoffs: Option A (`SpriteCatalog` MonoBehaviour, serialized id->Sprite slots, stays inside all current locked rules) vs Option B (ScriptableObject sprite library, Unity-idiomatic at scale, requires an explicit `CLAUDE.md` "no ScriptableObjects" amendment for art only). One chosen with rationale. (User chose: decide during this slice.)
2. `IMPLEMENTATION_PLAN.md` §15 amended to add sprite-foundation + per-card animation as explicit M10 sub-milestones - M10.4 (sprite catalog + static per-entity sprites on cards) and M10.5 (per-card attack motion) - and to state per-hero-attack / per-enemy-attack / per-effect art is deferred (post-M10 polish, out of MVP unless re-ratified).
3. `CLAUDE.md` amended: §Scope-control / placeholder-art carve-out updated to permit (a) the chosen sprite architecture and (b) generic coded per-card combat motion (RectTransform offsets, no tween library, no Animator, no particles); if Option B is chosen, the "no ScriptableObjects" rule is amended for art assets only.
4. An exact PNG checklist for the user: every required file with path, naming convention, and canonical orientation/size/transparency rules - covering the 12-hero locked roster (`IMPLEMENTATION_PLAN.md` §7) and the full enemy roster (enumerate from `DataRepository`). Per-hero-attack and per-effect sprites listed as explicitly deferred (not in the required set).
5. The remaining implementation work is split into ready-to-pick future slices (M10.4, M10.5) each with a one-sentence goal and a file list.

### Files Claude Code May Modify (DOCS ONLY)

```
IMPLEMENTATION_PLAN.md   - §15 amendment + M10.4/M10.5 sub-milestone definitions.
CLAUDE.md                - §Scope-control / placeholder-art / (if Option B) no-ScriptableObjects amendment.
NEXT_SESSION.md          - rewritten at session end for M10.4.
Art/SPRITE_CHECKLIST.md  - new doc: the PNG list + naming/format rules for the user (or inline in the M10.4 NEXT_SESSION rewrite).
```

### Files Claude Code Does NOT Touch

- Any `.cs` file, any scene, any prefab, any image asset, the `.csproj`. This slice is non-code.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session (summary step only).

### Test plan

Step 6 (manual test plan) is intentionally OMITTED for this slice: it produces no runtime behavior, only documentation and a decision. `SESSION_PROTOCOL.md` permits omitting a section when it genuinely does not apply - it does not here. Self-verification (step 5) instead checks each acceptance criterion against the produced doc text.

### Deferred (tracked, not this slice)

- Sprite catalog implementation -> M10.4.
- Per-entity static sprite display on cards -> M10.4 (after user supplies the PNGs).
- Per-card attack motion (lunge / recoil) -> M10.5.
- Per-hero-attack / per-enemy-attack / per-effect sprites -> post-M10 polish, out of MVP unless re-ratified.
- M10.2 AC4 feasibility verdict -> record in `TestPlans/TP_M10.2.md` from the user's Editor run before M10.2 is marked Complete in `PROGRESS.md`.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
