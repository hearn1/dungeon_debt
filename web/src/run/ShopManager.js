// Ported from DungeonDebt/Assets/Scripts/Run/ShopManager.cs
import { HeroTier, ShopEventId } from "../data/enums.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";
import { HeroInstance } from "../data/HeroInstance.js";
import { ShopOffer } from "../data/ShopOffer.js";
import { HeroEffects } from "../combat/HeroEffects.js";

const NoEmptyFormationSlot = -1;

export class ShopManager {
  constructor(runManager = null) {
    this._runManager = runManager;
    this._currentOffers = [];
  }

  get currentOffers() { return this._currentOffers; }

  initialize(runManager) {
    this._runManager = runManager;
  }

  generateOffers() {
    this._fillAllOffers();
  }

  clearShopEvent() {
    const run = this._getRunState();
    if (run) run.currentShopEvent = null;
  }

  reroll() {
    const run = this._getRunState();
    if (!run || run.gold < GameRules.RerollCost) return false;
    run.gold -= GameRules.RerollCost;
    run.rerollCount += 1;
    this._fillAllOffers();
    return true;
  }

  payDebt() {
    const run = this._getRunState();
    if (!run) return false;
    const payment = GameRulesFns.calculateDebtPaymentAmount(run.gold, run.debt);
    if (payment <= 0) return false;
    run.gold -= payment;
    run.debt -= payment;
    return true;
  }

  hire(offerIndex) {
    if (offerIndex < 0 || offerIndex >= this._currentOffers.length) return false;
    const offer = this._currentOffers[offerIndex];
    if (!offer || offer.purchased) return false;

    const run = this._getRunState();
    if (!run) return false;
    if (run.gold < offer.hireCost) return false;

    const existing = findExistingPartyMember(run, offer.hero);
    if (existing) {
      if (existing.tier === HeroTier.Diamond) return false;
      run.gold -= offer.hireCost;
      existing.tier = getNextMergeTier(existing.tier);
      HeroEffects.applyTierStatSeed(existing);
      existing.currentHealth = HeroEffects.getTierAdjustedMaxHealth(existing);
      offer.purchased = true;
      return true;
    }

    if (run.party.length >= GameRules.MaxPartySize) return false;

    const formationSlot = findFirstEmptyFormationSlot(run);
    if (formationSlot === NoEmptyFormationSlot) return false;

    run.gold -= offer.hireCost;
    const hired = new HeroInstance(offer.hero, formationSlot);
    hired.tier = offer.tier;
    HeroEffects.applyTierStatSeed(hired);
    hired.currentHealth = HeroEffects.getTierAdjustedMaxHealth(hired);
    run.party.push(hired);
    offer.purchased = true;
    return true;
  }

  fire(partyIndex) {
    const run = this._getRunState();
    if (!run) return false;
    if (partyIndex < 0 || partyIndex >= run.party.length) return false;

    run.party.splice(partyIndex, 1);
    run.gold += GameRules.FireRefund;

    for (let i = 0; i < run.party.length; i++) {
      run.party[i].formationSlot = i;
    }
    return true;
  }

  _fillAllOffers() {
    this._currentOffers.length = 0;

    const rng = this._runManager ? this._runManager.rng : null;
    if (!rng) return;

    const run = this._getRunState();
    const terminalOwned = new Set();
    const anyOwned = new Set();
    if (run) {
      for (const member of run.party) {
        if (!member || !member.definition) continue;
        anyOwned.add(member.definition.id);
        if (member.tier === HeroTier.Diamond) terminalOwned.add(member.definition.id);
      }
    }

    const allHeroes = DataRepository.allHeroes;

    // Bronze pool: heroes not already at Diamond (can still be merged up).
    const bronzePool = [];
    // Silver pool: only heroes the player does not own at all.
    const silverPool = [];
    for (const hero of allHeroes) {
      if (!terminalOwned.has(hero.id)) bronzePool.push(hero);
      if (!anyOwned.has(hero.id)) silverPool.push(hero);
    }

    for (let i = 0; i < GameRules.ShopOfferCount; i++) {
      const wantSilver = rng.nextDouble() < GameRules.SilverOfferChance;
      const pool = wantSilver && silverPool.length > 0 ? silverPool : bronzePool;
      const tier = pool === silverPool ? HeroTier.Silver : HeroTier.Bronze;

      if (pool.length === 0) {
        this._currentOffers.push(null);
        continue;
      }

      const pick = rng.next(0, pool.length);
      const picked = pool[pick];
      pool.splice(pick, 1);
      // Keep the other pool consistent so the same hero can't double-appear.
      if (tier === HeroTier.Silver) removeById(bronzePool, picked.id);
      else removeById(silverPool, picked.id);

      let hireCost = picked.baseUpkeep + GameRules.HireCostBonus;
      if (tier === HeroTier.Silver || anyOwned.has(picked.id)) {
        hireCost += GameRules.SilverHireCostBonus;
      }

      this._currentOffers.push(new ShopOffer(picked, hireCost, tier));
    }

    // M17 — Roll a shop event (~20%).
    this._rollShopEvent(run);
  }

