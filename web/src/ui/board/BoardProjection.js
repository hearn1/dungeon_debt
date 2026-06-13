import { GameRules } from "../../core/GameRules.js";

export const BoardProjectionMode = Object.freeze({
  LeftRight: "LeftRight",
  BottomTop: "BottomTop",
});

export const BoardVisualSide = Object.freeze({
  Player: "Player",
  Opponent: "Opponent",
  Neutral: "Neutral",
});

export const BoardProjectionDefaults = Object.freeze({
  tileSize: 72,
  gap: 6,
  stagger: 38,
  tokenSize: 70,
});

export function getBoardVisualSide(coord) {
  if (coord.q <= GameRules.PlayerDeploymentMaxQ) return BoardVisualSide.Player;
  if (coord.q >= GameRules.EnemyDeploymentMinQ) return BoardVisualSide.Opponent;
  return BoardVisualSide.Neutral;
}

export function projectBoardTile(coord, options = {}) {
  const mode = options.mode || BoardProjectionMode.BottomTop;
  const metrics = getProjectionMetrics(options);
  if (mode === BoardProjectionMode.LeftRight) return projectLeftRight(coord, metrics);
  return projectBottomTop(coord, metrics);
}

export function projectUnitPosition(coord, options = {}) {
  const tile = projectBoardTile(coord, options);
  const metrics = getProjectionMetrics(options);
  const inset = Math.floor((metrics.tileSize - metrics.tokenSize) / 2);
  return {
    x: tile.x + inset,
    y: tile.y + inset,
  };
}

export function getProjectedBoardSize(options = {}) {
  const mode = options.mode || BoardProjectionMode.BottomTop;
  const metrics = getProjectionMetrics(options);
  if (mode === BoardProjectionMode.LeftRight) {
    return {
      width: GameRules.HexBoardWidth * metrics.tileStep,
      height: GameRules.HexBoardHeight * metrics.tileStep + metrics.stagger,
    };
  }
  return {
    width: GameRules.HexBoardHeight * metrics.tileStep + metrics.stagger,
    height: GameRules.HexBoardWidth * metrics.tileStep,
  };
}

function getProjectionMetrics(options) {
  const tileSize = options.tileSize || BoardProjectionDefaults.tileSize;
  const gap = options.gap || BoardProjectionDefaults.gap;
  return {
    tileSize,
    gap,
    stagger: options.stagger || BoardProjectionDefaults.stagger,
    tokenSize: options.tokenSize || BoardProjectionDefaults.tokenSize,
    tileStep: tileSize + gap,
  };
}

function projectLeftRight(coord, metrics) {
  return {
    x: coord.q * metrics.tileStep,
    y: coord.r * metrics.tileStep + (coord.q % 2 === 1 ? metrics.stagger : 0),
  };
}

function projectBottomTop(coord, metrics) {
  const visualRow = GameRules.HexBoardWidth - 1 - coord.q;
  return {
    x: coord.r * metrics.tileStep + (visualRow % 2 === 1 ? metrics.stagger : 0),
    y: visualRow * metrics.tileStep,
  };
}
