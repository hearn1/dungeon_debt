using System;
using System.IO;
using System.Text;
using UnityEngine;

public static class BalanceRunLogger
{
    private static string _runId;
    private static string _logPath;

    public static string LogPath
    {
        get { return _logPath; }
    }

    public static void StartRun(RunState runState)
    {
        _runId = DateTime.Now.ToString("yyyyMMdd_HHmmss");

        string directory = Path.Combine(Application.persistentDataPath, "BalanceLogs");
        Directory.CreateDirectory(directory);

        _logPath = Path.Combine(directory, "balance_run_" + _runId + ".tsv");
        File.WriteAllText(_logPath, BuildHeader() + Environment.NewLine, Encoding.UTF8);

        Debug.Log("Balance log started: " + _logPath);
    }

    public static void LogRound(RunState runState, GameState nextState)
    {
        if (runState == null || string.IsNullOrEmpty(_logPath))
        {
            return;
        }

        EncounterDefinition encounter = runState.CurrentEncounter;
        StringBuilder row = new StringBuilder();

        Append(row, _runId);
        Append(row, DateTime.Now.ToString("o"));
        Append(row, runState.Round.ToString());
        Append(row, encounter != null ? encounter.Round.ToString() : string.Empty);
        Append(row, encounter != null ? encounter.DisplayName : string.Empty);
        Append(row, encounter != null ? encounter.Type.ToString() : string.Empty);
        Append(row, encounter != null ? encounter.DangerCategory : string.Empty);
        Append(row, runState.SelectedPayrollAction.HasValue ? runState.SelectedPayrollAction.Value.ToString() : string.Empty);
        Append(row, runState.LatestCombatWon ? "Win" : "Loss");
        Append(row, runState.LatestRewardGold.ToString());
        Append(row, runState.LatestMoraleChange.ToString());
        Append(row, runState.LatestTotalUpkeep.ToString());
        Append(row, runState.LatestUpkeepPaid.ToString());
        Append(row, runState.LatestUpkeepShortfall.ToString());
        Append(row, runState.LatestInterestCharged.ToString());
        Append(row, runState.LatestInterestPaid.ToString());
        Append(row, runState.LatestInterestAddedToDebt.ToString());
        Append(row, runState.Gold.ToString());
        Append(row, runState.Debt.ToString());
        Append(row, runState.Morale.ToString());
        Append(row, runState.FullUpkeepPaidLastRound ? "true" : "false");
        Append(row, nextState.ToString());
        Append(row, runState.LatestEndReason);
        Append(row, BuildPartySummary(runState));
        AppendLast(row, BuildRivalsSummary(runState));

        File.AppendAllText(_logPath, row.ToString() + Environment.NewLine, Encoding.UTF8);
    }

    private static string BuildHeader()
    {
        return "RunId\tTimestamp\tRound\tEncounterRound\tEncounterName\tEncounterType\tDangerCategory\tPayrollAction\tCombatResult\tRewardGold\tMoraleChange\tUpkeepDue\tUpkeepPaid\tUpkeepShortfall\tInterestCharged\tInterestPaid\tInterestAddedToDebt\tGold\tDebt\tMorale\tFullUpkeepPaid\tNextState\tEndReason\tParty\tRivals";
    }

    private static string BuildPartySummary(RunState runState)
    {
        if (runState == null || runState.Party.Count == 0)
        {
            return "empty";
        }

        StringBuilder summary = new StringBuilder();
        for (int i = 0; i < runState.Party.Count; i++)
        {
            HeroInstance hero = runState.Party[i];
            if (i > 0)
            {
                summary.Append(" | ");
            }

            if (hero == null || hero.Definition == null)
            {
                summary.Append("null");
                continue;
            }

            summary.Append(hero.Definition.DisplayName);
            summary.Append("(");
            summary.Append(hero.Tier);
            summary.Append(",slot=");
            summary.Append(hero.FormationSlot);
            summary.Append(",atk=");
            summary.Append(hero.Attack);
            summary.Append(",hp=");
            summary.Append(hero.CurrentHealth);
            summary.Append("/");
            summary.Append(HeroEffects.GetTierAdjustedMaxHealth(hero));
            summary.Append(",upkeep=");
            summary.Append(hero.UpkeepThisRound);
            summary.Append(")");
        }

        return summary.ToString();
    }

    private static string BuildRivalsSummary(RunState runState)
    {
        if (runState == null || runState.Rivals.Count == 0)
        {
            return "none";
        }

        StringBuilder summary = new StringBuilder();
        for (int i = 0; i < runState.Rivals.Count; i++)
        {
            RivalGuildState rival = runState.Rivals[i];
            if (i > 0)
            {
                summary.Append(" | ");
            }

            if (rival == null)
            {
                summary.Append("null");
                continue;
            }

            summary.Append(rival.DisplayName);
            summary.Append("(morale=");
            summary.Append(rival.Morale);
            summary.Append(",debt=");
            summary.Append(rival.Debt);
            summary.Append(",payroll=");
            summary.Append(rival.Payroll);
            summary.Append(",status=");
            summary.Append(rival.StatusLabel);
            summary.Append(")");
        }

        return summary.ToString();
    }

    private static void Append(StringBuilder row, string value)
    {
        row.Append(Clean(value));
        row.Append('\t');
    }

    private static void AppendLast(StringBuilder row, string value)
    {
        row.Append(Clean(value));
    }

    private static string Clean(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        return value.Replace("\t", " ").Replace("\r", " ").Replace("\n", " ");
    }
}
