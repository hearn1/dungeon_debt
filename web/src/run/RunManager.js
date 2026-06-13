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
import { buildManagerReportLines } from "./ManagerReportBuilder.js";
import { getEncounterRewardBreakdownForEncounter } from "./EncounterReward.js";
import {
  getEncounterRewardQualityBreakdownForEncounter,
  getEncounterRewardQualitySummary,
  getEncounterVeterancyXpBreakdownForEncounter,
} from "./EncounterRewardQuality.js";
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
    this._devEnableAct3ForNextRun = false;
  }

  initialize(payrollManager, rivalManager = null) {
    this._payrollManager = payrollManager;
    if (rivalManager !== null) this._rivalManager = rivalManager;
  }

  get currentRunState() { return this._currentRunState; }
  get rng() { return this._rng; }

  setDevEnableAct3ForNextRun(enabled) {
    this._devEnableAct3ForNextRun = enabled === true;
  }

  // Static relic/health helpers (delegating to the shared module).
  static hasRelic(runState, relicId) { return hasRelic(runState, relicId); }
  static getRelicAttackBonus(runState, hero) { return getRelicAttackBonus(runState, hero); }
  static getRelicMaxHealthBonus(runState, hero) { return getRelicMaxHealthBonus(runState, hero); }
  static getScaledHeroMaxHealth(hero, runState) { return getScaledHeroMaxHealth(hero, runState); }

  initializeRun(difficultyLevel = GameRules.DefaultDifficultyLevel, seed = null) {
    this._rng = new Rng(seed);

    const difficulty = DataRepository.getDifficultyLevel(difficultyLevel);
    if (!difficulty) {
      throw new Error("Unknown difficulty level: " + difficultyLevel + ".");
    }
    if (!difficulty.isImplemented) {
      throw new Error("Difficulty level " + difficultyLevel + " is not implemented yet.");
    }

    const difficultySettings = createBaselineDifficultySettings();
    const mutators = DataRepository.getDifficultyMutatorsForLevel(difficulty.level);
    for (const mutator of mutators) mutator.apply(difficultySettings);

    const runState = new RunState();
    runState.act = 1;
    runState.round = 1;
    runState.selectedDifficulty = difficulty.level;
    runState.difficultyDisplayName = difficulty.displayName;
    runState.activeDifficultyMutators = mutators.map((mutator) => mutator.id);
    runState.gold = difficultySettings.startingGold;
    runState.debt = difficultySettings.startingDebt;
    runState.morale = difficultySettings.startingMorale;
    runState.interestDivisor = difficultySettings.interestDivisor;
    runState.debtLimit = difficultySettings.debtLimit;
    runState.heroHealthMultiplier = difficultySettings.heroHealthMultiplier;
    runState.heroDamageMultiplier = difficultySettings.heroDamageMultiplier;
    runState.enemyHealthMultiplier = difficultySettings.enemyHealthMultiplier;
    runState.enemyDamageMultiplier = difficultySettings.enemyDamageMultiplier;
    runState.rewardGoldModifier = difficultySettings.rewardGoldModifier;
    runState.rerollCostModifier = difficultySettings.rerollCostModifier;
    runState.veteranXpModifier = difficultySettings.veteranXpModifier;
    runState.devEnableAct3 = this._devEnableAct3ForNextRun;
    runState.rerollCount = 0;
    runState.selectedPayrollAction = null;
    runState.playerRaceProgress = 1;
    runState.usedRaceActions = new Set();
    runState.fullUpkeepPaidLastRound = false;
    runState.latestVeterancySummary = "";
    runState.latestVeterancyContextBonusXp = 0;
    runState.latestVeterancySurvivorXp = 0;
    runState.latestRewardQualitySummary = "";
    runState.latestRewardQualityRelicChoiceBonus = 0;
    runState.latestRewardQualityShopSilverChanceBonus = 0;
    runState.pendingShopQualitySilverChanceBonus = 0;
    runState.pendingRelicChoiceBonus = 0;
    runState.pendingRelicChoiceCount = 0;
    runState.latestShopQualitySilverChanceBonus = 0;
    runState.latestShopSilverOfferChance = GameRules.SilverOfferChance;

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
    run.latestDebtBeforeCombat = run.debt;
    run.latestDebtStatusBefore = GameRulesFns.getDebtStatusLabel(run.debt);
    const isRivalGhost = encounter && encounter.type === EncounterType.RivalGhost;
    const rewardBreakdown = getEncounterRewardBreakdownForEncounter(encounter);
    const rewardQualityBreakdown = combatResult.playerWon
      ? getEncounterRewardQualityBreakdownForEncounter(encounter)
      : getEncounterRewardQualityBreakdownForEncounter(null);
    const contractRewardGold = combatResult.playerWon ? rewardBreakdown.totalGold : GameRules.LossReward;
    const rewardScaleBonusGold = combatResult.playerWon
      ? rewardBreakdown.actBonus + rewardBreakdown.progressBonus + rewardBreakdown.typeBonus
      : 0;
    let rewardGold = contractRewardGold;
    let rivalRewardGold = 0;
    if (combatResult.playerWon && isRivalGhost) {
      rivalRewardGold = GameRules.RivalWinBonus;
      rewardGold += rivalRewardGold;
    }
    let difficultyRewardGold = 0;
    if (combatResult.playerWon && run.rewardGoldModifier !== 0) {
      const beforeDifficulty = rewardGold;
      rewardGold = Math.max(0, rewardGold + run.rewardGoldModifier);
      difficultyRewardGold = rewardGold - beforeDifficulty;
    }

    const lossMorale = isRivalGhost ? GameRules.RivalLossMorale : GameRules.DungeonLossMorale;
    const moraleChange = combatResult.playerWon ? 0 : -lossMorale;

    const beforeDrain = rewardGold;
    if (combatResult.survivorFlags) {
      if (combatResult.survivorFlags["goblinStoleGold"]) rewardGold -= GameRules.GoblinThiefStealGold;
      if (combatResult.survivorFlags["treasureLeechSurvived"]) rewardGold -= GameRules.TreasureLeechStealGold;
    }
    if (rewardGold < 0) rewardGold = 0;
    const rewardDrainGold = beforeDrain - rewardGold;

    const relicRewardGold = hasRelic(run, RelicId.GuildDividend) ? GameRules.GuildDividendRewardGold : 0;
    rewardGold += relicRewardGold;

    const nextRewardBonusGold = run.pendingNextRewardBonus > 0 ? run.pendingNextRewardBonus : 0;
    if (run.pendingNextRewardBonus > 0) {
      rewardGold += run.pendingNextRewardBonus;
      run.pendingNextRewardBonus = 0;
    }

    run.gold += rewardGold;
    run.morale += moraleChange;

    run.latestRelicDebtPenalty = 0;
    run.latestRelicMoralePenalty = 0;
    if (!combatResult.playerWon) {
      if (hasRelic(run, RelicId.DebtPact)) {
        run.latestRelicDebtPenalty = GameRules.DebtPactLossDebt;
        run.debt += GameRules.DebtPactLossDebt;
      }
      if (hasRelic(run, RelicId.BloodContract)) {
        run.latestRelicMoralePenalty = GameRules.BloodContractLossMorale;
        run.morale -= GameRules.BloodContractLossMorale;
      }
    }

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

    run.latestDebtAfterCombat = run.debt;
    run.latestDebtStatusAfter = GameRulesFns.getDebtStatusLabel(run.debt);

    const veterancyBreakdown = getEncounterVeterancyXpBreakdownForEncounter(encounter);
    const veterancySummary = awardVeterancyXp(run, combatResult, encounter, veterancyBreakdown);

    run.hasLatestRewardSummary = true;
    run.latestCombatWon = combatResult.playerWon;
    run.latestRewardGold = rewardGold;
    run.latestContractRewardGold = contractRewardGold;
    run.latestRewardScaleBonusGold = rewardScaleBonusGold;
    run.latestRivalRewardGold = rivalRewardGold;
    run.latestDifficultyRewardGold = difficultyRewardGold;
    run.latestRewardDrainGold = rewardDrainGold;
    run.latestRelicRewardGold = relicRewardGold;
    run.latestNextRewardBonusGold = nextRewardBonusGold;
    run.latestRewardQualitySummary = getEncounterRewardQualitySummary(rewardQualityBreakdown);
    run.latestRewardQualityRelicChoiceBonus = rewardQualityBreakdown.relicChoiceBonus;
    run.latestRewardQualityShopSilverChanceBonus = rewardQualityBreakdown.shopSilverChanceBonus;
    run.pendingShopQualitySilverChanceBonus = rewardQualityBreakdown.shopSilverChanceBonus;
    run.latestMoraleChange = moraleChange;
    run.latestTotalUpkeep = totalUpkeep;
    run.latestUpkeepPaid = upkeepPaid;
    run.latestUpkeepShortfall = upkeepShortfall;
    run.latestInterestCharged = interestCharged;
    run.latestInterestPaid = interestPaid;
    run.latestInterestAddedToDebt = interestAddedToDebt;
    run.latestVeterancySummary = veterancySummary;
    run.latestVeterancyContextBonusXp = veterancyBreakdown.totalBonus;
    run.fullUpkeepPaidLastRound = (upkeepShortfall === 0);
    run.latestManagerReportLines = buildManagerReportLines(run, combatResult, encounter);

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

    let choiceCount = GameRules.RelicChoiceCount + (run.latestRewardQualityRelicChoiceBonus || 0);
    choiceCount = Math.min(choiceCount, GameRules.RewardQualityRelicChoiceMax);
    if (choiceCount > availableRelics.length) choiceCount = availableRelics.length;
    run.pendingRelicChoiceCount = choiceCount;
    run.pendingRelicChoiceBonus = Math.max(0, choiceCount - GameRules.RelicChoiceCount);

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

  skipPendingRelicReward() {
    const run = this._currentRunState;
    if (!run || !run.hasPendingRelicReward) return GameState.MainMenu;

    const nextState = run.pendingRelicNextState;
    run.gold += GameRules.RelicSkipGold;
    this._clearPendingRelicReward();
    return nextState;
  }

  preRollCombatStatuses(run) {
    if (!run) return;
    run.critChargedSlots.length = 0;
    if (!this._rng) this._rng = new Rng();
    for (const hero of run.party) {
      if (this._rng.nextDouble() < GameRules.CritChance) {
        run.critChargedSlots.push(hero.formationSlot);
      }
    }
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
        if (this._canContinueToNextDevAct(run)) {
          run.latestEndReason = null;
          return GameState.RivalUpdate;
        }
        applyRivalRaceVictoryTribute(run);
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
    run.playerRaceProgress = Math.min(GameRules.RivalRaceMaxProgress, run.playerRaceProgress + 1);
    if (this._canContinueToNextDevAct(run) && run.round > GameRulesFns.getActFinalRound(run.act)) {
      run.act += 1;
      run.round = GameRulesFns.getActStartRound(run.act);
      run.playerRaceProgress = run.round;
    }
    run.hasLatestRewardSummary = false;
    run.latestVeterancySummary = "";
    run.latestVeterancyContextBonusXp = 0;
    run.latestVeterancySurvivorXp = 0;
    run.latestRewardQualitySummary = "";
    run.latestRewardQualityRelicChoiceBonus = 0;
    run.latestRewardQualityShopSilverChanceBonus = 0;
    run.latestShopQualitySilverChanceBonus = 0;
    run.latestShopSilverOfferChance = GameRules.SilverOfferChance;
    run.latestManagerReportLines = [];
    resetPartyTierStats(run);
  }

  advanceToNextAct() {
    const run = this._currentRunState;
    if (!run) return;
    if (run.act >= GameRulesFns.totalActs && !this._canContinueToNextDevAct(run)) return;
    if (run.act >= GameRulesFns.devTotalActs) return;

    run.act += 1;
    run.round = GameRulesFns.getActStartRound(run.act);
    run.playerRaceProgress = run.round;
    run.hasLatestRewardSummary = false;
    run.latestEndReason = null;
    run.latestVeterancySummary = "";
    run.latestVeterancyContextBonusXp = 0;
    run.latestVeterancySurvivorXp = 0;
    run.latestRewardQualitySummary = "";
    run.latestRewardQualityRelicChoiceBonus = 0;
    run.latestRewardQualityShopSilverChanceBonus = 0;
    run.latestShopQualitySilverChanceBonus = 0;
    run.latestShopSilverOfferChance = GameRules.SilverOfferChance;
    run.latestManagerReportLines = [];
    resetPartyTierStats(run);
  }

  applyRaceAction(actionId) {
    const run = this._currentRunState;
    if (!run) return false;
    if (run.usedRaceActions.has(actionId)) return false;

    if (actionId === "rushAhead") {
      run.morale = Math.max(0, run.morale - GameRules.RushAheadMoraleCost);
      run.playerRaceProgress = Math.min(GameRules.RivalRaceMaxProgress, run.playerRaceProgress + 1);
    } else if (actionId === "bribeGuide") {
      if (run.gold >= GameRules.BribeGuideGoldCost) {
        run.gold -= GameRules.BribeGuideGoldCost;
      } else {
        run.debt += GameRules.BribeGuideDebtFallback;
      }
      run.playerRaceProgress = Math.min(GameRules.RivalRaceMaxProgress, run.playerRaceProgress + 1);
    } else {
      return false;
    }

    run.usedRaceActions.add(actionId);
    return true;
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
    run.pendingRelicChoiceBonus = 0;
    run.pendingRelicChoiceCount = 0;
  }

  _canContinueToNextDevAct(run) {
    return run && run.devEnableAct3 === true && run.act >= GameRulesFns.totalActs && run.act < GameRulesFns.devTotalActs;
  }
}

