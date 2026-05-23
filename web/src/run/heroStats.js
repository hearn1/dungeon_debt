// Pure hero-stat helpers shared by CombatManager and RunManager.
// Ported from the static methods on RunManager (HasRelic, GetRelicAttackBonus,
// GetRelicMaxHealthBonus, GetScaledHeroMaxHealth). Kept separate so the combat
// engine (Phase B) does not depend on the full RunManager orchestration.

import { HeroRole, RelicId } from "../data/enums.js";
import { GameRules, GameRulesFns } from "../core/GameRules.js";
import { HeroEffects } from "../combat/HeroEffects.js";

export function hasRelic(runState, relicId) {
  if (!runState) return false;
  return runState.activeRelics.includes(relicId);
}

export function getRelicAttackBonus(runState, hero) {
  if (!hero || !hero.definition) return 0;
  if (hero.definition.role === HeroRole.Damage && hasRelic(runState, RelicId.BladeCharter)) {
    return GameRules.BladeCharterAttackBonus;
  }
  return 0;
}

export function getRelicMaxHealthBonus(runState, hero) {
  if (!hero || !hero.definition) return 0;
  let bonus = 0;
  if (hero.definition.role === HeroRole.Tank && hasRelic(runState, RelicId.IronOath)) {
    bonus += GameRules.IronOathHealthBonus;
  }
  if (hasRelic(runState, RelicId.CampRations)) {
    bonus += GameRules.CampRationsHealthBonus;
  }
  return bonus;
}

export function getScaledHeroMaxHealth(hero, runState) {
  const scaledHealth = GameRulesFns.scaleCombatStat(
    HeroEffects.getTierAdjustedMaxHealth(hero),
    runState ? runState.heroHealthMultiplier : GameRules.NoCombatMultiplier,
  );
  return scaledHealth + getRelicMaxHealthBonus(runState, hero);
}
