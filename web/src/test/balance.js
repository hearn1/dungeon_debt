// Balance harness. Run with:
//   npm.cmd run test:balance -- --seeds=100 --strategy=smart

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { RelicId } from "../data/enums.js";
import { RunManager } from "../run/RunManager.js";
import { ShopManager } from "../run/ShopManager.js";
import { PayrollManager } from "../run/PayrollManager.js";
import { EncounterManager } from "../run/EncounterManager.js";
import { RivalManager } from "../run/RivalManager.js";
import { CombatManager } from "../combat/CombatManager.js";
import { DefaultCombatRuntimeId } from "../combat/CombatRuntime.js";
import { BalanceRunLogger } from "../run/BalanceRunLogger.js";
import { BalanceChallengeFlag, classifyEncounterChallenge, formatTargetBandLabel } from "./BalanceTargets.js";
import { GreedyStrategy } from "./strategies/greedy.js";
import { FrugalStrategy } from "./strategies/frugal.js";
import { SmartStrategy } from "./strategies/smart.js";
import { RandomStrategy } from "./strategies/random.js";

const DefaultSeedCount = 100;
const MaxStepsPerSeed = 1000;
const StrategyById = Object.freeze({
  [GreedyStrategy.id]: GreedyStrategy,
  [FrugalStrategy.id]: FrugalStrategy,
  [SmartStrategy.id]: SmartStrategy,
  [RandomStrategy.id]: RandomStrategy,
});

const options = parseOptions(process.argv.slice(2));
const strategies = resolveStrategies(options.strategy);

BalanceRunLogger.combatRows = [];
BalanceRunLogger.economyRows = [];
const firstPass = runSeedSet(options.seedCount, strategies);
const firstTsv = BalanceRunLogger.formatSeedResults(firstPass);
const firstCombatLog = [...BalanceRunLogger.combatRows];
const firstCombatTsv = BalanceRunLogger.formatCombatResults(firstCombatLog);
const firstEconomyLog = [...BalanceRunLogger.economyRows];
const firstEconomyTsv = BalanceRunLogger.formatEconomyResults(firstEconomyLog);

BalanceRunLogger.combatRows = [];
BalanceRunLogger.economyRows = [];
const secondPass = runSeedSet(options.seedCount, strategies);
const secondTsv = BalanceRunLogger.formatSeedResults(secondPass);
const secondCombatTsv = BalanceRunLogger.formatCombatResults(BalanceRunLogger.combatRows);
const secondEconomyTsv = BalanceRunLogger.formatEconomyResults(BalanceRunLogger.economyRows);
const deterministic = firstTsv === secondTsv
  && firstCombatTsv === secondCombatTsv
  && firstEconomyTsv === secondEconomyTsv;

const runTimestamp = getTimestampForFilename();
const reportPath = writeTsvFile(firstTsv, runTimestamp);
const combatPath = writeCombatTsvFile(firstCombatTsv, runTimestamp);
const economyPath = writeEconomyTsvFile(firstEconomyTsv, runTimestamp);
const wins = firstPass.filter((result) => result.outcome === "WIN").length;
const losses = firstPass.length - wins;

if (options.report) {
  const mdContent = buildMarkdownReport(firstPass, firstCombatLog, firstEconomyLog, options, runTimestamp);
  const mdPath = writeMarkdownFile(mdContent, runTimestamp);
  console.log(`Markdown: ${mdPath}`);
}

console.log(`Balance harness complete: ${options.seedCount} seeds`);
console.log(`Strategies: ${strategies.map((strategy) => strategy.id).join(", ")}`);
console.log(`Wins: ${wins}`);
console.log(`Losses: ${losses}`);
console.log(`Report: ${reportPath}`);
console.log(`Combat: ${combatPath}`);
console.log(`Economy: ${economyPath}`);
console.log(`DETERMINISM CHECK: ${deterministic ? "PASS" : "FAIL"}`);

process.exit(deterministic ? 0 : 1);

