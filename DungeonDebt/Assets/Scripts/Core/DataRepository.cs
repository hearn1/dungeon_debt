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
        CaveBat
    };

    private static readonly PayrollActionDefinition TakeLoanAction = new PayrollActionDefinition(
        PayrollActionId.TakeLoan,
        "Take Loan",
        "Gain " + GameRules.LoanGoldGain + " gold immediately. Adds " + GameRules.LoanDebtCost + " debt.");

    private static readonly PayrollActionDefinition CutWagesAction = new PayrollActionDefinition(
        PayrollActionId.CutWages,
        "Cut Wages",
        "Each hero's upkeep this round drops by " + GameRules.CutWagesUpkeepReduction + " (min 0). Each hero's attack drops by " + GameRules.CutWagesAttackPenalty + " (min 0).");

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

    public static readonly IReadOnlyList<PayrollActionDefinition> AllPayrollActions =
        new ReadOnlyCollection<PayrollActionDefinition>(PayrollActionDefinitions);

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
