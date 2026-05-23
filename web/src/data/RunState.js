// Ported from DungeonDebt/Assets/Scripts/Data/RunState.cs
// SelectedPayrollAction uses null where C# used a nullable PayrollActionId?.
export class RunState {
  constructor() {
    this.act = 0;
    this.round = 0;
    this.gold = 0;
    this.debt = 0;
    this.morale = 0;
    this.party = [];
    this.rivals = [];
    this.selectedPayrollAction = null;
    this.rerollCount = 0;
    this.hasLatestRewardSummary = false;
    this.latestCombatWon = false;
    this.latestRewardGold = 0;
    this.latestRelicRewardGold = 0;
    this.latestMoraleChange = 0;
    this.latestTotalUpkeep = 0;
    this.latestUpkeepPaid = 0;
    this.latestUpkeepShortfall = 0;
    this.latestInterestCharged = 0;
    this.latestInterestPaid = 0;
    this.latestInterestAddedToDebt = 0;
    this.latestVeterancySummary = null;
    this.latestPayrollSummary = null;
    this.latestVictoryBonusLossDebt = 0;
    this.latestEndReason = null;
    this.currentEncounter = null;
    this.latestCompletedEncounter = null;
    this.fullUpkeepPaidLastRound = false;
    this.activeRelics = [];
    this.pendingRelicChoices = [];
    this.hasPendingRelicReward = false;
    this.pendingRelicNextState = null;

    // M15.1 difficulty preset (run-scoped).
    this.selectedDifficulty = null;
    this.difficultyDisplayName = null;
    this.interestDivisor = 0;
    this.debtLimit = 0;
    this.heroHealthMultiplier = 0;
    this.heroDamageMultiplier = 0;
    this.enemyHealthMultiplier = 0;
    this.enemyDamageMultiplier = 0;
  }
}
