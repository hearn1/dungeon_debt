# CLAUDE.md

This file gives Claude Code the context it needs to work on **Dungeon Debt**. Read it fully before making changes. The two source-of-truth documents are:

- `GAME_DESIGN.md` — the design intent. Do not contradict it.
- `IMPLEMENTATION_PLAN.md` — the current technical state and the active follow-up list. Do not deviate without asking.

If those two documents conflict, ask before resolving.

---

## What this project is

**Dungeon Debt** is a single-player 2D fantasy auto-battler economy roguelite. The player recruits heroes, positions them in a 5-slot formation, picks payroll risks, fights through a 20-round dungeon across two acts, and tries to avoid debt bankruptcy.

The core loop per round: **Scout → Shop → Formation → Payroll → Auto-Combat → Reward → Rival Update**.

It is intentionally small. The codebase is ~6,000 lines of vanilla JavaScript + ~400 lines of CSS.

---

## Project status

The game was originally built in Unity (M1–M20 in `IMPLEMENTATION_PLAN.md` history) and then ported to an Electron + vanilla JS stack in five phases (A–E). The Unity project has been retired; the live code is in `web/`.

The game is playable end-to-end: full 20-round runs through Acts 1 and 2, all 12 heroes, 31 enemy definitions, 20 encounters, Bronze→Silver tiering, payroll choices, relic rewards, rival ghosts. Open follow-ups live in `REGRESSIONS.md` and the next session brief is in `NEXT_SESSION.md`.

---

## Core tech decisions (locked)

These are not up for debate. If you think one is wrong, raise it as a question — do not silently change it.

- **Electron + vanilla JavaScript** — plain ES modules under `web/src/`. No bundler, no framework (React/Vue/Svelte), no transpiler. Iteration = save → reload.
- **DOM + CSS** for all UI — no canvas, no WebGL, no Three.js. The game is turn-based cards; DOM is the right tool.
- **Python `http.server`** for browser dev (`web/serve.py`). Electron for the packaged window. Either works; pick whichever you have installed.
- **One seeded RNG** (`mulberry32`, in `web/src/core/Rng.js`) owned by `RunManager`. Never use `Math.random()` directly.
- **Combat is deterministic** — no RNG inside the combat resolver. Tie-breaking is leftmost-slot, not random.
- **Hardcoded JS data tables** in `DataRepository` for heroes / enemies / encounters / relics / payroll actions / difficulty presets. No JSON loading, no remote data, no save/load.
- **Definitions are immutable, instances are mutable.** `HeroDefinition` is a frozen template; `HeroInstance` is mutable party state. Same pattern for `EnemyDefinition`, `EncounterDefinition`, etc.
- **1280×720 minimum, no mobile.** The Electron window opens at 1280×720; the CSS is desktop-first.

---

## Folder structure

Create files in these locations. Do not invent new top-level folders.

```
web/
├── index.html
├── electron/main.cjs       ← Electron shell
├── serve.py                ← Python dev server (port 5173)
├── package.json            ← npm start, npm run test:headless
├── styles/main.css         ← design tokens + component styles
└── src/
    ├── main.js             ← renderer entry
    ├── core/               ← GameManager, GameState, DataRepository, GameRules, Rng
    ├── data/               ← plain data classes (HeroDefinition, HeroInstance, RunState, …)
    ├── run/                ← RunManager, ShopManager, PayrollManager, EncounterManager, RivalManager, heroStats, BalanceRunLogger
    ├── combat/             ← CombatManager, CombatLogger, HeroEffects
    ├── ui/                 ← UIManager, RunHeader, dom.js, components.js
    │   └── panels/         ← one file per panel (MainMenuPanel, ScoutPanel, ShopPanel, …)
    └── test/               ← headless test suites (headless.js, combat.js, run.js)
```

No build artifacts, no `node_modules` checked in, no `dist/` checked in.

Repo root also contains workflow files (not inside `web/`):

