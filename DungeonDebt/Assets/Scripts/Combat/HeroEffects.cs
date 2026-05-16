using System.Collections.Generic;

public static class HeroEffects
{
    // Seed per-round mutable stats from a hero's definition + tier. Called when a hero
    // is hired/merged and at the start of each new round (after combat) so Silver
    // bonuses reapply each round before payroll actions run.
    //
    // In the current roster, Warrior/Squire use EffectId.None and Ranger uses
    // RangerBackline. M11 can replace these explicit checks with bonus metadata.
    public static void ApplyTierStatSeed(HeroInstance hero)
    {
        if (hero == null || hero.Definition == null)
        {
            return;
        }

        hero.VeteranTier = GameRules.GetVeteranTierForXp(hero.VeteranXp);
        hero.Attack = GetTierAdjustedAttack(hero.Definition, hero.Tier) + GetVeteranAttackBonus(hero);
        hero.UpkeepThisRound = GetTierAdjustedUpkeep(hero.Definition, hero.Tier);
    }

    // Tier-aware max HP for a HeroInstance, used by CombatManager when building
    // CombatUnits. Stat-bonus Silver heroes (EffectId.None) get +SilverStatHealthBonus.
    public static int GetTierAdjustedMaxHealth(HeroInstance hero)
    {
        if (hero == null || hero.Definition == null)
        {
            return 0;
        }

        return GetTierAdjustedMaxHealth(hero.Definition, hero.Tier) + GetVeteranHealthBonus(hero);
    }

    public static int GetTierAdjustedAttack(HeroDefinition hero, HeroTier tier)
    {
        if (hero == null)
        {
            return 0;
        }

        int attack = hero.BaseAttack;
        if (tier == HeroTier.Silver && HasSilverAttackBonus(hero))
        {
            attack += GameRules.SilverStatAttackBonus;
        }
        return attack;
    }

    public static int GetTierAdjustedMaxHealth(HeroDefinition hero, HeroTier tier)
    {
        if (hero == null)
        {
            return 0;
        }

        int max = hero.BaseHealth;
        if (tier == HeroTier.Silver && HasSilverHealthBonus(hero))
        {
            max += GameRules.SilverStatHealthBonus;
        }
        return max;
    }

    public static int GetTierAdjustedUpkeep(HeroDefinition hero, HeroTier tier)
    {
        if (hero == null)
        {
            return 0;
        }

        int upkeep = hero.BaseUpkeep;
        if (tier == HeroTier.Silver
            && (hero.EffectId == HeroEffectId.GolemArmor
                || hero.EffectId == HeroEffectId.WizardScaling
                || hero.EffectId == HeroEffectId.NinjaLowestTarget))
        {
            upkeep -= GameRules.SilverUpkeepReduction;
            if (upkeep < 0)
            {
                upkeep = 0;
            }
        }
        return upkeep;
    }

    private static bool HasSilverAttackBonus(HeroDefinition hero)
    {
        if (hero == null)
        {
            return false;
        }

        return hero.EffectId == HeroEffectId.None
            || hero.EffectId == HeroEffectId.RangerBackline;
    }

    private static int GetVeteranAttackBonus(HeroInstance hero)
    {
        if (hero == null)
        {
            return 0;
        }

        return hero.VeteranTier * GameRules.VeteranAttackBonusPerTier;
    }

    private static int GetVeteranHealthBonus(HeroInstance hero)
    {
        if (hero == null)
        {
            return 0;
        }

        return hero.VeteranTier * GameRules.VeteranHealthBonusPerTier;
    }

    private static bool HasSilverHealthBonus(HeroDefinition hero)
    {
        if (hero == null)
        {
            return false;
        }

        return hero.EffectId == HeroEffectId.None;
    }

