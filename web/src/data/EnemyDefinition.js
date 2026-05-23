// Ported from DungeonDebt/Assets/Scripts/Data/EnemyDefinition.cs
// Immutable enemy template. startingStatuses/attackStatuses are arrays of
// CombatStatusId, filtered to drop None entries.
import { CombatStatusId } from "./enums.js";

function buildStatusList(source) {
  const statuses = [];
  if (source) {
    for (const s of source) {
      if (s !== CombatStatusId.None) statuses.push(s);
    }
  }
  return Object.freeze(statuses);
}

export class EnemyDefinition {
  constructor(id, displayName, attack, health, effectId, effectDescription, startingStatuses = null, attackStatuses = null) {
    this.id = id;
    this.displayName = displayName;
    this.attack = attack;
    this.health = health;
    this.effectId = effectId;
    this.effectDescription = effectDescription;
    this.startingStatuses = buildStatusList(startingStatuses);
    this.attackStatuses = buildStatusList(attackStatuses);
    Object.freeze(this);
  }
}
