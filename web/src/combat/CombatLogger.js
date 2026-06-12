// Ported from DungeonDebt/Assets/Scripts/Combat/CombatLogger.cs
import { CombatReplayEvent, CombatReplayEventKind } from "../data/CombatReplayEvent.js";
import { GameRulesFns } from "../core/GameRules.js";

export class CombatLogger {
  constructor() {
    this._lines = [];
    this._events = [];
    this._tick = 0;
    this._seq = 0;
  }

  get lines() { return this._lines; }
  get replayEvents() { return this._events; }

  // Called by CombatManager at the start of each simulation tick.
  setTick(tick) {
    this._tick = tick;
  }

  // ---- Structural boundary events (events-only, no text line) ----

  logCombatStart(playerUnits, enemyUnits, board) {
    const evt = this._newEvt(CombatReplayEventKind.CombatStart, "");
    evt.metadata = { playerCount: playerUnits.length, enemyCount: enemyUnits.length };
    this._push(evt);
    for (const unit of [...playerUnits, ...enemyUnits]) {
      this._pushUnitSpawn(unit, board ? board.getUnitPosition(unit) : null);
    }
  }

  logRoundBoundary(round) {
    const evt = this._newEvt(CombatReplayEventKind.RoundBoundary, "");
    evt.amount = round;
    this._push(evt);
  }

  logCombatEnd(playerWon) {
    const evt = this._newEvt(CombatReplayEventKind.CombatEnd, "");
    evt.metadata = { playerWon };
    this._push(evt);
  }

  // ---- Ability events (events-only, no text line) ----

  logAbilityCast(caster, targets, abilityId) {
    const evt = this._newEvt(CombatReplayEventKind.AbilityCast, "");
    evt.actorUnitId = caster.unitId;
    evt.attackerSlot = caster.slot;
    evt.attackerIsPlayerSide = caster.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(caster);
    evt.abilityId = abilityId;
    if (targets.length === 1) {
      evt.targetUnitId = targets[0].unitId;
      evt.targetSlot = targets[0].slot;
      evt.targetIsPlayerSide = targets[0].isPlayerSide;
    }
    this._push(evt);
  }

  logPassiveTrigger(unit, trigger, abilityId) {
    const evt = this._newEvt(CombatReplayEventKind.PassiveTrigger, "");
    evt.actorUnitId = unit.unitId;
    evt.attackerSlot = unit.slot;
    evt.attackerIsPlayerSide = unit.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(unit);
    evt.abilityId = abilityId;
    evt.metadata = { trigger };
    this._push(evt);
  }

  // ---- Movement (adds to both _lines and _events) ----

  logMovement(unit, fromCoord, toCoord) {
    const text = `${unit.displayName} moves to (${toCoord.q},${toCoord.r}).`;
    this._lines.push(text);
    const evt = this._newEvt(CombatReplayEventKind.Movement, text);
    evt.actorUnitId = unit.unitId;
    evt.attackerSlot = unit.slot;
    evt.attackerIsPlayerSide = unit.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(unit);
    evt.sourceCoord = fromCoord ? { q: fromCoord.q, r: fromCoord.r } : null;
    evt.targetCoord = { q: toCoord.q, r: toCoord.r };
    this._push(evt);
  }

  // ---- Combat action events (adds to both _lines and _events) ----

  logAttack(attacker, defender, damage) {
    const text = `${attacker.displayName} attacks ${defender.displayName} for ${damage}.`;
    this._lines.push(text);

    const evt = this._newEvt(CombatReplayEventKind.Attack, text);
    evt.actorUnitId = attacker.unitId;
    evt.targetUnitId = defender.unitId;
    evt.attackerSlot = attacker.slot;
    evt.attackerIsPlayerSide = attacker.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(attacker);
    copyStatusSnapshot(attacker, evt.attackerStatuses);
    evt.attackerPoisonDamage = attacker.statuses.poisonDamage;
    evt.targetSlot = defender.slot;
    evt.targetIsPlayerSide = defender.isPlayerSide;
    evt.amount = damage;
    evt.targetHealthAfter = defender.currentHealth;
    evt.targetMaxHealth = defender.maxHealth;
    copyStatusSnapshot(defender, evt.targetStatuses);
    evt.targetPoisonDamage = defender.statuses.poisonDamage;
    this._push(evt);
  }

