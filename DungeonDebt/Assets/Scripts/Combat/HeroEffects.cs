using System.Collections.Generic;

public static class HeroEffects
{
    public static void OnCombatStart(
        RunState run,
        EncounterDefinition encounter,
        List<CombatUnit> playerUnits,
        List<CombatUnit> enemyUnits,
        CombatLogger logger,
        out bool knightRedirectAvailable)
    {
        knightRedirectAvailable = false;

        // Knight: arm the redirect flag if any Knight is alive in the formation.
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (!unit.IsAlive || unit.SourceHero == null || unit.SourceHero.Definition == null)
            {
                continue;
            }

            if (unit.SourceHero.Definition.EffectId == HeroEffectId.KnightRedirect)
            {
                knightRedirectAvailable = true;
                break;
            }
        }

        // Wizard scaling: +1 attack if full upkeep was paid last round.
        if (run != null && run.FullUpkeepPaidLastRound)
        {
            for (int i = 0; i < playerUnits.Count; i++)
            {
                CombatUnit unit = playerUnits[i];
                if (!unit.IsAlive || unit.SourceHero == null || unit.SourceHero.Definition == null)
                {
                    continue;
                }

                if (unit.SourceHero.Definition.EffectId == HeroEffectId.WizardScaling)
                {
                    unit.Attack += 1;
                    if (logger != null)
                    {
                        logger.LogMessage(unit.DisplayName + " gains +1 attack (full upkeep paid).");
                    }
                }
            }
        }

        // Enchanter: +1 attack to each adjacent Damage-role ally.
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (!unit.IsAlive || unit.SourceHero == null || unit.SourceHero.Definition == null)
            {
                continue;
            }

            if (unit.SourceHero.Definition.EffectId != HeroEffectId.EnchanterAdjacent)
            {
                continue;
            }

