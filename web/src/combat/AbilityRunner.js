// Passive trigger dispatch and active cooldown auto-casting.
// Keeps all ability execution out of CombatManager's tick loop.

import { AbilityType, AbilityTrigger, TargetShape, TargetingMode } from "../data/enums.js";
import { selectTarget, getAlliesOf, getEnemiesOf, filterLiving } from "./TargetingRules.js";
import { hexDistance } from "./CombatBoard.js";

export const AbilityRunner = {
  // --- Passive trigger API ---

  // Fire all passive abilities on `units` that match `trigger`.
  // `ctx` is merged with per-unit data before calling ability.execute.
  triggerPassives(trigger, units, baseCtx) {
    for (const unit of units) {
      if (!unit.isAlive) continue;
      const ability = _getPassive(unit);
      if (!ability || ability.trigger !== trigger) continue;

      baseCtx.logger?.logPassiveTrigger(unit, trigger, ability.id);
      const ctx = _buildCtx(unit, null, [], baseCtx);
      ability.execute(ctx);
    }
  },

  // Passive trigger where a secondary "victim" unit is relevant (e.g. OnDamageTaken,
  // AfterAttack, OnKill). `subject` is the unit whose passive fires; `other` is the
  // second participant.
  triggerPassiveOn(trigger, subject, other, baseCtx) {
    if (!subject || !subject.isAlive) return;
    const ability = _getPassive(subject);
    if (!ability || ability.trigger !== trigger) return;

    baseCtx.logger?.logPassiveTrigger(subject, trigger, ability.id);
    const ctx = _buildCtx(subject, other, other ? [other] : [], baseCtx);
    ability.execute(ctx);
  },

  // PreUpkeep passives run outside combat; units list comes from run.party (HeroInstances).
  triggerPreUpkeepPassives(party, run) {
    for (const hero of party) {
      if (!hero || !hero.definition || !hero.definition.passiveAbility) continue;
      const ability = hero.definition.passiveAbility;
      if (ability.trigger !== AbilityTrigger.PreUpkeep) continue;
      ability.execute({ hero, run });
    }
  },

  // CombatEnd passives run outside the tick loop.
  triggerCombatEndPassives(party, run, result, logger) {
    if (!party || !run) return;
    for (const hero of party) {
      if (!hero || !hero.definition || !hero.definition.passiveAbility) continue;
      const ability = hero.definition.passiveAbility;
      if (ability.trigger !== AbilityTrigger.CombatEnd) continue;
      ability.execute({ hero, run, result, logger });
    }
  },

  // --- Active ability API ---

  // Initialise active cooldowns for all units at match start.
  initActiveCooldowns(units) {
    for (const unit of units) {
      const ability = _getActive(unit);
      if (!ability) continue;
      // First cast available after one full cooldown.
      unit.abilityState.nextActiveAt = ability.cooldownTicks;
    }
  },

  // Check active abilities that are ready at `tick` and reserve their cooldowns.
  // Execution is deferred to CombatManager's timeline resolution pass.
  collectActiveIntents(tick, units, match) {
    const intents = [];
    for (const unit of units) {
      if (!unit.isAlive) continue;
      const ability = _getActive(unit);
      if (!ability) continue;
      if (unit.abilityState.nextActiveAt > tick) continue;

      const target = selectTarget({
        actor: unit,
        match,
        mode: ability.targetMode,
        currentTargetUnitId: null,
      });

      if (!target) continue; // no valid target — skip, do not reset cooldown

      const targets = resolveTargets(unit, target, ability.targetShape, match);
      unit.abilityState.nextActiveAt = tick + ability.cooldownTicks;
      intents.push({ caster: unit, ability, target, targets });
    }
    return intents;
  },

  resolveActiveCast(event, match, run, logger) {
    const { caster, ability, target, targets } = event;
    if (!caster || caster.deathResolved) return false;
    if (target && target.deathResolved) return false;

    logger?.logAbilityCast(caster, targets, ability.id);
    const livingBefore = new Set(match.allUnits.filter(u => u.isAlive).map(u => u.unitId));
    const ctx = _buildCtx(caster, target, targets, { match, run, logger });
    ability.execute(ctx);
    caster.abilityState.castCount += 1;

    // Active ability damage helpers currently log Death directly. Mark those
    // units resolved so later timeline phases do not act with them again.
    for (const unit of match.allUnits) {
      if (!livingBefore.has(unit.unitId)) continue;
      if (unit.isAlive || unit.deathResolved) continue;
      unit.pendingDeath = false;
      unit.deathResolved = true;
    }

    return true;
  },

  // Legacy compatibility wrapper for direct callers. CombatManager uses the
  // intent/resolution API above.
  processActives(tick, units, match, run, logger) {
    const intents = this.collectActiveIntents(tick, units, match);
    for (const intent of intents) {
      this.resolveActiveCast(intent, match, run, logger);
    }
    return intents.length > 0;
  },
};

// --- Target shape resolution ---

export function resolveTargets(caster, primaryTarget, shape, match) {
  if (!primaryTarget) return [];

  switch (shape) {
    case TargetShape.Single:
      return [primaryTarget];

    case TargetShape.Self:
      return [caster];

    case TargetShape.AdjacentEnemies: {
      const primaryPos = match.board.getUnitPosition(primaryTarget);
      if (!primaryPos) return [primaryTarget];
      const enemies = filterLiving(getEnemiesOf(caster, match));
      const adjacent = enemies.filter(u => {
        const pos = match.board.getUnitPosition(u);
        return pos && hexDistance(primaryPos, pos) <= 1;
      });
      // Sort deterministically by board position.
      adjacent.sort((a, b) => {
        const pa = match.board.getUnitPosition(a);
        const pb = match.board.getUnitPosition(b);
        if (pa.q !== pb.q) return pa.q - pb.q;
        return pa.r - pb.r;
      });
      return adjacent.length > 0 ? adjacent : [primaryTarget];
    }

    case TargetShape.AllAllies: {
      const allies = filterLiving(getAlliesOf(caster, match));
      return allies;
    }

    case TargetShape.AllEnemies: {
      return filterLiving(getEnemiesOf(caster, match));
    }

    default:
      return [primaryTarget];
  }
}

// --- Helpers ---

function _getPassive(unit) {
  if (!unit.sourceHero || !unit.sourceHero.definition) return null;
  return unit.sourceHero.definition.passiveAbility || null;
}

function _getActive(unit) {
  if (!unit.sourceHero || !unit.sourceHero.definition) return null;
  return unit.sourceHero.definition.activeAbility || null;
}

function _buildCtx(caster, target, targets, extra) {
  return { caster, target, targets, abilityState: caster.abilityState, ...extra };
}
