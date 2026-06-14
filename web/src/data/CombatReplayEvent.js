// Ported from DungeonDebt/Assets/Scripts/Data/CombatReplayEvent.cs
// Plain data emitted by CombatLogger in lockstep with each LogLine so the UI
// can replay attacks/heals/deaths step by step without re-running the resolver.
//
// Schema v2 (issue #224): adds tick/sequence ordering, stable unitId references,
// board coordinates, and boundary/ability event kinds.

export const CombatReplayEventKind = Object.freeze({
  // ---- Text-only ----
  Message: "Message",

  // ---- Combat action events ----
  AttackStart: "AttackStart",
  AbilityStart: "AbilityStart",
  Attack: "Attack",
  Heal: "Heal",
  Death: "Death",
  StatusChange: "StatusChange",
  StatusDamage: "StatusDamage",

  // ---- Structural boundary events (#224) ----
  CombatStart: "CombatStart",       // emitted once before tick 0
  CombatEnd: "CombatEnd",           // emitted after last action
  UnitSpawn: "UnitSpawn",           // one per unit at combat start
  RoundBoundary: "RoundBoundary",   // emitted at start of each round

  // ---- Movement and ability events (#224) ----
  Movement: "Movement",             // unit moves one step on the board
  AbilityCast: "AbilityCast",       // active ability fires
  PassiveTrigger: "PassiveTrigger", // passive ability trigger point reached
});

export const CombatReplayPhase = Object.freeze({
  Setup: "Setup",
  RoundBoundary: "RoundBoundary",
  Movement: "Movement",
  AttackStart: "AttackStart",
  HitResolution: "HitResolution",
  Passive: "Passive",
  Death: "Death",
  CombatEnd: "CombatEnd",
  Message: "Message",
});

export class CombatReplayEvent {
  constructor(kind, logText) {
    this.kind = kind;
    this.logText = logText;

    // ---- Ordering (set by CombatLogger) ----
    this.tick = 0;
    this.phase = CombatReplayPhase.Message;
    this.groupId = "";
    this.groupSequence = 0;
    this.sequence = 0;

    // ---- Stable unit IDs (e.g. "p0", "e1") ----
    this.actorUnitId = null;    // attacker, caster, healer, mover
    this.targetUnitId = null;   // defender, heal target, death subject

    // ---- Board coordinates {q, r} ----
    this.sourceCoord = null;    // actor position before move, or attacker position
    this.targetCoord = null;    // actor position after move, or target position

    // ---- Ability and status references ----
    this.abilityId = null;
    this.statusId = null;

    // ---- Numeric payload ----
    this.amount = 0;            // damage, heal amount, round number
    this.targetHealthAfter = 0;
    this.targetMaxHealth = 0;

    // ---- Timeline/cooldown snapshots for UI presentation ----
    this.actorActionReadyTick = 0;
    this.actorActionCooldownTicks = 0;
    this.actorAbilityReadyTick = 0;
    this.actorAbilityCooldownTicks = 0;

    // ---- Free-form metadata ----
    this.metadata = null;

    // ---- Legacy slot-based fields (kept for backward compatibility) ----
    this.attackerSlot = 0;
    this.attackerIsPlayerSide = false;
    this.attackerHeroId = null;
    this.attackerStatuses = [];
    this.attackerPoisonDamage = 0;

    this.targetSlot = 0;
    this.targetIsPlayerSide = false;
    this.targetStatuses = [];
    this.targetPoisonDamage = 0;
  }
}
