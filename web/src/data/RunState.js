// Ported from DungeonDebt/Assets/Scripts/Data/RunState.cs
// SelectedPayrollAction uses null where C# used a nullable PayrollActionId?.
import { EncounterType } from "./enums.js";

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
    this._currentEncounter = null;
    this.latestCompletedEncounter = null;
    this.rivalRaceFinishesThisRound = [];
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
    this.devEnableAct3 = false;

    // M17 shop event state, cleared each shop visit.
    this.currentShopEvent = null;
    this.pendingNextRewardBonus = 0;
  }

  get currentEncounter() { return this._currentEncounter; }

  set currentEncounter(encounter) {
    this._currentEncounter = snapshotRivalLead(this, encounter);
  }
}

function snapshotRivalLead(run, encounter) {
  if (!run || !encounter || encounter.type !== EncounterType.RivalGhost) return encounter;

  let lead = 0;
  for (const rival of run.rivals) {
    if (rival.guild !== encounter.rivalGuild) continue;
    lead = Math.max(0, rival.progress - run.round);
    break;
  }

  return Object.freeze({
    act: encounter.act,
    slot: encounter.slot,
    round: encounter.round,
    variantId: encounter.variantId,
    type: encounter.type,
    displayName: encounter.displayName,
    scoutText: encounter.scoutText,
    dangerCategory: encounter.dangerCategory,
    enemies: encounter.enemies,
    baseGoldReward: encounter.baseGoldReward,
    encounterEffectId: encounter.encounterEffectId,
    rivalGuild: encounter.rivalGuild,
    rivalLead: lead,
  });
}
