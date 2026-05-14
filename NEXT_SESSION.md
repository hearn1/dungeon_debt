# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M3.2 - ShopManager and shop UI (offer generation, hire, fire, reroll)

**Milestone:** M3 - Shop and Party
**Slice goal:** Add a `ShopManager` that generates 3 distinct random `ShopOffer`s from `DataRepository.AllHeroes` and a minimal `ShopPanelView` that lets the player Hire (deducts gold, adds to party), Fire (refunds 1 gold, removes from party), and Reroll (-2 gold, new offers). The shop replaces the existing direct sandbox-combat entry: after Start Run, the player goes to Shop, then Continue → straight to Combat with the player-built party (skip Payroll and Formation for now; use default Standard Pay and slot-order-of-hire formation). **No payroll-choice UI, no formation editing UI, no scout panel, no rivals, no new encounters, no new combat rules.**

### Acceptance criteria

1. Entering `Shop` state generates exactly 3 `ShopOffer`s drawn without replacement from `DataRepository.AllHeroes`, using `RunManager.Rng`. No `UnityEngine.Random`.
2. Hire button: deducts `Hero.BaseUpkeep + GameRules.HireCostBonus` from gold, adds a new `HeroInstance` to `RunState.Party` (max `GameRules.MaxPartySize`), and the offer is marked purchased and disabled. Disabled when gold < cost or party is full.
3. Fire button on a party member: removes the hero from `RunState.Party` and refunds `GameRules.FireRefund` gold.
4. Reroll button: deducts `GameRules.RerollCost` gold and rerolls all unpurchased offers (purchased offers remain locked). Disabled when gold < `RerollCost`.
5. Continue from Shop advances to Combat (skipping Payroll and Formation in this slice). Player-built party is what fights. M1/M2 round/upkeep/reward/end-screen flow continues to work.
6. No payroll choice UI, no formation editing UI, no scout, no rival, no new encounter content, no hero/enemy effect implementations.

### Files Claude Code may create

```
DungeonDebt/Assets/Scripts/Run/ShopManager.cs
DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs
DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs
DungeonDebt/Assets/Scripts/UI/HeroCardView.cs
TestPlans/TP_M3.2.md
```

### Files Claude Code may modify

```
DungeonDebt/Assets/Scripts/Core/GameManager.cs
DungeonDebt/Assets/Scripts/Run/RunManager.cs
DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs
```

- `GameManager.cs` - route `StartRun` to `Shop` (instead of directly into combat), and route Continue-from-Shop to Combat.
- `RunManager.cs` - expose `Rng`, replace `PrepareSandboxParty` usage with the player-built party, drive shop offer generation through `ShopManager`.
- `MainMenuPanel.cs` - present the shop panel on `Shop` state and start combat from the player-built party on Continue.

### Files Claude Code does NOT create or modify

- Payroll, formation-editing, scout, rival, save/load, encounter content, hero/enemy effect logic.
- `DataRepository.cs` (M3.1 finished the data side).
- `GameRules.cs` unless a missing shop constant is genuinely required (Hire/Fire/Reroll constants already exist).
- Any imported sprites, fonts, audio, animation assets, or prefab polish.
- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/`.
- `PROGRESS.md` or `REGRESSIONS.md` during implementation.

### Relevant plan sections to re-read during Orient

- `IMPLEMENTATION_PLAN.md` Section 3 - Shop state behavior.
- `IMPLEMENTATION_PLAN.md` Section 4 - `ShopOffer`, `RunState.RerollCount`.
- `IMPLEMENTATION_PLAN.md` Section 5 - Hire cost, reroll cost, fire refund constants.
- `IMPLEMENTATION_PLAN.md` Section 10 - `ShopPanelView`, `ShopOfferView`, `HeroCardView` panel responsibilities.
- `IMPLEMENTATION_PLAN.md` Section 11 - Milestone 3 acceptance criteria.

### Notes from previous slice

- M3.1 added the full 12 heroes to `DataRepository.AllHeroes` in §7 plan order. All test plan cases passed.
- `CreateSandboxRun()` still exists but should be retired in M3.2 in favor of the player-built party. Confirm with the user before deleting it.
- All 11 needed `HeroEffectId` values already exist; new shop heroes hire successfully but their effects remain no-op until M6.
- Sandbox UI still uses legacy uGUI `Text` (no TMP). Shop UI should also use legacy `Text` for consistency.

### Test plan output

Claude Code creates `TestPlans/TP_M3.2.md` covering:

- **Happy path:** Start Run → Shop shows 3 distinct offers → Hire 1-3 heroes → Continue → Combat runs with the hired party.
- **Affordability and limits:** Hire button disabled at gold < cost; party full (5 heroes) disables all Hire buttons; Reroll disabled at gold < 2.
- **Hire/Fire math:** Hiring deducts exact cost (`BaseUpkeep + 2`); Firing refunds 1 gold and removes from party.
- **Reroll behavior:** -2 gold, unpurchased offers replaced; purchased offers stay locked.
- **Rule checks:** No `UnityEngine.Random`; offers drawn via `RunManager.Rng`; panels do not show/hide themselves (UIManager / state-driven); no out-of-scope features.
- **Regression checks:** M1.3 combat still resolves; M2.1 header math correct; M2.2 reward summary correct; M2.3 end-screen flow reaches Victory/Defeat.
- **Observable invariants:** exactly 3 offers always; party.Count ≤ 5; no duplicate hero ids in a single shop roll; gold never negative.

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
