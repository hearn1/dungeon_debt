// Groups all CombatUnitState instances for one side of a combat.
export class CombatTeam {
  constructor(isPlayerSide, units) {
    this.isPlayerSide = isPlayerSide;
    // Array of CombatUnitState ordered by slot (ascending).
    this.units = units;
  }

  get hasLiving() {
    for (const u of this.units) {
      if (u.isAlive) return true;
    }
    return false;
  }

  get livingUnits() {
    return this.units.filter(u => u.isAlive);
  }

  getUnit(unitId) {
    for (const u of this.units) {
      if (u.unitId === unitId) return u;
    }
    return null;
  }
}
