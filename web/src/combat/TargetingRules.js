// Reusable targeting rule framework (#178 + #179).
// All functions are query-only; none mutate combat state.

import { TargetingMode } from "../data/enums.js";
import { hexDistance } from "./CombatBoard.js";
import { tieBreakCompare } from "./TargetingTieBreak.js";

// Main target-selection entry point.
// actor: the acting CombatUnitState
// match: CombatMatch (provides teams + board)
// mode: TargetingMode value
// currentTargetUnitId: unit id of the actor's current target; used by
//   CurrentTargetOrNearestEnemy to reuse a valid live target
// Returns one CombatUnitState or null.
export function selectTarget({ actor, match, mode, currentTargetUnitId = null }) {
  if (mode === TargetingMode.Self) return actor;

  if (mode === TargetingMode.CurrentTargetOrNearestEnemy) {
    if (currentTargetUnitId) {
      const current = match.allUnits.find(u => u.unitId === currentTargetUnitId);
      if (current && current.isAlive && _isTargetUsable(actor, current, match.board)) return current;
    }
    return _selectFromCandidates(TargetingMode.NearestEnemy, actor,
      filterLiving(getEnemiesOf(actor, match)), match.board);
  }

  if (_isAllyMode(mode)) {
    // Exclude self from ally targeting (e.g. LowestHealthAlly finds the most
    // injured other ally; Self mode is for self-targeting).
    const allies = filterLiving(getAlliesOf(actor, match));
    return _selectFromCandidates(mode, actor, allies, match.board);
  }

  const enemies = filterLiving(getEnemiesOf(actor, match));
  return _selectFromCandidates(mode, actor, enemies, match.board);
}

export function filterLiving(candidates) {
  return candidates.filter(u => u.isAlive);
}

export function getEnemiesOf(actor, match) {
  return match.oppositeTeam(actor).units;
}

// Returns all teammates of actor, excluding actor itself.
export function getAlliesOf(actor, match) {
  const team = actor.isPlayerSide ? match.playerTeam : match.enemyTeam;
  return team.units.filter(u => u !== actor);
}

function _isAllyMode(mode) {
  return mode === TargetingMode.LowestHealthAlly;
}

function _distanceBetween(a, b, board) {
  const posA = board.getUnitPosition(a);
  const posB = board.getUnitPosition(b);
  if (!posA || !posB) return 0;
  return hexDistance(posA, posB);
}

function _selectFromCandidates(mode, actor, candidates, board) {
  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => {
    switch (mode) {
      case TargetingMode.NearestEnemy: {
        const reachableA = _targetUsabilityRank(actor, a, board);
        const reachableB = _targetUsabilityRank(actor, b, board);
        if (reachableA !== reachableB) return reachableA - reachableB;
        const dA = _distanceBetween(a, actor, board);
        const dB = _distanceBetween(b, actor, board);
        if (dA !== dB) return dA - dB;
        return tieBreakCompare(a, b, actor, board, true);
      }
      case TargetingMode.FurthestEnemy: {
        const dA = _distanceBetween(a, actor, board);
        const dB = _distanceBetween(b, actor, board);
        if (dA !== dB) return dB - dA;
        return tieBreakCompare(a, b, actor, board, true);
      }
      case TargetingMode.LowestHealthEnemy: {
        if (a.currentHealth !== b.currentHealth) return a.currentHealth - b.currentHealth;
        return tieBreakCompare(a, b, actor, board, false);
      }
      case TargetingMode.HighestAttackEnemy: {
        if (a.attack !== b.attack) return b.attack - a.attack;
        return tieBreakCompare(a, b, actor, board, false);
      }
      case TargetingMode.LowestHealthAlly: {
        const pctA = a.maxHealth > 0 ? a.currentHealth / a.maxHealth : 0;
        const pctB = b.maxHealth > 0 ? b.currentHealth / b.maxHealth : 0;
        if (pctA !== pctB) return pctA - pctB;
        if (a.currentHealth !== b.currentHealth) return a.currentHealth - b.currentHealth;
        return tieBreakCompare(a, b, actor, board, false);
      }
      default:
        return 0;
    }
  })[0] || null;
}

function _isTargetUsable(actor, target, board) {
  return _targetUsabilityRank(actor, target, board) === 0;
}

function _targetUsabilityRank(actor, target, board) {
  const actorPos = board.getUnitPosition(actor);
  const targetPos = board.getUnitPosition(target);
  if (!actorPos || !targetPos) return 1;
  if (board.canAttack(actor, target)) return 0;
  return board.findNearestReachableAdjacentTile(actor, targetPos) ? 0 : 1;
}
