// Ported from DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs
// The Unity version wrote a TSV balance log to disk (a dev tuning tool, not
// gameplay). The web port keeps the API surface so manager calls are unchanged
// but does not write files. Rows are buffered in memory and can be inspected or
// dumped by tooling if needed.

export const BalanceRunLogger = {
  runId: null,
  rows: [],

  startRun(_runState) {
    this.runId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    this.rows = [];
  },

  logRound(runState, nextState) {
    if (!runState || !this.runId) return;
    const encounter = runState.currentEncounter;
    this.rows.push({
      runId: this.runId,
      round: runState.round,
      encounterName: encounter ? encounter.displayName : "",
      payrollAction: runState.selectedPayrollAction ?? "",
      combatResult: runState.latestCombatWon ? "Win" : "Loss",
      rewardGold: runState.latestRewardGold,
      gold: runState.gold,
      debt: runState.debt,
      morale: runState.morale,
      nextState,
      endReason: runState.latestEndReason ?? "",
    });
  },
};
