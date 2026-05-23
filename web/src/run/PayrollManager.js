// Ported from DungeonDebt/Assets/Scripts/Run/PayrollManager.cs
import { PayrollActionId } from "../data/enums.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { HeroEffects } from "../combat/HeroEffects.js";

export class PayrollManager {
  apply(runState, actionId) {
    if (!runState) return;

    switch (actionId) {
      case PayrollActionId.TakeLoan:
        runState.gold += GameRules.LoanGoldGain;
        runState.debt += GameRules.LoanDebtCost;
        break;

      case PayrollActionId.CutWages:
        for (const hero of runState.party) {
          let reducedAttack = hero.attack - GameRules.CutWagesAttackPenalty;
          if (reducedAttack < 0) reducedAttack = 0;
          hero.attack = reducedAttack;
        }
        break;

      case PayrollActionId.PromiseVictoryBonus: {
        let gold = runState.gold - GameRules.VictoryBonusGoldCost;
        if (gold < 0) gold = 0;
        runState.gold = gold;
        for (const hero of runState.party) {
          hero.attack += GameRules.VictoryBonusAttackBuff;
        }
        break;
      }

      case PayrollActionId.StandardPay:
      default:
        break;
    }
  }

  applyPostCombat(runState, combatResult) {
    if (!runState || !combatResult) return;

    runState.latestVictoryBonusLossDebt = 0;
    runState.latestPayrollSummary = "";

    const selected = runState.selectedPayrollAction;
    if (selected === null || selected === undefined) return;

    switch (selected) {
      case PayrollActionId.TakeLoan:
        runState.latestPayrollSummary = `Loan: +${GameRules.LoanGoldGain} gold, +${GameRules.LoanDebtCost} debt`;
        break;

      case PayrollActionId.CutWages:
        runState.latestPayrollSummary =
          `Cut Wages: total upkeep -${GameRules.CutWagesUpkeepReduction} (min 0), attack -${GameRules.CutWagesAttackPenalty} per hero (min 0)`;
        break;

      case PayrollActionId.PromiseVictoryBonus: {
        const victoryBonusLine =
          `Victory Bonus: -${GameRules.VictoryBonusGoldCost} gold, +${GameRules.VictoryBonusAttackBuff} attack per hero`;
        if (combatResult.playerWon) {
          runState.latestPayrollSummary = victoryBonusLine;
        } else {
          runState.debt += GameRules.VictoryBonusDebtOnLoss;
          runState.latestVictoryBonusLossDebt = GameRules.VictoryBonusDebtOnLoss;
          runState.latestPayrollSummary = `${victoryBonusLine}\n+${GameRules.VictoryBonusDebtOnLoss} debt (loss penalty)`;
        }
        break;
      }

      case PayrollActionId.StandardPay:
      default:
        break;
    }
  }

  revertPerCombatHeroStats(runState) {
    if (!runState) return;
    for (const hero of runState.party) {
      if (!hero.definition) continue;
      HeroEffects.applyTierStatSeed(hero);
      hero.currentHealth = GameRulesFns.scaleCombatStat(
        HeroEffects.getTierAdjustedMaxHealth(hero),
        runState.heroHealthMultiplier,
      );
    }
  }
}
