# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step.

---

## Session: #68 - Rival Race mechanic

**Slice ID:** GitHub issue `#68` first slice
**Type:** GitHub expansion issue wave
**Severity:** Feature foundation

### One-sentence goal

Replace the passive Rival Update stats panel with the deterministic "Race the Rivals" mechanic, including race progress, finish-first morale pressure, rival ghost lead scaling, victory tribute, and a 4-lane leaderboard.

### Why this session exists

`#72`, `#73`, `#66`, `#69`, `#70`, and `#67` are complete. The next conflict-aware slice is `#68`, which touches shared run/combat/UI surfaces and should be completed before the final visual identity sweep.

### Scope

**In scope:**

- Add continuous rival progress from 0 to 20, while player progress remains `runState.round`.
- Advance rival progress every Rival Update tick using deterministic `GameRules.RivalRaceCurves` keyed by guild:
  - Greedy: rounds 1-6 advance +1.4; round 7+ advances +0.8 if debt > 12, else +1.2.
  - Frugal: always +1.1.
  - Carry: rounds 1-5 advance +0.7; rounds 6-10 advance +1.1; round 11+ advance +1.5.
- Keep old rival payroll/debt/morale mutation running in the background.
- Add one-time morale penalty `GameRules.RivalFinishedFirstMorale = 5` when a rival reaches progress 20 before the player reaches round 20.
- Populate `RunState.rivalRaceFinishesThisRound` for Rival Update flavor.
- Snapshot rival lead at scout time for `RivalGhost` encounters.
- Scale rival ghost enemies at combat start from the encounter snapshot:
  - `lead = max(0, rival.progress - player.round)`
  - HP multiplier `1 + 0.05 * lead`, capped at `1.50`
  - attack multiplier `1 + 0.03 * lead`, capped at `1.30`
- Apply victory tribute `GameRules.RivalRaceTributePerBehind = 3` per rival still behind the player at victory.
- Rewrite `RivalUpdatePanel` as a 4-lane leaderboard with progress bars, current progress numbers, projected finish round, and finished-state flavor.
- Add tests for curve advancement, finish-first morale, lead-based stat scaling, victory tribute, and panel rendering smoke.

**Locked design decisions:**

- D1: Keep old payroll/debt/morale stats mutating in the background; remove them from the Rival Update UI.
- D2: Rival ghost encounter slots stay unchanged at rounds 3, 6, and 9 in each act.
- D3: Player-side race reward is end-of-run gold tribute only.
- D4: Rival progress persists across acts; Act 1 -> 2 does not reset progress.
- D5: Projected finish round is visible starting at round 1.
- D6: Race-loss penalty is morale: `RivalFinishedFirstMorale = 5`, once per rival.

**Not in scope:**

- Removing old payroll/debt/morale rival fields or old background mutation.
- Moving rival encounter slots.
- Mid-run pass bonuses or player-facing progress boosts.
- Per-rival personality flavor variations beyond required finish/ahead messaging.
- Balance harness tuning sweep.
- Adding a fourth rival.
- New RNG, `Math.random()`, combat RNG, dependencies, framework/bundler/TypeScript, canvas, or WebGL.

### Files to read

```
AGENTS.md
CLAUDE.md
SESSION_PROTOCOL.md
PROGRESS.md (latest #67, #70, #69 entries)
REGRESSIONS.md (Open section)
IMPLEMENTATION_PLAN.md section 6
web/src/data/RivalGuildState.js
web/src/data/RunState.js
web/src/run/RivalManager.js
web/src/run/RunManager.js
web/src/combat/CombatManager.js
web/src/core/GameRules.js
web/src/core/DataRepository.js
web/src/ui/panels/RivalUpdatePanel.js
web/styles/main.css
web/src/test/run.js
```

### Files to modify

- `web/src/data/RivalGuildState.js` - add `progress`, `finishedAtRound`, and `tributeApplied`.
- `web/src/data/RunState.js` - add `rivalRaceFinishesThisRound`.
- `web/src/run/RivalManager.js` - advance progress, detect finishes, and populate per-round finish list while keeping existing payroll/debt/morale mutation.
- `web/src/run/RunManager.js` - snapshot rival lead at scout time, apply finish-first morale penalty, and apply victory tribute.
- `web/src/combat/CombatManager.js` - apply lead-based stat multipliers for `RivalGhost` enemies from the encounter snapshot.
- `web/src/core/GameRules.js` - add race constants and `RivalRaceCurves`.
- `web/src/core/DataRepository.js` - initialize rival race fields in `createRivalGuilds()`.
- `web/src/ui/panels/RivalUpdatePanel.js` - replace old stats dump with 4-lane leaderboard.
- `web/styles/main.css` - add `.rival-race-lane`, `.rival-race-bar`, and `.rival-race-finished`.
- `web/src/test/run.js` - add deterministic race tests and panel rendering smoke coverage.

### Files not to touch

- `web/src/data/enums.js` unless the plan proves it is required and Matt confirms.
- `web/src/ui/panels/MainMenuPanel.js`
- `web/src/core/Rng.js`
- `PROGRESS.md`, `REGRESSIONS.md`, `NEXT_SESSION.md`, `IMPLEMENTATION_PLAN.md` until wrap.

### Acceptance criteria

1. Each rival's `progress` advances per its guild curve every Rival Update tick from deterministic tests.
2. Rival finish-first morale applies once per rival when that rival reaches progress 20 before the player reaches round 20.
3. RivalGhost lead scaling uses the encounter snapshot, not live rival state, and applies the specified HP/attack formula with caps.
4. Victory grants tribute = `RivalRaceTributePerBehind * rivals still behind player`.
5. Rival Update panel shows a 4-lane leaderboard with progress bars, current progress numbers, projected finish round per lane, and finished state.
6. Combat remains deterministic and no `Math.random()` is introduced.
7. Headless tests cover curve advancement, finish-first morale, lead-based stat scaling, victory tribute, and panel rendering smoke.
8. Browser/app preview verifies the Rival Update panel with zero console errors.

### Verification

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd web
npm.cmd run test:headless
```

Because this rewrites a visible panel, also run browser/app preview and check console errors.

### Start prompt for the next session

> Read `AGENTS.md`, `CLAUDE.md`, and `SESSION_PROTOCOL.md`, then follow `NEXT_SESSION.md`. The current slice is GitHub issue `#68` first slice: Rival Race mechanic with locked decisions D1-D6. Produce the Orient summary, stop for confirmation, then produce the Plan checkpoint before editing.
