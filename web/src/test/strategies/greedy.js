import { GameRules } from "../../core/GameRules.js";
import { HeroEffects } from "../../combat/HeroEffects.js";
import { PayrollActionId } from "../../data/enums.js";

export const GreedyStrategy = Object.freeze({
  id: "greedy",

  visitShop(shopManager, run) {
    if (!shopManager || !run) return;

    while (run.party.length < GameRules.MaxPartySize) {
      const index = findBestAffordableOfferIndex(shopManager.currentOffers, run.gold);
      if (index < 0) return;
      if (!shopManager.hire(index)) return;
    }
  },

  choosePayrollAction(run) {
    if (run && run.debt + GameRules.LoanDebtCost < run.debtLimit) {
      return PayrollActionId.TakeLoan;
    }
    return PayrollActionId.StandardPay;
  },

  chooseRelic(run) {
    if (!run || !run.pendingRelicChoices || run.pendingRelicChoices.length <= 0) return null;
    return run.pendingRelicChoices[0];
  },
});

function findBestAffordableOfferIndex(offers, gold) {
  let bestIndex = -1;
  let bestAttack = -1;

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    if (!offer || offer.purchased || offer.hireCost > gold) continue;

    const attack = HeroEffects.getTierAdjustedAttack(offer.hero, offer.tier);
    if (attack > bestAttack) {
      bestAttack = attack;
      bestIndex = i;
    }
  }

  return bestIndex;
}
