using System.Collections.Generic;
using System.Collections.ObjectModel;

public static class DataRepository
{
    private static readonly HeroDefinition Warrior = new HeroDefinition(
        "warrior",
        "Warrior",
        HeroRole.Tank,
        2,
        8,
        2,
        "No effect.",
        HeroEffectId.None);

    private static readonly HeroDefinition Knight = new HeroDefinition(
        "knight",
        "Knight",
        HeroRole.Tank,
        1,
        10,
        4,
        "Redirects the first backline hit each combat to himself.",
        HeroEffectId.KnightRedirect);

    private static readonly HeroDefinition Golem = new HeroDefinition(
        "golem",
        "Golem",
        HeroRole.Tank,
        1,
        14,
        6,
        "Reduces incoming damage by 1.",
        HeroEffectId.GolemArmor);

    private static readonly HeroDefinition Wizard = new HeroDefinition(
        "wizard",
        "Wizard",
        HeroRole.Damage,
        3,
        4,
        5,
        "Gains +1 attack when full upkeep is paid.",
        HeroEffectId.WizardScaling);

    private static readonly HeroDefinition Ninja = new HeroDefinition(
        "ninja",
        "Ninja",
        HeroRole.Damage,
        4,
        3,
        4,
        "Targets the lowest-HP enemy; +1 gold on each kill.",
        HeroEffectId.NinjaLowestTarget);

    private static readonly HeroDefinition Ranger = new HeroDefinition(
        "ranger",
        "Ranger",
        HeroRole.Damage,
        3,
        5,
        3,
        "Can safely attack from the backline.",
        HeroEffectId.RangerBackline);

    private static readonly HeroDefinition Priest = new HeroDefinition(
        "priest",
        "Priest",
        HeroRole.Support,
        1,
        5,
        4,
        "Heals frontmost ally for 2 each combat round.",
        HeroEffectId.PriestHeal);

    private static readonly HeroDefinition Bard = new HeroDefinition(
        "bard",
        "Bard",
        HeroRole.Support,
        1,
        4,
        3,
        "+2 gold after each combat win.",
        HeroEffectId.BardGoldOnWin);

    private static readonly HeroDefinition Enchanter = new HeroDefinition(
        "enchanter",
        "Enchanter",
        HeroRole.Support,
        1,
        4,
        3,
        "Adjacent Damage allies gain +1 attack this combat.",
        HeroEffectId.EnchanterAdjacent);

    private static readonly HeroDefinition Squire = new HeroDefinition(
        "squire",
        "Squire",
        HeroRole.Tank,
        1,
        4,
        1,
        "No effect.",
        HeroEffectId.None);

    private static readonly HeroDefinition Treasurer = new HeroDefinition(
        "treasurer",
        "Treasurer",
        HeroRole.Economy,
        0,
        4,
        2,
        "Reduces the highest-upkeep ally's upkeep by 2.",
        HeroEffectId.TreasurerUpkeepReduce);

    private static readonly HeroDefinition Apprentice = new HeroDefinition(
        "apprentice",
        "Apprentice",
        HeroRole.Economy,
        1,
        3,
        1,
        "Reduces a Wizard ally's upkeep by 1.",
        HeroEffectId.ApprenticeWizardSupport);

