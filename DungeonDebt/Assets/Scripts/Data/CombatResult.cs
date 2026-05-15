using System.Collections.Generic;

public class CombatResult
{
    public CombatResult()
    {
        LogLines = new List<string>();
        SurvivorFlags = new Dictionary<string, bool>();
        DeadHeroes = new List<HeroInstance>();
        PlayerStartUnits = new List<CombatUnit>();
        EnemyStartUnits = new List<CombatUnit>();
        PlayerFinalUnits = new List<CombatUnit>();
        EnemyFinalUnits = new List<CombatUnit>();
    }

    public bool PlayerWon { get; set; }
    public int CombatRoundsElapsed { get; set; }
    public List<string> LogLines { get; }
    public Dictionary<string, bool> SurvivorFlags { get; }
    public List<HeroInstance> DeadHeroes { get; }
    public List<CombatUnit> PlayerStartUnits { get; }
    public List<CombatUnit> EnemyStartUnits { get; }
    public List<CombatUnit> PlayerFinalUnits { get; }
    public List<CombatUnit> EnemyFinalUnits { get; }
}
