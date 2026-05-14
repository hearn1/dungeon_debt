using System.Collections.Generic;

public static class HeroEffects
{
    public static void OnCombatStart(RunState run, EncounterDefinition encounter, List<CombatUnit> playerUnits, List<CombatUnit> enemyUnits, CombatLogger logger)
    {
    }

    public static void OnAttack(CombatUnit attacker, CombatUnit defender, CombatLogger logger)
    {
    }

    public static void OnKill(CombatUnit attacker, CombatUnit defeatedUnit, CombatLogger logger)
    {
    }

    public static void OnEndOfCombatRound(int combatRound, List<CombatUnit> playerUnits, List<CombatUnit> enemyUnits, CombatLogger logger)
    {
    }

    public static void OnCombatEnd(CombatResult result, List<CombatUnit> playerUnits, List<CombatUnit> enemyUnits, CombatLogger logger)
    {
    }

    public static int OnUpkeepCalculated(HeroInstance hero, int currentUpkeep)
    {
        return currentUpkeep;
    }
}
