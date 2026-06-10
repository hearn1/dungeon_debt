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

      case PayrollActionId.PromiseVictoryBonus:
        // No upfront gold cost — the wager settles in applyPostCombat.
        for (const hero of runState.party) {
          hero.attack += GameRules.VictoryBonusAttackBuff;
        }
        break;

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
        runState.latestPayrollSummary = `Loan taken: +${GameRules.LoanGoldGain} gold, +${GameRules.LoanDebtCost} debt.`;
        break;

      case PayrollActionId.CutWages:
        runState.latestPayrollSummary =
          `Wages cut: upkeep reduced by up to ${GameRules.CutWagesUpkeepReduction}; heroes fought at -${GameRules.CutWagesAttackPenalty} attack.`;
        break;

      case PayrollActionId.PromiseVictoryBonus: {
        if (combatResult.playerWon) {
          // Reward has already been granted; now attempt to pay the promised bonus.
          const owed = GameRules.VictoryBonusGoldCost;
          const paid = Math.min(runState.gold, owed);
          const unpaid = owed - paid;
          runState.gold -= paid;
          if (unpaid > 0) {
            runState.debt += unpaid;
            runState.latestPayrollSummary =
              `Victory bonus partly paid: heroes gained +${GameRules.VictoryBonusAttackBuff} attack; paid ${paid} gold, added ${unpaid} debt.`;
          } else {
            runState.latestPayrollSummary =
              `Victory bonus paid: heroes gained +${GameRules.VictoryBonusAttackBuff} attack; paid ${paid} gold after the win.`;
          }
        } else {
          runState.debt += GameRules.VictoryBonusDebtOnLoss;
          runState.latestVictoryBonusLossDebt = GameRules.VictoryBonusDebtOnLoss;
          runState.latestPayrollSummary =
            `Victory bonus failed: heroes gained +${GameRules.VictoryBonusAttackBuff} attack; +${GameRules.VictoryBonusDebtOnLoss} debt from the broken promise.`;
        }
        break;
      }

      case PayrollActionId.StandardPay:
      default:
        runState.latestPayrollSummary = "Standard payroll applied. No bonus. No penalty.";
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
