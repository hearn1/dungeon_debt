import { GameRules } from "../core/GameRules.js";

// ---- Axial hex coordinate helpers (issue #175) --------------------------------

export function coordKey(coord) {
  return `${coord.q},${coord.r}`;
}

export function isSameCoord(a, b) {
  return a.q === b.q && a.r === b.r;
}

// Deterministic tie-break: lower q first, then lower r.
export function compareCoordsForTieBreak(a, b) {
  if (a.q !== b.q) return a.q - b.q;
  return a.r - b.r;
}

export function isInBounds(coord) {
  return coord.q >= 0 && coord.q < GameRules.HexBoardWidth
    && coord.r >= 0 && coord.r < GameRules.HexBoardHeight;
}

// Six axial neighbor directions, sorted by tie-break order for determinism.
const HEX_DIRS = [
  { q: -1, r: 0 }, { q: -1, r: 1 },
  { q: 0, r: -1 }, { q: 0, r: 1 },
  { q: 1, r: -1 }, { q: 1, r: 0 },
];

export function getNeighbors(coord) {
  const result = [];
  for (const d of HEX_DIRS) {
    const n = { q: coord.q + d.q, r: coord.r + d.r };
    if (isInBounds(n)) result.push(n);
  }
  result.sort(compareCoordsForTieBreak);
  return result;
}

// Axial hex distance formula.
export function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
}

// ---- CombatBoard (occupancy + pathfinding) ------------------------------------

export class CombatBoard {
  constructor() {
    // Map<coordKey, unitId> — which tile is occupied by which unit.
    this._occupancy = new Map();
    // Map<unitId, {q,r}> — where each unit currently stands.
    this._positions = new Map();
  }

  // Returns the tiles occupied by `unit` when placed at `originCoord`.
  // MVP: every unit occupies exactly one tile. All occupancy validation flows
  // through this helper so future multi-tile bosses don't require rewrites.
  getUnitFootprint(unit, originCoord) {
    return [originCoord];
  }

  canPlaceFootprint(unit, originCoord) {
    for (const coord of this.getUnitFootprint(unit, originCoord)) {
      if (!isInBounds(coord)) return false;
      if (this.isOccupied(coord)) return false;
    }
    return true;
  }

  // --- Placement / movement ---

  // Returns true on success, false if the tile is out of bounds or occupied.
  placeUnit(unit, originCoord) {
    if (!isInBounds(originCoord)) return false;
    for (const coord of this.getUnitFootprint(unit, originCoord)) {
      if (this.isOccupied(coord)) return false;
    }
    for (const coord of this.getUnitFootprint(unit, originCoord)) {
      this._occupancy.set(coordKey(coord), unit.unitId);
    }
    this._positions.set(unit.unitId, originCoord);
    return true;
  }

  // Moves an already-placed unit to a new origin. Returns false if the unit
  // is not on the board or the destination tiles are blocked by another unit.
  moveUnit(unit, newOriginCoord) {
    if (!this._positions.has(unit.unitId)) return false;
    const oldCoord = this._positions.get(unit.unitId);
    const newFootprint = this.getUnitFootprint(unit, newOriginCoord);
    for (const coord of newFootprint) {
      if (!isInBounds(coord)) return false;
      const occupant = this._occupancy.get(coordKey(coord));
      if (occupant && occupant !== unit.unitId) return false;
    }
    for (const coord of this.getUnitFootprint(unit, oldCoord)) {
      this._occupancy.delete(coordKey(coord));
    }
    for (const coord of newFootprint) {
      this._occupancy.set(coordKey(coord), unit.unitId);
    }
    this._positions.set(unit.unitId, newOriginCoord);
    return true;
  }

  removeUnit(unit) {
    const coord = this._positions.get(unit.unitId);
    if (coord === undefined) return;
    for (const c of this.getUnitFootprint(unit, coord)) {
      this._occupancy.delete(coordKey(c));
    }
    this._positions.delete(unit.unitId);
  }

  // --- Queries ---

  // Returns the unitId occupying the tile, or null.
  getUnitAt(coord) {
    return this._occupancy.get(coordKey(coord)) || null;
  }

  isOccupied(coord) {
    return this._occupancy.has(coordKey(coord));
  }

  // Returns the origin coord for a unit, or null if not on the board.
  getUnitPosition(unit) {
    return this._positions.get(unit.unitId) || null;
  }

  // Returns unitIds of all units whose origin is within `range` hexes.
  getUnitsInRange(originCoord, range) {
    const result = [];
    for (const [key, unitId] of this._occupancy) {
      const [q, r] = key.split(',').map(Number);
      if (hexDistance(originCoord, { q, r }) <= range) result.push(unitId);
    }
    return result;
  }

