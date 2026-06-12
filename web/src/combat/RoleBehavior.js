// Default combat role behaviors (#187).
// Roles provide default targeting modes; per-unit effectId data can override.

import { TargetingMode, HeroRole, HeroEffectId } from "../data/enums.js";

export const RoleBehaviorDefaults = Object.freeze({
  [HeroRole.Tank]:    Object.freeze({ basicAttackTarget: TargetingMode.NearestEnemy }),
  [HeroRole.Damage]:  Object.freeze({ basicAttackTarget: TargetingMode.NearestEnemy }),
  [HeroRole.Support]: Object.freeze({
    basicAttackTarget: TargetingMode.NearestEnemy,
    defaultAllyTarget: TargetingMode.LowestHealthAlly,
  }),
  [HeroRole.Economy]: Object.freeze({ basicAttackTarget: TargetingMode.NearestEnemy }),
});

// Heroes whose effectId maps to a non-default basic attack targeting mode.
// This replaces bespoke override code with a data-driven lookup.
const _effectTargetOverrides = Object.freeze({
  [HeroEffectId.NinjaLowestTarget]: TargetingMode.LowestHealthEnemy,
  [HeroEffectId.RangerBackline]: TargetingMode.FurthestEnemy,
});

// Returns the TargetingMode for a unit's basic attack.
// effectId override > role default > NearestEnemy fallback.
export function getBasicAttackMode(unit) {
  if (unit.sourceHero && unit.sourceHero.definition) {
    const override = _effectTargetOverrides[unit.sourceHero.definition.effectId];
    if (override) return override;
    const roleDef = RoleBehaviorDefaults[unit.sourceHero.definition.role];
    if (roleDef) return roleDef.basicAttackTarget;
  }
  return TargetingMode.NearestEnemy;
}
