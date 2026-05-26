// Ported from DungeonDebt/Assets/Scripts/Run/RunManager.cs
// Owns the single seeded RNG for the run and all economy/state math. The static
// relic/health helpers live in heroStats.js (shared with the combat engine) and
// are re-exposed here as statics for parity with the C# call sites.

import { Rng } from "../core/Rng.js";
import { RunState } from "../data/RunState.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { GameState } from "../core/GameState.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";
import { HeroEffects } from "../combat/HeroEffects.js";
import { BalanceRunLogger } from "./BalanceRunLogger.js";
import {
  EncounterType, EncounterEffectId, PayrollActionId, RelicId,
} from "../data/enums.js";
import {
  hasRelic, getRelicAttackBonus, getRelicMaxHealthBonus, getScaledHeroMaxHealth,
} from "./heroStats.js";

export class RunManager {
  constructor(payrollManager = null, rivalManager = null) {
    this._payrollManager = payrollManager;
    this._rivalManager = rivalManager;
    this._rng = null;
    this._currentRunState = null;
  }

  initialize(payrollManager, rivalManager = null) {
    this._payrollManager = payrollManager;
    if (rivalManager !== null) this._rivalManager = rivalManager;
  }

  get currentRunState() { return this._currentRunState; }
  get rng() { return this._rng; }

  // Static relic/health helpers (delegating to the shared module).
  static hasRelic(runState, relicId) { return hasRelic(runState, relicId); }
  static getRelicAttackBonus(runState, hero) { return getRelicAttackBonus(runState, hero); }
  static getRelicMaxHealthBonus(runState, hero) { return getRelicMaxHealthBonus(runState, hero); }
  static getScaledHeroMaxHealth(hero, runState) { return getScaledHeroMaxHealth(hero, runState); }

  initializeRun(presetId = GameRules.DefaultDifficultyPreset, seed = null) {
    this._rng = new Rng(seed);

    const preset = DataRepository.getDifficultyPreset(presetId);

    const runState = new RunState();
    runState.act = 1;
    runState.round = 1;
    runState.selectedDifficulty = preset.id;
    runState.difficultyDisplayName = preset.displayName;
    runState.gold = preset.startingGold;
    runState.debt = preset.startingDebt;
    runState.morale = preset.startingMorale;
    runState.interestDivisor = preset.interestDivisor;
    runState.debtLimit = preset.debtLimit;
    runState.heroHealthMultiplier = preset.heroHealthMult;
    runState.heroDamageMultiplier = preset.heroDamageMult;
    runState.enemyHealthMultiplier = preset.enemyHealthMult;
    runState.enemyDamageMultiplier = preset.enemyDamageMult;
    runState.rerollCount = 0;
    runState.selectedPayrollAction = null;
    runState.fullUpkeepPaidLastRound = false;
    runState.latestVeterancySummary = "";

    this._currentRunState = runState;
    if (this._rivalManager) {
      this._rivalManager.initializeRivals(this._currentRunState);
    } else {
      const rivals = DataRepository.createRivalGuilds();
      for (const rival of rivals) this._currentRunState.rivals.push(rival);
    }

    BalanceRunLogger.startRun(this._currentRunState);
    return this._currentRunState;
  }

