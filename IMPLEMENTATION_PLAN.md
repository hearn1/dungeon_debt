# Dungeon Debt — Implementation Plan

This document is the **technical implementation plan** for the prototype defined in `GAME_DESIGN.md`. It does not redefine design intent; it locks down the engineering decisions, data shapes, milestones, and acceptance tests needed to ship a 2–4 week MVP using Unity with LLM-assisted coding (Codex / Claude Code).

The plan is intentionally scoped small. Do not expand it. When in doubt, cut.

---

## 1. Technical Assumptions

These are recommendations, not options. Use them unless a milestone explicitly overrides.

- **Unity version:** **Unity 6.4 (`6000.4.x`)**. Use the latest available patch in the 6000.4 line.
- **Project type:** **2D (URP)** template. We are UI-heavy but want one shared rendering pipeline in case we add minor sprite work or simple particle flashes.
- **Target platform:** **Windows Standalone (PC)** as primary. The game must also run in the Unity Editor's Play mode without modification. No mobile, no WebGL, no console.
- **Resolution:** Fixed reference resolution of **1920×1080**, Canvas Scaler set to "Scale With Screen Size" (Match: 0.5). 16:9 only.
- **Scene count:** **One scene** for the MVP, called `Main`. All states (menu, run, combat, results) are managed by panels toggled within this scene. A second scene is allowed only if the main scene becomes painful to edit.
- **Input style:** **Mouse only** via Unity UI (uGUI) buttons. No keyboard shortcuts, no gamepad, no new Input System.
- **UI framework:** **uGUI (Canvas + RectTransform)**. Not UI Toolkit. uGUI has better LLM coverage and easier prefab workflows.
- **Rendering:** **2D URP**. No post-processing, no lighting, no shaders beyond defaults.
- **Asset strategy:** **Placeholder only.** Use Unity's built-in `UISprite` (white square), TextMeshPro text, and solid color blocks. No purchased assets. No imported sprites in the first prototype unless trivial (e.g., one icon per role).
- **Data strategy:** **Hardcoded C# static lists in a `DataRepository` class** for the first prototype. Heroes, encounters, and rival profiles are defined as `static readonly` arrays of plain C# objects. **Do not use ScriptableObjects in MVP** — they add asset friction without payoff at this scale. If the data set grows past ~30 items per category, migrate to JSON files in `Resources/`. ScriptableObjects are deferred until after MVP.
- **Serialization / save:** **None.** Each run starts fresh. No persistence.
- **Randomness:** Single `System.Random` instance owned by `RunManager`, seeded from `DateTime.Now.Ticks`. No `UnityEngine.Random`. This makes future seeded-run debugging trivial.
- **Logging:** `Debug.Log` plus an in-game `CombatLogView`. No external logging libraries.
- **Testing:** Manual play tests per milestone. No Unity Test Framework in MVP.

---

## 2. Project Folder Structure

```
Assets/
├── Scenes/
│   └── Main.unity
├── Scripts/
│   ├── Core/
│   │   ├── GameManager.cs
│   │   ├── GameState.cs            (enum + state machine)
│   │   └── DataRepository.cs       (hardcoded heroes/encounters/rivals)
│   ├── Data/
│   │   ├── HeroDefinition.cs
│   │   ├── HeroInstance.cs
│   │   ├── EnemyDefinition.cs
│   │   ├── EncounterDefinition.cs
│   │   ├── RivalGuildState.cs
│   │   ├── RunState.cs
│   │   ├── CombatUnit.cs
│   │   ├── CombatResult.cs
│   │   ├── PayrollActionDefinition.cs
│   │   └── ShopOffer.cs
│   ├── Run/
│   │   ├── RunManager.cs
│   │   ├── ShopManager.cs
│   │   ├── PayrollManager.cs
│   │   ├── EncounterManager.cs
│   │   └── RivalManager.cs
│   ├── Combat/
│   │   ├── CombatManager.cs
│   │   ├── CombatLogger.cs
│   │   └── HeroEffects.cs          (static methods, one per hero)
│   └── UI/
│       ├── UIManager.cs
│       ├── MainMenuPanel.cs
│       ├── RunHeaderView.cs
│       ├── ScoutPanelView.cs
│       ├── ShopPanelView.cs
│       ├── ShopOfferView.cs
│       ├── PartyFormationView.cs
│       ├── EnemyFormationView.cs
│       ├── FormationSlotView.cs
│       ├── HeroCardView.cs
│       ├── PayrollPanelView.cs
│       ├── RivalLeaderboardView.cs
│       ├── CombatLogView.cs
│       ├── RewardSummaryView.cs
│       └── EndScreenView.cs
├── Prefabs/
│   ├── HeroCard.prefab
│   ├── FormationSlot.prefab
│   ├── ShopOffer.prefab
│   ├── EnemyCard.prefab
│   └── CombatLogLine.prefab
└── Art/
    └── (empty in MVP; placeholder white sprites only)
```

No `Resources/`, no `StreamingAssets/`, no `Tests/`, no `Editor/` in MVP.

---

## 3. Core Game State Machine

A single enum drives the state machine. `GameManager` owns the current state; `UIManager` listens for state changes and toggles panels.

```csharp
public enum GameState {
    MainMenu, StartRun, Scout, Shop, Payroll, Formation,
    Combat, Reward, Upkeep, RivalUpdate, Victory, Defeat
}
```

For each state:

### MainMenu
- **On enter:** Show main menu panel; hide everything else.
- **Visible UI:** `MainMenuPanel` (title, Start Run button, Quit button).
- **Allowed actions:** Click Start Run, click Quit.
- **Transition out:** Start Run → `StartRun`.

### StartRun
- **On enter:** `RunManager.InitializeRun()` resets `RunState` (gold=10, debt=0, morale=30, round=1, party=empty). Initialize 3 rival guilds. Build the 10-round encounter list.
- **Visible UI:** Brief "Run Starting…" overlay (or skip directly).
- **Allowed actions:** None (auto-transition).
- **Transition out:** Immediately → `Scout`.

### Scout
- **On enter:** `EncounterManager.LoadEncounter(round)`. Display scout info.
- **Visible UI:** Run header, Scout panel, Continue button. Rival leaderboard visible (compact).
- **Allowed actions:** Click Continue.
- **Transition out:** Continue → `Shop`.

### Shop
- **On enter:** `ShopManager.GenerateOffers()` rolls 3 random hero offers from `DataRepository.AllHeroes`.
- **Visible UI:** Run header, Shop panel (3 offers + Reroll + Continue), current Party panel (with Fire buttons).
- **Allowed actions:** Hire (if gold ≥ cost and party < 5), Fire hero (refund 1 gold), Reroll (cost 2 gold), Continue.
- **Transition out:** Continue → `Payroll`.

### Payroll
- **On enter:** Show 4 payroll action cards.
- **Visible UI:** Run header, Payroll panel (4 buttons), party preview.
- **Allowed actions:** Click exactly one payroll action.
- **Transition out:** Action selected → `Formation`. (Effect is recorded but applied at the correct phase: pre-combat for combat modifiers, post-combat for gold/debt changes.)

### Formation
- **On enter:** Show player's 5 slots and enemy formation preview.
- **Visible UI:** Run header, Party Formation panel, Enemy Formation panel (preview only), Start Combat button.
- **Allowed actions:** Drag/click heroes between the 5 slots (2 frontline, 3 backline). Click Start Combat.
- **Transition out:** Start Combat → `Combat`.

### Combat
- **On enter:** `CombatManager.StartCombat(party, encounter)`. Convert heroes and enemies to `CombatUnit` list. Run resolution.
- **Visible UI:** Player Formation, Enemy Formation, Combat Log (streaming). All buttons disabled.
- **Allowed actions:** None during resolution. After combat ends, "Continue" button appears.
- **Transition out:** Continue → `Reward`.

### Reward
- **On enter:** Apply gold rewards based on `CombatResult`. Apply encounter-specific reward modifiers (e.g., Treasure Leech survived → -4 gold). Apply payroll-action post-combat effects (loan debt, victory bonus cost, etc.). Apply morale damage if lost.
- **Visible UI:** Reward Summary panel showing gold gained, morale changes, payroll effects.
- **Allowed actions:** Continue.
- **Transition out:** Continue → `Upkeep`.

