// Ported from DungeonDebt/Assets/Scripts/Data/HeroInstance.cs
// Mutable party member built from an immutable HeroDefinition.
import { HeroTier } from "./enums.js";

export class HeroInstance {
  constructor(definition, formationSlot) {
    this.definition = definition;
    this.currentHealth = definition.baseHealth;
    this.attack = definition.baseAttack;
    this.upkeepThisRound = definition.baseUpkeep;
    this.formationSlot = formationSlot;
    this.instanceId = (globalThis.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.tier = HeroTier.Bronze;
    this.veteranXp = 0;
    this.veteranTier = 0;
  }
}
