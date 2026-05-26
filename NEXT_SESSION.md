# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: #73 - Encounter variants Bucket A

**Slice ID:** GitHub issue `#73` first slice  
**Type:** GitHub expansion issue wave  
**Severity:** Feature foundation  

### One-sentence goal

Add seeded encounter variant selection for four specified Act 1 slots, using `RunManager._rng` at scout time and keeping combat deterministic.

### Why this session exists

`#72` Balance harness Phase 1 landed first so later balance-sensitive slices have a seeded run-report tool available. The next conflict-aware slice is `#73`, which introduces low-risk run variety by adding encounter variants before broader tier, roster, difficulty, Act 3, rival, and visual work.

### Confirmed choices from orchestration

Matt confirmed the recommended answers for the open planning questions:

1. Follow the current local slot numbers for the four target Act 1 slots, preserving the issue's target slots even where local encounter names differ from the GitHub prose. The implementation agent must flag the exact local substitutions in its summary.
2. `EncounterDefinition.js` may be added to the file list if needed so `variantId` can live on the encounter definition and surface cleanly as `RunState.currentEncounter.variantId`.

### Scope

**In scope:**

- Bucket A encounter variants only.
- Four Act 1 slots only: rounds 4, 6, 8, and 9.
- `DataRepository.getEncounterPool(act, slot)` returns `[base]` for ordinary slots and `[base, variant]` for the four variant slots.
- `EncounterManager` selects from the pool with `RunManager.rng` at scout/load time.
- Selected encounter exposes `variantId` for deterministic tests.
- Tests cover same-seed repeatability and different-seed variety.

**Not in scope:**

- Bucket B shop events.
- Bucket C crits.
- Bucket D cursed relics / skip-for-gold.
- Act 2 variants.
- Combat resolver changes or combat RNG.
- New top-level folders, dependencies, frameworks, bundlers, TypeScript, canvas, or WebGL.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #72 entry)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md §6
GAME_DESIGN.md only if needed for encounter design consistency
web/src/core/DataRepository.js
web/src/data/EncounterDefinition.js
web/src/run/EncounterManager.js
web/src/data/RunState.js
web/src/test/run.js
```

### Files to modify

- `web/src/core/DataRepository.js` - add four base+variant pools for Act 1 rounds 4, 6, 8, and 9.
- `web/src/run/EncounterManager.js` - ensure selection uses `RunManager.rng` and selected variant id is surfaced.
- `web/src/data/RunState.js` - only if needed to keep selected encounter assertability clean.
- `web/src/data/EncounterDefinition.js` - allowed if needed to add `variantId` to encounter definitions.
- `web/src/test/run.js` - add same-seed and multi-seed variant checks.

### Files not to touch

- `web/src/combat/*`
- `web/src/run/RunManager.js` unless the implementation plan proves it is required and Matt confirms.
- `web/src/data/enums.js` unless the implementation plan proves it is required and Matt confirms.
- UI/CSS files.
- `PROGRESS.md`, `REGRESSIONS.md`, `NEXT_SESSION.md`, `IMPLEMENTATION_PLAN.md` until wrap.

### Acceptance criteria

1. The four specified Act 1 slots each have two variants: base plus new variant.
2. Variant selection uses only the run RNG; no `Math.random()`.
3. Same seed produces identical variant sequence across runs.
4. Across five different seeds, at least two distinct variant sequences are observed.
5. Combat remains deterministic and `CombatManager` is untouched.
6. `npm.cmd run test:headless` passes.

### Verification

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd web
npm.cmd run test:headless
```

Because this is logic/data only, browser preview is optional unless the implementation touches UI despite the file list.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The current slice is GitHub issue `#73` first slice: Encounter variants Bucket A. Use the confirmed orchestration choices in `NEXT_SESSION.md`, produce the Orient summary, stop for confirmation, then produce the Plan checkpoint before editing.