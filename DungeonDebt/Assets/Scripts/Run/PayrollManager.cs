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
                    int reducedUpkeep = hero.UpkeepThisRound - GameRules.CutWagesUpkeepReduction;
                    if (reducedUpkeep < 0)
                    {
                        reducedUpkeep = 0;
                    }
                    hero.UpkeepThisRound = reducedUpkeep;

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
}
