using System.Collections.Generic;

public class RunState
{
    public RunState()
    {
        Party = new List<HeroInstance>();
        Rivals = new List<RivalGuildState>();
        ActiveRelics = new List<RelicId>();
        PendingRelicChoices = new List<RelicId>();
    }

    public int Act { get; set; }
    public int Round { get; set; }
    public int Gold { get; set; }
    public int Debt { get; set; }
    public int Morale { get; set; }
    public List<HeroInstance> Party { get; }
    public List<RivalGuildState> Rivals { get; }
    public PayrollActionId? SelectedPayrollAction { get; set; }
    public int RerollCount { get; set; }
    public bool HasLatestRewardSummary { get; set; }
    public bool LatestCombatWon { get; set; }
    public int LatestRewardGold { get; set; }
    public int LatestRelicRewardGold { get; set; }
    public int LatestMoraleChange { get; set; }
    public int LatestTotalUpkeep { get; set; }
    public int LatestUpkeepPaid { get; set; }
    public int LatestUpkeepShortfall { get; set; }
    public int LatestInterestCharged { get; set; }
    public int LatestInterestPaid { get; set; }
    public int LatestInterestAddedToDebt { get; set; }
    public string LatestVeterancySummary { get; set; }
    public string LatestPayrollSummary { get; set; }
    public int LatestVictoryBonusLossDebt { get; set; }
    public string LatestEndReason { get; set; }
    public EncounterDefinition CurrentEncounter { get; set; }
    public EncounterDefinition LatestCompletedEncounter { get; set; }
    public bool FullUpkeepPaidLastRound { get; set; }
    public List<RelicId> ActiveRelics { get; }
    public List<RelicId> PendingRelicChoices { get; }
    public bool HasPendingRelicReward { get; set; }
    public GameState PendingRelicNextState { get; set; }

    // M15.1 difficulty preset. Run-scoped so a preset never mutates GameRules.
    // InterestDivisor/DebtLimit are read by RunManager interest + debt-defeat
    // math. The four combat multipliers are carried but not yet applied (M15.2).
    public DifficultyPresetId SelectedDifficulty { get; set; }
    public string DifficultyDisplayName { get; set; }
    public int InterestDivisor { get; set; }
    public int DebtLimit { get; set; }
    public float HeroHealthMultiplier { get; set; }
    public float HeroDamageMultiplier { get; set; }
    public float EnemyHealthMultiplier { get; set; }
    public float EnemyDamageMultiplier { get; set; }
}
