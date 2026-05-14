using System.Collections.Generic;

public class CombatResult
{
    public CombatResult()
    {
        LogLines = new List<string>();
        SurvivorFlags = new Dictionary<string, bool>();
        DeadHeroes = new List<HeroInstance>();
    }

    public bool PlayerWon { get; set; }
    public int CombatRoundsElapsed { get; set; }
    public List<string> LogLines { get; }
    public Dictionary<string, bool> SurvivorFlags { get; }
    public List<HeroInstance> DeadHeroes { get; }
}
