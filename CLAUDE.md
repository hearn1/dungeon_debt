# CLAUDE.md

This file gives Claude Code the context it needs to work on **Dungeon Debt** — a small Unity prototype. Read it fully before making changes. The two source-of-truth documents are:

- `GAME_DESIGN.md` — the design intent. Do not contradict it.
- `IMPLEMENTATION_PLAN.md` — the technical plan. Do not deviate without asking.

If those two documents conflict, ask before resolving.

---

## What this project is

**Dungeon Debt** is a single-player 2D fantasy auto-battler economy roguelite prototype built in Unity. The player recruits heroes, positions them in a 5-slot formation, picks payroll risks, fights through a 10-round dungeon, and tries to avoid debt bankruptcy.

The core loop per round: **Scout → Shop → Payroll Choice → Formation → Auto-Combat → Reward → Upkeep → Rival Update**.

It is intentionally small. Target: a playable prototype in 2–4 weeks.

---

## Project status

M1–M7 are complete. The project now has a playable end-to-end prototype with run flow, shop, formation, payroll, scout, 10 encounters, hero/enemy effects, rival ghosts, and leaderboard.

Current phase: **Phase 3** — vertical expansion after the playable Phase 2 prototype. This file documents repository rules and setup; the active slice is tracked in `NEXT_SESSION.md` and scoped by `IMPLEMENTATION_PLAN.md` §16.

---

## Core tech decisions (locked)

These are not up for debate. If you think one is wrong, raise it as a question — do not silently change it.

- **Unity 6.4 (`6000.4.x`)**, Universal 2D template
- **Single scene** (`Assets/Scenes/Main.unity`) with panels toggled by `UIManager`
- **uGUI** (Canvas + RectTransform + TextMeshPro), **not** UI Toolkit
- **Mouse-only** input via uGUI buttons. No new Input System, no keyboard shortcuts
- **1920×1080** reference resolution, 16:9 only
- **Windows Standalone** + Editor Play mode. No WebGL, no mobile
- **Hardcoded C# static data** in `DataRepository` for MVP. **No ScriptableObjects**, no JSON, no Resources/ in the first prototype. (Unchanged by M10: the M10.4 `SpriteCatalog` is a scene **MonoBehaviour** with serialized id→Sprite slots, not a ScriptableObject, and holds presentation art only — no gameplay data. See `IMPLEMENTATION_PLAN.md` §15 M10.4.)
- **No save/load**, no persistence, no accounts
- **One `System.Random` instance** owned by `RunManager`. Never use `UnityEngine.Random`
- **Placeholder art only** for MVP (M1–M7): white sprites, TMP text, solid color blocks. Phase 2 (see §Scope control) allows trivial shapes, role-icon glyphs, and a small placeholder sprite set under `Assets/Art/`. M10 additionally allows one static base sprite per hero/enemy and a **small shared** combat-effect sprite set (5 sprites), plus generic coded source→target motion — see §Scope control Phase 2 carve-out 3 and `IMPLEMENTATION_PLAN.md` §15 M10.4/M10.5

---

## Folder structure (target)

Create files in these locations. Do not invent new top-level folders.

```
Assets/
├── Scenes/Main.unity
├── Scripts/
│   ├── Core/        — GameManager, GameState, DataRepository, GameRules
│   ├── Data/        — all plain C# data classes (HeroDefinition, RunState, etc.)
│   ├── Run/         — RunManager, ShopManager, PayrollManager, EncounterManager, RivalManager
│   ├── Combat/      — CombatManager, CombatLogger, HeroEffects
│   └── UI/          — UIManager + all panel/view scripts
├── Prefabs/         — HeroCard, FormationSlot, ShopOffer, EnemyCard, CombatLogLine
└── Art/             — empty in MVP
```

No `Resources/`, no `StreamingAssets/`, no `Tests/`, no `Editor/`.

Repo root also contains workflow files (not inside `Assets/`):

