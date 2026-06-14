import { GameRulesFns } from "../core/GameRules.js";
import { EncounterType } from "../data/enums.js";

export const BalanceChallengeFlag = Object.freeze({
  OnTarget: "on-target",
  LowChallenge: "low-challenge",
  HighChallenge: "high-challenge",
  LowSample: "low-sample",
});

export const SurvivorCohortId = Object.freeze({
  AllRuns: "all-runs",
  ReachedAct2: "reached-act-2",
  ReachedAct3: "reached-act-3",
  ReachedAct4: "reached-act-4",
  WinningRuns: "winning-runs",
  LosingRuns: "losing-runs",
});

export const SurvivorCohorts = Object.freeze([
  Object.freeze({ id: SurvivorCohortId.AllRuns, label: "All runs" }),
  Object.freeze({ id: SurvivorCohortId.ReachedAct2, label: "Reached Act 2" }),
  Object.freeze({ id: SurvivorCohortId.ReachedAct3, label: "Reached Act 3" }),
  Object.freeze({ id: SurvivorCohortId.ReachedAct4, label: "Reached Act 4" }),
  Object.freeze({ id: SurvivorCohortId.WinningRuns, label: "Winning runs only" }),
  Object.freeze({ id: SurvivorCohortId.LosingRuns, label: "Losing runs only" }),
]);

export const BalanceTargetBands = Object.freeze([
  Object.freeze({
    id: "act1-dungeon",
    actGroup: "Act 1",
    slotRange: "1-9",
    type: EncounterType.Dungeon,
    minWinRate: 65,
    maxWinRate: 92,
    minAvgRounds: 3.5,
    maxAvgRounds: 7.5,
    minAvgHeroesLost: 0.2,
    maxAvgHeroesLost: 1.6,
    notes: "Act 1 dungeon fights should teach pressure without becoming a wall for fresh parties.",
  }),
  Object.freeze({
    id: "act1-rival",
    actGroup: "Act 1",
    slotRange: "1-9",
    type: EncounterType.RivalGhost,
    minWinRate: 45,
    maxWinRate: 75,
    minAvgRounds: 4,
    maxAvgRounds: 8,
    minAvgHeroesLost: 0.6,
    maxAvgHeroesLost: 2.2,
    notes: "Act 1 rival ghosts are benchmark fights and can be more contested than normal dungeon slots.",
  }),
  Object.freeze({
    id: "act1-boss",
    actGroup: "Act 1",
    slotRange: "10",
    type: EncounterType.FinalBoss,
    minWinRate: 60,
    maxWinRate: 88,
    minAvgRounds: 5,
    maxAvgRounds: 9,
    minAvgHeroesLost: 0.7,
    maxAvgHeroesLost: 2.4,
    notes: "Act 1 boss pressure should be readable but survivable for parties that solved the first act economy.",
  }),
  Object.freeze({
    id: "late-dungeon-early",
    actGroup: "Acts 2-4",
    slotRange: "1-3",
    type: EncounterType.Dungeon,
    minWinRate: 68,
    maxWinRate: 92,
    minAvgRounds: 4,
    maxAvgRounds: 8,
    minAvgHeroesLost: 0.3,
    maxAvgHeroesLost: 1.8,
    notes: "Early late-act dungeon slots should confirm that a surviving party is viable while still costing time or health.",
  }),
  Object.freeze({
    id: "late-dungeon-mid",
    actGroup: "Acts 2-4",
    slotRange: "4-7",
    type: EncounterType.Dungeon,
    minWinRate: 60,
    maxWinRate: 88,
    minAvgRounds: 4.5,
    maxAvgRounds: 8.5,
    minAvgHeroesLost: 0.5,
    maxAvgHeroesLost: 2.2,
    notes: "Mid late-act dungeon slots are the main tuning surface for preventing victory-lap runs.",
  }),
  Object.freeze({
    id: "late-dungeon-late",
    actGroup: "Acts 2-4",
    slotRange: "8-9",
    type: EncounterType.Dungeon,
    minWinRate: 55,
    maxWinRate: 85,
    minAvgRounds: 5,
    maxAvgRounds: 9,
    minAvgHeroesLost: 0.7,
    maxAvgHeroesLost: 2.6,
    notes: "Late dungeon slots should be meaningfully dangerous for strong parties without becoming boss fights.",
  }),
  Object.freeze({
    id: "late-rival",
    actGroup: "Acts 2-4",
    slotRange: "1-9",
    type: EncounterType.RivalGhost,
    minWinRate: 45,
    maxWinRate: 78,
    minAvgRounds: 5,
    maxAvgRounds: 9,
    minAvgHeroesLost: 0.8,
    maxAvgHeroesLost: 2.8,
    notes: "Late rival ghosts should remain contested benchmarks because they represent competing guild progress.",
  }),
  Object.freeze({
    id: "late-boss",
    actGroup: "Acts 2-4",
    slotRange: "10",
    type: EncounterType.FinalBoss,
    minWinRate: 50,
    maxWinRate: 82,
    minAvgRounds: 5.5,
    maxAvgRounds: 10,
    minAvgHeroesLost: 1,
    maxAvgHeroesLost: 3,
    notes: "Late bosses should survive long enough for their mechanics to matter and should sometimes beat reaching parties.",
  }),
]);

const MinSampleForChallengeFlag = 10;