  _rollShopEvent(run) {
    if (!run) return;
    run.currentShopEvent = null;

    const rng = this._runManager ? this._runManager.rng : null;
    if (!rng) return;

    // 20% chance for any event
    if (rng.nextDouble() >= 0.2) return;

    // Pick one event from the pool
    const eventPool = [ShopEventId.BargainStall, ShopEventId.TaxAudit, ShopEventId.TravellingMerchant];
    const eventId = eventPool[rng.next(eventPool.length)];

    if (eventId === ShopEventId.BargainStall) {
      this._applyBargainStallEvent(run);
    } else if (eventId === ShopEventId.TaxAudit) {
      run.currentShopEvent = { eventId: ShopEventId.TaxAudit };
    } else if (eventId === ShopEventId.TravellingMerchant) {
      run.currentShopEvent = {
        eventId: ShopEventId.TravellingMerchant,
        purchases: [],
        goods: [
          { id: "healAll", label: "Heal All Party", cost: GameRules.TravellingHealAllCost, description: "Restore all heroes to full HP" },
          { id: "goldBlessing", label: "Gold Blessing", cost: GameRules.TravellingBlessingCost, description: "+" + GameRules.TravellingBlessingAmount + " gold on next combat reward" },
        ],
      };
    }
  }

  _applyBargainStallEvent(run) {
    const validSlots = [];
    for (let i = 0; i < this._currentOffers.length; i++) {
      if (this._currentOffers[i]) validSlots.push(i);
    }
    if (validSlots.length === 0) return;

    const rng = this._runManager ? this._runManager.rng : null;
    if (!rng) return;

    const slotIndex = validSlots[rng.next(validSlots.length)];
    const offer = this._currentOffers[slotIndex];
    const originalCost = offer.hireCost;
    const discountedCost = Math.max(1, Math.ceil(originalCost * 0.5));

    offer.hireCost = discountedCost;

    run.currentShopEvent = {
      eventId: ShopEventId.BargainStall,
      slotIndex,
      originalCost,
      discountedCost,
    };
  }

  resolveTaxAudit(payGold) {
    const run = this._getRunState();
    if (!run || !run.currentShopEvent || run.currentShopEvent.eventId !== ShopEventId.TaxAudit) return false;

    if (payGold) {
      if (run.gold < GameRules.TaxAuditGoldCost) return false;
      run.gold -= GameRules.TaxAuditGoldCost;
    } else {
      run.morale -= 1;
    }
    run.currentShopEvent = null;
    return true;
  }

  purchaseTravellingGood(itemId) {
    const run = this._getRunState();
    if (!run || !run.currentShopEvent || run.currentShopEvent.eventId !== ShopEventId.TravellingMerchant) return false;

    const goods = run.currentShopEvent.goods;
    const good = goods.find((g) => g.id === itemId);
    if (!good) return false;
    if (this.isTravellingGoodPurchased(itemId)) return false;
    if (run.gold < good.cost) return false;

    run.gold -= good.cost;
    run.currentShopEvent.purchases.push(itemId);

    if (itemId === "healAll") {
      for (const hero of run.party) {
        hero.currentHealth = HeroEffects.getTierAdjustedMaxHealth(hero);
      }
    } else if (itemId === "goldBlessing") {
      run.pendingNextRewardBonus += GameRules.TravellingBlessingAmount;
    }

    return true;
  }

  isTravellingGoodPurchased(itemId) {
    const run = this._getRunState();
    if (!run || !run.currentShopEvent || run.currentShopEvent.eventId !== ShopEventId.TravellingMerchant) return false;
    return run.currentShopEvent.purchases.indexOf(itemId) !== -1;
  }

  _getRunState() {
    if (!this._runManager) return null;
    return this._runManager.currentRunState;
  }
}

function getNextMergeTier(tier) {
  if (tier === HeroTier.Bronze) return HeroTier.Silver;
  if (tier === HeroTier.Silver) return HeroTier.Gold;
  if (tier === HeroTier.Gold) return HeroTier.Diamond;
  return tier;
}

function findExistingPartyMember(run, hero) {
  if (!run || !hero) return null;
  for (const member of run.party) {
    if (member && member.definition && member.definition.id === hero.id) return member;
  }
  return null;
}

function removeById(pool, heroId) {
  for (let i = 0; i < pool.length; i++) {
    if (pool[i].id === heroId) {
      pool.splice(i, 1);
      return;
    }
  }
}

function findFirstEmptyFormationSlot(run) {
  if (!run) return NoEmptyFormationSlot;
  for (let slot = 0; slot < GameRules.MaxPartySize; slot++) {
    let occupied = false;
    for (const member of run.party) {
      if (member.formationSlot === slot) {
        occupied = true;
        break;
      }
    }
    if (!occupied) return slot;
  }
  return NoEmptyFormationSlot;
}
