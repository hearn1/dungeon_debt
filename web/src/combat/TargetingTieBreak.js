import { hexDistance, compareCoordsForTieBreak } from "./CombatBoard.js";

// Pure tie-break comparator applied after a mode-specific primary sort (#185).
// distanceIsPrimary: pass true when hex distance was already the primary sort key
// so it is not applied a second time.
// Sort order: distance asc → current HP asc → attack desc → board position → unitId asc.
export function tieBreakCompare(a, b, actor, board, distanceIsPrimary = false) {
  if (!distanceIsPrimary) {
    const dA = _distanceBetween(a, actor, board);
    const dB = _distanceBetween(b, actor, board);
    if (dA !== dB) return dA - dB;
  }

  if (a.currentHealth !== b.currentHealth) return a.currentHealth - b.currentHealth;
  if (a.attack !== b.attack) return b.attack - a.attack;

  const posA = board.getUnitPosition(a);
  const posB = board.getUnitPosition(b);
  if (posA && posB) {
    const cmp = compareCoordsForTieBreak(posA, posB);
    if (cmp !== 0) return cmp;
  }

  if (a.unitId < b.unitId) return -1;
  if (a.unitId > b.unitId) return 1;
  return 0;
}

function _distanceBetween(a, b, board) {
  const posA = board.getUnitPosition(a);
  const posB = board.getUnitPosition(b);
  if (!posA || !posB) return 0;
  return hexDistance(posA, posB);
}
