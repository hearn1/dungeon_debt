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
            int maxHealth = RunManager.GetScaledHeroMaxHealth(hero, run);
            int attack = GameRules.ScaleCombatStat(hero.Attack, run.HeroDamageMultiplier) +
                RunManager.GetRelicAttackBonus(run, hero);
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

            for (int j = 0; j < enemy.StartingStatuses.Count; j++)
            {
                unit.Statuses.Add(enemy.StartingStatuses[j]);
            }

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
        int damage = attacker.Attack;
        damage = ApplyOutgoingStatusModifiers(attacker, damage, logger);
        damage = ApplyIncomingStatusModifiers(defender, damage, logger);

        int reduction = HeroEffects.GetDamageReduction(defender);
        damage -= reduction;
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
        else
        {
            ApplyAttackStatuses(attacker, defender, logger);
        }

        ApplyPostAttackStatusDamage(attacker, logger);
    }

    private static void ApplyAttackStatuses(CombatUnit attacker, CombatUnit defender, CombatLogger logger)
    {
        if (attacker == null || defender == null || attacker.SourceEnemy == null)
        {
            return;
        }

        IReadOnlyList<CombatStatusId> attackStatuses = attacker.SourceEnemy.AttackStatuses;
        for (int i = 0; i < attackStatuses.Count; i++)
        {
            CombatStatusId statusId = attackStatuses[i];
            bool added = defender.Statuses.Add(statusId);
            if (added && logger != null)
            {
                logger.LogStatusChange(
                    defender,
                    attacker.DisplayName + " applies " + GameRules.GetCombatStatusLabel(statusId) + " to " + defender.DisplayName + ".");
            }
        }
    }

    private static int ApplyOutgoingStatusModifiers(CombatUnit attacker, int damage, CombatLogger logger)
    {
        if (attacker == null || attacker.Statuses == null)
        {
            return damage;
        }

        if (attacker.Statuses.Has(CombatStatusId.Weakened))
        {
            int before = damage;
            damage -= GameRules.WeakenedAttackPenalty;
            if (damage < 0)
            {
                damage = 0;
            }
            if (logger != null)
            {
                logger.LogStatusChange(attacker, attacker.DisplayName + " is Weakened (" + before + " -> " + damage + " attack).");
            }
        }

        if (attacker.Statuses.Has(CombatStatusId.Burned))
        {
            int before = damage;
            damage -= GameRules.BurnedAttackPenalty;
            if (damage < 0)
            {
                damage = 0;
            }
            if (logger != null)
            {
                logger.LogStatusChange(attacker, attacker.DisplayName + " is Burned (" + before + " -> " + damage + " attack).");
            }
        }

        if (attacker.Statuses.Has(CombatStatusId.Inspired))
        {
            int before = damage;
            damage += GameRules.InspiredAttackBonus;
            attacker.Statuses.Remove(CombatStatusId.Inspired);
            if (logger != null)
            {
                logger.LogStatusChange(attacker, attacker.DisplayName + " spends Inspired (" + before + " -> " + damage + " attack).");
            }
        }

        return damage;
    }

    private static int ApplyIncomingStatusModifiers(CombatUnit defender, int damage, CombatLogger logger)
    {
        if (defender == null || defender.Statuses == null)
        {
            return damage;
        }

        if (defender.Statuses.Has(CombatStatusId.Marked))
        {
            int before = damage;
            damage += GameRules.MarkedIncomingDamageBonus;
            defender.Statuses.Remove(CombatStatusId.Marked);
            if (logger != null)
            {
                logger.LogStatusChange(defender, defender.DisplayName + " is Marked (" + before + " -> " + damage + " incoming damage).");
            }
        }

        if (defender.Statuses.Has(CombatStatusId.Guarded))
        {
            int before = damage;
            damage = (damage + GameRules.GuardedDamageDivisor - 1) / GameRules.GuardedDamageDivisor;
            defender.Statuses.Remove(CombatStatusId.Guarded);
            if (logger != null)
            {
                logger.LogStatusChange(defender, defender.DisplayName + " spends Guarded (" + before + " -> " + damage + " incoming damage).");
            }
        }

        return damage;
    }

    private static void ApplyPostAttackStatusDamage(CombatUnit attacker, CombatLogger logger)
    {
        if (attacker == null || !attacker.IsAlive || attacker.Statuses == null)
        {
            return;
        }

        if (attacker.Statuses.Has(CombatStatusId.Burned))
        {
            ApplyStatusDamage(attacker, CombatStatusId.Burned, GameRules.BurnedSelfDamage, logger);
            if (!attacker.IsAlive)
            {
                return;
            }
        }

        if (attacker.Statuses.Has(CombatStatusId.Poisoned))
        {
            int poisonDamage = attacker.Statuses.PoisonDamage;
            ApplyStatusDamage(attacker, CombatStatusId.Poisoned, poisonDamage, logger);
            if (attacker.IsAlive)
            {
                attacker.Statuses.IncreasePoisonDamage();
                if (logger != null)
                {
                    logger.LogStatusChange(attacker, attacker.DisplayName + "'s poison rises to " + attacker.Statuses.PoisonDamage + ".");
                }
            }
        }
    }

    private static void ApplyStatusDamage(CombatUnit unit, CombatStatusId statusId, int damage, CombatLogger logger)
    {
        if (damage <= 0)
        {
            return;
        }

        unit.CurrentHealth -= damage;
        if (unit.CurrentHealth < 0)
        {
            unit.CurrentHealth = 0;
        }

        if (logger != null)
        {
            logger.LogStatusDamage(unit, statusId, damage);
            if (!unit.IsAlive)
            {
                logger.LogDeath(unit);
            }
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
                unit.SourceHero.CurrentHealth = RunManager.GetScaledHeroMaxHealth(unit.SourceHero, _run);
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
            CombatUnit snapshot = new CombatUnit(
                unit.DisplayName,
                unit.Attack,
                unit.CurrentHealth,
                unit.MaxHealth,
                unit.IsPlayerSide,
                unit.Slot,
                unit.SourceHero,
                unit.SourceEnemy);
            snapshot.CopyStatusesFrom(unit);
            destination.Add(snapshot);
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

}
