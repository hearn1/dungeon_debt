using UnityEngine;

public static class GameRules
{
    // Color is a struct and cannot be const in C#. Use static readonly.
    public static readonly Color TankRoleColor = new Color(0.31f, 0.45f, 0.62f, 1f);
    public static readonly Color DamageRoleColor = new Color(0.72f, 0.20f, 0.24f, 1f);
    public static readonly Color SupportRoleColor = new Color(0.30f, 0.60f, 0.36f, 1f);
    public static readonly Color EconomyRoleColor = new Color(0.78f, 0.62f, 0.20f, 1f);
    public static readonly Color BronzeBadgeColor = new Color(0.72f, 0.45f, 0.20f, 1f);
    public static readonly Color SilverBadgeColor = new Color(0.82f, 0.84f, 0.88f, 1f);
    public static readonly Color ReservedTierSlotOutlineColor = new Color(0.45f, 0.45f, 0.5f, 0.6f);

    public static Color GetRoleColor(HeroRole role)
    {
        switch (role)
        {
            case HeroRole.Tank:
                return TankRoleColor;
            case HeroRole.Damage:
                return DamageRoleColor;
            case HeroRole.Support:
                return SupportRoleColor;
            case HeroRole.Economy:
                return EconomyRoleColor;
            default:
                return new Color(0.5f, 0.5f, 0.5f, 1f);
        }
    }

    public const int StartingGold = 15;
    public const int StartingDebt = 0;
    public const int StartingMorale = 30;
    public const int DebtLimit = 20;

    public const int MaxPartySize = 5;
    public const int FrontlineSlots = 2;
    public const int BacklineSlots = 3;

    public const int ShopOfferCount = 3;
    public const int RerollCost = 2;
    public const int HireCostBonus = 2;
    public const int FireRefund = 1;
    public const int DebtPaymentCap = 3;

    public const int WinReward = 8;
    public const int LossReward = 4;
    public const int RivalWinBonus = 2;
    public const int RelicChoiceCount = 3;
    public const int BladeCharterAttackBonus = 1;
    public const int IronOathHealthBonus = 1;
    public const int CampRationsHealthBonus = 1;
    public const int GuildDividendRewardGold = 1;
    public const int VeteranTier1XpThreshold = 2;
    public const int VeteranTier2XpThreshold = 5;
    public const int VeteranTier3XpThreshold = 9;
    public const int VeteranContinuingInitialGap = 5;
    public const int VeteranContinuingGapGrowth = 1;
    public const int VeteranAttackBonusPerTier = 1;
    public const int VeteranHealthBonusPerTier = 1;
    public const int VeteranSurvivorXp = 1;
    public const int VeteranRivalFightBonusXp = 1;
    public const int VeteranEndOfActFightBonusXp = 1;
    public const int VeteranActCompleteXp = 1;

    public const int DungeonLossMorale = 6;
    public const int RivalLossMorale = 8;
    public const int InterestDebtDivisor = 3;
    public const int StrainedDebtThreshold = 6;
    public const int DangerousDebtThreshold = 12;
    public const int CriticalDebtThreshold = 20;
    public const int RivalIncomePerRound = 8;
    public const int GreedyRivalStartingPayroll = 10;
    public const int FrugalRivalStartingPayroll = 6;
    public const int CarryRivalStartingPayroll = 8;
    public const int GreedyRivalPayrollGrowth = 2;
    public const int FrugalRivalPayrollGrowth = 1;
    public const int CarryRivalOddRoundPayrollGrowth = 1;
    public const int CarryRivalEvenRoundPayrollGrowth = 2;
    public const int GreedyRivalDebtCreep = 1;
    public const int RivalMoraleDebtThreshold = 15;
    public const int RivalMoraleDebtPenalty = 2;

    public const int CombatTurnLimit = 10;
    public const int MinimumPositiveCombatStat = 1;

    // M15.1 difficulty presets. Standard Contract reuses the base economy
    // constants above (StartingGold/StartingDebt/StartingMorale/
    // InterestDebtDivisor/DebtLimit) so it reproduces today's exact run.
    // Apprentice/Predatory override only the values that differ. The four
    // combat multipliers are carried onto RunState this slice but not yet
    // applied in combat (M15.2). Hard constraint: no preset reduces HP below
    // today's values, so all *HealthMult >= 1.0.
    public const DifficultyPresetId DefaultDifficultyPreset = DifficultyPresetId.StandardContract;
    public const float NoCombatMultiplier = 1f;

    public const int ApprenticeStartingGold = 20;
    public const int ApprenticeStartingMorale = 36;
    public const int ApprenticeInterestDivisor = 4;
    public const int ApprenticeDebtLimit = 24;
    public const float ApprenticeHeroHealthMult = 1.25f;
    public const float ApprenticeEnemyDamageMult = 0.85f;

    public const int PredatoryStartingGold = 12;
    public const int PredatoryInterestDivisor = 2;
    public const int PredatoryDebtLimit = 18;
    public const float PredatoryEnemyHealthMult = 1.20f;
    public const float PredatoryEnemyDamageMult = 1.20f;

    // Act structure. RunState.Round stays an absolute counter: Act 1 is
    // rounds 1-10, Act 2 is rounds 11-13. FinalRound is the Act 1 boundary
    // (kept for existing references); Act2FinalRound is the Act 2 boundary.
    public const int FinalRound = 10;
    public const int Act1FinalRound = 10;
    public const int Act2FinalRound = 13;
    public const int Act1Rounds = 10;
    public const int Act2Rounds = 3;
    public const int FinalAct = 2;

