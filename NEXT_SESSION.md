# NEXT_SESSION.md

This file always describes the **next** session's work. Rewrite it at the end of every session as part of the summary step. The user pastes this (or references it) when starting a new Claude Code session.

---

## Session: M9.2 - Silver shop offers, Silver direct-hire cost, and per-hero Silver bonuses

**Milestone:** M9 - Bronze->Silver tiering
**Slice goal:** Land the second half of M9 per `IMPLEMENTATION_PLAN.md` §15: Silver offers can surface directly in the shop pool with a placeholder per-round probability, Silver direct-hire costs `BaseUpkeep + HireCostBonus + SilverHireCostBonus`, and the per-hero Silver bonus shape from the §15 table is wired into `HeroEffects` and stat reads. M9.1 already landed the data model, duplicate-hire merge, and tier-badge UI; M9.2 turns the stubbed bonuses on.

### Background

M9.1 (2026-05-15) shipped: `HeroTier` enum (Bronze, Silver), `HeroInstance.Tier` (default Bronze), `ShopManager.Hire` merge-to-Silver on duplicate of a Bronze-owned hero, `HeroCardView` populating the reserved tier slot with Bronze / Silver fill on instance-bound cards (Party, Formation), and a `ShopOfferView` button-label hint (`Upgrade (Xg)` / `Merges to Silver`). M9.1 also fixed an in-slice regression: `HeroInstance.CurrentHealth` is now restored to full in `CombatManager.FinishResult`, so Shop's Party list shows coherent HP between combats.

Per `IMPLEMENTATION_PLAN.md` §15 M9.1 explicitly stubbed all Silver bonuses ("Silver bonuses stubbed so existing combat math is unchanged"). M9.2 is where Silver finally changes numbers.

CLAUDE.md §Scope control Phase 2 carve-out: Bronze->Silver only, **no Gold tier**; tiering does **not** introduce equipment, traits, factions, or synergies. M11 (later) finalizes the tier-probability curve and the exact per-hero Silver bonus numbers; M9.2 wires the bonus *shape* using placeholder constants in `GameRules`.

### Acceptance Criteria (draft - finalize during Orient/Plan)

1. `ShopManager.FillAllOffers` can surface Silver offers directly (in addition to Bronze). The chance is gated by a placeholder probability constant in `GameRules` (e.g. `SilverOfferChance` or a per-round table; final curve is M11). Tier is set on the `ShopOffer` itself, not derived from party state.
2. Direct-hire of a Silver offer (not a duplicate merge) charges `BaseUpkeep + HireCostBonus + GameRules.SilverHireCostBonus` and creates a `HeroInstance` with `Tier = Silver` in the first empty formation slot. Party-cap, gold-cap, and "Silver-owned excluded from pool" rules still apply.
3. Per-hero Silver bonuses from `IMPLEMENTATION_PLAN.md` §15 are active: Stat heroes (Warrior, Ranger, Squire) get +Atk and/or +HP via tier-aware reads; Upkeep heroes (Golem, Wizard, Ninja) get reduced `UpkeepThisRound`; Effect heroes (Knight, Priest, Bard, Enchanter, Treasurer, Apprentice) get the §15 bonus shape (e.g. Knight redirects 2 backline hits, Priest heals 3/round, etc.). All numeric tunables live in `GameRules`.
4. Shop offer card visually indicates Silver-tier *offers* (not just Bronze-owned-duplicate offers) - minimum acceptable surface is the offer card showing the Silver fill in the M8.1 reserved tier slot (mirror of how Party/Formation work, but driven by `ShopOffer.Tier`).
5. No Gold tier. No equipment, traits, factions, or synergies. No new combat statuses/types. No `UnityEngine.Random`, tweens, audio/VFX, forbidden folders.

### Files Claude Code May Create / Modify

```
DungeonDebt/Assets/Scripts/Data/ShopOffer.cs                 - add a `Tier` field on the offer.
DungeonDebt/Assets/Scripts/Run/ShopManager.cs                - Silver offer surfacing via `_runManager.Random`, Silver direct-hire creates Silver instance, `SilverHireCostBonus` applied to direct-hire cost.
DungeonDebt/Assets/Scripts/Core/GameRules.cs                 - `SilverHireCostBonus`, `SilverOfferChance` (or equivalent placeholder), per-hero Silver bonus numeric tunables.
DungeonDebt/Assets/Scripts/Combat/HeroEffects.cs             - tier-aware effect hooks (Knight redirect count, Priest heal amount, Bard win gold, Enchanter aura scope, Treasurer upkeep reduction, Apprentice Wizard upkeep).
DungeonDebt/Assets/Scripts/Run/RunManager.cs                 - tier-aware stat seeding (Stat heroes' Attack/HP at round start) and tier-aware upkeep computation (Golem, Wizard, Ninja).
DungeonDebt/Assets/Scripts/UI/HeroCardView.cs                - if needed: `Refresh(HeroDefinition, HeroTier)` overload or equivalent so shop offer cards can render the offer's tier in the badge slot.
DungeonDebt/Assets/Scripts/UI/ShopOfferView.cs               - call the tier-aware HeroCardView refresh; the existing `isUpgrade` flag is for *Bronze-owned duplicates only*, so a separate tier-aware path is required.
DungeonDebt/Assets/Scripts/UI/ShopPanelView.cs               - feed offer tier through.
TestPlans/TP_M9.2.md
```

