// Ported from DungeonDebt/Assets/Scripts/Data/CombatResult.cs
// SurvivorFlags is a plain object keyed by "<enemyId>Survived".
export class CombatResult {
  constructor() {
    this.playerWon = false;
    this.combatRoundsElapsed = 0;
    this.logLines = [];
    this.replayEvents = [];
    this.survivorFlags = {};
    this.deadHeroes = [];
    this.playerStartUnits = [];
    this.enemyStartUnits = [];
    this.playerFinalUnits = [];
    this.enemyFinalUnits = [];
  }
}
