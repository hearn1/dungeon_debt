# Dungeon Debt — Game Design Document

## Project Goal

Create a small indie game prototype that can be completed in roughly **2–4 weeks**.

This is not intended to be a full commercial game yet. The goal is to build a playable, testable core loop that proves whether the main mechanic is fun:

> Building the strongest affordable dungeon party while recurring hero upkeep threatens to bankrupt the run.

The game should be friendly to LLM-assisted Unity development through Claude/Codex. The design should favor simple UI, data-driven content, readable rules, and minimal custom assets.

---

## Hard Constraints

Do not include:

- Real multiplayer
- Online hosting
- Player accounts
- Matchmaking
- Large open worlds
- Complex story/dialogue systems
- Large inventories
- Advanced AI
- Complex animation
- Expensive custom assets
- Physics-heavy gameplay
- Horror
- Full RPG systems
- MMO systems
- Survival crafting
- Large roguelike structure
- Cozy life sim systems
- Large roster
- Large map
- Complex status effects
- Equipment
- Skill trees
- Meta progression
- Unlock trees
- Multiple acts
- Full auto-chess grid/pathfinding

Prefer:

- Abstract but fun over visually impressive
- One strong mechanic over many systems
- UI-heavy gameplay
- Mouse-first controls
- Simple cards, panels, icons, and combat logs
- Data-driven heroes/enemies
- Small, testable systems

---

## Working Title

**Dungeon Debt**

A single-player fantasy auto-battler economy roguelite where you manage a guild expedition through a cursed dungeon.

You recruit heroes, build around a carry, position your party, choose financial risks, fight dungeon monsters and rival guild ghosts, then pay recurring hero upkeep after each fight.

Powerful heroes can carry the run, but expensive parties can spiral into debt.

---

## Core Hook

Most auto-battlers ask:

> “Can I afford to buy this unit?”

Dungeon Debt asks:

> “Can I afford to keep this party?”

Every hero has recurring upkeep. Strong heroes are tempting, but their wages can destroy the run if the party becomes too expensive.

The best party is not simply the strongest party.

The best party is:

> The strongest party you can afford to keep alive.

---

## Core Fantasy

You are a guild leader funding a dungeon expedition.

Every hero wants their cut. Every monster wants to drain your purse. Rival guilds are racing through the dungeon too.

You are not just managing combat strength. You are managing payroll.

The fantasy is:

> Build a compact fantasy dungeon team, protect your carry, beat economy-draining monsters, outperform rival guilds, and clear the dungeon before debt consumes the expedition.

---

## Tone

Strategic, clever, dark, competitive, crunchy.

The game should feel like a fantasy dungeon expedition filtered through an accountant’s nightmare.

Small jokes are fine, but the design should remain focused on strategic tension.

---

## Updated Core Loop

Each run is a **10-round dungeon**.

Each round uses this loop:

1. **Scout**
2. **Shop**
3. **Payroll Choice**
4. **Formation**
5. **Auto-Combat**
6. **Reward**
7. **Upkeep**
8. **Rival Update**

This loop gives the player three meaningful pre-fight decisions:

1. What should I buy, sell, upgrade, or skip?
2. What financial risk should I take this round?
3. How should I position against this specific threat?

---

## Round Flow

### 1. Scout Phase

The player sees the next encounter before committing.

The scout panel should show:

- Encounter name
- Enemy type: dungeon monster or rival guild
- Main threat
- Reward
- Danger category

Example:

```text
Round 5: Backline Bat

Threat:
Attacks your lowest-health backline hero on turn 2.

Danger:
Backline pressure

Reward:
8 gold
```

The goal is to create a clear tactical problem before each fight.

The player should think:

> “What is this fight asking me to solve?”

---

### 2. Shop Phase

The player sees 3 recruit/shop options.

The player can:

- Hire a hero
- Upgrade an existing hero
- Fire a hero
- Reroll the shop
- Save gold

MVP shop rules:

- 3 hero options appear each round.
- Reroll costs 2 gold.
- Hiring cost initially equals `2 + upkeep`.
- Firing a hero gives 1 gold.
- Party size is capped at 5 heroes.

Avoid complex shop odds for MVP.

---

### 3. Payroll Choice Phase

Each round, the player chooses exactly **one payroll action** before combat.

This is the most important loop update.

Payroll actions make the economy mechanic active instead of passive.

#### MVP Payroll Actions

Start with only these 4:

