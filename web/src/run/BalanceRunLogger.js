// Ported from DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs
// The Unity version wrote a TSV balance log to disk (a dev tuning tool, not
// gameplay). The web port keeps the API surface so manager calls are unchanged
// but does not write files. Rows are buffered in memory and can be inspected or
// dumped by tooling if needed.

export const BalanceRunLogger = {
  runId: null,
  rows: [],
  combatRows: [],
  seedResultColumns: Object.freeze([
    "seed",
    "strategy",
    "outcome",
    "roundsReached",
    "finalGold",
    "finalDebt",
    "finalMorale",
    "heroes",
    "relics",
    "wins",
    "losses",
    "avgRounds",
    "avgGold",
    "avgDebt",
    "avgMorale",
  ]),

  startRun(_runState) {
    this.runId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    this.rows = [];
  },

  logCombat(run, combatResult, encounterDef) {
    if (!run || !combatResult || !this.runId) return;
    this.combatRows.push({
      seed: run.seed ?? 0,
      strategy: run._balanceStrategy ?? "",
      act: run.act,
      slot: encounterDef ? encounterDef.slot : 0,
      type: encounterDef ? encounterDef.type : "",
      encounterId: encounterDef ? (encounterDef.id || encounterDef.displayName) : "",
      contractRewardGold: run.latestContractRewardGold,
      playerWon: combatResult.playerWon ? 1 : 0,
      combatRoundsElapsed: combatResult.combatRoundsElapsed,
      heroesLost: Array.isArray(combatResult.deadHeroes) ? combatResult.deadHeroes.length : 0,
    });
  },

  formatCombatResults(combatLog) {
    const rows = Array.isArray(combatLog) ? combatLog : [];
    const columns = ["seed", "strategy", "act", "slot", "encounterId", "playerWon", "combatRoundsElapsed", "heroesLost", "contractRewardGold"];
    const lines = [columns.join("\t")];
    for (const row of rows) {
      lines.push(columns.map(c => sanitizeTsvValue(row[c])).join("\t"));
    }
    return `${lines.join("\n")}\n`;
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

  formatSeedResults(seedResults) {
    const safeResults = Array.isArray(seedResults) ? seedResults : [];
    const lines = [this.seedResultColumns.join("\t")];

    for (const result of safeResults) {
      lines.push(formatSeedResultRow(result));
    }

    lines.push(formatSummaryRow(safeResults));
    return `${lines.join("\n")}\n`;
  },
};

function formatSeedResultRow(result) {
  const row = {
    seed: result ? result.seed : "",
    strategy: result ? result.strategy : "",
    outcome: result ? result.outcome : "",
    roundsReached: result ? result.roundsReached : "",
    finalGold: result ? result.finalGold : "",
    finalDebt: result ? result.finalDebt : "",
    finalMorale: result ? result.finalMorale : "",
    heroes: result ? result.heroes : "",
    relics: result ? result.relics : "",
    wins: "",
    losses: "",
    avgRounds: "",
    avgGold: "",
    avgDebt: "",
    avgMorale: "",
  };
  return formatTsvRow(row);
}

function formatSummaryRow(results) {
  let wins = 0;
  let losses = 0;
  let totalRounds = 0;
  let totalGold = 0;
  let totalDebt = 0;
  let totalMorale = 0;

  for (const result of results) {
    if (result.outcome === "WIN") wins += 1;
    else losses += 1;
    totalRounds += result.roundsReached;
    totalGold += result.finalGold;
    totalDebt += result.finalDebt;
    totalMorale += result.finalMorale;
  }

  const count = results.length;
  const row = {
    seed: "SUMMARY",
    strategy: getSummaryStrategy(results),
    outcome: "",
    roundsReached: "",
    finalGold: "",
    finalDebt: "",
    finalMorale: "",
    heroes: "",
    relics: "",
    wins,
    losses,
    avgRounds: formatAverage(totalRounds, count),
    avgGold: formatAverage(totalGold, count),
    avgDebt: formatAverage(totalDebt, count),
    avgMorale: formatAverage(totalMorale, count),
  };
  return formatTsvRow(row);
}

function getSummaryStrategy(results) {
  if (results.length <= 0) return "";
  const first = results[0].strategy;
  for (const result of results) {
    if (result.strategy !== first) return "all";
  }
  return first;
}

function formatTsvRow(row) {
  return BalanceRunLogger.seedResultColumns
    .map((column) => sanitizeTsvValue(row[column]))
    .join("\t");
}

function sanitizeTsvValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[\t\r\n]/g, " ");
}

function formatAverage(total, count) {
  if (count <= 0) return "0.00";
  return (total / count).toFixed(2);
}