function parseOptions(args) {
  let seeds = DefaultSeedCount;
  let strategy = GreedyStrategy.id;

  let report = false;

  for (const arg of args) {
    if (arg.startsWith("--seeds=")) {
      const value = Number(arg.slice("--seeds=".length));
      if (!Number.isInteger(value) || value <= 0) {
        failUsage("--seeds must be a positive integer");
      }
      seeds = value;
    } else if (arg.startsWith("--strategy=")) {
      strategy = arg.slice("--strategy=".length);
      if (!isKnownStrategyArg(strategy)) {
        failUsage("--strategy must be greedy, frugal, smart, random, or all");
      }
    } else if (arg === "--report") {
      report = true;
    } else {
      failUsage(`Unknown argument: ${arg}`);
    }
  }

  return { seedCount: seeds, strategy, report };
}

function isKnownStrategyArg(strategy) {
  return strategy === "all" || Object.prototype.hasOwnProperty.call(StrategyById, strategy);
}

function resolveStrategies(strategyArg) {
  if (strategyArg === "all") {
    return [GreedyStrategy, FrugalStrategy, SmartStrategy, RandomStrategy];
  }
  return [StrategyById[strategyArg]];
}

function failUsage(message) {
  console.error(message);
  console.error("Usage: npm.cmd run test:balance -- --seeds=100 --strategy=greedy [--report]");
  process.exit(1);
}

function runSeedSet(count, selectedStrategies) {
  const results = [];
  for (let seed = 0; seed < count; seed++) {
    for (const strategy of selectedStrategies) {
      results.push(runSingleSeed(seed, strategy));
    }
  }
  return results;
}

function runSingleSeed(seed, strategy) {
  const managers = createManagers();
  const run = managers.runManager.initializeRun(GameRules.DefaultDifficultyPreset, seed);
  run._balanceSeed = seed;
  run._balanceStrategy = strategy.id;
  const context = createStrategyContext(strategy, seed);
  let state = GameState.Scout;
  let maxRound = run.round;
  let steps = 0;

  while (steps < MaxStepsPerSeed) {
    steps += 1;
    maxRound = Math.max(maxRound, run.round);

    switch (state) {
      case GameState.Scout:
        managers.encounterManager.loadEncounter(run.round);
        state = GameState.Shop;
        break;

      case GameState.Shop:
        const beforeShop = snapshotShopState(run);
        managers.shopManager.generateOffers();
        strategy.visitShop(managers.shopManager, run, context);
        BalanceRunLogger.logShop(run, beforeShop, snapshotShopState(run));
        state = GameState.Formation;
        break;

      case GameState.Formation:
        state = GameState.Payroll;
        break;

      case GameState.Payroll:
        run.selectedPayrollAction = strategy.choosePayrollAction(run, context);
        managers.payrollManager.apply(run, run.selectedPayrollAction);
        state = GameState.Combat;
        break;

      case GameState.Combat:
        state = resolveCombatRound(managers, run);
        break;

      case GameState.RelicReward:
        state = managers.runManager.selectPendingRelic(strategy.chooseRelic(run, context));
        break;

      case GameState.RivalUpdate:
        managers.rivalManager.advanceRivals(run);
        managers.runManager.advanceRound();
        state = GameState.Scout;
        break;

      case GameState.Victory:
        if (run.act < GameRulesFns.totalActs) {
          managers.runManager.advanceToNextAct();
          state = GameState.Scout;
          break;
        }
        return summarizeSeed(seed, strategy.id, "WIN", maxRound, run);

      case GameState.Defeat:
        return summarizeSeed(seed, strategy.id, "LOSS", maxRound, run);

      default:
        return summarizeSeed(seed, strategy.id, "LOSS", maxRound, run);
    }
  }

  return summarizeSeed(seed, strategy.id, "LOSS", maxRound, run);
}

function createStrategyContext(strategy, seed) {
  if (!strategy || typeof strategy.createContext !== "function") return {};
  return strategy.createContext(seed);
}

