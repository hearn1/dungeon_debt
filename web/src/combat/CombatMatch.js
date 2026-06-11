// Owns one autobattle combat instance: both teams, the board, and tick/round metadata.
export class CombatMatch {
  constructor(playerTeam, enemyTeam, board) {
    this.playerTeam = playerTeam;
    this.enemyTeam = enemyTeam;
    this.board = board;

    // Current simulation tick (increments each step of the loop).
    this.currentTick = 0;

    // Number of fully elapsed combat rounds (matches CombatResult.combatRoundsElapsed).
    this.combatRoundsElapsed = 0;
  }

  // All units from both teams in a single flat array.
  get allUnits() {
    return [...this.playerTeam.units, ...this.enemyTeam.units];
  }

  // Returns the opposing team for a given unit.
  oppositeTeam(unit) {
    return unit.isPlayerSide ? this.enemyTeam : this.playerTeam;
  }

  // Win/loss helpers (convenience wrappers around team state).
  get playerWins() { return !this.enemyTeam.hasLiving; }
  get playerLoses() { return !this.playerTeam.hasLiving; }
}