### Upkeep
- **On enter:** Calculate total upkeep (sum of party upkeep + encounter modifiers like Tax Collector's +2 + payroll modifiers like Cut Wages -3). Pay from gold; convert shortfall to debt. Calculate interest = `ceil(debt / 3)`; pay or add to debt. Check loss conditions.
- **Visible UI:** Upkeep Summary panel.
- **Allowed actions:** Continue.
- **Transition out:** If lose condition met → `Defeat`. Else → `RivalUpdate`.

### RivalUpdate
- **On enter:** `RivalManager.AdvanceRivals()`. Update each rival's payroll/debt/morale via scripted scaling.
- **Visible UI:** Full Rival Leaderboard panel.
- **Allowed actions:** Continue.
- **Transition out:** If round == 10 and final boss won → `Victory`. Else increment round and → `Scout`.

### Victory
- **On enter:** Show victory screen with final stats.
- **Visible UI:** `EndScreenView` (Victory variant) with Return to Menu button.
- **Allowed actions:** Return to Menu.
- **Transition out:** → `MainMenu`.

### Defeat
- **On enter:** Show defeat screen with reason (morale 0, debt 20, or boss loss) and final stats.
- **Visible UI:** `EndScreenView` (Defeat variant) with Return to Menu button.
- **Allowed actions:** Return to Menu.
- **Transition out:** → `MainMenu`.

---

## 4. Data Model

Every type below is a **plain C# class or struct**. No ScriptableObjects. Definitions are immutable; instances are mutable.

### HeroDefinition (plain C# class, immutable)
**Purpose:** Static template for one of the 12 heroes.
**Fields:**
- `string Id` — e.g., "warrior", "wizard"
- `string DisplayName`
- `HeroRole Role` (enum: Tank, Damage, Support, Economy)
- `int BaseAttack`
- `int BaseHealth`
- `int BaseUpkeep`
- `string EffectDescription`
- `HeroEffectId EffectId` (enum identifying which effect method to invoke)

### HeroInstance (plain C# class, mutable)
**Purpose:** A hero currently in the player's party.
**Fields:**
- `HeroDefinition Definition`
- `int CurrentHealth` (reset to BaseHealth at start of each combat)
- `int Attack` (BaseAttack + temporary modifiers)
- `int UpkeepThisRound` (BaseUpkeep + modifiers)
- `int FormationSlot` (0–4; 0–1 frontline, 2–4 backline)
- `Guid InstanceId`

### EnemyDefinition (plain C# class, immutable)
**Purpose:** Template for a single enemy unit.
**Fields:**
- `string Id`
- `string DisplayName`
- `int Attack`
- `int Health`
- `EnemyEffectId EffectId` (enum)
- `string EffectDescription`

### EncounterDefinition (plain C# class, immutable)
**Purpose:** Defines one round's encounter.
**Fields:**
- `int Round` (1–10)
- `EncounterType Type` (enum: Dungeon, RivalGhost, FinalBoss)
- `string DisplayName`
- `string ScoutText`
- `string DangerCategory` (free-text label, e.g., "Backline pressure")
- `List<EnemyDefinition> Enemies` (with formation positions 0–4)
- `int BaseGoldReward` (default 8)
- `EncounterEffectId EncounterEffectId` (enum — Tax Collector adds upkeep, Treasure Leech reduces reward, etc.)
- `string RivalGuildId` (null unless RivalGhost)

### RivalGuildState (plain C# class, mutable)
**Purpose:** Tracks one of the 3 rival guilds during a run.
**Fields:**
- `string Id` ("greedy", "frugal", "carry")
- `string DisplayName`
- `int Morale`
- `int Debt`
- `int Payroll`
- `string StatusLabel` ("Stable", "Dangerous", "Safe", "Scaling")
- `int PayrollGrowthPerRound`

### RunState (plain C# class, mutable)
**Purpose:** Single source of truth for the player's current run.
**Fields:**
- `int Round` (1–10)
- `int Gold`
- `int Debt`
- `int Morale`
- `List<HeroInstance> Party` (max 5)
- `List<RivalGuildState> Rivals` (always 3)
- `List<EncounterDefinition> Encounters` (always 10)
- `PayrollActionId? SelectedPayrollAction` (this round's choice)
- `int RerollCount` (this round, for any future scaling — start at 0)

### CombatUnit (plain C# class, mutable)
**Purpose:** A unified representation of any combatant during combat. Both heroes and enemies are converted to `CombatUnit` at combat start.
**Fields:**
- `string DisplayName`
- `int Attack`
- `int CurrentHealth`
- `int MaxHealth`
- `bool IsPlayerSide`
- `int Slot` (0–4)
- `HeroInstance SourceHero` (null for enemies)
- `EnemyDefinition SourceEnemy` (null for heroes)
- `bool IsAlive => CurrentHealth > 0`

### CombatResult (plain C# class)
**Purpose:** Outcome of a combat encounter.
**Fields:**
- `bool PlayerWon`
- `int CombatRoundsElapsed`
- `List<string> LogLines`
- `Dictionary<string, bool> SurvivorFlags` (e.g., "treasureLeechSurvived" → true)
- `List<HeroInstance> DeadHeroes` (heroes that died — note: dead heroes are revived for next combat in MVP; permadeath is out of scope)

### PayrollActionDefinition (plain C# class, immutable)
**Purpose:** Defines one of the 4 payroll actions.
**Fields:**
- `PayrollActionId Id` (enum: StandardPay, TakeLoan, PromiseVictoryBonus, CutWages)
- `string DisplayName`
- `string Description`

The behavior is handled in `PayrollManager` via a switch on the enum. No virtual methods on the definition — keeps Codex edits trivial.

### ShopOffer (plain C# class, mutable)
**Purpose:** One of the 3 hire offers shown in the shop this round.
**Fields:**
- `HeroDefinition Hero`
- `int HireCost` (= `Hero.BaseUpkeep + 2`)
- `bool Purchased`

### Enums (consolidated)

```csharp
public enum HeroRole { Tank, Damage, Support, Economy }
public enum HeroEffectId {
    None, KnightRedirect, GolemArmor, WizardScaling,
    NinjaLowestTarget, RangerBackline, PriestHeal,
    BardGoldOnWin, EnchanterAdjacent, TreasurerUpkeepReduce,
    ApprenticeWizardSupport
}
public enum EnemyEffectId {
    None, GoblinStealGold, BackBatBackline, DebtWraithScales,
    TreasureLeechRewardDrain, DungeonAuditorBoss
}
public enum EncounterType { Dungeon, RivalGhost, FinalBoss }
public enum EncounterEffectId { None, TaxCollectorUpkeep, FinalBossDamage }
public enum PayrollActionId { StandardPay, TakeLoan, PromiseVictoryBonus, CutWages }
```

---

## 5. MVP Rule Definitions

These are the locked-in numeric rules for the first prototype. They live as `const` fields in a static `GameRules` class so Codex can tune them in one place.

```csharp
public static class GameRules {
    // Starting state
    public const int StartingGold = 10;
    public const int StartingDebt = 0;
    public const int StartingMorale = 30;
    public const int DebtLimit = 20;

    // Party
    public const int MaxPartySize = 5;
    public const int FrontlineSlots = 2;  // slots 0, 1
    public const int BacklineSlots  = 3;  // slots 2, 3, 4

    // Shop
    public const int ShopOfferCount = 3;
    public const int RerollCost = 2;
    public const int HireCostBonus = 2;   // HireCost = Hero.BaseUpkeep + 2
    public const int FireRefund = 1;

    // Rewards
    public const int WinReward = 8;
    public const int LossReward = 4;
    public const int RivalWinBonus = 2;   // bonus gold on top of WinReward for ghost wins

    // Morale damage
    public const int DungeonLossMorale = 6;
    public const int RivalLossMorale = 8;

    // Combat
    public const int CombatTurnLimit = 10;

    // Payroll Actions
    public const int LoanGoldGain = 5;
    public const int LoanDebtCost = 6;
    public const int VictoryBonusGoldCost = 3;   // paid on win
    public const int VictoryBonusDebtOnLoss = 5; // added on loss
    public const int VictoryBonusAttackBuff = 1;
    public const int CutWagesUpkeepReduction = 3;
    public const int CutWagesAttackPenalty = 1;
}
```

### Interest formula
```csharp
int interest = (int)Math.Ceiling(runState.Debt / 3.0);
```

### Targeting rules (combat)
- Each unit attacks the **leftmost living enemy on the opposite side's frontline**.
- If all frontline enemies are dead, target the leftmost living backline unit.
- Hero effects can override targeting (e.g., Ninja targets the lowest-health enemy; Ranger ignores the "backline can be targeted" penalty).
- Backline player heroes are only targeted by enemies if all player frontline heroes are dead, **unless** the enemy has a backline-attack effect (e.g., Backline Bat).

### Damage
- `damage = attacker.Attack - defender.DamageReduction` (Golem has DamageReduction = 1; all others = 0).
- Minimum damage is 0 (no negative healing).
- No critical hits, no dodge, no resistance types.

### Win / Loss checks
- **Combat:** All enemies dead → player wins. All player heroes dead → player loses. Turn limit reached with both alive → **treat as a loss** (use `LossReward`, apply `DungeonLossMorale`).
- **Run loss:**
  - `Morale <= 0` → Defeat
  - `Debt >= DebtLimit` → Defeat
  - Lost final boss fight (round 10) → Defeat
- **Run win:** Won final boss fight (round 10) → Victory.

### Hire cost rule
```csharp
hireCost = hero.BaseUpkeep + GameRules.HireCostBonus;
```

### Upkeep rule
```csharp
totalUpkeep = sum(hero.UpkeepThisRound for hero in party)
              + encounter.UpkeepModifier   // Tax Collector = +2
              + payrollAction.UpkeepModifier; // CutWages = -3
totalUpkeep = max(0, totalUpkeep);

if (gold >= totalUpkeep) {
    gold -= totalUpkeep;
} else {
    int shortfall = totalUpkeep - gold;
    gold = 0;
    debt += shortfall;
}

// Interest
int interest = (int)Math.Ceiling(debt / 3.0);
if (gold >= interest) {
    gold -= interest;
} else {
    debt += (interest - gold);
    gold = 0;
}
```

---

## 6. Combat System Plan

Combat is **deterministic, turn-based, and log-driven**. No coroutines for the simulation itself; the entire combat is calculated synchronously into a `CombatResult`, then the log is replayed to the UI with a short delay between lines (e.g., 0.25s) for readability.

### Combat start
1. `CombatManager.StartCombat(RunState run, EncounterDefinition encounter)` is called.
2. Build `List<CombatUnit> playerUnits` from `run.Party`, copying `Attack` (with payroll buffs/debuffs already applied) and `Health = BaseHealth`. Slot = `HeroInstance.FormationSlot`.
3. Build `List<CombatUnit> enemyUnits` from `encounter.Enemies`.
4. Apply **pre-combat effects**:
   - Final boss adds +3 upkeep modifier (handled in Upkeep phase, not combat).
   - Hero effects with "on combat start" hooks are invoked here (e.g., Wizard's "+1 attack if full upkeep was paid last round" — store a flag on `HeroInstance`).
   - Payroll buffs: `PromiseVictoryBonus` adds +1 attack to each player unit; `CutWages` subtracts 1 (min 0).
5. Initialize `CombatLogger`.

### Turn order
- One **combat round** = one full pass through both sides.
- Iterate player units left-to-right by slot (0 → 4), then enemy units left-to-right by slot.
- Skip dead units.
- For each living unit: pick target → deal damage → trigger on-attack effects → check death.

### Targeting (default)
- Default target = leftmost living enemy in their frontline (slots 0–1).
- If frontline empty, leftmost living backline (slots 2–4).
- Overrides:
  - **Ninja:** lowest-current-health living enemy.
  - **Backline Bat (turn 2 only):** lowest-current-health backline player hero.
  - **Knight redirect:** the first time a backline player hero would be hit this combat, redirect that attack to Knight (if Knight is alive).

### Damage
```csharp
int damage = Math.Max(0, attacker.Attack - target.DamageReduction);
target.CurrentHealth -= damage;
log.Add($"{attacker.DisplayName} attacks {target.DisplayName} for {damage}.");
if (target.CurrentHealth <= 0) log.Add($"{target.DisplayName} dies.");
```

### Death
- Once `CurrentHealth <= 0`, the unit is dead for the rest of combat.
- Dead heroes do **not** die permanently — they are restored for the next round (no permadeath in MVP). They simply don't contribute to this combat. Upkeep is still paid for them (they are still under contract).

### Healing (Priest)
- At the **end of each combat round**, each living Priest heals the leftmost living player frontline unit (or itself if no frontline) for 2 HP, capped at MaxHealth.

### Hero effects (when triggered)
See Section 7. Most are checked once per relevant event (combat start, on attack, on kill, end of round, on combat end).

### Enemy effects (selected)
- **Goblin Thief:** If still alive at the end of combat round 3, `result.SurvivorFlags["goblinStoleGold"] = true`. Applied in Reward phase as `gold -= 3` (min 0).
- **Backline Bat:** On combat round 2, its attack targets the lowest-HP backline player hero (overrides default targeting).
- **Debt Wraith:** Its Attack = `BaseAttack + floor(playerDebt / 3)`, computed at combat start.
- **Treasure Leech:** If alive at end of combat, `result.SurvivorFlags["treasureLeechSurvived"] = true`. Applied in Reward phase as `goldReward -= 4` (min 0).
- **Dungeon Auditor (boss):** Adds +3 upkeep this round (Upkeep phase). Every 3 combat rounds (rounds 3, 6, 9), deals 1 damage to all living player heroes.

### Combat log
- Plain `List<string>` accumulated during simulation.
- Each line: one event (attack, death, heal, special effect).
- Streamed to `CombatLogView` post-simulation with a 0.25s delay per line.
- Final line: `"Player wins!"` or `"Player loses."` or `"Turn limit reached. Combat lost."`

### Combat result
- Populates `CombatResult` with: `PlayerWon`, `CombatRoundsElapsed`, full `LogLines`, `SurvivorFlags`.
- Returned to `RunManager`, which transitions to Reward.

### Determinism
- All randomness goes through the single `RunManager.Rng`. In combat, the **only** uses of randomness should be tie-breaking (e.g., two enemies with equal HP for Ninja's target). If you can avoid randomness in combat entirely, do so — combat should feel readable and replayable in the log.

---

## 7. Hero Effects Implementation Plan

All 12 heroes. Stats come straight from `GAME_DESIGN.md`. Effects are implemented as static methods in `HeroEffects` keyed by `HeroEffectId`, invoked at well-defined hook points.

Hook points: `OnCombatStart`, `OnAttack(attacker, target)`, `OnKill(killer, victim)`, `OnEndOfCombatRound`, `OnCombatEnd`, `OnUpkeepCalculated`.

| Hero       | Atk | HP | Upkeep | EffectId                  | Trigger              | Implementation notes |
|------------|----:|---:|-------:|---------------------------|----------------------|----------------------|
| Warrior    | 2   | 8  | 2      | `None`                    | —                    | No code needed. |
| Knight     | 1   | 10 | 4      | `KnightRedirect`          | OnCombatStart        | Set `RunState`-scoped flag `KnightRedirectAvailable = true`. In targeting logic, if a backline player hero is about to be hit and this flag is true, redirect to Knight and set flag false. |
| Golem      | 1   | 14 | 6      | `GolemArmor`              | passive              | Set `CombatUnit.DamageReduction = 1` at combat start. |
| Wizard     | 3   | 4  | 5      | `WizardScaling`           | OnCombatStart        | If `RunState.FullUpkeepPaidLastRound == true`, this Wizard's combat Attack += 1. Track the flag in `RunState` during Upkeep phase. **First-pass simplification:** if this becomes flaky, just give +1 Attack when current debt is 0 at combat start. |
| Ninja      | 4   | 3  | 4      | `NinjaLowestTarget`       | OnAttack + OnKill    | Target override: lowest-current-HP living enemy (ties → leftmost). On kill: `runState.Gold += 1` immediately, logged. |
| Ranger     | 3   | 5  | 3      | `RangerBackline`          | passive              | When in backline, still attacks normally (no penalty). Note: in MVP, backline heroes attack normally anyway — Ranger's effect is essentially "is fine in backline" with no special mechanic. **First-pass:** treat as no-op flavor; revisit if backline-attack penalty is added. |
| Priest     | 1   | 5  | 4      | `PriestHeal`              | OnEndOfCombatRound   | Heals leftmost living player frontline unit (or self) for 2, capped at MaxHealth. |
| Bard       | 1   | 4  | 3      | `BardGoldOnWin`           | OnCombatEnd          | If `result.PlayerWon`, `runState.Gold += 2`. Applied in Reward phase. |
| Enchanter  | 1   | 4  | 3      | `EnchanterAdjacent`       | OnCombatStart        | Find adjacent slot heroes with `Role == Damage`. For each, Attack += 1 for this combat. "Adjacent" = slots ±1 (e.g., slot 2 is adjacent to 1 and 3). **First-pass simplification:** if adjacency logic gets messy, buff *any* Damage-role ally by +1 instead. |
| Squire     | 1   | 4  | 1      | `None`                    | —                    | No code needed. |
| Treasurer  | 0   | 4  | 2      | `TreasurerUpkeepReduce`   | OnUpkeepCalculated   | Find the highest-upkeep ally (excluding self), reduce that hero's `UpkeepThisRound` by 2 (min 0). Applied during Upkeep phase before total is summed. |
| Apprentice | 1   | 3  | 1      | `ApprenticeWizardSupport` | OnUpkeepCalculated   | If a Wizard is in the party, reduce that Wizard's `UpkeepThisRound` by 1 (min 0). |

### Risky / complex effects flagged
- **Wizard scaling** depends on cross-round state. Use the `FullUpkeepPaidLastRound` flag set during Upkeep phase. Simpler fallback: "+1 attack if debt == 0 at combat start."
- **Enchanter adjacency** can be confusing with sparse formations. Fallback: buff any Damage-role ally.
- **Knight redirect** mutates targeting mid-combat. Implement carefully and unit-test manually with Backline Bat (Round 5).
- **Treasurer/Apprentice** modify upkeep, which is computed once per round in the Upkeep phase. They run before the sum is computed. Order: Apprentice first (Wizard-specific), then Treasurer (highest-upkeep). Documented so Codex doesn't reorder.

---

## 8. Encounter Implementation Plan

All 10 encounters are defined as a static list in `DataRepository.Encounters`. Enemies are also hardcoded in `DataRepository.Enemies`. No JSON in MVP.

| Round | Type        | Name              | Enemies (slot, atk/hp)                            | Effect                                                            | Reward          |
|------:|-------------|-------------------|---------------------------------------------------|-------------------------------------------------------------------|-----------------|
| 1     | Dungeon     | Slimes            | Slime ×3 (slots 0,1,2; 1/3 each)                  | None                                                              | 8               |
| 2     | Dungeon     | Goblin Thieves    | Goblin Thief ×2 (slots 0,1; 2/4)                  | If alive at end of combat round 3, -3 gold from reward            | 8               |
| 3     | RivalGhost  | Greedy Ghost      | Generated from Greedy profile (see §9)            | None                                                              | 8 + 2 win bonus |
| 4     | Dungeon     | Tax Collector     | Tax Collector ×1 (slot 0; 1/8)                    | +2 upkeep this round                                              | 8               |
| 5     | Dungeon     | Backline Bat      | Bat ×1 (slot 0; 3/4) + Slime ×1 (slot 1; 1/3)     | On combat round 2, Bat targets lowest-HP backline player hero     | 8               |
| 6     | RivalGhost  | Carry Ghost       | Generated from Carry profile (see §9)             | None                                                              | 8 + 2 win bonus |
| 7     | Dungeon     | Debt Wraith       | Debt Wraith ×1 (slot 0; (1+floor(debt/3))/10)     | Attack scales with player debt at combat start                    | 8               |
| 8     | Dungeon     | Treasure Leech    | Treasure Leech ×1 (slot 0; 1/12) + Slime ×1       | If alive at combat end, -4 gold from reward                       | 8               |
| 9     | RivalGhost  | Frugal Ghost      | Generated from Frugal profile (see §9)            | None                                                              | 8 + 2 win bonus |
| 10    | FinalBoss   | Dungeon Auditor   | Auditor ×1 (slot 0; 3/20)                         | +3 upkeep this round; every 3 combat rounds deal 1 dmg to all     | 8               |

### Scout text
Use the exact scout text from `GAME_DESIGN.md` lines 1010, 1029, 1047, 1065, 1083, 1100, 1119, 1137, 1155, 1173.

### Enemy formations
Enemies fill slots 0–4 same as heroes (2 front, 3 back). Single-enemy fights occupy slot 0. Multi-enemy fights spread frontline first.

### Encounter effects
Handled in three places:
- **Combat start:** Debt Wraith stat scaling, Final Boss flag.
- **During combat:** Backline Bat targeting override, Final Boss periodic damage.
- **End of combat / Reward phase:** Goblin Thief gold steal, Treasure Leech reward reduction.
- **Upkeep phase:** Tax Collector +2 upkeep, Final Boss +3 upkeep.

### Reward modifications
Applied in `Reward` state after base reward is set:
```csharp
int gold = result.PlayerWon ? GameRules.WinReward : GameRules.LossReward;
if (encounter.Type == EncounterType.RivalGhost && result.PlayerWon) gold += GameRules.RivalWinBonus;
if (result.SurvivorFlags.GetValueOrDefault("goblinStoleGold")) gold = Math.Max(0, gold - 3);
if (result.SurvivorFlags.GetValueOrDefault("treasureLeechSurvived")) gold = Math.Max(0, gold - 4);
```

---

## 9. Rival Ghost System Plan

Rivals are **fully local, scripted, deterministic**. Three guilds, each with a profile. No simulated shop, no real party composition logic.

### The 3 rival guilds

| Guild         | Start Morale | Start Debt | Start Payroll | Payroll Growth/Round | Debt Tendency | Status Label |
|---------------|-------------:|-----------:|--------------:|---------------------:|---------------|--------------|
| Greedy Guild  | 30           | 0          | 10            | +2                   | High          | "Dangerous"  |
| Frugal Guild  | 30           | 0          | 6             | +1                   | Low           | "Safe"       |
| Carry Guild   | 30           | 0          | 8             | +1.5 (alt +1/+2)     | Medium        | "Scaling"    |

### Per-round update (`RivalManager.AdvanceRivals()`)
After the player's Upkeep phase, each rival is updated:

```csharp
foreach (var rival in run.Rivals) {
    rival.Payroll += rival.PayrollGrowthPerRound;
    // Simulate the rival's own "income" deterministically: gain 8 gold per round.
    int rivalIncome = 8;
    if (rival.Payroll > rivalIncome) {
        rival.Debt += (rival.Payroll - rivalIncome);
    }
    // Debt creep for high-tendency
    if (rival.Id == "greedy" && currentRound % 2 == 0) rival.Debt += 1;
    if (rival.Id == "frugal" && rival.Debt > 0) rival.Debt = Math.Max(0, rival.Debt - 1);
    // Morale drift (cosmetic, doesn't trigger anything)
    if (rival.Debt > 15) rival.Morale = Math.Max(0, rival.Morale - 2);
}
```

Carry Guild uses +1 on odd rounds, +2 on even rounds.

### Leaderboard
Show all 4 entries (Player + 3 rivals) sorted by morale descending. Display: Guild | Morale | Debt | Payroll | Status.

### Ghost fight team generation
On rounds 3, 6, 9, the rival ghost fight uses a **hardcoded enemy team per guild** that scales by round, not by the rival's live state. This keeps ghost fights consistent and tunable.

```csharp
// Greedy Ghost (Round 3): high attack, high HP frontline + 1 backline
// Frontline: GreedyTank (Atk 3, HP 8), GreedyTank (Atk 3, HP 8)
// Backline:  GreedyCarry (Atk 4, HP 4)

// Carry Ghost (Round 6): one strong carry + 2 weak protectors
// Frontline: CarryProtector (Atk 1, HP 10), CarryProtector (Atk 1, HP 10)
// Backline:  CarryCarry (Atk 6, HP 6)

// Frugal Ghost (Round 9): efficient, cheap, balanced team of 4
// Frontline: FrugalGuard (Atk 2, HP 6), FrugalGuard (Atk 2, HP 6)
// Backline:  FrugalArcher (Atk 3, HP 4), FrugalHealer (Atk 1, HP 5)
//            (FrugalHealer heals leftmost living ally for 2 each round)
```

These enemy units live in `DataRepository.Enemies` as ordinary `EnemyDefinition` entries.

### Win/loss against ghost
- Win: standard win reward + `RivalWinBonus` (+2 gold).
- Loss: standard loss reward + `RivalLossMorale` damage (-8).
- Rival's own state on the leaderboard is **not** affected by the player's win/loss in MVP. (Don't simulate rivals fighting each other.)

### What is faked / simplified for MVP
- Rivals do not actually fight encounters or each other.
- Rivals do not visit a shop or buy heroes.
- Rivals never "win" or "lose" the run — they just exist as a leaderboard pressure.
- Ghost fights are not the rival's "current" party; they are a scripted team per round per guild.
- Status labels are hardcoded per guild, not derived from stats.

Anything more elaborate is out of scope. Resist the temptation.

---

## 10. UI Screen and Panel Plan

All UI lives in `Main.unity` as nested Canvas panels toggled by `UIManager`. Each panel is a `GameObject` with a controlling script that holds references to its child UI elements via `[SerializeField]`.

### Layout regions (1920×1080)
- **Top bar (full width, 80px):** Run Header / Resource Bar.
- **Left column (480px):** Scout Panel, Shop Panel, or Payroll Panel depending on state.
- **Center (960px):** Party Formation (top half) + Enemy Formation (bottom half) during Formation/Combat; otherwise context-dependent.
- **Right column (480px):** Rival Leaderboard + Combat Log.

### Panels

**MainMenuPanel** — `MainMenuPanel.cs`
- Purpose: entry point.
- Displays: title text, version label.
- Buttons: Start Run, Quit.

**RunHeaderView** — `RunHeaderView.cs`
- Purpose: always-visible top bar during a run.
- Displays: Round (X/10), Gold, Debt, Morale, Total Upkeep.
- Buttons: none.
- Visible in: all states except MainMenu and EndScreen.

**ScoutPanelView** — `ScoutPanelView.cs`
- Purpose: pre-fight scout.
- Displays: encounter name, type, scout text, danger category, reward.
- Buttons: Continue.

**ShopPanelView** — `ShopPanelView.cs`
- Purpose: hero recruitment.
- Displays: 3 `ShopOfferView` children, current party preview.
- Buttons: Reroll (-2 gold), Continue. Each offer has its own Hire button.

**ShopOfferView** — `ShopOfferView.cs`
- Purpose: render one `ShopOffer`.
- Displays: hero name, role, atk/hp/upkeep, effect text, hire cost.
- Buttons: Hire (disabled if gold < cost or party full).

**HeroCardView** — `HeroCardView.cs`
- Purpose: reusable card for showing a `HeroInstance` or `HeroDefinition`.
- Displays: name, atk, hp, upkeep, role.
- Buttons: optional Fire button (used in party-management contexts; refunds 1 gold).

**PartyFormationView** — `PartyFormationView.cs`
- Purpose: show and edit player's 5-slot formation.
- Displays: 5 `FormationSlotView` children arranged 2 frontline + 3 backline.
- Buttons: drag-and-drop or click-to-swap between slots.

**FormationSlotView** — `FormationSlotView.cs`
- Purpose: one slot.
- Displays: empty placeholder OR a `HeroCardView`.
- Buttons: click to select / drop target.

**EnemyFormationView** — `EnemyFormationView.cs`
- Purpose: show enemies (preview before combat, live during combat).
- Displays: 5 enemy slots with name, atk, hp.

**PayrollPanelView** — `PayrollPanelView.cs`
- Purpose: choose one payroll action.
- Displays: 4 cards (Standard Pay, Take Loan, Promise Victory Bonus, Cut Wages) with descriptions.
- Buttons: one button per action. Selecting one transitions to Formation.

**RivalLeaderboardView** — `RivalLeaderboardView.cs`
- Purpose: show the 4-row leaderboard.
- Displays: Player + 3 rivals, columns: Guild, Morale, Debt, Payroll, Status. Highlight player row.
- Buttons: none.

**CombatLogView** — `CombatLogView.cs`
- Purpose: scrolling text log of combat events.
- Displays: vertical TMP text or stacked `CombatLogLine` prefabs.
- Buttons: none during combat; a Continue button appears at end of combat.

**RewardSummaryView** — `RewardSummaryView.cs`
- Purpose: post-combat reward + upkeep recap.
- Displays: combat result (win/loss), gold gained, payroll action effect, morale change, upkeep paid, debt change, interest paid.
- Buttons: Continue.

(For simplicity, MVP can combine Reward and Upkeep into one `RewardSummaryView` shown across both states — but transitions still pass through both states internally.)

**EndScreenView** — `EndScreenView.cs`
- Purpose: victory or defeat screen.
- Displays: outcome (Victory / Defeat reason), final round, gold, debt, morale, party.
- Buttons: Return to Menu.

---

## 11. Milestone Plan

Each milestone is Codex-friendly: small scope, clear acceptance criteria, explicit out-of-scope notes. **Do not start a milestone until the previous one passes its manual test steps.**

---

### Milestone 1: Combat Sandbox

**Goal:** Resolve one fixed combat encounter end-to-end with a log and win/loss result, no UI for run management.

**Files/scripts:**
- `Data/` all 10 data classes (basic versions; many fields can be unused).
- `Core/DataRepository.cs` (just 4–5 hardcoded heroes and 2–3 enemies).
- `Combat/CombatManager.cs`
- `Combat/CombatLogger.cs`
- `Combat/HeroEffects.cs` (stubs are fine — only Warrior/Squire effects needed; rest can return early).
- `UI/CombatLogView.cs`
- `UI/MainMenuPanel.cs` (just a Start Combat button for now).

**Required behavior:**
- Click Start Combat → CombatManager builds a hardcoded player party (e.g., 2 Warriors + 1 Wizard + 1 Squire) vs. a hardcoded enemy team (3 Slimes).
- Combat runs to completion, log streams to screen, final line is "Player wins!" or "Player loses."
- Restart button to re-run the same combat.

**Out of scope:**
- Any economy systems (gold/debt/morale).
- Any shop, payroll, or formation editing.
- Any hero effects beyond basic attacks. Effects beyond `None` may be left as TODO stubs.

**Acceptance criteria:**
- Pressing Start Combat shows a streaming log within 1 second.
- Log lines are readable, in order, and consistent across runs.
- Combat ends within 10 combat rounds (turn limit triggers correctly when tested with very tanky units).
- Restarting produces an identical log (since no randomness yet).

**Manual test steps:**
1. Launch scene, click Start Combat.
2. Verify Warrior and Wizard attack Slimes correctly.
3. Verify Slimes die before player units (given party is overpowered).
4. Click Restart; verify identical result.
5. Edit hardcoded enemy team to add 10 Slimes; verify turn limit triggers "Combat lost (turn limit)."

---

### Milestone 2: Run State and Resources

**Goal:** Add `RunState`, gold/debt/morale tracking, reward/upkeep/interest math, and loss conditions. Still hardcoded party.

**Files/scripts:**
- `Core/GameManager.cs` (state machine).
- `Core/GameState.cs`
- `Run/RunManager.cs`
- `UI/RunHeaderView.cs`
- `UI/RewardSummaryView.cs`
- `UI/EndScreenView.cs`
- Add `GameRules.cs`.

**Required behavior:**
- Start Run initializes RunState (gold=10, debt=0, morale=30, round=1).
- Hardcoded party (5 heroes) fights each round (encounter list can be just "3 Slimes" × 10 for now).
- After combat: gold gained (8 or 4), upkeep paid, shortfall → debt, interest computed and paid.
- Round increments. Run ends on round 10 (Victory), or earlier on morale ≤ 0 or debt ≥ 20 (Defeat).

**Out of scope:**
- Shop, payroll actions, formation editing, scout panel, rival system.

**Acceptance criteria:**
- Run Header always shows correct gold/debt/morale/round.
- Reward Summary shows accurate math.
- Defeat triggers correctly when debt reaches 20 (tested by inflating party upkeep).
- Victory triggers after winning round 10.

**Manual test steps:**
1. Start Run; verify starting values.
2. Run through all 10 rounds; verify Victory screen.
3. Restart; modify hardcoded party to be very expensive; verify debt accumulates and Defeat triggers.
4. Test interest: set debt to 9 manually; verify interest = 3 next round.

---

### Milestone 3: Shop and Party Editing

**Goal:** Replace hardcoded party with player-built party via shop. Add 12 heroes to DataRepository.

**Files/scripts:**
- All 12 `HeroDefinition` entries in `DataRepository`.
- `Run/ShopManager.cs`
- `UI/ShopPanelView.cs`, `UI/ShopOfferView.cs`, `UI/HeroCardView.cs`
- Wire `Shop` state in `GameManager`.

**Required behavior:**
- Each round, Shop state shows 3 random hero offers (no duplicates in same shop).
- Hire: deducts gold, adds to party (max 5).
- Fire: removes from party, refunds 1 gold.
- Reroll: -2 gold, re-roll 3 offers.
- Continue button advances to next state (skip Payroll/Formation for now — go directly to Combat with default Standard Pay and default formation order).

**Out of scope:**
- Payroll action choice, formation editing, scout, rivals.
- Hero effects beyond basic attacks (effects can still be stubs).

**Acceptance criteria:**
- Shop shows 3 valid offers.
- Hire/Fire/Reroll all work with correct gold math.
- Party cap of 5 is enforced (Hire button disabled when full).
- Affordability check works (Hire button disabled when gold < cost).

**Manual test steps:**
1. Start run; verify 3 shop offers.
2. Hire a hero; verify gold decreases and party grows.
3. Try to hire when broke; verify button is disabled.
4. Fire a hero; verify +1 gold.
5. Reroll twice; verify -4 gold and new offers.
6. Fill party to 5; verify Hire buttons disabled.

---

### Milestone 4: Formation

**Goal:** Player can arrange party into 2 frontline + 3 backline slots; targeting respects formation.

**Files/scripts:**
- `UI/PartyFormationView.cs`, `UI/FormationSlotView.cs`, `UI/EnemyFormationView.cs`
- Update `CombatManager` targeting to use frontline-first logic.

**Required behavior:**
- After Shop, transition to Formation state.
- Player can click a hero in one slot and click an empty/other slot to swap.
- Combat uses formation slots: enemies attack frontline first; backline only after frontline cleared (unless effect overrides).
- Add the Backline Bat encounter for testing (replace one round in encounter list).

**Out of scope:**
- Drag-and-drop polish (click-to-swap is fine).
- Hero effects beyond formation-aware basics (Knight redirect can be stubbed; Backline Bat targeting must work).

**Acceptance criteria:**
- All 5 slots visually distinct (2 front, 3 back).
- Heroes can be moved between any two slots.
- In combat, enemies attack frontline heroes before backline.
- Backline Bat correctly hits backline on round 2.

**Manual test steps:**
1. Hire 5 heroes; verify all 5 slots fill.
2. Move heroes around; verify visual updates.
3. Place fragile hero (Wizard) in backline; tank in frontline. Verify Wizard not hit until frontline clears.
4. Trigger Backline Bat round; verify it hits a backline hero on round 2.

---

### Milestone 5: Payroll Actions

**Goal:** Add the 4 payroll action choices before each fight.

**Files/scripts:**
- `Run/PayrollManager.cs`
- `UI/PayrollPanelView.cs`
- Update `CombatManager` to apply pre-combat attack buffs/debuffs.
- Update `RunManager`/`Upkeep` to apply post-combat effects.

**Required behavior:**
- After Shop, before Formation: show 4 payroll cards. Player clicks one.
- Standard Pay: no effect.
- Take Loan: +5 gold immediately; +6 debt after combat.
- Promise Victory Bonus: +1 attack to all heroes this fight; if win, -3 gold; if loss, +5 debt.
- Cut Wages: -3 upkeep this round; -1 attack to all heroes this fight (min 0).

**Out of scope:**
- Bench Contract action (deferred).
- Hero effects beyond what was done in M4.

**Acceptance criteria:**
- Each payroll action visibly changes the state (gold/debt/attack stats) as documented.
- The choice is locked in for the round once selected.
- Reward Summary clearly reports payroll effects.

**Manual test steps:**
1. Take Loan; verify +5 gold immediately, +6 debt after combat.
2. Promise Victory Bonus on a winnable fight; verify -3 gold post-combat and all attacks were +1.
3. Promise Victory Bonus on an unwinnable fight; verify +5 debt.
4. Cut Wages on an expensive party; verify upkeep is 3 less and all attacks were -1.

---

### Milestone 6: Full 10-Round Run

**Goal:** Add the full 10-encounter list, scout panel, all hero effects, victory/defeat screens.

**Files/scripts:**
- All entries in `DataRepository.Encounters` (10 rounds).
- All hero effect implementations in `HeroEffects.cs`.
- All enemy effect implementations in `CombatManager` / `HeroEffects`.
- `UI/ScoutPanelView.cs`
- `Run/EncounterManager.cs`

**Required behavior:**
- Each round shows correct scout text, enemy team, reward.
- All enemy effects work (Goblin Thief steal, Tax Collector upkeep, Backline Bat, Debt Wraith scaling, Treasure Leech reward drain, Dungeon Auditor boss effects).
- All hero effects work (12 heroes, see §7).
- Victory on beating round 10. Defeat on morale ≤ 0, debt ≥ 20, or losing round 10.

**Out of scope:**
- Rival ghosts (round 3/6/9 can be placeholders — e.g., reuse Slimes — until M7).

**Acceptance criteria:**
- A full 10-round playthrough is possible.
- Each encounter feels distinct (scout text + effect).
- All hero effects produce observable in-game changes.

**Manual test steps:**
1. Play full run with cheap Warrior/Squire-heavy team; verify Frugal-style win is possible.
2. Play full run with Wizard carry team; verify scaling works.
3. Intentionally take excessive debt; verify Debt Wraith scales and run loss triggers.
4. Lose to final boss; verify Defeat screen.
5. Win final boss; verify Victory screen.

---

### Milestone 7: Rival Ghosts

**Goal:** Add 3 rival guilds, leaderboard, and 3 ghost fight encounters.

**Files/scripts:**
- `Run/RivalManager.cs`
- `Data/RivalGuildState.cs` (populated)
- `UI/RivalLeaderboardView.cs`
- Replace placeholder rounds 3/6/9 in `DataRepository.Encounters` with ghost-fight enemy teams.
- Add `RivalUpdate` state to state machine flow.

**Required behavior:**
- 3 rivals initialized at run start.
- Leaderboard shown during Scout (compact) and RivalUpdate (full).
- After Upkeep each round, rivals advance per §9 rules.
- Rounds 3, 6, 9 use the scripted ghost teams (Greedy, Carry, Frugal).
- Ghost win: +2 bonus gold. Ghost loss: -8 morale.

**Out of scope:**
- Rivals actually losing the run.
- Rival shops or dynamic team composition.
- Any visual ghost effects (just labeled as "Ghost" in scout).

**Acceptance criteria:**
- Leaderboard always shows 4 rows with correct math.
- Rival stats change every round per scripted rules.
- Ghost fights are noticeably different from dungeon fights (different enemy stats).

**Manual test steps:**
1. Start run; verify 3 rivals appear with correct starting stats.
2. After round 1 Upkeep, verify Greedy +2 payroll, Frugal +1, Carry +1 or +2.
3. Reach round 3; verify Greedy Ghost fight uses scripted team.
4. Win ghost fight; verify +10 gold reward (8 + 2 bonus).
5. Lose ghost fight intentionally; verify -8 morale.

---

## 12. Recommended Script List

Each script's responsibility is bounded. Don't let them grow.

| Script | Responsibility |
|---|---|
| `GameManager` | Owns `GameState`. Single `ChangeState(GameState)` entry point. Routes state transitions. Holds reference to `RunState`, `UIManager`. **Does not** know about UI internals. |
| `RunManager` | Initializes `RunState`. Owns the run lifecycle. Calls `EncounterManager`, `ShopManager`, `PayrollManager`, `CombatManager`, applies rewards/upkeep/interest, checks loss conditions. |
| `CombatManager` | Synchronously simulates one combat. Inputs: party + encounter. Output: `CombatResult`. No UI awareness beyond emitting log lines. |
| `CombatLogger` | Helper used by `CombatManager` to accumulate log strings. |
| `ShopManager` | Generates 3 shop offers from `DataRepository`. Handles Hire / Fire / Reroll logic and gold math. |
| `PayrollManager` | Validates and records the selected payroll action. Applies pre-combat modifiers to `HeroInstance.Attack` and post-combat modifiers to gold/debt. |
| `EncounterManager` | Loads the current round's `EncounterDefinition`. Applies encounter-start effects (Debt Wraith scaling, Final Boss flags). |
| `RivalManager` | Initializes 3 rivals. Advances rivals each round. |
| `UIManager` | Subscribes to `GameManager.OnStateChanged`. Shows/hides the correct panels per state. Holds references to every panel script. |
| `DataRepository` | Static repository of all heroes (12), enemies, encounters (10), payroll actions (4), rival guild profiles (3). Read-only. |
| Panel scripts (`MainMenuPanel`, `ScoutPanelView`, etc.) | One per panel. Pure presentation: read from `RunState`/passed data, render, raise events for button clicks. |
| `HeroCardView`, `FormationSlotView`, `ShopOfferView` | Reusable item-view components. |
| `HeroEffects` | Static class. One method per `HeroEffectId`, invoked at named hook points by `CombatManager` and `RunManager`. |
| `GameRules` | Static class of `const` numeric tuning values. |

**Overengineering to avoid:** no event bus library, no DI container, no MVVM framework, no service locator, no Zenject, no async/await for combat. Direct references between managers via `GameManager` are fine.

---

## 13. Testing and Validation Plan

Manual testing only. No NUnit or Unity Test Framework in MVP. Each milestone's "Manual test steps" double as its acceptance test.

### Targeted bug sweeps

**Combat bugs:**
- Run combat with empty player party → should immediately lose, no NRE.
- Run combat with empty enemy team → should immediately win.
- Run combat at turn limit with full HP on both sides → loss is recorded.
- Ninja with no enemies alive → does not crash on target search.

**Economy bugs:**
- Hire a hero when gold = exact cost → succeeds, gold = 0.
- Reroll with gold = 1 → button disabled.
- Upkeep when gold = 0 → entire upkeep becomes debt.
- Debt = exactly 20 → Defeat triggers, not 19 or 21.
- Interest with debt = 0 → no interest charged.
- Interest with debt = 1 → interest = 1 (ceil(1/3) = 1).
- Interest with debt = 3 → interest = 1.
- Interest with debt = 4 → interest = 2.

**Hero effect bugs:**
- Knight redirect: backline hit redirected exactly once per combat.
- Wizard scaling: works only when prior upkeep was fully paid.
- Treasurer + Apprentice + Wizard: order of application is Apprentice then Treasurer; verify final upkeep math.
- Bard: gold +2 only on win, not on loss.
- Ninja kill: gold +1 logged per kill, multiple kills accumulate.

**UI / state transition bugs:**
- Click Continue during combat resolution → button should be disabled.
- Quit during a run → returns to menu cleanly.
- Re-enter run after victory → `RunState` is fresh, not stale.
- Resize window → UI scales correctly at 1920×1080 reference.

**Rival ghost bugs:**
- Round 3 / 6 / 9 → correct ghost team appears.
- Rival stats update every round, including round 10.
- Leaderboard always shows 4 entries, even after running for 10 rounds.

### Optional lightweight automated checks
If a Codex session has spare capacity, add a single `EditMode` test:
- `CombatManagerTests.SimpleCombat_TwoWarriorsVsThreeSlimes_PlayerWins` — verifies the foundational combat path.

Beyond that, do not invest in a test framework in MVP.

---

## 14. Scope Control Rules

Read these aloud before opening a Codex session. They are not suggestions.

**Phase 2 carve-outs (M8+) and Phase 3 carve-outs (M12+):** The rules below are amended only by the explicit milestone scopes in §15 and §16. All others remain in force.

- Trivial shapes, role-icon glyphs, and a small placeholder sprite set under `Assets/Art/` are allowed for Phase 2 UI work.
- Bronze→Silver hero tiering is in scope (M9 only). No Gold tier, still no equipment / traits / factions / synergies.

- **Do not add extra heroes** beyond the 12 in §7.
- **Do not add equipment**, items, or inventory of any kind.
- **Do not add traits, factions, or synergies** beyond the listed role labels.
- **Do not add animations** beyond simple UI feedback (button hover, color flash on hit). No tweens, no DOTween, no skeletal animation.
- **Do not add save/load** for the prototype. Each run is a fresh session.
- **Do not add procedural maps** or branching paths. The 10 encounters are fixed and ordered.
- **Do not add real multiplayer, online ghosts, leaderboards, or accounts.** Ghosts stay local and scripted.
- **Do not add meta progression**, unlocks, persistent currency, or run history.
- **Do not refactor** into a large architecture (no ECS, no DI, no event bus) prematurely. Direct manager references are fine.
- **Do not add audio polish** (music, voice acting, ambient SFX). Optional: one or two button-click sounds at the very end if everything else is done.
- **Do not add localization.** English only.
- **Do not expand combat** with crit, dodge, types, statuses, or buffs beyond what's listed.
- **Do not add a tutorial.** Tooltips on hero/payroll cards are sufficient.
- **Do not add screen shake, particles, or VFX** beyond color flashes.
- **Do not add a "post-MVP feature" today**, even if a milestone finishes early. If you finish early, polish UI, fix bugs, and replay full runs.

When Codex/Claude Code suggests an out-of-scope feature, respond with: *"Out of scope for MVP per IMPLEMENTATION_PLAN.md §14. Skip it."*

(For Phase 2 work, the equivalent response is *"Out of scope for Phase 2 per IMPLEMENTATION_PLAN.md §15."*)

---

## 15. Phase 2 — Readability, Tiering, Balance

Phase 2 is post-M7 polish plus one contained gameplay expansion. It does **not** lift the major MVP bans: no save/load, equipment, traits/factions/synergies, real multiplayer or online ghosts, procedural maps, meta progression, tutorials, audio polish, or large content expansion.

Phase 2 lifts exactly two rules from §14, restated here:

1. **Art ceiling.** Trivial shapes, role-icon glyphs, and a small placeholder sprite set under `Assets/Art/` are allowed for UI work. No animation frames, no rigged characters, no tweens.
2. **Hero tiering.** Bronze→Silver hero tiering is in scope (M9). No Gold tier. Tiering does not introduce equipment, traits, factions, or synergies.

Slicing inside each Phase 2 milestone is decided when that milestone starts — not pre-committed here.

### Milestones

| # | Name | Output |
|---|------|--------|
| 8 | Card readability pass | Hero/enemy/shop/formation cards with role color, prominent upkeep, effect blurb, reserved tier-badge slot |
| 9 | Bronze→Silver tiering | Duplicate-hire merges to Silver; Silver shop offers; per-hero Silver bonus active |
| 10 | Combat view rebuild | Unit-card combat panel with HP bars and turn highlighting; text log retained as secondary pane |
| 11 | Economy & balance pass | Tune resource curves and Silver tier probability; no new systems |

### Milestone 8: Card readability pass

**Goal.** Replace text-dense panels with card layouts that read at a glance, anywhere a hero or enemy is displayed outside of combat.

**In scope:**

- `HeroCardView` (used in Shop, Formation, party readouts): role badge with role color, name, stat block (Atk / HP / Upkeep), effect blurb, reserved tier-badge area in a fixed corner. The tier slot is rendered empty in M8 and populated in M9.
- `EnemyCardView` (used in Scout and any out-of-combat enemy preview): name, stat block, effect blurb, encounter-role hint if applicable.
- Run-header readout: visible deltas for Gold/Debt/Morale on round changes (label or color flash; no tweens).
- Role color palette in `GameRules` (Tank / Damage / Support / Economy) plus a Bronze-tier badge color.
- Optional small imported sprite set under `Assets/Art/` if it makes the cards clearer (role icons, frame borders). Stay placeholder.

**Out of scope for M8:** any tier merge logic, combat unit cards, HP bars, animations beyond static color flashes.

### Milestone 9: Bronze→Silver tiering

**Goal.** Duplicate-hire merges to Silver; Silver offers exist directly in the shop pool; per-hero Silver bonus is active in combat and economy.

**Mechanics:**

- `HeroInstance` gains a `Tier` field (`HeroTier.Bronze` / `HeroTier.Silver`). `HeroDefinition` stays immutable.
- **Duplicate hire:** hiring a hero you already own (any tier) consumes the offer and upgrades the existing instance to Silver. If the existing instance is already Silver, the offer is non-purchasable (refund vs. unhireable is locked in the M9.1 plan).
- **Silver offers in pool:** Silver offers appear directly. Tier probability per round is a placeholder constant in `GameRules`; the curve is finalized in M11.
- **Silver direct-hire cost:** Bronze hire cost + `SilverHireCostBonus` constant.
- `HeroEffects` and stat reads consult `HeroInstance.Tier` to apply the Silver bonus.
- Card UI populates the tier-badge slot reserved in M8.

**Per-hero Silver bonus.** Exact numbers are deferred to M11 — only the bonus shape is locked here.

| Hero | Bronze (Atk/HP/Upkeep, effect) | Silver bonus | Type |
|---|---|---|---|
| Warrior | 2/8/2, no effect | +Atk, +HP | Stat |
| Knight | 1/10/4, redirect 1 backline hit | Redirect 2 backline hits | Effect |
| Golem | 1/14/6, −1 dmg taken | Upkeep reduced | Upkeep |
| Wizard | 3/4/5, +1 atk if full upkeep paid | Upkeep reduced (easier to trigger effect) | Upkeep |
| Ninja | 4/3/4, lowest-HP target, +1 gold/kill | Upkeep reduced | Upkeep |
| Ranger | 3/5/3, backline safe attack | +Atk | Stat |
| Priest | 1/5/4, heal 2/round | Heal 3/round | Effect |
| Bard | 1/4/3, +2 gold on win | +4 gold on win | Effect |
| Enchanter | 1/4/3, +1 atk to adjacent Damage | +1 atk to all Damage allies (not just adjacent) | Effect |
| Squire | 1/4/1, no effect | +Atk, +HP | Stat |
| Treasurer | 0/4/2, −2 upkeep on top ally | −2 upkeep on top two allies, or −3 on top one | Effect |
| Apprentice | 1/3/1, −1 Wizard upkeep | −2 Wizard upkeep | Effect |

Distribution: 3 Stat, 6 Effect, 3 Upkeep.

**Expected sub-slicing** (confirmed at the start of M9, not pre-committed):

- **M9.1** — data model (`HeroInstance.Tier` + `HeroTier` enum), duplicate-hire merge behavior, tier-badge populated in the M8 slot. Silver bonuses stubbed so existing combat math is unchanged.
- **M9.2** — Silver shop offers in the pool (placeholder probability constants in `GameRules`), Silver direct-hire cost, per-hero Silver bonuses wired into `HeroEffects` and stat reads.

M9 is the largest Phase 2 milestone and should not be attempted as one slice.

**Out of scope for M9:** Gold tier, traits/factions/synergies, any new hero source besides the shop.

### Milestone 10: Combat view rebuild

**Goal.** Replace scrolling-text-only combat with a visible unit-card view, log retained as a secondary pane.

**In scope:**

- Unit-card combat panel: each living combatant shown as a card with HP bar, current/max HP, role color, and tier badge (consumed from M9).
- Turn highlighting: acting unit and its target visibly flash on each attack action.
- HP bar updates step-by-step in time with the existing combat-log replay (synchronous resolver unchanged).
- `CombatLogView` retained in a secondary pane so log lines remain readable.

**Out of scope for M10:** combat math changes, tween animation, particles, VFX, audio, new combat states.

#### Sprite-storage architecture decision (ratified M10.3)

Two options were weighed for how per-entity and shared-effect sprites are stored and looked up at runtime:

- **Option A — `SpriteCatalog` MonoBehaviour (CHOSEN).** A single presentation-only MonoBehaviour lives in the scene and exposes serialized `id → Sprite` slots for hero base sprites, enemy base sprites, and the shared combat-effect set. Runtime UI/combat views query it by stable string id (`"warrior"`, `"slime"`, `"melee_stab"`, `"arrow"`, `"fireball"`, `"heal"`, `"enchant"`).
  - *Pros:* keeps `CLAUDE.md` §Core tech "No ScriptableObjects" fully intact — smallest possible scope amendment; consistent with the existing scene-component + `DataRepository`-static philosophy; the roster is locked and tiny (12 + 16 + 5 = 33 sprites), so the main argument for ScriptableObjects (designer-managed, growing content) does not apply; no `Resources/`, no new asset type.
  - *Cons:* a single inspector with ~33 serialized slots is mildly clumsy to populate by hand; Option B is the more Unity-idiomatic answer *at scale* — but this prototype is explicitly not at scale and explicitly anti-ScriptableObject.
- **Option B — ScriptableObject sprite library (rejected).** A `.asset` sprite-library ScriptableObject. More idiomatic for large/growing rosters and designer workflows, but would require additionally amending the locked "No ScriptableObjects" rule for art assets. The scale benefit is irrelevant for a fixed 33-sprite roster, so the extra rule erosion is not justified.

**Decision:** Option A. `SpriteCatalog` is presentation-only — it never defines stats, tiers, hero/enemy effects, shop behavior, or any gameplay data; it is a pure id→Sprite lookup consumed by views.

#### M10 sub-slicing (M10.4, M10.5)

M10.3 (this planning slice) produced this sub-slicing, the architecture decision above, the `CLAUDE.md`/§15 scope amendments, and `Assets/Art/SPRITE_CHECKLIST.md` (the exact PNG list the user must supply). The remaining M10 work is two ready-to-pick slices:

- **M10.4 — Sprite catalog + static base sprites on cards.**
  - *Goal:* introduce the `SpriteCatalog` MonoBehaviour and display each hero's/enemy's static base sprite on its combat unit card (and any other card surface), driven by stable id, with the existing placeholder box as fallback when a sprite is missing.
  - *Files (anticipated):* new `Assets/Scripts/UI/SpriteCatalog.cs`; modify `CombatUnitCardView.cs` (render base sprite by id), `CombatPanelView.cs` and/or `MainMenuPanel.cs` (resolve and pass the catalog reference); scene/prefab wiring for the catalog component and its slots. No combat/run/data logic touched.
  - *Precondition:* the user has supplied the 12 hero + 16 enemy base PNGs per `SPRITE_CHECKLIST.md`.
- **M10.5 — Shared effect-sprite set + category-routed source→target motion.**
  - *Goal:* on each attack/visual-effect replay step, select the shared effect sprite for that unit's effect category, spawn it, and move it source→target via hand-coded RectTransform interpolation, synced to the existing HP-bar + combat-log replay.
  - *Files (anticipated):* modify `CombatPanelView.cs` (effect-sprite spawn/move state machine generalized from the M10.2 board-level sword stab), `CombatUnitCardView.cs` (source/target anchor points), `SpriteCatalog.cs` (effect-id lookup), `MainMenuPanel.cs` (catalog wiring). The existing M10.2 single `_swordSprite` field is replaced by the catalog's `melee_stab` entry. No tween library, no `Animator`, no particles; resolver unchanged.
  - *Precondition:* M10.4 landed; the user has supplied the 5 shared effect PNGs.

#### Effect-category mapping (recommended default, finalized at M10.5 start)

Every attacking unit and every *visible* hero effect maps to exactly one of the 5 shared effect sprites. This is the recommended default routing; exact per-unit assignment is confirmable when M10.5 starts (it is presentation-only and changes no math):

| Category id | Used by |
|---|---|
| `melee_stab` | Hero attacks: Warrior, Knight, Golem, Ninja, Squire, Bard, Apprentice, Enchanter (basic attack). Enemy attacks: Slime, Training Dummy, Cave Bat, Goblin Thief, Tax Collector, Backline Bat, Debt Wraith, Treasure Leech, Dungeon Auditor, Greedy Tank, Greedy Carry, Carry Protector, Carry Champion, Frugal Guard. (Default for any unit without a more specific category.) |
| `arrow` | Hero attacks: Ranger. Enemy attacks: Frugal Archer. |
| `fireball` | Hero attacks: Wizard. |
| `heal` | Hero effect: Priest `OnEndOfCombatRound` heal. Enemy effect: Frugal Healer heal. |
| `enchant` | Hero effect: Enchanter `OnCombatStart` Damage-ally buff. |

Notes: Treasurer has 0 attack and never attacks, so it routes no attack effect; its upkeep effect has no combat visual. Non-visual hero effects (Bard gold-on-win, Knight redirect, Golem armor, Ninja gold-on-kill, etc.) trigger no effect sprite — only an attack uses the unit's attack category. Per-unit-unique attack/effect art is **deferred post-M10 and out of MVP unless re-ratified**; the 5-sprite shared set is the cap.

### Milestone 11: Economy and balance pass

**Goal.** Tune the prototype now that it reads cleanly and tiering exists. No new systems.

**In scope:**

- Tune `GameRules` constants: starting resources, reward sizes, upkeep math, interest divisor, end-condition thresholds.
- Lock the Silver tier-probability curve (placeholder constants → final).
- Lock per-hero Silver bonus numbers (where deferred from M9).
- Replay full 10-round runs across a few archetype builds; document win-rate observations in `PROGRESS.md`.

**Out of scope for M11:** new encounters, new heroes, new payroll actions, new rival behaviors, any system not present in M1–M10.


## 16. Phase 3 — Vertical Expansion

Phase 3 begins after M11's economy/balance pass. The prototype is now playable enough to add one vertical at a time, but the project should still stay small and Codex-friendly.

Phase 3 does **not** approve a broad feature explosion. The following remain out of scope unless a later Phase 3 milestone explicitly ratifies them: full equipment inventory, large hero roster expansion, large campaign/act system, complex status stacking, save/load, online features, meta progression, tutorials, audio polish, or full RPG progression.

### Phase 3 vertical order

Use this order unless a later planning session changes it:

| Priority | Milestone | Vertical | Output |
|---:|---|---|---|
| 1 | M12 | Debt rework and resource-pressure readability | Debt-status tiers, Shop repayment, clearer interest/debt warnings |
| 2 | M13 | Act 1 framing and transition shell | Treat current 10 rounds as Act 1 and add an act-clear handoff shell |
| 3 | M14 | Act 2 mini vertical | Add a small 3-5 encounter follow-up using existing systems |
| 4 | M15 | Difficulty modifiers | Simple run contracts/difficulty presets built from existing constants |
| 5 | M16 | Relic/policy rewards | Loot-like run modifiers without hero equipment or inventory |
| 6 | M17 | Tiered veterancy | Run-local hero XP with automatic stat tiers, if still needed after economy is stable |
| 7 | M18 | Compact combat-status vertical | Add a small, readable six-status set using contained enemy, relic, and Silver-upgrade access |
| 8 | M19 | Prototype assessment and review | Documentation-only feature and code review to decide the next expansion/fix package |
| 9 | M20 | Act expansion foundation | Expand Act 2 and create reusable act/content scaffolding for Acts 3/4/5 |

### Phase 3 scope rules

- **One vertical per milestone.** Do not combine debt, acts, loot, XP, and statuses in one session.
- **Reuse existing UI surfaces first.** Prefer RunHeader, RewardSummary, EndScreen, Scout, Shop, and existing card views before creating new screens.
- **No full inventory/equipment in Phase 3 planning by default.** If loot is added later, start with global run policies/relics, not per-hero items.
- **No broad hero roster expansion.** New enemies are allowed only inside an approved content milestone such as M14.
- **No complex status stack system.** A later status slice may add one keyword and one clear timing rule only.
- **No save/load or meta progression.** Each run remains a fresh session.
- **Keep `GameRules` as the tuning surface.** New numeric thresholds live there, not scattered through logic files.

### Milestone 12: Debt rework and resource-pressure readability

**Goal.** Make debt feel less instantly punishing while preserving it as the central strategic pressure.

**Why now.** M11 made the current 10-round run acceptable as Act 1 / initial difficulty, but user feedback is that debt currently feels overly punishing. Debt is the game's core hook, so this should be addressed before acts, loot/relics, XP, difficulty modes, or combat-status expansion.

**Design direction.** Debt becomes a readable risk track with escalating warning tiers rather than a surprise fail meter. The player should understand when debt is safe, when it is risky, and when one more unpaid bill may end the run. Debt also needs a recovery loop: the player must be able to deliberately spend gold to pay down principal, rather than only avoiding future debt.

**Debt status tiers.** Exact names and thresholds can tune over time, but M12 starts with:

| Status | Intended feel | Suggested threshold |
|---|---|---:|
| Stable | No immediate problem | 0-5 debt |
| Strained | Debt matters, but the run is healthy | 6-11 debt |
| Dangerous | Interest and debt-scaled enemies are a real threat | 12-19 debt |
| Critical | Near bankruptcy; urgent recovery needed | 20+ debt |

**Initial M12 implementation target.** Keep the first pass conservative:

- Add a Shop **Pay Debt** control that converts gold into debt reduction at 1:1.
- First-pass repayment rule: `DebtPaymentCap = 3`; payment amount = `min(Gold, Debt, GameRules.DebtPaymentCap)`; enabled only when `Gold > 0` and `Debt > 0`.
- The repayment action immediately spends gold, so it competes with hiring and rerolling.
- Add debt status/readability around the existing debt pressure.
- Keep unpaid upkeep, loan debt, interest, Debt Wraith scaling, and debt defeat intact. The point is not to remove debt; it is to make debt readable and recoverable.
- M12.1 may still tune debt thresholds/interest conservatively if the implementation plan for the slice calls for it, but repayment is the core gameplay change.

**In scope for M12:**

- `GameRules` constants/helpers for debt tiers, debt limit, interest divisor, and `DebtPaymentCap`.
- Run-header debt status display.
- Shop Pay Debt button/control.
- Reward/upkeep summary copy that explains debt gained, interest paid/added, and status changes.
- End-screen debt-defeat copy aligned with the new threshold.
- Balance TSV logging kept compatible with the changed thresholds.
- Manual test plans that exercise exact threshold boundaries.

**Out of scope for M12:**

- New heroes, new encounters, new payroll actions, Act 2, relics/loot, equipment/inventory, XP/veterancy, difficulty mode selection, damage/status types, save/load, tutorials, or new resource types.
- Removing debt loss entirely.
- Automatic surplus repayment.
- Adding or replacing payroll actions for repayment.
- Hero behavior changes, enemy behavior changes, high-debt shop surcharges, specific encounter warnings, or new debt enemies before the Shop repayment loop has been tested.
- Rewriting the whole economy loop.
- Changing combat math except for existing debt-dependent behavior continuing to read current debt.

#### M12 expected sub-slicing

- **M12.1 — Debt status + Shop repayment.**
  - *Goal:* make debt more readable and recoverable without removing its strategic pressure.
  - *Files (anticipated):* `GameRules.cs`, `RunState.cs` only if summary fields are needed, `RunManager.cs` if debt-status/repayment helpers belong there, `ShopManager.cs`, `RunHeaderView.cs`, `ShopPanelView.cs`, `MainMenuPanel.cs` if callback wiring is needed, `RewardSummaryView.cs` if general warning/status copy is needed, `TestPlans/TP_M12.1.md`.
  - *Acceptance target:* player can see `Stable` / `Strained` / `Dangerous` / `Critical`; Shop Pay Debt spends up to `DebtPaymentCap` gold to reduce debt 1:1; repayment updates gold/debt immediately and competes with hire/reroll; warnings stay general; Debt Wraith, payroll, hero effects, enemy effects, and content remain unchanged.
- **M12.2 — Debt retest and follow-up tuning.**
  - *Goal:* run a small post-rework balance matrix using the existing balance TSV logger and tune only the M12 constants/repayment cap if needed.
  - *Files (anticipated):* likely `GameRules.cs`, `TestPlans/TP_M12.2.md`, possibly `NEXT_SESSION.md`/`PROGRESS.md` handoff text only.
  - *Acceptance target:* at least three observed run archetypes: stable/no-loan, loan-heavy, and high-upkeep/Silver-heavy; results decide whether to tune repayment/debt pressure, explore deferred debt interactions, or proceed to M13 Act 1 framing.

### Milestone 13: Act 1 framing and transition shell

**Goal.** Reframe the current 10-round dungeon as Act 1 without building a full campaign yet.

**In scope:** act title/copy, Act 1 clear summary, placeholder Act 2 handoff, and documentation of what would carry forward.

**Out of scope:** building Act 2 content, adding a map, save/load, campaign progression, or branching paths.

### Milestone 14: Act 2 mini vertical

**Goal.** Add a small follow-up content slice only after Act 1 framing is accepted.

**In scope:** 3-5 new encounters using existing systems, one new encounter theme, one simple boss, and scout/reward balancing.

**Out of scope:** large campaign, new hero roster, procedural map, full act structure, or new core systems.

### Milestone 15: Difficulty modifiers

**Goal.** Add replayability and balance testing through small run-contract presets.

**In scope:** presets such as Apprentice Ledger, Standard Contract, and Predatory Interest that modify existing `GameRules`-style constants through a small approved surface.

**Out of scope:** unlocks, persistent progression, achievements, save/load, or online rankings.

### Milestone 16: Relic/policy rewards

**Goal.** Add loot-like excitement without equipment or inventory.

**In scope:** global run modifiers presented as card choices, such as guild policies or relics that affect existing economy/combat hooks.

**Out of scope:** per-hero equipment, item slots, inventory management, item rarity ladders, or large item pools.

### Milestone 17: Tiered veterancy

**Goal.** Add run-local tiered veterancy only now that the economy, difficulty, and relic loops are stable enough to support it.

**In scope:** a small XP track on each `HeroInstance`, earned during the current run only. A hero gains +1 XP for surviving a fight. Rival-guild fights and end-of-act fights grant +1 additional XP to surviving heroes. Completing an act grants +1 XP to all current heroes, even if they did not survive the act-ending fight. Veteran tiers are awarded automatically at XP thresholds 2, 5, 9, then continue with increasing gaps (+5, +6, and so on). Each veteran tier grants configurable stat bonuses, initially +1 attack and +1 max HP per tier, stored in `GameRules`.

**Out of scope:** XP spending, branching choices, skill trees, class evolution, new abilities, unlocks, save/load, meta progression, persistent account progress, hero classes, equipment, or any non-stat reward. Veterancy stacks with Silver tier, relics, and difficulty modifiers, but M17 should keep the implementation deterministic and readable.

### Milestone 18: Compact combat-status vertical

**Goal.** Add a compact status vocabulary only after the combat UI and balance can support it.

**Completed direction.** M18.0 reviewed the older "one keyword" placeholder and, with user approval, expanded it into a small six-status set because the combat card UI could support compact indicators and the existing enemies/relics/Silver upgrades had natural hooks.

**Implemented statuses:**

| Status | Readable role |
|---|---|
| Guarded | Reduces the next incoming hit, then is consumed. |
| Burned | Lowers the afflicted unit's attack and deals self-damage after it attacks. |
| Poisoned | Deals growing self-damage after the afflicted unit attacks. |
| Marked | Increases the next incoming hit, then is consumed. |
| Weakened | Lowers the afflicted unit's attack. |
| Inspired | Increases the next outgoing hit, then is consumed. |

**Completed sub-slicing:**

- **M18.0 - Status keyword planning + first-slice definition.**
  - Documentation-only planning that approved the compact six-status direction.
- **M18.1 - Multi-status combat keywords, enemy-side first pass.**
  - Added shared status data/state, combat log/replay support, combat-card indicators, and enemy-side status touchpoints using existing enemies.
- **M18.2 - Relic/upgrade variants for player-side status access.**
  - Added narrow player access through existing relic rewards and selected Silver hero upgrades.

**Still out of scope:** damage types, resistances, stack counts, durations, a large status library, a broad status-choice system, full combat-type systems, or new status mechanics outside explicit later milestones.

### Milestone 19: Prototype assessment and review

**Goal.** Pause new implementation and review the expanded prototype before choosing the next package of fixes or expansions.

**Why now.** M12-M18 added debt readability, Act 2 shell/content, difficulty, relics, veterancy, and statuses. Functionality is assumed acceptable, but the prototype has not yet had a whole-game feature review or a major-systems code review. The next move should expand existing verticals only where they help the current game, not add a brand-new vertical by default.

**M19 is documentation-only.** No runtime C# code, Unity scenes, prefabs, art assets, generated files, or gameplay behavior should change during M19. Review findings should be written into planning/test documents and used to define M20.

**Initial M19.0 assessment outcome.**

- Recommendation: do not add a new vertical yet. Use M19 to assess and document expansion opportunities inside existing verticals, then let M20 become the selected package of fixes and expansions.
- Strongest systems: the debt/payroll hook, the Scout -> Shop -> Payroll -> Formation -> Combat loop, deterministic hero/enemy effect interactions, and the now-readable combat card/status/relic surfaces.
- Likely expansion candidates: visuals and combat presentation, Act 2 and later act content, more enemies/encounters, possible carefully scoped hero roster growth, and deeper use of existing relic/status/veterancy systems.
- Noisiest or riskiest systems: feature density in the run header/reward/combat UI, broad static data inside `DataRepository`, growing combat/status/relic coupling across `CombatManager`, `HeroEffects`, and `RunManager`, and review gaps from several late Phase 3 test plans that were drafted or visually accepted rather than fully checkbox-run.
- Outside-tester readiness is important later, but not the immediate framing. First decide which existing verticals deserve expansion and which code seams should be cleaned before that expansion.

**M19.1 vertical inventory outcome.**

Dungeon Debt has enough vertical breadth for an auto-battler/economy-management prototype. The project should not add a brand-new independent system before M20. It should deepen the existing act/content structure and make the current systems easier to scale into later acts.

| Vertical | Current implementation depth | M19.1 read |
|---|---|---|
| Core run loop | Mature for prototype | Fully wired Scout -> Shop -> Formation -> Payroll -> Combat -> Reward -> Relic/Rival/Act routing. Keep stable. |
| Debt/economy | Mature and central | Gold, debt, morale, upkeep, interest, debt tiers, Pay Debt, and debt-scaling threats carry the game's identity. Expand only through act-aware pressure and payroll choices, not new currencies. |
| Shop/party | Moderate to mature | Hire/fire/reroll, duplicate-to-Silver, Silver offers, and Pay Debt work. Needs later-act recruitment support so late hires are not strictly punished by missing XP and new upkeep. |
| Formation | Moderate | Five slots, front/back targeting, and several effects care about position. Future encounters should ask more of formation rather than adding new formation rules first. |
| Payroll | Moderate but under-expanded | Four actions are enough for the prototype, but payroll is thematically important and could support act-aware variants later. Keep M20 focused on acts before adding payroll breadth. |
| Combat resolver | Mature for prototype | Deterministic combat, replay events, hero/enemy effects, statuses, and stat scaling are all implemented. Future act content should reuse this surface. |
| Heroes | Mature count, moderate depth | The 12-hero roster is sufficient for now. Do not expand roster until encounters prove the current roster is strategically exhausted. |
| Enemies/encounters | Moderate and highest expansion value | Act 1 plus a thin Act 2 exists, but encounters are fixed and repeatable. This is the best M20 expansion target. |
| Rival guilds | Thin to moderate | Three guild identities and ghost fights exist, but rivals should evolve each act like the player does. Each act should include one fight against each guild. |
| Acts | Thin vertical | Act 2 is currently a 3-fight rematch shell. M20 should turn Act 2 into the first scalable act-expansion pattern for Acts 3/4/5. |
| Difficulty presets | Moderate | Three contracts are enough for replay and balance. Leave alone unless balance testing identifies a problem. |
| Relics/policies | Moderate | Eight global relics work through existing reward flow. Avoid broad relic growth until UI density and act structure are reviewed. |
| Veterancy | Moderate | Run-local XP and automatic tiers work, but late hires are disadvantaged. Add a simple act-aware catch-up rule only if M20 design approves it. |
| Statuses | Moderate to high for prototype | Six statuses are enough. Treat as content hooks for enemies/relics, not a system to broaden now. |
| Visual/combat presentation | Moderate | Combat is currently the cleanest view, though it carries the most information. Other major views need design proposals before large act/content growth. |
| Randomness/replayability | Thin | Combat remains deterministic, but encounter order/content is fixed. M20 should introduce controlled non-combat randomness through act encounter pools using `RunManager.Random`. |

**M19.1 expansion recommendation.**

- Make **Act 2 expansion and act-content scaffolding** the M20 priority.
- Build M20 so Acts 3/4/5 can later be mostly content authoring: add images, assign existing effect animation categories, create encounter/guild variants, and tune numbers rather than inventing new systems.
- Each act should include one fight against each rival guild. Guilds should evolve alongside the player: Greedy stays high-power/high-debt, Carry protects escalating threats, and Frugal stays efficient/resilient.
- Add controlled randomness outside combat, likely by choosing from act encounter pools or varying fight order within act constraints. Keep combat deterministic.
- Address the late-hire problem in M20 design. Current incentives favor locking an early tank/damage core and then adding economy/support around it. A simple act-aware minimum XP or trained-hire rule should be considered so later recruitment can be viable without adding a new progression screen.
- Add a Claude design proposal pass for major views before heavy content growth: Main Menu/Run Contract, Scout, Shop, Formation, Payroll, Combat, Reward Summary, Relic Reward, Rival Leaderboard/Update, and End/Act Transition. Combat can be the reference point because it was recently rebuilt, but it also has the densest information.

**Expected sub-slicing:**

- **M19.1 - Feature expansion review.**
  - *Goal:* review the current feature surface and recommend which existing verticals should be expanded, pruned, retuned, or deferred before M20.
  - *Files (anticipated):* `IMPLEMENTATION_PLAN.md`, `NEXT_SESSION.md`.
  - *Acceptance target:* current systems are inventoried by implementation depth; act/encounter/guild expansion is recommended as the M20 direction; out-of-scope new verticals are rejected or deferred; M19.2 is left ready as the next documentation-only code review slice.
- **M19.2 - Major systems code review.**
  - *Goal:* review major runtime systems for maintainability and expansion risk without changing code.
  - *Files (anticipated):* `IMPLEMENTATION_PLAN.md`, `NEXT_SESSION.md`; no runtime code edits.
  - *Acceptance target:* code seams, coupling risks, data-growth risks, UI construction risks, and test gaps are documented; M19.3 is left ready as the next cleanup/seam-prep slice.

**M19.2 code-review outcome.**

System seam table (reviewed 2026-05-16):

| System | Safe to extend directly? | Risk / note |
|---|---|---|
| `ShopManager` | ✅ Yes | Self-contained; no act coupling |
| `PayrollManager` | ✅ Yes | Small switch-dispatch; no act coupling |
| `CombatManager` | ✅ Yes | Deterministic; replay; status hooks work |
| `HeroEffects` | ✅ Yes | Static dispatch by `HeroEffectId`; stale "M11 can replace" comment is cosmetic |
| `GameRules` | ✅ Yes (constants) | Binary act helpers need extending but changes are additive |
| `GameManager` | ⚠️ Soft | `EnsureManagers()` re-runs every transition; flat if-ladder; `ContinueToAct2()` is non-generalizable |
| `RunManager` | ⚠️ Shape change | Hard-ceilinged at 2 acts: `EvaluateNextState`, `AdvanceToAct2`, and all act helpers branch binary (Act1 vs `FinalAct=2`); Acts 3/4/5 impossible without generalizing |
| `DataRepository` | ⚠️ Shape change | Flat `EncounterDefinitions` list; all encounters hardcode absolute round numbers; duplicate enemy Ids (intentional for sprites, latent collision in `SurvivorFlags` if variants co-occur); dead `RunState.Encounters` field; stale sandbox methods |
| `RivalManager` | ⚠️ Shape change | String-literal branching on `rival.Id`; `RivalGuildState` has no link to per-act combat roster |
| `EncounterManager` | ❌ Blocker | `FindEncounterForRound` is a linear scan of absolute round numbers; no act pool; no `RunManager.Random` seam at all; entire lookup strategy must change for act pools |
| `MainMenuPanel` | ❌ Cleanup | 981-line god-object: scene builder + visibility router + input hub + core-system bootstrapper; top refactor target before act-content or view growth |

**M19.3 punch list (6 non-safe items):**

1. **EncounterManager (blocker):** Replace `FindEncounterForRound` with an act-pool lookup. Encounters should be keyed by act+type (not absolute round). Add a `RunManager.Random` seam for pool selection.
2. **RunManager (act model):** Generalize `EvaluateNextState` and `AdvanceToAct2` beyond the binary Act1-vs-FinalAct=2 ceiling. `GetRoundsInAct`/`GetActFinalRound` helpers in `GameRules` should extend to N acts.
3. **DataRepository (shape):** Re-key encounter definitions by act + slot (not absolute round). Remove or document dead `RunState.Encounters` field. Remove or isolate stale sandbox methods (`PrepareSandboxRun`, `CreateSandboxRun`, `SandboxEncounter`).
4. **RivalManager (shape):** Replace string-literal `rival.Id` branching with a data-driven dispatch (enum or typed field). Add a per-act roster reference to `RivalGuildState` or a companion data structure.
5. **GameManager (soft):** Extract the `EnsureManagers()` guard to run only on first init, not every transition. Evaluate breaking `ContinueToAct2` into a generalizable act-advance path. Low urgency — do after blockers.
6. **MainMenuPanel (cleanup):** Extract scene-building constants and layout code, visibility routing, and core-system bootstrapping into dedicated helpers or scripts. Target: no single method over ~80 lines.

7. **Red Ink Brand behavior (confirm):** `_redInkBrandApplied` flag is set per-combat but `Marked` only applies when the triggering hit target *survives*. Kill-on-first-hit silently skips the Marked application that combat. Confirm this is intended; if not, fix the guard condition in `CombatManager`.
8. **Act 2 capstone type (confirm + fix if needed):** Round 13 ("Frugal Guild Rematch") is typed `EncounterType.RivalGhost`, not `FinalBoss`. `IsRelicEligibleEncounter` treats all `RivalGhost` encounters as relic-eligible, so Act 2 gives relics on rounds 11, 12, and 13. Confirm whether this is the intended reward shape; if round 13 should be `FinalBoss` (no relic), update the encounter definition and verify relic-eligibility logic.

**Dead seams to remove (covered by item 3 above):**
- `RunState.Encounters` — initialized but never populated or read.
- `DataRepository.PrepareSandboxRun`, `CreateSandboxRun`, `SandboxEncounter` — carried from M3.2, unused in live run flow.

**Test-gap notes:**
- No automated tests exist. Every M19.3 change will need a full manual 13-round regression covering act transition, encounter lookup, relic eligibility, rival fight detection, and payroll across all three difficulty presets.
- The highest manual-verification risk is encounter lookup: a shape change to `DataRepository` + `EncounterManager` simultaneously affects all 13 rounds.

- **M19.3 - Code seam cleanup / pre-M20 prep.**
  - *Goal:* clean the six highest-risk code seams identified in M19.2 so act expansion work in M20 lands on a solid foundation.
  - *Files (anticipated):* `EncounterManager.cs`, `RunManager.cs`, `DataRepository.cs`, `RivalManager.cs`, `GameManager.cs`, `MainMenuPanel.cs`, `GameRules.cs`, `RunState.cs`, `IMPLEMENTATION_PLAN.md`, `NEXT_SESSION.md`.
  - *Acceptance target:* all eight punch-list items resolved or explicitly deferred with rationale; dead seams removed; M20.0 is left ready as the next documentation-only act expansion design brief.

**M19.3 code-seam cleanup outcome (completed 2026-05-16).**

All eight punch-list items resolved; build clean (0 warnings / 0 errors). No M20 act content added — the act model is generalized to N acts but still configured for the existing 2-act / 13-round content, so all current behavior is preserved.

Behavior confirmations (before any related code change):
- **Item 7 — Red Ink Brand:** Confirmed *intended, no code change*. `ApplyRelicAttackStatuses` is only invoked in the defender-survives branch (`CombatManager` damage path), so a kill-on-first-hit never reaches it and never consumes `_redInkBrandApplied`; the next surviving-target hit applies `Marked`. This exactly matches the relic text ("First hero-side attack each combat applies Marked if the target survives"). The punch-list concern that the flag is consumed on a kill was not borne out by the code.
- **Item 8 — Act 2 capstone / relics:** Per user decision, final bosses *do* award a relic, and Act 2 will become a full 10-round act with the final boss on round 20 — but that content fill is **M20**, not M19.3 (it would add new encounters and break the 13-round regression / AC5). M19.3 instead generalized relic eligibility to `RivalGhost OR FinalBoss` (content-agnostic; behavior-identical for the current 13 rounds: round 10 stays relic-eligible as the Act 1 boss, rounds 3/6/9/11/12/13 as rival ghosts). The Act-2-to-10-rounds + round-20-boss expansion is captured in the M20.0 brief.

Seam changes:
1. **EncounterManager (blocker):** `FindEncounterForRound` (absolute-round linear scan) replaced with an act+slot pool lookup via `DataRepository.GetEncounterPool(act, slot)`; pool selection uses the `RunManager.Random` seam when a slot has >1 candidate (currently 1 each → deterministic, unchanged).
2. **RunManager (act model):** `EvaluateNextState` generalized to a single per-act-final-round check; `AdvanceToAct2` → `AdvanceToNextAct` (increments act, jumps to next act's start round, guarded at the final act); `IsRelicEligibleEncounter`/`IsEndOfActEncounter` generalized to be act-count agnostic. Exact string/flow parity for the current 2 acts.
3. **GameRules:** Act lengths are now data (`ActRoundCounts` table). `GetRoundsInAct`/`GetActFinalRound`/`GetRoundWithinAct`/`GetActLabel` generalized to N acts; added `TotalActs`, `GetActStartRound`, `GetAbsoluteRound`, `GetActForRound`. `Act1FinalRound`/`Act2FinalRound`/`Act1Rounds`/`Act2Rounds`/`FinalAct`/`FinalRound` kept as derived members for existing references (const → static property; no const-expression consumers).
4. **DataRepository:** All 13 encounters re-keyed by `(act, slot)` instead of hardcoded absolute round; absolute `Round` is now derived. Added `GetEncounterPool(act, slot)` and the per-act rival-roster seam `GetRivalEncounter(act, guild)`. Dead `SandboxEncounter`/`SandboxEncounterDefinition`/`CreateSandboxRun` removed.
5. **RivalManager / RivalGuildState:** String-literal `rival.Id` branching replaced with the typed `RivalGuild` enum (`Greedy`/`Frugal`/`Carry`/`None`); the loose `Id` string was removed (no other readers). `EncounterDefinition.RivalGuild` now carries the typed guild link.
6. **GameManager:** `EnsureManagers()` gated by a `_managersReady` flag so the find/add/Initialize wiring runs once on first init instead of on every state transition; `Initialize(RunManager)` forces a single clean rewire with the bootstrapper's canonical RunManager. `ContinueToAct2` → `ContinueToNextAct`.
7. **MainMenuPanel:** 981-line god-object decomposed. `HandleStateChanged` (~242 lines) → a dispatch over per-state `Show*State` helpers; `BuildUi` (~211 lines) → an ordered orchestrator over focused `Build*` helpers (sibling/draw order preserved). No method exceeds ~80 lines. No new files (per the slice's "create none" constraint).

Dead seams removed: `RunState.Encounters`, `DataRepository.PrepareSandboxRun`/`CreateSandboxRun`/`SandboxEncounter` (and the now-dead `MainMenuPanel` sandbox-encounter fallback).

### Milestone 20: Act expansion foundation

**Goal.** Expand Act 2 while building the repeatable act/content scaffolding that lets Acts 3/4/5 become mostly content authoring instead of new feature work.

**Why this direction.** M19.1 found that the game already has enough vertical systems. The next value is not a new layer; it is turning the current acts, encounters, rival guilds, and content surfaces into a scalable structure that can support longer runs and replayability.

**Direction, pending M19.3 seam cleanup.**

- Act 2 should become a fuller act using existing systems: dungeon/economy-pressure fights, one fight against each rival guild, and an act capstone.
- Later Acts 3/4/5 should follow the same content pattern. The technical work should make those acts data/content additions where possible.
- Rival guilds should evolve each act, with clear identities that scale alongside the player.
- Encounter randomness should be controlled and non-combat only: choose from act encounter pools or vary order within constraints using `RunManager.Random`; combat itself stays deterministic.
- Late hiring should become more viable in later acts, likely through a simple act-aware catch-up rule considered during M20.0.
- Major view design proposals should happen before heavy act content expansion, so additional act information does not overwhelm the UI.

**Expected sub-slicing:**

- **M20.0 - Act expansion design brief.**
  - *Goal:* define the reusable act format, Act 2 expansion target, future Acts 3/4/5 content pattern, guild evolution rules, encounter randomness approach, late-hire catch-up proposal, and view-design proposal checklist.
  - *Files (anticipated):* `IMPLEMENTATION_PLAN.md`, `NEXT_SESSION.md`.
  - *Acceptance target:* M20.1 is left ready with concrete implementation scope, file list, and 2-5 acceptance criteria.
- **M20.1+ - Implementation slices.**
  - *Goal:* implement the approved Act 2 expansion foundation in small, testable slices after M20.0.
  - *Likely areas:* act encounter pools, randomized act encounter selection, expanded Act 2 content, guild evolution data, late-hire catch-up, and approved view/UI readability changes.

**Out of scope until explicitly selected:** a new independent vertical unrelated to acts/content, save/load, online features, meta progression, full equipment/inventory, tutorial, audio polish, broad architecture rewrites, large hero roster expansion, or unchecked content expansion without a ready slice.

---

### M20.0 act-format design outcome (completed 2026-05-16, documentation-only)

No runtime C# / scene / prefab / art changed. This subsection is the design source for the M20.x implementation slices. User decisions captured in this session are marked **[locked]**; items left open are marked **[explore]** with a recommendation.

#### Design reconciliation with `GAME_DESIGN.md`

`GAME_DESIGN.md` §MVP Scope lists "Multiple acts / Full campaign" under **Not Included**, but the same section explicitly states that later Phase 3 milestones may ratify narrow versions, in which case the `IMPLEMENTATION_PLAN.md` milestone scope controls that vertical. M20 is that ratification for acts. This is a narrow act expansion (no map, no branching, no save/load, no campaign meta) — it does not contradict the design doc's core loop or design warning. The core loop (Scout → Shop → Payroll → Formation → Combat → Reward → Upkeep → Rival) is unchanged; acts only extend its length and content.

#### Reusable act format (the template every act follows)

An act is a contiguous block of absolute rounds (`GameRules.ActRoundCounts[i]` rounds for act `i+1`). The standard act is **10 slots**, parallel to Act 1, with this slot-role template:

| Slot | Role | Type | Notes |
|---:|---|---|---|
| 1 | Intro / stat check | Dungeon | Light opener that re-establishes the act's theme |
| 2 | Economy pressure | Dungeon | Gold/upkeep/reward-drain beat |
| 3 | **Guild fight A** | RivalGhost | Easiest guild this act |
| 4 | Formation/backline test | Dungeon | Asks something of positioning |
| 5 | Threat ramp | Dungeon | Mid-act difficulty step |
| 6 | **Guild fight B** | RivalGhost | Mid-difficulty guild this act |
| 7 | Economy/debt punishment | Dungeon | Debt-scaling or reward-pressure beat |
| 8 | Heavy dungeon | Dungeon | Pre-finale stress test |
| 9 | **Guild fight C** | RivalGhost | Hardest guild this act |
| 10 | **Capstone** | FinalBoss | Act boss; awards a relic (`RivalGhost OR FinalBoss` rule) |

**[locked]** Recurring pressure beats that must recur every act (mapped onto the dungeon slots above): one upkeep/economy-drain fight, one debt-scaling fight, one formation/backline test, one reward-pressure fight. These keep the debt/payroll core hook active across the whole run.

**[locked]** Guild-fight ordering is by rough difficulty: **Frugal (slot 3) → Greedy (slot 6) → Carry (slot 9)**. (This differs from Act 1's authored order; Act 1 itself is the intro act and is not retro-fitted.)

**[locked]** Every act includes exactly one fight against each rival guild (Frugal, Greedy, Carry), reached through the existing `DataRepository.GetRivalEncounter(act, guild)` seam.

#### Act 2 target — rounds 11–20, demonic identity

**[locked]** Act 2 becomes a full 10-round act (`ActRoundCounts` → `{10, 10}`), rounds 11–20, with a **demonic theme** as its own identity. Act 1 was an intro; Acts 2–5 each get a distinct identity.

Act 2 slot map (absolute round = `GameRules.GetAbsoluteRound(2, slot)`):

| Slot | Round | Role | Enemy plan |
|---:|---:|---|---|
| 1 | 11 | Intro stat check | **NEW** demonic swarm |
| 2 | 12 | Economy pressure | **NEW** demonic gold/upkeep drain |
| 3 | 13 | Guild fight — **Frugal** | Reuse existing `Act2Frugal*` defs (retune only) |
| 4 | 14 | Formation/backline test | **NEW** demonic backline striker |
| 5 | 15 | Debt punishment | **REUSE Debt Wraith**, retuned for Act 2 (already demonic-fitting; no new asset) |
| 6 | 16 | Guild fight — **Greedy** | Reuse existing `Act2Greedy*` defs (retune only) |
| 7 | 17 | Reward pressure | **NEW** demonic reward-drain |
| 8 | 18 | Heavy dungeon | **NEW** demonic brute |
| 9 | 19 | Guild fight — **Carry** | Reuse existing `Act2Carry*` defs (retune only) |
| 10 | 20 | Capstone | **NEW** demonic Act 2 final boss (`EncounterType.FinalBoss`, awards relic) |

The three existing Act 2 rival rematch encounters (currently authored at `(2,1)/(2,2)/(2,3)` as Greedy/Carry/Frugal) are **re-slotted** to `(2,3)/(2,6)/(2,9)` in Frugal→Greedy→Carry order during M20.1. Their `Act2*` enemy definitions already exist and are reused (numeric retune only).

#### New Act 2 enemy assets to author (called out now so art can start)

Names are working placeholders — the user may rename. All are demonic-themed. These need **one static base sprite each** (per `CLAUDE.md` M10.4 carve-out; new enemies are allowed inside an approved content milestone, which M20 is):

1. **Imp** — basic demonic swarm; Act 2 intro stat check (Slot 11). Slime analogue.
2. **Soul Broker** — demonic economy pressure: drains gold / inflates upkeep (Slot 12). Goblin Thief / Tax Collector analogue.
3. **Gloom Bat** — demonic backline striker; formation test (Slot 14). Backline Bat analogue.
4. **Hoard Fiend** — demonic reward-drain: reduces reward if it survives (Slot 17). Treasure Leech analogue.
5. **Brimstone Brute** — heavy front-line demon; pre-finale stress test (Slot 18).
6. **Act 2 final boss** (working name **"Pit Lord" / "Infernal Auditor" / "Debt Archon"** — user to pick) — demonic capstone (Slot 20), `FinalBoss`, awards relic.

Reused with no new asset: **Debt Wraith** (Slot 15, already fits the demonic theme; numeric retune only). The three Act 2 guild rematch rosters already have `Act2*` definitions and existing sprites — reuse as-is or recolor at the user's discretion (optional, not required for M20.1).

So the minimum new-art set for Act 2 is **6 enemy sprites** (5 demonic dungeon/brute + 1 demonic boss).

#### Acts 3/4/5 content pattern

Later acts are **mostly content authoring**, no new feature work: append a round count to `GameRules.ActRoundCounts`, author 10 `(act, slot)` encounter definitions following the slot-role template, assign existing enemy/effect/relic/status hooks, supply per-act guild rosters via `GetRivalEncounter`, add new themed enemy sprites, and tune numbers in `GameRules`. Each act gets a distinct environment/theme identity (Act 2 = demonic; Acts 3–5 themes TBD with their own asset call-outs).

**[explore] Act-identity structure for Acts 2–5 (decision deferred, does not block Act 2):**

- **Option A — environment-themed acts (locked for Act 2).** Each act has an environment/monster identity; the capstone is a themed monster boss. The three guild fights remain mid-act benchmarks.
- **Option B — guild-owned acts.** Acts 2–4 are each "owned" by one rival guild whose evolved leader *is* that act's `FinalBoss` capstone (the other two guild fights still appear mid-act). **Act 5** becomes a "super guild" / combined-guild gauntlet finale.
- **Recommendation:** lock Act 2 as Option A (demonic environment) now so demonic enemy + boss art can begin immediately; decide Option A vs B for Acts 3–5 in a dedicated design note or an early M20.x design slice. Option B is compatible with the per-act "one fight vs each guild" invariant — it only changes what the capstone *is* — so deferring it does not block Act 2 implementation or asset work.

#### Guild-evolution rule (directional, numbers are M20.x `GameRules` tuning)

Each act, all three guilds grow, keeping their identities and their relative difficulty order (Frugal easiest → Greedy → Carry hardest):

- **Frugal** — efficient/resilient. Modest per-act stat growth, growth weighted toward sustain (healer scaling). Lowest burst; placed first in the act.
- **Greedy** — high-power/high-debt. Steepest raw attack/HP growth per act ("richer and meaner"); placed mid-act.
- **Carry** — protects an escalating champion. The protected carry's attack scales hardest per act while the protectors scale modestly; placed last as the act's hardest guild fight.

Growth is expressed as per-act multipliers/increments in `GameRules` (e.g. a per-act guild scaling table), not hardcoded per-encounter. M20.0 fixes only the *direction*; M20.x balance slices set final numbers.

#### M20 encounter-randomness rule

- **Guild slots (3, 6, 9) and the capstone (slot 10) are fixed:** single-candidate pools, deterministic, fixed order. This preserves the guild cadence and act narrative.
- **Dungeon slots may hold pooled variants:** a `(act, slot)` key may have 2+ candidate `EncounterDefinition`s; `EncounterManager` selects one via the `RunManager.Random` seam already added in M19.3. Only *which non-guild encounter appears* varies — combat itself stays fully deterministic.
- **M20.1 authors single-candidate pools only** (no randomization yet). Pooled dungeon variants are a later M20.x slice. The data is authored pool-ready (lists), so adding variants later is pure content, no code change.

#### Late-hire catch-up proposal (proposal only — not implemented in M20.0 or M20.1)

**[locked]** Direction: **act-aware minimum XP**. A hero hired during act `N` is granted a starting XP floor equal to a per-act constant (e.g. a `GameRules` `ActHireXpFloor` table), so a hero recruited in Act 2+ is not permanently behind veterans who have earned XP since Act 1. Tunable in `GameRules`; no new screen, no new UI — the existing veteran progress label/bar reflects the floor automatically. Alternative noted for the implementing slice: a "trained hire" first-act bonus-survival-XP rule. Implementation is a dedicated later M20.x slice, **not** M20.1, and must not add a progression screen or meta progression.

#### Major-view design-proposal checklist

Flags which views need a Claude readability design proposal **before** heavy Act 2 content lands (a view-readability proposal slice should precede or accompany the bulk content slices):

| View | Status | Reason |
|---|---|---|
| Scout | **NEEDS proposal** | Must compactly communicate act, theme, escalating threat, guild identity, reward, and danger across 20 rounds |
| Run Header / Run Contract | **NEEDS proposal** | Act indicator must stay legible across N acts alongside debt status + resources |
| End / Act Transition | **NEEDS proposal** | M19.3 flagged literal "Act 1 Clear"/"Act 2 Complete" strings; must generalize for N acts + per-act identity |
| Reward Summary | **NEEDS proposal** | Must distinguish act-clear vs normal round reward and the relic-on-capstone moment |
| Combat | MONITOR | Recently rebuilt and the densest view; reference point. Re-check only if act content adds new indicators |
| Rival Leaderboard / Update | MONITOR | Guilds now evolve per act; verify it still reads correctly across acts |
| Shop / Formation / Payroll | LOW | Stable; revisit only if the late-hire rule or act-aware payroll variants add UI |
| Relic Reward | LOW | Works through existing reward flow; no act-specific change expected |
| Main Menu / Run Contract entry | LOW | No act-specific change at run start |

The four **NEEDS proposal** views are a prerequisite gate before the bulk Act 2 content slices.

#### M20.1 — first implementation slice (left ready)

- **ID:** M20.1
- **One-sentence goal:** Extend Act 2 to a full 10-round act (rounds 11–20) with a demonic-themed encounter skeleton — Frugal/Greedy/Carry guild fights at slots 3/6/9 and a new demonic `FinalBoss` at round 20 — using deterministic single-candidate encounter pools (no encounter randomization yet).
- **Files to modify:**
  - `DungeonDebt/Assets/Scripts/Core/GameRules.cs` — `ActRoundCounts` `{10, 3}` → `{10, 10}`; add Act 2 enemy/boss numeric constants.
  - `DungeonDebt/Assets/Scripts/Core/DataRepository.cs` — author the 6 new Act 2 demonic enemy definitions; author 10 `(2, slot)` encounter definitions per the slot map; re-slot the existing Act 2 guild rematch encounters to `(2,3)/(2,6)/(2,9)` in Frugal→Greedy→Carry order; reuse Debt Wraith (retuned) at `(2,5)`.
  - `DungeonDebt/Assets/Scripts/UI/EndScreenView.cs` — generalize the literal "Act 1 Clear"/"Act 2 Complete" copy for N acts (M19.3 follow-up).
  - `DungeonDebt/Assets/Scenes/Main.unity` and/or the `SpriteCatalog` MonoBehaviour — add id→Sprite slots for the 6 new Act 2 enemies (presentation only, per M10.4 carve-out).
  - `TestPlans/TP_M20.1.md` — manual test plan (new file).
- **Acceptance criteria:**
  1. `GameRules.ActRoundCounts` makes Act 2 a 10-round act (rounds 11–20); all act helpers and the Act 1→Act 2 transition resolve correctly for a 20-round run.
  2. Act 2 has 10 authored `(2, slot)` encounters matching the slot map: demonic dungeon slots, guild fights at slots 3/6/9 in Frugal→Greedy→Carry order, and a `FinalBoss` at round 20 that awards a relic via the existing `RivalGhost OR FinalBoss` rule.
  3. The 6 new Act 2 demonic enemy definitions exist and are referenced only by Act 2 encounters; Debt Wraith is reused (retuned) at slot 15; no Act 1 encounter or enemy behavior changes.
  4. End/act-transition copy is generalized (no hardcoded "Act 1"/"Act 2" literals) and a full 20-round run is completable in the Unity Editor.
  5. All Act 2 encounter pools are single-candidate/deterministic (no `RunManager.Random` variation introduced this slice); combat remains deterministic.

---

### M20.2 major-view readability proposal outcome (completed 2026-05-17, documentation/design-only)

No runtime C# / scene / prefab / art changed. M20.2 produced a **Claude-design handoff package** (the user's chosen workflow): rather than prose-only proposals embedded here, the readability design is delegated to a separate Claude design session that returns **HTML/JSX reference mockups**, hand-translated back to uGUI in later slices.

**Artifacts produced (repo-root `Design/` folder — user-ratified; consolidated with the pre-existing `Design/Inputs/` screenshots, parallel to `TestPlans/`, not under `Assets/`):**

- `Design/M20.2/DESIGN_BRIEF.md` — self-contained brief: project one-pager, hard tech/scope constraints encoded as MUST/MUST NOT, and per-view sections for **five** views (Run Header/Run Contract, Scout, End/Act Transition, Reward Summary, Combat), each with current data, the 20-round/multi-act problem, what stays the same, and 2–5 implementation acceptance criteria. Asks for one shared visual system expressed as per-view mockups.
- `Design/M20.2/SCREENSHOT_MANIFEST.md` — current-state capture list pointing at the existing `Design/Inputs/` folder: `scout.PNG`/`combat.PNG` are the Act 1 baseline; the manifest enumerates the still-needed multi-act / capstone / high-debt / End-screen variants.
- `TestPlans/TP_M20.2.md` — planning-document review checklist (no Unity runtime steps).

**User decisions captured this session (locked):**

- **[locked]** Workflow = handoff brief out → Claude design returns HTML/JSX → ingested in M20.3+. M20.2 itself produces only the brief + manifest, no mockups.
- **[locked]** **One shared visual system** across all views, expressed as per-view mockups.
- **[locked]** **Combat is escalated from MONITOR to a full design-brief section**, scoped as a **re-skin to the shared system, not a rebuild** (no new combat layout/mechanics, no >5 effect sprites). This over-satisfies its M20.0 MONITOR re-check.
- **[locked]** M20.3 implements the **highest-priority view group only** (Run Header + Scout); the remaining views follow in M20.4+.
- **[locked]** Screenshots captured via Windows Snipping Tool (variable crop); mockups target the 1920×1080 reference regardless.
- **[locked]** Claude design delivered the full mockup set into `Design/M20.2/mockups/` (shared system "Guild Ledger" = `system.css`; per-view `run-header/scout/end-transition/reward-summary/combat.html`; `index.html`; `RATIONALE.md`). Reviewed and verified complete + brief-§2-compliant (no forbidden motion, no box-shadow; two decorative `repeating-linear-gradient` hatches with flat fallback).
- **[locked]** Run Header height **80px → 120px accepted** (88px primary + 32px relic strip, fixed-height thin chrome). M20.3 must reclaim ~40px from the panel region below the header so it does not overlap panel content. The 80px-locked variant was explicitly not requested.

**MONITOR re-check note — Rival Leaderboard / Update (`RivalLeaderboardView.cs`):** Re-checked for 20-round / multi-act legibility. The view renders a fixed-column monospace-style text table (`You` + the 3 rival guilds) sorted by morale, with a `compact` font-size mode. Row count is bounded (1 player + 3 guilds) and **does not grow with rounds or acts**, so the table itself stays legible across a 20-round run. **One latent readability gap, not a blocker:** the `Status` column shows `rival.StatusLabel` and the player row is hardcoded `"Stable"` (a literal, unrelated to the player's actual debt tier); as guilds evolve per act (M20.x guild-evolution), per-act guild power changes are not conveyed here beyond morale/debt/pay numbers, and the hardcoded player `"Stable"` will read inconsistently with the new shared debt-severity color language landing in the Run Header. **Recommendation:** fold a Rival Leaderboard pass into a later M20.x view slice (after the shared system exists) — surface the player's real debt status and apply the shared severity colors; no defect filed (functionally correct, no overflow at 20 rounds).

#### M20.3 — first readability implementation slice (left ready)

- **ID:** M20.3
- **One-sentence goal:** Using the Claude-design HTML/JSX reference mockups returned into `Design/M20.2/mockups/`, implement the shared visual system for the **two highest-priority views — Run Header / Run Contract and Scout** — in Unity uGUI, so both read correctly across a 20-round, multi-act, per-act-identity run, without changing any game logic.
- **Precondition (satisfied):** Claude design has delivered mockups + rationale into `Design/M20.2/mockups/` (`system.css`, `index.html`, `run-header.html`, `scout.html`, `end-transition.html`, `reward-summary.html`, `combat.html`, `RATIONALE.md`, `_review/*.png`), reviewed in the M20.2 session. M20.3 step 1 is to read them (start at `index.html`, then `system.css` + the Run Header / Scout view files + `RATIONALE.md`); do not invent or deviate from the delivered system. Run Header is the locked 120px design.
- **Files to modify (anticipated):**
  - `DungeonDebt/Assets/Scripts/UI/RunHeaderView.cs` — re-skin to the shared system: run + act position, dominant debt-status tier with shared severity color, theme-swappable per-act identity treatment, defined relic-overflow behavior.
  - `DungeonDebt/Assets/Scripts/UI/ScoutPanelView.cs` — re-skin: fight classification (dungeon vs. which guild vs. capstone), encounter position, tactical-problem primacy, capstone/relic emphasis, shared act-theme treatment.
  - `DungeonDebt/Assets/Scripts/Core/GameRules.cs` — only if shared palette/severity-color/theme constants belong there (tuning surface; no logic change).
  - `DungeonDebt/Assets/Scripts/UI/MainMenuPanel.cs` — only if view construction/wiring requires it (keep within existing screen-region split; no new state).
  - `TestPlans/TP_M20.3.md` — manual Unity Editor test plan (new file).
- **Explicitly NOT in M20.3:** End/Act Transition, Reward Summary, Combat re-skins (M20.4+); any game-logic / encounter / economy / combat-math change; new systems; tweens/animation/particles/audio; new folders or art beyond placeholder.
- **Acceptance criteria:**
  1. `RunHeaderView` communicates both whole-run and act position, makes debt-status tier the dominant element with a shared severity color language, uses a data-driven theme-swappable per-act identity treatment, and has defined relic behavior that never overflows the fixed-height bar at end of a 20-round run.
  2. `ScoutPanelView` lets the player classify the fight at a glance (dungeon vs. specific rival guild vs. act capstone), shows encounter/act position, gives the tactical problem visual primacy over reward, and emphasizes the relic moment on capstone scouts.
  3. Both views use the same shared visual system (type scale, palette, severity colors, act-theme treatment) consistent with the M20.2 mockups, and the per-act treatment is parameterized so Acts 3–5 need only data, no relayout.
  4. No game logic, encounter, economy, combat, or state-routing behavior changes; a full 20-round run plays identically except for the re-skinned Run Header and Scout; project compiles 0/0.
  5. `TestPlans/TP_M20.3.md` exists with happy-path, multi-act/edge (Act 1 vs Act 2, dungeon vs guild vs capstone, Stable→Critical debt, many-relics), and the targeted regression checks for the touched views.

---

## Appendix: Milestone-to-Section Map

When prompting Codex for a single milestone, attach this plan and reference:

- M1 (Combat Sandbox) → §1, §2, §4 (CombatUnit, CombatResult), §6, §10 (CombatLogView).
- M2 (Run State) → §3, §4 (RunState), §5, §10 (RunHeader, RewardSummary, EndScreen).
- M3 (Shop) → §4 (ShopOffer), §5 (Shop rules), §7 (all 12 heroes added to DataRepository), §10 (Shop panels).
- M4 (Formation) → §4 (HeroInstance.FormationSlot), §6 (targeting), §10 (Formation views).
- M5 (Payroll) → §4 (PayrollActionDefinition), §5 (Payroll constants), §10 (PayrollPanelView).
- M6 (Full Run) → §7 (all hero effects), §8 (all encounters), §10 (ScoutPanelView).
- M7 (Rivals) → §4 (RivalGuildState), §9, §10 (RivalLeaderboardView).
- M8 (Card readability pass) → §15, §10 (existing panels for re-skin).
- M9 (Bronze→Silver tiering) → §15, §4 (HeroInstance.Tier addition), §7 (per-hero Silver bonus table in §15).
- M10 (Combat view rebuild) → §15, §6 (combat flow), §10 (combat panel area).
- M11 (Economy & balance pass) → §15, §5, plus §7/§8/§9 for tuning targets.
- M12 (Debt rework and resource-pressure readability) → §16, §5 (debt/upkeep/interest), §10 (RunHeader, Shop, RewardSummary, EndScreen), §12 (GameRules/RunManager/ShopManager responsibilities).
- M13+ (Phase 3 vertical expansion) → §16 plus the relevant existing systems named in the chosen milestone.

Each milestone prompt should attach only the relevant sections to keep Codex focused.