- `GAME_DESIGN.md`           — design intent (source of truth)
- `IMPLEMENTATION_PLAN.md`   — technical plan (source of truth)
- `CLAUDE.md`                — project rules (this file)
- `SESSION_PROTOCOL.md`      — the per-session workflow
- `NEXT_SESSION.md`          — the brief for the next session
- `PROGRESS.md`              — append-only session log
- `REGRESSIONS.md`           — open and closed bug log
- `TestPlans/TP_<slice>.md`  — manual test plans, one per slice

---

## Coding conventions

- **C# naming:** PascalCase for types/methods/properties, camelCase for locals/parameters, `_camelCase` for private fields. Constants are `PascalCase`.
- **No `var`** for primitive types; OK for obvious types (`var list = new List<HeroInstance>()`).
- **No LINQ in combat hot paths.** Combat is small enough that allocation-free `for` loops are clearer anyway. LINQ is fine in UI / setup code.
- **No async/await.** Combat resolves synchronously into a `CombatResult`; the log is replayed to UI with simple coroutines if delay is needed.
- **No exceptions for control flow.** Use return values and explicit checks.
- **`[SerializeField] private`** for inspector fields, not `public`.
- **One class per file.** File name == class name.
- **Tabs vs spaces:** 4 spaces, no tabs. Unix line endings.
- **Comments:** explain *why*, not *what*. Skip obvious comments.
- **`Debug.Log` is fine** for development. Don't leave noisy logs in committed code; gate verbose logs behind a `const bool VerboseLogging = false`.

---

## Architectural rules

- **`GameManager` owns `GameState`.** All state transitions go through `GameManager.ChangeState(GameState)`. No script changes state directly except via this method.
- **`UIManager` listens to state changes** and toggles panels. Panels do not show/hide themselves.
- **Managers reference each other directly** via `GameManager`. No event bus, no service locator, no DI container, no Zenject.
- **`DataRepository` is read-only** and static. It holds all `HeroDefinition`, `EnemyDefinition`, `EncounterDefinition`, `PayrollActionDefinition`, and rival profile data.
- **`GameRules` holds all numeric constants.** When tuning, edit `GameRules.cs`, not magic numbers scattered through logic.
- **`HeroEffects` is a static class** with one method per `HeroEffectId`. `CombatManager` and `RunManager` call into it at named hook points (`OnCombatStart`, `OnAttack`, `OnKill`, `OnEndOfCombatRound`, `OnCombatEnd`, `OnUpkeepCalculated`).
- **Definitions are immutable; instances are mutable.** `HeroDefinition` is a template; `HeroInstance` is what's in the party.
- **Combat is deterministic.** Avoid randomness in combat resolution. Tie-breaking uses leftmost-slot, not random selection.

---

## Workflow for any new task

1. **Identify the milestone.** What milestone (M1–M7 in §11 of the plan) does this work belong to? If it spans multiple, stop and ask.
2. **Re-read the relevant sections** of `IMPLEMENTATION_PLAN.md`. The Appendix at the end of the plan maps milestones to sections.
3. **List files to be created or changed** before writing code. Confirm the list matches the milestone's "Files/scripts" section.
4. **Implement.** Stay inside the milestone scope. If you discover a needed change outside the milestone, note it and ask.
5. **Run the milestone's manual test steps** mentally or in the Unity Editor. Report results.
6. **Do not start the next milestone** without explicit confirmation.

---

## Definition of ready (before starting a slice)

A slice is not ready to start until **all** of these are true:

1. It has a slice ID (e.g. `M1.2`)
2. It has a one-sentence goal
3. Files to create or modify are listed in writing (in `NEXT_SESSION.md` or in chat)
4. 2–5 acceptance criteria are written
5. No open 🔴 Blocker regressions in `REGRESSIONS.md` would be invalidated by this work

If any of these are missing, the first task of the session is to define them with the user — not to start coding.

