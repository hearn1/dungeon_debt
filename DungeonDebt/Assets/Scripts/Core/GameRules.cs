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

    public const int StartingGold = 10;
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

    public const int WinReward = 8;
    public const int LossReward = 4;
    public const int RivalWinBonus = 2;

    public const int DungeonLossMorale = 6;
    public const int RivalLossMorale = 8;
    public const int InterestDebtDivisor = 3;
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
    public const int FinalRound = 10;

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
}
