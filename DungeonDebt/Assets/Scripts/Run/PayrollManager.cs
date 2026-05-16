using UnityEngine;

public class PayrollManager : MonoBehaviour
{
    public void Apply(RunState runState, PayrollActionId actionId)
    {
        if (runState == null)
        {
            return;
        }

        switch (actionId)
        {
            case PayrollActionId.TakeLoan:
                runState.Gold += GameRules.LoanGoldGain;
                runState.Debt += GameRules.LoanDebtCost;
                break;

            case PayrollActionId.CutWages:
                for (int i = 0; i < runState.Party.Count; i++)
                {
                    HeroInstance hero = runState.Party[i];
                    int reducedAttack = hero.Attack - GameRules.CutWagesAttackPenalty;
                    if (reducedAttack < 0)
                    {
                        reducedAttack = 0;
                    }
                    hero.Attack = reducedAttack;
                }
                break;

            case PayrollActionId.PromiseVictoryBonus:
                int gold = runState.Gold - GameRules.VictoryBonusGoldCost;
                if (gold < 0)
                {
                    gold = 0;
                }
                runState.Gold = gold;

                for (int i = 0; i < runState.Party.Count; i++)
                {
                    HeroInstance hero = runState.Party[i];
                    hero.Attack += GameRules.VictoryBonusAttackBuff;
                }
                break;

            case PayrollActionId.StandardPay:
            default:
                break;
        }
    }

    public void ApplyPostCombat(RunState runState, CombatResult combatResult)
    {
        if (runState == null || combatResult == null)
        {
            return;
        }

        runState.LatestVictoryBonusLossDebt = 0;
        runState.LatestPayrollSummary = string.Empty;

        PayrollActionId? selected = runState.SelectedPayrollAction;
        if (!selected.HasValue)
        {
            return;
        }

        switch (selected.Value)
        {
            case PayrollActionId.TakeLoan:
                runState.LatestPayrollSummary =
                    "Loan: +" + GameRules.LoanGoldGain + " gold, +" + GameRules.LoanDebtCost + " debt";
                break;

            case PayrollActionId.CutWages:
                runState.LatestPayrollSummary =
                    "Cut Wages: total upkeep -" + GameRules.CutWagesUpkeepReduction +
                    " (min 0), attack -" + GameRules.CutWagesAttackPenalty + " per hero (min 0)";
                break;

            case PayrollActionId.PromiseVictoryBonus:
                string victoryBonusLine =
                    "Victory Bonus: -" + GameRules.VictoryBonusGoldCost +
                    " gold, +" + GameRules.VictoryBonusAttackBuff + " attack per hero";

                if (combatResult.PlayerWon)
                {
                    runState.LatestPayrollSummary = victoryBonusLine;
                }
                else
                {
                    runState.Debt += GameRules.VictoryBonusDebtOnLoss;
                    runState.LatestVictoryBonusLossDebt = GameRules.VictoryBonusDebtOnLoss;
                    runState.LatestPayrollSummary =
                        victoryBonusLine + "\n+" + GameRules.VictoryBonusDebtOnLoss + " debt (loss penalty)";
                }
                break;

            case PayrollActionId.StandardPay:
            default:
                break;
        }
    }

    public void RevertPerCombatHeroStats(RunState runState)
    {
        if (runState == null)
        {
            return;
        }

        for (int i = 0; i < runState.Party.Count; i++)
        {
            HeroInstance hero = runState.Party[i];
            if (hero.Definition == null)
            {
                continue;
            }

            HeroEffects.ApplyTierStatSeed(hero);
            hero.CurrentHealth = HeroEffects.GetTierAdjustedMaxHealth(hero);
        }
    }
}
