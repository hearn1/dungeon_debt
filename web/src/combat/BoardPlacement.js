import { GameRules } from "../core/GameRules.js";

// Default slot-to-board fallback mapping (issue #165/#177).
// These positions are used when a hero/enemy has no explicit boardPosition.

const PLAYER_DEFAULTS = Object.freeze([
  Object.freeze({ q: 1, r: 1 }),  // slot 0
  Object.freeze({ q: 1, r: 3 }),  // slot 1
  Object.freeze({ q: 0, r: 0 }),  // slot 2
  Object.freeze({ q: 0, r: 2 }),  // slot 3
  Object.freeze({ q: 0, r: 4 }),  // slot 4
]);

const ENEMY_DEFAULTS = Object.freeze([
  Object.freeze({ q: 5, r: 1 }),  // slot 0
  Object.freeze({ q: 5, r: 3 }),  // slot 1
  Object.freeze({ q: 6, r: 0 }),  // slot 2
  Object.freeze({ q: 6, r: 2 }),  // slot 3
  Object.freeze({ q: 6, r: 4 }),  // slot 4
]);

export function getDefaultPlayerBoardPosition(slot) {
  return PLAYER_DEFAULTS[slot] || PLAYER_DEFAULTS[0];
}

export function getDefaultEnemyBoardPosition(slot) {
  return ENEMY_DEFAULTS[slot] || ENEMY_DEFAULTS[0];
}

export function isInPlayerZone(coord) {
  return coord.q >= 0 && coord.q <= GameRules.PlayerDeploymentMaxQ
    && coord.r >= 0 && coord.r < GameRules.HexBoardHeight;
}

export function isInEnemyZone(coord) {
  return coord.q >= GameRules.EnemyDeploymentMinQ && coord.q < GameRules.HexBoardWidth
    && coord.r >= 0 && coord.r < GameRules.HexBoardHeight;
}

// Returns the board position for a player unit, falling back to slot default.
export function resolvePlayerBoardPosition(hero) {
  if (hero.boardPosition) return hero.boardPosition;
  return getDefaultPlayerBoardPosition(hero.formationSlot);
}

// Returns the board position for an enemy unit at index `i` in an encounter.
// Uses encounter-authored position if available, otherwise slot default.
export function resolveEnemyBoardPosition(encounter, index) {
  if (encounter.enemyBoardPositions && encounter.enemyBoardPositions[index]) {
    return encounter.enemyBoardPositions[index];
  }
  return getDefaultEnemyBoardPosition(index);
}