##### Standard Pay

No modifier.

Safe default.

```text
No bonus. No penalty.
```

##### Take Loan

Gain gold now, but add debt later.

```text
Gain +5 gold now.
After combat, add +6 debt.
```

Use case:

> “I need money now to buy the unit that saves this fight.”

##### Promise Victory Bonus

Spike combat power, but risk debt.

```text
All heroes gain +1 attack this fight.
If you win, pay 3 gold after combat.
If you lose, add 5 debt.
```

Use case:

> “I can beat this fight if I push damage now.”

##### Cut Wages

Reduce financial pressure, but weaken the party.

```text
Reduce total upkeep by 3 this round.
All heroes lose 1 attack this fight, minimum 0.
```

Use case:

> “I cannot afford payroll unless I make the team weaker.”

#### Optional Later Payroll Action

##### Bench Contract

Choose one hero.

```text
That hero does not fight this round.
That hero costs 0 upkeep this round.
```

This is interesting, but it requires extra UI and combat handling. Save it for after the first version works.

---

### 4. Formation Phase

The player places up to 5 heroes into a simple formation.

MVP formation:

```text
Frontline:
[ Slot A ] [ Slot B ]

Backline:
[ Slot C ] [ Slot D ] [ Slot E ]
```

Rules:

- Frontline is usually targeted first.
- Backline is safer unless enemy effects say otherwise.
- Some effects care about adjacency.
- Some enemies attack backline.
- Some heroes only work well in front or back.

Formation should matter, but this should not become a full tactics grid.

No pathfinding. No movement. No positioning beyond 5 slots.

---

### 5. Auto-Combat Phase

Combat resolves automatically.

MVP combat rules:

- Player units act left to right.
- Enemy units act left to right.
- Units target the frontmost enemy unless their effect says otherwise.
- Dead units do not act.
- Repeat until one side dies or the turn limit is reached.
- If enemies die, player wins.
- If player party dies, player loses.
- If both survive after turn limit, treat as a loss or partial loss.

MVP turn limit:

```text
10 combat rounds
```

Combat presentation:

- Text combat log is acceptable.
- Basic flashes are optional.
- No complex animations required.

---

### 6. Reward Phase

After combat, the player gains gold.

MVP reward rules:

```text
Win: gain 8 gold
Loss: gain 4 gold
```

Optional later:

- Perfect win bonus
- Fast win bonus
- Recruit discount
- Temporary blessing

Do not include those in the first Codex build unless the core loop is already working.

---

### 7. Upkeep Phase

After rewards and payroll effects, the player pays hero upkeep.

Rules:

```text
Total upkeep = sum of living/recruited hero upkeep after modifiers.
If gold >= total upkeep:
    Pay total upkeep.
If gold < total upkeep:
    Pay all available gold.
    Convert unpaid amount into debt.
```

Debt interest:

```text
Interest = ceil(debt / 3)
Interest is paid after upkeep.
If interest cannot be paid, unpaid interest becomes additional debt.
```

Debt loss condition for the original MVP baseline:

```text
If debt >= 20, lose the run.
```

Phase 3 updates this from a hard-feeling fail meter into a clearer debt-pressure track. See **Phase 3 Debt Rework Direction** below.

---

### 8. Rival Update Phase

The game includes 3 simulated rival guilds.

These are not real players.

They are offline scripted “ghosts” that create a competitive feeling.

The player sees a small leaderboard after each round.

Example:

| Guild | Morale | Debt | Payroll | Status |
|---|---:|---:|---:|---|
| You | 26 | 3 | 11 | Stable |
| Greedy Guild | 18 | 12 | 18 | Dangerous |
| Frugal Guild | 30 | 0 | 8 | Safe |
| Carry Guild | 22 | 6 | 14 | Scaling |

Rivals should update through simple scripted rules. They do not need full shop simulation in MVP.

---

## Rival Guild Ghost System

### Purpose

The ghost system adds a PvP-like feeling without real multiplayer.

The player should feel like:

> “I am racing other guilds through the same dungeon economy.”

This solves two problems:

1. The game gains competitive pressure.
2. The run feels less like a static puzzle.

---

### Important Constraint

This is **not multiplayer**.

Do not build:

- Online ghosts
- Real player replays
- Server sync
- Accounts
- Matchmaking
- Async upload/download
- PvP ranking

For MVP, rivals are fully local, deterministic, and scripted.

---

### MVP Rival Guilds

