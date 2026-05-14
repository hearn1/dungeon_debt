# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M3.1 - DataRepository expansion to the full 12 heroes

**Milestone:** M3 - Shop and Party
**Slice goal:** Expand `DataRepository` from the 5 sandbox heroes used by M1/M2 to the full set of 12 heroes specified in `IMPLEMENTATION_PLAN.md` §7, including each hero's role, attack, HP, upkeep, effect description, and `HeroEffectId`. **No shop UI, no hire/fire, no reroll, no party slot UI, no payroll, no formation editing, no rivals, no save/load, no new combat rules yet.**

This slice is data-only. It sets up the roster the shop slice (M3.2) will draw from. The M1/M2 sandbox flow (4-hero party fighting the sandbox encounter) must keep working unchanged.

### Acceptance criteria

1. `DataRepository.AllHeroes` returns all 12 heroes defined in `IMPLEMENTATION_PLAN.md` §7, in plan order, exposed as an immutable read-only list.
2. Each new `HeroDefinition` uses the exact stats, role, upkeep, description, and `HeroEffectId` from the plan; no values are guessed or fudged.
3. Any new `HeroEffectId` enum values required by the plan exist in `GameEnums.cs`, but their implementations in `HeroEffects.cs` remain no-ops for this slice (M3.1 is data-only).
4. M1.3 / M2.x sandbox flow still works: `DataRepository.CreateSandboxRun()` continues to build the existing 4-hero sandbox party, combat runs unchanged, and previous test plans still pass.
5. No shop, hire/fire/reroll, party editing UI, payroll, formation, scout, rival, save/load, new encounter, run economy, or combat rule changes are introduced.

### Files Claude Code creates

```
TestPlans/TP_M3.1.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Core/DataRepository.cs
DungeonDebt/Assets/Scripts/Data/GameEnums.cs
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs
```

- Modify `DataRepository.cs` to define the 7 additional heroes and add them to `AllHeroes` while keeping `CreateSandboxRun()` untouched.
- Modify `GameEnums.cs` only to add any missing `HeroEffectId` values required by the plan's 12 heroes.
- Modify `HeroEffects.cs` only if a new no-op case must be wired into the static dispatch surface so the project compiles; do not implement non-MVP effect logic.

### Files Claude Code does NOT create or modify

- Any shop, payroll-choice, formation-editing, scout, rival, save/load, or persistence behavior.
- Any combat rule, targeting, damage formula, randomness source, or status/buff/crit/dodge logic.
- Any UI script (`MainMenuPanel`, `RunHeaderView`, `RewardSummaryView`, `EndScreenView`, `CombatLogView`).
- Any run-state economy file (`RunManager`, `GameRules`, `RunState`).
- Any imported sprites, fonts, audio, animation assets, or prefab polish.
- Any `Resources/`, `StreamingAssets/`, `Tests/`, or `Editor/` folders.
- Any Unity Test Framework, NUnit, PlayMode, or EditMode test assets.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 7 - Hero roster (the full 12 heroes), exact stats and effect IDs.
- `IMPLEMENTATION_PLAN.md` Section 4 - `HeroDefinition` shape.
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 3.
- `IMPLEMENTATION_PLAN.md` Section 12 - Recommended script list for `DataRepository` and `HeroEffects`.
- `GAME_DESIGN.md` Heroes section only as needed for role/effect intent.

### Notes from previous slice

- M2.3 added the end-screen flow, run outcome evaluation, and round advance. `GameRules.FinalRound = 10` was added with explicit confirmation.
- The sandbox party in `DataRepository.CreateSandboxRun()` must remain unchanged so M1/M2 test plans continue to pass.
- The existing 5 heroes (Warrior, Squire, Wizard, Ranger, Priest) are already defined and should not be duplicated or renamed.
- The sandbox UI still uses legacy uGUI `Text` (no TMP). Nothing in this slice should touch UI, so this remains a non-issue.

### Test plan output

Claude Code creates `TestPlans/TP_M3.1.md` covering at minimum:

- **Happy path:** Inspect `DataRepository.AllHeroes` count and order via a brief temporary probe (with exact code to add and revert) or by source inspection if no scene UI exists yet; verify all 12 heroes match the plan.
- **Field-by-field checks:** For each of the 12 heroes, confirm role, attack, HP, upkeep, description, and `HeroEffectId` match `IMPLEMENTATION_PLAN.md` §7.
- **Rule checks:** No new combat rules, no UI changes, no forbidden folders, no Input System action assets, hero definitions remain immutable (`get`-only properties via constructor).
- **Regression checks:** M1.3 sandbox combat still resolves identically; M2.1 header init unchanged; M2.2 reward summary still correct; M2.3 continue/end-screen flow still reaches Victory/Defeat as in TP_M2.3.
- **Observable invariants:** `AllHeroes` count is exactly 12; no duplicate hero IDs; existing 5 heroes appear in the same order they did before; `CreateSandboxRun` still produces a 4-hero party.

Every temporary setup step must include exact file/method/value changes to make the scenario testable, then instruct the tester to revert those temporary changes before continuing.

Each step in the test plan must follow the checkbox format from `SESSION_PROTOCOL.md` step 6:

```
- [ ] Step N. <Action - what the user clicks or does>
      Expected: <Specific observable result, including UI or Console state>
      Actual:
```

### Start prompt for the next session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