            for (int j = 0; j < playerUnits.Count; j++)
            {
                if (j == i)
                {
                    continue;
                }

                CombatUnit ally = playerUnits[j];
                if (!ally.IsAlive || ally.SourceHero == null || ally.SourceHero.Definition == null)
                {
                    continue;
                }

                int slotDelta = ally.Slot - unit.Slot;
                if (slotDelta < 0)
                {
                    slotDelta = -slotDelta;
                }

                if (slotDelta != 1)
                {
                    continue;
                }

                if (ally.SourceHero.Definition.Role != HeroRole.Damage)
                {
                    continue;
                }

                ally.Attack += 1;
                if (logger != null)
                {
                    logger.LogMessage(unit.DisplayName + " enchants " + ally.DisplayName + " (+1 attack).");
                }
            }
        }

        // Debt Wraith: scale attack with current debt.
        if (run != null)
        {
            int wraithAttack = 1 + (run.Debt / GameRules.DebtWraithDebtDivisor);
            for (int i = 0; i < enemyUnits.Count; i++)
            {
                CombatUnit unit = enemyUnits[i];
                if (unit.SourceEnemy == null)
                {
                    continue;
                }

                if (unit.SourceEnemy.EffectId == EnemyEffectId.DebtWraithScales)
                {
                    unit.Attack = wraithAttack;
                    if (logger != null)
                    {
                        logger.LogMessage(unit.DisplayName + " scales to " + wraithAttack + " attack (debt " + run.Debt + ").");
                    }
                }
            }
        }
    }

    public static CombatUnit OverrideTarget(CombatUnit attacker, List<CombatUnit> defenders, int combatRound)
    {
        if (attacker == null || defenders == null)
        {
            return null;
        }

        // Backline Bat: on combat round 2, hit lowest-HP backline player hero (ties: leftmost slot).
        if (!attacker.IsPlayerSide
            && combatRound == 2
            && attacker.SourceEnemy != null
            && attacker.SourceEnemy.EffectId == EnemyEffectId.BackBatBackline)
        {
            CombatUnit best = FindLowestHpInSlotRange(
                defenders,
                GameRules.FrontlineSlots,
                GameRules.MaxPartySize - 1);

            if (best != null)
            {
                return best;
            }
        }

        // Ninja: lowest-HP living enemy (ties: leftmost slot).
        if (attacker.IsPlayerSide
            && attacker.SourceHero != null
            && attacker.SourceHero.Definition != null
            && attacker.SourceHero.Definition.EffectId == HeroEffectId.NinjaLowestTarget)
        {
            CombatUnit best = FindLowestHpInSlotRange(defenders, 0, int.MaxValue);
            if (best != null)
            {
                return best;
            }
        }

        return null;
    }

    public static CombatUnit TryRedirectToKnight(
        CombatUnit defender,
        List<CombatUnit> playerUnits,
        ref bool knightRedirectAvailable,
        CombatLogger logger)
    {
        if (!knightRedirectAvailable || defender == null || playerUnits == null)
        {
            return defender;
        }

        if (!defender.IsPlayerSide)
        {
            return defender;
        }

        if (defender.Slot < GameRules.FrontlineSlots)
        {
            return defender;
        }

        CombatUnit knight = FindLivingKnight(playerUnits);
        if (knight == null || knight == defender)
        {
            return defender;
        }

        knightRedirectAvailable = false;
        if (logger != null)
        {
            logger.LogMessage(knight.DisplayName + " redirects the hit from " + defender.DisplayName + ".");
        }

        return knight;
    }

    public static int GetDamageReduction(CombatUnit defender)
    {
        if (defender == null || defender.SourceHero == null || defender.SourceHero.Definition == null)
        {
            return 0;
        }

        if (defender.SourceHero.Definition.EffectId == HeroEffectId.GolemArmor)
        {
            return 1;
        }

        return 0;
    }

    public static void OnAttack(CombatUnit attacker, CombatUnit defender, CombatLogger logger)
    {
    }

    public static void OnKill(CombatUnit attacker, CombatUnit defeatedUnit, RunState run, CombatLogger logger)
    {
        if (attacker == null || !attacker.IsPlayerSide)
        {
            return;
        }

        if (attacker.SourceHero == null || attacker.SourceHero.Definition == null)
        {
            return;
        }

        if (attacker.SourceHero.Definition.EffectId == HeroEffectId.NinjaLowestTarget && run != null)
        {
            run.Gold += 1;
            if (logger != null)
            {
                logger.LogMessage(attacker.DisplayName + " loots +1 gold.");
            }
        }
    }

    public static void OnEndOfCombatRound(
        int combatRound,
        RunState run,
        EncounterDefinition encounter,
        List<CombatUnit> playerUnits,
        List<CombatUnit> enemyUnits,
        CombatResult result,
        CombatLogger logger)
    {
        // Priest heal.
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit priest = playerUnits[i];
            if (!priest.IsAlive || priest.SourceHero == null || priest.SourceHero.Definition == null)
            {
                continue;
            }

            if (priest.SourceHero.Definition.EffectId != HeroEffectId.PriestHeal)
            {
                continue;
            }

            HealLeftmostFrontlineAlly(priest, playerUnits, logger);
        }

        // Frugal Healer reuses the Priest-style frontline heal for its ghost team.
        for (int i = 0; i < enemyUnits.Count; i++)
        {
            CombatUnit healer = enemyUnits[i];
            if (!healer.IsAlive || healer.SourceEnemy == null)
            {
                continue;
            }

            if (healer.SourceEnemy.EffectId != EnemyEffectId.FrugalGhostHeal)
            {
                continue;
            }

            HealLeftmostFrontlineAlly(healer, enemyUnits, logger);
        }

        // Goblin Thief: flag if any are alive at end of the steal round.
        if (combatRound == GameRules.GoblinThiefStealRound && result != null)
        {
            for (int i = 0; i < enemyUnits.Count; i++)
            {
                CombatUnit unit = enemyUnits[i];
                if (!unit.IsAlive || unit.SourceEnemy == null)
                {
                    continue;
                }

                if (unit.SourceEnemy.EffectId == EnemyEffectId.GoblinStealGold)
                {
                    result.SurvivorFlags["goblinStoleGold"] = true;
                    if (logger != null)
                    {
                        logger.LogMessage(unit.DisplayName + " escapes with the gold.");
                    }
                    break;
                }
            }
        }

        // Dungeon Auditor periodic damage.
        if (encounter != null
            && encounter.EncounterEffectId == EncounterEffectId.FinalBossDamage
            && combatRound % GameRules.AuditorDamageEvery == 0)
        {
            for (int i = 0; i < playerUnits.Count; i++)
            {
                CombatUnit hero = playerUnits[i];
                if (!hero.IsAlive)
                {
                    continue;
                }

                int damage = GameRules.AuditorDamage;
                hero.CurrentHealth -= damage;
                if (hero.CurrentHealth < 0)
                {
                    hero.CurrentHealth = 0;
                }

                if (logger != null)
                {
                    logger.LogMessage("Dungeon Auditor audits " + hero.DisplayName + " for " + damage + ".");
                    if (!hero.IsAlive)
                    {
                        logger.LogDeath(hero);
                    }
                }
            }
        }
    }

    public static void OnCombatEnd(
        CombatResult result,
        RunState run,
        List<CombatUnit> playerUnits,
        List<CombatUnit> enemyUnits,
        CombatLogger logger)
    {
        // Bard: +2 gold per Bard in party on a win.
        if (result != null && result.PlayerWon && run != null)
        {
            for (int i = 0; i < run.Party.Count; i++)
            {
                HeroInstance hero = run.Party[i];
                if (hero == null || hero.Definition == null)
                {
                    continue;
                }

                if (hero.Definition.EffectId == HeroEffectId.BardGoldOnWin)
                {
                    run.Gold += 2;
                    if (logger != null)
                    {
                        logger.LogMessage(hero.Definition.DisplayName + " sings for +2 gold.");
                    }
                }
            }
        }

        // Treasure Leech: flag if any alive at combat end.
        if (result != null && enemyUnits != null)
        {
            for (int i = 0; i < enemyUnits.Count; i++)
            {
                CombatUnit unit = enemyUnits[i];
                if (!unit.IsAlive || unit.SourceEnemy == null)
                {
                    continue;
                }

                if (unit.SourceEnemy.EffectId == EnemyEffectId.TreasureLeechRewardDrain)
                {
                    result.SurvivorFlags["treasureLeechSurvived"] = true;
                    break;
                }
            }
        }
    }

    public static void ApplyPreUpkeep(RunState run)
    {
        if (run == null)
        {
            return;
        }

        // Apprentice first: each Apprentice reduces a Wizard ally's upkeep by 1 (min 0).
        for (int i = 0; i < run.Party.Count; i++)
        {
            HeroInstance apprentice = run.Party[i];
            if (apprentice == null || apprentice.Definition == null)
            {
                continue;
            }

            if (apprentice.Definition.EffectId != HeroEffectId.ApprenticeWizardSupport)
            {
                continue;
            }

            HeroInstance wizard = FindFirstByEffect(run.Party, HeroEffectId.WizardScaling);
            if (wizard == null)
            {
                continue;
            }

            int reduced = wizard.UpkeepThisRound - 1;
            if (reduced < 0)
            {
                reduced = 0;
            }
            wizard.UpkeepThisRound = reduced;
        }

        // Treasurer: each Treasurer reduces the highest-upkeep ally (excluding self) by 2 (min 0).
        for (int i = 0; i < run.Party.Count; i++)
        {
            HeroInstance treasurer = run.Party[i];
            if (treasurer == null || treasurer.Definition == null)
            {
                continue;
            }

            if (treasurer.Definition.EffectId != HeroEffectId.TreasurerUpkeepReduce)
            {
                continue;
            }

            HeroInstance target = null;
            for (int j = 0; j < run.Party.Count; j++)
            {
                HeroInstance candidate = run.Party[j];
                if (candidate == null || candidate == treasurer)
                {
                    continue;
                }

                if (target == null || candidate.UpkeepThisRound > target.UpkeepThisRound)
                {
                    target = candidate;
                }
            }

            if (target == null)
            {
                continue;
            }

            int reduced = target.UpkeepThisRound - 2;
            if (reduced < 0)
            {
                reduced = 0;
            }
            target.UpkeepThisRound = reduced;
        }
    }

    private static CombatUnit FindLowestHpInSlotRange(List<CombatUnit> units, int minSlot, int maxSlot)
    {
        CombatUnit best = null;
        for (int i = 0; i < units.Count; i++)
        {
            CombatUnit unit = units[i];
            if (!unit.IsAlive || unit.Slot < minSlot || unit.Slot > maxSlot)
            {
                continue;
            }

            if (best == null
                || unit.CurrentHealth < best.CurrentHealth
                || (unit.CurrentHealth == best.CurrentHealth && unit.Slot < best.Slot))
            {
                best = unit;
            }
        }

        return best;
    }

    private static void HealLeftmostFrontlineAlly(CombatUnit healer, List<CombatUnit> allies, CombatLogger logger)
    {
        if (healer == null || !healer.IsAlive || allies == null)
        {
            return;
        }

        CombatUnit healTarget = FindLeftmostLivingInSlotRange(allies, 0, GameRules.FrontlineSlots - 1);
        if (healTarget == null)
        {
            healTarget = healer;
        }

        int healed = GameRules.FrontlineHealAmount;
        int newHealth = healTarget.CurrentHealth + healed;
        if (newHealth > healTarget.MaxHealth)
        {
            healed = healTarget.MaxHealth - healTarget.CurrentHealth;
            newHealth = healTarget.MaxHealth;
        }

        if (healed <= 0)
        {
            return;
        }

        healTarget.CurrentHealth = newHealth;
        if (logger != null)
        {
            logger.LogMessage(healer.DisplayName + " heals " + healTarget.DisplayName + " for " + healed + ".");
        }
    }

    private static CombatUnit FindLeftmostLivingInSlotRange(List<CombatUnit> units, int minSlot, int maxSlot)
    {
        CombatUnit best = null;
        for (int i = 0; i < units.Count; i++)
        {
            CombatUnit unit = units[i];
            if (!unit.IsAlive || unit.Slot < minSlot || unit.Slot > maxSlot)
            {
                continue;
            }

            if (best == null || unit.Slot < best.Slot)
            {
                best = unit;
            }
        }

        return best;
    }

    private static CombatUnit FindLivingKnight(List<CombatUnit> playerUnits)
    {
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (!unit.IsAlive || unit.SourceHero == null || unit.SourceHero.Definition == null)
            {
                continue;
            }

            if (unit.SourceHero.Definition.EffectId == HeroEffectId.KnightRedirect)
            {
                return unit;
            }
        }

        return null;
    }

    private static HeroInstance FindFirstByEffect(List<HeroInstance> party, HeroEffectId effectId)
    {
        for (int i = 0; i < party.Count; i++)
        {
            HeroInstance hero = party[i];
            if (hero == null || hero.Definition == null)
            {
                continue;
            }

            if (hero.Definition.EffectId == effectId)
            {
                return hero;
            }
        }

        return null;
    }
}
