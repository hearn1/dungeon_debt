import { GameRules } from "../core/GameRules.js";
import { EncounterType, HeroEffectId } from "../data/enums.js";

export function buildManagerReportLines(run, combatResult, encounter, maxLines = 3) {
  const lines = [];

  // Priority 10: Victory bonus loss penalty
  if (run.latestVictoryBonusLossDebt > 0) {
    lines.push(`Promised victory bonus missed. +${run.latestVictoryBonusLossDebt} debt added from the loss penalty.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 20: Upkeep shortfall
  if (run.latestUpkeepShortfall > 0) {
    lines.push(`Upkeep exceeded cash on hand. +${run.latestUpkeepShortfall} debt added.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 30: Interest rollover
  if (run.latestInterestAddedToDebt > 0) {
    lines.push(`Interest could not be paid in full. +${run.latestInterestAddedToDebt} debt rolled over.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 40: Reward drain survived
  if (combatResult.survivorFlags && combatResult.survivorFlags["treasureLeechSurvived"] === true) {
    lines.push(`Reward drain survived the fight. -${GameRules.TreasureLeechStealGold} reward gold.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 50: Thief escaped
  if (combatResult.survivorFlags && combatResult.survivorFlags["goblinStoleGold"] === true) {
    lines.push(`A thief escaped with the purse. -${GameRules.GoblinThiefStealGold} reward gold.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 60: Morale loss
  if (run.latestMoraleChange < 0) {
    lines.push(`The loss cost ${Math.abs(run.latestMoraleChange)} morale.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 70: Full upkeep enables Wizard scaling
  if (run.latestUpkeepShortfall === 0 && run.party.some(h => h && h.definition && h.definition.effectId === HeroEffectId.WizardScaling)) {
    lines.push(`Full upkeep was paid. Wizard scaling is enabled next fight.`);
    if (lines.length >= maxLines) return lines;
  }

  // Priority 80: Rival win bonus
  if (combatResult.playerWon && encounter && encounter.type === EncounterType.RivalGhost) {
    lines.push(`Rival contract bonus made this fight +${GameRules.RivalWinBonus} gold more profitable.`);
  }

  return lines;
}
