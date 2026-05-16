# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M15.0 - Difficulty modifiers planning + first-slice definition

**Milestone:** M15 - Difficulty modifiers
**Slice goal:** Lock the difficulty-modifier design (preset roster, the exact existing-constant surface each preset shifts, selection UI placement, and default) and hand off a ready, narrowly-scoped M15.1 implementable slice. No gameplay code changes this session.

### Why this slice exists

Phase 3 vertical order (per `IMPLEMENTATION_PLAN.md` section 16) is M12 -> M13 -> M14 -> **M15 difficulty modifiers** -> M16 -> M17 -> M18+. M12-M14 are done: debt rework, Act 1 framing, and a proof-of-concept Act 2 mini vertical. M14.2 retest/tuning and broader Act 2 fight expansion were intentionally deferred - M14.1 already proved the run can reasonably carry into a second act.

M15 ("Difficulty modifiers") is a fresh vertical with open product decisions (which presets, what each preset changes, where the player picks one, what the default is). Following the M14.0 precedent, this session is a **planning slice**: resolve those decisions against scope and produce a Definition-of-ready M15.1, rather than coding an under-specified feature.

### What the milestone is (from IMPLEMENTATION_PLAN.md section 16, Milestone 15)

- **Goal:** add replayability and balance testing through small run-contract presets.
- **In scope:** presets such as Apprentice Ledger, Standard Contract, and Predatory Interest that modify existing `GameRules`-style constants through a small approved surface.
- **Out of scope:** unlocks, persistent progression, achievements, save/load, or online rankings.
- **Phase 3 scope rules that bind M15:** one vertical per milestone; reuse existing UI surfaces first (MainMenu, RunHeader, Scout, etc.) before new screens; keep `GameRules` as the tuning surface (new thresholds live there); no save/load or meta progression - each run remains a fresh session.

### Scope

**Approved for M15.0 (planning only):**
- Decide the preset roster (start from the three named in the plan: Apprentice Ledger / Standard Contract / Predatory Interest; confirm count and identity).
- For each preset, specify exactly which existing `GameRules` constants it shifts and to what values (e.g. starting gold/debt/morale, interest divisor, debt limit, reward/upkeep, Silver chance) - reuse existing constants; do not invent new gameplay systems.
- Decide the small approved application surface: a `DifficultyPreset` plain-C# data concept + a single application point at run init (`RunManager.InitializeRun`), driven by values sourced from `GameRules` (no scattered magic numbers).
- Decide the selection UI using an existing surface (recommended: a preset selector on the existing MainMenu before Start Run) and the default preset (recommended: Standard Contract = current balance, so default behavior is unchanged).
- Write a ready M15.1 brief: slice ID, one-sentence goal, files-to-create/modify list, 2-5 acceptance criteria.
- Update `NEXT_SESSION.md` to that ready M15.1 (end-of-session step).

**Not approved for M15.0:**
- No gameplay/UI code changes, no new files except this brief rewrite at end of session.
- No new combat/economy/debt systems, no new resources, no new content (heroes/enemies/encounters/acts), no save/load, no persistent unlocks, no achievements, no difficulty effects beyond shifting existing `GameRules` constants.
- No Act 2 expansion work (explicitly deferred).

### Definition of ready (for this planning slice)

- ID: M15.0.
- One-sentence goal: above.
- Files: none created/modified except `NEXT_SESSION.md` at end of session (and `PROGRESS.md` only if the user explicitly asks).
- Acceptance criteria: below.
- No open blocker regressions in `REGRESSIONS.md` (none currently open).

### Relevant plan/design sections

- `IMPLEMENTATION_PLAN.md` section 16: "Phase 3 vertical order", "Phase 3 scope rules", "Milestone 15: Difficulty modifiers".
- `IMPLEMENTATION_PLAN.md` section 5 (MVP rule definitions / numeric rules) and the existing `GameRules.cs` constant surface.
- `IMPLEMENTATION_PLAN.md` section 3 (state machine - where run init / a pre-run selection fits).
- `GAME_DESIGN.md` "MVP Scope" and economy/loss-condition sections.
- `CLAUDE.md` / `AGENTS.md` Scope control + Phase 3 carve-outs.

### Files Claude Code Should Read (planning inputs, do not modify)

```
IMPLEMENTATION_PLAN.md
GAME_DESIGN.md
CLAUDE.md
AGENTS.md
SESSION_PROTOCOL.md
REGRESSIONS.md
PROGRESS.md
DungeonDebt/Assets/Scripts/Core/GameRules.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Data/RunState.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs
```

### Files Claude Code Should Create / Modify

```
NEXT_SESSION.md   - end-of-session rewrite to the ready M15.1 brief.
(PROGRESS.md      - only if the user explicitly asks Claude Code to update it directly.)
```

### Files Claude Code Does NOT Touch

- Any gameplay/UI/data source file (this is a planning slice).
- `DungeonDebt/Assets/Scenes/Main.unity`, prefabs, `Assets/Art/**`.
- Files for save/load, unlocks, persistence, achievements, new content, or new systems.
- `REGRESSIONS.md` unless a new regression is found and the user asks to file it.

### Acceptance criteria

1. The M15 preset roster is decided and written down (identity + intent of each preset).
2. Each preset's exact existing-`GameRules`-constant deltas are specified, with no new gameplay systems or new resources introduced.
3. The application surface (a `DifficultyPreset` data concept applied once at run init, values rooted in `GameRules`) and the selection UI placement + default preset are decided, reusing an existing UI surface.
4. A Definition-of-ready M15.1 slice exists (ID, one-sentence goal, files list, 2-5 acceptance criteria) and `NEXT_SESSION.md` is rewritten to it.
5. No gameplay/UI code was changed this session; the project still builds with 0 warnings / 0 errors (unchanged).

### Planning prompts for M15.0

- Confirm the preset roster: exactly the three plan-named presets (Apprentice Ledger / Standard Contract / Predatory Interest), or a different count/identity.
- Confirm the default preset is Standard Contract = today's exact constants, so existing behavior and prior balance/test results are unchanged unless a harder/easier preset is picked.
- Confirm the selection UI lives on the existing MainMenu (a small preset toggle/buttons before Start Run) rather than a new screen.
- Confirm which constants are fair game per preset (starting gold/debt/morale, interest divisor, debt limit, win/loss reward, upkeep-related, Silver offer chance) and which are off-limits.
- Confirm whether the chosen preset name should be surfaced read-only in the run header for clarity (recommended, reuses an existing surface).

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
