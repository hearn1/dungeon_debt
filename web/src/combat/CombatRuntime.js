export const CombatRuntimeId = Object.freeze({
  CombatV2: "CombatV2",
});

export const DefaultCombatRuntimeId = CombatRuntimeId.CombatV2;

export function resolveCombatRuntimeId(runtimeId = DefaultCombatRuntimeId) {
  if (runtimeId === CombatRuntimeId.CombatV2) return runtimeId;
  throw new Error(`Unsupported combat runtime: ${runtimeId}`);
}

export function getCombatRuntimeLabel(runtimeId) {
  switch (runtimeId) {
    case CombatRuntimeId.CombatV2:
      return "Combat V2";
    default:
      return String(runtimeId || "");
  }
}
