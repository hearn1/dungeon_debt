# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: #70 - Difficulty levels 0-3

**Slice ID:** GitHub issue `#70` first slice  
**Type:** GitHub expansion issue wave  
**Severity:** Feature foundation  

### One-sentence goal

Replace the existing three-preset difficulty model with a 0-10 level scaffold where levels 0-3 are implemented and levels 4-10 are visible but disabled.

### Why this session exists

`#72`, `#73`, `#66`, and `#69` are complete. The next conflict-aware slice is `#70`, which creates the difficulty-level scaffold before Act 3, Rival Race, and Visual V1 work.

### Confirmed choices from orchestration

Matt confirmed the recommended answers for the open planning questions:

1. Use a frozen object with numeric values for `DifficultyLevel`, e.g. `Level0: 0`, because the issue says levels `0..10`.
2. `web/src/core/GameManager.js` and `web/src/core/GameRules.js` may be added if required to replace `DefaultDifficultyPreset` and keep `startRun()` coherent.
3. `web/src/test/verify.js` may be updated if it imports removed `DifficultyPresetId`; do not leave stale local scripts knowingly broken.

### Scope

**In scope:**

- Replace `DifficultyPresetId` with `DifficultyLevel` 0-10.
- Level 0 equals the old Standard Contract values exactly.
- Level 1 applies `LessStartingGold`: starting gold -3.
- Level 2 applies `HigherInterest`: interest divisor 5 -> 4.
- Level 3 applies `LowerDebtLimit`: debt limit -5.
- Levels 4-10 are visible in the UI but disabled with a coming-soon tooltip.
- Starting a run with level >3 throws a clear error.
- Tests assert level 0 identity and cumulative level 1-3 behavior.

**Not in scope:**

- Mutators 4-9.
- Level 10 capstone.
- Stat-multiplier mutators.
- Player-chosen mutator combinations.
- Rewards/score multipliers.
- Balance-tuning recommendations.
- New dependencies, framework/bundler/TypeScript, canvas, or WebGL.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #69, #66, #73, #72 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md §6
web/src/data/enums.js
web/src/data/DifficultyPreset.js
web/src/core/DataRepository.js
web/src/core/GameRules.js
web/src/core/GameManager.js
web/src/run/RunManager.js
web/src/ui/panels/MainMenuPanel.js
web/src/test/run.js
web/src/test/verify.js
```

### Files to modify

- `web/src/data/enums.js` - replace `DifficultyPresetId` with `DifficultyLevel` 0-10 numeric values.
- `web/src/data/DifficultyPreset.js` - delete or repurpose as `MutatorDefinition.js`.
- `web/src/core/DataRepository.js` - expose level/mutator data and lookup helpers for levels 0-3 plus disabled 4-10 UI metadata.
- `web/src/core/GameRules.js` - allowed if required for `DefaultDifficultyPreset` replacement.
- `web/src/core/GameManager.js` - allowed if required to keep `startRun()` coherent.
- `web/src/run/RunManager.js` - initialize runs from difficulty levels and apply mutators 1..N.
- `web/src/ui/panels/MainMenuPanel.js` - replace preset cards with 0-10 selector/list; 4-10 visible disabled.
- `web/src/test/run.js` - assert level 0 old Standard identity, levels 1-3 cumulative fields, and level >3 rejection.
- `web/src/test/verify.js` - update only if stale imports would remain broken.

### Files not to touch

- Combat files.
- Encounter or hero data unrelated to difficulty.
- CSS unless existing Main Menu styling cannot support disabled levels/tooltip without it; stop and ask if CSS becomes necessary.
- `PROGRESS.md`, `REGRESSIONS.md`, `NEXT_SESSION.md`, `IMPLEMENTATION_PLAN.md` until wrap.

### Acceptance criteria

1. Level 0 produces a `RunState` identical field-by-field to old Standard Contract for difficulty-controlled fields.
2. Levels 1, 2, and 3 apply exactly mutators 1..N.
3. Main menu shows active mutators for selected implemented level.
4. Levels 4-10 are visible but disabled and cannot be selected.
5. Calling start/init with level >3 throws a clear error.
6. `npm.cmd run test:headless` passes.

### Verification

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd web
npm.cmd run test:headless
```

Because this touches UI, also run a browser/app preview and check Main Menu for zero console errors.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The current slice is GitHub issue `#70` first slice: difficulty levels 0-3 only, with levels 4-10 visible but disabled. Use the confirmed orchestration choices in `NEXT_SESSION.md`, produce the Orient summary, stop for confirmation, then produce the Plan checkpoint before editing.