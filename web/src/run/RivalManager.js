// Ported from DungeonDebt/Assets/Scripts/Run/RivalManager.cs
import { RivalGuild } from "../data/enums.js";
import { GameRules } from "../core/GameRules.js";
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