function createBaselineDifficultySettings() {
  return {
    startingGold: GameRules.StartingGold,
    startingDebt: GameRules.StartingDebt,
    startingMorale: GameRules.StartingMorale,
    interestDivisor: GameRules.InterestDebtDivisor,
    debtLimit: GameRules.DebtLimit,
    heroHealthMultiplier: GameRules.NoCombatMultiplier,
    heroDamageMultiplier: GameRules.NoCombatMultiplier,
    enemyHealthMultiplier: GameRules.NoCombatMultiplier,
    enemyDamageMultiplier: GameRules.NoCombatMultiplier,
    rewardGoldModifier: 0,
    rerollCostModifier: 0,
    veteranXpModifier: 0,
  };
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
    } else if (encounter.encounterEffectId === EncounterEffectId.MintMasterOvermint) {
      totalUpkeep += Math.min(GameRules.MintMaxUpkeep, Math.floor(run.debt / GameRules.MintDebtDivisor));
    }
  }

  if (run.selectedPayrollAction === PayrollActionId.CutWages) {
    totalUpkeep -= GameRules.CutWagesUpkeepReduction;
  }

  if (totalUpkeep < 0) totalUpkeep = 0;
  return totalUpkeep;
}

function awardVeterancyXp(run, combatResult, encounter, veterancyBreakdown) {
  if (!run || !combatResult) return "";

  const awards = new Array(run.party.length).fill(0);
  let survivorAward = Math.max(0, GameRules.VeteranSurvivorXp + run.veteranXpModifier);
  if (isRivalVeterancyEncounter(encounter)) survivorAward += GameRules.VeteranRivalFightBonusXp;
  if (isEndOfActEncounter(encounter)) survivorAward += GameRules.VeteranEndOfActFightBonusXp;
  if (veterancyBreakdown) survivorAward += veterancyBreakdown.totalBonus;
  run.latestVeterancySurvivorXp = survivorAward;

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

function applyRivalRaceVictoryTribute(run) {
  if (!run || run.act !== GameRulesFns.totalActs) return;
  const actLabel = GameRulesFns.getActLabel(run.act);
  if (run.latestEndReason === actLabel + " cleared.") return;

  let rivalsBehind = 0;
  for (const rival of run.rivals) {
    if (rival.progress < GameRules.RivalRaceMaxProgress) rivalsBehind += 1;
  }

  if (rivalsBehind <= 0) return;
  run.gold += GameRules.RivalRaceTributePerBehind * rivalsBehind;
}
