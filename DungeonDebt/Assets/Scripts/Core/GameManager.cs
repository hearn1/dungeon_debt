using System;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    [SerializeField] private RunManager _runManager;

    private GameState _currentState = GameState.MainMenu;

    public event Action<GameState> OnStateChanged;

    public GameState CurrentState
    {
        get { return _currentState; }
    }

    public RunState CurrentRunState
    {
        get
        {
            if (_runManager == null)
            {
                return null;
            }

            return _runManager.CurrentRunState;
        }
    }

    public RunManager RunManager
    {
        get { return _runManager; }
    }

    private void Awake()
    {
        EnsureRunManager();
    }

    public void Initialize(RunManager runManager)
    {
        _runManager = runManager;
        EnsureRunManager();
    }

    public void StartRun()
    {
        ChangeState(GameState.StartRun);
    }

    public void ContinueAfterReward()
    {
        EnsureRunManager();
        if (_runManager == null)
        {
            return;
        }

        GameState nextState = _runManager.EvaluateNextState();
        if (nextState == GameState.Combat)
        {
            _runManager.AdvanceRound();
        }

        ChangeState(nextState);
    }

    public void ChangeState(GameState nextState)
    {
        EnsureRunManager();
        _currentState = nextState;

        if (_currentState == GameState.StartRun && _runManager != null)
        {
            _runManager.InitializeRun();
        }

        if (OnStateChanged != null)
        {
            OnStateChanged(_currentState);
        }
    }

    private void EnsureRunManager()
    {
        if (_runManager != null)
        {
            return;
        }

        _runManager = GetComponent<RunManager>();
        if (_runManager == null)
        {
            _runManager = gameObject.AddComponent<RunManager>();
        }
    }
}
