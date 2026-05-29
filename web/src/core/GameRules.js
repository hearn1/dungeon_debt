// Ported from DungeonDebt/Assets/Scripts/Core/GameRules.cs
// All numeric gameplay constants live here, exactly as in the Unity build.
// Unity Color(r,g,b,a) floats are converted to CSS rgba() strings so the UI
// phase can drop them straight into styles.

import { HeroRole, CombatStatusId, RivalGuild, EncounterType, DifficultyLevel } from "../data/enums.js";

function rgba(r, g, b, a = 1) {
  const to255 = (v) => Math.round(v * 255);
  return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${a})`;
}

const RivalRaceCurves = Object.freeze({
  [RivalGuild.Greedy]: Object.freeze({
    getAdvance(round, rival) {
      if (round <= 6) return 1.4;
      return rival && rival.debt > 12 ? 0.8 : 1.2;
    },
  }),
  [RivalGuild.Frugal]: Object.freeze({
    getAdvance() {
      return 1.1;
    },
  }),
  [RivalGuild.Carry]: Object.freeze({
    getAdvance(round) {
      if (round <= 5) return 0.7;
      if (round <= 10) return 1.1;
      return 1.5;
    },
  }),
});

export const GameRules = Object.freeze({
  // ---- Role / tier / status colors ----
  TankRoleColor: rgba(0.31, 0.45, 0.62),
  DamageRoleColor: rgba(0.72, 0.2, 0.24),
  SupportRoleColor: rgba(0.3, 0.6, 0.36),
  EconomyRoleColor: rgba(0.78, 0.62, 0.2),
  BronzeBadgeColor: rgba(0.72, 0.45, 0.2),
  SilverBadgeColor: rgba(0.82, 0.84, 0.88),
  GoldBadgeColor: rgba(0.831, 0.686, 0.216),
  DiamondBadgeColor: rgba(0.725, 0.949, 1),
  ReservedTierSlotOutlineColor: rgba(0.45, 0.45, 0.5, 0.6),
  GuardedStatusColor: rgba(0.24, 0.52, 0.88),
  BurnedStatusColor: rgba(0.92, 0.42, 0.12),
  PoisonedStatusColor: rgba(0.22, 0.64, 0.24),
  MarkedStatusColor: rgba(0.82, 0.18, 0.18),
  WeakenedStatusColor: rgba(0.48, 0.5, 0.54),
  InspiredStatusColor: rgba(0.92, 0.72, 0.18),

  // ---- #71 V1 visual identity ("Faded Ledger") ----
  DdParchment: rgba(227 / 255, 220 / 255, 198 / 255),
  DdCandle: rgba(184 / 255, 146 / 255, 74 / 255),
  DdInk: rgba(26 / 255, 22 / 255, 18 / 255),
  DdRustAccent: rgba(166 / 255, 74 / 255, 64 / 255),

  // ---- M20.3 shared visual system ("Guild Ledger") ----
  UiInk: rgba(0.925, 0.886, 0.788),
  UiInkDim: rgba(0.714, 0.69, 0.62),
  UiInkMute: rgba(0.478, 0.471, 0.408),
  UiInkInvert: rgba(0.078, 0.067, 0.039),
  UiBgStrip: rgba(0.067, 0.078, 0.102),
  UiBgPanel: rgba(0.086, 0.102, 0.125),
  UiBgCard: rgba(0.122, 0.141, 0.173),
  UiRule: rgba(0.173, 0.2, 0.247),
  UiRuleStrong: rgba(0.29, 0.325, 0.392),
  UiRuleFaint: rgba(0.125, 0.149, 0.184),
  UiGold: rgba(0.788, 0.627, 0.29),

  // ---- Debt severity ramp ----
  DebtStableColor: rgba(0.42, 0.608, 0.42),
  DebtStrainedColor: rgba(0.788, 0.627, 0.29),
  DebtDangerousColor: rgba(0.8, 0.478, 0.227),
  DebtCriticalColor: rgba(0.769, 0.29, 0.243),
  DebtStableBgColor: rgba(0.11, 0.165, 0.122),
  DebtStrainedBgColor: rgba(0.173, 0.145, 0.086),
  DebtDangerousBgColor: rgba(0.18, 0.122, 0.078),
  DebtCriticalBgColor: rgba(0.18, 0.09, 0.082),

  // ---- Rival guild accents ----
  GuildFrugalColor: rgba(0.31, 0.565, 0.537),
  GuildGreedyColor: rgba(0.788, 0.627, 0.29),
  GuildCarryColor: rgba(0.549, 0.416, 0.659),
  GuildNeutralColor: rgba(0.478, 0.502, 0.573),

  // ---- Economy / run constants ----
  StartingGold: 15,
  StartingDebt: 0,
  StartingMorale: 30,
  DebtLimit: 20,

  MaxPartySize: 5,
  FrontlineSlots: 2,
  BacklineSlots: 3,

  ShopOfferCount: 3,
  RerollCost: 2,
  HireCostBonus: 2,
  FireRefund: 1,
  DebtPaymentCap: 3,

  WinReward: 8,
  LossReward: 4,
  RivalWinBonus: 2,
  RelicChoiceCount: 3,
  BladeCharterAttackBonus: 1,
  IronOathHealthBonus: 1,
  CampRationsHealthBonus: 1,
  GuildDividendRewardGold: 1,
  ShieldClauseRelicName: "Shield Clause",
  ShieldClauseRelicDescription: "Leftmost frontline hero starts combat Guarded.",
  RedInkBrandRelicName: "Red Ink Brand",
  RedInkBrandRelicDescription: "First hero-side attack each combat applies Marked if the target survives.",
  CausticWritRelicName: "Caustic Writ",
  CausticWritRelicDescription: "Damage-role heroes apply Burned if their attack target survives.",
  ToxicCollateralRelicName: "Toxic Collateral",
  ToxicCollateralRelicDescription: "Damage-role heroes apply Poisoned if their attack target survives.",
  VeteranTier1XpThreshold: 2,
  VeteranTier2XpThreshold: 5,
  VeteranTier3XpThreshold: 9,
  VeteranContinuingInitialGap: 5,
  VeteranContinuingGapGrowth: 1,
  VeteranAttackBonusPerTier: 1,
  VeteranHealthBonusPerTier: 1,
  VeteranSurvivorXp: 1,
  VeteranRivalFightBonusXp: 1,
  VeteranEndOfActFightBonusXp: 1,
  VeteranActCompleteXp: 1,

  DungeonLossMorale: 6,
  RivalLossMorale: 8,
  InterestDebtDivisor: 3,
  StrainedDebtThreshold: 6,
  DangerousDebtThreshold: 12,
  CriticalDebtThreshold: 20,
  RivalIncomePerRound: 8,
  RivalRaceCurves,
  RivalRaceMaxProgress: 20,
  RivalFinishedFirstMorale: 5,
  RivalRaceHpLeadFactor: 0.05,
  RivalRaceAttackLeadFactor: 0.03,
  RivalRaceHpLeadCap: 0.50,
  RivalRaceAttackLeadCap: 0.30,
  RivalRaceTributePerBehind: 3,
  GreedyRivalStartingPayroll: 10,
  FrugalRivalStartingPayroll: 6,
  CarryRivalStartingPayroll: 8,
  GreedyRivalPayrollGrowth: 2,
  FrugalRivalPayrollGrowth: 1,
  CarryRivalOddRoundPayrollGrowth: 1,
  CarryRivalEvenRoundPayrollGrowth: 2,
  GreedyRivalDebtCreep: 1,
  RivalMoraleDebtThreshold: 15,
  RivalMoraleDebtPenalty: 2,

  CombatTurnLimit: 10,
  MinimumPositiveCombatStat: 1,
  GuardedDamageDivisor: 2,
  BurnedAttackPenalty: 1,
  BurnedSelfDamage: 1,
  PoisonInitialDamage: 1,
  PoisonDamageGrowth: 1,
  MarkedIncomingDamageBonus: 1,
  WeakenedAttackPenalty: 1,
  InspiredAttackBonus: 1,

  // ---- Difficulty levels ----
  DefaultDifficultyLevel: DifficultyLevel.Level0,
  DefaultDifficultyPreset: DifficultyLevel.Level0,
  MaxImplementedDifficultyLevel: DifficultyLevel.Level3,
  NoCombatMultiplier: 1,
  ActStatScale: Object.freeze({
    2: Object.freeze({ enemyHealth: 1, enemyAttack: 1 }),
    3: Object.freeze({ enemyHealth: 1.2, enemyAttack: 1.15 }),
  }),

  ApprenticeStartingGold: 20,
  ApprenticeStartingMorale: 36,
  ApprenticeInterestDivisor: 4,
  ApprenticeDebtLimit: 24,
  ApprenticeHeroHealthMult: 1.25,
  ApprenticeEnemyDamageMult: 0.85,

  PredatoryStartingGold: 12,
  PredatoryInterestDivisor: 2,
  PredatoryDebtLimit: 18,
  PredatoryEnemyHealthMult: 1.2,
  PredatoryEnemyDamageMult: 1.2,

  LoanGoldGain: 5,
  LoanDebtCost: 6,
  VictoryBonusGoldCost: 3,
  VictoryBonusDebtOnLoss: 5,
  VictoryBonusAttackBuff: 1,
  CutWagesUpkeepReduction: 3,
  CutWagesAttackPenalty: 1,

  TaxCollectorUpkeep: 2,
  AuditorUpkeep: 3,
  AuditorDamageEvery: 3,
  AuditorDamage: 1,
  DebtWraithDebtDivisor: 3,
  GoblinThiefStealRound: 3,
  GoblinThiefStealGold: 3,
  TreasureLeechStealGold: 4,
  FrontlineHealAmount: 2,

  // ---- Silver tier ----
  SilverHireCostBonus: 3,
  SilverOfferChance: 0.12,
  SilverStatAttackBonus: 2,
  SilverStatHealthBonus: 4,
  SilverUpkeepReduction: 2,
  GoldStatMultiplier: 1.8,
  GoldUpkeepIncrease: 2,
  DiamondStatMultiplier: 2.3,
  DiamondUpkeepIncrease: 3,

  BronzeKnightRedirectCount: 1,
  SilverKnightRedirectCount: 2,
  SilverPriestHealAmount: 3,
  BronzeBardWinGold: 2,
  SilverBardWinGold: 4,
  BronzeApprenticeWizardReduction: 1,
  SilverApprenticeWizardReduction: 2,
  BronzeTreasurerTargets: 1,
  SilverTreasurerTargets: 2,
  TreasurerUpkeepReduction: 2,
});

// ---- Act structure (data-driven; append a count to add an act) ----
const ActRoundCounts = [10, 10, 10];
const DefaultActCount = 2;
const ActAccentColors = [
  rgba(0.541, 0.565, 0.604),
  rgba(0.659, 0.212, 0.29),
  rgba(0.31, 0.565, 0.537),
  rgba(0.788, 0.627, 0.29),
  rgba(0.549, 0.416, 0.659),
];
const ActRomanNumerals = ["I", "II", "III", "IV", "V"];
const ActThemeWords = ["Dungeon", "Demonic", "The Mint", "Golden", "Void"];

function clampAct(act) {
  if (act < 1) return 1;
  if (act > ActRoundCounts.length) return ActRoundCounts.length;
  return act;
}

export const GameRulesFns = {
  rgba,

  getRoleColor(role) {
    switch (role) {
      case HeroRole.Tank: return GameRules.TankRoleColor;
      case HeroRole.Damage: return GameRules.DamageRoleColor;
      case HeroRole.Support: return GameRules.SupportRoleColor;
      case HeroRole.Economy: return GameRules.EconomyRoleColor;
      default: return rgba(0.5, 0.5, 0.5);
    }
  },

  calculateDebtPaymentAmount(gold, debt) {
    if (gold <= 0 || debt <= 0) return 0;
    let payment = gold;
    if (payment > debt) payment = debt;
    if (payment > GameRules.DebtPaymentCap) payment = GameRules.DebtPaymentCap;
    return payment;
  },

  getCombatStatusLabel(statusId) {
    switch (statusId) {
      case CombatStatusId.Guarded: return "Guarded";
      case CombatStatusId.Burned: return "Burned";
      case CombatStatusId.Poisoned: return "Poisoned";
      case CombatStatusId.Marked: return "Marked";
      case CombatStatusId.Weakened: return "Weakened";
      case CombatStatusId.Inspired: return "Inspired";
      default: return "";
    }
  },

  getCombatStatusLetter(statusId) {
    switch (statusId) {
      case CombatStatusId.Guarded: return "G";
      case CombatStatusId.Burned: return "B";
      case CombatStatusId.Poisoned: return "P";
      case CombatStatusId.Marked: return "M";
      case CombatStatusId.Weakened: return "W";
      case CombatStatusId.Inspired: return "I";
      default: return "";
    }
  },

  getCombatStatusColor(statusId) {
    switch (statusId) {
      case CombatStatusId.Guarded: return GameRules.GuardedStatusColor;
      case CombatStatusId.Burned: return GameRules.BurnedStatusColor;
      case CombatStatusId.Poisoned: return GameRules.PoisonedStatusColor;
      case CombatStatusId.Marked: return GameRules.MarkedStatusColor;
      case CombatStatusId.Weakened: return GameRules.WeakenedStatusColor;
      case CombatStatusId.Inspired: return GameRules.InspiredStatusColor;
      default: return rgba(0.5, 0.5, 0.5);
    }
  },

  getDebtStatusLabel(debt) {
    if (debt >= GameRules.CriticalDebtThreshold) return "Critical";
    if (debt >= GameRules.DangerousDebtThreshold) return "Dangerous";
    if (debt >= GameRules.StrainedDebtThreshold) return "Strained";
    return "Stable";
  },

  getDebtStatusColor(debt) {
    if (debt >= GameRules.CriticalDebtThreshold) return GameRules.DebtCriticalColor;
    if (debt >= GameRules.DangerousDebtThreshold) return GameRules.DebtDangerousColor;
    if (debt >= GameRules.StrainedDebtThreshold) return GameRules.DebtStrainedColor;
    return GameRules.DebtStableColor;
  },

  getDebtStatusBackgroundColor(debt) {
    if (debt >= GameRules.CriticalDebtThreshold) return GameRules.DebtCriticalBgColor;
    if (debt >= GameRules.DangerousDebtThreshold) return GameRules.DebtDangerousBgColor;
    if (debt >= GameRules.StrainedDebtThreshold) return GameRules.DebtStrainedBgColor;
    return GameRules.DebtStableBgColor;
  },

  isHighDebtPressure(debt) {
    return debt >= GameRules.DangerousDebtThreshold;
  },

  scaleCombatStat(baseValue, multiplier) {
    if (baseValue <= 0) return 0;
    if (multiplier <= 0) return baseValue;
    const scaledValue = Math.ceil(baseValue * multiplier);
    if (scaledValue < GameRules.MinimumPositiveCombatStat) return GameRules.MinimumPositiveCombatStat;
    return scaledValue;
  },

  getActStatScale(act) {
    return GameRules.ActStatScale[act] || Object.freeze({ enemyHealth: 1, enemyAttack: 1 });
  },

  scaleEnemyAttackForAct(baseValue, act) {
    return this.scaleCombatStat(baseValue, this.getActStatScale(act).enemyAttack);
  },

  scaleEnemyHealthForAct(baseValue, act) {
    return this.scaleCombatStat(baseValue, this.getActStatScale(act).enemyHealth);
  },

  getVeteranThresholdForTier(veteranTier) {
    if (veteranTier <= 0) return 0;
    if (veteranTier === 1) return GameRules.VeteranTier1XpThreshold;
    if (veteranTier === 2) return GameRules.VeteranTier2XpThreshold;
    if (veteranTier === 3) return GameRules.VeteranTier3XpThreshold;
    let threshold = GameRules.VeteranTier3XpThreshold;
    let gap = GameRules.VeteranContinuingInitialGap;
    for (let tier = 4; tier <= veteranTier; tier++) {
      threshold += gap;
      gap += GameRules.VeteranContinuingGapGrowth;
    }
    return threshold;
  },

  getVeteranTierForXp(xp) {
    if (xp < GameRules.VeteranTier1XpThreshold) return 0;
    let tier = 0;
    let nextThreshold = GameRules.VeteranTier1XpThreshold;
    while (xp >= nextThreshold) {
      tier += 1;
      nextThreshold = this.getVeteranThresholdForTier(tier + 1);
    }
    return tier;
  },

  getNextVeteranThresholdForXp(xp) {
    const veteranTier = this.getVeteranTierForXp(xp);
    return this.getVeteranThresholdForTier(veteranTier + 1);
  },

  getVeteranProgressRatio(xp) {
    const nextThreshold = this.getNextVeteranThresholdForXp(xp);
    if (nextThreshold <= 0) return 0;
    const ratio = xp / nextThreshold;
    if (ratio < 0) return 0;
    if (ratio > 1) return 1;
    return ratio;
  },

  getVeteranProgressLabel(xp) {
    const veteranTier = this.getVeteranTierForXp(xp);
    const nextThreshold = this.getNextVeteranThresholdForXp(xp);
    if (veteranTier <= 0) return "XP " + xp + "/" + nextThreshold;
    return "V" + veteranTier + " XP " + xp + "/" + nextThreshold;
  },

  get totalActs() { return DefaultActCount; },
  get devTotalActs() { return ActRoundCounts.length; },
  get finalAct() { return DefaultActCount; },
  get finalRound() { return this.getActFinalRound(1); },
  get act1FinalRound() { return this.getActFinalRound(1); },
  get act2FinalRound() { return this.getActFinalRound(2); },
  get act3FinalRound() { return this.getActFinalRound(3); },
  get act1Rounds() { return this.getRoundsInAct(1); },
  get act2Rounds() { return this.getRoundsInAct(2); },
  get act3Rounds() { return this.getRoundsInAct(3); },

  getRoundsInAct(act) {
    return ActRoundCounts[clampAct(act) - 1];
  },

  getActFinalRound(act) {
    const clamped = clampAct(act);
    let total = 0;
    for (let i = 0; i < clamped; i++) total += ActRoundCounts[i];
    return total;
  },

  getActStartRound(act) {
    return this.getActFinalRound(act) - this.getRoundsInAct(act) + 1;
  },

  getAbsoluteRound(act, slot) {
    return this.getActStartRound(act) + slot - 1;
  },

  getActForRound(absoluteRound) {
    let cumulative = 0;
    for (let act = 1; act <= ActRoundCounts.length; act++) {
      cumulative += ActRoundCounts[act - 1];
      if (absoluteRound <= cumulative) return act;
    }
    return ActRoundCounts.length;
  },

  getRoundWithinAct(act, absoluteRound) {
    return absoluteRound - this.getActStartRound(act) + 1;
  },

  getActLabel(act) {
    return "Act " + clampAct(act);
  },

  getActAccentColor(act) {
    let index = clampAct(act) - 1;
    if (index >= ActAccentColors.length) index = ActAccentColors.length - 1;
    return ActAccentColors[index];
  },

  getActRomanNumeral(act) {
    const index = clampAct(act) - 1;
    if (index >= ActRomanNumerals.length) return String(clampAct(act));
    return ActRomanNumerals[index];
  },

  getActThemeWord(act) {
    const index = clampAct(act) - 1;
    if (index >= ActThemeWords.length) return "";
    return ActThemeWords[index];
  },

  getRivalGuildColor(guild) {
    switch (guild) {
      case RivalGuild.Frugal: return GameRules.GuildFrugalColor;
      case RivalGuild.Greedy: return GameRules.GuildGreedyColor;
      case RivalGuild.Carry: return GameRules.GuildCarryColor;
      default: return GameRules.GuildNeutralColor;
    }
  },

  getRivalRaceAdvance(guild, round, rival) {
    const curve = GameRules.RivalRaceCurves[guild];
    if (!curve || typeof curve.getAdvance !== "function") return 0;
    return curve.getAdvance(round, rival);
  },

  getRivalRaceAverageRemaining(guild, round, rival) {
    let total = 0;
    let count = 0;
    for (let projectedRound = round; projectedRound <= GameRules.RivalRaceMaxProgress; projectedRound++) {
      total += this.getRivalRaceAdvance(guild, projectedRound, rival);
      count += 1;
    }
    return count > 0 ? total / count : 1;
  },

  getRivalRaceProjectedFinishRound(guild, round, progress, rival) {
    if (progress >= GameRules.RivalRaceMaxProgress) return round;
    const average = this.getRivalRaceAverageRemaining(guild, round, rival);
    if (average <= 0) return round;
    return round + Math.ceil((GameRules.RivalRaceMaxProgress - progress) / average);
  },

  isCapstoneEncounter(encounter) {
    if (!encounter) return false;
    if (encounter.type === EncounterType.FinalBoss) return true;
    return encounter.type === EncounterType.RivalGhost
      && encounter.round === this.getActFinalRound(encounter.act);
  },

  getEncounterKindLabel(encounter) {
    if (!encounter) return "";
    if (this.isCapstoneEncounter(encounter)) return "Final Capstone - Awards Relic";
    if (encounter.type === EncounterType.RivalGhost) return "Rival Guild - " + encounter.rivalGuild;
    return "Dungeon - standard encounter";
  },
};
