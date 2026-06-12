import { GameRules } from "../../core/GameRules.js";
import { HeroEffects } from "../../combat/HeroEffects.js";
import { PayrollActionId } from "../../data/enums.js";

export const GreedyStrategy = Object.freeze({
  id: "greedy",

  visitShop(shopManager, run) {
    if (!shopManager || !run) return;

    shopManager.payDebt();

    while (run.party.length < GameRules.MaxPartySize) {
      const index = findBestAffordableOfferIndex(shopManager.currentOffers, run);
      if (index < 0) return;
      if (!shopManager.hire(index)) return;
    }
  },

  choosePayrollAction(run) {
    if (run && run.debt === 0 && run.party.length < 2) {
      return PayrollActionId.TakeLoan;
    }
    return PayrollActionId.StandardPay;
  },

  chooseRelic(run) {
    if (!run || !run.pendingRelicChoices || run.pendingRelicChoices.length <= 0) return null;
    return run.pendingRelicChoices[0];
  },
});

function findBestAffordableOfferIndex(offers, run) {
  let bestIndex = -1;
  let bestAttack = -1;

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    if (!offer || offer.purchased || offer.hireCost > run.gold) continue;
    if (!isAffordableByUpkeep(offer, run)) continue;

    const attack = HeroEffects.getTierAdjustedAttack(offer.hero, offer.tier);
    if (attack > bestAttack) {
      bestAttack = attack;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function isAffordableByUpkeep(offer, run) {
  if (run.party.length < 2) return true;
  return getProjectedTotalUpkeep(offer, run) <= GameRules.WinReward;
}

function getProjectedTotalUpkeep(offer, run) {
  let total = 0;
  let matchedExisting = false;
  for (const hero of run.party) {
    if (!hero || !hero.definition) continue;
    if (hero.definition.id === offer.hero.id) {
      total += HeroEffects.getTierAdjustedUpkeep(offer.hero, offer.tier);
      matchedExisting = true;
    } else {
      total += HeroEffects.getTierAdjustedUpkeep(hero.definition, hero.tier);
    }
  }
  if (!matchedExisting) {
    total += HeroEffects.getTierAdjustedUpkeep(offer.hero, offer.tier);
  }
  return total;
}