Each run has 3 rival guilds.

#### 1. Greedy Guild

Theme:

> Strong but financially reckless.

Behavior:

- High payroll
- Takes debt often
- Stronger combat than average
- Debt rises quickly

Example stats:

```text
Starting Morale: 30
Starting Debt: 0
Starting Payroll: 10
Scaling: +2 payroll per round
Debt tendency: high
```

#### 2. Frugal Guild

Theme:

> Cheap, stable, and hard to bankrupt.

Behavior:

- Low payroll
- Rarely takes debt
- Weaker combat
- High morale stability

Example stats:

```text
Starting Morale: 30
Starting Debt: 0
Starting Payroll: 6
Scaling: +1 payroll per round
Debt tendency: low
```

#### 3. Carry Guild

Theme:

> Builds around one expensive carry.

Behavior:

- Medium-high payroll
- Weak early
- Strong later
- Dangerous in ghost fights

Example stats:

```text
Starting Morale: 30
Starting Debt: 0
Starting Payroll: 8
Scaling: +1 or +2 payroll per round
Debt tendency: medium
Carry scaling: increases every 2 rounds
```

---

### Ghost Fight Schedule

Use this 10-round structure:

| Round | Encounter Type |
|---:|---|
| 1 | Dungeon |
| 2 | Dungeon |
| 3 | Rival Ghost |
| 4 | Dungeon |
| 5 | Dungeon |
| 6 | Rival Ghost |
| 7 | Dungeon |
| 8 | Dungeon |
| 9 | Rival Ghost |
| 10 | Final Boss |

This creates a competitive rhythm without overcomplicating the game.

---

### Ghost Fight Rules

When fighting a rival ghost:

- The rival uses a generated party based on its archetype and current round.
- If the player wins, gain normal reward plus +2 gold.
- If the player loses, lose morale.
- Rival guilds are not eliminated in MVP.
- Rival results can be simulated simply after each round.

Do not build a full rival shop system yet.

---

## Player Resources

Use only 3 main resources.

### Gold

Used to:

- Hire heroes
- Reroll shop
- Pay upkeep
- Pay interest
- Pay victory bonuses

### Debt

Represents unpaid wages, loans, and interest.

Debt creates pressure through interest.

Lose if debt gets too high.

### Morale

Represents expedition HP / guild morale.

Lose if morale reaches 0.

Suggested starting values:

```text
Gold: 10
Debt: 0
Morale: 30
Debt Limit: 20
```

Suggested loss penalties:

```text
Normal fight loss: -6 morale
Rival fight loss: -8 morale
Final boss loss: lose run
```

---

## Win and Loss Conditions

### Win

Beat the final boss on Round 10.

### Lose

The player loses if:

- Morale reaches 0
- Debt reaches 20
- The player loses the final boss fight

Keep this simple for MVP.

---

## Phase 3 Debt Rework Direction

M11 proved the prototype is playable enough to treat the current 10-round dungeon as Act 1 / initial difficulty, but the debt mechanic needs to feel less instantly punishing.

The design goal is:

> Debt should feel like a risky pressure track, not a surprise fail meter.

Debt still matters. It still represents unpaid wages, loans, and interest. It should still create greed, comeback, and collapse moments. The Phase 3 adjustment is about readability and recovery time, not removing consequences. Debt needs both a pressure loop and a recovery loop: the player should be able to deliberately spend scarce gold to pay down principal.

### Debt status tiers

Use clear labels anywhere the player checks debt:

| Status | Intended player read |
|---|---|
| Stable | Debt is low or absent. The run is financially healthy. |
| Strained | Debt is present. Interest matters, but recovery is realistic. |
| Dangerous | Debt is shaping decisions and debt-scaling enemies are threatening. |
| Critical | Bankruptcy is close. The player needs immediate recovery. |

### Debt recovery

The first recovery tool is a Shop **Pay Debt** action. It is explicit, player-controlled, and competes directly with hiring and rerolling.

First-pass rule:

```text
DebtPaymentCap = 3
Payment amount = min(Gold, Debt, DebtPaymentCap)
Pay Debt is enabled only if Gold > 0 and Debt > 0.
Paying debt immediately spends that gold and reduces debt 1:1.
```

Example button labels:

- `Pay Debt (3g)`
- `Pay Debt (2g)`
- `No Debt`
- `Need Gold`

Do not use automatic surplus repayment for the first pass. The player chooses whether gold goes toward debt recovery, hiring, or rerolling.