  // Returns true when the attacker's board position is within its attackRange
  // of the target's board position.
  canAttack(attacker, target) {
    const aPos = this.getUnitPosition(attacker);
    const tPos = this.getUnitPosition(target);
    if (!aPos || !tPos) return false;
    return hexDistance(aPos, tPos) <= attacker.attackRange;
  }

  // ---- BFS pathfinding (issue #176) ------------------------------------------

  // Returns the shortest path from startCoord to goalCoord as an array of
  // coords (including start and goal), or null if unreachable.
  // Tiles occupied by units other than movingUnitId are treated as blocked.
  findPath(startCoord, goalCoord, movingUnitId) {
    if (!isInBounds(goalCoord)) return null;
    const goalOccupant = this.getUnitAt(goalCoord);
    if (goalOccupant && goalOccupant !== movingUnitId) return null;

    if (isSameCoord(startCoord, goalCoord)) return [startCoord];

    const queue = [{ coord: startCoord, path: [startCoord] }];
    const visited = new Set([coordKey(startCoord)]);

    while (queue.length > 0) {
      const { coord, path } = queue.shift();
      for (const neighbor of getNeighbors(coord)) {
        const key = coordKey(neighbor);
        if (visited.has(key)) continue;
        const occupant = this.getUnitAt(neighbor);
        if (occupant && occupant !== movingUnitId) continue; // body blocked
        visited.add(key);
        const newPath = [...path, neighbor];
        if (isSameCoord(neighbor, goalCoord)) return newPath;
        queue.push({ coord: neighbor, path: newPath });
      }
    }
    return null;
  }

  // Returns all tiles reachable from startCoord within movementRange steps,
  // excluding the start tile itself. Occupied tiles (by other units) block movement.
  getReachableTiles(startCoord, movementRange, movingUnitId) {
    const reachable = [];
    const visited = new Map([[coordKey(startCoord), 0]]);
    const queue = [{ coord: startCoord, dist: 0 }];

    while (queue.length > 0) {
      const { coord, dist } = queue.shift();
      if (dist > 0) reachable.push(coord);
      if (dist >= movementRange) continue;
      for (const neighbor of getNeighbors(coord)) {
        const key = coordKey(neighbor);
        if (visited.has(key)) continue;
        const occupant = this.getUnitAt(neighbor);
        if (occupant && occupant !== movingUnitId) continue;
        visited.set(key, dist + 1);
        queue.push({ coord: neighbor, dist: dist + 1 });
      }
    }
    return reachable;
  }

  canMoveUnit(unit, destinationCoord, movementRange) {
    const startCoord = this.getUnitPosition(unit);
    if (!startCoord) return false;
    if (!isInBounds(destinationCoord)) return false;
    const occupant = this.getUnitAt(destinationCoord);
    if (occupant && occupant !== unit.unitId) return false;
    const path = this.findPath(startCoord, destinationCoord, unit.unitId);
    if (!path) return false;
    return (path.length - 1) <= movementRange;
  }

  // Finds the nearest empty tile adjacent to targetCoord that this unit can
  // reach via any path (not limited by movementRange). Used by moveUnitToward
  // to determine the long-range destination when the unit cannot get there in
  // one action. Returns null if all adjacent tiles are blocked.
  findNearestReachableAdjacentTile(unit, targetCoord) {
    const startCoord = this.getUnitPosition(unit);
    if (!startCoord) return null;

    const candidates = getNeighbors(targetCoord).filter(c => {
      const occupant = this.getUnitAt(c);
      return !occupant || occupant === unit.unitId;
    });
    if (candidates.length === 0) return null;

    let best = null;
    let bestPathLen = Infinity;

    for (const candidate of candidates) {
      const path = this.findPath(startCoord, candidate, unit.unitId);
      if (!path) continue;
      const dist = path.length - 1;
      if (dist < bestPathLen || (dist === bestPathLen && compareCoordsForTieBreak(candidate, best) < 0)) {
        best = candidate;
        bestPathLen = dist;
      }
    }
    return best;
  }

  // Moves the unit up to movementRange steps along the shortest path toward
  // an empty tile adjacent to targetCoord. Returns true if the unit moved.
  moveUnitToward(unit, targetCoord, movementRange) {
    const startCoord = this.getUnitPosition(unit);
    if (!startCoord) return false;

    const dest = this.findNearestReachableAdjacentTile(unit, targetCoord);
    if (!dest) return false;
    if (isSameCoord(startCoord, dest)) return false; // already adjacent

    const path = this.findPath(startCoord, dest, unit.unitId);
    if (!path || path.length < 2) return false;

    const steps = Math.min(movementRange, path.length - 1);
    return this.moveUnit(unit, path[steps]);
  }
}