function createManagers() {
  const payrollManager = new PayrollManager();
  const rivalManager = new RivalManager();
  const runManager = new RunManager(payrollManager, rivalManager);
  return {
    payrollManager,
    rivalManager,
    runManager,
    shopManager: new ShopManager(runManager),
    encounterManager: new EncounterManager(runManager),
    combatManager: new CombatManager(),
  };
}

function resolveCombatRound(managers, run) {
  const enc = run.currentEncounter;
  const result = managers.combatManager.startCombat(run, enc);
  managers.runManager.applyPostCombatResult(result, enc);
  const nextState = managers.runManager.evaluateNextState();
  BalanceRunLogger.logRound(run, nextState);
  BalanceRunLogger.logCombat(run, result, enc);
  run.selectedPayrollAction = null;

  if (managers.runManager.tryPreparePendingRelicReward(nextState)) {
    return GameState.RelicReward;
  }

  return nextState;
}

function summarizeSeed(seed, strategy, outcome, roundsReached, run) {
  return {
    seed,
    strategy,
    outcome,
    roundsReached,
    finalGold: run.gold,
    finalDebt: run.debt,
    finalMorale: run.morale,
    heroes: formatHeroes(run),
    relics: run.activeRelics.join(","),
  };
}

function formatHeroes(run) {
  return run.party
    .map((hero) => `${hero.definition.id}:${hero.tier}`)
    .join(",");
}

function writeTsvFile(contents, timestamp) {
  const reportDir = getReportDir();
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `run-${timestamp}.tsv`);
  fs.writeFileSync(reportPath, contents, "utf8");
  return reportPath;
}

function writeCombatTsvFile(contents, timestamp) {
  const reportDir = getReportDir();
  fs.mkdirSync(reportDir, { recursive: true });
  const combatPath = path.join(reportDir, `combat-${timestamp}.tsv`);
  fs.writeFileSync(combatPath, contents, "utf8");
  return combatPath;
}

function writeEconomyTsvFile(contents, timestamp) {
  const reportDir = getReportDir();
  fs.mkdirSync(reportDir, { recursive: true });
  const economyPath = path.join(reportDir, `economy-${timestamp}.tsv`);
  fs.writeFileSync(economyPath, contents, "utf8");
  return economyPath;
}

function writeMarkdownFile(contents, timestamp) {
  const reportDir = getReportDir();
  fs.mkdirSync(reportDir, { recursive: true });
  const mdPath = path.join(reportDir, `run-${timestamp}.md`);
  fs.writeFileSync(mdPath, contents, "utf8");
  return mdPath;
}