  applyPostCombatResult(combatResult, encounter) {
    const run = this._currentRunState;
    if (!run || !combatResult) return;

    run.latestCompletedEncounter = encounter;
    const isRivalGhost = encounter && encounter.type === EncounterType.RivalGhost;
    let rewardGold = combatResult.playerWon ? GameRules.WinReward : GameRules.LossReward;
    if (combatResult.playerWon && isRivalGhost) rewardGold += GameRules.RivalWinBonus;

    const lossMorale = isRivalGhost ? GameRules.RivalLossMorale : GameRules.DungeonLossMorale;
    const moraleChange = combatResult.playerWon ? 0 : -lossMorale;

    if (combatResult.survivorFlags) {
      if (combatResult.survivorFlags["goblinStoleGold"]) rewardGold -= GameRules.GoblinThiefStealGold;
      if (combatResult.survivorFlags["treasureLeechSurvived"]) rewardGold -= GameRules.TreasureLeechStealGold;
    }
    if (rewardGold < 0) rewardGold = 0;

    const relicRewardGold = hasRelic(run, RelicId.GuildDividend) ? GameRules.GuildDividendRewardGold : 0;
    rewardGold += relicRewardGold;

    run.gold += rewardGold;
    run.morale += moraleChange;

    if (this._payrollManager) {
      this._payrollManager.applyPostCombat(run, combatResult);
    }

    const totalUpkeep = calculateTotalUpkeep(run, encounter);
    let upkeepPaid = totalUpkeep;
    let upkeepShortfall = 0;

    if (run.gold >= totalUpkeep) {
      run.gold -= totalUpkeep;
    } else {
      upkeepPaid = run.gold;
      upkeepShortfall = totalUpkeep - run.gold;
      run.gold = 0;
      run.debt += upkeepShortfall;
    }

    const interestCharged = Math.ceil(run.debt / run.interestDivisor);
    let interestPaid = interestCharged;
    let interestAddedToDebt = 0;

    if (run.gold >= interestCharged) {
      run.gold -= interestCharged;
    } else {
      interestPaid = run.gold;
      interestAddedToDebt = interestCharged - run.gold;
      run.debt += interestAddedToDebt;
      run.gold = 0;
    }

    const veterancySummary = awardVeterancyXp(run, combatResult, encounter);

    run.hasLatestRewardSummary = true;
    run.latestCombatWon = combatResult.playerWon;
    run.latestRewardGold = rewardGold;
    run.latestRelicRewardGold = relicRewardGold;
    run.latestMoraleChange = moraleChange;
    run.latestTotalUpkeep = totalUpkeep;
    run.latestUpkeepPaid = upkeepPaid;
    run.latestUpkeepShortfall = upkeepShortfall;
    run.latestInterestCharged = interestCharged;
    run.latestInterestPaid = interestPaid;
    run.latestInterestAddedToDebt = interestAddedToDebt;
    run.latestVeterancySummary = veterancySummary;
    run.fullUpkeepPaidLastRound = (upkeepShortfall === 0);

    if (this._payrollManager) {
      this._payrollManager.revertPerCombatHeroStats(run);
    }

    resetPartyTierStats(run);
  }

  tryPreparePendingRelicReward(nextState) {
    const run = this._currentRunState;
    if (!run) return false;

    this._clearPendingRelicReward();

    if (nextState === GameState.Defeat || !run.latestCombatWon) return false;

    const encounter = run.latestCompletedEncounter;
    if (!isRelicEligibleEncounter(encounter)) return false;

    const availableRelics = [];
    for (const relic of DataRepository.allRelics) {
      if (!hasRelic(run, relic.id)) availableRelics.push(relic.id);
    }
    if (availableRelics.length <= 0) return false;

    if (!this._rng) this._rng = new Rng();

    let choiceCount = GameRules.RelicChoiceCount;
    if (choiceCount > availableRelics.length) choiceCount = availableRelics.length;

    for (let i = 0; i < choiceCount; i++) {
      const index = this._rng.next(availableRelics.length);
      run.pendingRelicChoices.push(availableRelics[index]);
      availableRelics.splice(index, 1);
    }

    run.pendingRelicNextState = nextState;
    run.hasPendingRelicReward = true;
    return true;
  }

  selectPendingRelic(relicId) {
    const run = this._currentRunState;
    if (!run || !run.hasPendingRelicReward) return GameState.MainMenu;

    const nextState = run.pendingRelicNextState;
    if (this._isPendingRelicChoice(relicId) && !hasRelic(run, relicId)) {
      run.activeRelics.push(relicId);
    }

    this._clearPendingRelicReward();
    return nextState;
  }

  evaluateNextState() {
    const run = this._currentRunState;
    if (!run) return GameState.MainMenu;

    if (run.morale <= 0) {
      run.latestEndReason = "Morale exhausted.";
      return GameState.Defeat;
    }

    if (run.debt >= run.debtLimit) {
      run.latestEndReason = "Debt limit reached.";
      return GameState.Defeat;
    }

    if (run.round >= GameRulesFns.getActFinalRound(run.act)) {
      const actLabel = GameRulesFns.getActLabel(run.act);
      if (run.latestCombatWon) {
        run.latestEndReason = actLabel + " cleared.";
        return GameState.Victory;
      }
      run.latestEndReason = actLabel + " final round failed.";
      return GameState.Defeat;
    }

    run.latestEndReason = null;
    return GameState.RivalUpdate;
  }

  swapPartySlots(slotA, slotB) {
    const run = this._currentRunState;
    if (!run) return;
    if (slotA === slotB) return;
    if (slotA < 0 || slotA >= GameRules.MaxPartySize) return;
    if (slotB < 0 || slotB >= GameRules.MaxPartySize) return;

    let heroA = null;
    let heroB = null;
    for (const hero of run.party) {
      if (hero.formationSlot === slotA) heroA = hero;
      else if (hero.formationSlot === slotB) heroB = hero;
    }

    if (heroA === null && heroB === null) return;
    if (heroA) heroA.formationSlot = slotB;
    if (heroB) heroB.formationSlot = slotA;

    run.party.sort(compareHeroesBySlot);
  }

