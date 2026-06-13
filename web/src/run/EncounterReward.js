import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { EncounterType } from "../data/enums.js";

const DefaultRewardProgression = Object.freeze({ start: 0, end: 0 });

export function getEncounterReward(act, slot, encounterType) {
  return getEncounterRewardBreakdown(act, slot, encounterType).totalGold;
}

export function getEncounterRewardBreakdown(act, slot, encounterType) {
  const actNumber = normalizePositiveInt(act, 1);
  const slotNumber = normalizePositiveInt(slot, 1);
  const roundsInAct = GameRulesFns.getRoundsInAct(actNumber);
  const clampedSlot = Math.min(slotNumber, roundsInAct);
  const progress = roundsInAct > 1 ? (clampedSlot - 1) / (roundsInAct - 1) : 0;
  const progression = GameRules.EncounterRewardProgression[actNumber] || DefaultRewardProgression;
  const type = encounterType || EncounterType.Dungeon;

  const baseGold = GameRules.WinReward;
  const actBonus = GameRules.EncounterRewardActBonus[actNumber] || 0;
  const progressBonus = Math.round(lerp(progression.start, progression.end, progress));
  const typeBonus = GameRules.EncounterRewardTypeBonus[type] || 0;

  return Object.freeze({
    baseGold,
    actBonus,
    progressBonus,
    typeBonus,
    totalGold: Math.max(0, baseGold + actBonus + progressBonus + typeBonus),
  });
}

export function getEncounterRewardBreakdownForEncounter(encounter) {
  if (!encounter) {
    return getEncounterRewardBreakdown(1, 1, EncounterType.Dungeon);
  }
  return getEncounterRewardBreakdown(encounter.act, encounter.slot, encounter.type);
}

function normalizePositiveInt(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) return fallback;
  return number;
}

function lerp(start, end, progress) {
  return start + ((end - start) * progress);
}