export function getBalanceTargetBand(act, slot, encounterType) {
  const type = encounterType || EncounterType.Dungeon;
  if (act <= 1) {
    if (slot === 10 || type === EncounterType.FinalBoss) return getBandById("act1-boss");
    if (type === EncounterType.RivalGhost) return getBandById("act1-rival");
    return getBandById("act1-dungeon");
  }

  if (slot === 10 || type === EncounterType.FinalBoss) return getBandById("late-boss");
  if (type === EncounterType.RivalGhost) return getBandById("late-rival");
  if (slot >= 8) return getBandById("late-dungeon-late");
  if (slot >= 4) return getBandById("late-dungeon-mid");
  return getBandById("late-dungeon-early");
}

export function classifyEncounterChallenge(summary) {
  const combatCount = Number(summary?.combats ?? 0);
  const act = Number(summary?.act ?? 1);
  const slot = Number(summary?.slot ?? 1);
  const encounterType = summary?.type || EncounterType.Dungeon;
  const winRate = Number(summary?.winRate ?? 0);
  const avgRounds = Number(summary?.avgRounds ?? 0);
  const avgHeroesLost = Number(summary?.avgHeroesLost ?? 0);
  const band = getBalanceTargetBand(act, slot, encounterType);

  if (combatCount > 0 && combatCount < MinSampleForChallengeFlag) {
    return {
      flag: BalanceChallengeFlag.LowSample,
      label: "low sample",
      band,
      reasons: [`${combatCount} combats < ${MinSampleForChallengeFlag} sample floor`],
    };
  }

  const lowReasons = [];
  const highReasons = [];

  if (winRate > band.maxWinRate) lowReasons.push(`win ${formatPct(winRate)} > ${formatPct(band.maxWinRate)}`);
  if (avgRounds < band.minAvgRounds) lowReasons.push(`rounds ${avgRounds.toFixed(2)} < ${band.minAvgRounds.toFixed(1)}`);
  if (avgHeroesLost < band.minAvgHeroesLost) lowReasons.push(`lost ${avgHeroesLost.toFixed(2)} < ${band.minAvgHeroesLost.toFixed(1)}`);

  if (winRate < band.minWinRate) highReasons.push(`win ${formatPct(winRate)} < ${formatPct(band.minWinRate)}`);
  if (avgRounds > band.maxAvgRounds) highReasons.push(`rounds ${avgRounds.toFixed(2)} > ${band.maxAvgRounds.toFixed(1)}`);
  if (avgHeroesLost > band.maxAvgHeroesLost) highReasons.push(`lost ${avgHeroesLost.toFixed(2)} > ${band.maxAvgHeroesLost.toFixed(1)}`);

  if (highReasons.length > 0 && highReasons.length >= lowReasons.length) {
    return { flag: BalanceChallengeFlag.HighChallenge, label: "high challenge", band, reasons: highReasons };
  }
  if (lowReasons.length > 0) {
    return { flag: BalanceChallengeFlag.LowChallenge, label: "low challenge", band, reasons: lowReasons };
  }
  return { flag: BalanceChallengeFlag.OnTarget, label: "target", band, reasons: [] };
}

export function formatTargetBandLabel(band) {
  if (!band) return "";
  return `${band.id} (${formatPct(band.minWinRate)}-${formatPct(band.maxWinRate)} win, ${band.minAvgRounds.toFixed(1)}-${band.maxAvgRounds.toFixed(1)} rounds, ${band.minAvgHeroesLost.toFixed(1)}-${band.maxAvgHeroesLost.toFixed(1)} lost)`;
}

export function getSurvivorCohortIds(result) {
  const roundsReached = Number(result?.roundsReached ?? 0);
  const outcome = result?.outcome || "";
  const cohorts = [SurvivorCohortId.AllRuns];

  if (roundsReached > GameRulesFns.act1FinalRound) cohorts.push(SurvivorCohortId.ReachedAct2);
  if (roundsReached > GameRulesFns.act2FinalRound) cohorts.push(SurvivorCohortId.ReachedAct3);
  if (roundsReached > GameRulesFns.act3FinalRound) cohorts.push(SurvivorCohortId.ReachedAct4);
  if (outcome === "WIN") cohorts.push(SurvivorCohortId.WinningRuns);
  else cohorts.push(SurvivorCohortId.LosingRuns);

  return cohorts;
}

export function summarizeSurvivorCohorts(results) {
  const safeResults = Array.isArray(results) ? results : [];
  return SurvivorCohorts.map((cohort) => {
    const rows = safeResults.filter((result) => getSurvivorCohortIds(result).includes(cohort.id));
    const wins = rows.filter((result) => result.outcome === "WIN").length;
    const losses = rows.length - wins;
    return {
      id: cohort.id,
      label: cohort.label,
      runs: rows.length,
      wins,
      losses,
      winRate: rows.length > 0 ? (wins / rows.length) * 100 : 0,
      medianRounds: median(rows.map((result) => result.roundsReached)),
      avgGold: average(rows.map((result) => result.finalGold)),
      avgDebt: average(rows.map((result) => result.finalDebt)),
      avgMorale: average(rows.map((result) => result.finalMorale)),
    };
  });
}

function getBandById(id) {
  return BalanceTargetBands.find((band) => band.id === id);
}

function formatPct(value) {
  return `${Number(value).toFixed(0)}%`;
}

function median(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
