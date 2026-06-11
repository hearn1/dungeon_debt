// Protection and interception support (#186).
// Provides hooks for ability-driven intercept behavior without a global threat system.
// All functions are query-only; none mutate combat state.

import { hexDistance, compareCoordsForTieBreak } from "./CombatBoard.js";

// Returns all living allied units eligible to intercept an incoming attack on target.
// protectionRule: { mustBeAdjacent?: boolean }
export function findEligibleProtectors({ target, match, protectionRule = {} }) {
  const team = target.isPlayerSide ? match.playerTeam : match.enemyTeam;
  return team.units.filter(u => {
    if (u === target) return false;
    if (!u.isAlive) return false;
    if (protectionRule.mustBeAdjacent && !_isAdjacent(u, target, match.board)) return false;
    return true;
  });
}

// Selects the best protector from eligible candidates.
// Tie-break order: shortest distance to protected unit → highest current HP
//   → board position (q asc, r asc) → unitId asc.
export function selectProtector({ protectors, target, match }) {
  if (!protectors || protectors.length === 0) return null;
  const board = match.board;

  return [...protectors].sort((a, b) => {
    const dA = _distanceBetween(a, target, board);
    const dB = _distanceBetween(b, target, board);
    if (dA !== dB) return dA - dB;
    if (a.currentHealth !== b.currentHealth) return b.currentHealth - a.currentHealth;
    const posA = board.getUnitPosition(a);
    const posB = board.getUnitPosition(b);
    if (posA && posB) {
      const cmp = compareCoordsForTieBreak(posA, posB);
      if (cmp !== 0) return cmp;
    }
    if (a.unitId < b.unitId) return -1;
    if (a.unitId > b.unitId) return 1;
    return 0;
  })[0];
}

// Returns the unit that should receive the attack: the protector if one is
// eligible, otherwise originalTarget. Does not apply any damage.
export function resolveInterception({ attacker, originalTarget, match, protectionRule }) {
  const protectors = findEligibleProtectors({ target: originalTarget, match, protectionRule });
  if (protectors.length === 0) return originalTarget;
  return selectProtector({ protectors, target: originalTarget, match }) || originalTarget;
}

function _distanceBetween(a, b, board) {
  const posA = board.getUnitPosition(a);
  const posB = board.getUnitPosition(b);
  if (!posA || !posB) return 0;
  return hexDistance(posA, posB);
}

function _isAdjacent(a, b, board) {
  return _distanceBetween(a, b, board) === 1;
}
