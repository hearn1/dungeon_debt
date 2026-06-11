import { CombatUnit } from "./CombatUnit.js";

// Runtime-only mutable state for a unit inside a tick-based simulation.
// Extends CombatUnit with deterministic ID, timing, range, and targeting fields.
// Timing state is never written back to HeroInstance or EnemyDefinition.
export class CombatUnitState extends CombatUnit {
  constructor(unitId, displayName, attack, currentHealth, maxHealth, isPlayerSide, slot, sourceHero, sourceEnemy) {
    super(displayName, attack, currentHealth, maxHealth, isPlayerSide, slot, sourceHero, sourceEnemy);
    this.unitId = unitId;

    // Tick when this unit may next act (0 = ready immediately).
    this.nextAttackAt = 0;

    // Number of ticks between successive attacks. Set by the match builder from GameRules.
    this.attackIntervalTicks = 0;

    // Attack range: DefaultMeleeRange (melee) or DefaultRangedRange (ranged).
    this.attackRange = 0;

    // UnitId of the current target; cleared when target dies or becomes invalid.
    this.currentTargetUnitId = null;
  }
}
