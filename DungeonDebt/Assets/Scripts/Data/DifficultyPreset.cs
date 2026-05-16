// Immutable run-contract preset. Assembled once in DataRepository from
// GameRules constants and applied once in RunManager.InitializeRun. The four
// combat multipliers are carried onto RunState this slice but not yet read by
// combat (M15.2).
public class DifficultyPreset
{
    public DifficultyPreset(
        DifficultyPresetId id,
        string displayName,
        int startingGold,
        int startingDebt,
        int startingMorale,
        int interestDivisor,
        int debtLimit,
        float heroHealthMult,
        float heroDamageMult,
        float enemyHealthMult,
        float enemyDamageMult)
    {
        Id = id;
        DisplayName = displayName;
        StartingGold = startingGold;
        StartingDebt = startingDebt;
        StartingMorale = startingMorale;
        InterestDivisor = interestDivisor;
        DebtLimit = debtLimit;
        HeroHealthMult = heroHealthMult;
        HeroDamageMult = heroDamageMult;
        EnemyHealthMult = enemyHealthMult;
        EnemyDamageMult = enemyDamageMult;
    }

    public DifficultyPresetId Id { get; }
    public string DisplayName { get; }
    public int StartingGold { get; }
    public int StartingDebt { get; }
    public int StartingMorale { get; }
    public int InterestDivisor { get; }
    public int DebtLimit { get; }
    public float HeroHealthMult { get; }
    public float HeroDamageMult { get; }
    public float EnemyHealthMult { get; }
    public float EnemyDamageMult { get; }
}
