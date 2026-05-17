public enum HeroRole
{
    Tank,
    Damage,
    Support,
    Economy
}

public enum HeroTier
{
    Bronze,
    Silver
}

public enum HeroEffectId
{
    None,
    KnightRedirect,
    GolemArmor,
    WizardScaling,
    NinjaLowestTarget,
    RangerBackline,
    PriestHeal,
    BardGoldOnWin,
    EnchanterAdjacent,
    TreasurerUpkeepReduce,
    ApprenticeWizardSupport
}

public enum EnemyEffectId
{
    None,
    GoblinStealGold,
    BackBatBackline,
    DebtWraithScales,
    TreasureLeechRewardDrain,
    DungeonAuditorBoss,
    FrugalGhostHeal
}

public enum EncounterType
{
    Dungeon,
    RivalGhost,
    FinalBoss
}

public enum EncounterEffectId
{
    None,
    TaxCollectorUpkeep,
    FinalBossDamage
}

public enum RivalGuild
{
    None,
    Greedy,
    Frugal,
    Carry
}

public enum PayrollActionId
{
    StandardPay,
    TakeLoan,
    PromiseVictoryBonus,
    CutWages
}

public enum DifficultyPresetId
{
    ApprenticeLedger,
    StandardContract,
    PredatoryInterest
}

public enum RelicId
{
    BladeCharter,
    IronOath,
    CampRations,
    GuildDividend,
    ShieldClause,
    RedInkBrand,
    CausticWrit,
    ToxicCollateral
}

public enum CombatStatusId
{
    None,
    Guarded,
    Burned,
    Poisoned,
    Marked,
    Weakened,
    Inspired
}
