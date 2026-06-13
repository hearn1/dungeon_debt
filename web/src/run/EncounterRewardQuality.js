import { GameRules } from "../core/GameRules.js";
import { EncounterType } from "../data/enums.js";

export function getEncounterVeterancyXpBreakdown(act, slot, encounterType) {
  const actNumber = normalizePositiveInt(act, 1);
  const slotNumber = normalizePositiveInt(slot, 1);
  const type = encounterType || EncounterType.Dungeon;

  if (actNumber <= 1) {
    return Object.freeze({
      actBonus: 0,
      lateSlotBonus: 0,
      typeBonus: 0,
      totalBonus: 0,
    });
  }

  const actBonus = GameRules.EncounterVeterancyActBonus[actNumber] || 0;
  const lateSlotBonus = slotNumber >= GameRules.EncounterVeterancyLateSlotBonusThreshold
    ? GameRules.EncounterVeterancyLateSlotBonus
    : 0;
  const typeBonus = GameRules.EncounterVeterancyTypeBonus[type] || 0;

  return Object.freeze({
    actBonus,
    lateSlotBonus,
    typeBonus,
    totalBonus: Math.max(0, actBonus + lateSlotBonus + typeBonus),
  });
}

export function getEncounterVeterancyXpBreakdownForEncounter(encounter) {
  if (!encounter) {
    return getEncounterVeterancyXpBreakdown(1, 1, EncounterType.Dungeon);
  }
  return getEncounterVeterancyXpBreakdown(encounter.act, encounter.slot, encounter.type);
}

export function getEncounterRewardQualityBreakdown(act, slot, encounterType) {
  const actNumber = normalizePositiveInt(act, 1);
  const type = encounterType || EncounterType.Dungeon;

  if (actNumber <= 1) {
    return Object.freeze({
      relicChoiceBonus: 0,
      shopSilverChanceBonus: 0,
    });
  }

  const relicChoiceBonus = Math.max(0,
    (GameRules.RewardQualityRelicChoiceActBonus[actNumber] || 0)
      + (GameRules.RewardQualityRelicChoiceTypeBonus[type] || 0));
  const shopSilverChanceBonus = Math.max(0,
    (GameRules.RewardQualityShopSilverChanceActBonus[actNumber] || 0)
      + (GameRules.RewardQualityShopSilverChanceTypeBonus[type] || 0));

  return Object.freeze({
    relicChoiceBonus,
    shopSilverChanceBonus,
  });
}

export function getEncounterRewardQualityBreakdownForEncounter(encounter) {
  if (!encounter) {
    return getEncounterRewardQualityBreakdown(1, 1, EncounterType.Dungeon);
  }
  return getEncounterRewardQualityBreakdown(encounter.act, encounter.slot, encounter.type);
}

export function getEncounterRewardQualitySummary(breakdown) {
  if (!breakdown) return "";

  const parts = [];
  if (breakdown.relicChoiceBonus > 0) {
    parts.push(`+${breakdown.relicChoiceBonus} relic option`);
  }
  if (breakdown.shopSilverChanceBonus > 0) {
    parts.push(`+${Math.round(breakdown.shopSilverChanceBonus * 100)}% Silver offer odds next shop`);
  }

  return parts.join("; ");
}

function normalizePositiveInt(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) return fallback;
  return number;
}
