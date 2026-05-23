// Ported from DungeonDebt/Assets/Scripts/Data/ShopOffer.cs
import { HeroTier } from "./enums.js";

export class ShopOffer {
  constructor(hero, hireCost, tier = HeroTier.Bronze) {
    this.hero = hero;
    this.hireCost = hireCost;
    this.tier = tier;
    this.purchased = false;
  }
}