### First implementation target

For M12.1, prefer a conservative rework:

- Show the current debt status in the run header.
- Add the Shop Pay Debt control described above.
- Make repayment update gold/debt immediately so it competes with hire/reroll choices.
- Keep debt warnings general: high debt increases interest pressure and can interact badly with debt-scaling threats.
- Make reward/upkeep summaries explain debt gained, interest paid or added, and status changes.
- Keep Take Loan, unpaid upkeep, Debt Wraith scaling, and debt defeat intact.

Do not add automatic surplus repayment, new or replacement payroll actions, hero behavior changes, enemy behavior changes, high-debt shop surcharges, specific encounter warnings, new debt enemies, new resources, XP, loot, acts, or status effects as part of M12.1. Those can be considered in later M12.x slices after Shop repayment has been tested.

---

## Main Strategic Tension

The central question every round is:

> “Can I afford the party that can win the next fight?”

More specifically:

> “Is this hero’s combat value worth their recurring upkeep?”

Examples:

- A Squire may be better than a Knight if payroll is tight.
- A Wizard may carry the run, but only if supported.
- A Bard may generate gold, but only if the party survives.
- A Golem may stabilize fights but destroy the economy.
- A loan may save the current fight but doom the next three rounds.
- Cutting wages may prevent debt but cause a combat loss.

---

## Player Decision Stack

Each round should create 3 decisions.

### 1. Shop Decision

Long-term team direction.

Questions:

- Do I hire this expensive carry?
- Do I need a cheap filler?
- Should I fire an overpaid hero?
- Should I reroll for a support?
- Should I save gold?

### 2. Payroll Decision

Financial risk.

Questions:

- Do I take a loan?
- Do I promise a victory bonus?
- Do I cut wages and weaken the team?
- Do I play safe?

### 3. Formation Decision

Fight-specific counterplay.

Questions:

- Who protects the carry?
- Who absorbs the first hit?
- Should the support be moved?
- Do I need to protect against backline attacks?
- Do I need to kill an economy-draining enemy quickly?

This is enough decision density for the first version.

---

## Party Roles

Keep role tags light.

MVP roles:

- Tank
- Damage
- Support
- Economy

Fantasy labels:

- Warrior
- Wizard
- Ninja
- Ranger
- Priest
- Bard
- Squire
- Treasurer
- Apprentice

Avoid a large class/faction/trait system for MVP.

---

## Build Archetypes

Start with 3 build cores.

### 1. Wizard Carry

Fantasy:

> Protect the Wizard long enough for them to scale into a huge carry.

Core:

- Wizard

Supports:

- Apprentice
- Knight
- Priest
- Enchanter

Example mechanics:

- Wizard gains +1 attack whenever full upkeep is paid.
- Apprentice reduces Wizard upkeep by 1.
- Knight redirects the first backline hit.
- Priest keeps frontline alive.

Decision tension:

- Expensive and fragile early.
- Strong if protected.
- Dangerous if payroll collapses.

---

### 2. Ninja Burst

Fantasy:

> Kill priority enemies before they drain your economy.

Core:

- Ninja

Supports:

- Bard
- Squire
- Enchanter

Example mechanics:

- Ninja attacks the lowest-health enemy.
- If Ninja gets a kill, gain 1 gold.
- Fragile and needs protection.

Decision tension:

- Can snowball.
- Good against economy enemies.
- Struggles against tanks.

---

### 3. Warrior Wall

Fantasy:

> Build a stable, efficient frontline that grinds fights out.

Core:

- Warrior
- Knight

Supports:

- Priest
- Ranger
- Treasurer

Example mechanics:

- Warrior is cheap and efficient.
- Knight protects backline.
- Priest heals frontline.
- Ranger provides stable damage.

Decision tension:

- Safe and affordable.
- May lack burst damage.
- Can struggle against reward-draining enemies.

---

## Optional Later Build

### Debt Mage

Do not include in MVP.

Fantasy:

> Intentionally take debt and turn it into power.

Example:

```text
Debt Mage gains +1 attack for every 3 debt.
```

This is thematically great, but it should only be added after the base game is fun.

---

## MVP Hero Roster

Start with 12 heroes.

### Tanks

#### Warrior

Low-upkeep, reliable frontline.

```text
Role: Tank
Attack: 2
Health: 8
Upkeep: 2
Effect: None
```

#### Knight

Protects the backline.