  advanceRound() {
    const run = this._currentRunState;
    if (!run) return;
    run.round += 1;
    run.hasLatestRewardSummary = false;
    run.latestVeterancySummary = "";
    resetPartyTierStats(run);
  }

  advanceToNextAct() {
    const run = this._currentRunState;
    if (!run) return;
    if (run.act >= GameRulesFns.totalActs) return;

    run.act += 1;
    run.round = GameRulesFns.getActStartRound(run.act);
    run.hasLatestRewardSummary = false;
    run.latestEndReason = null;
    run.latestVeterancySummary = "";
    resetPartyTierStats(run);
  }

  _isPendingRelicChoice(relicId) {
    const run = this._currentRunState;
    if (!run) return false;
    return run.pendingRelicChoices.includes(relicId);
  }

  _clearPendingRelicReward() {
    const run = this._currentRunState;
    if (!run) return;
    run.pendingRelicChoices.length = 0;
    run.hasPendingRelicReward = false;
    run.pendingRelicNextState = GameState.MainMenu;
  }
}

function compareHeroesBySlot(first, second) {
  if (first.formationSlot < second.formationSlot) return -1;
  if (first.formationSlot > second.formationSlot) return 1;
  return 0;
}

function resetPartyTierStats(run) {
  if (!run) return;
  for (const hero of run.party) {
    HeroEffects.applyTierStatSeed(hero);
    if (hero) hero.currentHealth = getScaledHeroMaxHealth(hero, run);
  }
}

function isRelicEligibleEncounter(encounter) {
  if (!encounter) return false;
  // Every act's capstone boss and rival benchmarks award a relic.
  return encounter.type === EncounterType.RivalGhost || encounter.type === EncounterType.FinalBoss;
}

function calculateTotalUpkeep(run, encounter) {
  HeroEffects.applyPreUpkeep(run);

  let totalUpkeep = 0;
  for (const hero of run.party) totalUpkeep += hero.upkeepThisRound;

  if (encounter) {
    if (encounter.encounterEffectId === EncounterEffectId.TaxCollectorUpkeep) {
      totalUpkeep += GameRules.TaxCollectorUpkeep;
    } else if (encounter.encounterEffectId === EncounterEffectId.FinalBossDamage) {
      totalUpkeep += GameRules.AuditorUpkeep;
    }
  }

  if (run.selectedPayrollAction === PayrollActionId.CutWages) {
    totalUpkeep -= GameRules.CutWagesUpkeepReduction;
  }

  if (totalUpkeep < 0) totalUpkeep = 0;
  return totalUpkeep;
}

function awardVeterancyXp(run, combatResult, encounter) {
  if (!run || !combatResult) return "";

  const awards = new Array(run.party.length).fill(0);
  let survivorAward = GameRules.VeteranSurvivorXp;
  if (isRivalVeterancyEncounter(encounter)) survivorAward += GameRules.VeteranRivalFightBonusXp;
  if (isEndOfActEncounter(encounter)) survivorAward += GameRules.VeteranEndOfActFightBonusXp;

  for (let i = 0; i < run.party.length; i++) {
    const hero = run.party[i];
    if (!hero) continue;
    if (!wasHeroDead(combatResult, hero)) awards[i] += survivorAward;
  }

  if (combatResult.playerWon && isEndOfActEncounter(encounter)) {
    for (let i = 0; i < run.party.length; i++) {
      if (run.party[i]) awards[i] += GameRules.VeteranActCompleteXp;
    }
  }

  let summary = "";
  for (let i = 0; i < run.party.length; i++) {
    const hero = run.party[i];
    if (!hero || !hero.definition || awards[i] <= 0) continue;

    const previousTier = hero.veteranTier;
    hero.veteranXp += awards[i];
    hero.veteranTier = GameRulesFns.getVeteranTierForXp(hero.veteranXp);

    if (summary.length > 0) summary += "; ";
    summary += `${hero.definition.displayName} +${awards[i]} XP`;

    if (hero.veteranTier > previousTier) {
      summary += ` -> Veteran ${hero.veteranTier}`;
    } else {
      summary += ` (${GameRulesFns.getVeteranProgressLabel(hero.veteranXp)})`;
    }
  }

  return summary;
}

function wasHeroDead(combatResult, hero) {
  if (!combatResult || !hero) return false;
  return combatResult.deadHeroes.includes(hero);
}

function isRivalVeterancyEncounter(encounter) {
  return encounter && encounter.type === EncounterType.RivalGhost;
}

function isEndOfActEncounter(encounter) {
  if (!encounter) return false;
  return encounter.round === GameRulesFns.getActFinalRound(encounter.act);
}