function buildMarkdownReport(results, combatLog, economyLog, options, timestamp) {
  const lines = [];
  const wins = results.filter((r) => r.outcome === "WIN").length;
  const losses = results.length - wins;
  const winRate = results.length > 0 ? ((wins / results.length) * 100).toFixed(1) : "0.0";

  lines.push(`# Balance Report — ${timestamp}`, "");

  lines.push("## Configuration");
  lines.push(`- Seeds: ${options.seedCount}`);
  lines.push(`- Strategy: ${options.strategy}`);
  lines.push(`- Difficulty: ${GameRules.DefaultDifficultyPreset}`);
  lines.push(`- Combat runtime: ${getReportRuntimeLabel(combatLog)}`);
  lines.push(`- Date: ${new Date().toISOString()}`);
  lines.push("");

  lines.push("## Overview");
  lines.push(`- Total runs: ${results.length}`);
  lines.push(`- Wins: ${wins}`);
  lines.push(`- Losses: ${losses}`);
  lines.push(`- Win rate: ${winRate}%`);
  lines.push("");

  const uniqueStrategies = [...new Set(results.map((r) => r.strategy))];
  if (uniqueStrategies.length > 1) {
    lines.push("## Per-Strategy Breakdown");
    lines.push("| Strategy | Runs | Wins | Losses | Win Rate | Median Rounds | Avg Gold | Avg Debt |");
    lines.push("|---|---|---|---|---|---|---|---|");
    for (const strat of uniqueStrategies) {
      const sr = results.filter((r) => r.strategy === strat);
      const sw = sr.filter((r) => r.outcome === "WIN").length;
      lines.push(
        `| ${strat} | ${sr.length} | ${sw} | ${sr.length - sw} | ${pct(sw, sr.length)} | ${median(sr.map((r) => r.roundsReached))} | ${avg(sr.map((r) => r.finalGold))} | ${avg(sr.map((r) => r.finalDebt))} |`
      );
    }
    lines.push(
      `| **Overall** | ${results.length} | ${wins} | ${losses} | ${winRate}% | ${median(results.map((r) => r.roundsReached))} | ${avg(results.map((r) => r.finalGold))} | ${avg(results.map((r) => r.finalDebt))} |`
    );
    lines.push("");
  }

  const heroTally = tallyHeroes(results);
  const sortedHeroes = Object.entries(heroTally).sort((a, b) => b[1].count - a[1].count);
  lines.push("## Top 10 Most Hired Heroes");
  lines.push("| Hero ID | Total Picks | Avg Final Tier |");
  lines.push("|---|---|---|");
  for (const [heroId, stats] of sortedHeroes.slice(0, 10)) {
    lines.push(`| ${heroId} | ${stats.count} | ${(stats.totalTier / stats.count).toFixed(2)} |`);
  }
  lines.push("");

  const hireThreshold = results.length * 0.05;
  const belowThreshold = sortedHeroes.filter(([, s]) => s.count < hireThreshold).map(([id]) => id);
  lines.push("## Heroes Below 5% Hire Rate");
  lines.push(belowThreshold.length > 0 ? belowThreshold.join(", ") : "None");
  lines.push("");

  const relicTally = tallyRelics(results);
  const sortedRelics = Object.entries(relicTally).sort((a, b) => b[1] - a[1]);
  const zeroRelics = Object.values(RelicId).filter((id) => !relicTally[id]);
  lines.push("## Relic Analysis");
  lines.push("**Top 5 most-picked relics:**");
  for (const [relicId, count] of sortedRelics.slice(0, 5)) {
    lines.push(`- ${relicId}: ${count}`);
  }
  if (zeroRelics.length > 0) {
    lines.push("");
    lines.push(`**Relics with 0 selections:** ${zeroRelics.join(", ")}`);
  }
  lines.push("");

  const act1Threshold = GameRulesFns.act1FinalRound;
  const lossResults = results.filter((r) => r.outcome !== "WIN");
  const act1Losses = lossResults.filter((r) => r.roundsReached <= act1Threshold).length;
  const act2Losses = lossResults.filter((r) => r.roundsReached > act1Threshold).length;
  lines.push("## Act 1 vs Act 2 Loss Split");
  lines.push(`- Act 1 losses (rounds ≤ ${act1Threshold}): ${act1Losses}`);
  lines.push(`- Act 2 losses (rounds > ${act1Threshold}): ${act2Losses}`);
  lines.push("");

  if (Array.isArray(economyLog) && economyLog.length > 0) {
    appendEconomySummary(lines, economyLog);
  }

  const byGold = [...results].sort((a, b) => b.finalGold - a.finalGold);
  lines.push("## Top 5 Outlier Seeds");
  lines.push("**Highest final gold:**");
  for (const r of byGold.slice(0, 5)) {
    lines.push(`- Seed ${r.seed} (${r.strategy}): ${r.finalGold} gold, ${r.outcome}`);
  }
  lines.push("");
  lines.push("**Lowest final gold:**");
  for (const r of byGold.slice(-5).reverse()) {
    lines.push(`- Seed ${r.seed} (${r.strategy}): ${r.finalGold} gold, ${r.outcome}`);
  }
  lines.push("");

  if (Array.isArray(combatLog) && combatLog.length > 0) {
    const summaries = summarizeCombatLog(combatLog);
    const challengeCounts = summarizeChallengeFlags(summaries);

    lines.push("## Challenge Flag Summary");
    lines.push("| Act | Encounters | Low Challenge | High Challenge | On Target | Low Sample |");
    lines.push("|---|---:|---:|---:|---:|---:|");
    for (const act of Object.keys(challengeCounts).sort((a, b) => Number(a) - Number(b))) {
      const counts = challengeCounts[act];
      lines.push(`| ${act} | ${counts.total} | ${counts.lowChallenge} | ${counts.highChallenge} | ${counts.onTarget} | ${counts.lowSample} |`);
    }
    lines.push("");

    lines.push("## Combat Outcomes");
    lines.push("| Encounter | Combats | Win Rate | Avg Rounds | Avg Heroes Lost | Avg Contract Reward | Avg XP Bonus | Avg Relic Option Bonus | Avg Silver Odds Bonus | Ranged Dmg Share | Safe Ranged Share | Melee Reached Backline | Backline Damage | Act | Slot | Type | Target Band | Flag | Reasons |");
    lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|");
    for (const summary of summaries) {
      const classification = classifyEncounterChallenge(summary);
      lines.push(
        `| ${summary.encounterId} | ${summary.combats} | ${summary.winRate.toFixed(1)}% | ${summary.avgRounds.toFixed(2)} | ${summary.avgHeroesLost.toFixed(2)} | ${summary.avgContractReward.toFixed(2)} | ${summary.avgVeterancyContextBonusXp.toFixed(2)} | ${summary.avgRewardQualityRelicChoiceBonus.toFixed(2)} | ${summary.avgRewardQualityShopSilverChanceBonus.toFixed(2)} | ${summary.avgRangedDamageShare.toFixed(2)} | ${summary.avgRangedSafeAttackShare.toFixed(2)} | ${summary.meleeReachedBacklineRate.toFixed(2)} | ${summary.avgBacklineDamageTaken.toFixed(2)} | ${summary.act} | ${summary.slot} | ${summary.type} | ${formatTargetBandLabel(classification.band)} | ${classification.label} | ${classification.reasons.join("; ") || "-"} |`
      );
    }
    lines.push("");

    const safeRangedFights = summaries.filter((summary) =>
      summary.avgRangedDamageShare > 0 && summary.avgRangedSafeAttackShare >= 1 && summary.meleeReachedBacklineRate <= 0);
    if (safeRangedFights.length > 0) {
      lines.push("## Ranged Safety Flags");
      lines.push("| Encounter | Ranged Dmg Share | Safe Ranged Share | Backline Damage |");
      lines.push("|---|---:|---:|---:|");
      for (const summary of safeRangedFights) {
        lines.push(`| ${summary.encounterId} | ${summary.avgRangedDamageShare.toFixed(2)} | ${summary.avgRangedSafeAttackShare.toFixed(2)} | ${summary.avgBacklineDamageTaken.toFixed(2)} |`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function snapshotShopState(run) {
  return {
    gold: run.gold,
    debt: run.debt,
    morale: run.morale,
    partySize: run.party.length,
    rerollCount: run.rerollCount,
  };
}

function appendEconomySummary(lines, economyLog) {
  const shopRows = economyLog.filter((row) => row.phase === "shop");
  const combatRows = economyLog.filter((row) => row.phase === "combat");
  const acts = [...new Set(economyLog.map((row) => Number(row.act)))].sort((a, b) => a - b);

  lines.push("## Economy Pressure Summary");
  lines.push("| Act | Shops | Avg Gold Before Shop | Avg Gold After Shop | Avg Shop Gold Delta | Avg Debt Paid | Debt Payment Rate | Avg Rerolls | Avg Debt After Shop |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const act of acts) {
    const rows = shopRows.filter((row) => Number(row.act) === act);
    if (rows.length <= 0) continue;
    const debtPaymentRows = rows.filter((row) => (row.debtPaid || 0) > 0).length;
    lines.push(`| ${act} | ${rows.length} | ${avg(rows.map((row) => row.goldBefore || 0))} | ${avg(rows.map((row) => row.goldAfter || 0))} | ${avg(rows.map((row) => row.netGoldDelta || 0))} | ${avg(rows.map((row) => row.debtPaid || 0))} | ${pct(debtPaymentRows, rows.length)} | ${avg(rows.map((row) => row.rerollsUsed || 0))} | ${avg(rows.map((row) => row.debtAfter || 0))} |`);
  }
  lines.push("");

  lines.push("## Reward / Debt Settlement Summary");
  lines.push("| Act | Combats | Avg Reward | Avg Contract Reward | Avg Gold After Settlement | Avg Debt Before Combat | Avg Debt After Settlement | Avg Upkeep | Avg Upkeep Shortfall | Avg Interest | Avg Interest To Debt |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const act of acts) {
    const rows = combatRows.filter((row) => Number(row.act) === act);
    if (rows.length <= 0) continue;
    lines.push(`| ${act} | ${rows.length} | ${avg(rows.map((row) => row.rewardGold || 0))} | ${avg(rows.map((row) => row.contractRewardGold || 0))} | ${avg(rows.map((row) => row.goldAfter || 0))} | ${avg(rows.map((row) => row.debtBefore || 0))} | ${avg(rows.map((row) => row.debtAfter || 0))} | ${avg(rows.map((row) => row.totalUpkeep || 0))} | ${avg(rows.map((row) => row.upkeepShortfall || 0))} | ${avg(rows.map((row) => row.interestCharged || 0))} | ${avg(rows.map((row) => row.interestAddedToDebt || 0))} |`);
  }
  lines.push("");

  lines.push("## Act Boundary Economy");
  lines.push("| Act | Start Samples | Avg Start Gold | Avg Start Debt | Avg Start Morale | End Samples | Avg End Gold | Avg End Debt | Avg End Morale |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const act of acts) {
    const startRows = shopRows.filter((row) => Number(row.act) === act && Number(row.slot) === 1);
    const finalSlot = GameRulesFns.getRoundsInAct(act);
    const endRows = combatRows.filter((row) => Number(row.act) === act && Number(row.slot) === finalSlot);
    lines.push(`| ${act} | ${startRows.length} | ${avg(startRows.map((row) => row.goldBefore || 0))} | ${avg(startRows.map((row) => row.debtBefore || 0))} | ${avg(startRows.map((row) => row.moraleBefore || 0))} | ${endRows.length} | ${avg(endRows.map((row) => row.goldAfter || 0))} | ${avg(endRows.map((row) => row.debtAfter || 0))} | ${avg(endRows.map((row) => row.moraleAfter || 0))} |`);
  }
  lines.push("");
}

function summarizeCombatLog(combatLog) {
  const byEncounter = groupBy(combatLog, (row) => [
    row.act ?? 0,
    row.slot ?? 0,
    row.type ?? "",
    row.encounterId ?? "",
  ].join("|"));

  return Object.values(byEncounter)
    .map((rows) => {
      const first = rows[0] || {};
      const combats = rows.length;
      const wins = rows.filter((r) => r.playerWon === 1).length;
      return {
        encounterId: first.encounterId || "",
        act: Number(first.act ?? 0),
        slot: Number(first.slot ?? 0),
        type: first.type || "",
        combats,
        winRate: combats > 0 ? (wins / combats) * 100 : 0,
        avgRounds: Number(avg(rows.map((r) => r.combatRoundsElapsed))),
        avgHeroesLost: Number(avg(rows.map((r) => r.heroesLost))),
        avgContractReward: Number(avg(rows.map((r) => r.contractRewardGold || 0))),
        avgVeterancyContextBonusXp: Number(avg(rows.map((r) => r.veterancyContextBonusXp || 0))),
        avgRewardQualityRelicChoiceBonus: Number(avg(rows.map((r) => r.rewardQualityRelicChoiceBonus || 0))),
        avgRewardQualityShopSilverChanceBonus: Number(avg(rows.map((r) => r.rewardQualityShopSilverChanceBonus || 0))),
        avgRangedDamageShare: Number(avg(rows.map((r) => r.rangedDamageShare || 0))),
        avgRangedKillShare: Number(avg(rows.map((r) => r.rangedKillShare || 0))),
        avgRangedFirstAttackTick: Number(avg(rows.map((r) => r.avgRangedFirstAttackTick || 0))),
        avgRangedSafeAttackShare: Number(avg(rows.map((r) => r.rangedSafeAttackShare || 0))),
        meleeReachedBacklineRate: Number(avg(rows.map((r) => r.meleeReachedBackline || 0))),
        avgBacklineDamageTaken: Number(avg(rows.map((r) => r.backlineDamageTaken || 0))),
      };
    })
    .sort(compareEncounterSummaries);
}

function summarizeChallengeFlags(summaries) {
  const counts = {};
  for (const summary of summaries) {
    const act = String(summary.act);
    if (!counts[act]) {
      counts[act] = { total: 0, lowChallenge: 0, highChallenge: 0, onTarget: 0, lowSample: 0 };
    }
    const classification = classifyEncounterChallenge(summary);
    counts[act].total += 1;
    if (classification.flag === BalanceChallengeFlag.LowChallenge) counts[act].lowChallenge += 1;
    else if (classification.flag === BalanceChallengeFlag.HighChallenge) counts[act].highChallenge += 1;
    else if (classification.flag === BalanceChallengeFlag.LowSample) counts[act].lowSample += 1;
    else counts[act].onTarget += 1;
  }
  return counts;
}

function compareEncounterSummaries(a, b) {
  if (a.act !== b.act) return a.act - b.act;
  if (a.slot !== b.slot) return a.slot - b.slot;
  return a.encounterId.localeCompare(b.encounterId);
}

function getReportRuntimeLabel(combatLog) {
  const runtimeIds = [...new Set((combatLog || [])
    .map((row) => row.combatRuntimeId)
    .filter(Boolean))];
  if (runtimeIds.length === 0) return DefaultCombatRuntimeId;
  return runtimeIds.join(", ");
}

function groupBy(arr, keyFn) {
  const out = {};
  for (const item of arr) {
    const k = keyFn(item);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}

function tallyHeroes(results) {
  const tierOrdinal = Object.freeze({ Bronze: 1, Silver: 2, Gold: 3, Diamond: 4 });
  const tally = {};
  for (const result of results) {
    if (!result.heroes) continue;
    for (const pair of result.heroes.split(",")) {
      if (!pair) continue;
      const colonIdx = pair.lastIndexOf(":");
      if (colonIdx < 0) continue;
      const heroId = pair.slice(0, colonIdx);
      const tierStr = pair.slice(colonIdx + 1);
      if (!heroId) continue;
      const tierNum = tierOrdinal[tierStr] ?? 1;
      if (!tally[heroId]) tally[heroId] = { count: 0, totalTier: 0 };
      tally[heroId].count += 1;
      tally[heroId].totalTier += tierNum;
    }
  }
  return tally;
}

function tallyRelics(results) {
  const tally = {};
  for (const result of results) {
    if (!result.relics) continue;
    for (const relicId of result.relics.split(",")) {
      if (!relicId) continue;
      tally[relicId] = (tally[relicId] ?? 0) + 1;
    }
  }
  return tally;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
    : sorted[mid];
}

function avg(values) {
  if (values.length === 0) return "0.00";
  return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2);
}

function pct(wins, total) {
  return total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : "0.0%";
}

function getReportDir() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../balance-reports");
}

function getTimestampForFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hour = pad2(now.getHours());
  const minute = pad2(now.getMinutes());
  const second = pad2(now.getSeconds());
  return `${year}${month}${day}-${hour}${minute}${second}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}
