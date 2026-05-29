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

export const HeroTier = makeEnum("Bronze", "Silver", "Gold", "Diamond");

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
  "PaladinAuraHeal",
  "ClericGroupHeal",
  "BarbarianRage",
  "RogueFirstStrike",
  "WarlockDebtPact",
  "ArtificerRelicCharge",
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

export const DifficultyLevel = Object.freeze({
  Level0: 0,
  Level1: 1,
  Level2: 2,
  Level3: 3,
  Level4: 4,
  Level5: 5,
  Level6: 6,
  Level7: 7,
  Level8: 8,
  Level9: 9,
  Level10: 10,
});

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

export const ShopEventId = makeEnum("None", "BargainStall");

export const CombatStatusId = makeEnum(
  "None",
  "Guarded",
  "Burned",
  "Poisoned",
  "Marked",
  "Weakened",
  "Inspired",
);
