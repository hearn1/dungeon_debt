import { GameRules } from "../../core/GameRules.js";
import { HeroEffects } from "../../combat/HeroEffects.js";
import { HeroRole, PayrollActionId } from "../../data/enums.js";

const RoleTargets = Object.freeze({
  [HeroRole.Tank]: 1,
  [HeroRole.Damage]: 2,
  [HeroRole.Support]: 1,
  [HeroRole.Economy]: 1,
});

export const SmartStrategy = Object.freeze({
  id: "smart",

  visitShop(shopManager, run) {
    if (!shopManager || !run) return;

    while (run.party.length < GameRules.MaxPartySize) {
      const bestIndex = findBestAffordableOfferIndex(shopManager.currentOffers, run);
      const missingRoleCanImprove = hasAffordableMissingRoleOffer(shopManager.currentOffers, run);

      if (!missingRoleCanImprove && canRerollForMissingRole(shopManager, run)) {
        if (!shopManager.reroll()) return;
        continue;
      }

      if (bestIndex < 0) return;
      if (!shopManager.hire(bestIndex)) return;
    }
  },

  choosePayrollAction(run) {
    if (!run) return PayrollActionId.StandardPay;
    if (run.party.length < 3 && run.debt + GameRules.LoanDebtCost < run.debtLimit) {
      return PayrollActionId.TakeLoan;
    }
    if (run.party.length >= GameRules.MaxPartySize && run.gold >= GameRules.VictoryBonusGoldCost + 2) {
      return PayrollActionId.PromiseVictoryBonus;
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
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestUpkeep = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    if (!offer || offer.purchased || offer.hireCost > run.gold) continue;

    const score = scoreOffer(offer, run);
    const upkeep = HeroEffects.getTierAdjustedUpkeep(offer.hero, offer.tier);
    if (score > bestScore || (score === bestScore && upkeep < bestUpkeep)) {
      bestIndex = i;
      bestScore = score;
      bestUpkeep = upkeep;
    }
  }

  return bestIndex;
}

function hasAffordableMissingRoleOffer(offers, run) {
  for (const offer of offers) {
    if (!offer || offer.purchased || offer.hireCost > run.gold) continue;
    if (getRoleNeed(offer.hero.role, run) > 0) return true;
  }
  return false;
}

function canRerollForMissingRole(shopManager, run) {
  if (!hasMissingRole(run)) return false;
  if (run.gold <= GameRules.RerollCost + 3) return false;
  return shopManager && typeof shopManager.reroll === "function";
}

function hasMissingRole(run) {
  return getRoleNeed(HeroRole.Tank, run) > 0
    || getRoleNeed(HeroRole.Damage, run) > 0
    || getRoleNeed(HeroRole.Support, run) > 0
    || getRoleNeed(HeroRole.Economy, run) > 0;
}

function scoreOffer(offer, run) {
  const roleNeed = getRoleNeed(offer.hero.role, run);
  const attack = HeroEffects.getTierAdjustedAttack(offer.hero, offer.tier);
  const health = HeroEffects.getTierAdjustedMaxHealthDef(offer.hero, offer.tier);
  const upkeep = HeroEffects.getTierAdjustedUpkeep(offer.hero, offer.tier);
  return (roleNeed > 0 ? 100 : 0) + attack + health - upkeep;
}

function getRoleNeed(role, run) {
  const target = RoleTargets[role] || 0;
  if (target <= 0) return 0;
  let current = 0;
  for (const hero of run.party) {
    if (hero && hero.definition && hero.definition.role === role) current += 1;
  }
  return Math.max(0, target - current);
}