    private static readonly EnemyDefinition Slime = new EnemyDefinition(
        "slime",
        "Slime",
        1,
        4,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition TrainingDummy = new EnemyDefinition(
        "training_dummy",
        "Training Dummy",
        0,
        10,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition CaveBat = new EnemyDefinition(
        "cave_bat",
        "Cave Bat",
        2,
        3,
        EnemyEffectId.None,
        "Starts Marked. Applies Burned on attack.",
        new CombatStatusId[] { CombatStatusId.Marked },
        new CombatStatusId[] { CombatStatusId.Burned });

    private static readonly EnemyDefinition GoblinThief = new EnemyDefinition(
        "goblin_thief",
        "Goblin Thief",
        2,
        4,
        EnemyEffectId.GoblinStealGold,
        "Applies Weakened on attack; steals gold if alive past combat round 3.",
        null,
        new CombatStatusId[] { CombatStatusId.Weakened });

    private static readonly EnemyDefinition TaxCollector = new EnemyDefinition(
        "tax_collector",
        "Tax Collector",
        1,
        8,
        EnemyEffectId.None,
        "Applies Weakened on attack. Encounter raises upkeep this round.",
        null,
        new CombatStatusId[] { CombatStatusId.Weakened });

    private static readonly EnemyDefinition BacklineBat = new EnemyDefinition(
        "backline_bat",
        "Backline Bat",
        3,
        4,
        EnemyEffectId.BackBatBackline,
        "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.",
        new CombatStatusId[] { CombatStatusId.Marked },
        new CombatStatusId[] { CombatStatusId.Burned });

    private static readonly EnemyDefinition DebtWraith = new EnemyDefinition(
        "debt_wraith",
        "Debt Wraith",
        1,
        10,
        EnemyEffectId.DebtWraithScales,
        "Applies Poisoned on attack. Attack scales with player debt at combat start.",
        null,
        new CombatStatusId[] { CombatStatusId.Poisoned });

    private static readonly EnemyDefinition TreasureLeech = new EnemyDefinition(
        "treasure_leech",
        "Treasure Leech",
        1,
        12,
        EnemyEffectId.TreasureLeechRewardDrain,
        "Applies Poisoned on attack. Reduces reward if alive at combat end.",
        null,
        new CombatStatusId[] { CombatStatusId.Poisoned });

    private static readonly EnemyDefinition DungeonAuditor = new EnemyDefinition(
        "dungeon_auditor",
        "Dungeon Auditor",
        3,
        20,
        EnemyEffectId.DungeonAuditorBoss,
        "Starts Inspired and applies Burned on attack. Raises upkeep and deals periodic damage.",
        new CombatStatusId[] { CombatStatusId.Inspired },
        new CombatStatusId[] { CombatStatusId.Burned });

    private static readonly EnemyDefinition GreedyTank = new EnemyDefinition(
        "greedy_tank",
        "Greedy Tank",
        3,
        8,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition GreedyCarry = new EnemyDefinition(
        "greedy_carry",
        "Greedy Carry",
        4,
        4,
        EnemyEffectId.None,
        "Starts Inspired and Marked.",
        CombatStatusId.Inspired,
        CombatStatusId.Marked);

    private static readonly EnemyDefinition CarryProtector = new EnemyDefinition(
        "carry_protector",
        "Carry Protector",
        1,
        10,
        EnemyEffectId.None,
        "Starts Guarded.",
        CombatStatusId.Guarded);

    private static readonly EnemyDefinition CarryCarry = new EnemyDefinition(
        "carry_carry",
        "Carry Champion",
        6,
        6,
        EnemyEffectId.None,
        "Starts Inspired.",
        CombatStatusId.Inspired);

    private static readonly EnemyDefinition FrugalGuard = new EnemyDefinition(
        "frugal_guard",
        "Frugal Guard",
        2,
        6,
        EnemyEffectId.None,
        "Starts Guarded.",
        CombatStatusId.Guarded);

    private static readonly EnemyDefinition FrugalArcher = new EnemyDefinition(
        "frugal_archer",
        "Frugal Archer",
        3,
        4,
        EnemyEffectId.None,
        "Applies Weakened on attack.",
        null,
        new CombatStatusId[] { CombatStatusId.Weakened });

    private static readonly EnemyDefinition FrugalHealer = new EnemyDefinition(
        "frugal_healer",
        "Frugal Healer",
        1,
        5,
        EnemyEffectId.FrugalGhostHeal,
        "Heals leftmost living ally each combat round.");

    // Act 2 rival-guild rematches: same guild identities as Act 1, upgraded
    // stats (and one extra Carry unit) using existing systems only. No new
    // combat effects; the Frugal healer reuses the existing FrugalGhostHeal.
    // Ids intentionally reuse the Act 1 enemy ids so the existing portrait
    // art and attack-effect category resolve (presentation only; enemy Id is
    // not a unique key anywhere — see SpriteCatalog / ResolveEnemyAttackEffectId).
    private static readonly EnemyDefinition Act2GreedyTank = new EnemyDefinition(
        "greedy_tank",
        "Greedy Tank",
        4,
        12,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition Act2GreedyCarry = new EnemyDefinition(
        "greedy_carry",
        "Greedy Carry",
        6,
        7,
        EnemyEffectId.None,
        "Starts Inspired and Marked.",
        CombatStatusId.Inspired,
        CombatStatusId.Marked);

    private static readonly EnemyDefinition Act2CarryProtector = new EnemyDefinition(
        "carry_protector",
        "Carry Protector",
        2,
        14,
        EnemyEffectId.None,
        "Starts Guarded.",
        CombatStatusId.Guarded);

    private static readonly EnemyDefinition Act2CarryChampion = new EnemyDefinition(
        "carry_carry",
        "Carry Champion",
        8,
        9,
        EnemyEffectId.None,
        "Starts Inspired.",
        CombatStatusId.Inspired);

    private static readonly EnemyDefinition Act2CarrySupport = new EnemyDefinition(
        "carry_protector",
        "Carry Vanguard",
        2,
        10,
        EnemyEffectId.None,
        "Starts Guarded.",
        CombatStatusId.Guarded);

    private static readonly EnemyDefinition Act2FrugalGuard = new EnemyDefinition(
        "frugal_guard",
        "Frugal Guard",
        3,
        9,
        EnemyEffectId.None,
        "Starts Guarded.",
        CombatStatusId.Guarded);

    private static readonly EnemyDefinition Act2FrugalArcher = new EnemyDefinition(
        "frugal_archer",
        "Frugal Archer",
        4,
        6,
        EnemyEffectId.None,
        "Applies Weakened on attack.",
        null,
        new CombatStatusId[] { CombatStatusId.Weakened });

    private static readonly EnemyDefinition Act2FrugalHealer = new EnemyDefinition(
        "frugal_healer",
        "Frugal Healer",
        2,
        8,
        EnemyEffectId.FrugalGhostHeal,
        "Applies Poisoned on attack. Heals leftmost living ally each combat round.",
        null,
        new CombatStatusId[] { CombatStatusId.Poisoned });

    // Act 2 demonic dungeon roster (rounds 11-20). New ids carry their own
    // placeholder sprite slots; all combat behavior reuses existing
    // EnemyEffectId / EncounterEffectId values (no new combat systems).
    private static readonly EnemyDefinition Imp = new EnemyDefinition(
        "imp",
        "Imp",
        2,
        5,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition SoulBroker = new EnemyDefinition(
        "soul_broker",
        "Soul Broker",
        2,
        7,
        EnemyEffectId.GoblinStealGold,
        "Applies Weakened on attack; steals gold if alive past combat round 3.",
        null,
        new CombatStatusId[] { CombatStatusId.Weakened });

    private static readonly EnemyDefinition GloomBat = new EnemyDefinition(
        "gloom_bat",
        "Gloom Bat",
        4,
        6,
        EnemyEffectId.BackBatBackline,
        "Starts Marked. Applies Burned on attack; attacks lowest-HP backline hero on combat round 2.",
        new CombatStatusId[] { CombatStatusId.Marked },
        new CombatStatusId[] { CombatStatusId.Burned });

    // Reuses the debt_wraith sprite (no new asset, per M20.0); a separate
    // definition so the Act 1 DebtWraith stays untouched.
    private static readonly EnemyDefinition Act2DebtWraith = new EnemyDefinition(
        "debt_wraith",
        "Debt Wraith",
        2,
        16,
        EnemyEffectId.DebtWraithScales,
        "Applies Poisoned on attack. Attack scales with player debt at combat start.",
        null,
        new CombatStatusId[] { CombatStatusId.Poisoned });

    private static readonly EnemyDefinition HoardFiend = new EnemyDefinition(
        "hoard_fiend",
        "Hoard Fiend",
        2,
        16,
        EnemyEffectId.TreasureLeechRewardDrain,
        "Applies Poisoned on attack. Reduces reward if alive at combat end.",
        null,
        new CombatStatusId[] { CombatStatusId.Poisoned });

    private static readonly EnemyDefinition BrimstoneBrute = new EnemyDefinition(
        "brimstone_brute",
        "Brimstone Brute",
        6,
        22,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition InfernalAuditor = new EnemyDefinition(
        "infernal_auditor",
        "Infernal Auditor",
        5,
        30,
        EnemyEffectId.DungeonAuditorBoss,
        "Starts Inspired and applies Burned on attack. Raises upkeep and deals periodic damage.",
        new CombatStatusId[] { CombatStatusId.Inspired },
        new CombatStatusId[] { CombatStatusId.Burned });

    private static readonly List<HeroDefinition> HeroDefinitions = new List<HeroDefinition>
    {
        Warrior,
        Knight,
        Golem,
        Wizard,
        Ninja,
        Ranger,
        Priest,
        Bard,
        Enchanter,
        Squire,
        Treasurer,
        Apprentice
    };

    private static readonly List<EnemyDefinition> EnemyDefinitions = new List<EnemyDefinition>
    {
        Slime,
        TrainingDummy,
        CaveBat,
        GoblinThief,
        TaxCollector,
        BacklineBat,
        DebtWraith,
        TreasureLeech,
        DungeonAuditor,
        GreedyTank,
        GreedyCarry,
        CarryProtector,
        CarryCarry,
        FrugalGuard,
        FrugalArcher,
        FrugalHealer,
        Act2GreedyTank,
        Act2GreedyCarry,
        Act2CarryProtector,
        Act2CarryChampion,
        Act2CarrySupport,
        Act2FrugalGuard,
        Act2FrugalArcher,
        Act2FrugalHealer,
        Imp,
        SoulBroker,
        GloomBat,
        Act2DebtWraith,
        HoardFiend,
        BrimstoneBrute,
        InfernalAuditor
    };

    private static readonly PayrollActionDefinition TakeLoanAction = new PayrollActionDefinition(
        PayrollActionId.TakeLoan,
        "Take Loan",
        "Gain " + GameRules.LoanGoldGain + " gold immediately. Adds " + GameRules.LoanDebtCost + " debt.");

    private static readonly PayrollActionDefinition CutWagesAction = new PayrollActionDefinition(
        PayrollActionId.CutWages,
        "Cut Wages",
        "Total upkeep this round drops by " + GameRules.CutWagesUpkeepReduction + " (min 0). Each hero's attack drops by " + GameRules.CutWagesAttackPenalty + " (min 0).");

    private static readonly PayrollActionDefinition PromiseVictoryBonusAction = new PayrollActionDefinition(
        PayrollActionId.PromiseVictoryBonus,
        "Promise Victory Bonus",
        "Pay " + GameRules.VictoryBonusGoldCost + " gold now. Each hero gains +" + GameRules.VictoryBonusAttackBuff + " attack this fight.");

    private static readonly PayrollActionDefinition SkipPayrollAction = new PayrollActionDefinition(
        PayrollActionId.StandardPay,
        "Skip Payroll",
        "No effect this round.");

    private static readonly List<PayrollActionDefinition> PayrollActionDefinitions = new List<PayrollActionDefinition>
    {
        TakeLoanAction,
        CutWagesAction,
        PromiseVictoryBonusAction,
        SkipPayrollAction
    };

    private static readonly RelicDefinition[] RelicDefinitions =
    {
        new RelicDefinition(
            RelicId.BladeCharter,
            "Blade Charter",
            "Damage-role heroes get +1 attack in combat."),

        new RelicDefinition(
            RelicId.IronOath,
            "Iron Oath",
            "Tank-role heroes get +1 max health in combat."),

        new RelicDefinition(
            RelicId.CampRations,
            "Camp Rations",
            "All heroes get +1 max health in combat."),

        new RelicDefinition(
            RelicId.GuildDividend,
            "Guild Dividend",
            "Gain +1 extra gold in each reward phase."),

        new RelicDefinition(
            RelicId.ShieldClause,
            GameRules.ShieldClauseRelicName,
            GameRules.ShieldClauseRelicDescription),

        new RelicDefinition(
            RelicId.RedInkBrand,
            GameRules.RedInkBrandRelicName,
            GameRules.RedInkBrandRelicDescription),

        new RelicDefinition(
            RelicId.CausticWrit,
            GameRules.CausticWritRelicName,
            GameRules.CausticWritRelicDescription),

        new RelicDefinition(
            RelicId.ToxicCollateral,
            GameRules.ToxicCollateralRelicName,
            GameRules.ToxicCollateralRelicDescription)
    };

    public static readonly IReadOnlyList<HeroDefinition> AllHeroes =
        new ReadOnlyCollection<HeroDefinition>(HeroDefinitions);

    public static readonly IReadOnlyList<EnemyDefinition> AllEnemies =
        new ReadOnlyCollection<EnemyDefinition>(EnemyDefinitions);

    private static readonly List<EncounterDefinition> EncounterDefinitions = new List<EncounterDefinition>
    {
        new EncounterDefinition(
            1, 1,
            EncounterType.Dungeon,
            "Slimes",
            "Simple enemies. Win by having enough basic stats.",
            "Basic stat check",
            new List<EnemyDefinition> { Slime, Slime, Slime },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            1, 2,
            EncounterType.Dungeon,
            "Goblin Thieves",
            "If a Goblin Thief survives past combat round 3, lose 3 gold.",
            "Economy pressure",
            new List<EnemyDefinition> { GoblinThief, GoblinThief },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            1, 3,
            EncounterType.RivalGhost,
            "Greedy Guild Ghost",
            "A reckless rival guild with expensive heroes. Strong now, but drowning in debt.",
            "Rival benchmark",
            new List<EnemyDefinition> { GreedyTank, GreedyTank, GreedyCarry },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.Greedy),

        new EncounterDefinition(
            1, 4,
            EncounterType.Dungeon,
            "Tax Collector",
            "Your total upkeep is increased by 2 this round.",
            "Payroll pressure",
            new List<EnemyDefinition> { TaxCollector },
            GameRules.WinReward,
            EncounterEffectId.TaxCollectorUpkeep,
            RivalGuild.None),

        new EncounterDefinition(
            1, 5,
            EncounterType.Dungeon,
            "Backline Bat",
            "Attacks your lowest-health backline hero on turn 2.",
            "Backline pressure",
            new List<EnemyDefinition> { BacklineBat, Slime },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            1, 6,
            EncounterType.RivalGhost,
            "Carry Guild Ghost",
            "This rival protects a high-damage carry. Kill it quickly or survive the burst.",
            "Rival benchmark",
            new List<EnemyDefinition> { CarryProtector, CarryProtector, CarryCarry },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.Carry),

        new EncounterDefinition(
            1, 7,
            EncounterType.Dungeon,
            "Debt Wraith",
            "Gains attack based on your current debt.",
            "Debt punishment",
            new List<EnemyDefinition> { DebtWraith },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            1, 8,
            EncounterType.Dungeon,
            "Treasure Leech",
            "If Treasure Leech survives, your reward is reduced by 4 gold.",
            "Reward pressure",
            new List<EnemyDefinition> { TreasureLeech, Slime },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            1, 9,
            EncounterType.RivalGhost,
            "Frugal Guild Ghost",
            "A stable rival guild with cheap heroes and strong morale.",
            "Rival benchmark",
            new List<EnemyDefinition> { FrugalGuard, FrugalGuard, FrugalArcher, FrugalHealer },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.Frugal),

        new EncounterDefinition(
            1, 10,
            EncounterType.FinalBoss,
            "Dungeon Auditor",
            "Final boss. Damages your party and adds debt pressure.",
            "Final boss",
            new List<EnemyDefinition> { DungeonAuditor },
            GameRules.WinReward,
            EncounterEffectId.FinalBossDamage,
            RivalGuild.None),

        new EncounterDefinition(
            2, 1,
            EncounterType.Dungeon,
            "Imp Swarm",
            "The descent begins. A pack of imps boils up from the pit.",
            "Basic stat check",
            new List<EnemyDefinition> { Imp, Imp, Imp },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            2, 2,
            EncounterType.Dungeon,
            "Soul Broker",
            "If a Soul Broker survives past combat round 3, lose 3 gold.",
            "Economy pressure",
            new List<EnemyDefinition> { SoulBroker, Imp },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            2, 3,
            EncounterType.RivalGhost,
            "Frugal Guild Rematch",
            "The Frugal Guild returns, disciplined and resilient, its healer keeping it standing.",
            "Rival benchmark",
            new List<EnemyDefinition> { Act2FrugalGuard, Act2FrugalGuard, Act2FrugalArcher, Act2FrugalHealer },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.Frugal),

        new EncounterDefinition(
            2, 4,
            EncounterType.Dungeon,
            "Gloom Bat",
            "Attacks your lowest-health backline hero on turn 2.",
            "Backline pressure",
            new List<EnemyDefinition> { GloomBat, Imp },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            2, 5,
            EncounterType.Dungeon,
            "Debt Wraith",
            "Gains attack based on your current debt. Hardened for the descent.",
            "Debt punishment",
            new List<EnemyDefinition> { Act2DebtWraith },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            2, 6,
            EncounterType.RivalGhost,
            "Greedy Guild Rematch",
            "The Greedy Guild returns for Act 2, richer and meaner. Bigger tanks, a deadlier carry.",
            "Rival benchmark",
            new List<EnemyDefinition> { Act2GreedyTank, Act2GreedyTank, Act2GreedyCarry },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.Greedy),

        new EncounterDefinition(
            2, 7,
            EncounterType.Dungeon,
            "Hoard Fiend",
            "If the Hoard Fiend survives, your reward is reduced by 4 gold.",
            "Reward pressure",
            new List<EnemyDefinition> { HoardFiend, Imp },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            2, 8,
            EncounterType.Dungeon,
            "Brimstone Brute",
            "A towering demon. Heavy stress test before the final guild fight.",
            "Heavy dungeon",
            new List<EnemyDefinition> { BrimstoneBrute, Imp, Imp },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.None),

        new EncounterDefinition(
            2, 9,
            EncounterType.RivalGhost,
            "Carry Guild Rematch",
            "The Carry Guild doubles down: a fortified front line shielding an even stronger champion.",
            "Rival benchmark",
            new List<EnemyDefinition> { Act2CarryProtector, Act2CarryProtector, Act2CarryChampion, Act2CarrySupport },
            GameRules.WinReward,
            EncounterEffectId.None,
            RivalGuild.Carry),

        new EncounterDefinition(
            2, 10,
            EncounterType.FinalBoss,
            "Infernal Auditor",
            "Act 2 capstone. The Infernal Auditor tallies your debts in fire.",
            "Final boss",
            new List<EnemyDefinition> { InfernalAuditor },
            GameRules.WinReward,
            EncounterEffectId.FinalBossDamage,
            RivalGuild.None)
    };

    public static readonly IReadOnlyList<EncounterDefinition> Encounters =
        new ReadOnlyCollection<EncounterDefinition>(EncounterDefinitions);

    // Encounters are keyed by act + 1-based slot, not absolute round. A slot
    // can hold more than one candidate so M20 act pools can vary which fight
    // appears; EncounterManager picks from the returned pool.
    public static List<EncounterDefinition> GetEncounterPool(int act, int slot)
    {
        List<EncounterDefinition> pool = new List<EncounterDefinition>();
        for (int i = 0; i < EncounterDefinitions.Count; i++)
        {
            EncounterDefinition encounter = EncounterDefinitions[i];
            if (encounter.Act == act && encounter.Slot == slot)
            {
                pool.Add(encounter);
            }
        }

        return pool;
    }

    // Per-act rival roster seam: the typed link from an act to the encounter
    // each guild fields that act. Returns null if the guild has no fight in
    // the act. M20 act content uses this to evolve guilds per act.
    public static EncounterDefinition GetRivalEncounter(int act, RivalGuild guild)
    {
        if (guild == RivalGuild.None)
        {
            return null;
        }

        for (int i = 0; i < EncounterDefinitions.Count; i++)
        {
            EncounterDefinition encounter = EncounterDefinitions[i];
            if (encounter.Act == act && encounter.RivalGuild == guild)
            {
                return encounter;
            }
        }

        return null;
    }

    public static readonly IReadOnlyList<PayrollActionDefinition> AllPayrollActions =
        new ReadOnlyCollection<PayrollActionDefinition>(PayrollActionDefinitions);

    public static readonly IReadOnlyList<RelicDefinition> AllRelics =
        new ReadOnlyCollection<RelicDefinition>(RelicDefinitions);

    private static readonly DifficultyPreset[] DifficultyPresetDefinitions =
    {
        new DifficultyPreset(
            DifficultyPresetId.ApprenticeLedger,
            "Apprentice Ledger",
            GameRules.ApprenticeStartingGold,
            GameRules.StartingDebt,
            GameRules.ApprenticeStartingMorale,
            GameRules.ApprenticeInterestDivisor,
            GameRules.ApprenticeDebtLimit,
            GameRules.ApprenticeHeroHealthMult,
            GameRules.NoCombatMultiplier,
            GameRules.NoCombatMultiplier,
            GameRules.ApprenticeEnemyDamageMult),

        new DifficultyPreset(
            DifficultyPresetId.StandardContract,
            "Standard Contract",
            GameRules.StartingGold,
            GameRules.StartingDebt,
            GameRules.StartingMorale,
            GameRules.InterestDebtDivisor,
            GameRules.DebtLimit,
            GameRules.NoCombatMultiplier,
            GameRules.NoCombatMultiplier,
            GameRules.NoCombatMultiplier,
            GameRules.NoCombatMultiplier),

        new DifficultyPreset(
            DifficultyPresetId.PredatoryInterest,
            "Predatory Interest",
            GameRules.PredatoryStartingGold,
            GameRules.StartingDebt,
            GameRules.StartingMorale,
            GameRules.PredatoryInterestDivisor,
            GameRules.PredatoryDebtLimit,
            GameRules.NoCombatMultiplier,
            GameRules.NoCombatMultiplier,
            GameRules.PredatoryEnemyHealthMult,
            GameRules.PredatoryEnemyDamageMult)
    };

    public static readonly IReadOnlyList<DifficultyPreset> AllDifficultyPresets =
        new ReadOnlyCollection<DifficultyPreset>(DifficultyPresetDefinitions);

    public static DifficultyPreset GetDifficultyPreset(DifficultyPresetId id)
    {
        for (int i = 0; i < DifficultyPresetDefinitions.Length; i++)
        {
            if (DifficultyPresetDefinitions[i].Id == id)
            {
                return DifficultyPresetDefinitions[i];
            }
        }

        return DifficultyPresetDefinitions[(int)GameRules.DefaultDifficultyPreset];
    }

    public static RelicDefinition GetRelic(RelicId id)
    {
        for (int i = 0; i < RelicDefinitions.Length; i++)
        {
            if (RelicDefinitions[i].Id == id)
            {
                return RelicDefinitions[i];
            }
        }

        return RelicDefinitions[0];
    }

    public static List<RivalGuildState> CreateRivalGuilds()
    {
        return new List<RivalGuildState>
        {
            new RivalGuildState(
                RivalGuild.Greedy,
                "Greedy Guild",
                GameRules.StartingMorale,
                GameRules.StartingDebt,
                GameRules.GreedyRivalStartingPayroll,
                "Dangerous",
                GameRules.GreedyRivalPayrollGrowth),

            new RivalGuildState(
                RivalGuild.Frugal,
                "Frugal Guild",
                GameRules.StartingMorale,
                GameRules.StartingDebt,
                GameRules.FrugalRivalStartingPayroll,
                "Safe",
                GameRules.FrugalRivalPayrollGrowth),

            new RivalGuildState(
                RivalGuild.Carry,
                "Carry Guild",
                GameRules.StartingMorale,
                GameRules.StartingDebt,
                GameRules.CarryRivalStartingPayroll,
                "Scaling",
                GameRules.CarryRivalOddRoundPayrollGrowth)
        };
    }
}
