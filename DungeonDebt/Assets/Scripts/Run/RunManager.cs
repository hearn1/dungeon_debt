using System;
using UnityEngine;

public class RunManager : MonoBehaviour
{
    [SerializeField] private PayrollManager _payrollManager;
    [SerializeField] private RivalManager _rivalManager;

    private System.Random _random;
    private RunState _currentRunState;

    public void Initialize(PayrollManager payrollManager)
    {
        _payrollManager = payrollManager;
    }

    public void Initialize(PayrollManager payrollManager, RivalManager rivalManager)
    {
        _payrollManager = payrollManager;
        _rivalManager = rivalManager;
    }

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
        runState.FullUpkeepPaidLastRound = false;

        _currentRunState = runState;
        if (_rivalManager != null)
        {
            _rivalManager.InitializeRivals(_currentRunState);
        }
        else
        {
            System.Collections.Generic.List<RivalGuildState> rivals = DataRepository.CreateRivalGuilds();
            for (int i = 0; i < rivals.Count; i++)
            {
                _currentRunState.Rivals.Add(rivals[i]);
            }
        }

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

        if (combatResult.SurvivorFlags != null)
        {
            bool goblinStole;
            if (combatResult.SurvivorFlags.TryGetValue("goblinStoleGold", out goblinStole) && goblinStole)
            {
                rewardGold -= GameRules.GoblinThiefStealGold;
            }

            bool treasureLeechSurvived;
            if (combatResult.SurvivorFlags.TryGetValue("treasureLeechSurvived", out treasureLeechSurvived) && treasureLeechSurvived)
            {
                rewardGold -= GameRules.TreasureLeechStealGold;
            }
        }

        if (rewardGold < 0)
        {
            rewardGold = 0;
        }

        _currentRunState.Gold += rewardGold;
        _currentRunState.Morale += moraleChange;

        if (_payrollManager != null)
        {
            _payrollManager.ApplyPostCombat(_currentRunState, combatResult);
        }

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
        _currentRunState.FullUpkeepPaidLastRound = (upkeepShortfall == 0);

        if (_payrollManager != null)
        {
            _payrollManager.RevertPerCombatHeroStats(_currentRunState);
        }
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

        if (_currentRunState.Round >= GameRules.FinalRound)
        {
            if (_currentRunState.LatestCombatWon)
            {
                _currentRunState.LatestEndReason = "Final round cleared.";
                return GameState.Victory;
            }

            _currentRunState.LatestEndReason = "Final round failed.";
            return GameState.Defeat;
        }

        _currentRunState.LatestEndReason = null;
        return GameState.RivalUpdate;
    }

    public void SwapPartySlots(int slotA, int slotB)
    {
        if (_currentRunState == null)
        {
            return;
        }

        if (slotA == slotB)
        {
            return;
        }

        if (slotA < 0 || slotA >= GameRules.MaxPartySize)
        {
            return;
        }

        if (slotB < 0 || slotB >= GameRules.MaxPartySize)
        {
            return;
        }

        HeroInstance heroA = null;
        HeroInstance heroB = null;
        for (int i = 0; i < _currentRunState.Party.Count; i++)
        {
            HeroInstance hero = _currentRunState.Party[i];
            if (hero.FormationSlot == slotA)
            {
                heroA = hero;
            }
            else if (hero.FormationSlot == slotB)
            {
                heroB = hero;
            }
        }

        if (heroA == null && heroB == null)
        {
            return;
        }

        if (heroA != null)
        {
            heroA.FormationSlot = slotB;
        }

        if (heroB != null)
        {
            heroB.FormationSlot = slotA;
        }

        _currentRunState.Party.Sort(CompareHeroesBySlot);
    }

    private static int CompareHeroesBySlot(HeroInstance first, HeroInstance second)
    {
        if (first.FormationSlot < second.FormationSlot)
        {
            return -1;
        }

        if (first.FormationSlot > second.FormationSlot)
        {
            return 1;
        }

        return 0;
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
        HeroEffects.ApplyPreUpkeep(runState);

        int totalUpkeep = 0;

        for (int i = 0; i < runState.Party.Count; i++)
        {
            totalUpkeep += runState.Party[i].UpkeepThisRound;
        }

        if (encounter != null)
        {
            if (encounter.EncounterEffectId == EncounterEffectId.TaxCollectorUpkeep)
            {
                totalUpkeep += GameRules.TaxCollectorUpkeep;
            }
            else if (encounter.EncounterEffectId == EncounterEffectId.FinalBossDamage)
            {
                totalUpkeep += GameRules.AuditorUpkeep;
            }
        }

        if (totalUpkeep < 0)
        {
            totalUpkeep = 0;
        }

        return totalUpkeep;
    }
}
