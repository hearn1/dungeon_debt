// Ported from DungeonDebt/Assets/Scripts/Data/RivalGuildState.cs
// Mutable rival snapshot.
export class RivalGuildState {
  constructor(guild, displayName, morale, debt, payroll, statusLabel, payrollGrowthPerRound) {
    this.guild = guild;
    this.displayName = displayName;
    this.morale = morale;
    this.debt = debt;
    this.payroll = payroll;
    this.statusLabel = statusLabel;
    this.payrollGrowthPerRound = payrollGrowthPerRound;
  }
}
