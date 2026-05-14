using System;
using UnityEngine;

public class RunManager : MonoBehaviour
{
    private System.Random _random;
    private RunState _currentRunState;

    public RunState CurrentRunState
    {
        get { return _currentRunState; }
    }

    public System.Random Random
    {
        get { return _random; }
    }

    private void Awake()
    {
        if (_random == null)
        {
            _random = new System.Random(unchecked((int)DateTime.Now.Ticks));
        }
    }

    public RunState InitializeRun()
    {
        _random = new System.Random(unchecked((int)DateTime.Now.Ticks));

        RunState runState = new RunState();
        runState.Round = 1;
        runState.Gold = GameRules.StartingGold;
        runState.Debt = GameRules.StartingDebt;
        runState.Morale = GameRules.StartingMorale;
        runState.RerollCount = 0;
        runState.SelectedPayrollAction = null;

        _currentRunState = runState;
        return _currentRunState;
    }

    public RunState PrepareSandboxRun()
    {
        if (_currentRunState == null)
        {
            InitializeRun();
        }

        RunState sandboxRun = DataRepository.CreateSandboxRun();
        _currentRunState.Party.Clear();

        for (int i = 0; i < sandboxRun.Party.Count; i++)
        {
            _currentRunState.Party.Add(sandboxRun.Party[i]);
        }

        return _currentRunState;
    }

    public void ApplyPostCombatResult(CombatResult combatResult, EncounterDefinition encounter)
    {
        if (_currentRunState == null || combatResult == null)
        {
            return;
        }

        int rewardGold = combatResult.PlayerWon ? GameRules.WinReward : GameRules.LossReward;
        int moraleChange = combatResult.PlayerWon ? 0 : -GameRules.DungeonLossMorale;

        _currentRunState.Gold += rewardGold;
        _currentRunState.Morale += moraleChange;

        int totalUpkeep = CalculateTotalUpkeep(_currentRunState, encounter);
        int upkeepPaid = totalUpkeep;
        int upkeepShortfall = 0;

        if (_currentRunState.Gold >= totalUpkeep)
        {
            _currentRunState.Gold -= totalUpkeep;
        }
        else
        {
            upkeepPaid = _currentRunState.Gold;
            upkeepShortfall = totalUpkeep - _currentRunState.Gold;
            _currentRunState.Gold = 0;
            _currentRunState.Debt += upkeepShortfall;
        }

        int interestCharged = (int)Math.Ceiling(_currentRunState.Debt / (double)GameRules.InterestDebtDivisor);
        int interestPaid = interestCharged;
        int interestAddedToDebt = 0;

        if (_currentRunState.Gold >= interestCharged)
        {
            _currentRunState.Gold -= interestCharged;
        }
        else
        {
            interestPaid = _currentRunState.Gold;
            interestAddedToDebt = interestCharged - _currentRunState.Gold;
            _currentRunState.Debt += interestAddedToDebt;
            _currentRunState.Gold = 0;
        }

        _currentRunState.HasLatestRewardSummary = true;
        _currentRunState.LatestCombatWon = combatResult.PlayerWon;
        _currentRunState.LatestRewardGold = rewardGold;
        _currentRunState.LatestMoraleChange = moraleChange;
        _currentRunState.LatestTotalUpkeep = totalUpkeep;
        _currentRunState.LatestUpkeepPaid = upkeepPaid;
        _currentRunState.LatestUpkeepShortfall = upkeepShortfall;
        _currentRunState.LatestInterestCharged = interestCharged;
        _currentRunState.LatestInterestPaid = interestPaid;
        _currentRunState.LatestInterestAddedToDebt = interestAddedToDebt;
    }

    public GameState EvaluateNextState()
    {
        if (_currentRunState == null)
        {
            return GameState.MainMenu;
        }

        if (_currentRunState.Morale <= 0)
        {
            _currentRunState.LatestEndReason = "Morale exhausted.";
            return GameState.Defeat;
        }

        if (_currentRunState.Debt >= GameRules.DebtLimit)
        {
            _currentRunState.LatestEndReason = "Debt limit reached.";
            return GameState.Defeat;
        }

        if (_currentRunState.LatestCombatWon && _currentRunState.Round >= GameRules.FinalRound)
        {
            _currentRunState.LatestEndReason = "Final round cleared.";
            return GameState.Victory;
        }

        _currentRunState.LatestEndReason = null;
        return GameState.Combat;
    }

    public void AdvanceRound()
    {
        if (_currentRunState == null)
        {
            return;
        }

        _currentRunState.Round += 1;
        _currentRunState.HasLatestRewardSummary = false;
    }

    private static int CalculateTotalUpkeep(RunState runState, EncounterDefinition encounter)
    {
        int totalUpkeep = 0;

        for (int i = 0; i < runState.Party.Count; i++)
        {
            totalUpkeep += runState.Party[i].UpkeepThisRound;
        }

        if (totalUpkeep < 0)
        {
            totalUpkeep = 0;
        }

        return totalUpkeep;
    }
}
