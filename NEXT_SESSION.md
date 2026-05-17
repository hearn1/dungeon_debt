# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M20.0 - Act expansion design brief

**Milestone:** M20 - Act expansion foundation
**Slice goal:** Define the reusable act format, the Act 2 expansion target, the Acts 3/4/5 content pattern, guild-evolution rules, encounter-randomness approach, late-hire catch-up proposal, and the major-view design-proposal checklist - then leave M20.1 ready as the first implementation slice.

### Why this slice exists

M19.3 generalized the code seams so acts are now data-driven: act lengths live in `GameRules.ActRoundCounts`, encounters are keyed by `(act, slot)` with a pool/`RunManager.Random` selection seam, relic eligibility is `RivalGhost OR FinalBoss` (content-agnostic), rivals dispatch on the typed `RivalGuild` enum with a per-act roster seam (`DataRepository.GetRivalEncounter`), and the act-advance path is generalized (`AdvanceToNextAct`). The architecture can now express N acts of arbitrary length **without further feature work**. M20.0 decides the content shape that fills that architecture. **M20.0 is documentation-only** - no runtime C# changes.

### Confirmed design direction (from M19.3 user decisions)

- **Act 2 becomes a full 10-round act**, structurally parallel to Act 1 (Act 1 = rounds 1-10; Act 2 = rounds 11-20).
- **The Act 2 final boss is on round 20**, typed `EncounterType.FinalBoss`.
- **Final bosses award a relic** (already true via the M19.3 `RivalGhost OR FinalBoss` rule).
- Acts 3/4/5 (if pursued later) follow the same pattern and should be **mostly content authoring**: append a round count to `GameRules.ActRoundCounts`, add `(act, slot)` encounter definitions, assign existing enemy/effect/relic/status hooks, add per-act rival encounters via the existing `RivalGuild` seam, tune numbers.
- Each act should include **one fight against each rival guild** (Greedy, Frugal, Carry), evolving alongside the player: Greedy stays high-power/high-debt, Carry protects an escalating threat, Frugal stays efficient/resilient.
- Encounter randomness stays **non-combat only**: vary which encounter a slot serves from an act pool, or vary order within act constraints, using `RunManager.Random`. Combat itself stays deterministic.

### Scope

**In scope for M20.0 (documentation only):**
- Specify the reusable act format: how many dungeon vs rival vs boss slots, where the three guild fights sit, where the capstone sits, what scout/economy pressure beats recur.
- Specify the Act 2 round-11-to-20 content target at the level of slot purposes and enemy-reuse strategy (M19.3 already added Act2 enemy definitions for the current 3 rematch fights; decide how rounds 14-19 are populated - reuse/retune existing enemies vs a small number of new Act 2 enemy definitions, staying within scope limits).
- Decide the encounter-pool randomness rule for M20 (e.g. fixed order for guild/boss slots, optional pooled variants for dungeon slots).
- Write the guild-evolution rule per act (numeric growth direction, not final numbers).
- Write the late-hire catch-up proposal (e.g. act-aware minimum XP or trained-hire rule) - proposal only, no implementation, no new progression screen.
- Produce the major-view design-proposal checklist (Main Menu/Run Contract, Scout, Shop, Formation, Payroll, Combat, Reward Summary, Relic Reward, Rival Leaderboard/Update, End/Act Transition) and flag which views need a readability proposal before heavy act content lands.
- Leave M20.1 ready: concrete first implementation slice with ID, one-sentence goal, file list, and 2-5 acceptance criteria.

**Not in scope for M20.0:**
- Any runtime C# / scene / prefab / art change (documentation-only slice).
- Implementing Act 2 rounds 14-20, new enemies, new relics, or guild numbers.
- New independent verticals, save/load, online, meta progression, equipment/inventory, tutorial, audio, architecture rewrites, large hero-roster expansion.
- Starting M20.1 implementation in the same session.

### Definition of ready

- ID: M20.0.
- One-sentence goal: above.
- Files: listed below.
- Acceptance criteria: 4, below.
- No open Blocker regressions in `REGRESSIONS.md` block this work.

### Relevant plan/design sections

- `SESSION_PROTOCOL.md` seven-step session flow.
- `CLAUDE.md` scope control (Phase 3 carve-outs), architectural rules, definition of ready.
- `IMPLEMENTATION_PLAN.md` section 16: M19.1 expansion recommendation, M19.3 code-seam cleanup outcome, Milestone 20 direction and expected sub-slicing.
- `PROGRESS.md` latest M19 entries.
- `REGRESSIONS.md` Open section.
- `GAME_DESIGN.md` core hook, core loop, strategic tension, MVP scope, design-warning sections.

### Files Claude Code Should Read

```
SESSION_PROTOCOL.md
CLAUDE.md
REGRESSIONS.md
PROGRESS.md (latest M19/M20 entries)
NEXT_SESSION.md
IMPLEMENTATION_PLAN.md (section 16, M19.3 outcome + Milestone 20)
GAME_DESIGN.md
DungeonDebt/Assets/Scripts/Core/GameRules.cs        (ActRoundCounts + act helpers)
DungeonDebt/Assets/Scripts/Core/DataRepository.cs   (encounter (act,slot) keying, GetEncounterPool, GetRivalEncounter)
DungeonDebt/Assets/Scripts/Run/EncounterManager.cs  (pool lookup seam)
DungeonDebt/Assets/Scripts/Run/RunManager.cs        (AdvanceToNextAct, relic/end-of-act)
DungeonDebt/Assets/Scripts/Run/RivalManager.cs      (RivalGuild dispatch)
```

### Files Claude Code Should Create

```
None.
```

### Files Claude Code Should Modify

```
IMPLEMENTATION_PLAN.md - add the M20.0 act-format design outcome and the ready M20.1 slice definition.
NEXT_SESSION.md - rewrite for M20.1 as the first act-expansion implementation slice.
```

### Files Claude Code Does NOT Touch

- Any runtime C#, Unity scene, prefabs, art assets, project settings, generated Unity folders, or `.meta` files (documentation-only slice).
- `PROGRESS.md` / `REGRESSIONS.md` directly unless the user explicitly asks for end-of-session doc updates.
- New top-level folders, `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/`.
- `TestPlans/TP_M20.0.md` unless the user explicitly asks for a test-plan document.

### Acceptance criteria

1. The reusable act format is documented (slot roles, guild-fight placement, capstone placement, recurring pressure beats) and applied to the Act 2 = rounds 11-20 / round-20 FinalBoss target.
2. Guild-evolution direction, the M20 encounter-randomness rule, and the late-hire catch-up proposal are written down (directional, not final numbers), all consistent with `CLAUDE.md` scope control.
3. The major-view design-proposal checklist exists and flags which views need a readability proposal before heavy act content.
4. M20.1 is left ready: ID, one-sentence goal, explicit file list, and 2-5 acceptance criteria - and no M20 runtime content was added during M20.0.

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
