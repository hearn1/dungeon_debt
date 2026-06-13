import { GameRules, GameRulesFns } from "../core/GameRules.js";

const DefaultScale = Object.freeze({ enemyHealth: 1, enemyAttack: 1 });
const DefaultCurve = Object.freeze({
  enemyHealthStart: 1,
  enemyHealthEnd: 1,
  enemyAttackStart: 1,
  enemyAttackEnd: 1,
});

export function getEncounterScaling(act, slot, encounterType) {
  const actNumber = normalizePositiveInt(act, 1);
  const slotNumber = normalizePositiveInt(slot, 1);
  const roundsInAct = GameRulesFns.getRoundsInAct(actNumber);
  const clampedSlot = Math.min(slotNumber, roundsInAct);
  const progress = roundsInAct > 1 ? (clampedSlot - 1) / (roundsInAct - 1) : 0;
  const curve = GameRules.EncounterProgressionScale[actNumber] || DefaultCurve;
  const typeScale = GameRules.EncounterTypeScale[encounterType] || DefaultScale;

  return Object.freeze({
    enemyHealth: roundMultiplier(lerp(curve.enemyHealthStart, curve.enemyHealthEnd, progress) * typeScale.enemyHealth),
    enemyAttack: roundMultiplier(lerp(curve.enemyAttackStart, curve.enemyAttackEnd, progress) * typeScale.enemyAttack),
  });
}

function normalizePositiveInt(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) return fallback;
  return number;
}

function lerp(start, end, progress) {
  return start + ((end - start) * progress);
}

function roundMultiplier(value) {
  return Math.round(value * 1000) / 1000;
}