```text
Role: Tank
Attack: 1
Health: 10
Upkeep: 4
Effect: First backline hit each fight is redirected to Knight.
```

#### Golem

Big tank, expensive.

```text
Role: Tank
Attack: 1
Health: 14
Upkeep: 6
Effect: Takes 1 less damage from each hit.
```

---

### Carries

#### Wizard

Scaling magic carry.

```text
Role: Damage
Attack: 3
Health: 4
Upkeep: 5
Effect: Gains +1 attack when full upkeep is paid.
```

#### Ninja

Burst carry.

```text
Role: Damage
Attack: 4
Health: 3
Upkeep: 4
Effect: Attacks the lowest-health enemy. If Ninja gets a kill, gain 1 gold.
```

#### Ranger

Stable ranged damage.

```text
Role: Damage
Attack: 3
Health: 5
Upkeep: 3
Effect: Can safely attack from the backline.
```

---

### Supports

#### Priest

Healing support.

```text
Role: Support
Attack: 1
Health: 5
Upkeep: 4
Effect: Heals frontmost ally for 2 each combat round.
```

#### Bard

Economy support.

```text
Role: Economy
Attack: 1
Health: 4
Upkeep: 3
Effect: Gain +2 gold after a win.
```

#### Enchanter

Buff support.

```text
Role: Support
Attack: 1
Health: 4
Upkeep: 3
Effect: Gives adjacent carry +1 attack.
```

---

### Economy / Utility

#### Squire

Cheap filler.

```text
Role: Tank
Attack: 1
Health: 4
Upkeep: 1
Effect: None
```

#### Treasurer

Upkeep reducer.

```text
Role: Economy
Attack: 0
Health: 4
Upkeep: 2
Effect: Reduce highest ally upkeep by 2.
```

#### Apprentice

Wizard support.

```text
Role: Support
Attack: 1
Health: 3
Upkeep: 1
Effect: Wizard costs 1 less upkeep.
```

---

## MVP Encounter List

Use 10 total rounds.

### Round 1: Slimes

Purpose:

Teach basic combat.

Threat:

Low damage stat check.

Scout text:

```text
Simple enemies. Win by having enough basic stats.
```

---

### Round 2: Goblin Thieves

Purpose:

Teach economy enemies.

Threat:

Steal gold if they survive too long.

Scout text:

```text
If a Goblin Thief survives past combat round 3, lose 3 gold.
```

---

### Round 3: Greedy Guild Ghost

Purpose:

Introduce rival guilds.

Threat:

High damage, high debt rival.

Scout text:

```text
A reckless rival guild with expensive heroes. Strong now, but drowning in debt.
```

---

### Round 4: Tax Collector

Purpose:

Pressure payroll.

Threat:

Increases upkeep this round.

Scout text:

```text
Your total upkeep is increased by 2 this round.
```

---

### Round 5: Backline Bat

Purpose:

Test formation.

Threat:

Attacks backline.

Scout text:

```text
Attacks your lowest-health backline hero on turn 2.
```

---

### Round 6: Carry Guild Ghost

Purpose:

Test whether the player can beat a scaling rival.

Threat:

One dangerous carry.

Scout text:

```text
This rival protects a high-damage carry. Kill it quickly or survive the burst.
```

---

### Round 7: Debt Wraith

Purpose:

Punish greedy debt.

Threat:

Scales with player debt.

Scout text:

```text
Gains attack based on your current debt.
```

---

### Round 8: Treasure Leech

Purpose:

Reward burst and target access.

Threat:

Reduces reward if not killed.

Scout text:

```text
If Treasure Leech survives, your reward is reduced by 4 gold.
```

---

### Round 9: Frugal Guild Ghost

Purpose:

Late rival benchmark.

Threat:

Low debt, efficient team.

Scout text:

```text
A stable rival guild with cheap heroes and strong morale.
```

---

### Round 10: Dungeon Auditor

Purpose:

Final boss.

Threat:

Attacks both party and economy.

Scout text:

```text
Final boss. Damages your party and adds debt pressure.
```

MVP boss effect:

```text
At the start of combat, add +3 temporary upkeep for this round.
Every 3 combat rounds, deal 1 damage to all player heroes.
```

Keep final boss simple.

---

## MVP Scope

The first prototype should be called:

**Dungeon Debt: Core Test**

### Included

