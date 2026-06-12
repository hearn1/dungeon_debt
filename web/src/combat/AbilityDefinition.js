import { AbilityType, AbilityTrigger, TargetShape, TargetingMode } from "../data/enums.js";

// Data shape for a single passive or active ability.
// `execute` is the only mutable callsite; the definition itself is frozen.
//
// Passive fields:  trigger, maxStacks, execute(ctx)
// Active fields:   cooldownTicks, targetMode, targetShape, execute(ctx)
//
// ctx shape passed to execute:
//   { caster, target, targets[], match, run, logger, abilityState, tick }
export class AbilityDefinition {
  constructor({
    id,
    type,
    trigger = null,
    cooldownTicks = 0,
    targetMode = TargetingMode.NearestEnemy,
    targetShape = TargetShape.Single,
    maxStacks = 1,
    execute,
  }) {
    this.id = id;
    this.type = type;
    this.trigger = trigger;
    this.cooldownTicks = cooldownTicks;
    this.targetMode = targetMode;
    this.targetShape = targetShape;
    this.maxStacks = maxStacks;
    this.execute = execute;
    Object.freeze(this);
  }
}