For the full per-session flow, including the two confirmation checkpoints (after Orient and after Plan), see `SESSION_PROTOCOL.md`.

---

## Scope control (read this every session)

From `IMPLEMENTATION_PLAN.md` §14. These are hard limits.

**Phase 2 carve-outs (post-M7, see `IMPLEMENTATION_PLAN.md` §15):** Three rules below are amended for Phase 2.

- Trivial shapes, role-icon glyphs, and a small placeholder sprite set under `Assets/Art/` are allowed for UI work. No tweens, no animation frames, no rigged characters.
- Bronze→Silver hero tiering is in scope (M9 only). No Gold tier. Tiering does **not** introduce equipment, traits, factions, or synergies.
- **M10 sprite + effects pipeline (M10.4/M10.5 only, see `IMPLEMENTATION_PLAN.md` §15):** allowed — (a) exactly one static base sprite per hero (12) and per enemy (16); (b) a **small shared** combat-effect sprite set, capped at 5 sprites (`melee_stab`, `arrow`, `fireball`, `heal`, `enchant`), reused by all units by category; (c) a presentation-only `SpriteCatalog` MonoBehaviour with serialized id→Sprite slots; (d) generic coded combat motion that moves a shared effect sprite source→target via RectTransform offsets, synced to the existing replay. Still **not** allowed: per-hero / per-enemy / per-effect unique attack art, more than the 5 shared effect sprites, multi-frame or rigged animation, any tween library (DOTween/LeanTween), Unity `Animator`, particles, VFX, screen shake, or audio. Per-unit-unique art is deferred post-M10 and out of MVP unless re-ratified.

All other rules below remain in force for Phase 2.

**Phase 3 carve-outs (post-M11, see `IMPLEMENTATION_PLAN.md` §16):** Only the explicitly selected Phase 3 milestone is in scope. For M12, debt rework/readability is approved: debt thresholds, interest divisor, debt-status labels, existing UI summaries, and the M12.1 Shop Pay Debt recovery control may change. Acts, loot/relics, XP/veterancy, difficulty modes, and combat status keywords remain out of scope until their own milestones are selected.

All other rules below remain in force for Phase 2 and Phase 3.

- **Do not add extra heroes** beyond the 12 in §7 of the plan
- **Do not add equipment, items, or inventory**
- **Do not add traits, factions, or synergies** beyond the listed role labels
- **Do not add animations** beyond simple UI feedback (color flashes, button hovers) — *except* the M10.5 generic source→target effect-sprite motion permitted by Phase 2 carve-out 3 above
- **Do not add tweens** (no DOTween, no LeanTween) — the M10.5 carve-out is hand-coded RectTransform interpolation only; no tween library, no `Animator`
- **Do not add save/load**
- **Do not add procedural maps** or branching paths
- **Do not add real multiplayer, online ghosts, leaderboards, or accounts**
- **Do not add meta progression**, unlocks, persistent currency
- **Do not refactor into a larger architecture** (no ECS, no DI, no event bus) prematurely
- **Do not add audio polish** (music, voice, ambient SFX)
- **Do not add localization** — English only
- **Do not expand combat** with crit, dodge, types, statuses, or buffs beyond what's listed
- **Do not add a tutorial**
- **Do not add screen shake, particles, or VFX** beyond color flashes
- **Do not add features** "while you're at it." If you finish a milestone early, polish UI, fix bugs, replay full runs

If a request seems to violate one of these, respond with: *"Out of scope for MVP per IMPLEMENTATION_PLAN.md §14. Skip it, or update the plan first."*

---

## How to ask good questions

Prefer to ask before doing when:

- The design doc and plan disagree
- A milestone's scope is ambiguous
- A "small improvement" would touch files outside the current milestone
- A required Unity asset (sprite, font, prefab) doesn't exist yet
- A hero or enemy effect could be implemented multiple reasonable ways

