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
        return InitializeRun(GameRules.DefaultDifficultyPreset);
    }

    public RunState InitializeRun(DifficultyPresetId presetId)
    {
        _random = new System.Random(unchecked((int)DateTime.Now.Ticks));

        DifficultyPreset preset = DataRepository.GetDifficultyPreset(presetId);

        RunState runState = new RunState();
        runState.Act = 1;
        runState.Round = 1;
        runState.SelectedDifficulty = preset.Id;
        runState.DifficultyDisplayName = preset.DisplayName;
        runState.Gold = preset.StartingGold;
        runState.Debt = preset.StartingDebt;
        runState.Morale = preset.StartingMorale;
        runState.InterestDivisor = preset.InterestDivisor;
        runState.DebtLimit = preset.DebtLimit;
        runState.HeroHealthMultiplier = preset.HeroHealthMult;
        runState.HeroDamageMultiplier = preset.HeroDamageMult;
        runState.EnemyHealthMultiplier = preset.EnemyHealthMult;
        runState.EnemyDamageMultiplier = preset.EnemyDamageMult;
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

        BalanceRunLogger.StartRun(_currentRunState);

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
            HeroEffects.ApplyTierStatSeed(_currentRunState.Party[i]);
            _currentRunState.Party[i].CurrentHealth = HeroEffects.GetTierAdjustedMaxHealth(_currentRunState.Party[i]);
        }

        return _currentRunState;
    }

    public void ApplyPostCombatResult(CombatResult combatResult, EncounterDefinition encounter)
    {
        if (_currentRunState == null || combatResult == null)
        {
            return;
        }

        bool isRivalGhost = encounter != null && encounter.Type == EncounterType.RivalGhost;
        int rewardGold = combatResult.PlayerWon ? GameRules.WinReward : GameRules.LossReward;
        if (combatResult.PlayerWon && isRivalGhost)
        {
            rewardGold += GameRules.RivalWinBonus;
        }

        int lossMorale = isRivalGhost ? GameRules.RivalLossMorale : GameRules.DungeonLossMorale;
        int moraleChange = combatResult.PlayerWon ? 0 : -lossMorale;

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

        int interestCharged = (int)Math.Ceiling(_currentRunState.Debt / (double)_currentRunState.InterestDivisor);
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

        if (_currentRunState.Debt >= _currentRunState.DebtLimit)
        {
            _currentRunState.LatestEndReason = "Debt limit reached.";
            return GameState.Defeat;
        }

        if (_currentRunState.Act >= GameRules.FinalAct)
        {
            if (_currentRunState.Round >= GameRules.Act2FinalRound)
            {
                if (_currentRunState.LatestCombatWon)
                {
                    _currentRunState.LatestEndReason = "Act 2 cleared.";
                    return GameState.Victory;
                }

                _currentRunState.LatestEndReason = "Act 2 final round failed.";
                return GameState.Defeat;
            }
        }
        else if (_currentRunState.Round >= GameRules.Act1FinalRound)
        {
            if (_currentRunState.LatestCombatWon)
            {
                _currentRunState.LatestEndReason = "Act 1 cleared.";
                return GameState.Victory;
            }

            _currentRunState.LatestEndReason = "Act 1 final round failed.";
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
        ResetPartyTierStats(_currentRunState);
    }

    public void AdvanceToAct2()
    {
        if (_currentRunState == null)
        {
            return;
        }

        _currentRunState.Act = GameRules.FinalAct;
        _currentRunState.Round = GameRules.Act1FinalRound + 1;
        _currentRunState.HasLatestRewardSummary = false;
        _currentRunState.LatestEndReason = null;
        ResetPartyTierStats(_currentRunState);
    }

    private static void ResetPartyTierStats(RunState runState)
    {
        if (runState == null)
        {
            return;
        }

        for (int i = 0; i < runState.Party.Count; i++)
        {
            HeroInstance hero = runState.Party[i];
            HeroEffects.ApplyTierStatSeed(hero);
            if (hero != null)
            {
                hero.CurrentHealth = HeroEffects.GetTierAdjustedMaxHealth(hero);
            }
        }
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

        if (runState.SelectedPayrollAction.HasValue &&
            runState.SelectedPayrollAction.Value == PayrollActionId.CutWages)
        {
            totalUpkeep -= GameRules.CutWagesUpkeepReduction;
        }

        if (totalUpkeep < 0)
        {
            totalUpkeep = 0;
        }

        return totalUpkeep;
    }
}