  logHeal(healer, target, amount) {
    const text = `${healer.displayName} heals ${target.displayName} for ${amount}.`;
    this._lines.push(text);

    const evt = this._newEvt(CombatReplayEventKind.Heal, text);
    evt.actorUnitId = healer.unitId;
    evt.targetUnitId = target.unitId;
    evt.attackerSlot = healer.slot;
    evt.attackerIsPlayerSide = healer.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(healer);
    copyStatusSnapshot(healer, evt.attackerStatuses);
    evt.attackerPoisonDamage = healer.statuses.poisonDamage;
    evt.targetSlot = target.slot;
    evt.targetIsPlayerSide = target.isPlayerSide;
    evt.amount = amount;
    evt.targetHealthAfter = target.currentHealth;
    evt.targetMaxHealth = target.maxHealth;
    copyStatusSnapshot(target, evt.targetStatuses);
    evt.targetPoisonDamage = target.statuses.poisonDamage;
    this._push(evt);
  }

  logDeath(unit) {
    const text = `${unit.displayName} dies.`;
    this._lines.push(text);

    const evt = this._newEvt(CombatReplayEventKind.Death, text);
    evt.targetUnitId = unit.unitId;
    evt.targetSlot = unit.slot;
    evt.targetIsPlayerSide = unit.isPlayerSide;
    evt.targetHealthAfter = 0;
    evt.targetMaxHealth = unit.maxHealth;
    copyStatusSnapshot(unit, evt.targetStatuses);
    evt.targetPoisonDamage = unit.statuses.poisonDamage;
    this._push(evt);
  }

  logStatusChange(unit, message) {
    this._lines.push(message);

    const evt = this._newEvt(CombatReplayEventKind.StatusChange, message);
    evt.targetUnitId = unit.unitId;
    evt.targetSlot = unit.slot;
    evt.targetIsPlayerSide = unit.isPlayerSide;
    evt.targetHealthAfter = unit.currentHealth;
    evt.targetMaxHealth = unit.maxHealth;
    copyStatusSnapshot(unit, evt.targetStatuses);
    evt.targetPoisonDamage = unit.statuses.poisonDamage;
    this._push(evt);
  }

  logStatusDamage(unit, statusId, damage) {
    const text = `${unit.displayName} takes ${damage} ${GameRulesFns.getCombatStatusLabel(statusId)} damage.`;
    this._lines.push(text);

    const evt = this._newEvt(CombatReplayEventKind.StatusDamage, text);
    evt.targetUnitId = unit.unitId;
    evt.targetSlot = unit.slot;
    evt.targetIsPlayerSide = unit.isPlayerSide;
    evt.amount = damage;
    evt.statusId = statusId;
    evt.targetHealthAfter = unit.currentHealth;
    evt.targetMaxHealth = unit.maxHealth;
    copyStatusSnapshot(unit, evt.targetStatuses);
    evt.targetPoisonDamage = unit.statuses.poisonDamage;
    this._push(evt);
  }

  logTurnLimit() {
    this._addMessage("Combat lost (turn limit).");
  }

  logFinalResult(playerWon) {
    this._addMessage(playerWon ? "Player wins!" : "Player loses.");
  }

  logMessage(message) {
    this._addMessage(message);
  }

  copyTo(destination) {
    for (const line of this._lines) destination.push(line);
  }

  copyReplayTo(destination) {
    for (const evt of this._events) destination.push(evt);
  }

  // ---- Private helpers ----

  _newEvt(kind, logText) {
    const evt = new CombatReplayEvent(kind, logText);
    evt.tick = this._tick;
    evt.sequence = this._seq;
    return evt;
  }

  _push(evt) {
    this._seq++;
    this._events.push(evt);
  }

  _pushUnitSpawn(unit, coord) {
    const evt = this._newEvt(CombatReplayEventKind.UnitSpawn, "");
    evt.actorUnitId = unit.unitId;
    evt.attackerSlot = unit.slot;
    evt.attackerIsPlayerSide = unit.isPlayerSide;
    evt.attackerHeroId = resolveHeroId(unit);
    evt.sourceCoord = coord ? { q: coord.q, r: coord.r } : null;
    evt.amount = unit.maxHealth;
    evt.targetHealthAfter = unit.currentHealth;
    evt.targetMaxHealth = unit.maxHealth;
    this._push(evt);
  }

  _addMessage(text) {
    this._lines.push(text);
    const evt = this._newEvt(CombatReplayEventKind.Message, text);
    this._push(evt);
  }
}

function resolveHeroId(unit) {
  if (!unit || !unit.sourceHero || !unit.sourceHero.definition) return null;
  return unit.sourceHero.definition.id;
}

function copyStatusSnapshot(unit, destination) {
  if (!unit || !unit.statuses || !destination) return;
  for (const s of unit.statuses.activeStatuses) destination.push(s);
}
