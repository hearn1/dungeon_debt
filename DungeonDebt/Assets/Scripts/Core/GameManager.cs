using System;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    [SerializeField] private RunManager _runManager;
    [SerializeField] private ShopManager _shopManager;
    [SerializeField] private PayrollManager _payrollManager;

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

    public ShopManager ShopManager
    {
        get { return _shopManager; }
    }

    public PayrollManager PayrollManager
    {
        get { return _payrollManager; }
    }

    private void Awake()
    {
        EnsureManagers();
    }

    public void Initialize(RunManager runManager)
    {
        _runManager = runManager;
        EnsureManagers();
    }

    public void StartRun()
    {
        ChangeState(GameState.StartRun);
        ChangeState(GameState.Shop);
    }

    public void ContinueFromShop()
    {
        ChangeState(GameState.Formation);
    }

    public void ContinueFromFormation()
    {
        ChangeState(GameState.Payroll);
    }

    public void SelectPayrollAction(PayrollActionId? actionId)
    {
        RunState runState = CurrentRunState;
        if (runState == null)
        {
            return;
        }

        runState.SelectedPayrollAction = actionId;
    }

    public void ContinueFromPayroll()
    {
        EnsureManagers();
        RunState runState = CurrentRunState;
        if (runState != null && runState.SelectedPayrollAction.HasValue && _payrollManager != null)
        {
            _payrollManager.Apply(runState, runState.SelectedPayrollAction.Value);
        }

        ChangeState(GameState.Combat);
    }

    public void ContinueAfterReward()
    {
        EnsureManagers();
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
        EnsureManagers();
        _currentState = nextState;

        if (_currentState == GameState.StartRun && _runManager != null)
        {
            _runManager.InitializeRun();
        }

        if (_currentState == GameState.Shop && _shopManager != null)
        {
            _shopManager.GenerateOffers();
        }

        if (OnStateChanged != null)
        {
            OnStateChanged(_currentState);
        }
    }

    private void EnsureManagers()
    {
        if (_runManager == null)
        {
            _runManager = GetComponent<RunManager>();
            if (_runManager == null)
            {
                _runManager = gameObject.AddComponent<RunManager>();
            }
        }

        if (_shopManager == null)
        {
            _shopManager = GetComponent<ShopManager>();
            if (_shopManager == null)
            {
                _shopManager = gameObject.AddComponent<ShopManager>();
            }
        }

        _shopManager.Initialize(_runManager);

        if (_payrollManager == null)
        {
            _payrollManager = GetComponent<PayrollManager>();
            if (_payrollManager == null)
            {
                _payrollManager = gameObject.AddComponent<PayrollManager>();
            }
        }
    }
}
