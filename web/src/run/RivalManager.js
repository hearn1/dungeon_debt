// Ported from DungeonDebt/Assets/Scripts/Run/RivalManager.cs
import { RivalGuild } from "../data/enums.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";

export class RivalManager {
  initializeRivals(runState) {
    if (!runState) return;
    runState.rivals.length = 0;
    const rivals = DataRepository.createRivalGuilds();
    for (const rival of rivals) runState.rivals.push(rival);
  }

  advanceRivals(runState) {
    if (!runState) return;
    const currentRound = runState.round;
    runState.rivalRaceFinishesThisRound.length = 0;

    for (const rival of runState.rivals) {
      rival.payroll += getPayrollGrowth(rival, currentRound);

      if (rival.payroll > GameRules.RivalIncomePerRound) {
        rival.debt += rival.payroll - GameRules.RivalIncomePerRound;
      }

      if (rival.guild === RivalGuild.Greedy && currentRound % 2 === 0) {
        rival.debt += GameRules.GreedyRivalDebtCreep;
      }

      if (rival.guild === RivalGuild.Frugal && rival.debt > 0) {
        rival.debt = Math.max(0, rival.debt - 1);
      }

      if (rival.debt > GameRules.RivalMoraleDebtThreshold) {
        rival.morale = Math.max(0, rival.morale - GameRules.RivalMoraleDebtPenalty);
      }

      advanceRace(runState, rival, currentRound);
    }
  }
}

function advanceRace(runState, rival, currentRound) {
  if (!runState || !rival || rival.finishedAtRound !== null) return;

  const progress = rival.progress + GameRulesFns.getRivalRaceAdvance(rival.guild, currentRound, rival);
  rival.progress = Math.min(GameRules.RivalRaceMaxProgress, progress);

  if (rival.progress < GameRules.RivalRaceMaxProgress) return;

  rival.finishedAtRound = currentRound;
  if (currentRound < GameRules.RivalRaceMaxProgress) {
    runState.rivalRaceFinishesThisRound.push(rival.guild);
    if (rival.tributeApplied !== true) {
      runState.morale = Math.max(0, runState.morale - GameRules.RivalFinishedFirstMorale);
      rival.tributeApplied = true;
    }
  }
}

function getPayrollGrowth(rival, currentRound) {
  if (rival.guild === RivalGuild.Carry) {
    return currentRound % 2 === 0
      ? GameRules.CarryRivalEvenRoundPayrollGrowth
      : GameRules.CarryRivalOddRoundPayrollGrowth;
  }
  return rival.payrollGrowthPerRound;
}
