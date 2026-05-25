# AGENTS.md

This file is the entry point for Codex Code (and any other LLM coding agent) working on **Dungeon Debt**.

## Read `CLAUDE.md` first

The full project rules — tech stack, folder layout, coding conventions, architectural rules, scope control, common pitfalls — live in [`CLAUDE.md`](./CLAUDE.md). Everything in that file applies to you. There is no Codex-specific exception.

Then read the rest of the orientation set listed in [`SESSION_PROTOCOL.md`](./SESSION_PROTOCOL.md) §Step 1.

## Source-of-truth documents

- [`GAME_DESIGN.md`](./GAME_DESIGN.md) — design intent. Do not contradict it.
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — current technical state and open follow-up list. Do not deviate without asking.

If those two ever conflict, ask before resolving.

## ## Environment setup

Node.js is installed at `C:\Program Files\nodejs\` but the directory may not be on `PATH` in all shells. Before running any node/npm command, ensure:

```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
```

Use `npm.cmd` (not `npm`) because PowerShell execution policy blocks `npm.ps1`:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run test:headless
```

Or after adding to `$env:PATH`:

```powershell
npm.cmd run test:headless
```

## Where to start

- The brief for the next slice is in [`NEXT_SESSION.md`](./NEXT_SESSION.md).
- Open bugs live in [`REGRESSIONS.md`](./REGRESSIONS.md).
- The per-session workflow (Orient → Plan → Implement → Verify → Wrap) is in [`SESSION_PROTOCOL.md`](./SESSION_PROTOCOL.md). Both Plan and Orient have explicit user-confirmation checkpoints — do not skip them.

## Project shape (one paragraph)

Dungeon Debt is a single-player turn-based auto-battler economy roguelite built as an Electron + vanilla-JavaScript app. The game logic and UI live under `web/`. There is no bundler, no framework, no TypeScript. Iteration is save → reload. Full details in `CLAUDE.md`.
