// Phase 1 balance harness. Run with:
//   npm.cmd run test:balance -- --seeds=100

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { RunManager } from "../run/RunManager.js";
import { ShopManager } from "../run/ShopManager.js";
import { PayrollManager } from "../run/PayrollManager.js";
import { EncounterManager } from "../run/EncounterManager.js";
import { RivalManager } from "../run/RivalManager.js";
import { CombatManager } from "../combat/CombatManager.js";
import { BalanceRunLogger } from "../run/BalanceRunLogger.js";
import { GreedyStrategy } from "./strategies/greedy.js";

const DefaultSeedCount = 100;
const MaxStepsPerSeed = 1000;

const seedCount = parseSeedCount(process.argv.slice(2));
const firstPass = runSeedSet(seedCount);
const firstTsv = BalanceRunLogger.formatSeedResults(firstPass);
const secondPass = runSeedSet(seedCount);
const secondTsv = BalanceRunLogger.formatSeedResults(secondPass);
const deterministic = firstTsv === secondTsv;

const reportPath = writeReport(firstTsv);
const wins = firstPass.filter((result) => result.outcome === "WIN").length;
const losses = firstPass.length - wins;

console.log(`Balance harness complete: ${seedCount} seeds`);
console.log(`Wins: ${wins}`);
console.log(`Losses: ${losses}`);
console.log(`Report: ${reportPath}`);
console.log(`DETERMINISM CHECK: ${deterministic ? "PASS" : "FAIL"}`);

process.exit(deterministic ? 0 : 1);

function parseSeedCount(args) {
  let seeds = DefaultSeedCount;
  for (const arg of args) {
    if (!arg.startsWith("--seeds=")) {
      failUsage(`Unknown argument: ${arg}`);
    }
    const value = Number(arg.slice("--seeds=".length));
    if (!Number.isInteger(value) || value <= 0) {
      failUsage("--seeds must be a positive integer");
    }
    seeds = value;
  }
  return seeds;
}

function failUsage(message) {
  console.error(message);
  console.error("Usage: npm.cmd run test:balance -- --seeds=100");
  process.exit(1);
}

function runSeedSet(count) {
  const results = [];
  for (let seed = 0; seed < count; seed++) {
    results.push(runSingleSeed(seed));
  }
  return results;
}

function runSingleSeed(seed) {
  const managers = createManagers();
  const run = managers.runManager.initializeRun(GameRules.DefaultDifficultyPreset, seed);
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
        managers.shopManager.generateOffers();
        GreedyStrategy.buyHeroes(managers.shopManager, run);
        state = GameState.Formation;
        break;

      case GameState.Formation:
        state = GameState.Payroll;
        break;

      case GameState.Payroll:
        run.selectedPayrollAction = GreedyStrategy.choosePayrollAction(run);
        managers.payrollManager.apply(run, run.selectedPayrollAction);
        state = GameState.Combat;
        break;

      case GameState.Combat:
        state = resolveCombatRound(managers, run);
        break;

      case GameState.RelicReward:
        state = managers.runManager.selectPendingRelic(GreedyStrategy.chooseRelic(run));
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
        return summarizeSeed(seed, "WIN", maxRound, run);

      case GameState.Defeat:
        return summarizeSeed(seed, "LOSS", maxRound, run);

      default:
        return summarizeSeed(seed, "LOSS", maxRound, run);
    }
  }

  return summarizeSeed(seed, "LOSS", maxRound, run);
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
  const result = managers.combatManager.startCombat(run, run.currentEncounter);
  managers.runManager.applyPostCombatResult(result, run.currentEncounter);
  const nextState = managers.runManager.evaluateNextState();
  BalanceRunLogger.logRound(run, nextState);
  run.selectedPayrollAction = null;

  if (managers.runManager.tryPreparePendingRelicReward(nextState)) {
    return GameState.RelicReward;
  }

  return nextState;
}

function summarizeSeed(seed, outcome, roundsReached, run) {
  return {
    seed,
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

function writeReport(contents) {
  const reportDir = getReportDir();
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `run-${getTimestampForFilename()}.tsv`);
  fs.writeFileSync(reportPath, contents, "utf8");
  return reportPath;
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
