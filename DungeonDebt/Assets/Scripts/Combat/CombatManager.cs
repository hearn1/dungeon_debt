using System.Collections.Generic;

public class CombatManager
{
    public CombatResult StartCombat(RunState run, EncounterDefinition encounter)
    {
        CombatResult result = new CombatResult();
        CombatLogger logger = new CombatLogger();
        List<CombatUnit> playerUnits = BuildPlayerUnits(run);
        List<CombatUnit> enemyUnits = BuildEnemyUnits(encounter);

        HeroEffects.OnCombatStart(run, encounter, playerUnits, enemyUnits, logger);

        if (!HasLivingUnits(playerUnits))
        {
            result.PlayerWon = false;
            result.CombatRoundsElapsed = 0;
            logger.LogMessage("Player has no living heroes.");
            logger.LogFinalResult(false);
            FinishResult(result, playerUnits, enemyUnits, logger);
            return result;
        }

        if (!HasLivingUnits(enemyUnits))
        {
            result.PlayerWon = true;
            result.CombatRoundsElapsed = 0;
            logger.LogMessage("Enemy side has no living units.");
            logger.LogFinalResult(true);
            FinishResult(result, playerUnits, enemyUnits, logger);
            return result;
        }

        for (int combatRound = 1; combatRound <= GameRules.CombatTurnLimit; combatRound++)
        {
            ResolveSideActions(playerUnits, enemyUnits, logger);
            if (!HasLivingUnits(enemyUnits))
            {
                result.PlayerWon = true;
                result.CombatRoundsElapsed = combatRound;
                logger.LogFinalResult(true);
                FinishResult(result, playerUnits, enemyUnits, logger);
                return result;
            }

            ResolveSideActions(enemyUnits, playerUnits, logger);
            if (!HasLivingUnits(playerUnits))
            {
                result.PlayerWon = false;
                result.CombatRoundsElapsed = combatRound;
                logger.LogFinalResult(false);
                FinishResult(result, playerUnits, enemyUnits, logger);
                return result;
            }

            HeroEffects.OnEndOfCombatRound(combatRound, playerUnits, enemyUnits, logger);
            result.CombatRoundsElapsed = combatRound;
        }

        result.PlayerWon = false;
        logger.LogTurnLimit();
        logger.LogFinalResult(false);
        FinishResult(result, playerUnits, enemyUnits, logger);
        return result;
    }

    private static List<CombatUnit> BuildPlayerUnits(RunState run)
    {
        List<CombatUnit> playerUnits = new List<CombatUnit>();
        if (run == null)
        {
            return playerUnits;
        }

        for (int i = 0; i < run.Party.Count; i++)
        {
            HeroInstance hero = run.Party[i];
            hero.CurrentHealth = hero.Definition.BaseHealth;
            CombatUnit unit = new CombatUnit(
                hero.Definition.DisplayName,
                hero.Attack,
                hero.CurrentHealth,
                hero.Definition.BaseHealth,
                true,
                hero.FormationSlot,
                hero,
                null);

            playerUnits.Add(unit);
        }

        SortUnitsBySlot(playerUnits);
        return playerUnits;
    }

    private static List<CombatUnit> BuildEnemyUnits(EncounterDefinition encounter)
    {
        List<CombatUnit> enemyUnits = new List<CombatUnit>();
        if (encounter == null)
        {
            return enemyUnits;
        }

        for (int i = 0; i < encounter.Enemies.Count; i++)
        {
            EnemyDefinition enemy = encounter.Enemies[i];
            CombatUnit unit = new CombatUnit(
                enemy.DisplayName,
                enemy.Attack,
                enemy.Health,
                enemy.Health,
                false,
                i,
                null,
                enemy);

            enemyUnits.Add(unit);
        }

        SortUnitsBySlot(enemyUnits);
        return enemyUnits;
    }

    private static void ResolveSideActions(List<CombatUnit> attackers, List<CombatUnit> defenders, CombatLogger logger)
    {
        for (int i = 0; i < attackers.Count; i++)
        {
            CombatUnit attacker = attackers[i];
            if (!attacker.IsAlive)
            {
                continue;
            }

            CombatUnit defender = FindTarget(defenders);
            if (defender == null)
            {
                return;
            }

            HeroEffects.OnAttack(attacker, defender, logger);
            ApplyAttack(attacker, defender, logger);
        }
    }

    private static CombatUnit FindTarget(List<CombatUnit> units)
    {
        CombatUnit frontlineTarget = FindLeftmostLivingUnit(units, 0, GameRules.FrontlineSlots - 1);
        if (frontlineTarget != null)
        {
            return frontlineTarget;
        }

        return FindLeftmostLivingUnit(units, GameRules.FrontlineSlots, GameRules.MaxPartySize - 1);
    }

    private static CombatUnit FindLeftmostLivingUnit(List<CombatUnit> units, int minSlot, int maxSlot)
    {
        CombatUnit bestTarget = null;
        for (int i = 0; i < units.Count; i++)
        {
            CombatUnit unit = units[i];
            if (!unit.IsAlive || unit.Slot < minSlot || unit.Slot > maxSlot)
            {
                continue;
            }

            if (bestTarget == null || unit.Slot < bestTarget.Slot)
            {
                bestTarget = unit;
            }
        }

        return bestTarget;
    }

    private static void ApplyAttack(CombatUnit attacker, CombatUnit defender, CombatLogger logger)
    {
        int damage = attacker.Attack;
        if (damage < 0)
        {
            damage = 0;
        }

        defender.CurrentHealth -= damage;
        if (defender.CurrentHealth < 0)
        {
            defender.CurrentHealth = 0;
        }

        logger.LogAttack(attacker, defender, damage);

        if (!defender.IsAlive)
        {
            logger.LogDeath(defender);
            HeroEffects.OnKill(attacker, defender, logger);
        }
    }

    private static bool HasLivingUnits(List<CombatUnit> units)
    {
        for (int i = 0; i < units.Count; i++)
        {
            if (units[i].IsAlive)
            {
                return true;
            }
        }

        return false;
    }

    private static void FinishResult(CombatResult result, List<CombatUnit> playerUnits, List<CombatUnit> enemyUnits, CombatLogger logger)
    {
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (!unit.IsAlive && unit.SourceHero != null)
            {
                result.DeadHeroes.Add(unit.SourceHero);
            }

            if (unit.SourceHero != null)
            {
                unit.SourceHero.CurrentHealth = unit.CurrentHealth;
            }
        }

        for (int i = 0; i < enemyUnits.Count; i++)
        {
            CombatUnit unit = enemyUnits[i];
            if (unit.SourceEnemy != null)
            {
                result.SurvivorFlags[unit.SourceEnemy.Id + "Survived"] = unit.IsAlive;
            }
        }

        HeroEffects.OnCombatEnd(result, playerUnits, enemyUnits, logger);
        logger.CopyTo(result.LogLines);
    }

    private static void SortUnitsBySlot(List<CombatUnit> units)
    {
        units.Sort(CompareUnitsBySlot);
    }

    private static int CompareUnitsBySlot(CombatUnit first, CombatUnit second)
    {
        if (first.Slot < second.Slot)
        {
            return -1;
        }

        if (first.Slot > second.Slot)
        {
            return 1;
        }

        return 0;
    }
}