### Files Claude Code Does NOT Create or Modify

- `Resources/`, `StreamingAssets/`, `Tests/`, `Editor/` - forbidden folders.
- Anything Gold-tier, equipment, trait, faction, or synergy related.
- `CombatManager.cs`, `CombatLogger.cs` - unless a Silver bonus strictly requires a new hook surface (raise as a planning question if so; M9.1 already touched `CombatManager` for the unrelated CurrentHealth-restore regression).
- `EnemyDefinition.cs`, `EncounterDefinition.cs`, `DataRepository.cs` - tiering is hero-only.
- `HeroDefinition.cs` - stays immutable; tier lives on `HeroInstance` / `ShopOffer`.
- `PROGRESS.md` / `REGRESSIONS.md` mid-session unless user asks.

### Relevant Context To Re-read During Orient

- `IMPLEMENTATION_PLAN.md` §15 Milestone 9 - especially the per-hero Silver bonus table (Warrior...Apprentice) and the "M9.1 vs M9.2" expected sub-slicing block.
- `IMPLEMENTATION_PLAN.md` §15 Milestone 11 - confirms the Silver tier-probability curve and exact bonus numbers are M11's job, so M9.2 should use placeholder constants and resist over-tuning.
- `CLAUDE.md` §Scope control Phase 2 carve-out and §Architectural rules (HeroEffects is static + keyed by `HeroEffectId`; combat is deterministic).
- `PROGRESS.md` latest entries (M9.1, M8.2, M8.1).
- `ShopManager.cs` - the M9.1 merge branch + the `Silver-owned` exclusion. M9.2 introduces a third state: Bronze offer vs Silver offer vs duplicate-merge offer.
- `HeroEffects.cs` - existing per-effect hook points; tier-awareness probably reads `HeroInstance.Tier` inside each branch.
- `RunManager.cs` - where per-round `Attack` / `UpkeepThisRound` are seeded.

### Test Plan Output

`TestPlans/TP_M9.2.md` covering:

- **Happy path:** A Silver offer surfaces in the shop. Direct-hire pays the Silver cost and creates a Silver instance. The hired Silver hero applies its bonus in the next combat / upkeep (Stat: visibly higher ATK/HP; Upkeep: visibly lower upkeep; Effect: observably stronger hook - e.g. Knight redirects two hits, Priest heals 3 etc.).
- **Edge cases:** Silver offer when party is full (excluded by party-full just like Bronze direct-hire); player can't afford Silver cost (button disabled, status shows `Need Xg`); Silver-owned hero never re-appears as either a Silver offer or a Bronze offer; duplicate-merge path still works (Bronze-owned + Bronze offer + click `Upgrade` -> Silver) after M9.2 changes; Enchanter aura behavior change is observable on combat log.
- **Observable invariants:** every offer card visibly shows its tier (Bronze / Silver / reserved-empty for null); Silver heroes always cost more to direct-hire than Bronze; per-hero bonus is purely additive vs the Bronze baseline (no hidden penalties); switching a hero from Bronze to Silver between rounds (via duplicate-merge) changes the relevant stat/effect in the *very next* combat.

Include **Regression checks** for: (a) the M9.1 duplicate-merge path still merges Bronze->Silver with no slot growth, (b) `CombatManager.FinishResult` HP-restore still works (Shop Party panel shows full HP after a loss), (c) full 10-round run still completes Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> Upkeep without an end-condition regression. Name the specific seam each check protects.

### Open Questions To Raise During Orient/Plan

1. **Probability shape for `SilverOfferChance`.** §15 says "Tier probability per round is a placeholder constant in `GameRules`; the curve is finalized in M11." Is a single flat probability (e.g. 20% per offer) acceptable for M9.2, or do you want a round-aware ramp (e.g. 0% in R1-R3, 20% in R4-R7, 40% in R8-R10)? Recommendation: flat constant for M9.2, leave the curve for M11.
2. **Silver bonus number placeholders.** §15 only locks the *shape*. For Stat heroes the bonus is `+Atk, +HP` - is `+1 / +2` acceptable as the placeholder for all three? For Upkeep heroes (Golem, Wizard, Ninja) is `-1 upkeep` acceptable? Final numbers are M11.
3. **Should the shop offer card mid-stride show the offer's tier in the reserved slot?** AC4 above proposes yes (mirror of Party/Formation), but it requires touching `HeroCardView` to accept a tier alongside a definition. Acceptable, or keep offer cards' tier slot reserved-empty and surface tier only via button-label/status text?
4. **Treasurer Silver bonus shape.** §15 offers two alternatives: `-2 upkeep on top two allies` or `-3 on top one`. Pick one for M9.2 (M11 can revisit).
5. **`ShopManager.IsUpgradeOffer` cleanup.** M9.1 left this helper unreferenced. Delete it in M9.2 cleanup, or repurpose it for the tier-aware offer logic?

### Start Prompt For The Next Session

Open Claude Code in the repo root and paste:

> Read `SESSION_PROTOCOL.md` and follow it. The current slice is described in `NEXT_SESSION.md`. Start with step 1 (Orient) and wait for my confirmation before planning.