- Main menu
- Start run
- 10-round run
- 5-slot party formation
- 12 heroes
- 10 encounters
- 3 rival guild profiles
- Ghost fights on rounds 3, 6, and 9
- Scout panel
- Shop with 3 recruit options
- Hire hero
- Fire hero
- Reroll shop
- Payroll action choice
- Auto-combat
- Combat log
- Gold rewards
- Upkeep payment
- Debt and interest
- Morale damage
- Rival leaderboard
- Win/loss screen

### Not Included

- Real multiplayer
- Online ghosts
- Random dungeon map
- Full rival simulation
- Complex rival drafting
- Equipment
- Hero XP
- Large roster
- Meta progression
- Advanced animation
- Complex VFX
- Multiple acts
- Full campaign
- Tutorial
- Save/load
- Steam integration
- Audio polish

---

## First Playable Prototype

The first playable should include one complete run from start to finish.

### Main Menu

Contains:

- Game title
- Start Run button
- Quit button, optional

### Run Screen

Displays:

- Current round
- Gold
- Debt
- Morale
- Current payroll/upkeep
- Current encounter scout panel
- Player formation
- Enemy formation
- Shop options
- Payroll action options
- Rival leaderboard
- Combat log

### Shop Actions

Player can:

- Buy hero
- Fire hero
- Reroll shop
- Start fight

### Payroll Actions

Player can choose one:

- Standard Pay
- Take Loan
- Promise Victory Bonus
- Cut Wages

### Combat

Combat can be log-first.

Example:

```text
Warrior attacks Slime for 2.
Slime attacks Warrior for 1.
Wizard attacks Slime for 3.
Slime dies.
Player wins!
```

### End State

Show:

- Victory after beating Round 10
- Defeat if morale reaches 0
- Defeat if debt reaches 20
- Defeat if final boss is lost

---

## What the Player Does Every 5–10 Seconds

During Scout:

- Reads the next threat
- Checks whether the enemy pressures gold, debt, formation, or damage
- Compares threat against current party

During Shop:

- Compares hero value
- Checks current upkeep
- Checks projected debt risk
- Hires a hero
- Fires/replaces a hero
- Rerolls
- Saves gold

During Payroll:

- Chooses whether to play safe or take financial risk
- Takes a loan for immediate power
- Promises a bonus to spike combat
- Cuts wages to avoid debt

During Formation:

- Protects carry
- Moves fragile units
- Counters backline attacks
- Positions around adjacency

During Combat:

- Watches whether the carry is protected
- Notices which enemies cause economy problems
- Identifies what the team lacks

Between Rounds:

- Checks rival leaderboard
- Decides whether they are ahead or behind
- Adjusts party cost
- Commits to or pivots away from a build

---

## Why This Can Be Fun

- Recurring upkeep creates a unique auto-battler tension.
- Payroll choices make the economy active every round.
- Scout previews create fight-specific planning.
- Ghost rivals create competitive pressure without multiplayer.
- Powerful units are exciting but dangerous.
- Cheap units can be strategically correct.
- Debt creates greed, comeback, and collapse moments.
- The player builds around carries, tanks, and supports.
- Enemy economy attacks make fights more than stat checks.
- The fantasy is readable with simple UI.

---

## Why This Is Small Enough

The game can be built mostly with:

- Cards
- Rectangles
- Text
- Icons
- Simple panels
- Combat logs
- Basic flashes
- Data tables

It does not require:

- Pathfinding
- Multiplayer
- 3D character animation
- Complex AI
- A large map
- Dialogue
- Inventory
- Equipment
- Procedural levels

The main system complexity is in rules, not assets.

---

## Design Warning

The danger is that this becomes:

- Full auto chess
- Full deckbuilder
- Full RPG party sim
- Full dungeon crawler
- Full economy management sim
- Full roguelike map game
- Real multiplayer game

Do not let that happen.

The core should stay:

> Scout, shop, choose payroll risk, position, fight, get paid, pay upkeep, avoid debt, race rival ghosts.

---

## Implementation Readiness Notes

This document is the design source of truth.

Before starting Codex implementation, create a separate `IMPLEMENTATION_PLAN.md` that defines:

- Unity version
- Target platform
- Scene structure
- Game state machine
- Data structures
- Script list
- UI panels
- Milestone order
- Acceptance tests

Recommended first milestone:

> Build only a combat sandbox first: hardcoded player party, hardcoded enemy party, start combat button, combat log, and win/loss result.

Do not ask Codex to build the full game in one pass.
