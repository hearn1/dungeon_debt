# Dungeon Debt

A single-player 2D fantasy auto-battler economy roguelite. Recruit heroes into a five-slot formation, pick a payroll risk, fight through a 20-round dungeon across two acts, and try not to drown in debt.

The core loop per round:

> **Scout → Shop → Formation → Payroll → Auto-Combat → Reward → Rival Update**

## Tech stack

- **Electron + vanilla JavaScript** (no build step, no framework, plain ES modules)
- **DOM + CSS** for all UI (the design tokens live in `web/src/core/GameRules.js`)
- **Python `http.server`** for browser-based dev (no Node needed for iteration)
- **Seeded RNG** (`mulberry32`) owned by `RunManager` — combat itself is RNG-free and deterministic

The game was originally built in Unity and then ported to the web stack to make UI iteration faster. The Unity project is gone; if you need to see what it looked like, check git history before the Phase E deletion.

## Run it

**In the browser** (no install needed beyond Python):

```sh
python web/serve.py
```

Open <http://localhost:5173>.

**In a native Electron window** (one-time setup):

```sh
cd web
npm install
npm start
```

Set `DUNGEONDEBT_DEVTOOLS=1` before `npm start` to open DevTools alongside the window.

## Test it

```sh
cd web
npm run test:headless
```

That runs the foundation + combat + run-flow suites against the ported game logic with no UI involvement. 57 checks, all should pass.

## Repository layout

```
dungeon_debt/
├── README.md                ← you are here
├── GAME_DESIGN.md           ← design intent (source of truth, engine-agnostic)
├── IMPLEMENTATION_PLAN.md   ← current technical state + open work
├── CLAUDE.md / AGENTS.md    ← project rules for LLM-assisted dev
├── SESSION_PROTOCOL.md      ← per-session workflow for LLM agents
├── NEXT_SESSION.md          ← brief for the next development session
├── PROGRESS.md              ← append-only log of completed work
├── REGRESSIONS.md           ← open + closed bug log
├── TestPlans/               ← manual test plans (Unity-era history)
├── Design/                  ← design references and mockups
└── web/                     ← the game
    ├── electron/main.cjs    ← Electron shell
    ├── index.html
    ├── serve.py             ← dev server
    ├── package.json
    ├── styles/main.css      ← design tokens + component styles
    └── src/
        ├── core/            ← GameManager, GameState, DataRepository, GameRules
        ├── data/            ← plain data classes (HeroDefinition, RunState, …)
        ├── run/             ← RunManager, ShopManager, PayrollManager, EncounterManager, RivalManager
        ├── combat/          ← CombatManager, CombatLogger, HeroEffects
        ├── ui/              ← UIManager + one module per panel
        └── test/            ← headless test suites
```

## Status

The web port is complete and playable end-to-end. Open follow-ups live in `REGRESSIONS.md`; the next session brief is in `NEXT_SESSION.md`.

## License

Private / unspecified — internal prototype.
