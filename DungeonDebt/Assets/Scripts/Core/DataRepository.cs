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
        "No effect.");

    private static readonly EnemyDefinition GoblinThief = new EnemyDefinition(
        "goblin_thief",
        "Goblin Thief",
        2,
        4,
        EnemyEffectId.GoblinStealGold,
        "Steals gold if alive past combat round 3.");

    private static readonly EnemyDefinition TaxCollector = new EnemyDefinition(
        "tax_collector",
        "Tax Collector",
        1,
        8,
        EnemyEffectId.None,
        "Encounter raises upkeep this round.");

    private static readonly EnemyDefinition BacklineBat = new EnemyDefinition(
        "backline_bat",
        "Backline Bat",
        3,
        4,
        EnemyEffectId.BackBatBackline,
        "Attacks lowest-HP backline hero on combat round 2.");

    private static readonly EnemyDefinition DebtWraith = new EnemyDefinition(
        "debt_wraith",
        "Debt Wraith",
        1,
        10,
        EnemyEffectId.DebtWraithScales,
        "Attack scales with player debt at combat start.");

    private static readonly EnemyDefinition TreasureLeech = new EnemyDefinition(
        "treasure_leech",
        "Treasure Leech",
        1,
        12,
        EnemyEffectId.TreasureLeechRewardDrain,
        "Reduces reward if alive at combat end.");

    private static readonly EnemyDefinition DungeonAuditor = new EnemyDefinition(
        "dungeon_auditor",
        "Dungeon Auditor",
        3,
        20,
        EnemyEffectId.DungeonAuditorBoss,
        "Raises upkeep and deals periodic damage.");

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
        "No effect.");

    private static readonly EnemyDefinition CarryProtector = new EnemyDefinition(
        "carry_protector",
        "Carry Protector",
        1,
        10,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition CarryCarry = new EnemyDefinition(
        "carry_carry",
        "Carry Champion",
        6,
        6,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition FrugalGuard = new EnemyDefinition(
        "frugal_guard",
        "Frugal Guard",
        2,
        6,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition FrugalArcher = new EnemyDefinition(
        "frugal_archer",
        "Frugal Archer",
        3,
        4,
        EnemyEffectId.None,
        "No effect.");

    private static readonly EnemyDefinition FrugalHealer = new EnemyDefinition(
        "frugal_healer",
        "Frugal Healer",
        1,
        5,
        EnemyEffectId.FrugalGhostHeal,
        "Heals leftmost living ally each combat round.");

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
        FrugalHealer
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

    private static readonly EncounterDefinition SandboxEncounterDefinition = new EncounterDefinition(
        1,
        EncounterType.Dungeon,
        "Sandbox Slimes",
        "Simple enemies. Win by having enough basic stats.",
        "Basic stat check",
        new List<EnemyDefinition>
        {
            Slime,
            Slime,
            CaveBat
        },
        GameRules.WinReward,
        EncounterEffectId.None,
        null);

    public static readonly IReadOnlyList<HeroDefinition> AllHeroes =
        new ReadOnlyCollection<HeroDefinition>(HeroDefinitions);

    public static readonly IReadOnlyList<EnemyDefinition> AllEnemies =
        new ReadOnlyCollection<EnemyDefinition>(EnemyDefinitions);

    public static readonly EncounterDefinition SandboxEncounter = SandboxEncounterDefinition;

    private static readonly List<EncounterDefinition> EncounterDefinitions = new List<EncounterDefinition>
    {
        new EncounterDefinition(
            1,
            EncounterType.Dungeon,
            "Slimes",
            "Simple enemies. Win by having enough basic stats.",
            "Basic stat check",
            new List<EnemyDefinition> { Slime, Slime, Slime },
            GameRules.WinReward,
            EncounterEffectId.None,
            null),

        new EncounterDefinition(
            2,
            EncounterType.Dungeon,
            "Goblin Thieves",
            "If a Goblin Thief survives past combat round 3, lose 3 gold.",
            "Economy pressure",
            new List<EnemyDefinition> { GoblinThief, GoblinThief },
            GameRules.WinReward,
            EncounterEffectId.None,
            null),

        new EncounterDefinition(
            3,
            EncounterType.RivalGhost,
            "Greedy Guild Ghost",
            "A reckless rival guild with expensive heroes. Strong now, but drowning in debt.",
            "Rival benchmark",
            new List<EnemyDefinition> { GreedyTank, GreedyTank, GreedyCarry },
            GameRules.WinReward,
            EncounterEffectId.None,
            "greedy"),

        new EncounterDefinition(
            4,
            EncounterType.Dungeon,
            "Tax Collector",
            "Your total upkeep is increased by 2 this round.",
            "Payroll pressure",
            new List<EnemyDefinition> { TaxCollector },
            GameRules.WinReward,
            EncounterEffectId.TaxCollectorUpkeep,
            null),

        new EncounterDefinition(
            5,
            EncounterType.Dungeon,
            "Backline Bat",
            "Attacks your lowest-health backline hero on turn 2.",
            "Backline pressure",
            new List<EnemyDefinition> { BacklineBat, Slime },
            GameRules.WinReward,
            EncounterEffectId.None,
            null),

        new EncounterDefinition(
            6,
            EncounterType.RivalGhost,
            "Carry Guild Ghost",
            "This rival protects a high-damage carry. Kill it quickly or survive the burst.",
            "Rival benchmark",
            new List<EnemyDefinition> { CarryProtector, CarryProtector, CarryCarry },
            GameRules.WinReward,
            EncounterEffectId.None,
            "carry"),

        new EncounterDefinition(
            7,
            EncounterType.Dungeon,
            "Debt Wraith",
            "Gains attack based on your current debt.",
            "Debt punishment",
            new List<EnemyDefinition> { DebtWraith },
            GameRules.WinReward,
            EncounterEffectId.None,
            null),

        new EncounterDefinition(
            8,
            EncounterType.Dungeon,
            "Treasure Leech",
            "If Treasure Leech survives, your reward is reduced by 4 gold.",
            "Reward pressure",
            new List<EnemyDefinition> { TreasureLeech, Slime },
            GameRules.WinReward,
            EncounterEffectId.None,
            null),

        new EncounterDefinition(
            9,
            EncounterType.RivalGhost,
            "Frugal Guild Ghost",
            "A stable rival guild with cheap heroes and strong morale.",
            "Rival benchmark",
            new List<EnemyDefinition> { FrugalGuard, FrugalGuard, FrugalArcher, FrugalHealer },
            GameRules.WinReward,
            EncounterEffectId.None,
            "frugal"),

        new EncounterDefinition(
            10,
            EncounterType.FinalBoss,
            "Dungeon Auditor",
            "Final boss. Damages your party and adds debt pressure.",
            "Final boss",
            new List<EnemyDefinition> { DungeonAuditor },
            GameRules.WinReward,
            EncounterEffectId.FinalBossDamage,
            null)
    };

    public static readonly IReadOnlyList<EncounterDefinition> Encounters =
        new ReadOnlyCollection<EncounterDefinition>(EncounterDefinitions);

    public static readonly IReadOnlyList<PayrollActionDefinition> AllPayrollActions =
        new ReadOnlyCollection<PayrollActionDefinition>(PayrollActionDefinitions);

    public static List<RivalGuildState> CreateRivalGuilds()
    {
        return new List<RivalGuildState>
        {
            new RivalGuildState(
                "greedy",
                "Greedy Guild",
                GameRules.StartingMorale,
                GameRules.StartingDebt,
                GameRules.GreedyRivalStartingPayroll,
                "Dangerous",
                GameRules.GreedyRivalPayrollGrowth),

            new RivalGuildState(
                "frugal",
                "Frugal Guild",
                GameRules.StartingMorale,
                GameRules.StartingDebt,
                GameRules.FrugalRivalStartingPayroll,
                "Safe",
                GameRules.FrugalRivalPayrollGrowth),

            new RivalGuildState(
                "carry",
                "Carry Guild",
                GameRules.StartingMorale,
                GameRules.StartingDebt,
                GameRules.CarryRivalStartingPayroll,
                "Scaling",
                GameRules.CarryRivalOddRoundPayrollGrowth)
        };
    }

    public static RunState CreateSandboxRun()
    {
        RunState run = new RunState();
        run.Round = 1;
        run.Gold = GameRules.StartingGold;
        run.Debt = GameRules.StartingDebt;
        run.Morale = GameRules.StartingMorale;
        run.Party.Add(new HeroInstance(Warrior, 0));
        run.Party.Add(new HeroInstance(Squire, 1));
        run.Party.Add(new HeroInstance(Wizard, 2));
        run.Party.Add(new HeroInstance(Ranger, 3));

        return run;
    }
}
