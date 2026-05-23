// Ported from DungeonDebt/Assets/Scripts/Data/CombatStatusState.cs
import { CombatStatusId } from "./enums.js";
import { GameRules } from "../core/GameRules.js";

export class CombatStatusState {
  constructor() {
    this._activeStatuses = [];
    this.poisonDamage = 0;
  }

  get activeStatuses() {
    return this._activeStatuses;
  }

  has(statusId) {
    return this._activeStatuses.includes(statusId);
  }

  add(statusId) {
    if (statusId === CombatStatusId.None || this.has(statusId)) {
      return false;
    }
    this._activeStatuses.push(statusId);
    if (statusId === CombatStatusId.Poisoned) {
      this.poisonDamage = GameRules.PoisonInitialDamage;
    }
    return true;
  }

  remove(statusId) {
    const idx = this._activeStatuses.indexOf(statusId);
    if (idx !== -1) {
      this._activeStatuses.splice(idx, 1);
      if (statusId === CombatStatusId.Poisoned) {
        this.poisonDamage = 0;
      }
    }
  }

  increasePoisonDamage() {
    if (!this.has(CombatStatusId.Poisoned)) return;
    this.poisonDamage += GameRules.PoisonDamageGrowth;
  }

  setPoisonDamage(poisonDamage) {
    if (!this.has(CombatStatusId.Poisoned)) {
      this.poisonDamage = 0;
      return;
    }
    this.poisonDamage = poisonDamage;
    if (this.poisonDamage < GameRules.PoisonInitialDamage) {
      this.poisonDamage = GameRules.PoisonInitialDamage;
    }
  }

  copyFrom(source) {
    this._activeStatuses.length = 0;
    this.poisonDamage = 0;
    if (!source) return;
    for (const s of source.activeStatuses) {
      this._activeStatuses.push(s);
    }
    this.poisonDamage = source.poisonDamage;
  }
}
