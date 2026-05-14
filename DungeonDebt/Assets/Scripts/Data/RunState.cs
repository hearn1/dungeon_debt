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
}
