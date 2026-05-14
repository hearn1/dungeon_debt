using System.Collections.Generic;

public class RunState
{
    public RunState()
    {
        Party = new List<HeroInstance>();
        Rivals = new List<RivalGuildState>();
        Encounters = new List<EncounterDefinition>();
    }

    public int Round { get; set; }
    public int Gold { get; set; }
    public int Debt { get; set; }
    public int Morale { get; set; }
    public List<HeroInstance> Party { get; }
    public List<RivalGuildState> Rivals { get; }
    public List<EncounterDefinition> Encounters { get; }
    public PayrollActionId? SelectedPayrollAction { get; set; }
    public int RerollCount { get; set; }
    public bool HasLatestRewardSummary { get; set; }
    public bool LatestCombatWon { get; set; }
    public int LatestRewardGold { get; set; }
    public int LatestMoraleChange { get; set; }
    public int LatestTotalUpkeep { get; set; }
    public int LatestUpkeepPaid { get; set; }
    public int LatestUpkeepShortfall { get; set; }
    public int LatestInterestCharged { get; set; }
    public int LatestInterestPaid { get; set; }
    public int LatestInterestAddedToDebt { get; set; }
}