    public static void OnCombatStart(
        RunState run,
        EncounterDefinition encounter,
        List<CombatUnit> playerUnits,
        List<CombatUnit> enemyUnits,
        CombatLogger logger,
        out int knightRedirectsRemaining)
    {
        knightRedirectsRemaining = 0;

        // Knight: arm the redirect counter. Silver Knights redirect twice.
        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (!unit.IsAlive || unit.SourceHero == null || unit.SourceHero.Definition == null)
            {
                continue;
            }

            if (unit.SourceHero.Definition.EffectId == HeroEffectId.KnightRedirect)
            {
                knightRedirectsRemaining = unit.SourceHero.Tier == HeroTier.Silver
                    ? GameRules.SilverKnightRedirectCount
                    : GameRules.BronzeKnightRedirectCount;
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

        // Enchanter: +1 attack to adjacent Damage allies. Silver Enchanters buff all
        // Damage-role player units regardless of slot adjacency.
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

            bool silver = unit.SourceHero.Tier == HeroTier.Silver;

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

                if (ally.SourceHero.Definition.Role != HeroRole.Damage)
                {
                    continue;
                }

                if (!silver)
                {
                    int slotDelta = ally.Slot - unit.Slot;
                    if (slotDelta < 0)
                    {
                        slotDelta = -slotDelta;
                    }
                    if (slotDelta != 1)
                    {
                        continue;
                    }
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
            int wraithBaseAttack = 1 + (run.Debt / GameRules.DebtWraithDebtDivisor);
            int wraithAttack = GameRules.ScaleCombatStat(wraithBaseAttack, run.EnemyDamageMultiplier);
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
        ref int knightRedirectsRemaining,
        CombatLogger logger)
    {
        if (knightRedirectsRemaining <= 0 || defender == null || playerUnits == null)
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

        knightRedirectsRemaining -= 1;
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
        // Priest heal. Silver Priests heal more per round.
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

            int amount = priest.SourceHero.Tier == HeroTier.Silver
                ? GameRules.SilverPriestHealAmount
                : GameRules.FrontlineHealAmount;
            HealLeftmostFrontlineAlly(priest, playerUnits, amount, logger);
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

            HealLeftmostFrontlineAlly(healer, enemyUnits, GameRules.FrontlineHealAmount, logger);
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
        // Bard: gold per Bard in party on a win. Silver Bards earn more.
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
                    int gain = hero.Tier == HeroTier.Silver
                        ? GameRules.SilverBardWinGold
                        : GameRules.BronzeBardWinGold;
                    run.Gold += gain;
                    if (logger != null)
                    {
                        logger.LogMessage(hero.Definition.DisplayName + " sings for +" + gain + " gold.");
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

        // Apprentice first: each Apprentice reduces a Wizard ally's upkeep. Silver
        // Apprentices reduce by 2 instead of 1 (min 0).
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

            int reduction = apprentice.Tier == HeroTier.Silver
                ? GameRules.SilverApprenticeWizardReduction
                : GameRules.BronzeApprenticeWizardReduction;
            int reduced = wizard.UpkeepThisRound - reduction;
            if (reduced < 0)
            {
                reduced = 0;
            }
            wizard.UpkeepThisRound = reduced;
        }

        // Treasurer: reduce the highest-upkeep ally(ies) by GameRules.TreasurerUpkeepReduction
        // (min 0). Silver Treasurers reduce the top two distinct allies instead of one.
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

            int targetCount = treasurer.Tier == HeroTier.Silver
                ? GameRules.SilverTreasurerTargets
                : GameRules.BronzeTreasurerTargets;
            List<HeroInstance> targeted = new List<HeroInstance>();

            for (int t = 0; t < targetCount; t++)
            {
                HeroInstance target = FindHighestUpkeepExcluding(run.Party, treasurer, targeted);
                if (target == null)
                {
                    break;
                }

                targeted.Add(target);
                int reduced = target.UpkeepThisRound - GameRules.TreasurerUpkeepReduction;
                if (reduced < 0)
                {
                    reduced = 0;
                }
                target.UpkeepThisRound = reduced;
            }
        }
    }

    private static HeroInstance FindHighestUpkeepExcluding(
        List<HeroInstance> party,
        HeroInstance exclude,
        List<HeroInstance> alreadyTargeted)
    {
        HeroInstance best = null;
        for (int j = 0; j < party.Count; j++)
        {
            HeroInstance candidate = party[j];
            if (candidate == null || candidate == exclude)
            {
                continue;
            }

            if (ContainsHero(alreadyTargeted, candidate))
            {
                continue;
            }

            if (candidate.UpkeepThisRound <= 0)
            {
                continue;
            }

            if (best == null || candidate.UpkeepThisRound > best.UpkeepThisRound)
            {
                best = candidate;
            }
        }
        return best;
    }

    private static bool ContainsHero(List<HeroInstance> heroes, HeroInstance hero)
    {
        if (heroes == null || hero == null)
        {
            return false;
        }

        for (int i = 0; i < heroes.Count; i++)
        {
            if (heroes[i] == hero)
            {
                return true;
            }
        }
        return false;
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

    private static void HealLeftmostFrontlineAlly(CombatUnit healer, List<CombatUnit> allies, int healAmount, CombatLogger logger)
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

        int healed = healAmount;
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
            logger.LogHeal(healer, healTarget, healed);
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
