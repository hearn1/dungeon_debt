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
}