- `README.md`              — top-level entry point
- `GAME_DESIGN.md`         — design intent (source of truth)
- `IMPLEMENTATION_PLAN.md` — current technical state + open work (source of truth)
- `CLAUDE.md`              — project rules (this file)
- `AGENTS.md`              — parallel doc for Codex Code (mostly identical)
- `SESSION_PROTOCOL.md`    — per-session workflow
- `NEXT_SESSION.md`        — brief for the next session
- `PROGRESS.md`            — append-only session log
- `REGRESSIONS.md`         — open and closed bug log
- `TestPlans/`             — Unity-era manual test plans (kept for history)
- `Design/`                — design references and mockups

---

## Coding conventions

- **ES module syntax** — `import`/`export`. One class per file. File name = primary class name.
- **2 spaces** indentation, no tabs. LF line endings.
- **Naming:** `PascalCase` for classes, `camelCase` for everything else (variables, methods, properties, function params). Private fields prefixed with `_` (e.g. `_currentRunState`).
- **`const` by default**, `let` when reassigning, never `var`.
- **Enums are frozen string-keyed maps** (`Object.freeze({ Foo: "Foo", Bar: "Bar" })`), defined in `web/src/data/enums.js`. The value === the key so logs read naturally.
- **No third-party runtime dependencies.** Devs only: `electron`, `electron-builder`. Don't add Lodash, jQuery, Three.js, or anything else without asking.
- **No async/await in combat.** Combat resolves synchronously into a `CombatResult`; the log is replayed to the UI with `setInterval` if delay is needed.
- **No exceptions for control flow.** Return values + explicit checks.
- **`console.log` is fine** for development. Don't leave noisy logs in committed code; gate verbose logs behind `const VERBOSE = false`.
- **Inline `// comments`** should explain *why*, not *what*. Skip obvious comments.

---

## Architectural rules

- **`GameManager` owns `GameState`.** All state transitions go through `GameManager.changeState(state)`. No script changes state directly.
- **`UIManager` listens to state changes** and swaps panels. Panels do not show/hide themselves.
- **Managers reference each other directly** via `GameManager`. No event bus, no service locator, no DI container.
- **`DataRepository` is read-only** and static. It holds all hero / enemy / encounter / payroll / relic / difficulty / rival data.
- **`GameRules` holds all numeric constants and presentational tokens** (colors as CSS `rgba()` strings). When tuning, edit `GameRules.js`, not magic numbers scattered through logic.
- **`HeroEffects` is a static-style object** with one method per `HeroEffectId`. `CombatManager` and `RunManager` call into it at named hook points (`onCombatStart`, `onAttack`, `onKill`, `onEndOfCombatRound`, `onCombatEnd`, `applyPreUpkeep`).
- **Definitions are immutable; instances are mutable.** `HeroDefinition` is `Object.freeze`d in its constructor; `HeroInstance` is plain.
- **Combat is deterministic.** No RNG, no `Date.now()`, no `setTimeout` *inside* combat resolution. UI replay timing is separate.
- **`heroStats.js` holds the relic/health helpers shared between `CombatManager` and `RunManager`** (`hasRelic`, `getRelicAttackBonus`, `getRelicMaxHealthBonus`, `getScaledHeroMaxHealth`). Don't duplicate them.

---

## UI architecture

- **Each panel is one ES module** under `web/src/ui/panels/` with a `root` element and a `render()` method.
- **Panels mutate state via `GameManager`** and call `this.onDirty?.()` to ask `UIManager` to refresh the persistent header.
- **No framework.** Use the tiny `el()`/`clear()` helpers in `web/src/ui/dom.js`.
- **CSS classes drive styling, inline `style` is for dynamic values only** (e.g. role accent colors that come from `GameRules`).
- **Design tokens (palette, debt severity, role colors, act accents) live in `GameRules.js` as CSS `rgba()` strings** and are applied either via inline styles (when computed) or via CSS custom properties in `styles/main.css` (when static). Don't hardcode hex colors in component code.

---

## Workflow for any new task

1. **Identify the slice.** What `IMPLEMENTATION_PLAN.md` follow-up or `REGRESSIONS.md` entry does this work belong to? If neither, stop and ask.
2. **Re-read the relevant section** of `IMPLEMENTATION_PLAN.md`.
3. **List files to be created or changed** before writing code.
4. **Implement.** Stay inside the slice scope. If you discover a needed change outside scope, note it and ask.
5. **Verify** — run `npm run test:headless` for logic changes, reload the browser/Electron for UI changes.
6. **Do not start the next slice** without explicit confirmation.

