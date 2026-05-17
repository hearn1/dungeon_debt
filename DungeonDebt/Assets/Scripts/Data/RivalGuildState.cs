public class RivalGuildState
{
    public RivalGuildState(
        RivalGuild guild,
        string displayName,
        int morale,
        int debt,
        int payroll,
        string statusLabel,
        int payrollGrowthPerRound)
    {
        Guild = guild;
        DisplayName = displayName;
        Morale = morale;
        Debt = debt;
        Payroll = payroll;
        StatusLabel = statusLabel;
        PayrollGrowthPerRound = payrollGrowthPerRound;
    }

    public RivalGuild Guild { get; set; }
    public string DisplayName { get; set; }
    public int Morale { get; set; }
    public int Debt { get; set; }
    public int Payroll { get; set; }
    public string StatusLabel { get; set; }
    public int PayrollGrowthPerRound { get; set; }
}
