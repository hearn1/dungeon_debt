// Ported from DungeonDebt/Assets/Scripts/Core/GameManager.cs
// Owns GameState and all state transitions. In Unity, managers were
// MonoBehaviours wired via EnsureManagers + the scene; here GameManager
// constructs and wires them directly. Combat resolution lived in the combat
// view in Unity; resolveCombat() exposes it so the UI (and headless tests) can
// drive a fight and feed the result back through RunManager.

import { GameState } from "./GameState.js";
import { GameRules } from "./GameRules.js";
import { RunManager } from "../run/RunManager.js";
import { ShopManager } from "../run/ShopManager.js";
import { PayrollManager } from "../run/PayrollManager.js";
import { EncounterManager } from "../run/EncounterManager.js";
import { RivalManager } from "../run/RivalManager.js";
import { CombatManager } from "../combat/CombatManager.js";
import { BalanceRunLogger } from "../run/BalanceRunLogger.js";

export class GameManager {
  constructor() {
    this._currentState = GameState.MainMenu;
    this._pendingDifficulty = GameRules.DefaultDifficultyLevel;
    this._stateListeners = [];
    this._highestBeatenDifficulty = -1;

    this._payrollManager = new PayrollManager();
    this._rivalManager = new RivalManager();
    this._runManager = new RunManager(this._payrollManager, this._rivalManager);
    this._shopManager = new ShopManager(this._runManager);
    this._encounterManager = new EncounterManager(this._runManager);
    this._combatManager = new CombatManager();
  }

  get currentState() { return this._currentState; }
  get currentRunState() { return this._runManager ? this._runManager.currentRunState : null; }
  get runManager() { return this._runManager; }
  get shopManager() { return this._shopManager; }
  get payrollManager() { return this._payrollManager; }
  get encounterManager() { return this._encounterManager; }
  get rivalManager() { return this._rivalManager; }
  get highestBeatenDifficulty() { return this._highestBeatenDifficulty; }

  isDifficultyLocked(difficulty) {
    if (!difficulty || !difficulty.isImplemented) return true;
    if (difficulty.level === 0) return false;
    return difficulty.level > this._highestBeatenDifficulty + 1;
  }

  // Replaces the C# `event Action<GameState> OnStateChanged`.
  onStateChanged(listener) {
    this._stateListeners.push(listener);
    return () => {
      const idx = this._stateListeners.indexOf(listener);
      if (idx !== -1) this._stateListeners.splice(idx, 1);
    };
  }

  startRun(difficultyLevel = this._pendingDifficulty) {
    this._pendingDifficulty = difficultyLevel;
    this.changeState(GameState.StartRun);
    this.changeState(GameState.Scout);
  }

  returnToMainMenu() {
    this.changeState(GameState.MainMenu);
  }

  continueFromScout() { this.changeState(GameState.Shop); }
  continueFromShop() { this.changeState(GameState.Formation); }
  continueFromFormation() { this.changeState(GameState.Payroll); }

  selectPayrollAction(actionId) {
    const runState = this.currentRunState;
    if (!runState) return;
    runState.selectedPayrollAction = actionId;
  }

  continueFromPayroll() {
    const runState = this.currentRunState;
    if (runState && runState.selectedPayrollAction !== null && runState.selectedPayrollAction !== undefined && this._payrollManager) {
      this._payrollManager.apply(runState, runState.selectedPayrollAction);
    }
    this.changeState(GameState.Combat);
  }

  // Resolve the current encounter and fold the result into the run. Returns the
  // CombatResult so the UI can replay its log. Mirrors what the Unity combat
  // view did before transitioning to the Reward state.
  resolveCombat() {
    const runState = this.currentRunState;
    if (!runState) return null;
    const encounter = runState.currentEncounter;
    const result = this._combatManager.startCombat(runState, encounter);
    this._runManager.applyPostCombatResult(result, encounter);
    return result;
  }

  continueAfterReward() {
    if (!this._runManager) return;

    const nextState = this._runManager.evaluateNextState();
    const runState = this.currentRunState;
    BalanceRunLogger.logRound(runState, nextState);
    if (runState) runState.selectedPayrollAction = null;

    if (this._runManager.tryPreparePendingRelicReward(nextState)) {
      this.changeState(GameState.RelicReward);
      return;
    }

    this.changeState(nextState);
  }

  continueAfterRelicReward(relicId) {
    if (!this._runManager) return;
    const nextState = this._runManager.selectPendingRelic(relicId);
    this.changeState(nextState);
  }

  continueToNextAct() {
    if (!this._runManager) return;
    this._runManager.advanceToNextAct();
    this.changeState(GameState.Scout);
  }

  continueFromRivalUpdate() {
    if (!this._runManager) return;
    this._runManager.advanceRound();
    this.changeState(GameState.Scout);
  }

  changeState(nextState) {
    this._currentState = nextState;

    if (this._currentState === GameState.StartRun && this._runManager) {
      this._runManager.initializeRun(this._pendingDifficulty);
    }

    if (this._currentState === GameState.Scout && this._encounterManager) {
      const runState = this.currentRunState;
      const round = runState ? runState.round : 1;
      this._encounterManager.loadEncounter(round);
    }

    if (this._currentState === GameState.Shop && this._shopManager) {
      this._shopManager.generateOffers();
    }

    if (this._currentState === GameState.RivalUpdate && this._rivalManager) {
      this._rivalManager.advanceRivals(this.currentRunState);
    }

    if (this._currentState === GameState.Victory && this._runManager) {
      const run = this._runManager.currentRunState;
      if (run && run.selectedDifficulty !== null && run.selectedDifficulty > this._highestBeatenDifficulty) {
        this._highestBeatenDifficulty = run.selectedDifficulty;
      }
    }

    for (const listener of this._stateListeners) {
      listener(this._currentState);
    }
  }
}