---

## Definition of ready (before starting a slice)

A slice is not ready to start until **all** of these are true:

1. It has an ID (e.g. `R004`, `F1.2`, or a milestone code)
2. It has a one-sentence goal
3. Files to create or modify are listed in writing
4. 2–5 acceptance criteria are written
5. No open 🔴 Blocker regressions in `REGRESSIONS.md` would be invalidated by this work

If any of these are missing, the first task of the session is to define them with the user — not to start coding.

See `SESSION_PROTOCOL.md` for the full per-session flow.

---

## Scope control

These are hard limits for the prototype:

- **No new top-level folders** in `web/src/` without discussion. The five subfolders (`core`, `data`, `run`, `combat`, `ui`) cover everything.
- **No build step.** Plain ES modules + CSS. If you reach for Vite, Webpack, esbuild, or TypeScript, stop and ask.
- **No third-party libraries** without explicit approval. The whole point of porting off Unity was to keep the surface small.
- **No save/load**, no persistence, no accounts.
- **No procedural maps** or branching paths.
- **No real multiplayer**, online ghosts, leaderboards, accounts.
- **No meta progression**, unlocks, persistent currency.
- **No equipment, traits, factions, or synergies** beyond the existing role labels.
- **No expanding combat** with crit, dodge, types, statuses, or buffs beyond what's already in `CombatStatusId`.
- **No tutorial**, no localization (English only), no audio polish.
- **Animations are now in-scope** (per R005) but stay declarative — CSS keyframes, CSS transforms, sprite atlases as PNGs. No tween libraries (GSAP, anime.js), no Lottie, no WebGL.

If a request seems to violate one of these, respond with: *"Out of scope per CLAUDE.md §Scope control. Skip it, or update the plan first."*

---

## Common pitfalls to avoid

- **Don't use `Math.random()`.** Use `this._rng` on `RunManager` (or pass it through).
- **Don't make panels show/hide themselves.** That's `UIManager`'s job.
- **Don't put game logic in panel scripts.** Panels are presentation only — they read state and call manager methods.
- **Don't put magic numbers in logic files.** Add a constant to `GameRules.js`.
- **Don't make hero effects subclasses.** Use the `HeroEffects` object keyed by `HeroEffectId`.
- **Don't use async/await for combat simulation.** Combat is synchronous; only the UI replay is timed.
- **Don't make `HeroDefinition` mutable.** Mutate `HeroInstance` instead.
- **Don't permadeath heroes.** Dead-in-combat heroes are restored for the next round (`CombatManager._finishResult` resets `currentHealth`).
- **Don't add a bundler or TypeScript** without asking. The whole stack runs as plain ES modules under both Node and the browser.
- **Don't import from `web/electron/`** in renderer code. The Electron main process and the renderer are separate worlds — the renderer is sandboxed.
- **Don't update `PROGRESS.md` or `REGRESSIONS.md` mid-session.** Both are updated only at the end of a session.
- **Don't start a new slice in the same session as a completed one.** One slice per session. Stop, hand off, let the user verify.

---

## How to ask good questions

Prefer to ask before doing when:

- The design doc and plan disagree.
- A slice's scope is ambiguous.
- A "small improvement" would touch files outside the current slice.
- A required asset (sprite, font) doesn't exist yet.
- An effect or rule could be implemented multiple reasonable ways.

Don't ask before doing when:

- The plan clearly specifies the implementation.
- It's a typo, naming, or formatting fix.
- It's an obviously correct bug fix inside the current slice's files.

---

## What "done" looks like for a slice

A slice is done when:

1. All files in the plan's "create" / "modify" list exist and parse (no syntax errors, no unused imports).
2. All acceptance criteria pass.
3. `npm run test:headless` passes (if logic was touched).
4. The browser preview shows the expected behavior (if UI was touched), with zero console errors.
5. No out-of-scope features were added.
6. The user has confirmed they're ready to move on.

Report a short summary at the end of each slice:

- Files added/changed
- Acceptance criteria results
- Any deviations from the plan (and why)
- Anything flagged for follow-up