Don't ask before doing when:

- The plan clearly specifies the implementation
- It's a typo, naming, or formatting fix
- It's an obviously correct bug fix inside the current milestone's files

---

## Milestone shortcut reference

When the user asks for "the next milestone" or names one by number, here's what's in scope. Full details in `IMPLEMENTATION_PLAN.md` §11.

| # | Name              | Output |
|---|-------------------|--------|
| 1 | Combat Sandbox    | One hardcoded combat resolves with a streaming log, win/loss result |
| 2 | Run State         | Gold/debt/morale/round, reward/upkeep/interest math, loss conditions |
| 3 | Shop & Party      | 12 heroes in DataRepository, shop UI with hire/fire/reroll |
| 4 | Formation         | 5-slot drag/click formation, frontline targeting |
| 5 | Payroll Actions   | 4 payroll cards with pre/post-combat effects |
| 6 | Full 10-Round Run | All encounters + all hero effects + scout panel + end screens |
| 7 | Rival Ghosts      | 3 rivals, leaderboard, ghost fights on rounds 3/6/9 |
| 8 | Card readability pass | Hero/enemy card layouts with role color, stats, blurb, reserved tier slot |
| 9 | Bronze→Silver tiering | Duplicate-hire merges to Silver; Silver offers in shop; per-hero Silver bonus |
| 10 | Combat view rebuild | Unit-card combat panel with HP bars and turn highlighting |
| 11 | Economy & balance pass | Tune resource curves and Silver tier probability |
| 12 | Debt rework/readability | Debt-status tiers, Shop repayment, clearer interest/debt warnings |

Each milestone must pass its acceptance criteria before the next begins.

---

## Common pitfalls to avoid

- **Don't use `UnityEngine.Random`.** Use the `System.Random` owned by `RunManager`.
- **Don't make panels show/hide themselves.** That's `UIManager`'s job.
- **Don't put game logic in panel scripts.** Panels are presentation only — they read state and raise events.
- **Don't put magic numbers in logic files.** Add a constant to `GameRules.cs`.
- **Don't make hero effects subclasses or virtual methods.** Use the static `HeroEffects` class keyed by `HeroEffectId` enum.
- **Don't use coroutines for combat simulation.** Combat is synchronous; only the log replay to UI is timed.
- **Don't make `HeroDefinition` mutable.** Mutate `HeroInstance` instead.
- **Don't permadeath heroes.** Dead-in-combat heroes are restored for the next round in MVP.
- **Don't create `Assets/Tests/` or any NUnit / PlayMode test folder.** Tests for this project are manual test plans in markdown under `TestPlans/`, one per slice. Unity Test Framework is out of scope for the MVP. This explicitly overrides the optional EditMode test note in `IMPLEMENTATION_PLAN.md` §13 — skip it.
- **Don't update `PROGRESS.md` or `REGRESSIONS.md` mid-session.** Both are updated only at the end of a session as part of the summary step, so the in-flight state of a session doesn't pollute the history.
- **Don't start a new slice in the same session as a completed one.** One slice per session. Stop, hand off, let the user verify before continuing.
- **Don't create Input System Action assets or `.inputactions` files.** UI input is uGUI button `onClick` only. Unity 6 ships the new Input System enabled by default and an auto-created `EventSystem` uses `InputSystemUIInputModule` to route uGUI events — that is expected and fine. The rule is only about not authoring Action assets for the project's own input.

---

## What "done" looks like for a milestone

A milestone is done when:

1. All files listed in its "Files/scripts" section exist and compile
2. All acceptance criteria pass
3. All manual test steps pass in the Unity Editor
4. No out-of-scope features were added
5. No unrelated files outside the milestone were modified
6. The user has confirmed they're ready to move on

Report a short summary at the end of each milestone:
- Files added/changed
- Acceptance criteria results
- Any deviations from the plan (and why)
- Anything flagged for follow-up
