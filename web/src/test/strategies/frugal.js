import { GameRules } from "../../core/GameRules.js";
import { HeroEffects } from "../../combat/HeroEffects.js";
import { HeroTier, PayrollActionId } from "../../data/enums.js";

export const FrugalStrategy = Object.freeze({
  id: "frugal",

  visitShop(shopManager, run) {
    if (!shopManager || !run) return;

    shopManager.payDebt();

    while (run.party.length < GameRules.MaxPartySize) {
      const index = findBestAffordableOfferIndex(shopManager.currentOffers, run);
      if (index < 0) return;
      if (!shopManager.hire(index)) return;
    }
  },

  choosePayrollAction() {
    return PayrollActionId.CutWages;
  },

  chooseRelic(run) {
    if (!run || !run.pendingRelicChoices || run.pendingRelicChoices.length <= 0) return null;
    return run.pendingRelicChoices[0];
  },
});

function findBestAffordableOfferIndex(offers, run) {
  let bestIndex = -1;
  let bestUpkeep = Number.MAX_SAFE_INTEGER;
  let bestCost = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    if (!offer || offer.purchased || offer.hireCost > run.gold) continue;
    if (!isAllowedByUpkeepPlan(offer, run)) continue;

    const upkeep = getOfferUpkeepAfterHire(offer, run);
    if (upkeep < bestUpkeep || (upkeep === bestUpkeep && offer.hireCost < bestCost)) {
      bestIndex = i;
      bestUpkeep = upkeep;
      bestCost = offer.hireCost;
    }
  }

  return bestIndex;
}

function isAllowedByUpkeepPlan(offer, run) {
  if (run.party.length < 2) return true;
  return getProjectedTotalUpkeep(offer, run) <= GameRules.WinReward;
}

function getProjectedTotalUpkeep(offer, run) {
  let total = 0;
  let matchedExisting = false;

  for (const hero of run.party) {
    if (!hero || !hero.definition) continue;
    if (hero.definition.id === offer.hero.id) {
      total += getNextTierUpkeep(hero.definition, hero.tier);
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

function getOfferUpkeepAfterHire(offer, run) {
  for (const hero of run.party) {
    if (hero && hero.definition && hero.definition.id === offer.hero.id) {
      return getNextTierUpkeep(hero.definition, hero.tier);
    }
  }
  return HeroEffects.getTierAdjustedUpkeep(offer.hero, offer.tier);
}

function getNextTierUpkeep(hero, tier) {
  if (tier === HeroTier.Bronze) return HeroEffects.getTierAdjustedUpkeep(hero, HeroTier.Silver);
  if (tier === HeroTier.Silver) return HeroEffects.getTierAdjustedUpkeep(hero, HeroTier.Gold);
  if (tier === HeroTier.Gold) return HeroEffects.getTierAdjustedUpkeep(hero, HeroTier.Diamond);
  return HeroEffects.getTierAdjustedUpkeep(hero, tier);
}
