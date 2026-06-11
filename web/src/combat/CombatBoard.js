import { GameRules } from "../core/GameRules.js";

// MVP positional model for a combat using the existing five-slot formation.
// Provides range checks for the tick-based simulation. Full hex-grid pathing
// (issue #157/#172 follow-up) will replace the slot-adapter logic here.
export class CombatBoard {
  constructor(playerTeam, enemyTeam) {
    this._playerTeam = playerTeam;
    this._enemyTeam = enemyTeam;
  }

  // Returns true when attacker can execute an attack against target this tick.
  // Melee units may only reach the enemy backline after the frontline collapses.
  // Ranged units (attackRange >= DefaultRangedRange) can always attack.
  canAttack(attacker, target) {
    if (attacker.attackRange >= GameRules.DefaultRangedRange) return true;
    return this._inMeleeRange(attacker, target);
  }

  _inMeleeRange(attacker, target) {
    // MVP: the target's frontline is always reachable.
    // The target's backline is reachable only when their frontline has collapsed.
    if (target.slot < GameRules.FrontlineSlots) return true;

    const defenderTeam = target.isPlayerSide ? this._playerTeam : this._enemyTeam;
    const frontlineAlive = defenderTeam.units.some(
      u => u.isAlive && u.slot < GameRules.FrontlineSlots
    );
    return !frontlineAlive;
  }
}
