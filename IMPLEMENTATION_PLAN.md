# Dungeon Debt — Implementation Plan

This document is the **technical implementation plan** for the prototype defined in `GAME_DESIGN.md`. It describes the live architecture of the web port, the contracts between modules, and the open follow-up work.

The plan is intentionally scoped small. Do not expand it. When in doubt, cut.

---

## 1 · History (one paragraph)

Dungeon Debt was originally built in Unity (uGUI, C#) across 20+ milestones (M1–M20). In 2026-05, the entire prototype was ported to an **Electron + vanilla JavaScript + DOM/CSS** stack in five phases (A–E), and the Unity project was deleted. The port preserved the deterministic combat resolver, the static data tables, and the run-flow state machine; the UI was rebuilt as plain DOM panels driven by `UIManager`. See `PROGRESS.md` for the chronological log.

---

## 2 · Stack

- **Runtime:** Electron 42 (Chromium-based desktop window), or any modern browser served by `web/serve.py` (Python `http.server`).
- **Language:** Plain ES modules. No bundler, no TypeScript, no JSX.
- **UI:** DOM + CSS. Design tokens live in `web/src/core/GameRules.js` as CSS `rgba()` strings and in `web/styles/main.css` as CSS custom properties.
- **State:** A single `GameManager` instance in the renderer process. No persistence, no save/load.
- **RNG:** One seeded `mulberry32` PRNG (`web/src/core/Rng.js`) owned by `RunManager`. Combat itself is RNG-free.
- **Tests:** Three headless Node scripts under `web/src/test/` exercise the foundation, combat engine, and run-flow state machine. No browser tests; UI is verified by manual reload + console-error check.

---

## 3 · Folder layout

```
web/
├── index.html
├── electron/main.cjs            ← Electron shell (sandboxed renderer, custom dungeondebt:// protocol)
├── serve.py                     ← Python static dev server (port 5173)
├── package.json
├── styles/main.css              ← design tokens + component CSS
└── src/
    ├── main.js                  ← renderer entry: new GameManager() → new UIManager(gm, root)
    ├── core/
    │   ├── GameManager.js       ← owns GameState; wires all managers; resolveCombat() helper
    │   ├── GameState.js         ← frozen enum of states
    │   ├── GameRules.js         ← all numeric constants + helper fns + color tokens
    │   ├── DataRepository.js    ← static tables: heroes, enemies, encounters, payroll, relics, difficulty, rivals
    │   └── Rng.js               ← seeded mulberry32
    ├── data/
    │   ├── enums.js             ← HeroRole, HeroTier, HeroEffectId, EnemyEffectId, EncounterType, …
    │   ├── HeroDefinition.js    ← immutable hero template
    │   ├── HeroInstance.js      ← mutable party member
    │   ├── EnemyDefinition.js   ← immutable enemy template
    │   ├── EncounterDefinition.js
    │   ├── RunState.js          ← the big mutable bag of run data
    │   ├── CombatUnit.js
    │   ├── CombatStatusState.js
    │   ├── CombatResult.js
    │   ├── CombatReplayEvent.js ← plain data event for UI replay
    │   ├── ShopOffer.js
    │   ├── PayrollActionDefinition.js
    │   ├── RelicDefinition.js
    │   ├── DifficultyPreset.js
    │   └── RivalGuildState.js
    ├── run/
    │   ├── RunManager.js        ← owns RNG; economy math (reward / upkeep / interest); veterancy; act advancement
    │   ├── ShopManager.js       ← Bronze/Silver offer pools; hire / fire / reroll / pay-debt; duplicate→Silver merge
    │   ├── PayrollManager.js    ← apply / applyPostCombat / revertPerCombatHeroStats
    │   ├── EncounterManager.js  ← loads encounter for current round from DataRepository
    │   ├── RivalManager.js      ← initializeRivals / advanceRivals
    │   ├── heroStats.js         ← shared relic/health helpers (used by combat AND RunManager)
    │   └── BalanceRunLogger.js  ← in-memory TSV-row buffer (Unity dev tool, kept API-compatible as a stub)
    ├── combat/
    │   ├── CombatManager.js     ← deterministic turn resolution
    │   ├── CombatLogger.js      ← log lines + lockstep replay events
    │   └── HeroEffects.js       ← one method per HeroEffectId, called at named hook points
    ├── ui/
    │   ├── UIManager.js         ← listens to gm.onStateChanged, swaps panels, refreshes header
    │   ├── RunHeader.js         ← persistent top chrome (act seal, round progress, gold/morale, debt chip, relics)
    │   ├── dom.js               ← el(), clear(), two() helpers
    │   ├── components.js        ← heroCard(), hpBar(), statusPills()
    │   └── panels/
    │       ├── MainMenuPanel.js
    │       ├── ScoutPanel.js
    │       ├── ShopPanel.js
    │       ├── FormationPanel.js
    │       ├── PayrollPanel.js
    │       ├── CombatPanel.js   ← runs gm.resolveCombat(), replays log step-by-step, shows reward summary
    │       ├── RelicRewardPanel.js
    │       ├── RivalUpdatePanel.js
    │       └── EndScreenPanel.js   ← Victory / Defeat
    └── test/
        ├── headless.js          ← foundation: enums, Rng, GameRules, data classes
        ├── combat.js            ← end-to-end combats with fixed parties
        └── run.js               ← full GameManager state-machine drive + autopilot
```

---

## 4 · Architectural contracts

### State machine

```
MainMenu
  └─ startRun(presetId)
       ├─ StartRun  (transient — initializeRun + 1st encounter load)
       └─ Scout ⇄ Shop ⇄ Formation ⇄ Payroll ⇄ Combat → (RelicReward?) →
                                                           ├─ RivalUpdate → advanceRound → Scout
                                                           ├─ Victory → continueToNextAct (if act < total) → Scout
                                                           └─ Defeat → MainMenu
```

- `GameManager.changeState(s)` is the only legal state setter. It emits to `onStateChanged` listeners; `UIManager` is the only listener in production.
- `GameManager.resolveCombat()` runs `CombatManager.startCombat(run, encounter)` then `runManager.applyPostCombatResult(result, encounter)` and returns the result. The Combat panel calls this once on entry.

### Data ownership

- `RunState` is the single mutable bag of run-scoped data. `RunManager` writes to it; everyone else may read.
- `HeroInstance` is the single mutable per-hero bag. `HeroEffects.applyTierStatSeed(hero)` reseeds tier-derived stats each round.
- `CombatUnit` is a per-combat snapshot of a hero/enemy; it never persists past a fight. `CombatResult.playerStartUnits` / `playerFinalUnits` are deep snapshots for UI replay.

### Combat hook points

`HeroEffects` exposes:

- `applyTierStatSeed(hero)` — every round, hire, or merge
- `getTierAdjustedMaxHealth(hero)` — used by `heroStats.getScaledHeroMaxHealth`
- `onCombatStart(run, enc, playerUnits, enemyUnits, logger) → knightRedirectsRemaining`
- `overrideTarget(attacker, defenders, combatRound) → CombatUnit | null`
- `tryRedirectToKnight(defender, playerUnits, remaining, logger) → { target, remaining }`
- `getDamageReduction(defender) → number`
- `onAttack(attacker, defender, logger)` (no-op currently — kept as a named hook)
- `onSurvivingAttack(attacker, defender, logger)` (Silver upgrade riders)
- `onKill(attacker, defeated, run, logger)` (Ninja loot)
- `onEndOfCombatRound(round, run, enc, players, enemies, result, logger)` (Priest heal, Goblin steal, Auditor periodic damage, etc.)
- `onCombatEnd(result, run, players, enemies, logger)` (Bard win-gold, Treasure Leech flag)
- `applyPreUpkeep(run)` (Apprentice + Treasurer upkeep reductions)

### Determinism

- Two combats with identical inputs produce byte-identical `logLines`. Verified by `web/src/test/combat.js` "determinism" check.
- Two runs with the same RNG seed produce identical shop offers, encounter-pool picks, and relic choices. (Today the RNG is seeded from `Date.now()`; if you need replay, expose seed selection in `RunManager.initializeRun`.)

---

## 5 · Tests

Run them all with `npm run test:headless` (from `web/`). The npm script chains:

1. `src/test/headless.js` — 20 checks: enums, Rng, GameRules, data classes
2. `src/test/combat.js` — 13 checks: end-to-end combats with fixed parties, including determinism
3. `src/test/run.js` — 24 checks: full GameManager flow + an autopilot that drives a complete run to terminal state

UI is verified manually:

- Reload the browser preview (or relaunch Electron).
- Click through the loop, watch the console.
- Zero errors = pass. Anything else = file a regression in `REGRESSIONS.md`.

There is no Playwright / Puppeteer / Vitest. Adding them is out of scope per `CLAUDE.md` §Scope control.

---

## 6 · Open follow-ups

Active regressions live in `REGRESSIONS.md`. As of this writing:

- **R004 — Formation no longer shows frontline / backline split** (🟡 Minor). CSS layout regression in `web/src/ui/panels/FormationPanel.js` + `web/styles/main.css`. Two slots (0–1) should visually group separately from three slots (2–4).
- **R005 — Hero / enemy / attack animations missing** (🟠 Major). Replay is text + a 380ms flash. The web stack opens the door to a real animation pass — portraits, projectile motion, CSS keyframe transforms, sprite atlases as PNGs. No tween libraries; declarative CSS only.

The next session brief is in `NEXT_SESSION.md`.

---

## 6a · Art assets and licensing (locked R005-1, 2026-05-25)

- **License floor:** CC0 and CC BY only. CC BY-SA (copyleft) and any Non-Commercial (NC) variant are rejected so the build stays free to ship as a paid commercial release. Any new art must be confirmed against this floor before it lands.
- **Asset path layout:**
  - `web/assets/heroes/<heroId>.png` — per-hero portrait. Falls back to `role-<role>.png` then `role-tank.png` when an id is missing.
  - `web/assets/enemies/<enemyId>.png` — per-enemy portrait. Falls back to `enemy-default.png`.
  - `web/assets/effects/<heroId|enemyId>.png` (future per-character) → `role-<role>.png` (hero-role fallback) → `enemy-generic.png` (any non-player) → `effect-default.png`. `heal.png` is shared by every Heal event.
- **Sprite-catalog seam:** `web/src/ui/SpriteCatalog.js` resolves an id (or a `CombatUnit`) to a URL. `DataRepository` stays data-only; no portrait fields on `HeroDefinition` / `EnemyDefinition`.
- **Attribution:** every CC BY asset is credited in `web/ATTRIBUTION.md`. A "Art credits" link surfaces it from the Main Menu.

## 7 · Things explicitly *not* in scope (carry-over from Unity-era scope control)

- No save/load, no persistence, no accounts, no online anything.
- No procedural maps, branching paths, or meta progression.
- No equipment / inventory / traits / factions / synergies beyond the existing role labels.
- No new combat math (crit, dodge, types) beyond what's in `CombatStatusId`.
- No tutorial, no localization, no audio.
- No bundler, no framework, no TypeScript. Plain ES modules + CSS.
- No third-party runtime dependencies. Devs only: `electron`, `electron-builder`.

If a request looks like it violates this, see `CLAUDE.md` §Scope control for the standard response.

---

## 8 · Appendix — historical milestones

The Unity build went through milestones M1–M20 across roughly four months. That history is preserved in `PROGRESS.md` and the legacy test plans under `TestPlans/TP_M*.md`. Those test plans reference Unity scenes, prefabs, and views that no longer exist; they're kept as historical reference, not as a runnable test suite for the web port.

Phase A–E (the web port itself) is logged at the bottom of `PROGRESS.md`.