    public const int LoanGoldGain = 5;
    public const int LoanDebtCost = 6;
    public const int VictoryBonusGoldCost = 3;
    public const int VictoryBonusDebtOnLoss = 5;
    public const int VictoryBonusAttackBuff = 1;
    public const int CutWagesUpkeepReduction = 3;
    public const int CutWagesAttackPenalty = 1;

    public const int TaxCollectorUpkeep = 2;
    public const int AuditorUpkeep = 3;
    public const int AuditorDamageEvery = 3;
    public const int AuditorDamage = 1;
    public const int DebtWraithDebtDivisor = 3;
    public const int GoblinThiefStealRound = 3;
    public const int GoblinThiefStealGold = 3;
    public const int TreasureLeechStealGold = 4;
    public const int FrontlineHealAmount = 2;

    // M9.2 Silver tier placeholders. Final numbers and probability curve are M11's job.
    public const int SilverHireCostBonus = 3;
    public const float SilverOfferChance = 0.12f;
    public const int SilverStatAttackBonus = 2;
    public const int SilverStatHealthBonus = 4;
    public const int SilverUpkeepReduction = 2;

    // Per-hero Silver bonus tunables (shape locked in §15; numbers M11).
    public const int BronzeKnightRedirectCount = 1;
    public const int SilverKnightRedirectCount = 2;
    public const int SilverPriestHealAmount = 3;
    public const int BronzeBardWinGold = 2;
    public const int SilverBardWinGold = 4;
    public const int BronzeApprenticeWizardReduction = 1;
    public const int SilverApprenticeWizardReduction = 2;
    public const int BronzeTreasurerTargets = 1;
    public const int SilverTreasurerTargets = 2;
    public const int TreasurerUpkeepReduction = 2;

    public static int CalculateDebtPaymentAmount(int gold, int debt)
    {
        if (gold <= 0 || debt <= 0)
        {
            return 0;
        }

        int payment = gold;
        if (payment > debt)
        {
            payment = debt;
        }

        if (payment > DebtPaymentCap)
        {
            payment = DebtPaymentCap;
        }

        return payment;
    }

    public static string GetDebtStatusLabel(int debt)
    {
        if (debt >= CriticalDebtThreshold)
        {
            return "Critical";
        }

        if (debt >= DangerousDebtThreshold)
        {
            return "Dangerous";
        }

        if (debt >= StrainedDebtThreshold)
        {
            return "Strained";
        }

        return "Stable";
    }

    public static bool IsHighDebtPressure(int debt)
    {
        return debt >= DangerousDebtThreshold;
    }

    public static int ScaleCombatStat(int baseValue, float multiplier)
    {
        if (baseValue <= 0)
        {
            return 0;
        }

        if (multiplier <= 0f)
        {
            return baseValue;
        }

        int scaledValue = Mathf.CeilToInt(baseValue * multiplier);
        if (scaledValue < MinimumPositiveCombatStat)
        {
            return MinimumPositiveCombatStat;
        }

        return scaledValue;
    }

    public static int GetVeteranTierForXp(int xp)
    {
        if (xp < VeteranTier1XpThreshold)
        {
            return 0;
        }

        int tier = 0;
        int nextThreshold = VeteranTier1XpThreshold;

        while (xp >= nextThreshold)
        {
            tier += 1;
            nextThreshold = GetVeteranThresholdForTier(tier + 1);
        }

        return tier;
    }

    public static int GetVeteranThresholdForTier(int veteranTier)
    {
        if (veteranTier <= 0)
        {
            return 0;
        }

        if (veteranTier == 1)
        {
            return VeteranTier1XpThreshold;
        }

        if (veteranTier == 2)
        {
            return VeteranTier2XpThreshold;
        }

        if (veteranTier == 3)
        {
            return VeteranTier3XpThreshold;
        }

        int threshold = VeteranTier3XpThreshold;
        int gap = VeteranContinuingInitialGap;
        for (int tier = 4; tier <= veteranTier; tier++)
        {
            threshold += gap;
            gap += VeteranContinuingGapGrowth;
        }

        return threshold;
    }

    public static int GetNextVeteranThresholdForXp(int xp)
    {
        int veteranTier = GetVeteranTierForXp(xp);
        return GetVeteranThresholdForTier(veteranTier + 1);
    }

    public static float GetVeteranProgressRatio(int xp)
    {
        int nextThreshold = GetNextVeteranThresholdForXp(xp);
        if (nextThreshold <= 0)
        {
            return 0f;
        }

        float ratio = (float)xp / nextThreshold;
        if (ratio < 0f)
        {
            return 0f;
        }

        if (ratio > 1f)
        {
            return 1f;
        }

        return ratio;
    }

    public static string GetVeteranProgressLabel(int xp)
    {
        int veteranTier = GetVeteranTierForXp(xp);
        int nextThreshold = GetNextVeteranThresholdForXp(xp);
        if (veteranTier <= 0)
        {
            return "XP " + xp + "/" + nextThreshold;
        }

        return "V" + veteranTier + " XP " + xp + "/" + nextThreshold;
    }

    public static int GetRoundsInAct(int act)
    {
        return act >= FinalAct ? Act2Rounds : Act1Rounds;
    }

    public static int GetRoundWithinAct(int act, int absoluteRound)
    {
        if (act >= FinalAct)
        {
            return absoluteRound - Act1FinalRound;
        }

        return absoluteRound;
    }

    public static string GetActLabel(int act)
    {
        return "Act " + (act >= FinalAct ? FinalAct : 1);
    }

    public static int GetActFinalRound(int act)
    {
        return act >= FinalAct ? Act2FinalRound : Act1FinalRound;
    }
}
