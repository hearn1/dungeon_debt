# SESSION_PROTOCOL.md

Read this file at the start of **every** Claude Code session before doing anything else. It defines the workflow for working on Dungeon Debt and is paired with:

- `CLAUDE.md` — project rules
- `GAME_DESIGN.md` — design intent (source of truth)
- `IMPLEMENTATION_PLAN.md` — current technical state + open work (source of truth)
- `NEXT_SESSION.md` — brief for the slice about to be picked up
- `PROGRESS.md` — append-only log of completed slices
- `REGRESSIONS.md` — open and closed bug log

---

## The unit of work: a "slice"

A slice is **2–4 hours** of work that ends in something **visible, runnable, and testable**.

A slice has:

- A slice ID (e.g. `R004`, `F1.2`)
- A one-sentence goal
- A list of files to create or modify
- 2–5 acceptance criteria
- A verification path: `npm run test:headless` for logic changes, browser reload + console check for UI changes

**One slice per session.** Do not start the next slice in the same session, even if there is time left.

---

## The seven-step session flow

The flow is strict. Two of the steps **require the user to confirm before continuing**: after step 1 (Orient) and after step 3 (Plan). Do not proceed past those two checkpoints without explicit user confirmation.

### Step 1 — Orient

Before touching any code, read in this order:

1. `CLAUDE.md` — full file
2. `PROGRESS.md` — last 2–3 entries to see where the previous session ended
3. `REGRESSIONS.md` — the Open section, in full
4. `NEXT_SESSION.md` — the brief for the slice about to be picked up
5. The relevant section of `IMPLEMENTATION_PLAN.md` for the current slice
6. The relevant section of `GAME_DESIGN.md` only if the slice touches design intent (combat math, hero effects, payroll, rivals, run flow)
7. Any source files that will be read or modified in this slice

Then summarize back to the user in 4–6 lines:

- Current slice ID and name
- What the previous session completed
- What files exist that are relevant to this slice
- Any open regressions that might block or interact with this work
- The acceptance criteria for this slice as you understand them

**Stop here and wait for the user to confirm the orientation is correct.** Do not move on to step 2 until they do.

### Step 2 — Pick up work

The user will indicate one of:

- **(a)** A regression from `REGRESSIONS.md` to fix
- **(b)** The slice described in `NEXT_SESSION.md`
- **(c)** A specific named slice

If none is clear, ask. Do not guess.

If the chosen slice fails the **Definition of ready** (see `CLAUDE.md`), stop and work with the user to bring it to ready. Do not start implementing an under-specified slice.

### Step 3 — Plan

Before writing any code, output a plan with these sections:

- **Files to create** — full paths
- **Files to modify** — full paths plus a one-line description of the change
- **Files explicitly NOT touched** — anything the user might reasonably expect to be touched but should not be (forces an explicit scope check)
- **Rules from `CLAUDE.md` that apply** — name the specific sections (e.g. "§Architectural rules: combat is deterministic, no `Math.random()`")
- **Scope check** — does anything in this plan touch files outside the current slice, or violate any item in `CLAUDE.md` §Scope control? If yes, stop and ask.
- **Open questions** — anything ambiguous. List them as numbered questions so the user can answer in line.

**Stop here and wait for the user to confirm the plan.** Do not start implementing until they do.

### Step 4 — Implement

Write the code. Stay inside the plan. If you discover you need to change a file that wasn't in the plan, stop and ask before doing it.

Conventions live in `CLAUDE.md` §Coding conventions. The big ones:

- ES module syntax, 2-space indent, `PascalCase` classes / `camelCase` everything else, `_` prefix for private fields.
- One class per file, file name = class name.
- No `Math.random()` — use `runManager.rng`.
- No async/await in combat.
- No third-party libraries.

### Step 5 — Verify

For **logic** slices (anything under `web/src/core/`, `web/src/data/`, `web/src/run/`, `web/src/combat/`):

```sh
cd web
npm run test:headless
```

Should report `ALL PASS` for all three suites (57 checks total). If a test fails because the *test* was wrong, fix the test; if a test fails because the *code* is wrong, fix the code.

For **UI** slices (anything under `web/src/ui/` or `web/styles/`):

- Reload the browser preview (or relaunch Electron).
- Click through the affected screens.
- Open the dev console — there should be zero errors and zero warnings.

For **both** kinds of slice, drive a quick end-to-end run via the autopilot in `web/src/test/run.js` (or in the browser console) to confirm nothing else broke.

### Step 6 — Wrap

At the end of the session, in **this order**:

1. Summarize: files added/changed, acceptance criteria results, deviations.
2. Update `PROGRESS.md` — append a new entry for this slice at the top of the active section. Keep it short (3–8 lines).
3. Update `REGRESSIONS.md` — if you fixed a regression, move it to Closed with today's date and the slice ID; if you discovered a new one, add it to Open.
4. Rewrite `NEXT_SESSION.md` for the slice the user wants to pick up next. If unclear, ask.
5. If the slice changed architecture or added/removed a major piece, update `IMPLEMENTATION_PLAN.md` §3 (folder layout) or §4 (architectural contracts).

### Step 7 — Hand off

Tell the user the session is complete and the wrap docs are updated. Do not start the next slice.

---

## Tooling shortcuts

- **Browser dev (no Node):** `python web/serve.py` → <http://localhost:5173>. Iteration = save → reload.
- **Native window:** `cd web && npm start` (after `npm install`).
- **Tests:** `cd web && npm run test:headless`.
- **DevTools alongside Electron:** `DUNGEONDEBT_DEVTOOLS=1 npm start`.
- **Debugging from the page:** `dd.gm` (the live GameManager) and `dd.ui` (the live UIManager) are exposed on `globalThis` by `web/src/main.js`.

---

## When in doubt

- If `CLAUDE.md` and `IMPLEMENTATION_PLAN.md` agree, follow them.
- If they disagree, stop and ask.
- If the user gives an instruction that contradicts either, double-check by quoting the conflicting rule before proceeding.
- If a request feels out-of-scope, quote `CLAUDE.md` §Scope control and ask for explicit override.
