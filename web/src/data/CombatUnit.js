// Ported from DungeonDebt/Assets/Scripts/Data/CombatUnit.cs
import { CombatStatusState } from "./CombatStatusState.js";

export class CombatUnit {
  constructor(displayName, attack, currentHealth, maxHealth, isPlayerSide, slot, sourceHero, sourceEnemy) {
    this.displayName = displayName;
    this.attack = attack;
    this.currentHealth = currentHealth;
    this.maxHealth = maxHealth;
    this.isPlayerSide = isPlayerSide;
    this.slot = slot;
    this.sourceHero = sourceHero;
    this.sourceEnemy = sourceEnemy;
    this.statuses = new CombatStatusState();
  }

  get isAlive() {
    return this.currentHealth > 0;
  }

  copyStatusesFrom(source) {
    this.statuses.copyFrom(source ? source.statuses : null);
  }
}
