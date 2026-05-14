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

    private static readonly HeroDefinition Squire = new HeroDefinition(
        "squire",
        "Squire",
        HeroRole.Tank,
        1,
        4,
        1,
        "No effect.",
        HeroEffectId.None);

    private static readonly HeroDefinition Wizard = new HeroDefinition(
        "wizard",
        "Wizard",
        HeroRole.Damage,
        3,
        4,
        5,
        "Gains +1 attack when full upkeep is paid.",
        HeroEffectId.WizardScaling);

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
        Squire,
        Wizard,
        Ranger,
        Priest
    };

    private static readonly List<EnemyDefinition> EnemyDefinitions = new List<EnemyDefinition>
    {
        Slime,
        TrainingDummy,
        CaveBat
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
