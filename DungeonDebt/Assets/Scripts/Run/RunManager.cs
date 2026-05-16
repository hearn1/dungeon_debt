using System;
using System.Collections.Generic;
using System.Text;
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
        runState.LatestVeterancySummary = string.Empty;

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
            _currentRunState.Party[i].CurrentHealth = GetScaledHeroMaxHealth(_currentRunState.Party[i], _currentRunState);
        }

        return _currentRunState;
    }

    public void ApplyPostCombatResult(CombatResult combatResult, EncounterDefinition encounter)
    {
        if (_currentRunState == null || combatResult == null)
        {
            return;
        }

        _currentRunState.LatestCompletedEncounter = encounter;
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

        int relicRewardGold = HasRelic(_currentRunState, RelicId.GuildDividend) ? GameRules.GuildDividendRewardGold : 0;
        rewardGold += relicRewardGold;

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

        string veterancySummary = AwardVeterancyXp(_currentRunState, combatResult, encounter);

        _currentRunState.HasLatestRewardSummary = true;
        _currentRunState.LatestCombatWon = combatResult.PlayerWon;
        _currentRunState.LatestRewardGold = rewardGold;
        _currentRunState.LatestRelicRewardGold = relicRewardGold;
        _currentRunState.LatestMoraleChange = moraleChange;
        _currentRunState.LatestTotalUpkeep = totalUpkeep;
        _currentRunState.LatestUpkeepPaid = upkeepPaid;
        _currentRunState.LatestUpkeepShortfall = upkeepShortfall;
        _currentRunState.LatestInterestCharged = interestCharged;
        _currentRunState.LatestInterestPaid = interestPaid;
        _currentRunState.LatestInterestAddedToDebt = interestAddedToDebt;
        _currentRunState.LatestVeterancySummary = veterancySummary;
        _currentRunState.FullUpkeepPaidLastRound = (upkeepShortfall == 0);

        if (_payrollManager != null)
        {
            _payrollManager.RevertPerCombatHeroStats(_currentRunState);
        }

        ResetPartyTierStats(_currentRunState);
    }

    public bool TryPreparePendingRelicReward(GameState nextState)
    {
        if (_currentRunState == null)
        {
            return false;
        }

        ClearPendingRelicReward();

        if (nextState == GameState.Defeat || !_currentRunState.LatestCombatWon)
        {
            return false;
        }

        EncounterDefinition encounter = _currentRunState.LatestCompletedEncounter;
        if (!IsRelicEligibleEncounter(encounter))
        {
            return false;
        }

        List<RelicId> availableRelics = new List<RelicId>();
        for (int i = 0; i < DataRepository.AllRelics.Count; i++)
        {
            RelicId relicId = DataRepository.AllRelics[i].Id;
            if (!HasRelic(_currentRunState, relicId))
            {
                availableRelics.Add(relicId);
            }
        }

        if (availableRelics.Count <= 0)
        {
            return false;
        }

        if (_random == null)
        {
            _random = new System.Random(unchecked((int)DateTime.Now.Ticks));
        }

        int choiceCount = GameRules.RelicChoiceCount;
        if (choiceCount > availableRelics.Count)
        {
            choiceCount = availableRelics.Count;
        }

        for (int i = 0; i < choiceCount; i++)
        {
            int index = _random.Next(availableRelics.Count);
            _currentRunState.PendingRelicChoices.Add(availableRelics[index]);
            availableRelics.RemoveAt(index);
        }

        _currentRunState.PendingRelicNextState = nextState;
        _currentRunState.HasPendingRelicReward = true;
        return true;
    }

    public GameState SelectPendingRelic(RelicId relicId)
    {
        if (_currentRunState == null || !_currentRunState.HasPendingRelicReward)
        {
            return GameState.MainMenu;
        }

        GameState nextState = _currentRunState.PendingRelicNextState;
        if (IsPendingRelicChoice(relicId) && !HasRelic(_currentRunState, relicId))
        {
            _currentRunState.ActiveRelics.Add(relicId);
        }

        ClearPendingRelicReward();
        return nextState;
    }

    public static bool HasRelic(RunState runState, RelicId relicId)
    {
        if (runState == null)
        {
            return false;
        }

        for (int i = 0; i < runState.ActiveRelics.Count; i++)
        {
            if (runState.ActiveRelics[i] == relicId)
            {
                return true;
            }
        }

        return false;
    }

    public static int GetRelicAttackBonus(RunState runState, HeroInstance hero)
    {
        if (hero == null || hero.Definition == null)
        {
            return 0;
        }

        if (hero.Definition.Role == HeroRole.Damage && HasRelic(runState, RelicId.BladeCharter))
        {
            return GameRules.BladeCharterAttackBonus;
        }

        return 0;
    }

    public static int GetRelicMaxHealthBonus(RunState runState, HeroInstance hero)
    {
        if (hero == null || hero.Definition == null)
        {
            return 0;
        }

        int bonus = 0;
        if (hero.Definition.Role == HeroRole.Tank && HasRelic(runState, RelicId.IronOath))
        {
            bonus += GameRules.IronOathHealthBonus;
        }

        if (HasRelic(runState, RelicId.CampRations))
        {
            bonus += GameRules.CampRationsHealthBonus;
        }

        return bonus;
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
        _currentRunState.LatestVeterancySummary = string.Empty;
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
        _currentRunState.LatestVeterancySummary = string.Empty;
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
                hero.CurrentHealth = GetScaledHeroMaxHealth(hero, runState);
            }
        }
    }

    public static int GetScaledHeroMaxHealth(HeroInstance hero, RunState runState)
    {
        int scaledHealth = GameRules.ScaleCombatStat(
            HeroEffects.GetTierAdjustedMaxHealth(hero),
            runState != null ? runState.HeroHealthMultiplier : GameRules.NoCombatMultiplier);

        return scaledHealth + GetRelicMaxHealthBonus(runState, hero);
    }

    private static bool IsRelicEligibleEncounter(EncounterDefinition encounter)
    {
        if (encounter == null)
        {
            return false;
        }

        if (encounter.Type == EncounterType.RivalGhost)
        {
            return true;
        }

        return encounter.Round == GameRules.Act1FinalRound ||
            encounter.Round == GameRules.Act2FinalRound;
    }

    private bool IsPendingRelicChoice(RelicId relicId)
    {
        if (_currentRunState == null)
        {
            return false;
        }

        for (int i = 0; i < _currentRunState.PendingRelicChoices.Count; i++)
        {
            if (_currentRunState.PendingRelicChoices[i] == relicId)
            {
                return true;
            }
        }

        return false;
    }

    private void ClearPendingRelicReward()
    {
        if (_currentRunState == null)
        {
            return;
        }

        _currentRunState.PendingRelicChoices.Clear();
        _currentRunState.HasPendingRelicReward = false;
        _currentRunState.PendingRelicNextState = GameState.MainMenu;
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

    private static string AwardVeterancyXp(
        RunState runState,
        CombatResult combatResult,
        EncounterDefinition encounter)
    {
        if (runState == null || combatResult == null)
        {
            return string.Empty;
        }

        int[] awards = new int[runState.Party.Count];
        int survivorAward = GameRules.VeteranSurvivorXp;
        if (IsRivalVeterancyEncounter(encounter))
        {
            survivorAward += GameRules.VeteranRivalFightBonusXp;
        }

        if (IsEndOfActEncounter(encounter))
        {
            survivorAward += GameRules.VeteranEndOfActFightBonusXp;
        }

        for (int i = 0; i < runState.Party.Count; i++)
        {
            HeroInstance hero = runState.Party[i];
            if (hero == null)
            {
                continue;
            }

            if (!WasHeroDead(combatResult, hero))
            {
                awards[i] += survivorAward;
            }
        }

        if (combatResult.PlayerWon && IsEndOfActEncounter(encounter))
        {
            for (int i = 0; i < runState.Party.Count; i++)
            {
                if (runState.Party[i] != null)
                {
                    awards[i] += GameRules.VeteranActCompleteXp;
                }
            }
        }

        StringBuilder summary = new StringBuilder();
        for (int i = 0; i < runState.Party.Count; i++)
        {
            HeroInstance hero = runState.Party[i];
            if (hero == null || hero.Definition == null || awards[i] <= 0)
            {
                continue;
            }

            int previousTier = hero.VeteranTier;
            hero.VeteranXp += awards[i];
            hero.VeteranTier = GameRules.GetVeteranTierForXp(hero.VeteranXp);

            if (summary.Length > 0)
            {
                summary.Append("; ");
            }

            summary.Append(hero.Definition.DisplayName);
            summary.Append(" +");
            summary.Append(awards[i]);
            summary.Append(" XP");

            if (hero.VeteranTier > previousTier)
            {
                summary.Append(" -> Veteran ");
                summary.Append(hero.VeteranTier);
            }
            else
            {
                summary.Append(" (");
                summary.Append(GameRules.GetVeteranProgressLabel(hero.VeteranXp));
                summary.Append(")");
            }
        }

        return summary.ToString();
    }

    private static bool WasHeroDead(CombatResult combatResult, HeroInstance hero)
    {
        if (combatResult == null || hero == null)
        {
            return false;
        }

        for (int i = 0; i < combatResult.DeadHeroes.Count; i++)
        {
            if (combatResult.DeadHeroes[i] == hero)
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsRivalVeterancyEncounter(EncounterDefinition encounter)
    {
        return encounter != null && encounter.Type == EncounterType.RivalGhost;
    }

    private static bool IsEndOfActEncounter(EncounterDefinition encounter)
    {
        if (encounter == null)
        {
            return false;
        }

        return encounter.Round == GameRules.Act1FinalRound ||
            encounter.Round == GameRules.Act2FinalRound;
    }
}
