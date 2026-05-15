using System;
using System.Collections.Generic;
using UnityEngine;

public class RivalManager : MonoBehaviour
{
    public void InitializeRivals(RunState runState)
    {
        if (runState == null)
        {
            return;
        }

        runState.Rivals.Clear();
        List<RivalGuildState> rivals = DataRepository.CreateRivalGuilds();
        for (int i = 0; i < rivals.Count; i++)
        {
            runState.Rivals.Add(rivals[i]);
        }
    }

    public void AdvanceRivals(RunState runState)
    {
        if (runState == null)
        {
            return;
        }

        int currentRound = runState.Round;
        for (int i = 0; i < runState.Rivals.Count; i++)
        {
            RivalGuildState rival = runState.Rivals[i];
            rival.Payroll += GetPayrollGrowth(rival, currentRound);

            if (rival.Payroll > GameRules.RivalIncomePerRound)
            {
                rival.Debt += rival.Payroll - GameRules.RivalIncomePerRound;
            }

            if (rival.Id == "greedy" && currentRound % 2 == 0)
            {
                rival.Debt += GameRules.GreedyRivalDebtCreep;
            }

            if (rival.Id == "frugal" && rival.Debt > 0)
            {
                rival.Debt = Math.Max(0, rival.Debt - 1);
            }

            if (rival.Debt > GameRules.RivalMoraleDebtThreshold)
            {
                rival.Morale = Math.Max(0, rival.Morale - GameRules.RivalMoraleDebtPenalty);
            }
        }
    }

    private static int GetPayrollGrowth(RivalGuildState rival, int currentRound)
    {
        if (rival.Id == "carry")
        {
            return currentRound % 2 == 0
                ? GameRules.CarryRivalEvenRoundPayrollGrowth
                : GameRules.CarryRivalOddRoundPayrollGrowth;
        }

        return rival.PayrollGrowthPerRound;
    }
}
