using System.Collections.Generic;

public class CombatManager
{
    private RunState _run;
    private int _knightRedirectsRemaining;

    public CombatResult StartCombat(RunState run, EncounterDefinition encounter)
    {
        CombatResult result = new CombatResult();
        CombatLogger logger = new CombatLogger();
        List<CombatUnit> playerUnits = BuildPlayerUnits(run);
        List<CombatUnit> enemyUnits = BuildEnemyUnits(run, encounter);

        _run = run;
        _knightRedirectsRemaining = 0;

        HeroEffects.OnCombatStart(run, encounter, playerUnits, enemyUnits, logger, out _knightRedirectsRemaining);
        CopyUnitSnapshots(playerUnits, result.PlayerStartUnits);
        CopyUnitSnapshots(enemyUnits, result.EnemyStartUnits);

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
            ResolveSideActions(playerUnits, enemyUnits, combatRound, logger);
            if (!HasLivingUnits(enemyUnits))
            {
                result.PlayerWon = true;
                result.CombatRoundsElapsed = combatRound;
                logger.LogFinalResult(true);
                FinishResult(result, playerUnits, enemyUnits, logger);
                return result;
            }

            ResolveSideActions(enemyUnits, playerUnits, combatRound, logger);
            if (!HasLivingUnits(playerUnits))
            {
                result.PlayerWon = false;
                result.CombatRoundsElapsed = combatRound;
                logger.LogFinalResult(false);
                FinishResult(result, playerUnits, enemyUnits, logger);
                return result;
            }

            HeroEffects.OnEndOfCombatRound(combatRound, run, encounter, playerUnits, enemyUnits, result, logger);

            if (!HasLivingUnits(playerUnits))
            {
                result.PlayerWon = false;
                result.CombatRoundsElapsed = combatRound;
                logger.LogFinalResult(false);
                FinishResult(result, playerUnits, enemyUnits, logger);
                return result;
            }

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
            int maxHealth = GetScaledHeroMaxHealth(hero, run);
            int attack = GameRules.ScaleCombatStat(hero.Attack, run.HeroDamageMultiplier);
            CombatUnit unit = new CombatUnit(
                hero.Definition.DisplayName,
                attack,
                maxHealth,
                maxHealth,
                true,
                hero.FormationSlot,
                hero,
                null);

            playerUnits.Add(unit);
        }

        SortUnitsBySlot(playerUnits);
        return playerUnits;
    }

    private static List<CombatUnit> BuildEnemyUnits(RunState run, EncounterDefinition encounter)
    {
        List<CombatUnit> enemyUnits = new List<CombatUnit>();
        if (encounter == null)
        {
            return enemyUnits;
        }

        for (int i = 0; i < encounter.Enemies.Count; i++)
        {
            EnemyDefinition enemy = encounter.Enemies[i];
            int attack = GameRules.ScaleCombatStat(enemy.Attack, run != null ? run.EnemyDamageMultiplier : GameRules.NoCombatMultiplier);
            int health = GameRules.ScaleCombatStat(enemy.Health, run != null ? run.EnemyHealthMultiplier : GameRules.NoCombatMultiplier);
            CombatUnit unit = new CombatUnit(
                enemy.DisplayName,
                attack,
                health,
                health,
                false,
                i,
                null,
                enemy);

            enemyUnits.Add(unit);
        }

        SortUnitsBySlot(enemyUnits);
        return enemyUnits;
    }

    private void ResolveSideActions(List<CombatUnit> attackers, List<CombatUnit> defenders, int combatRound, CombatLogger logger)
    {
        for (int i = 0; i < attackers.Count; i++)
        {
            CombatUnit attacker = attackers[i];
            if (!attacker.IsAlive)
            {
                continue;
            }

            CombatUnit defender = FindTarget(attacker, defenders, combatRound);
            if (defender == null)
            {
                return;
            }

            // Knight redirect only applies when an enemy is hitting a player backline hero.
            if (!attacker.IsPlayerSide)
            {
                defender = HeroEffects.TryRedirectToKnight(defender, defenders, ref _knightRedirectsRemaining, logger);
                if (defender == null)
                {
                    return;
                }
            }

            HeroEffects.OnAttack(attacker, defender, logger);
            ApplyAttack(attacker, defender, logger);
        }
    }

    private static CombatUnit FindTarget(CombatUnit attacker, List<CombatUnit> defenders, int combatRound)
    {
        CombatUnit overridden = HeroEffects.OverrideTarget(attacker, defenders, combatRound);
        if (overridden != null)
        {
            return overridden;
        }

        CombatUnit frontlineTarget = FindLeftmostLivingUnit(defenders, 0, GameRules.FrontlineSlots - 1);
        if (frontlineTarget != null)
        {
            return frontlineTarget;
        }

        return FindLeftmostLivingUnit(defenders, GameRules.FrontlineSlots, GameRules.MaxPartySize - 1);
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

    private void ApplyAttack(CombatUnit attacker, CombatUnit defender, CombatLogger logger)
    {
        int reduction = HeroEffects.GetDamageReduction(defender);
        int damage = attacker.Attack - reduction;
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
            HeroEffects.OnKill(attacker, defender, _run, logger);
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

    private void FinishResult(CombatResult result, List<CombatUnit> playerUnits, List<CombatUnit> enemyUnits, CombatLogger logger)
    {
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (!unit.IsAlive && unit.SourceHero != null)
            {
                result.DeadHeroes.Add(unit.SourceHero);
            }

            // MVP rule (CLAUDE.md §Common pitfalls): dead-in-combat heroes are
            // restored for the next round. Reset HeroInstance.CurrentHealth to full
            // here so any UI rendered between combats sees a coherent value.
            if (unit.SourceHero != null && unit.SourceHero.Definition != null)
            {
                unit.SourceHero.CurrentHealth = GetScaledHeroMaxHealth(unit.SourceHero, _run);
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

        HeroEffects.OnCombatEnd(result, _run, playerUnits, enemyUnits, logger);
        CopyUnitSnapshots(playerUnits, result.PlayerFinalUnits);
        CopyUnitSnapshots(enemyUnits, result.EnemyFinalUnits);
        logger.CopyTo(result.LogLines);
        logger.CopyReplayTo(result.ReplayEvents);
    }

    private static void CopyUnitSnapshots(List<CombatUnit> source, List<CombatUnit> destination)
    {
        destination.Clear();
        for (int i = 0; i < source.Count; i++)
        {
            CombatUnit unit = source[i];
            destination.Add(new CombatUnit(
                unit.DisplayName,
                unit.Attack,
                unit.CurrentHealth,
                unit.MaxHealth,
                unit.IsPlayerSide,
                unit.Slot,
                unit.SourceHero,
                unit.SourceEnemy));
        }
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

    private static int GetScaledHeroMaxHealth(HeroInstance hero, RunState run)
    {
        return GameRules.ScaleCombatStat(
            HeroEffects.GetTierAdjustedMaxHealth(hero),
            run != null ? run.HeroHealthMultiplier : GameRules.NoCombatMultiplier);
    }
}
