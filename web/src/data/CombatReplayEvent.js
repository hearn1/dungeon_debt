// Ported from DungeonDebt/Assets/Scripts/Data/CombatReplayEvent.cs
// Plain data emitted by CombatLogger in lockstep with each LogLine so the UI
// can replay attacks/heals/deaths step by step without re-running the resolver.

export const CombatReplayEventKind = Object.freeze({
  Message: "Message",
  Attack: "Attack",
  Heal: "Heal",
  Death: "Death",
  StatusChange: "StatusChange",
  StatusDamage: "StatusDamage",
});

export class CombatReplayEvent {
  constructor(kind, logText) {
    this.kind = kind;
    this.logText = logText;
    this.attackerSlot = 0;
    this.attackerIsPlayerSide = false;
    this.attackerHeroId = null;
    this.attackerStatuses = [];
    this.attackerPoisonDamage = 0;

    this.targetSlot = 0;
    this.targetIsPlayerSide = false;
    this.targetStatuses = [];
    this.targetPoisonDamage = 0;

    this.amount = 0;
    this.targetHealthAfter = 0;
    this.targetMaxHealth = 0;
  }
}
