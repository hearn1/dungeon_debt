// Ported from DungeonDebt/Assets/Scripts/Run/BalanceRunLogger.cs
// The Unity version wrote a TSV balance log to disk (a dev tuning tool, not
// gameplay). The web port keeps the API surface so manager calls are unchanged
// but does not write files. Rows are buffered in memory and can be inspected or
// dumped by tooling if needed.

import { DefaultCombatRuntimeId } from "../combat/CombatRuntime.js";
import { hexDistance } from "../combat/CombatBoard.js";
import { GameRules } from "../core/GameRules.js";
import { CombatReplayEventKind } from "../data/CombatReplayEvent.js";
import { HeroTier } from "../data/enums.js";

const RangedHeroIds = new Set(["ranger", "ninja"]);

export const BalanceRunLogger = {
  runId: null,
  rows: [],
  combatRows: [],
  economyRows: [],
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
    const rangedThreat = summarizeRangedThreat(combatResult);
    this.combatRows.push({
      seed: getRunSeed(run),
      strategy: run._balanceStrategy ?? "",
      act: run.act,
      slot: encounterDef ? encounterDef.slot : 0,
      type: encounterDef ? encounterDef.type : "",
      encounterId: encounterDef ? (encounterDef.id || encounterDef.displayName) : "",
      combatRuntimeId: combatResult.combatRuntimeId || run.latestCombatRuntimeId || DefaultCombatRuntimeId,
      contractRewardGold: run.latestContractRewardGold,
      veterancyContextBonusXp: run.latestVeterancyContextBonusXp,
      veterancySurvivorXp: run.latestVeterancySurvivorXp,
      rewardQualityRelicChoiceBonus: run.latestRewardQualityRelicChoiceBonus,
      rewardQualityShopSilverChanceBonus: run.latestRewardQualityShopSilverChanceBonus,
      playerWon: combatResult.playerWon ? 1 : 0,
      combatRoundsElapsed: combatResult.combatRoundsElapsed,
      heroesLost: Array.isArray(combatResult.deadHeroes) ? combatResult.deadHeroes.length : 0,
      rangedDamageShare: rangedThreat.rangedDamageShare,
      rangedKillShare: rangedThreat.rangedKillShare,
      avgRangedFirstAttackTick: rangedThreat.avgRangedFirstAttackTick,
      rangedSafeAttackShare: rangedThreat.rangedSafeAttackShare,
      meleeReachedBackline: rangedThreat.meleeReachedBackline,
      backlineDamageTaken: rangedThreat.backlineDamageTaken,
    });
  },

  logShop(run, beforeShop, afterShop) {
    if (!run || !this.runId || !beforeShop || !afterShop) return;
    const partyDiff = summarizePartyDiff(beforeShop.party, afterShop.party);
    const debtPaid = Math.max(0, beforeShop.debt - afterShop.debt);
    const rerollsUsed = Math.max(0, afterShop.rerollCount - beforeShop.rerollCount);
    const rerollCost = GameRules.RerollCost + (beforeShop.rerollCostModifier || 0);
    const totalGoldSpent = Math.max(0, beforeShop.gold - afterShop.gold);
    const rerollSpend = rerollsUsed * rerollCost;
    const shopSpend = Math.max(0, totalGoldSpent - debtPaid);
    const hireSpend = Math.max(0, shopSpend - rerollSpend);
    this.economyRows.push({
      phase: "shop",
      seed: getRunSeed(run),
      strategy: run._balanceStrategy ?? "",
      act: run.act,
      slot: getEncounterSlot(run),
      round: run.round,
      encounterId: getEncounterId(run.currentEncounter),
      goldBefore: beforeShop.gold,
      goldAfter: afterShop.gold,
      debtBefore: beforeShop.debt,
      debtAfter: afterShop.debt,
      moraleBefore: beforeShop.morale,
      moraleAfter: afterShop.morale,
      partySizeBefore: beforeShop.partySize,
      partySizeAfter: afterShop.partySize,
      rerollsUsed,
      debtPaid,
      netGoldDelta: afterShop.gold - beforeShop.gold,
      shopSpend,
      hireSpend,
      rerollSpend,
      premiumPurchases: partyDiff.premiumPurchases,
      mergesOrUpgrades: partyDiff.mergesOrUpgrades,
      newHires: partyDiff.newHires,
      replacements: partyDiff.replacements,
    });
  },

  formatCombatResults(combatLog) {
    const rows = Array.isArray(combatLog) ? combatLog : [];
    const columns = ["seed", "strategy", "act", "slot", "encounterId", "combatRuntimeId", "playerWon", "combatRoundsElapsed", "heroesLost", "contractRewardGold", "veterancyContextBonusXp", "veterancySurvivorXp", "rewardQualityRelicChoiceBonus", "rewardQualityShopSilverChanceBonus", "rangedDamageShare", "rangedKillShare", "avgRangedFirstAttackTick", "rangedSafeAttackShare", "meleeReachedBackline", "backlineDamageTaken"];
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
    this.economyRows.push({
      phase: "combat",
      seed: getRunSeed(runState),
      strategy: runState._balanceStrategy ?? "",
      act: runState.act,
      slot: getEncounterSlot(runState),
      round: runState.round,
      encounterId: getEncounterId(encounter),
      combatRuntimeId: runState.latestCombatRuntimeId || DefaultCombatRuntimeId,
      playerWon: runState.latestCombatWon ? 1 : 0,
      rewardGold: runState.latestRewardGold,
      contractRewardGold: runState.latestContractRewardGold,
      rewardScaleBonusGold: runState.latestRewardScaleBonusGold,
      totalUpkeep: runState.latestTotalUpkeep,
      upkeepShortfall: runState.latestUpkeepShortfall,
      interestCharged: runState.latestInterestCharged,
      interestAddedToDebt: runState.latestInterestAddedToDebt,
      goldAfter: runState.gold,
      debtBefore: runState.latestDebtBeforeCombat,
      debtAfter: runState.debt,
      moraleAfter: runState.morale,
      nextState,
      endReason: runState.latestEndReason ?? "",
    });
  },

  formatEconomyResults(economyLog) {
    const rows = Array.isArray(economyLog) ? economyLog : [];
    const columns = [
      "phase",
      "seed",
      "strategy",
      "act",
      "slot",
      "round",
      "encounterId",
      "combatRuntimeId",
      "goldBefore",
      "goldAfter",
      "debtBefore",
      "debtAfter",
      "moraleBefore",
      "moraleAfter",
      "partySizeBefore",
      "partySizeAfter",
      "rerollsUsed",
      "debtPaid",
      "netGoldDelta",
      "shopSpend",
      "hireSpend",
      "rerollSpend",
      "premiumPurchases",
      "mergesOrUpgrades",
      "newHires",
      "replacements",
      "playerWon",
      "rewardGold",
      "contractRewardGold",
      "rewardScaleBonusGold",
      "totalUpkeep",
      "upkeepShortfall",
      "interestCharged",
      "interestAddedToDebt",
      "nextState",
      "endReason",
    ];
    const lines = [columns.join("\t")];
    for (const row of rows) {
      lines.push(columns.map(c => sanitizeTsvValue(row[c])).join("\t"));
    }
    return `${lines.join("\n")}\n`;
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

function getRunSeed(run) {
  if (!run) return 0;
  return run._balanceSeed ?? run.seed ?? 0;
}

function getEncounterSlot(run) {
  const encounter = run ? run.currentEncounter : null;
  return encounter ? encounter.slot : 0;
}

function getEncounterId(encounter) {
  return encounter ? (encounter.id || encounter.displayName) : "";
}

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

function summarizePartyDiff(beforeParty, afterParty) {
  const before = mapPartyById(beforeParty);
  const after = mapPartyById(afterParty);
  let premiumPurchases = 0;
  let mergesOrUpgrades = 0;
  let newHires = 0;
  let replacements = 0;
  let removed = 0;

  for (const [heroId, beforeHero] of before.entries()) {
    const afterHero = after.get(heroId);
    if (!afterHero) {
      removed += 1;
      continue;
    }
    if (getTierOrdinal(afterHero.tier) > getTierOrdinal(beforeHero.tier)) {
      mergesOrUpgrades += 1;
    }
  }

  for (const [heroId, afterHero] of after.entries()) {
    if (before.has(heroId)) continue;
    newHires += 1;
    if (getTierOrdinal(afterHero.tier) > getTierOrdinal(HeroTier.Bronze)) {
      premiumPurchases += 1;
    }
  }

  replacements = Math.min(removed, newHires);

  return {
    premiumPurchases,
    mergesOrUpgrades,
    newHires,
    replacements,
  };
}

function mapPartyById(party) {
  const mapped = new Map();
  if (!Array.isArray(party)) return mapped;
  for (const hero of party) {
    if (!hero || !hero.id) continue;
    mapped.set(hero.id, hero);
  }
  return mapped;
}

function getTierOrdinal(tier) {
  if (tier === HeroTier.Diamond) return 4;
  if (tier === HeroTier.Gold) return 3;
  if (tier === HeroTier.Silver) return 2;
  return 1;
}

function summarizeRangedThreat(combatResult) {
  const events = Array.isArray(combatResult?.replayEvents) ? combatResult.replayEvents : [];
  const attackStartsByKey = new Map();
  const firstRangedAttackTickByUnit = new Map();
  let playerDamage = 0;
  let rangedDamage = 0;
  let playerKills = 0;
  let rangedKills = 0;
  let rangedAttackStarts = 0;
  let safeRangedAttackStarts = 0;
  let meleeReachedBackline = 0;
  let backlineDamageTaken = 0;

  for (const event of events) {
    if (event.kind === CombatReplayEventKind.AttackStart) {
      attackStartsByKey.set(attackKey(event), event);
      if (isRangedHeroEvent(event)) {
        rangedAttackStarts += 1;
        if (eventDistance(event) > GameRules.DefaultMeleeRange) safeRangedAttackStarts += 1;
      }
      if (!event.attackerIsPlayerSide && event.targetIsPlayerSide && event.targetSlot >= GameRules.FrontlineSlots) {
        if (eventDistance(event) <= GameRules.DefaultMeleeRange) meleeReachedBackline = 1;
      }
      continue;
    }

    if (event.kind !== CombatReplayEventKind.Attack) continue;

    if (event.attackerIsPlayerSide) {
      playerDamage += event.amount || 0;
      if (isRangedHeroEvent(event)) {
        rangedDamage += event.amount || 0;
        if (!firstRangedAttackTickByUnit.has(event.actorUnitId)) {
          firstRangedAttackTickByUnit.set(event.actorUnitId, event.tick);
        }
      }
      if (event.targetHealthAfter === 0) {
        playerKills += 1;
        if (isRangedHeroEvent(event)) rangedKills += 1;
      }
    } else if (event.targetIsPlayerSide && event.targetSlot >= GameRules.FrontlineSlots) {
      backlineDamageTaken += event.amount || 0;
      const start = attackStartsByKey.get(attackKey(event));
      if (start && eventDistance(start) <= GameRules.DefaultMeleeRange) meleeReachedBackline = 1;
    }
  }

  return {
    rangedDamageShare: ratio(rangedDamage, playerDamage),
    rangedKillShare: ratio(rangedKills, playerKills),
    avgRangedFirstAttackTick: average([...firstRangedAttackTickByUnit.values()]),
    rangedSafeAttackShare: ratio(safeRangedAttackStarts, rangedAttackStarts),
    meleeReachedBackline,
    backlineDamageTaken,
  };
}

function isRangedHeroEvent(event) {
  return event && RangedHeroIds.has(event.attackerHeroId);
}

function attackKey(event) {
  return `${event.actorUnitId || ""}|${event.targetUnitId || ""}`;
}

function eventDistance(event) {
  if (!event || !event.sourceCoord || !event.targetCoord) return 0;
  return hexDistance(event.sourceCoord, event.targetCoord);
}

function ratio(part, total) {
  if (!total || total <= 0) return 0;
  return Number((part / total).toFixed(4));
}

function average(values) {
  if (!Array.isArray(values) || values.length <= 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function formatAverage(total, count) {
  if (count <= 0) return "0.00";
  return (total / count).toFixed(2);
}
