// Ported from DungeonDebt/Assets/Scripts/Data/GameEnums.cs
// Enums are frozen string-keyed maps: the value equals the key so logs and
// debugging read naturally, and === comparisons stay cheap.

function makeEnum(...names) {
  const out = {};
  for (const name of names) {
    out[name] = name;
  }
  return Object.freeze(out);
}

export const HeroRole = makeEnum("Tank", "Damage", "Support", "Economy");

export const HeroTier = makeEnum("Bronze", "Silver");

export const HeroEffectId = makeEnum(
  "None",
  "KnightRedirect",
  "GolemArmor",
  "WizardScaling",
  "NinjaLowestTarget",
  "RangerBackline",
  "PriestHeal",
  "BardGoldOnWin",
  "EnchanterAdjacent",
  "TreasurerUpkeepReduce",
  "ApprenticeWizardSupport",
);

export const EnemyEffectId = makeEnum(
  "None",
  "GoblinStealGold",
  "BackBatBackline",
  "DebtWraithScales",
  "TreasureLeechRewardDrain",
  "DungeonAuditorBoss",
  "FrugalGhostHeal",
);

export const EncounterType = makeEnum("Dungeon", "RivalGhost", "FinalBoss");

export const EncounterEffectId = makeEnum("None", "TaxCollectorUpkeep", "FinalBossDamage");

export const RivalGuild = makeEnum("None", "Greedy", "Frugal", "Carry");

export const PayrollActionId = makeEnum("StandardPay", "TakeLoan", "PromiseVictoryBonus", "CutWages");

export const DifficultyPresetId = makeEnum("ApprenticeLedger", "StandardContract", "PredatoryInterest");

export const RelicId = makeEnum(
  "BladeCharter",
  "IronOath",
  "CampRations",
  "GuildDividend",
  "ShieldClause",
  "RedInkBrand",
  "CausticWrit",
  "ToxicCollateral",
);

export const CombatStatusId = makeEnum(
  "None",
  "Guarded",
  "Burned",
  "Poisoned",
  "Marked",
  "Weakened",
  "Inspired",
);
