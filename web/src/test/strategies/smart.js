import { GameRules } from "../../core/GameRules.js";
import { HeroEffects } from "../../combat/HeroEffects.js";
import { HeroRole, HeroTier, PayrollActionId } from "../../data/enums.js";

const RoleTargets = Object.freeze({
  [HeroRole.Tank]: 1,
  [HeroRole.Damage]: 2,
  [HeroRole.Support]: 1,
  [HeroRole.Economy]: 1,
});
const MaxShopActions = 18;
const ReplacementScoreMargin = 6;
const SurplusGoldThreshold = 12;

export const SmartStrategy = Object.freeze({
  id: "smart",

  visitShop(shopManager, run) {
    if (!shopManager || !run) return;

    payUrgentDebt(shopManager, run);

    for (let actions = 0; actions < MaxShopActions; actions++) {
      const bestIndex = findBestAffordableOfferIndex(shopManager.currentOffers, run);
      if (bestIndex >= 0) {
        const offer = shopManager.currentOffers[bestIndex];
        if (shouldBuyOffer(offer, run)) {
          if (canReplaceWeakestWithOffer(offer, run)) {
            const weakestIndex = findWeakestReplaceablePartyIndex(run);
            if (weakestIndex >= 0) shopManager.fire(weakestIndex);
          }
          if (shopManager.hire(bestIndex)) continue;
        }
      }

      if (shouldReroll(shopManager, run)) {
        if (shopManager.reroll()) continue;
      }

      break;
    }

    paySurplusDebt(shopManager, run);
  },

  choosePayrollAction(run) {
    if (!run) return PayrollActionId.StandardPay;
    if (run.debt === 0 && run.party.length < 2) {
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
    if (!canBuyOffer(offer, run)) continue;

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

function shouldBuyOffer(offer, run) {
  if (!offer || !run) return false;
  if (isMergeOffer(offer, run)) return true;
  if (run.party.length < GameRules.MaxPartySize) return true;
  return canReplaceWeakestWithOffer(offer, run);
}

function canBuyOffer(offer, run) {
  if (!offer || offer.purchased || offer.hireCost > run.gold) return false;
  if (isMergeOffer(offer, run)) return true;
  if (run.party.length < GameRules.MaxPartySize) return isAffordableByUpkeep(offer, run);
  return canReplaceWeakestWithOffer(offer, run);
}

function isMergeOffer(offer, run) {
  const existing = findExistingHero(run, offer.hero.id);
  return !!existing && existing.tier !== HeroTier.Diamond;
}

function canReplaceWeakestWithOffer(offer, run) {
  if (!offer || !run || run.party.length < GameRules.MaxPartySize) return false;
  if (findExistingHero(run, offer.hero.id)) return false;
  const weakestIndex = findWeakestReplaceablePartyIndex(run);
  if (weakestIndex < 0) return false;
  const weakest = run.party[weakestIndex];
  return scoreDefinition(offer.hero, offer.tier, run) >= scoreHero(weakest, run) + ReplacementScoreMargin;
}

function findWeakestReplaceablePartyIndex(run) {
  let weakestIndex = -1;
  let weakestScore = Number.POSITIVE_INFINITY;
  for (let i = 0; i < run.party.length; i++) {
    const hero = run.party[i];
    if (!hero || !hero.definition) continue;
    const score = scoreHero(hero, run);
    if (score < weakestScore) {
      weakestIndex = i;
      weakestScore = score;
    }
  }
  return weakestIndex;
}

function shouldReroll(shopManager, run) {
  if (!shopManager || !run || typeof shopManager.reroll !== "function") return false;
  const rerollCost = GameRules.RerollCost + (run.rerollCostModifier || 0);
  if (run.gold < rerollCost + getGoldReserve(run)) return false;
  if (run.party.length < GameRules.MaxPartySize && hasMissingRole(run)) return true;
  if (run.gold >= SurplusGoldThreshold && hasUpgradeCandidate(run)) return true;
  return run.gold >= SurplusGoldThreshold + rerollCost && run.party.length < GameRules.MaxPartySize;
}

function hasUpgradeCandidate(run) {
  for (const hero of run.party) {
    if (hero && hero.definition && hero.tier !== HeroTier.Diamond) return true;
  }
  return false;
}

function payUrgentDebt(shopManager, run) {
  if (!shopManager || !run || run.debt < GameRules.DangerousDebtThreshold) return;
  if (run.gold <= getGoldReserve(run)) return;
  shopManager.payDebt();
}

function paySurplusDebt(shopManager, run) {
  if (!shopManager || !run) return;
  let guard = 0;
  while (run.debt > 0 && run.gold > getGoldReserve(run) && guard < 4) {
    guard += 1;
    if (!shopManager.payDebt()) return;
  }
}

function getGoldReserve(run) {
  if (!run) return 0;
  if (run.party.length < 2) return 0;
  if (hasMissingRole(run)) return 4;
  return 2;
}

function hasAffordableMissingRoleOffer(offers, run) {
  for (const offer of offers) {
    if (!canBuyOffer(offer, run)) continue;
    if (getRoleNeed(offer.hero.role, run) > 0) return true;
  }
  return false;
}

function hasMissingRole(run) {
  return getRoleNeed(HeroRole.Tank, run) > 0
    || getRoleNeed(HeroRole.Damage, run) > 0
    || getRoleNeed(HeroRole.Support, run) > 0
    || getRoleNeed(HeroRole.Economy, run) > 0;
}

function scoreOffer(offer, run) {
  const existing = findExistingHero(run, offer.hero.id);
  if (existing && existing.tier !== HeroTier.Diamond) {
    return scoreDefinition(existing.definition, getNextTier(existing.tier), run) + 120;
  }
  return scoreDefinition(offer.hero, offer.tier, run);
}

function scoreHero(hero, run) {
  if (!hero || !hero.definition) return Number.NEGATIVE_INFINITY;
  return scoreDefinition(hero.definition, hero.tier, run);
}

function scoreDefinition(hero, tier, run) {
  const roleNeed = getRoleNeed(hero.role, run);
  const attack = HeroEffects.getTierAdjustedAttack(hero, tier);
  const health = HeroEffects.getTierAdjustedMaxHealthDef(hero, tier);
  const upkeep = HeroEffects.getTierAdjustedUpkeep(hero, tier);
  const tierBonus = getTierOrdinal(tier) * 4;
  return (roleNeed > 0 ? 100 : 0) + attack * 3 + health + tierBonus - upkeep;
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

function findExistingHero(run, heroId) {
  if (!run || !heroId) return null;
  for (const hero of run.party) {
    if (hero && hero.definition && hero.definition.id === heroId) return hero;
  }
  return null;
}

function getNextTier(tier) {
  if (tier === HeroTier.Bronze) return HeroTier.Silver;
  if (tier === HeroTier.Silver) return HeroTier.Gold;
  if (tier === HeroTier.Gold) return HeroTier.Diamond;
  return tier;
}

function getTierOrdinal(tier) {
  if (tier === HeroTier.Diamond) return 4;
  if (tier === HeroTier.Gold) return 3;
  if (tier === HeroTier.Silver) return 2;
  return 1;
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
