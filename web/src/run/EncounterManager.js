// Ported from DungeonDebt/Assets/Scripts/Run/EncounterManager.cs
import { GameRulesFns } from "../core/GameRules.js";
import { DataRepository } from "../core/DataRepository.js";

export class EncounterManager {
  constructor(runManager = null) {
    this._runManager = runManager;
  }

  initialize(runManager) {
    this._runManager = runManager;
  }

  loadEncounter(round) {
    const runState = this._runManager ? this._runManager.currentRunState : null;

    const act = runState && runState.act > 0 ? runState.act : GameRulesFns.getActForRound(round);
    const slot = GameRulesFns.getRoundWithinAct(act, round);

    const encounter = this._selectFromPool(DataRepository.getEncounterPool(act, slot));

    if (runState) runState.currentEncounter = encounter;
    return encounter;
  }

  // One slot can hold several candidate encounters. Combat stays deterministic;
  // only which encounter the slot serves is randomized, through the run's RNG.
  _selectFromPool(pool) {
    if (!pool || pool.length === 0) return null;
    if (pool.length === 1) return pool[0];
    if (this._runManager && this._runManager.rng) {
      return pool[this._runManager.rng.next(pool.length)];
    }
    return pool[0];
  }
}
